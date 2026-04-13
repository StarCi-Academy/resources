import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';

/**
 * UsersModule — Module demo tính năng Unified Response.
 */
@Module({
  controllers: [UsersController],
})
export class UsersModule {}
