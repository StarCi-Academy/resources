import { Module } from '@nestjs/common';
import { CounterController } from './counter.controller';
import { StatefulCounterService } from './stateful-counter.service';
import { StatelessCounterService } from './stateless-counter.service';

/**
 * App Module gom 2 service đại diện 2 mô hình state quản lý
 * (EN: App Module bundles 2 services representing 2 state management models)
 *
 * - StatefulCounterService: state nằm trong RAM instance (không scale được)
 * - StatelessCounterService: state đẩy ra Redis (scale được)
 */
@Module({
  controllers: [CounterController],
  providers: [StatefulCounterService, StatelessCounterService],
})
export class AppModule {}
