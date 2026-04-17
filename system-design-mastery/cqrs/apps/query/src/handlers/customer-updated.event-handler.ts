import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerProfileUpdatedEvent } from '../events/customer-profile-updated.event';
import { ElasticsearchService } from '@nestjs/elasticsearch';

/**
 * Handler xử lý sự kiện đồng bộ dữ liệu sang Elasticsearch
 * (EN: Handler to sync data to Elasticsearch)
 */
@EventsHandler(CustomerProfileUpdatedEvent)
export class CustomerUpdatedEventHandler implements IEventHandler<CustomerProfileUpdatedEvent> {
  constructor(
    // Inject Elasticsearch service (EN: Inject Elasticsearch service)
    private readonly esService: ElasticsearchService
  ) { }

  /**
   * Xử lý sự kiện (EN: Handle event)
   *
   * @param event - Dữ liệu sự kiện (EN: event data)
   */
  async handle(event: CustomerProfileUpdatedEvent) {
    const { id, name, email } = event;
    console.log(`[Event Handler] Syncing Elasticsearch for Customer ${id}`);

    try {
      // Execute: Cập nhật Read Model trong Elasticsearch (EN: update Read Model in Elasticsearch)
      await this.esService.index({
        index: 'customers',
        id: id,
        document: {
          name: name,
          email: email,
        },
      });
      console.log(`[Event Handler] Sync success for ${id}`);
    } catch (e) {
      // Log lỗi chi tiết (EN: log detailed error)
      console.error(`[Event Handler] Failed to sync ${id}:`, e);
    }
  }
}
