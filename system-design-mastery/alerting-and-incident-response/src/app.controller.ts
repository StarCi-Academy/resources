import { Controller, Get, Query } from '@nestjs/common';
import { httpRequestDurationMs, httpRequestsTotal } from './metrics';

/**
 * Endpoint synthetic — dùng để bắn traffic và chủ động tạo lỗi/latency
 * để alert rule trigger
 *
 * (EN: Synthetic endpoint to generate traffic and inject errors/latency
 *  so alert rules can fire)
 */
@Controller()
export class AppController {
  /**
   * GET /api?fail=0.1&latency=200 — request giả
   *
   * @param fail - tỉ lệ lỗi 5xx (EN: probability of 5xx)
   * @param latency - delay ms (EN: injected latency in ms)
   * @returns status + timing, đồng thời đã record vào Prometheus metrics
   */
  @Get('api')
  async api(
    @Query('fail') fail?: string,
    @Query('latency') latency?: string,
  ): Promise<{ ok: boolean; status: number; latencyMs: number }> {
    // Tỉ lệ lỗi do client điều khiển, default = 0
    // (EN: error rate controlled by client, default 0)
    const failRate = Number(fail ?? '0');
    // Latency giả lập, default = 20ms
    // (EN: injected latency, default 20ms)
    const latencyMs = Number(latency ?? '20');

    const start = Date.now();
    // Ngủ giả lập để làm p99 latency histogram dâng lên
    // (EN: sleep to push p99 latency histogram up)
    await new Promise((r) => setTimeout(r, latencyMs));

    // Random xác định có lỗi hay không
    // (EN: randomly decide failure)
    const failed = Math.random() < failRate;
    const status = failed ? 500 : 200;

    const elapsed = Date.now() - start;
    // Ghi metric: dùng label status để alert rule lọc 5xx
    // (EN: record metric with status label so alert rule can filter 5xx)
    httpRequestsTotal.labels('GET', '/api', String(status)).inc();
    httpRequestDurationMs.labels('GET', '/api', String(status)).observe(elapsed);

    if (failed) {
      return { ok: false, status, latencyMs: elapsed };
    }
    return { ok: true, status, latencyMs: elapsed };
  }
}
