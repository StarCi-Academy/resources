import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteController } from '../../../libs/note.controller';
import { Note } from '../../../libs/note.entity';

/**
 * Module postgres-app — TypeORM → Postgres service (shared)
 *
 * @remarks DB credentials đọc từ env, được K8s inject qua Deployment env.
 * (EN: DB credentials come from env vars injected by K8s via the Deployment.)
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'postgres',
      database: process.env.POSTGRES_DATABASE ?? 'notes',
      entities: [Note],
      // synchronize=true chỉ dùng cho demo; production bắt buộc migration
      // (EN: demo-only — use migrations in production)
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Note]),
  ],
  controllers: [NoteController],
})
export class AppModule {}
