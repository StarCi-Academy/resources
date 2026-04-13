import { NestFactory, Reflector } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { TransformInterceptor, AllExceptionsFilter } from './common';

/**
 * Bootstrap — Cấu hình hệ thống Tài liệu API (Swagger/Scalar) và Phản hồi thống nhất.
 * (EN: Bootstrap — Configures API Documentation (Swagger/Scalar) and Unified Response.)
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- 1. Cấu trúc phản hồi thống nhất (Unified Response) ---
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());

  // --- 2. Cấu hình Swagger (API Specs) ---
  const config = new DocumentBuilder()
    .setTitle('Starci Academy - Demo API')
    .setDescription('Tài liệu minh họa Unified Responses & Swagger/Scalar UI')
    .setVersion('1.0')
    .addTag('Cats')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // --- 3. Cấu hình Scalar UI (Thay thế Swagger UI mặc định) ---
  // Truy cập tại: http://localhost:3000/scalar
  app.use(
    '/scalar',
    apiReference({
      spec: {
        content: document,
      },
    } as any),
  );

  // Vẫn giữ Swagger UI truyền thống (Tùy chọn)
  // Truy cập tại: http://localhost:3000/swagger
  SwaggerModule.setup('swagger', app, document);

  const port = 3000;
  await app.listen(port);

  logger.log(`🚀 API Docs (Scalar): http://localhost:${port}/scalar`);
  logger.log(`📚 API Docs (Swagger): http://localhost:${port}/swagger`);
}
bootstrap();
