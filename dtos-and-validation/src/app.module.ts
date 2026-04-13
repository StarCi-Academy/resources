import { Module } from '@nestjs/common';
import { UsersModule } from './modules';

/**
 * AppModule — Tổng hợp các module tính năng.
 * (EN: Root module — Aggregates all feature modules.)
 */
@Module({
  imports: [UsersModule],
})
export class AppModule {}
