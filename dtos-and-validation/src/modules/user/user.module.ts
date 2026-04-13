import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';

/**
 * UsersModule — Quản lý Resource User kèm Validation logic.
 * (EN: UsersModule — Manages User resource with Validation logic.)
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
