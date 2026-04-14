import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller xử lý HTTP requests cho Order
 * (EN: Controller handling HTTP requests for Order)
 */
@Controller('orders')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findAll() {
    return this.appService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appService.findOne(Number(id));
  }

  @Post()
  async create(@Body() dto: { productId: number; quantity: number }) {
    return this.appService.create(dto.productId, dto.quantity);
  }
}
