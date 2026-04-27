import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PaymentStatus } from "./payment.enum";

@Entity()
export class PaymentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    orderId!: string;

    @Column({ type: 'integer', nullable: false })
    amount!: number;

    @Column({ type: 'simple-enum', enum: PaymentStatus, nullable: false })
    status!: PaymentStatus;
}