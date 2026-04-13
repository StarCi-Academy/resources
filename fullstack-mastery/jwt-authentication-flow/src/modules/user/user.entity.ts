import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * User — Thực thể người dùng được ánh xạ vào bảng 'users' trong PostgreSQL.
 * (EN: User — User entity mapped to the 'users' table in PostgreSQL.)
 */
@Entity('users')
export class User {
  /**
   * ID tự động tăng (EN: Auto-increment ID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Địa chỉ email (Duy nhất) (EN: Unique email address)
   */
  @Column({ unique: true })
  email: string;

  /**
   * Mật khẩu đã mã hóa (EN: Hashed password)
   */
  @Column()
  password: string;
}
