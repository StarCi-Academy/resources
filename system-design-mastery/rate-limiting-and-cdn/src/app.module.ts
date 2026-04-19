import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { AppController } from './app.controller';

/**
 * Throttler config: 2 bucket với ngưỡng khác nhau
 * (EN: Throttler config — 2 buckets with distinct thresholds)
 *
 * - short: 5 request / 1 giây (chống burst)
 * - medium: 30 request / 1 phút (giới hạn dài hơn)
 *
 * Storage trên Redis để share counter giữa các instance
 * (EN: storage on Redis so counters are shared across instances)
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          // Chặn burst: 5 req/s (EN: block bursts at 5 req/s)
          { name: 'short', ttl: 1_000, limit: 5 },
          // Chặn sustained: 30 req/phút (EN: block sustained abuse at 30 req/min)
          { name: 'medium', ttl: 60_000, limit: 30 },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: process.env.REDIS_HOST ?? '127.0.0.1',
            port: Number(process.env.REDIS_PORT ?? 6379),
          }),
        ),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    // Apply ThrottlerGuard globally — mọi endpoint đều bị kiểm
    // (EN: apply ThrottlerGuard globally — all endpoints protected by default)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
