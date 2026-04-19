import { startOtel } from '../../../libs/tracing';
startOtel('payment-service');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT ?? 3002));
  console.log('[payment-service] listening on', process.env.PORT ?? 3002);
}
void bootstrap();
