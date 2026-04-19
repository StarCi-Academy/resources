import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap HTTP API kiểm tra 4 backend Helm (Postgres, Redis, Mongo, Cassandra)
 *
 * @remarks Lắng nghe `PORT` (mặc định 3000); health dùng cho probe K8s nếu deploy app này lên cluster.
 * (EN: Listens on `PORT` (default 3000); suitable as a probe target if this app is deployed to the cluster.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`[database-scaling-example] listening on :${port}`);
}
void bootstrap();
