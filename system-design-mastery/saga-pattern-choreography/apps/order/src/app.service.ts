import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './app.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  // Khởi tạo logger có context (EN: Initialize logger with context)
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) { }

  /**
   * Khởi tạo module, kết nối Kafka và tạo dữ liệu mẫu
   * (EN: Initialize module, connect Kafka and create dummy data)
   */
  async onModuleInit() {
    // Kết nối đến Kafka Broker (EN: Connect to Kafka Broker)
    await this.kafkaClient.connect();

    // Tạo dữ liệu mẫu nếu chưa có (EN: create dummy data if not exists)
    const order1 = await this.orderRepository.findOne({ where: { id: 1 } });
    if (!order1) {
      await this.orderRepository.save({ id: 1, productId: 1, quantity: 5, status: 'PENDING' });
    }

    const order2 = await this.orderRepository.findOne({ where: { id: 2 } });
    if (!order2) {
      await this.orderRepository.save({ id: 2, productId: 2, quantity: 1, status: 'PENDING' });
    }
  }

  /**
   * Luồng tạo đơn hàng (Follow Service Pattern: prepare → sign → execute → confirm)
   * (EN: Order creation flow)
   *
   * @param productId - ID sản phẩm (EN: product ID)
   * @param quantity - Số lượng (EN: quantity)
   * @returns Promise<Order> - Đơn hàng đã xử lý (EN: processed order)
   */
  async createOrder(productId: number, quantity: number) {
    try {
      // 1. Prepare: Khởi tạo thông tin đơn hàng (EN: prepare order info)
      const order = this.prepare(productId, quantity);

      // 2. Sign: Gán các thông tin định danh/trạng thái ban đầu (EN: sign/assign initial status)
      const signedOrder = this.sign(order);

      // 3. Execute: Lưu vào database (EN: execute/save to database)
      const executedOrder = await this.execute(signedOrder);

      // 4. Confirm: Hoàn tất bước khởi tạo và log kết quả (EN: confirm and log results)
      return this.confirm(executedOrder);
    } catch (error) {
      // Log lỗi chi tiết nếu thất bại (EN: log detailed error if failed)
      this.logger.error("Failed to create order", error);
      throw error;
    }
  }

  /**
   * Bước Prepare: Validate và gán data thô
   * (EN: Prepare step: Validation and raw data assignment)
   */
  private prepare(productId: number, quantity: number): Partial<Order> {
    // Kiểm tra đầu vào (EN: validate input)
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");
    
    return { productId, quantity };
  }

  /**
   * Bước Sign: Thiết lập metadata và trạng thái PENDING
   * (EN: Sign step: Set metadata and PENDING status)
   */
  private sign(orderData: Partial<Order>): Order {
    // Ép kiểu và gán status mặc định (EN: cast type and assign default status)
    return this.orderRepository.create({
      ...orderData,
      status: 'PENDING'
    });
  }

  /**
   * Bước Execute: Persist dữ liệu
   * (EN: Execute step: Persist data)
   */
  private async execute(order: Order): Promise<Order> {
    // Lưu xuống DB (EN: save to DB)
    return await this.orderRepository.save(order);
  }

  /**
   * Bước Confirm: Trả về kết quả và notify
   * (EN: Confirm step: Return result and notify)
   */
  private confirm(order: Order): Order {
    // Log thành công với structured data (EN: log success with structured data)
    this.logger.log({
      message: "Order created successfully",
      orderId: order.id,
      status: order.status
    });
    return order;
  }

  /**
   * Xử lý bù đắp khi hết hàng (Saga Compensation)
   * (EN: Handle compensation when out of stock)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   */
  async handleOutofStockCompensation(orderId: number) {
    // Tìm đơn hàng cần hủy (EN: find order to cancel)
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (order) {
      // Cập nhật trạng thái sang CANCELLED (EN: update status to CANCELLED)
      order.status = 'CANCELLED';
      await this.orderRepository.save(order);
      
      this.logger.warn({
        message: "Order cancelled due to out of stock",
        orderId
      });
    }
  }

  /**
   * Hoàn tất đơn hàng khi kho đã xác nhận
   * (EN: Complete order when inventory is confirmed)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   */
  async handleInventoryDeducted(orderId: number) {
    // Tìm đơn hàng cần hoàn tất (EN: find order to complete)
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (order) {
      // Cập nhật trạng thái sang COMPLETED (EN: update status to COMPLETED)
      order.status = 'COMPLETED';
      await this.orderRepository.save(order);
      
      this.logger.log({
        message: "Order completed successfully",
        orderId
      });
    }
  }
}
