import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';

/**
 * UsersModule — Đóng gói Resource User.
 * (EN: UsersModule — Encapsulates the User resource.)
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
