import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('inventory')
export class AppController {
  constructor(private readonly inventoryService: AppService) { }

  @Post('check')
  async checkInventory(@Body() dto: { orderId: number, productId: number, quantity: number }) {
    return this.inventoryService.checkAndDeductInventory(dto.orderId, dto.productId, dto.quantity);
  }
}
