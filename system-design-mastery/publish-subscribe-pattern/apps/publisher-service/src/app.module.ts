import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module cho Publisher Service
 * (EN: Root module for Publisher Service)
 *
 * HTTP server + Redis publisher
 * (EN: HTTP server + Redis publisher)
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
