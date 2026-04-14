import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';

/**
 * Root module cho Gateway Service
 * (EN: Root module for Gateway Service)
 *
 * Gateway đóng vai trò REST API public, gọi gRPC đến các backend services
 * (EN: Gateway acts as public REST API, calling gRPC to backend services)
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        // Token inject cho User gRPC client (EN: injection token for User gRPC client)
        name: 'USER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          // Đường dẫn proto tính từ project root (EN: proto path from project root)
          protoPath: join(process.cwd(), 'proto/user.proto'),
          // URL gRPC server của user-service (EN: gRPC server URL of user-service)
          url: 'localhost:5001',
        },
      },
      {
        // Token inject cho Product gRPC client (EN: injection token for Product gRPC client)
        name: 'PRODUCT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          // Đường dẫn proto tính từ project root (EN: proto path from project root)
          protoPath: join(process.cwd(), 'proto/product.proto'),
          url: 'localhost:5002',
        },
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
