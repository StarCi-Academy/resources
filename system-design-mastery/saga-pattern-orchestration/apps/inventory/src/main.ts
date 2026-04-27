import { NestFactory } from '@nestjs/core';
import { InventoryModule } from './inventory.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(InventoryModule);
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'] },
        consumer: {
          groupId: 'inventory-consumer',
        },
        producer: {
          allowAutoTopicCreation: true,
        },
      },
    },
  );
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log('Inventory service is running on port 3003');
}
bootstrap();
