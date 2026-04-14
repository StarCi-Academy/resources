import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity đại diện cho bảng Product trong database
 * (EN: Entity representing the Product table in database)
 *
 * @property id - Khóa chính tự tăng (EN: auto-increment primary key)
 * @property name - Tên sản phẩm (EN: product name)
 * @property price - Giá sản phẩm (EN: product price)
 * @property stock - Số lượng tồn kho (EN: stock quantity)
 */
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;
}
