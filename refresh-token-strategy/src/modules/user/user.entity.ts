import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * User — Thực thể người dùng hỗ trợ cơ chế Refresh Token Rotation.
 * (EN: User — User entity supporting Refresh Token Rotation mechanism.)
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  /**
   * Lưu mã băm của Refresh Token đang hoạt động.
   * Để đảm bảo an ninh, ta lưu HASH thay vì token thô.
   * (EN: Stores the hash of the active Refresh Token.
   * For security, we store the HASH, not the raw token.)
   */
  @Column({ nullable: true })
  refreshTokenHash: string | null;
}
