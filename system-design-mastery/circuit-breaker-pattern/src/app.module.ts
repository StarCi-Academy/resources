import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BreakerService } from './breaker.service';

@Module({ controllers: [AppController], providers: [BreakerService] })
export class AppModule {}
