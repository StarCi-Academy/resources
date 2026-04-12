import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetCustomerProfileQuery } from './queries/get-customer-profile.query';

@Controller('customer')
export class AppController {
  constructor(private readonly queryBus: QueryBus) { }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.queryBus.execute(new GetCustomerProfileQuery(id));
  }
}
