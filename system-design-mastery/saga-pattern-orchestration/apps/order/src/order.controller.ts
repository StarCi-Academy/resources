import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('order.create')
  createOrder(@Payload() payload: any) {
    return this.orderService.createOrder(payload);
  }

  @MessagePattern('order.update-status')
  updateOrderStatus(@Payload() payload: any) {
    const { orderId, status, idempotencyKey } = payload;
    return this.orderService.updateOrderStatus(orderId, status, idempotencyKey);
  }
}
