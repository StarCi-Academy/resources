import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './app.entity';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();

    // Create a dummy order for debugging if it doesn't exist
    const order = await this.orderRepository.findOne({ where: { id: 1 } });
    if (!order) {
      await this.orderRepository.save({ id: 1, productId: 1, quantity: 5, status: 'PENDING' });
    }

    const order2 = await this.orderRepository.findOne({ where: { id: 2 } });
    if (!order2) {
      await this.orderRepository.save({ id: 2, productId: 2, quantity: 1, status: 'PENDING' });
    }
  }

  async createOrder(productId: number, quantity: number) {
    const order = this.orderRepository.create({
      productId,
      quantity,
      status: 'PENDING',
    });
    await this.orderRepository.save(order);

    // We could emit ORDER_CREATED event here for others to pick up, but the prompt says
    // "Khi một bước thất bại do hết hàng, luồng bù dữ liệu sẽ được kích hoạt".
    // For now we just return the created order.
    return order;
  }

  async handleOutofStockCompensation(orderId: number) {
    console.log(`[Order] Received INVENTORY_OUT_OF_STOCK for order ${orderId}. Cancelling order...`);
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (order) {
      order.status = 'CANCELLED';
      await this.orderRepository.save(order);
      console.log(`[Order] Order ${orderId} status changed to CANCELLED.`);
    }
  }

  async handleInventoryDeducted(orderId: number) {
    console.log(`[Order] Received INVENTORY_DEDUCTED for order ${orderId}. Completing order...`);
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (order) {
      order.status = 'COMPLETED';
      await this.orderRepository.save(order);
      console.log(`[Order] Order ${orderId} status changed to COMPLETED.`);
    }
  }
}
