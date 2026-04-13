import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * User — Thực thể người dùng quản lý thông tin từ Google SSO.
 * (EN: User — User entity managing info from Google SSO.)
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Email của người dùng (EN: User's email)
   */
  @Column({ unique: true })
  email: string;

  /**
   * Tên (EN: First name)
   */
  @Column({ nullable: true })
  firstName: string;

  /**
   * Họ (EN: Last name)
   */
  @Column({ nullable: true })
  lastName: string;

  /**
   * Ảnh đại diện từ Google (EN: Avatar from Google)
   */
  @Column({ nullable: true })
  picture: string;

  /**
   * Đánh dấu xem người dùng này đăng nhập từ Google hay không
   * (EN: Marks whether this user logged in via Google)
   */
  @Column({ default: false })
  isOAuthUser: boolean;
}
