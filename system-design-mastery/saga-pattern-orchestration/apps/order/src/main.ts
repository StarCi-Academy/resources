import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(OrderModule);
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'] },
        consumer: {
          groupId: 'order-consumer',
        }
      },
    },
  );
  // also can connect to kafka topic if needed
  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('Order service is running on port 3001');
}
bootstrap();
