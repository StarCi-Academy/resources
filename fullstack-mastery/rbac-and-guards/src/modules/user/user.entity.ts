import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from './role.enum';

/**
 * User — Thực thể người dùng có hệ thống Role (RBAC).
 * (EN: User — User entity with Role system (RBAC).)
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
   * Quyền hạn của người dùng. Mặc định là 'user'.
   * (EN: User permissions. Default is 'user'.)
   */
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
}
