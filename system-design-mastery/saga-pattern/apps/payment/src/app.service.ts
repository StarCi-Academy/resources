import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './app.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
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

    // Gieo dữ liệu mẫu để debug (EN: Seed test data for debugging)
    let pay = await this.paymentRepository.findOne({ where: { orderId: 1 } });
    if (!pay) {
      await this.paymentRepository.save({ orderId: 1, status: 'COMPLETED' });
    }

    let pay2 = await this.paymentRepository.findOne({ where: { orderId: 2 } });
    if (!pay2) {
      await this.paymentRepository.save({ orderId: 2, status: 'COMPLETED' });
    }
  }

  /**
   * Tạo bản ghi thanh toán mới
   * (EN: Create new payment record)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   * @returns Promise<Payment> - Thông tin thanh toán (EN: payment info)
   */
  async createPayment(orderId: number) {
    // Khởi tạo entity thanh toán (EN: initialize payment entity)
    const payment = this.paymentRepository.create({
      orderId,
      status: 'COMPLETED',
    });
    
    // Lưu vào database (EN: save to database)
    await this.paymentRepository.save(payment);
    return payment;
  }

  /**
   * Xử lý hoàn tiền khi nhận tin nhắn hết hàng (Compensation logic)
   * (EN: Handle refund when receiving out-of-stock event)
   *
   * @param orderId - ID đơn hàng (EN: order ID)
   */
  async handleOutofStockCompensation(orderId: number) {
    this.logger.warn(`Received INVENTORY_OUT_OF_STOCK for order ${orderId}. Processing refund...`);

    // Tìm thanh toán tương ứng với đơn hàng (EN: find payment related to order)
    const payment = await this.paymentRepository.findOne({ where: { orderId } });
    
    if (payment) {
      // 1. Prepare/Sign: Cập nhật trạng thái REFUNDED (EN: update status to REFUNDED)
      payment.status = 'REFUNDED';
      
      // 2. Execute: Lưu trạng thái mới (EN: save new status)
      await this.paymentRepository.save(payment);
      
      this.logger.log(`Refund successfully processed for order ${orderId}.`);

      // 3. Confirm: Phát tán sự kiện hoàn tiền (EN: emit refund event)
      this.kafkaClient.emit('payment-events', {
        eventType: 'PAYMENT_REFUNDED',
        orderId,
      });
    }
  }
}
