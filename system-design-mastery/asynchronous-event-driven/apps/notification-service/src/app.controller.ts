import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

/**
 * Controller consume events từ Kafka topic "order-events"
 * (EN: Controller consuming events from Kafka topic "order-events")
 *
 * Notification Service là consumer — gửi thông báo khi có đơn hàng mới
 * (EN: Notification Service is a consumer — sends notification on new order)
 */
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  /**
   * Lắng nghe event ORDER_CREATED từ Kafka
   * (EN: Listen to ORDER_CREATED event from Kafka)
   *
   * QUAN TRỌNG: Cả inventory-service và notification-service đều consume cùng topic
   * nhưng khác group ID → mỗi service nhận RIÊNG event
   * (EN: IMPORTANT: Both services consume same topic but different group IDs
   * → each service receives its OWN copy of the event)
   */
  @EventPattern('order-events')
  async handleOrderEvent(@Payload() message: any) {
    this.logger.log({
      message: '[Notification] Nhận event từ Kafka (EN: received event from Kafka)',
      eventType: message.eventType,
    });

    if (message.eventType === 'ORDER_CREATED') {
      this.appService.sendOrderNotification(
        message.orderId,
        message.productName,
        message.quantity,
      );
    }
  }
}
