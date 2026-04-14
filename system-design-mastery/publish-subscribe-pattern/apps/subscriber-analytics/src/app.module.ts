import { Module } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root module cho Analytics Subscriber
 * (EN: Root module for Analytics Subscriber)
 *
 * Không có controller — chỉ subscribe Redis Pub/Sub
 * (EN: No controller — only subscribes to Redis Pub/Sub)
 */
@Module({
  providers: [AppService],
})
export class AppModule {}
