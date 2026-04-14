import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity đại diện cho bảng User trong database
 * (EN: Entity representing the User table in database)
 *
 * @property id - Khóa chính tự tăng (EN: auto-increment primary key)
 * @property name - Tên người dùng (EN: user name)
 * @property email - Email người dùng (EN: user email)
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
