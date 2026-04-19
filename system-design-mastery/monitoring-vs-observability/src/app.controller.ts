import { Controller, Get, HttpException, HttpStatus, Req } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { Request } from 'express';
import { httpRequestDurationMs, httpRequestsTotal } from './metrics';

/**
 * App controller — mô phỏng app thật với log + metric + trace id
 * (EN: App controller simulating 3 pillars together)
 */
@Controller()
export class AppController {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * GET /order/:id — giả lập flow order, thỉnh thoảng fail
   * (EN: simulate order flow, occasional failures)
   */
  @Get('order/:id')
  async order(@Req() req: Request) {
    const route = '/order/:id';
    // Đo latency (EN: measure latency)
    const endTimer = httpRequestDurationMs.startTimer();

    try {
      // Structured log — traceId tự có thanks to nestjs-pino customProps
      // (EN: structured log — traceId auto-attached via nestjs-pino)
      this.logger.log({ step: 'order-start', params: req.params });

      // Giả lập latency biến thiên (EN: simulate variable latency)
      const latency = Math.random() * 400 + 50;
      await new Promise((r) => setTimeout(r, latency));

      // Giả lập 20% rate lỗi (EN: simulate 20% error rate)
      if (Math.random() < 0.2) {
        throw new HttpException('payment gateway timeout', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      this.logger.log({ step: 'order-success' });
      httpRequestsTotal.inc({ route, status: 200 });
      endTimer({ route, status: 200 });

      return { ok: true, id: req.params.id };
    } catch (err) {
      // Error log kèm stack để debug (EN: error log with stack)
      this.logger.error({ step: 'order-failed', err: (err as Error).message });
      httpRequestsTotal.inc({ route, status: 500 });
      endTimer({ route, status: 500 });
      throw err;
    }
  }
}
