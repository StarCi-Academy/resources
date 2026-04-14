import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './order.entity';

/**
 * Root module cho Order Service
 * (EN: Root module for Order Service)
 *
 * Kết hợp HTTP server (nhận request) + Kafka producer (publish events)
 * (EN: Combines HTTP server (receive requests) + Kafka producer (publish events))
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'order-service.sqlite',
      entities: [Order],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Order]),
    // Đăng ký Kafka client để produce events (EN: register Kafka client to produce events)
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-service',
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
