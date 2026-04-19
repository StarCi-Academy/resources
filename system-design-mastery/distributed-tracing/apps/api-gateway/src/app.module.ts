import { Controller, Get, Module } from '@nestjs/common';
import axios from 'axios';

/**
 * API Gateway — nhận request client, gọi Order Service
 * (EN: API Gateway — receives client request, calls Order Service)
 *
 * Tracing context tự propagate qua axios (OTEL auto-instrumentation
 * inject traceparent header tự động).
 * (EN: tracing context auto-propagated via axios — OTEL injects
 * the `traceparent` header automatically.)
 */
@Controller()
class GatewayController {
  @Get('checkout')
  async checkout() {
    // Gọi downstream — OTEL tự động gắn traceparent header (EN: OTEL auto-injects header)
    const res = await axios.get('http://localhost:3001/order', { timeout: 5000 });
    return { gateway: 'ok', order: res.data };
  }
}

@Module({ controllers: [GatewayController] })
export class AppModule {}
