import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CustomerProfileUpdatedEvent } from '../events/customer-profile-updated.event';

/**
 * Handler cầu nối từ Domain Event nội bộ sang Integration Event ngoài hệ thống
 * (EN: Bridge handler from internal domain event to external integration event)
 *
 * @param event - Sự kiện local đã được publish trong command side
 * (EN: local event published in command side)
 * @returns Promise<void> - Không trả dữ liệu, chỉ thực hiện side effect gửi message
 * (EN: no return payload, only performs message-publishing side effect)
 */
@EventsHandler(CustomerProfileUpdatedEvent)
export class IntegrationUpdatedCustomerProfileHandler
  implements IEventHandler<CustomerProfileUpdatedEvent>
{
  constructor(
    // Inject client RabbitMQ để phát integration event (EN: inject RabbitMQ client to publish integration event)
    @Inject('EVENT_BUS')
    private readonly client: ClientProxy,
  ) {}

  /**
   * Xử lý domain event và phát sang RabbitMQ cho read side
   * (EN: Handle domain event and emit to RabbitMQ for read side)
   *
   * @param event - Dữ liệu profile đã cập nhật (EN: updated profile payload)
   * @returns Promise<void> - Kết thúc khi message đã được publish
   * (EN: completes when message has been published)
   */
  async handle(event: CustomerProfileUpdatedEvent): Promise<void> {
    // Đóng gói payload để bảo toàn contract của message (EN: build payload to keep message contract stable)
    const payload = {
      id: event.id,
      name: event.name,
      email: event.email,
    };

    // Phát integration event qua RabbitMQ để service Query đồng bộ Read Model
    // (EN: emit integration event via RabbitMQ so Query service can sync Read Model)
    this.client.emit('customer_profile_updated', payload);
  }
}
