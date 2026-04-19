import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap products-app (default port 3003)
 *
 * @remarks Stateless — đứng sau Ingress path `/api/products`.
 * (EN: Stateless — served by Ingress at `/api/products`.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port, '0.0.0.0');
  console.log(`[products-app] pod=${process.env.HOSTNAME ?? 'local'} on :${port}`);
}
void bootstrap();
