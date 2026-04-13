import { Module } from '@nestjs/common';
import { CatController } from './cat.controller';

/**
 * CatModule — Module demo tài liệu API.
 * (EN: CatModule — API docs demo module.)
 */
@Module({
  controllers: [CatController],
})
export class CatModule {}
