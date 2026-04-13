import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * bootstrap — Hàm khởi động ứng dụng NestJS.
 * Đây là entry point duy nhất của toàn bộ server.
 * (EN: Application bootstrap function.
 * This is the single entry point for the entire server.)
 *
 * Luồng khởi động (EN: Bootstrap flow):
 *   1. NestFactory.create(AppModule) → IoC Container duyệt toàn bộ module graph
 *      (EN: IoC Container traverses the full module graph)
 *   2. IoC Container khởi tạo tất cả providers theo đúng thứ tự dependency
 *      (EN: IoC Container instantiates all providers in dependency order)
 *   3. app.listen() mở HTTP server trên PORT chỉ định
 *      (EN: app.listen() opens the HTTP server on the specified PORT)
 *
 * @returns Promise<void>
 */
async function bootstrap(): Promise<void> {
  // Tạo instance ứng dụng NestJS từ root module — đây là lúc IoC Container được khởi tạo
  // (EN: Create NestJS application instance from root module — this is when the IoC Container boots)
  const app = await NestFactory.create(AppModule);

  // Đọc PORT từ biến môi trường, fallback về 3000 nếu không set
  // (EN: Read PORT from environment variable, fallback to 3000 if not set)
  const port = process.env.PORT ?? 3000;

  // Bắt đầu lắng nghe HTTP request — server ready sau dòng này
  // (EN: Start listening for HTTP requests — server is ready after this line)
  await app.listen(port);
}

// Gọi bootstrap và bỏ qua Promise trả về — lỗi sẽ được Node.js unhandledRejection bắt
// (EN: Invoke bootstrap and ignore the returned Promise — errors will be caught by Node.js unhandledRejection)
bootstrap();
