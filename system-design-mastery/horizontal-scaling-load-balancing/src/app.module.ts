import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

/**
 * Module tối giản — chỉ có controller trả về instance id
 * (EN: Minimal module — only a controller exposing instance identity)
 */
@Module({ controllers: [AppController] })
export class AppModule {}
