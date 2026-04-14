import { Module } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root module cho Audit Subscriber
 * (EN: Root module for Audit Subscriber)
 */
@Module({
  providers: [AppService],
})
export class AppModule {}
