import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Wrapper Redis client — expose get/set/del với JSON serialization
 * (EN: Redis client wrapper — exposes get/set/del with JSON serialization)
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis!: Redis;

  onModuleInit(): void {
    // Kết nối Redis (EN: connect to Redis)
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Lấy giá trị từ cache, tự parse JSON
   * (EN: get value from cache, auto JSON parse)
   */
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      this.logger.log(`[CACHE MISS] ${key}`);
      return null;
    }
    this.logger.log(`[CACHE HIT ] ${key}`);
    return JSON.parse(raw) as T;
  }

  /**
   * Set giá trị vào cache với TTL (giây)
   * (EN: set value with TTL in seconds)
   *
   * @param key - cache key
   * @param value - object sẽ được serialize JSON (EN: object to JSON-serialize)
   * @param ttlSeconds - thời gian sống (EN: time-to-live in seconds)
   */
  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    // EX là option Redis set TTL (EN: EX is Redis TTL option)
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  /**
   * Xóa key khỏi cache — dùng khi invalidate sau write
   * (EN: delete key — used to invalidate after write)
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
    this.logger.warn(`[CACHE INVALIDATE] ${key}`);
  }
}
