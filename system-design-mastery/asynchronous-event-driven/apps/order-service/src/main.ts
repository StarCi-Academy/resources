import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Order Service trên port 3001
 * (EN: Bootstrap Order Service on port 3001)
 *
 * Đây là producer — tạo đơn hàng và publish events lên Kafka
 * (EN: This is the producer — creates orders and publishes events to Kafka)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  console.log('Order Service (Producer) đang chạy trên port 3001 (EN: running on port 3001)');
}
void bootstrap();
