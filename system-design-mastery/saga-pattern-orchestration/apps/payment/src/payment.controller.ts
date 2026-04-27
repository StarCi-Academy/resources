import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern('payment.charge')
  async chargePayment(@Payload() payload: any) {
    return await this.paymentService.chargePayment(payload);
  }

  @MessagePattern('payment.refund')
  async refundPayment(@Payload() payload: any) {
    return await this.paymentService.refundPayment(payload);
  }
}
