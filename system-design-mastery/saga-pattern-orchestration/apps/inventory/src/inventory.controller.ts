import { Body, Controller, Get, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('product')
  async addProduct(@Body() payload: any) {
    return await this.inventoryService.addProduct(payload);
  }
  
  @MessagePattern('inventory.deduct')
  async deduct(@Payload() payload: any) {
    return await this.inventoryService.deduct(payload);
  }
}
