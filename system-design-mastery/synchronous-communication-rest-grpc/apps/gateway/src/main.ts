import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Gateway Service trên port 3000
 * (EN: Bootstrap Gateway Service on port 3000)
 *
 * Gateway nhận REST requests từ client, gọi gRPC đến backend services
 * (EN: Gateway receives REST requests from client, calls gRPC to backend services)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Gateway REST Service đang chạy trên port 3000 (EN: running on port 3000)');
}
void bootstrap();
