import { Body, Controller, Module, Post } from '@nestjs/common';
import { trace } from '@opentelemetry/api';

/**
 * Payment Service — dịch vụ lá, thực hiện charge giả lập
 * (EN: Payment Service — leaf service performing a simulated charge)
 */
@Controller()
class PaymentController {
  /**
   * POST /charge — giả lập charge credit card với custom span
   * (EN: simulate credit card charge with a custom span)
   */
  @Post('charge')
  async charge(@Body() body: { amount: number }) {
    const tracer = trace.getTracer('payment-service');

    return await tracer.startActiveSpan('charge-credit-card', async (span) => {
      // Ghi attribute vào span — sẽ hiện trong Jaeger UI
      // (EN: attach attributes — visible in Jaeger UI)
      span.setAttribute('payment.amount', body.amount);

      // Giả lập latency charge (EN: simulate charge latency)
      await new Promise((r) => setTimeout(r, 200));

      span.end();
      return { charged: true, amount: body.amount };
    });
  }
}

@Module({ controllers: [PaymentController] })
export class AppModule {}
