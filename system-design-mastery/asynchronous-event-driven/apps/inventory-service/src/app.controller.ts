import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

/**
 * Controller consume events từ Kafka topic "order-events"
 * (EN: Controller consuming events from Kafka topic "order-events")
 *
 * Inventory Service là consumer — không có HTTP endpoint
 * (EN: Inventory Service is a consumer — no HTTP endpoint)
 */
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  /**
   * Lắng nghe event từ Kafka topic "order-events"
   * (EN: Listen to events from Kafka topic "order-events")
   *
   * Khi order-service publish ORDER_CREATED, method này được gọi
   * (EN: When order-service publishes ORDER_CREATED, this method is called)
   */
  @EventPattern('order-events')
  async handleOrderEvent(@Payload() message: any) {
    this.logger.log({
      message: `[Inventory] Nhận event từ Kafka (EN: received event from Kafka)`,
      eventType: message.eventType,
      orderId: message.orderId,
    });

    // Xử lý theo loại event (EN: handle by event type)
    if (message.eventType === 'ORDER_CREATED') {
      this.appService.handleOrderCreated(
        message.orderId,
        message.productName,
        message.quantity,
      );
    }
  }
}
