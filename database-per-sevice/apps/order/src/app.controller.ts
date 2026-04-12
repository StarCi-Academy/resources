import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Controller('orders')
export class AppController {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: any) {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  @Get()
  async getOrders() {
    return this.orderRepository.find();
  }
}
