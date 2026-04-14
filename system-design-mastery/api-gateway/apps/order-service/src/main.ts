import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Order Service trên port 3003
 * (EN: Bootstrap Order Service on port 3003)
 *
 * Kong API Gateway sẽ route /orders/* đến service này
 * (EN: Kong API Gateway will route /orders/* to this service)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3003);
  console.log('Order Service đang chạy trên port 3003 (EN: running on port 3003)');
}
void bootstrap();
