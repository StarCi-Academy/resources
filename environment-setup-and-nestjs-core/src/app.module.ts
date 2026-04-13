import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatModule } from './modules/cat/cat.module';
import { DogModule } from './modules/dog/dog.module';

/**
 * AppModule — Root module của ứng dụng NestJS.
 * Đây là điểm khởi đầu mà NestJS dùng để xây dựng toàn bộ dependency graph.
 * (EN: Root module of the NestJS application.
 * This is the entry point NestJS uses to build the entire dependency graph.)
 *
 * Tất cả feature module phải được import vào đây hoặc vào một module con nào đó.
 * IoC Container sẽ khởi tạo các provider theo đúng thứ tự dependency.
 * (EN: All feature modules must be imported here or into a child module.
 * The IoC Container will instantiate providers in the correct dependency order.)
 */
@Module({
  imports: [
    // Đăng ký CatModule — IoC Container khởi tạo CatFoodService, CatHealthService, CatService
    // (EN: Register CatModule — IoC Container instantiates CatFoodService, CatHealthService, CatService)
    CatModule,

    // Đăng ký DogModule — DogModule nội bộ đã import CatModule nên cross-module DI hoạt động
    // (EN: Register DogModule — DogModule internally imports CatModule so cross-module DI works)
    DogModule,
  ],

  // Controller gốc của ứng dụng để xử lý route "/"
  // (EN: Root application controller to handle the "/" route)
  controllers: [AppController],

  // Provider gốc — singleton được quản lý bởi AppModule scope
  // (EN: Root provider — singleton managed by AppModule scope)
  providers: [AppService],
})
export class AppModule {}
