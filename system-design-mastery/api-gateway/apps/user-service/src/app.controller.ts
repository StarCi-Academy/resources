import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller xử lý HTTP requests cho User
 * (EN: Controller handling HTTP requests for User)
 *
 * Tất cả logic nằm trong Service, Controller chỉ nhận request và trả response
 * (EN: All logic resides in Service, Controller only receives requests and returns responses)
 */
@Controller('users')
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
  async create(@Body() dto: { name: string; email: string }) {
    return this.appService.create(dto.name, dto.email);
  }
}
