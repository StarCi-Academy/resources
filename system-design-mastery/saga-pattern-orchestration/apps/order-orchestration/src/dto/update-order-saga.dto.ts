export class UpdateOrderSagaDto {
    orderId!: string;
    quantity?: number;
    status!: string;
    idempotencyKey!: string;
}