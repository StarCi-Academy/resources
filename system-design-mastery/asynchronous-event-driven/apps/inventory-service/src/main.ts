import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * Bootstrap Inventory Service dưới dạng Kafka consumer
 * (EN: Bootstrap Inventory Service as Kafka consumer)
 *
 * Service này KHÔNG có HTTP — chỉ lắng nghe Kafka events
 * (EN: This service has NO HTTP — only listens to Kafka events)
 */
async function bootstrap() {
  // Tạo microservice với Kafka transport (EN: create microservice with Kafka transport)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'inventory-service',
          brokers: ['localhost:9092'],
        },
        consumer: {
          // Group ID riêng — mỗi message chỉ 1 instance trong group xử lý
          // (EN: Unique group ID — each message processed by only 1 instance in the group)
          groupId: 'inventory-consumer-group',
        },
      },
    },
  );

  await app.listen();
  console.log('Inventory Service (Consumer) đang lắng nghe Kafka (EN: listening to Kafka)');
}
void bootstrap();
