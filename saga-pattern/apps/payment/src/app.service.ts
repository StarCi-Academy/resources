import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './app.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();

    // Seed generic payment for debug if want
    let pay = await this.paymentRepository.findOne({ where: { orderId: 1 } });
    if (!pay) {
      this.paymentRepository.save({ orderId: 1, status: 'COMPLETED' });
    }

    let pay2 = await this.paymentRepository.findOne({ where: { orderId: 2 } });
    if (!pay2) {
      this.paymentRepository.save({ orderId: 2, status: 'COMPLETED' });
    }
  }

  async createPayment(orderId: number) {
    const payment = this.paymentRepository.create({
      orderId,
      status: 'COMPLETED',
    });
    await this.paymentRepository.save(payment);
    return payment;
  }

  async handleOutofStockCompensation(orderId: number) {
    console.log(`[Payment] Received INVENTORY_OUT_OF_STOCK for order ${orderId}. Processing refund...`);

    const payment = await this.paymentRepository.findOne({ where: { orderId } });
    if (payment) {
      payment.status = 'REFUNDED';
      await this.paymentRepository.save(payment);
      console.log(`[Payment] Refund successfully processed. Payment status changed to REFUNDED.`);

      // Emit optional PAYMENT_REFUNDED
      this.kafkaClient.emit('payment-events', {
        eventType: 'PAYMENT_REFUNDED',
        orderId,
      });
    }
  }
}
