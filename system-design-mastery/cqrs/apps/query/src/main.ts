import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * Hàm khởi chạy ứng dụng Query (Read Model)
 * (EN: Bootstrap function for Query application)
 */
async function bootstrap() {
  // Tạo ứng dụng NestJS truyền thống (HTTP) (EN: Create traditional NestJS app)
  const app = await NestFactory.create(AppModule);

  // Kết nối Microservice RabbitMQ để lắng nghe Sync Event (EN: Connect RabbitMQ microservice to listen for Sync Events)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'customer_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Chạy cả HTTP và Microservice (EN: Start both HTTP and Microservice)
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);

  console.log(`[Query Service] Running on http://localhost:3001`);
  console.log(`[Query Service] Microservice connected to RabbitMQ`);
}
bootstrap();
