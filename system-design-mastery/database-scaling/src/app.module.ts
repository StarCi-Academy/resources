import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ShardService } from './shard.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [DatabaseService, ShardService],
})
export class AppModule {}
