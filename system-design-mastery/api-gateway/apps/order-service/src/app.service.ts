import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

/**
 * Service xử lý logic nghiệp vụ cho Order
 * (EN: Service handling business logic for Order)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Lấy danh sách tất cả đơn hàng
   * (EN: Get list of all orders)
   *
   * @returns Promise<Order[]> - Danh sách đơn hàng (EN: list of orders)
   */
  async findAll(): Promise<Order[]> {
    this.logger.log({ message: 'Lấy danh sách đơn hàng (EN: fetching all orders)' });
    return this.orderRepository.find();
  }

  /**
   * Lấy đơn hàng theo ID
   * (EN: Get order by ID)
   *
   * @param id - ID đơn hàng (EN: order ID)
   * @returns Promise<Order | null> - Đơn hàng hoặc null (EN: order or null)
   */
  async findOne(id: number): Promise<Order | null> {
    this.logger.log({ message: 'Tìm đơn hàng theo ID (EN: finding order by ID)', id });
    return this.orderRepository.findOne({ where: { id } });
  }

  /**
   * Tạo đơn hàng mới
   * (EN: Create new order)
   *
   * @param productId - ID sản phẩm (EN: product ID)
   * @param quantity - Số lượng (EN: quantity)
   * @returns Promise<Order> - Đơn hàng vừa tạo (EN: newly created order)
   */
  async create(productId: number, quantity: number): Promise<Order> {
    // Tạo entity đơn hàng với trạng thái PENDING (EN: create order entity with PENDING status)
    const order = this.orderRepository.create({
      productId,
      quantity,
      status: 'PENDING',
    });

    // Lưu vào database (EN: save to database)
    const saved = await this.orderRepository.save(order);
    this.logger.log({ message: 'Tạo đơn hàng thành công (EN: order created)', orderId: saved.id });
    return saved;
  }
}
