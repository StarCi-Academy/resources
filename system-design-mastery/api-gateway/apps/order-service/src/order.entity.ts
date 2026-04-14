import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity đại diện cho bảng Order trong database
 * (EN: Entity representing the Order table in database)
 *
 * @property id - Khóa chính tự tăng (EN: auto-increment primary key)
 * @property productId - ID sản phẩm được đặt (EN: ordered product ID)
 * @property quantity - Số lượng đặt (EN: order quantity)
 * @property status - Trạng thái đơn hàng: PENDING, CONFIRMED, CANCELLED (EN: order status)
 */
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column({ default: 'PENDING' })
  status: string;
}
