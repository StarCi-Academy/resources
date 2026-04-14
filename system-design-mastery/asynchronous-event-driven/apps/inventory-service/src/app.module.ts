import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module cho Inventory Service (Kafka consumer)
 * (EN: Root module for Inventory Service — Kafka consumer)
 *
 * Chỉ consume events, không cần database hay HTTP
 * (EN: Only consumes events, no database or HTTP needed)
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
