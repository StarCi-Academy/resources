import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Codec } from 'nats';

/**
 * Service publish messages lên NATS subjects
 * (EN: Service publishing messages to NATS subjects)
 *
 * Dùng nats.js client trực tiếp — core NATS pub/sub là broadcast fire-and-forget
 * (EN: Uses nats.js client directly — core NATS pub/sub is broadcast fire-and-forget)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);
  private nc: NatsConnection;
  private sc: Codec<string> = StringCodec();

  /**
   * Khởi tạo NATS connection
   * (EN: Initialize NATS connection)
   */
  async onModuleInit() {
    // Kết nối NATS trên localhost:4222 (EN: connect to NATS on localhost:4222)
    this.nc = await connect({ servers: 'nats://localhost:4222' });
    this.logger.log({ message: 'NATS publisher đã kết nối (EN: NATS publisher connected)' });
  }

  /**
   * Đóng kết nối NATS khi module destroy
   * (EN: Close NATS connection on module destroy)
   */
  async onModuleDestroy() {
    // drain() đảm bảo mọi message đã publish được flush lên server
    // (EN: drain() ensures all published messages are flushed to server)
    await this.nc?.drain();
  }

  /**
   * Publish event lên NATS subject
   * (EN: Publish event to NATS subject)
   *
   * Tất cả subscribers đang subscribe subject này sẽ nhận message (broadcast)
   * (EN: All subscribers on this subject will receive the message — broadcast)
   *
   * @param subject - Tên subject (EN: subject name)
   * @param data - Dữ liệu gửi đi (EN: data to send)
   */
  publish(subject: string, data: any): void {
    // Serialize dữ liệu thành JSON string (EN: serialize data to JSON string)
    const message = JSON.stringify(data);

    // Publish lên NATS subject — fire-and-forget, không có ack
    // (EN: Publish to NATS subject — fire-and-forget, no ack)
    this.nc.publish(subject, this.sc.encode(message));

    this.logger.log({
      message: `Đã publish lên subject (EN: published to subject)`,
      subject,
      data,
    });
  }
}
