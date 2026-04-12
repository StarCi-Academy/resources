import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column({ default: 'COMPLETED' }) // By default payment logic was executed and payment completed
  status: string; // PENDING, COMPLETED, REFUNDED
}
