import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MetricsController } from './metrics.controller';
import { AlertsController } from './alerts.controller';

@Module({
  controllers: [AppController, MetricsController, AlertsController],
})
export class AppModule {}
