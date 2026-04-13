import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Customer } from './entities/customer.entity';
import { UpdateCustomerProfileHandler } from './handlers/update-customer-profile.handler';

@Module({
  imports: [
    CqrsModule,
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
  ],
  controllers: [AppController],
  providers: [UpdateCustomerProfileHandler],
})
export class AppModule { }
