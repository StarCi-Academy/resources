import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import CircuitBreaker from 'opossum';

/**
 * Service gói axios call bằng opossum CircuitBreaker
 * (EN: Service wrapping axios calls with opossum CircuitBreaker)
 *
 * 3 trạng thái của Circuit Breaker:
 *  - CLOSED: cho request đi qua bình thường (EN: requests pass through)
 *  - OPEN:   chặn thẳng, không gọi downstream (EN: block, do not call)
 *  - HALF_OPEN: cho đi vài request thử nghiệm (EN: let a few probe through)
 *
 * Chuyển trạng thái:
 *  CLOSED ─── vượt errorThresholdPercentage ───▶ OPEN
 *  OPEN   ─── sau resetTimeout ────────────────▶ HALF_OPEN
 *  HALF_OPEN ─── probe OK ─────────────────────▶ CLOSED
 *  HALF_OPEN ─── probe FAIL ───────────────────▶ OPEN
 */
@Injectable()
export class BreakerService implements OnModuleInit {
  private readonly logger = new Logger(BreakerService.name);
  private breaker!: CircuitBreaker<[], { ok: boolean; payload?: string }>;

  onModuleInit(): void {
    // Function gốc cần bảo vệ (EN: the function being guarded)
    const callDownstream = async () => {
      const res = await axios.get<{ ok: boolean; payload?: string }>(
        'http://localhost:4002/data',
        { timeout: 1000 },
      );
      return res.data;
    };

    // Config opossum (EN: opossum config)
    this.breaker = new CircuitBreaker(callDownstream, {
      // Timeout cho mỗi call (EN: timeout per call)
      timeout: 1000,
      // Ngưỡng % lỗi để mở circuit — 50% (EN: error rate threshold)
      errorThresholdPercentage: 50,
      // Số request tối thiểu trước khi tính % lỗi (EN: min request count)
      volumeThreshold: 5,
      // Sau bao lâu chuyển OPEN → HALF_OPEN (EN: time before probing)
      resetTimeout: 5_000,
    });

    // Fallback khi circuit OPEN hoặc request fail (EN: fallback response)
    this.breaker.fallback(() => ({
      ok: false,
      payload: 'fallback — serving stale/static data to protect downstream',
    }));

    // Hook để log state transitions (EN: event hooks for observability)
    this.breaker.on('open', () => this.logger.warn('Circuit OPEN — blocking downstream calls'));
    this.breaker.on('halfOpen', () => this.logger.log('Circuit HALF_OPEN — probing'));
    this.breaker.on('close', () => this.logger.log('Circuit CLOSED — downstream recovered'));
    this.breaker.on('reject', () => this.logger.debug('Request rejected by open circuit'));
  }

  /**
   * Gọi downstream qua breaker
   * (EN: call downstream through breaker)
   */
  async call(): Promise<{ ok: boolean; payload?: string }> {
    return this.breaker.fire();
  }

  /**
   * Trạng thái hiện tại — để expose qua /health
   * (EN: expose current state for /health)
   */
  stats() {
    return {
      state: this.breaker.opened ? 'OPEN' : this.breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
      stats: this.breaker.stats,
    };
  }
}
