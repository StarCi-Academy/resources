import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cat, CatSchema } from './schemas/cat.schema';
import { CatService } from './cat.service';
import { CatController } from './cat.controller';

/**
 * Cat Module — Kết nối Schema và các thành phần xử lý của Cat.
 * (EN: Connects Schema and processing components for Cat.)
 */
@Module({
  imports: [
    // Đăng ký Model vào MongooseModule (EN: Register Model into MongooseModule)
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  ],
  controllers: [CatController],
  providers: [CatService],
  exports: [CatService],
})
export class CatModule {}
