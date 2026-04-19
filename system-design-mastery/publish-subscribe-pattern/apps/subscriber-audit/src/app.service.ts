import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Codec, Subscription } from 'nats';

/**
 * Audit Subscriber — ghi audit log cho mọi event
 * (EN: Audit Subscriber — records audit log for all events)
 *
 * Trong thực tế sẽ ghi vào database/file, ở đây demo bằng in-memory array
 * (EN: In production would write to database/file, here demo with in-memory array)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('SubscriberAudit');
  private nc: NatsConnection;
  private sub: Subscription;
  private sc: Codec<string> = StringCodec();

  private auditLog: any[] = [];

  async onModuleInit() {
    this.nc = await connect({ servers: 'nats://localhost:4222' });

    this.sub = this.nc.subscribe('app.events');

    void this.handleMessages();

    this.logger.log({ message: 'Audit subscriber đã kết nối (EN: connected)' });
  }

  private async handleMessages() {
    for await (const msg of this.sub) {
      const data = JSON.parse(this.sc.decode(msg.data));

      // Tạo audit entry với timestamp và source subject
      // (EN: Create audit entry with timestamp and source subject)
      const auditEntry = {
        id: this.auditLog.length + 1,
        subject: msg.subject,
        eventType: data.type,
        payload: data.payload,
        receivedAt: new Date().toISOString(),
        originalTimestamp: data.timestamp,
      };

      this.auditLog.push(auditEntry);

      this.logger.log({
        message: `[Audit] Ghi audit log (EN: recording audit log)`,
        auditId: auditEntry.id,
        eventType: data.type,
        totalAuditEntries: this.auditLog.length,
      });
    }
  }

  async onModuleDestroy() {
    await this.nc?.drain();
  }
}
