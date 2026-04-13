import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './cat.entity';
import { CatService } from './cat.service';
import { CatController } from './cat.controller';

/**
 * Cat Module — Đăng ký entity và bộ xử lý logic cho mèo.
 * (EN: Cat Module — Registers entity and business logic for cats.)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Cat])],
  controllers: [CatController],
  providers: [CatService],
  exports: [CatService],
})
export class CatModule {}
