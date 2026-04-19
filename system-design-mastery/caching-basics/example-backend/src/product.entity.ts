import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity Product — bảng chính dùng cho toàn bộ demo cache
 *
 * @remarks Entity đơn giản để minh hoạ 3 tầng cache: Cache-Aside, TypeORM query cache, response cache.
 * (EN: Simple entity to demonstrate three cache layers: Cache-Aside, TypeORM query cache, response cache.)
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'int' })
  price!: number;

  // Pod đã ghi/cập nhật row gần nhất — để quan sát khi scale
  // (EN: pod that wrote this row last — useful when scaling)
  @Column({ type: 'varchar', length: 64, default: 'seed' })
  updatedByPod!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
