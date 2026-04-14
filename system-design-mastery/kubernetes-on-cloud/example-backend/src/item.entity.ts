import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity đại diện cho bảng items trong MySQL
 * (EN: Entity representing the items table in MySQL)
 */
@Entity('items')
export class Item {
  // Khóa chính tự tăng (EN: auto-increment primary key)
  @PrimaryGeneratedColumn()
  id: number;

  // Tên item (EN: item name)
  @Column()
  name: string;
}
