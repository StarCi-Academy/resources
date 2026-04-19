import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module cho Publisher Service
 * (EN: Root module for Publisher Service)
 *
 * HTTP server + NATS publisher
 * (EN: HTTP server + NATS publisher)
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
