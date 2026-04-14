import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller REST API cho Publisher Service
 * (EN: REST API Controller for Publisher Service)
 *
 * Nhận request từ client → publish message lên Redis Pub/Sub
 * (EN: Receives client request → publishes message to Redis Pub/Sub)
 */
@Controller('events')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * POST /events — Publish event lên Redis channel "app-events"
   * (EN: POST /events — Publish event to Redis channel "app-events")
   *
   * @param dto - Dữ liệu event (EN: event data)
   * @returns Kết quả publish (EN: publish result)
   */
  @Post()
  async publishEvent(@Body() dto: { type: string; payload: any }) {
    // Publish lên channel "app-events" (EN: publish to channel "app-events")
    const subscriberCount = await this.appService.publish('app-events', {
      type: dto.type,
      payload: dto.payload,
      timestamp: new Date().toISOString(),
    });

    return {
      status: 'published',
      channel: 'app-events',
      subscriberCount,
      event: dto,
    };
  }
}
