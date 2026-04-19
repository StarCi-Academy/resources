import { Controller, Get, Module } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import axios from 'axios';

/**
 * Order Service — kế tiếp call chain, gọi Payment Service
 * (EN: Order Service — next in the chain, calls Payment Service)
 *
 * Demo thêm cả custom span để minh hoạ cách tạo span thủ công
 * (EN: demo custom span creation on top of auto-instrumentation)
 */
@Controller()
class OrderController {
  /**
   * GET /order — tạo custom span "validate-order" rồi gọi payment
   * (EN: create custom span "validate-order" then call payment)
   */
  @Get('order')
  async order() {
    const tracer = trace.getTracer('order-service');

    // Tạo span thủ công để thấy "bước" trong Jaeger UI
    // (EN: create a manual span to show this "step" in Jaeger UI)
    const span = tracer.startSpan('validate-order');
    try {
      // Giả lập validate (EN: simulate validation)
      await new Promise((r) => setTimeout(r, 40));
      span.setAttribute('order.lineItems', 3);
    } finally {
      span.end();
    }

    // axios call — auto-instrumentation tạo span HTTP client (EN: auto HTTP client span)
    const res = await axios.post('http://localhost:3002/charge', { amount: 199 }, { timeout: 5000 });
    return { order: 'validated', payment: res.data };
  }
}

@Module({ controllers: [OrderController] })
export class AppModule {}
