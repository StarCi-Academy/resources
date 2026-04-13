import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap — Điểm khởi đầu của ứng dụng.
 * (EN: Entry point of the application.)
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- Kích hoạt ValidationPipe Toàn cục (Global) ---
  // Giúp bảo vệ server khỏi dữ liệu rác và không hợp lệ.
  // (EN: Activate Global ValidationPipe. Protects server from invalid/garbage data.)
  app.useGlobalPipes(
    new ValidationPipe({
      // Tự động loại bỏ các field không được khai báo trong DTO
      // (EN: Strips malicious extra fields not defined in DTO)
      whitelist: true,

      // Trả về lỗi nếu phát hiện field "lạ" không có trong DTO
      // (EN: Throws error if extra fields are detected)
      forbidNonWhitelisted: true,

      // Tự động chuyển đổi payload sang đúng kiểu dữ liệu TS (string -> number, etc)
      // (EN: Automatically transforms payloads to match correct TypeScript types)
      transform: true,
    }),
  );

  const port = 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
