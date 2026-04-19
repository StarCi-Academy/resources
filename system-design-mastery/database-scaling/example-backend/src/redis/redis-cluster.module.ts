import { Global, Module } from '@nestjs/common';
import { Cluster } from 'ioredis';

export const REDIS_CLUSTER = 'REDIS_CLUSTER';

/**
 * Module đăng ký Redis Cluster client (ioredis) — dùng chung toàn app
 *
 * @remarks `REDIS_CLUSTER_NODES` dạng `host:6379,host2:6379`; Bitnami thường 1 Service headless đủ để discover.
 * (EN: `REDIS_CLUSTER_NODES` as `host:6379,...`; one Bitnami service endpoint is often enough for discovery.)
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLUSTER,
      useFactory: (): Cluster => {
        const raw = process.env.REDIS_CLUSTER_NODES ?? 'redis-cluster.database.svc.cluster.local:6379';
        const nodes = raw.split(',').map((part) => {
          const [host, port] = part.trim().split(':');
          return { host, port: Number(port || 6379) };
        });
        const password = process.env.REDIS_PASSWORD ?? 'redis123';
        return new Cluster(nodes, {
          redisOptions: { password: password || undefined },
          // Retry khi cluster đang elect master (EN: retry while cluster elects masters)
          clusterRetryStrategy: (times) => Math.min(times * 100, 3000),
        });
      },
    },
  ],
  exports: [REDIS_CLUSTER],
})
export class RedisClusterModule {}
