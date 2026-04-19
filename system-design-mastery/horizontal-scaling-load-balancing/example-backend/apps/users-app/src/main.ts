import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap users-app (default port 3001)
 *
 * @remarks Stateless — đứng sau Ingress path `/api/users`.
 * (EN: Stateless — served by Ingress at `/api/users`.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`[users-app] pod=${process.env.HOSTNAME ?? 'local'} on :${port}`);
}
void bootstrap();
