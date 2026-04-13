import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

/**
 * bootstrap — Khởi động Server với Global Winston Logger.
 * (EN: Application bootstrap with Global Winston Logger.)
 */
async function bootstrap(): Promise<void> {
  // 1. Tạo app và tắt logger mặc định của Nest (EN: Create app and disable default Nest logger)
  const app = await NestFactory.create(AppModule, {
    logger: false, // Tạm tắt để set Winston sau (EN: Briefly disable to set Winston later)
  });

  // 2. Sử dụng Winston làm logger chính cho toàn bộ hệ thống
  // (EN: Use Winston as the primary logger for the entire system)
  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  // 3. Lấy port từ config thông qua ConfigService
  // (EN: Retrieve port from config via ConfigService)
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const nodeEnv = configService.get<string>('app.nodeEnv');

  // 4. Lắng nghe và thông báo khởi động (EN: Start listening and notify)
  await app.listen(port);
  
  winstonLogger.log({
    level: 'info',
    message: `🚀 Application is running on: http://localhost:${port} [Env: ${nodeEnv}]`,
    context: 'Bootstrap',
  });
}

bootstrap();
