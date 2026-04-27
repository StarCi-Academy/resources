import { Injectable, Logger } from '@nestjs/common';
import { PaymentEntity } from './payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatus } from './payment.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  /**
   * Thuc hien buoc charge payment cho order (EN: Execute payment charge step for an order)
   *
   * @param payload - Message charge gom orderId, amount va idempotencyKey (EN: Charge message including orderId, amount and idempotencyKey)
   * @returns Ban ghi payment voi trang thai PAID hoac FAILED (EN: Payment record with PAID or FAILED status)
   */
  chargePayment(payload: any) {
    // Log message charge de theo doi step payment trong saga (EN: Log charge message to track payment step in saga)
    this.logger.log(
      `[Payment] Charge payment - orderId=${payload.orderId} amount=${payload.amount} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );

    const payment = this.paymentRepository.create({
      orderId: payload.orderId,
      amount: payload.amount,
      status: PaymentStatus.INIT,
    });

    if (payload.amount > 1000000) {
      payment.status = PaymentStatus.FAILED;
      this.logger.warn(
        `[Payment] Charge failed - orderId=${payload.orderId} reason=amount_limit idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
      );
      return this.paymentRepository.save(payment);
    }

    payment.status = PaymentStatus.PAID;
    this.logger.log(
      `[Payment] Charge success - orderId=${payload.orderId} status=${payment.status} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );
    return this.paymentRepository.save(payment);
  }

  /**
   * Thuc hien refund payment khi saga can compensation (EN: Process payment refund when saga needs compensation)
   *
   * @param payload - Message refund gom orderId, paymentId va idempotencyKey (EN: Refund message containing orderId, paymentId and idempotencyKey)
   * @returns Ban ghi payment sau khi refund hoac ket qua failed (EN: Refunded payment entity or failed result)
   */
  async refundPayment(payload: any) {
    // Log message refund de biet compensation da duoc kich hoat (EN: Log refund message to know compensation was triggered)
    this.logger.log(
      `[Payment] Refund payment - orderId=${payload.orderId} paymentId=${payload.paymentId} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );

    const payment = await this.paymentRepository.findOne({ 
        where: { 
          id: payload.paymentId, 
          orderId: payload.orderId }
        });
    if (!payment) {
      // Log warning de trace truong hop refund khong tim thay payment (EN: Log warning to trace refund case with missing payment)
      this.logger.warn(
        `[Payment] Refund failed - orderId=${payload.orderId} paymentId=${payload.paymentId} reason=not_found idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
      );
      return {
        orderId: payload.orderId,
        status: PaymentStatus.FAILED,
        reason: 'Payment not found',
      };
    }

    payment.status = PaymentStatus.REFUNDED;
    this.logger.log(
      `[Payment] Refund success - orderId=${payload.orderId} paymentId=${payload.paymentId} idempotencyKey=${payload.idempotencyKey ?? 'N/A'}`,
    );
    return this.paymentRepository.save(payment);
  }
}
