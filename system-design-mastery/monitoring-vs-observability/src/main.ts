import { NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Dùng Pino làm logger toàn cục — structured JSON logs
  // (EN: use Pino as global logger — structured JSON logs)
  app.useLogger(app.get(PinoLogger));

  await app.listen(3000);
  console.log('Observability demo chạy trên :3000 (EN: running on :3000)');
}
void bootstrap();
