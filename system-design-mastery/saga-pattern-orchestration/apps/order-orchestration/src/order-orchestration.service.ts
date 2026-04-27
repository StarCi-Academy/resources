import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderSagaDto } from './dto/create-order-saga.dto';
import { CreatePaymentSagaDto } from './dto/create-payment-saga.dto';
import { UpdateInventorySagaDto } from './dto/update-inventory-saga.dto';
import { UpdateOrderSagaDto } from './dto/update-order-saga.dto';
import { OrderSagaStep } from './enum/order-saga-step.enum';
import { OrderSagaStatus } from './enum/order.enum';
import { firstValueFrom } from 'rxjs';
import { RefundPaymentSagaDto } from './dto/refund-payment-saga.dto';


@Injectable()
export class OrderOrchestrationService implements OnModuleInit{
  private readonly logger = new Logger(OrderOrchestrationService.name);

  constructor(
    @Inject('ORDER_ORCHESTRATION_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // subscribe to topic before sending messages
    this.kafkaClient.subscribeToResponseOf('order.create');
    this.kafkaClient.subscribeToResponseOf('order.update-status');
    this.kafkaClient.subscribeToResponseOf('payment.charge');
    this.kafkaClient.subscribeToResponseOf('payment.refund');
    this.kafkaClient.subscribeToResponseOf('inventory.deduct');
    await this.kafkaClient.connect();
  }

  /**
   * Thuc thi luong saga dat hang theo tung buoc prepare -> sign -> execute -> confirm (EN: Execute order saga flow step-by-step prepare -> sign -> execute -> confirm)
   *
   * @param dto - Du lieu tao saga gom productId, quantity, amount va idempotencyKey nguon (EN: Saga creation payload including productId, quantity, amount and source idempotencyKey)
   * @returns Ket qua xu ly saga voi trang thai order/saga hien tai (EN: Saga processing result with current order/saga status)
   */
  async execute(dto: CreateOrderSagaDto) {
    // Tao idempotency key goc cho toan bo luong neu client chua truyen vao (EN: Build a root idempotency key for the whole flow when client did not provide one)
    const rootIdempotencyKey =
      dto.idempotencyKey ?? `saga_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let sagaStatus = OrderSagaStatus.STARTED;
    let currentStep = OrderSagaStep.CREATE_ORDER;

    let order: any = null;
    let payment: any = null;

    try {
      // Log diem bat dau de theo doi tien trinh saga tren terminal (EN: Log starting point to track saga progress in terminal)
      this.logger.log(
        `[Orchestration] Start saga - step=${currentStep} productId=${dto.productId} quantity=${dto.quantity} amount=${dto.amount} idempotencyKey=${rootIdempotencyKey}`,
      );

      // create order
      order = await firstValueFrom(
        this.kafkaClient.send<CreateOrderSagaDto>('order.create', {
          productId: dto.productId,
          quantity: dto.quantity,
          amount: dto.amount,
          idempotencyKey: `${rootIdempotencyKey}_order_create`,
        }),
      );

      // charge payment
      currentStep = OrderSagaStep.CHARGE_PAYMENT;
      sagaStatus = OrderSagaStatus.PAYMENT_PROCESSING;
      this.logger.log(
        `[Orchestration] Processing payment - step=${currentStep} orderId=${order.id} idempotencyKey=${rootIdempotencyKey}`,
      );

      payment = await firstValueFrom(
        this.kafkaClient.send<CreatePaymentSagaDto>('payment.charge', {
          orderId: order.id,
          amount: dto.amount,
          idempotencyKey: `${rootIdempotencyKey}_payment_charge`,
        }),
      );

      // check if payment is successful
      if (payment.status !== 'PAID') {
        // if payment failed, cancel order
        await firstValueFrom(
          this.kafkaClient.send('order.update-status', {
            orderId: order.id,
            status: 'CANCELLED',
            idempotencyKey: `${rootIdempotencyKey}_order_cancel_payment_failed`,
          }),
        );
        this.logger.warn(
          `[Orchestration] Saga failed - step=${currentStep} orderId=${order.id} reason=payment_failed idempotencyKey=${rootIdempotencyKey}`,
        );

        // return failed status
        return {
          orderId: order.id,
          orderStatus: 'CANCELLED',
          sagaStatus: OrderSagaStatus.FAILED,
          failedStep: currentStep,
          reason: 'Payment failed',
        };
      }

      // update order status to payment completed
      sagaStatus = OrderSagaStatus.PAYMENT_COMPLETED;

      await firstValueFrom(
        this.kafkaClient.send<UpdateOrderSagaDto>('order.update-status', {
          orderId: order.id,
          status: 'PAID',
          idempotencyKey: `${rootIdempotencyKey}_order_paid`,
        }),
      );

      currentStep = OrderSagaStep.DEDUCT_INVENTORY;
      sagaStatus = OrderSagaStatus.INVENTORY_PROCESSING;
      this.logger.log(
        `[Orchestration] Processing inventory - step=${currentStep} orderId=${order.id} idempotencyKey=${rootIdempotencyKey}`,
      );

      const inventory: any = await firstValueFrom(
        this.kafkaClient.send<UpdateInventorySagaDto>('inventory.deduct', {
          orderId: order.id,
          productId: dto.productId,
          quantity: dto.quantity,
          idempotencyKey: `${rootIdempotencyKey}_inventory_deduct`,
        }),
      );

      if (inventory.status !== 'DEDUCTED') {
        currentStep = OrderSagaStep.REFUND_PAYMENT;
        sagaStatus = OrderSagaStatus.COMPENSATING;

        await firstValueFrom(
          this.kafkaClient.send<RefundPaymentSagaDto>('payment.refund', {
            orderId: order.id,
            paymentId: payment.id,
            idempotencyKey: `${rootIdempotencyKey}_payment_refund`,
          }),
        );

        await firstValueFrom(
          this.kafkaClient.send<UpdateOrderSagaDto>('order.update-status', {
            orderId: order.id,
            status: 'CANCELLED',
            idempotencyKey: `${rootIdempotencyKey}_order_cancel_inventory_failed`,
          }),
        );
        this.logger.warn(
          `[Orchestration] Compensation completed - failedStep=${OrderSagaStep.DEDUCT_INVENTORY} compensationStep=${OrderSagaStep.REFUND_PAYMENT} orderId=${order.id} idempotencyKey=${rootIdempotencyKey}`,
        );

        return {
          orderId: order.id,
          orderStatus: 'CANCELLED',
          sagaStatus: OrderSagaStatus.COMPENSATED,
          failedStep: OrderSagaStep.DEDUCT_INVENTORY,
          compensationStep: OrderSagaStep.REFUND_PAYMENT,
        };
      }
      // confirm order
      currentStep = OrderSagaStep.CONFIRM_ORDER;

      await firstValueFrom(
        this.kafkaClient.send<UpdateOrderSagaDto>('order.update-status', {
          orderId: order.id,
          status: 'CONFIRMED',
          idempotencyKey: `${rootIdempotencyKey}_order_confirm`,
        }),
      );
      this.logger.log(
        `[Orchestration] Saga completed - step=${currentStep} orderId=${order.id} idempotencyKey=${rootIdempotencyKey}`,
      );

      return {
        orderId: order.id,
        orderStatus: 'CONFIRMED',
        sagaStatus: OrderSagaStatus.COMPLETED,
        currentStep: OrderSagaStep.CONFIRM_ORDER,
        compensationStep: null,
      };
    } catch (error) {
      // Log loi co context de debug nhanh theo step hien tai (EN: Log contextual error to debug quickly by current step)
      this.logger.error(
        `[Orchestration] Saga error - step=${currentStep} orderId=${order?.id ?? 'N/A'} idempotencyKey=${rootIdempotencyKey}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        orderId: order?.id ?? null,
        sagaStatus,
        currentStep,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
