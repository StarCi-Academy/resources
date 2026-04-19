import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TerminusModule],
  controllers: [AppController, HealthController],
  providers: [ProductService],
})
export class AppModule {}
