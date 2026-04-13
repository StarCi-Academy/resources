import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatModule } from './modules/cat';
import { Cat, CatPassport, Toy, Owner } from './modules/cat';

/**
 * AppModule — Cấu hình kết nối PostgreSQL và tích hợp các module.
 * (EN: Configures PostgreSQL connection and integrates modules.)
 */
@Module({
  imports: [
    // Cấu hình kết nối PostgreSQL tập trung (EN: Centralized PostgreSQL connection config)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'starci_user',
      password: 'starci_password',
      database: 'starci_db',
      // Tự động load các entities được khai báo (EN: Auto-load declared entities)
      entities: [Cat, CatPassport, Toy, Owner],
      // [QUAN TRỌNG] Tự động đồng bộ schema database — không dùng cho production!
      // (EN: [IMPORTANT] Auto-sync database schema — do not use in production!)
      synchronize: true,
    }),

    // Feature modules
    CatModule,
  ],
})
export class AppModule {}
