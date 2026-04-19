import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Bulkhead demo chạy trên :3000 (EN: running on :3000)');
}
void bootstrap();
