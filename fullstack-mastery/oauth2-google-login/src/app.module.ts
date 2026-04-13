import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UserModule, User } from './modules';

/**
 * AppModule — Tích hợp OAuth2 và PostgreSQL.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'starci_user',
      password: 'starci_password',
      database: 'starci_db',
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
