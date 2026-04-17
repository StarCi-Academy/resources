import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'order_user',
      password: 'order_password',
      database: 'order_db',
      autoLoadEntities: true,
      synchronize: true, // Only for demo
    }),
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
