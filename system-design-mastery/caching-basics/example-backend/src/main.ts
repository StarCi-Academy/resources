import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { seedProducts } from './product.seed';

/**
 * Bootstrap cache-app — NestJS + TypeORM Postgres + Redis cache (3 layer)
 *
 * @remarks Sau khi app sẵn sàng, seed 50 product nếu bảng rỗng rồi mới listen.
 * (EN: On boot, seed 50 products if the table is empty, then start listening.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const inserted = await seedProducts(app.get(DataSource));
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`[cache-app] pod=${process.env.HOSTNAME ?? 'local'} :${port} seeded=${inserted}`);
}
void bootstrap();
