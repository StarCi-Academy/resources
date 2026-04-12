import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Order service runs on 3000
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
