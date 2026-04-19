import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap orders-app (default port 3002)
 *
 * @remarks Stateless — đứng sau Ingress path `/api/orders`.
 * (EN: Stateless — served by Ingress at `/api/orders`.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');
  console.log(`[orders-app] pod=${process.env.HOSTNAME ?? 'local'} on :${port}`);
}
void bootstrap();
