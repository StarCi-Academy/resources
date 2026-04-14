import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Module toàn cục quản lý kết nối Redis qua Kubernetes DNS
 * (EN: Global module managing Redis connection via Kubernetes DNS)
 */
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        // Kết nối Redis thông qua ClusterIP Service DNS (EN: connect Redis via ClusterIP Service DNS)
        const client = new Redis({
          host: process.env.REDIS_HOST || 'redis-service.default.svc.cluster.local',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        });

        // Log khi kết nối thành công (EN: log on successful connection)
        client.on('connect', () => {
          console.log('Connected to Redis via Kubernetes DNS');
        });

        // Log lỗi chi tiết khi kết nối thất bại (EN: log detailed error on connection failure)
        client.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
