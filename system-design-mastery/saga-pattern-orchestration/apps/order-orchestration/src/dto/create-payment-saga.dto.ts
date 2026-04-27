export class CreatePaymentSagaDto {
    orderId!: string;
    amount!: number;
    status!: string;
    idempotencyKey!: string;
}