import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root module cho User Service (gRPC server)
 * (EN: Root module for User Service — gRPC server)
 *
 * Không cần HTTP module vì service này chỉ phục vụ gRPC
 * (EN: No HTTP module needed since this service only serves gRPC)
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
