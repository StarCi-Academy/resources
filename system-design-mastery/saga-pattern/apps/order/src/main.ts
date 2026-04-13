import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Kafka Microservice to consume messages
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'order-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('Order Service is listening on port 3001');
}
bootstrap();
