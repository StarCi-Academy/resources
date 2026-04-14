import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product } from './product.entity';

/**
 * Root module cho Product Service
 * (EN: Root module for Product Service)
 */
@Module({
  imports: [
    // Cấu hình TypeORM kết nối SQLite (EN: TypeORM config connecting to SQLite)
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'product-service.sqlite',
      entities: [Product],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
