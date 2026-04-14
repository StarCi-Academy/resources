import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

/**
 * Bootstrap Product Service dưới dạng gRPC server trên port 5002
 * (EN: Bootstrap Product Service as gRPC server on port 5002)
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'product',
        // Đường dẫn proto tính từ project root (EN: proto path from project root)
        protoPath: join(process.cwd(), 'proto/product.proto'),
        url: '0.0.0.0:5002',
      },
    },
  );

  await app.listen();
  console.log('Product gRPC Service đang chạy trên port 5002 (EN: running on port 5002)');
}
void bootstrap();
