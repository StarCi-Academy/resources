import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createKeyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';
import { ProductController } from './product.controller';
import { Product } from './product.entity';

/**
 * App Module — TypeORM → Postgres + CacheModule → Redis
 *
 * @remarks
 *  - Redis dùng cho cả 3 layer cache: Cache-Aside, TypeORM `queryResultCache`, NestJS `CacheInterceptor`.
 *  - Credentials và host đọc từ env, do K8s Deployment inject.
 *  (EN: Redis powers all 3 cache layers; credentials come from env vars injected by the Deployment.)
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'postgres',
      database: process.env.POSTGRES_DATABASE ?? 'products',
      entities: [Product],
      // synchronize chỉ cho demo; production phải dùng migration
      // (EN: demo-only — use migrations in production)
      synchronize: true,
      // Bật query-level cache của TypeORM dùng Redis làm store
      // (EN: enable TypeORM query cache backed by Redis)
      cache: {
        type: 'redis',
        options: {
          socket: {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: Number(process.env.REDIS_PORT ?? 6379),
          },
        },
        duration: 30_000,
        ignoreErrors: true,
      },
    }),
    TypeOrmModule.forFeature([Product]),
    // Register CacheModule global — theo NestJS v11 docs dùng Keyv làm adapter
    // (EN: register CacheModule globally — per NestJS v11 docs, use Keyv adapters)
    //
    // `stores` là multi-tier cache: tier đầu in-memory LRU (cực nhanh, per-pod),
    // tier sau Redis (shared giữa các pod). Keyv tự fan-out get/set cho cả 2.
    // (EN: `stores` is multi-tier — in-memory LRU first (per-pod, ns-level),
    //  Redis second (shared). Keyv fans out get/set across both tiers.)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [
          // Tier 1: LRU memory trong chính process NestJS — TTL 60s, tối đa 5000 entry
          // (EN: tier 1 — in-process LRU, 60s TTL, 5000 entries cap)
          new Keyv({ store: new CacheableMemory({ ttl: 60_000, lruSize: 5_000 }) }),
          // Tier 2: Redis — shared cache dùng chung giữa các pod cache-app
          // (EN: tier 2 — Redis shared cache across cache-app pods)
          createKeyv(
            `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`,
          ),
        ],
      }),
    }),
  ],
  controllers: [ProductController],
})
export class AppModule {}
