import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UserModule } from './modules';
import { User } from './modules/user';

/**
 * AppModule — Khởi động hệ thống xác thực tập trung kết nối PostgreSQL.
 * (EN: Root module — Centralized authentication system connected to PostgreSQL.)
 */
@Module({
  imports: [
    // --- Cấu hình kết nối PostgreSQL ---
    // Sử dụng các thông số từ file docker compose đã tạo.
    // (EN: Configure PostgreSQL connection using docker compose parameters.)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'starci_user',
      password: 'starci_password',
      database: 'starci_db',
      entities: [User],
      // [warning] Chỉ dùng synchronize: true khi development
      // (EN: Only use synchronize: true during development)
      synchronize: true, 
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
