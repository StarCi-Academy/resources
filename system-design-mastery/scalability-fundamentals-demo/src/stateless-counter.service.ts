import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Counter lưu trong Redis — mô hình STATELESS (state đẩy ra nơi khác)
 * (EN: Counter stored in Redis — STATELESS model, state externalized)
 *
 * Side effect: tất cả instance chung nhau 1 counter. Scale out bao nhiêu instance cũng vẫn consistent.
 * (EN: all instances share the same counter via Redis — consistent regardless of instance count)
 */
@Injectable()
export class StatelessCounterService implements OnModuleInit, OnModuleDestroy {
  private redis!: Redis;

  // Khóa Redis dùng để lưu counter share (EN: Redis key to store shared counter)
  private static readonly COUNTER_KEY = 'scalability-demo:shared-counter';

  onModuleInit(): void {
    // Kết nối Redis ở localhost:6379 (EN: connect to Redis at localhost:6379)
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });
  }

  async onModuleDestroy(): Promise<void> {
    // Đóng kết nối khi module shutdown (EN: close connection on module shutdown)
    await this.redis.quit();
  }

  /**
   * Tăng counter atomic qua Redis INCR và trả về giá trị mới
   * (EN: atomically increment counter via Redis INCR and return the new value)
   *
   * @returns counter — giá trị chung giữa mọi instance
   */
  async increment(): Promise<{ instanceId: string; counter: number }> {
    // INCR là lệnh atomic, tránh race condition khi nhiều instance cùng tăng
    // (EN: INCR is atomic, avoiding race conditions across concurrent instances)
    const counter = await this.redis.incr(StatelessCounterService.COUNTER_KEY);

    return {
      instanceId: process.env.INSTANCE_ID ?? 'unknown',
      counter,
    };
  }
}
