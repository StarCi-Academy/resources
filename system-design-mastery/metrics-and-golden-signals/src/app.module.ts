import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { MetricsMiddleware } from './metrics.middleware';

@Module({ controllers: [AppController] })
export class AppModule implements NestModule {
  /**
   * Gắn MetricsMiddleware cho mọi route — tự động đo 4 Golden Signals
   * (EN: apply MetricsMiddleware to every route — auto-measure 4 Golden Signals)
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
