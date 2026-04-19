import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ResilientHttpService } from './resilient-http.service';

@Module({ controllers: [AppController], providers: [ResilientHttpService] })
export class AppModule {}
