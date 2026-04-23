import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Order } from './order.entity';

/**
 * Service xử lý logic đơn hàng và publish events lên Kafka
 * (EN: Service handling order logic and publishing events to Kafka)
 */
@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * Kết nối Kafka producer khi module khởi tạo
   * (EN: Connect Kafka producer on module init)
   */
  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.log({
      message: 'Kafka producer đã kết nối (EN: Kafka producer connected)',
    });
  }

  /**
   * Lấy danh sách đơn hàng
   * (EN: Get all orders)
   */
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  /**
   * Tạo đơn hàng mới và publish event OrderCreated lên Kafka
   * (EN: Create new order and publish OrderCreated event to Kafka)
   *
   * @param productName - Tên sản phẩm (EN: product name)
   * @param quantity - Số lượng (EN: quantity)
   * @returns Promise<Order> - Đơn hàng vừa tạo (EN: newly created order)
   */
  async createOrder(productName: string, quantity: number): Promise<Order> {
    // Bước 1: Tạo đơn hàng trong database (EN: Step 1: Create order in database)
    const order = this.orderRepository.create({
      productName,
      quantity,
      status: 'PENDING',
    });
    const saved = await this.orderRepository.save(order);
    this.logger.log({
      message: 'Đơn hàng đã tạo (EN: order created)',
      orderId: saved.id,
    });

    // Bước 2: Publish event "order-events" lên Kafka topic
    // (EN: Step 2: Publish "order-events" event to Kafka topic)
    // Các consumers (inventory, notification) sẽ nhận event này
    // (EN: Consumers (inventory, notification) will receive this event)
    this.kafkaClient.emit('order-events', {
      eventType: 'ORDER_CREATED',
      orderId: saved.id,
      productName: saved.productName,
      quantity: saved.quantity,
      timestamp: new Date().toISOString(),
    });

    this.logger.log({
      message: 'Event ORDER_CREATED đã publish (EN: ORDER_CREATED event published)',
      orderId: saved.id,
    });
    return saved;
  }
}
