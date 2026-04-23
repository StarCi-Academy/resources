import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity đại diện cho đơn hàng
 * (EN: Entity representing an order)
 */
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({nullable: true})
  productName!: string;

  @Column()
  quantity!: number;

  @Column({ default: 'PENDING' })
  status!: string;
}
