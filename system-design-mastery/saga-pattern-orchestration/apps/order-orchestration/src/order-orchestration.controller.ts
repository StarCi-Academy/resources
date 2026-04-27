import { Controller, Body, Post } from '@nestjs/common';
import { OrderOrchestrationService } from './order-orchestration.service';
import { CreateOrderSagaDto } from './dto/create-order-saga.dto';

@Controller()
export class OrderOrchestrationController {
  constructor(private readonly orderOrchestrationService: OrderOrchestrationService) {}

  @Post('order')
  create(@Body() dto: CreateOrderSagaDto) {
    return this.orderOrchestrationService.execute(dto);
  }
}
