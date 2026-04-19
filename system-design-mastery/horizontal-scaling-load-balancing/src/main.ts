import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap NestJS instance — mỗi instance lấy PORT và INSTANCE_ID từ ENV
 * (EN: Bootstrap NestJS instance — each instance gets PORT and INSTANCE_ID from ENV)
 */
async function bootstrap() {
  // Đọc ENV để có thể chạy nhiều instance song song (EN: read ENV for parallel instances)
  const port = Number(process.env.PORT ?? 3001);
  const instanceId = process.env.INSTANCE_ID ?? `node-${port}`;
  process.env.INSTANCE_ID = instanceId;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  console.log(`[${instanceId}] listening on ${port}`);
}
void bootstrap();
