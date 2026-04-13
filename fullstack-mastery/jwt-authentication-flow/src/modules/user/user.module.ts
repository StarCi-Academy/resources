import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';

/**
 * UserModule — Quản lý tài nguyên người dùng và tích hợp TypeORM Repository.
 * (EN: UserModule — Manages user resources and integrates TypeORM Repository.)
 */
@Module({
  imports: [
    // Đăng ký Entity cho Repository để sử dụng trong service
    // (EN: Register Entity for repository usage in services)
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  exports: [TypeOrmModule], // Export nếu cần dùng UserRepo ở các module khác (như AuthModule)
})
export class UserModule {}
