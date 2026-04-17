import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { Customer } from './entities/customer.entity';
import { UpdateCustomerProfileHandler } from './handlers/update-customer-profile.handler';

@Module({
  imports: [
    CqrsModule,
    // Cấu hình kết nối PostgreSQL cho Write Model (EN: PostgreSQL connection for Write Model)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'cqrs_write_db',
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
  providers: [UpdateCustomerProfileHandler],
})
export class AppModule { }
