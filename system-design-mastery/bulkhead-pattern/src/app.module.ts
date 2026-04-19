import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BulkheadService } from './bulkhead.service';

@Module({ controllers: [AppController], providers: [BulkheadService] })
export class AppModule {}
