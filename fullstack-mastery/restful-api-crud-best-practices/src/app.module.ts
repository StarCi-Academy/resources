import { Module } from '@nestjs/common';
import { UsersModule } from './modules';

/**
 * AppModule — Root module của ứng dụng Best Practice.
 * (EN: Root module of the Best Practice application.)
 */
@Module({
  imports: [UsersModule],
})
export class AppModule {}
