import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap Audit Subscriber
 * (EN: Bootstrap Audit Subscriber)
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Audit Subscriber đang lắng nghe Redis (EN: listening to Redis)');

  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
}
void bootstrap();
