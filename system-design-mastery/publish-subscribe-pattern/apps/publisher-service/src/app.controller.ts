import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller REST API cho Publisher Service
 * (EN: REST API Controller for Publisher Service)
 *
 * Nhận request từ client → publish message lên NATS subject
 * (EN: Receives client request → publishes message to NATS subject)
 */
@Controller('events')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * POST /events — Publish event lên NATS subject "app.events"
   * (EN: POST /events — Publish event to NATS subject "app.events")
   */
  @Post()
  publishEvent(@Body() dto: { type: string; payload: any }) {
    // NATS dùng dấu chấm làm token separator (EN: NATS uses dot as token separator)
    const subject = 'app.events';

    this.appService.publish(subject, {
      type: dto.type,
      payload: dto.payload,
      timestamp: new Date().toISOString(),
    });

    return {
      status: 'published',
      subject,
      event: dto,
    };
  }
}
