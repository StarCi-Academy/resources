// QUAN TRỌNG: khởi động OTEL TRƯỚC tất cả import khác
// (EN: CRITICAL — start OTEL before any other import)
import { startOtel } from '../../../libs/tracing';
startOtel('api-gateway');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT ?? 3000));
  console.log('[api-gateway] listening on', process.env.PORT ?? 3000);
}
void bootstrap();
