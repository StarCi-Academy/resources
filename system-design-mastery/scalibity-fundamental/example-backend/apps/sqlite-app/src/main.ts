import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap sqlite-app
 *
 * @remarks App stateful: state nằm trong file SQLite local. Scale lên N replica
 * → N file độc lập → data phân mảnh, mất khi pod restart/scale-down.
 * (EN: Stateful app — state in a local SQLite file. Scaling to N replicas
 *  creates N independent files; data is fragmented and lost on restart/scale-down.)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`[sqlite-app] pod=${process.env.HOSTNAME ?? 'local'} on :${port}`);
}
void bootstrap();
