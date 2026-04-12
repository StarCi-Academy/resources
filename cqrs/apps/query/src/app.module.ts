import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AppController } from './app.controller';
import { GetCustomerProfileHandler } from './handlers/get-customer-profile.handler';
import { CustomerUpdatedEventHandler } from './handlers/customer-updated.event-handler';

@Module({
  imports: [
    CqrsModule,
    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),
  ],
  controllers: [AppController],
  providers: [GetCustomerProfileHandler, CustomerUpdatedEventHandler],
})
export class AppModule { }
