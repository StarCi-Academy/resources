export class UpdateInventorySagaDto {
    productId!: string;
    quantity!: number;
    status!: string;
    idempotencyKey!: string;
}