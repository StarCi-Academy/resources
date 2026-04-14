import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Publisher Service trên port 3001
 * (EN: Bootstrap Publisher Service on port 3001)
 *
 * REST API nhận request, publish message lên Redis Pub/Sub
 * (EN: REST API receives request, publishes message to Redis Pub/Sub)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  console.log('Publisher Service đang chạy trên port 3001 (EN: running on port 3001)');
}
void bootstrap();
