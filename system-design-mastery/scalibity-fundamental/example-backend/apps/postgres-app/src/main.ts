import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap postgres-app
 *
 * @remarks App stateless: state nằm ở Postgres service chung → scale vô tư.
 * (EN: Stateless app — state lives in the shared Postgres service; safe to scale.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`[postgres-app] pod=${process.env.HOSTNAME ?? 'local'} on :${port}`);
}
void bootstrap();
