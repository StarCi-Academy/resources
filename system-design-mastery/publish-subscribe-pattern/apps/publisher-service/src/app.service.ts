import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Service publish messages lên Redis Pub/Sub channels
 * (EN: Service publishing messages to Redis Pub/Sub channels)
 *
 * Dùng ioredis trực tiếp vì NestJS Redis microservice không hỗ trợ multi-channel publish tốt
 * (EN: Uses ioredis directly because NestJS Redis microservice doesn't support multi-channel publish well)
 */
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);
  private publisher: Redis;

  /**
   * Khởi tạo Redis publisher connection
   * (EN: Initialize Redis publisher connection)
   */
  onModuleInit() {
    // Kết nối Redis trên localhost:6379 (EN: connect to Redis on localhost:6379)
    this.publisher = new Redis({ host: 'localhost', port: 6379 });
    this.logger.log({ message: 'Redis publisher đã kết nối (EN: Redis publisher connected)' });
  }

  /**
   * Đóng kết nối Redis khi module destroy
   * (EN: Close Redis connection on module destroy)
   */
  async onModuleDestroy() {
    await this.publisher.quit();
  }

  /**
   * Publish event lên Redis channel
   * (EN: Publish event to Redis channel)
   *
   * Tất cả subscribers đang subscribe channel này sẽ nhận message
   * (EN: All subscribers subscribed to this channel will receive the message)
   *
   * @param channel - Tên channel (EN: channel name)
   * @param data - Dữ liệu gửi đi (EN: data to send)
   * @returns Số lượng subscribers nhận được message (EN: number of subscribers who received the message)
   */
  async publish(channel: string, data: any): Promise<number> {
    // Serialize dữ liệu thành JSON string (EN: serialize data to JSON string)
    const message = JSON.stringify(data);

    // Publish lên Redis channel — trả về số subscribers đã nhận
    // (EN: Publish to Redis channel — returns number of subscribers who received)
    const subscriberCount = await this.publisher.publish(channel, message);

    this.logger.log({
      message: `Đã publish lên channel (EN: published to channel)`,
      channel,
      subscriberCount,
      data,
    });

    return subscriberCount;
  }
}
