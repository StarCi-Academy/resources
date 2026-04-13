import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCustomerProfileQuery } from '../queries/get-customer-profile.query';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@QueryHandler(GetCustomerProfileQuery)
export class GetCustomerProfileHandler implements IQueryHandler<GetCustomerProfileQuery> {
  constructor(private readonly esService: ElasticsearchService) { }

  async execute(query: GetCustomerProfileQuery) {
    console.log(`[Query] Fetching from Elasticsearch: Customer ${query.id}`);

    try {
      const result = await this.esService.get({
        index: 'customers',
        id: query.id,
      });
      return result._source;
    } catch (e) {
      console.error(e);
      return { error: 'Not found or Elasticsearch not connected', id: query.id };
    }
  }
}
