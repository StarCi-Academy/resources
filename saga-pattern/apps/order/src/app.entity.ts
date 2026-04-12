import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, COMPLETED, CANCELLED

  @Column()
  productId: number;

  @Column()
  quantity: number;
}
