import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('payment')
export class AppController {
  constructor(private readonly paymentService: AppService) { }

  @EventPattern('inventory-events')
  async handleInventoryStatus(@Payload() message: any) {
    if (message.eventType === 'INVENTORY_OUT_OF_STOCK') {
      await this.paymentService.handleOutofStockCompensation(message.orderId);
    }
  }
}
