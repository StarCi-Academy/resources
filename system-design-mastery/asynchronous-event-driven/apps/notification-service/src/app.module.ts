import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module cho Notification Service (Kafka consumer)
 * (EN: Root module for Notification Service — Kafka consumer)
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
