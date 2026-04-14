import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap User Service trên port 3001
 * (EN: Bootstrap User Service on port 3001)
 *
 * Kong API Gateway sẽ route /users/* đến service này
 * (EN: Kong API Gateway will route /users/* to this service)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lắng nghe trên port 3001 (EN: listen on port 3001)
  await app.listen(3001);
  console.log('User Service đang chạy trên port 3001 (EN: running on port 3001)');
}
void bootstrap();
