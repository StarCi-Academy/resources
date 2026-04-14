import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

/**
 * Bootstrap User Service dưới dạng gRPC server trên port 5001
 * (EN: Bootstrap User Service as gRPC server on port 5001)
 *
 * Service này KHÔNG có HTTP — chỉ phục vụ gRPC calls từ gateway
 * (EN: This service has NO HTTP — only serves gRPC calls from gateway)
 */
async function bootstrap() {
  // Tạo microservice với gRPC transport (EN: create microservice with gRPC transport)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        // Package name phải khớp với proto file (EN: package name must match proto file)
        package: 'user',
        // Đường dẫn proto tính từ project root — dùng process.cwd() thay vì __dirname
        // vì __dirname trỏ vào dist/ sau khi build
        // (EN: Proto path from project root — use process.cwd() instead of __dirname
        // because __dirname points to dist/ after build)
        protoPath: join(process.cwd(), 'proto/user.proto'),
        // Lắng nghe trên port 5001 (EN: listen on port 5001)
        url: '0.0.0.0:5001',
      },
    },
  );

  await app.listen();
  console.log('User gRPC Service đang chạy trên port 5001 (EN: running on port 5001)');
}
void bootstrap();
