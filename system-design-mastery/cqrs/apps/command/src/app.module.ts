import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { Customer } from './entities/customer.entity';
import {
  IntegrationUpdatedCustomerProfileHandler,
  UpdateCustomerProfileHandler,
} from './handlers';

@Module({
  imports: [
    CqrsModule,
    // Cấu hình kết nối PostgreSQL cho Write Model (EN: PostgreSQL connection for Write Model)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'cqrs_user',
      password: 'cqrs_password',
      database: 'cqrs_db',
      autoLoadEntities: true,
      synchronize: true, // Only for demo
    }),
    TypeOrmModule.forFeature([Customer]),
    // Cấu hình Client để gửi event qua RabbitMQ (EN: Client configuration to send events via RabbitMQ)
    ClientsModule.register([
      {
        name: 'EVENT_BUS',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'customer_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [UpdateCustomerProfileHandler, IntegrationUpdatedCustomerProfileHandler],
})
export class AppModule {}
