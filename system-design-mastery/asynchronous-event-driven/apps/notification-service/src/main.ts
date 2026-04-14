import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * Bootstrap Notification Service dưới dạng Kafka consumer
 * (EN: Bootstrap Notification Service as Kafka consumer)
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service',
          brokers: ['localhost:9092'],
        },
        consumer: {
          // Group ID khác với inventory — cả 2 đều nhận event
          // (EN: Different group ID from inventory — both receive the event)
          groupId: 'notification-consumer-group',
        },
      },
    },
  );

  await app.listen();
  console.log('Notification Service (Consumer) đang lắng nghe Kafka (EN: listening to Kafka)');
}
void bootstrap();
