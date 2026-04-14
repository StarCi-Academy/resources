import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller REST API cho Order Service
 * (EN: REST API Controller for Order Service)
 *
 * Đây là service duy nhất có HTTP endpoint — là entry point cho client
 * (EN: This is the only service with HTTP endpoint — entry point for client)
 */
@Controller('orders')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findAll() {
    return this.appService.findAll();
  }

  @Post()
  async createOrder(@Body() dto: { productName: string; quantity: number }) {
    return this.appService.createOrder(dto.productName, dto.quantity);
  }
}
