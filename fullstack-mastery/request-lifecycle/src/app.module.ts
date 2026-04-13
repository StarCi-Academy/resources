import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ItemsModule } from './modules/items';
import { LoggerMiddleware, RequestIdMiddleware } from './common/middleware';

/**
 * AppModule — Root module của ứng dụng, nơi đăng ký middleware cho toàn bộ route.
 * (EN: Root module of the application, where middleware is registered for all routes.)
 *
 * Middleware PHẢI được đăng ký tại module cấp cao nhất (hoặc tại module sở hữu route đó).
 * Không giống Guard/Interceptor, middleware không thể dùng decorator — phải qua configure().
 * (EN: Middleware MUST be registered at the top-level module (or the module owning the route).
 * Unlike Guards/Interceptors, middleware cannot use decorators — must go through configure().)
 */
@Module({
  imports: [
    // Đăng ký ItemsModule — chứa controller, service và toàn bộ lifecycle demo
    // (EN: Register ItemsModule — contains controller, service, and the full lifecycle demo)
    ItemsModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * Đăng ký middleware theo thứ tự thực thi cho tất cả route.
   * Thứ tự đăng ký = thứ tự chạy: RequestIdMiddleware trước, LoggerMiddleware sau.
   * (EN: Registers middleware in execution order for all routes.
   * Registration order = execution order: RequestIdMiddleware first, LoggerMiddleware second.)
   *
   * @param consumer - MiddlewareConsumer để bind middleware vào route (EN: binds middleware to routes)
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        // RequestId phải chạy TRƯỚC Logger vì Logger cần đọc requestId từ header
        // (EN: RequestId must run BEFORE Logger because Logger needs to read requestId from header)
        RequestIdMiddleware,
        LoggerMiddleware,
      )
      // Áp dụng cho tất cả route — không filter theo method hay path cụ thể
      // (EN: Apply to all routes — no filtering by method or path)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
