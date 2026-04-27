import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // We can also connect microservice to consume kafka if needed
  // app.connectMicroservice({...})

  await app.listen(3003);
  console.log('Inventory Service is listening on port 3003');
}
bootstrap();
