import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule, UserModule, User } from './modules';

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
    JwtModule.register({}),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
