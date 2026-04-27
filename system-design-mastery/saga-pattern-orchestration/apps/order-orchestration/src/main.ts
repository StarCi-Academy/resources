import { NestFactory } from '@nestjs/core';
import { OrderOrchestrationModule } from './order-orchestration.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create(OrderOrchestrationModule);
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'] },
        consumer: {
          groupId: 'order-orchestration-consumer',
        },
      },
    },
  );
  await app.startAllMicroservices();
  await app.listen(3000);
  console.log('Order orchestration service is running on port 3000');
}
bootstrap();
