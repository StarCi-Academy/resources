import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sqlite/payment.sqlite', // Tên file DB sẽ được tạo ở thư mục gốc project
      entities: [PaymentEntity],
      synchronize: true, // Tự động tạo table dựa trên Entity (Chỉ nên dùng khi dev)
    }),
    TypeOrmModule.forFeature([PaymentEntity]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
