import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Notification Subscriber — gửi thông báo khi nhận event
 * (EN: Notification Subscriber — sends notifications when receiving events)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SubscriberNotification');
  private subscriber: Redis;

  onModuleInit() {
    this.subscriber = new Redis({ host: 'localhost', port: 6379 });

    void this.subscriber.subscribe('app-events');

    this.subscriber.on('message', (channel: string, message: string) => {
      const data = JSON.parse(message);

      // Mô phỏng gửi notification (email, SMS, push notification)
      // (EN: Simulate sending notification — email, SMS, push notification)
      this.logger.log({
        message: `[Notification] Gửi thông báo (EN: sending notification)`,
        channel,
        eventType: data.type,
        notification: `Sự kiện "${data.type}" đã xảy ra lúc ${data.timestamp}`,
        payload: data.payload,
      });
    });

    this.logger.log({ message: 'Notification subscriber đã kết nối (EN: connected)' });
  }

  async onModuleDestroy() {
    await this.subscriber.quit();
  }
}
