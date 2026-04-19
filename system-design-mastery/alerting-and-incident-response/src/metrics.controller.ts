import { Controller, Get, Header } from '@nestjs/common';
import { registry } from './metrics';

/**
 * Expose /metrics cho Prometheus scrape
 * (EN: Expose /metrics for Prometheus scraping)
 */
@Controller()
export class MetricsController {
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async metrics(): Promise<string> {
    // Trả về snapshot toàn bộ metrics dưới dạng Prometheus text format
    // (EN: return snapshot of all metrics in Prometheus text format)
    return registry.metrics();
  }
}
