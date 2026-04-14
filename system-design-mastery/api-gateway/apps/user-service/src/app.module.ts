import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';

/**
 * Root module cho User Service
 * (EN: Root module for User Service)
 *
 * Sử dụng SQLite để đơn giản hóa demo — không cần PostgreSQL riêng
 * (EN: Uses SQLite for demo simplicity — no separate PostgreSQL needed)
 */
@Module({
  imports: [
    // Cấu hình TypeORM kết nối SQLite (EN: TypeORM config connecting to SQLite)
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'user-service.sqlite',
      entities: [User],
      synchronize: true,
    }),
    // Đăng ký User entity cho injection (EN: register User entity for injection)
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
