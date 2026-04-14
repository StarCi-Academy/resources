import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Analytics Subscriber
 * (EN: Bootstrap Analytics Subscriber)
 *
 * Lắng nghe Redis Pub/Sub channel — ghi nhận analytics
 * (EN: Listens to Redis Pub/Sub channel — records analytics)
 */
async function bootstrap() {
  // Tạo NestJS app nhưng KHÔNG listen HTTP (EN: create NestJS app but DON'T listen HTTP)
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Analytics Subscriber đang lắng nghe Redis (EN: listening to Redis)');

  // Giữ process sống (EN: keep process alive)
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
}
void bootstrap();
