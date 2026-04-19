import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Codec, Subscription } from 'nats';

/**
 * Notification Subscriber — gửi thông báo khi nhận event
 * (EN: Notification Subscriber — sends notifications when receiving events)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SubscriberNotification');
  private nc: NatsConnection;
  private sub: Subscription;
  private sc: Codec<string> = StringCodec();

  async onModuleInit() {
    this.nc = await connect({ servers: 'nats://localhost:4222' });

    // Subscribe subject "app.events" (EN: subscribe to subject "app.events")
    this.sub = this.nc.subscribe('app.events');

    // Async iterate messages — NATS client trả về async iterator
    // (EN: Async iterate messages — NATS client returns an async iterator)
    void this.handleMessages();

    this.logger.log({ message: 'Notification subscriber đã kết nối (EN: connected)' });
  }

  private async handleMessages() {
    for await (const msg of this.sub) {
      const data = JSON.parse(this.sc.decode(msg.data));

      // Mô phỏng gửi notification (email, SMS, push notification)
      // (EN: Simulate sending notification — email, SMS, push notification)
      this.logger.log({
        message: `[Notification] Gửi thông báo (EN: sending notification)`,
        subject: msg.subject,
        eventType: data.type,
        notification: `Sự kiện "${data.type}" đã xảy ra lúc ${data.timestamp}`,
        payload: data.payload,
      });
    }
  }

  async onModuleDestroy() {
    await this.nc?.drain();
  }
}
