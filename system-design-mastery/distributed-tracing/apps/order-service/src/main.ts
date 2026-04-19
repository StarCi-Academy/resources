import { startOtel } from '../../../libs/tracing';
startOtel('order-service');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT ?? 3001));
  console.log('[order-service] listening on', process.env.PORT ?? 3001);
}
void bootstrap();
