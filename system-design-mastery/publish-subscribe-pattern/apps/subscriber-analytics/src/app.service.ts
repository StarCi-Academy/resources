import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Codec, Subscription } from 'nats';

/**
 * Analytics Subscriber — thu thập và ghi nhận dữ liệu analytics
 * (EN: Analytics Subscriber — collects and records analytics data)
 *
 * Subscribe NATS subject "app.events" và xử lý analytics
 * (EN: Subscribes to NATS subject "app.events" and processes analytics)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SubscriberAnalytics');
  private nc: NatsConnection;
  private sub: Subscription;
  private sc: Codec<string> = StringCodec();

  private eventCounts: Record<string, number> = {};

  /**
   * Kết nối NATS và subscribe subject khi module init
   * (EN: Connect NATS and subscribe to subject on module init)
   */
  async onModuleInit() {
    // Khác Redis: NATS không cần connection riêng cho subscribe
    // (EN: Unlike Redis, NATS doesn't need a separate connection for subscribe)
    this.nc = await connect({ servers: 'nats://localhost:4222' });

    this.sub = this.nc.subscribe('app.events');

    void this.handleMessages();

    this.logger.log({ message: 'Analytics subscriber đã kết nối (EN: connected)' });
  }

  /**
   * Xử lý message nhận được qua async iterator
   * (EN: Handle received messages via async iterator)
   */
  private async handleMessages() {
    for await (const msg of this.sub) {
      const data = JSON.parse(this.sc.decode(msg.data));

      const eventType = data.type || 'unknown';
      this.eventCounts[eventType] = (this.eventCounts[eventType] || 0) + 1;

      this.logger.log({
        message: `[Analytics] Ghi nhận event (EN: recorded event)`,
        subject: msg.subject,
        eventType,
        totalCount: this.eventCounts[eventType],
        data: data.payload,
      });
    }
  }

  async onModuleDestroy() {
    await this.nc?.drain();
  }
}
