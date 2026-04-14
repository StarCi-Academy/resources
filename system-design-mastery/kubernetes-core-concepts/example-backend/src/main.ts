import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Khởi tạo ứng dụng NestJS và lắng nghe trên cổng 3000
 * (EN: Bootstrap the NestJS application and listen on port 3000)
 */
async function bootstrap() {
  // Tạo instance app từ root module (EN: create app instance from root module)
  const app = await NestFactory.create(AppModule);

  // Lắng nghe trên cổng 3000 — container sẽ expose cổng này (EN: listen on port 3000 — container exposes this port)
  await app.listen(3000);
  console.log('Example Backend is listening on port 3000');
}
bootstrap();
