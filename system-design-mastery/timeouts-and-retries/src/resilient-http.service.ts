import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Config cho resilient call
 * (EN: Config for a resilient HTTP call)
 */
export interface ResilientConfig {
  timeoutMs: number; // timeout mỗi lần gọi (EN: timeout per attempt)
  maxRetries: number; // số lần retry tối đa (EN: max retry count)
  baseBackoffMs: number; // backoff ban đầu (EN: initial backoff)
  maxBackoffMs: number; // cap backoff (EN: cap)
}

/**
 * HTTP client có timeout + exponential backoff + jitter
 * (EN: HTTP client with timeout + exponential backoff + jitter)
 *
 * Pattern:
 *  - Mỗi attempt bị giới hạn bởi timeout (không để hang mãi)
 *    (EN: each attempt is bounded by timeout to prevent hanging)
 *  - Retry theo exponential: 1s → 2s → 4s → 8s ... cap ở maxBackoffMs
 *    (EN: exponential backoff capped at maxBackoffMs)
 *  - Cộng thêm jitter ngẫu nhiên để tránh "thundering herd"
 *    (EN: add random jitter to avoid thundering herd)
 */
@Injectable()
export class ResilientHttpService {
  private readonly logger = new Logger(ResilientHttpService.name);

  /**
   * GET với resilience guarantees
   * (EN: GET with resilience guarantees)
   *
   * @param url - endpoint
   * @param cfg - config timeout/retry
   * @returns data trả về hoặc throw sau khi hết retry (EN: data or throw after all retries)
   */
  async get<T = unknown>(url: string, cfg: ResilientConfig): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= cfg.maxRetries) {
      attempt += 1;

      try {
        const axiosCfg: AxiosRequestConfig = {
          // Timeout từng attempt — không để hang vô tận (EN: per-attempt timeout)
          timeout: cfg.timeoutMs,
        };

        this.logger.log(`[attempt ${attempt}] GET ${url} timeout=${cfg.timeoutMs}ms`);
        const res = await axios.get<T>(url, axiosCfg);
        return res.data;
      } catch (err) {
        lastError = err;
        const e = err as { code?: string; response?: { status?: number }; message?: string };
        this.logger.warn(
          `[attempt ${attempt}] FAILED code=${e.code} status=${e.response?.status} msg=${e.message}`,
        );

        // Nếu đã hết retry → tung lỗi (EN: out of retries → throw)
        if (attempt > cfg.maxRetries) break;

        // Tính thời gian chờ trước retry kế (EN: compute sleep before next retry)
        const wait = this.backoffWithJitter(attempt, cfg);
        this.logger.log(`...ngủ ${wait}ms rồi retry (EN: sleep ${wait}ms before retry)`);
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    }

    throw lastError;
  }

  /**
   * Tính exponential backoff + full jitter (AWS style)
   * (EN: compute exponential backoff with full jitter — AWS style)
   *
   * Công thức: sleep = random(0, min(cap, base * 2^attempt))
   * Jitter "full" chống hiện tượng mọi client cùng retry đồng thời
   * (EN: full jitter prevents synchronized retry storms)
   */
  private backoffWithJitter(attempt: number, cfg: ResilientConfig): number {
    // base * 2^(attempt-1), cap ở maxBackoffMs (EN: exp backoff capped)
    const exp = Math.min(cfg.maxBackoffMs, cfg.baseBackoffMs * 2 ** (attempt - 1));

    // Full jitter: chọn random trong [0, exp] (EN: pick random in [0, exp])
    return Math.floor(Math.random() * exp);
  }
}
