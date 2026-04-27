export class RefundPaymentSagaDto {
    orderId!: string;
    paymentId!: string;
    idempotencyKey!: string;
}