import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UserModule, AdminModule, User } from './modules';

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
    AdminModule,
  ],
})
export class AppModule { }
