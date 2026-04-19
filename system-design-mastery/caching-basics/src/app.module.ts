import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { FakeDatabaseService } from './fake-database.service';
import { CacheService } from './cache.service';

/**
 * App Module — gom Fake DB, Redis Cache và Product service áp dụng Cache-Aside
 * (EN: App Module — bundles Fake DB, Redis cache, and Product service using Cache-Aside)
 */
@Module({
  controllers: [ProductController],
  providers: [ProductService, FakeDatabaseService, CacheService],
})
export class AppModule {}
