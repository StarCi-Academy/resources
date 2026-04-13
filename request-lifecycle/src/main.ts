import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * bootstrap — Hàm khởi động ứng dụng NestJS minh họa Request Lifecycle.
 * (EN: Bootstrap function for the NestJS Request Lifecycle demo application.)
 *
 * Lifecycle hoàn chỉnh của mỗi request khi chạy ứng dụng này:
 * (EN: Complete lifecycle of each request when running this application:)
 *
 *   1. Client gửi HTTP request
 *      (EN: Client sends HTTP request)
 *   2. [Middleware] RequestIdMiddleware  → gắn UUID vào header
 *      (EN: attaches UUID to header)
 *   3. [Middleware] LoggerMiddleware     → log method + url + ip
 *      (EN: logs method + url + ip)
 *   4. [Guard]      TimingGuard         → ghi entry timestamp, return true
 *      (EN: records entry timestamp, returns true)
 *   5. [Interceptor] ExecutionTimerInterceptor (pre)  → chuẩn bị đo time
 *      (EN: prepares timing measurement)
 *   6. [Interceptor] ResponseTransformInterceptor (pre) → chuẩn bị transform
 *      (EN: prepares response transform)
 *   7. [Pipe]       ParsePositiveIntPipe → validate + convert route param
 *      (EN: validates and converts route param)
 *   7b.[Pipe/ValidationPipe] class-validator + CreateItemDto → validate request body (POST only)
 *      Ném HTTP 400 với danh sách lỗi chi tiết nếu body không hợp lệ
 *      (EN: throws HTTP 400 with detailed error list if body is invalid)
 *   8. [Controller] ItemsController     → nhận request đã sạch
 *      (EN: receives cleaned request)
 *   9. [Service]    ItemsService        → xử lý business logic
 *      (EN: processes business logic)
 *  10. [Interceptor] ResponseTransformInterceptor (post) → wrap { data, timestamp, requestId }
 *      (EN: wraps into { data, timestamp, requestId })
 *  11. [Interceptor] ExecutionTimerInterceptor (post) → log duration
 *      (EN: logs duration)
 *  12. Client nhận response
 *      (EN: Client receives response)
 *
 * @returns Promise<void>
 */
async function bootstrap(): Promise<void> {
  // Tạo ứng dụng NestJS — IoC Container khởi tạo toàn bộ dependency graph
  // (EN: Create NestJS application — IoC Container initializes the full dependency graph)
  const app = await NestFactory.create(AppModule);

  // Bật ValidationPipe global — tất cả endpoint đều tự động validate @Body() và @Query()
  // whitelist: true      → strip các property không có trong DTO (loại bỏ extra fields)
  // forbidNonWhitelisted → ném 400 thay vì silently strip — buộc client gửi đúng schema
  // transform: true      → tự động convert plain JSON object thành DTO class instance
  //                         (cần thiết để class-validator đọc được metadata của decorators)
  // (EN: Enable global ValidationPipe — all endpoints automatically validate @Body() and @Query()
  //   whitelist: true        → strips properties not declared in DTO (removes extra fields)
  //   forbidNonWhitelisted   → throws 400 instead of silently stripping — forces client to send correct schema
  //   transform: true        → auto-converts plain JSON to DTO class instance
  //                            (required so class-validator can read decorator metadata))
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Đọc PORT từ env, fallback về 3000
  // (EN: Read PORT from env, fallback to 3000)
  const port = process.env.PORT ?? 3000;

  // Bắt đầu lắng nghe — server sẵn sàng nhận request sau dòng này
  // (EN: Start listening — server is ready to receive requests after this line)
  await app.listen(port);
}

bootstrap();
