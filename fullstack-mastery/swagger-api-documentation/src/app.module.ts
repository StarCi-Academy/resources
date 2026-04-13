import { Module } from '@nestjs/common';
import { CatModule } from './modules/cat/cat.module';

/**
 * AppModule — Tổng hợp các module demo.
 * (EN: Root module — Aggregates demo modules.)
 */
@Module({
  imports: [CatModule],
})
export class AppModule {}
