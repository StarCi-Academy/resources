import { Controller, Get, Header, HttpException, HttpStatus, Query } from '@nestjs/common';
import { registry } from './golden-signals';

/**
 * Controller demo + endpoint /metrics cho Prometheus
 * (EN: Demo controller + Prometheus /metrics endpoint)
 */
@Controller()
export class AppController {
  /**
   * GET /api/data?fail=0.2&latency=200 — sinh traffic với fail rate + latency điều chỉnh được
   * (EN: synthetic traffic generator with configurable fail rate and latency)
   */
  @Get('api/data')
  async data(@Query('fail') fail?: string, @Query('latency') latency?: string) {
    const failRate = Number(fail ?? 0);
    const latencyMs = Number(latency ?? 100);

    // Giả lập xử lý (EN: simulate processing)
    await new Promise((r) => setTimeout(r, latencyMs));

    if (Math.random() < failRate) {
      throw new HttpException('synthetic failure', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { ok: true };
  }

  /**
   * GET /metrics — Prometheus scrape endpoint
   * (EN: Prometheus scrape endpoint)
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  metrics() {
    return registry.metrics();
  }
}
