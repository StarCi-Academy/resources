import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './order.entity';

/**
 * Root module cho Order Service
 * (EN: Root module for Order Service)
 */
@Module({
  imports: [
    // Cấu hình TypeORM kết nối SQLite (EN: TypeORM config connecting to SQLite)
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'order-service.sqlite',
      entities: [Order],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
