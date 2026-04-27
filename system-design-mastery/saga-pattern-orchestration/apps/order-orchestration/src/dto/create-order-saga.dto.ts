// apps/order-orchestration/src/sagas/dto/create-order-saga.dto.ts
export class CreateOrderSagaDto {
    productId!: string;
    quantity!: number;
    amount!: number;
    idempotencyKey?: string;
}