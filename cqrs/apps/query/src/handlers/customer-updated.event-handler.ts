import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomerProfileUpdatedEvent } from '../events/customer-profile-updated.event';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@EventsHandler(CustomerProfileUpdatedEvent)
export class CustomerUpdatedEventHandler implements IEventHandler<CustomerProfileUpdatedEvent> {
  constructor(private readonly esService: ElasticsearchService) { }

  async handle(event: CustomerProfileUpdatedEvent) {
    console.log(`[Event Handler] Syncing Elasticsearch for Customer ${event.id}`);
    try {
      await this.esService.index({
        index: 'customers',
        id: event.id,
        document: {
          name: event.name,
          email: event.email,
        },
      });
    } catch (e) {
      console.error(`[Event Handler] Failed to sync ${event.id}:`, e);
    }
  }
}
