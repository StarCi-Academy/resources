import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enableShutdownHooks: cho phép onApplicationShutdown gọi khi SIGTERM
  // (EN: enable shutdown hooks so onApplicationShutdown fires on SIGTERM)
  app.enableShutdownHooks();

  await app.listen(3000);
  console.log('Health check + graceful degradation demo chạy trên :3000');
}
void bootstrap();
