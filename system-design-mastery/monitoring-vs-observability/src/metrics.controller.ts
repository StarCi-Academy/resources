import { Controller, Get, Header } from '@nestjs/common';
import { registry } from './metrics';

/**
 * GET /metrics — expose Prometheus exposition format
 * (EN: expose Prometheus text exposition format)
 */
@Controller()
export class MetricsController {
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async metrics() {
    return registry.metrics();
  }
}
