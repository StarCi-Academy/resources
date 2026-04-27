import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderEntity } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { OrderStatus } from './order.enum';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  /**
   * Tao don hang moi tai Order service (EN: Create a new order in Order service)
   *
   * @param payload - Du lieu message tu orchestration, gom thong tin order va idempotencyKey (EN: Message payload from orchestration including order data and idempotencyKey)
   * @returns Don hang da luu voi trang thai ban dau PENDING (EN: Persisted order with initial PENDING status)
   */
  async createOrder(payload: any) {
    // Log context de trace message vao theo idempotency key (EN: Log context to trace incoming message by idempotency key)
    this.logger.log(
      `[Order] Create order - productId=${payload.productId} quantity=${payload.quantity} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );

    const order = this.orderRepository.create({
      id: uuid(),
      productId: payload.productId,
      quantity: payload.quantity,
      status: OrderStatus.PENDING,
    });

    // Log ket qua de biet order da duoc tao thanh cong (EN: Log result to confirm order creation succeeded)
    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(
      `[Order] Created order - orderId=${savedOrder.id} status=${savedOrder.status} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );
    return savedOrder;
  }

  /**
   * Cap nhat trang thai don hang theo yeu cau saga (EN: Update order status based on saga request)
   *
   * @param orderId - ID cua don hang can cap nhat (EN: Order identifier to update)
   * @param status - Trang thai moi cua don hang (EN: New order status)
   * @param idempotencyKey - Khoa idempotency cua message cap nhat (EN: Idempotency key of update message)
   * @returns Don hang sau khi cap nhat trang thai (EN: Updated order entity)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, idempotencyKey?: string) {
    // Log buoc cap nhat de theo doi transition tren terminal (EN: Log update step to observe status transition in terminal)
    this.logger.log(
      `[Order] Update status - orderId=${orderId} status=${status} idempotencyKey=${idempotencyKey ?? 'N/A'}`,
    );

    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      // Log warning de phan biet case khong tim thay order (EN: Log warning to distinguish missing order case)
      this.logger.warn(
        `[Order] Order not found - orderId=${orderId} idempotencyKey=${idempotencyKey ?? 'N/A'}`,
      );
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);
    this.logger.log(
      `[Order] Updated status - orderId=${updatedOrder.id} status=${updatedOrder.status} idempotencyKey=${idempotencyKey ?? 'N/A'}`,
    );
    return updatedOrder;
  }
}
