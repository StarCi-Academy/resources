import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import từ barrel export (EN: Import from barrel export)
import { Order } from './entities';

@Controller('orders')
export class AppController {
  constructor(
    // Inject repository của Order (EN: Inject order repository)
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Tạo đơn hàng mới
   * (EN: Create a new order)
   *
   * @param createOrderDto - Dữ liệu đơn hàng (EN: order data)
   * @returns Promise<Order> - Đơn hàng đã lưu (EN: saved order)
   */
  @Post()
  async createOrder(@Body() createOrderDto: any) {
    // Khởi tạo entity từ DTO (EN: create entity from DTO)
    const order = this.orderRepository.create(createOrderDto);
    
    // Lưu vào database PostgreSQL (EN: save to PostgreSQL database)
    return this.orderRepository.save(order);
  }

  /**
   * Lấy danh sách đơn hàng
   * (EN: Get all orders)
   *
   * @returns Promise<Order[]> - Danh sách đơn hàng (EN: list of orders)
   */
  @Get()
  async getOrders() {
    // Truy vấn tất cả records (EN: query all records)
    return this.orderRepository.find();
  }
}
