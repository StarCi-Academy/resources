import { Module } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root module cho Notification Subscriber
 * (EN: Root module for Notification Subscriber)
 */
@Module({
  providers: [AppService],
})
export class AppModule {}
