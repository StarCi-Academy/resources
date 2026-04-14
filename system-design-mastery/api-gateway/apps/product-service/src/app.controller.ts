import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller xử lý HTTP requests cho Product
 * (EN: Controller handling HTTP requests for Product)
 */
@Controller('products')
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
  async create(@Body() dto: { name: string; price: number; stock: number }) {
    return this.appService.create(dto.name, dto.price, dto.stock);
  }
}
