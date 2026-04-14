import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Analytics Subscriber — thu thập và ghi nhận dữ liệu analytics
 * (EN: Analytics Subscriber — collects and records analytics data)
 *
 * Subscribe Redis channel "app-events" và xử lý analytics
 * (EN: Subscribes to Redis channel "app-events" and processes analytics)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SubscriberAnalytics');
  private subscriber: Redis;

  // Bộ đếm events theo loại (EN: event counter by type)
  private eventCounts: Record<string, number> = {};

  /**
   * Kết nối Redis và subscribe channel khi module init
   * (EN: Connect Redis and subscribe to channel on module init)
   */
  onModuleInit() {
    // Tạo Redis connection riêng cho subscriber
    // (EN: Create separate Redis connection for subscriber)
    // QUAN TRỌNG: Redis subscribe mode cần connection riêng
    // (EN: IMPORTANT: Redis subscribe mode needs a separate connection)
    this.subscriber = new Redis({ host: 'localhost', port: 6379 });

    // Subscribe channel "app-events" (EN: subscribe to channel "app-events")
    void this.subscriber.subscribe('app-events');

    // Xử lý message nhận được (EN: handle received messages)
    this.subscriber.on('message', (channel: string, message: string) => {
      // Parse JSON message từ publisher (EN: parse JSON message from publisher)
      const data = JSON.parse(message);

      // Tăng bộ đếm cho loại event (EN: increment counter for event type)
      const eventType = data.type || 'unknown';
      this.eventCounts[eventType] = (this.eventCounts[eventType] || 0) + 1;

      this.logger.log({
        message: `[Analytics] Ghi nhận event (EN: recorded event)`,
        channel,
        eventType,
        totalCount: this.eventCounts[eventType],
        data: data.payload,
      });
    });

    this.logger.log({ message: 'Analytics subscriber đã kết nối (EN: connected)' });
  }

  async onModuleDestroy() {
    await this.subscriber.quit();
  }
}
