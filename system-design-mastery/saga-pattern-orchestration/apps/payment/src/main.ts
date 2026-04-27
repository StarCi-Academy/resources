import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'] },
        consumer: {
          groupId: 'payment-consumer',
        },
        producer: {
          allowAutoTopicCreation: true,
        },
      },
    },
  );
  // also can connect to kafka topic if needed
  await app.startAllMicroservices();
  await app.listen(3002);
  console.log('Payment service is running on port 3002');
}
bootstrap();
