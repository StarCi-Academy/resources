import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module cho Product Service (gRPC server)
 * (EN: Root module for Product Service — gRPC server)
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
