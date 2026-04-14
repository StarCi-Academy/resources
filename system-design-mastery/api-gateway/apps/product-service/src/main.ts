import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Product Service trên port 3002
 * (EN: Bootstrap Product Service on port 3002)
 *
 * Kong API Gateway sẽ route /products/* đến service này
 * (EN: Kong API Gateway will route /products/* to this service)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3002);
  console.log('Product Service đang chạy trên port 3002 (EN: running on port 3002)');
}
void bootstrap();
