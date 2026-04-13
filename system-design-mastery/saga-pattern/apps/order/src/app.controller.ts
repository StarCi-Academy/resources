import { Controller, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('order')
export class AppController {
  constructor(private readonly orderService: AppService) { }

  @Post()
  async createOrder(@Body() dto: { productId: number, quantity: number }) {
    return this.orderService.createOrder(dto.productId, dto.quantity);
  }

  @EventPattern('inventory-events')
  async handleInventoryStatus(@Payload() message: any) {
    if (message.eventType === 'INVENTORY_OUT_OF_STOCK') {
      await this.orderService.handleOutofStockCompensation(message.orderId);
    } else if (message.eventType === 'INVENTORY_DEDUCTED') {
      await this.orderService.handleInventoryDeducted(message.orderId);
    }
  }
}
