import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';

/**
 * UserModule — Quản lý tài nguyên người dùng và Repository.
 * (EN: UserModule — Manages user resources and Repository.)
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
