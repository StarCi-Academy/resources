import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Khởi động HTTP server trên port lấy từ ENV (mặc định 3001)
 * (EN: Bootstrap HTTP server on port from ENV, default 3001)
 *
 * Cho phép chạy nhiều instance trên nhiều port để mô phỏng horizontal scaling
 * (EN: Allows running multiple instances on different ports to simulate horizontal scaling)
 */
async function bootstrap() {
  // Đọc PORT từ ENV để có thể chạy nhiều instance (EN: read PORT from ENV so multiple instances can coexist)
  const port = Number(process.env.PORT ?? 3001);

  // Lấy INSTANCE_ID để phân biệt response đến từ instance nào (EN: label responses with instance id)
  const instanceId = process.env.INSTANCE_ID ?? `node-${port}`;
  process.env.INSTANCE_ID = instanceId;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  console.log(
    `[${instanceId}] Scalability Fundamentals demo đang chạy trên port ${port} ` +
      `(EN: running on port ${port})`,
  );
}
void bootstrap();
