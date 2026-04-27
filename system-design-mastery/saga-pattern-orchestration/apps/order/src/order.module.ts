import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sqlite/order.sqlite', // Tên file DB sẽ được tạo ở thư mục gốc project
      entities: [OrderEntity],
      synchronize: true, // Tự động tạo table dựa trên Entity (Chỉ nên dùng khi dev)
    }),
    TypeOrmModule.forFeature([OrderEntity]),
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'order-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
