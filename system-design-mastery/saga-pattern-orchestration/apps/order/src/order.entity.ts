import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OrderStatus } from "./order.enum";

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    productId!: string;
  
    @Column({ type: 'integer', nullable: false })
    quantity!: number;

    @Column({ type: 'simple-enum', enum: OrderStatus, nullable: false })
    status!: OrderStatus;
}