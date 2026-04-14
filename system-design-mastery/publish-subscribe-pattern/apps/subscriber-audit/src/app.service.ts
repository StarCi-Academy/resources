import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

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
  private subscriber: Redis;

  // Audit log lưu trong memory (EN: audit log stored in memory)
  private auditLog: any[] = [];

  onModuleInit() {
    this.subscriber = new Redis({ host: 'localhost', port: 6379 });

    void this.subscriber.subscribe('app-events');

    this.subscriber.on('message', (channel: string, message: string) => {
      const data = JSON.parse(message);

      // Tạo audit entry với timestamp và source channel
      // (EN: Create audit entry with timestamp and source channel)
      const auditEntry = {
        id: this.auditLog.length + 1,
        channel,
        eventType: data.type,
        payload: data.payload,
        receivedAt: new Date().toISOString(),
        originalTimestamp: data.timestamp,
      };

      // Lưu vào audit log (EN: save to audit log)
      this.auditLog.push(auditEntry);

      this.logger.log({
        message: `[Audit] Ghi audit log (EN: recording audit log)`,
        auditId: auditEntry.id,
        eventType: data.type,
        totalAuditEntries: this.auditLog.length,
      });
    });

    this.logger.log({ message: 'Audit subscriber đã kết nối (EN: connected)' });
  }

  async onModuleDestroy() {
    await this.subscriber.quit();
  }
}
