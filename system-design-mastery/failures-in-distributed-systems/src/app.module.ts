import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { FlakyService } from './flaky.service';

@Module({ controllers: [ChainController], providers: [FlakyService] })
export class AppModule {}
