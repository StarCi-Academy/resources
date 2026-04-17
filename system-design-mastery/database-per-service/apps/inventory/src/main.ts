import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Inventory service runs on 3001
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
