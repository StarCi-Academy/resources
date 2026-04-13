import { Module } from '@nestjs/common';
import { UsersModule } from './modules';

/**
 * AppModule — Tổng hợp các tính năng.
 */
@Module({
  imports: [UsersModule],
})
export class AppModule {}
