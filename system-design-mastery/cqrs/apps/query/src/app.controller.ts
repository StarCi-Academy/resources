import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus, EventBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { GetCustomerProfileQuery } from './queries';
import { CustomerProfileUpdatedEvent } from './events/customer-profile-updated.event';

@Controller('customer')
export class AppController {
  constructor(
    // Inject QueryBus để thực hiện truy vấn (EN: Inject QueryBus for queries)
    private readonly queryBus: QueryBus,
    // Inject EventBus để dispatch event vào local handler (EN: Inject EventBus to dispatch events locally)
    private readonly eventBus: EventBus
  ) { }

  /**
   * API lấy thông tin khách hàng (Read Model)
   * (EN: API to get customer profile)
   *
   * @param id - ID khách hàng (EN: customer ID)
   * @returns Promise<any> - Dữ liệu từ Elasticsearch (EN: data from Elasticsearch)
   */
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    // Thực hiện truy vấn thông qua Bus (EN: execute query via Bus)
    return this.queryBus.execute(new GetCustomerProfileQuery(id));
  }

  /**
   * Listener lắng nghe sự kiện từ RabbitMQ
   * (EN: Listener for events from RabbitMQ)
   *
   * @param data - Dữ liệu sự kiện (EN: event data)
   */
  @EventPattern('customer_profile_updated')
  async handleCustomerUpdated(@Payload() data: any) {
    console.log('[Query Service] Received Sync Event from RabbitMQ:', data);

    // Bridge: Đẩy sự kiện vào EventBus nội bộ để Kích hoạt EventHandler (EN: Bridge: Dispatch event to local EventBus to trigger EventHandler)
    const { id, name, email } = data;
    this.eventBus.publish(new CustomerProfileUpdatedEvent(id, name, email));
  }
}
