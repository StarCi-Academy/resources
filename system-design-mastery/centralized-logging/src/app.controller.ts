import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';

/**
 * Controller sinh nhiều loại log để test query trên Loki
 * (EN: Generates various log kinds to test Loki querying)
 */
@Controller()
export class AppController {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * POST /login — mô phỏng login flow, có cả info và error log
   * (EN: simulate login flow with info + error logs)
   */
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    // Log có cấu trúc — key-value ready để filter trên Loki
    // (EN: structured key-value log — easy filtering in Loki)
    this.logger.log({ event: 'login.attempt', username: body.username });

    if (body.password !== 'secret') {
      // Log lỗi với level error (EN: error level log)
      this.logger.error({ event: 'login.failed', username: body.username, reason: 'invalid-password' });
      throw new HttpException('invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log({ event: 'login.success', username: body.username });
    return { token: 'fake-jwt' };
  }

  /**
   * GET /order/:id — log journey qua nhiều "bước" giả lập microservice
   * (EN: log the order journey simulating microservice hops)
   */
  @Get('order/:id')
  async order(@Param('id') id: string) {
    this.logger.log({ event: 'order.received', orderId: id });
    this.logger.log({ event: 'order.validated', orderId: id, lineItems: 3 });
    this.logger.log({ event: 'payment.charged', orderId: id, amount: 199 });
    this.logger.log({ event: 'order.confirmed', orderId: id });
    return { orderId: id, status: 'confirmed' };
  }
}
