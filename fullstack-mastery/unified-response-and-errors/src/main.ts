import { NestFactory, Reflector } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor, AllExceptionsFilter } from './common';

/**
 * Bootstrap — Cấu hình Phản hồi Thống nhất Toàn cục.
 * (EN: Bootstrap — Configures Global Unified Response.)
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- 1. Kích hoạt Interceptor và Filter Toàn cục ---
  // Đảm bảo mọi request/response đều tuân thủ cùng một JSON Contract.
  // (EN: Activate Global Interceptor and Filter. Ensures all responses follow one JSON Contract.)
  
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
