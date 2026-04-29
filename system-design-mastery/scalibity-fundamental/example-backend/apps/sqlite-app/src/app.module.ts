import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteController } from '../../../libs/note.controller';
import { Note } from '../../../libs/note.entity';

/**
 * Module sqlite-app — TypeORM → file SQLite local trong container
 *
 * @remarks Đường dẫn file đọc từ env `SQLITE_PATH`. Chính cái path local này
 * là nguồn gốc của tính *stateful*: 3 replica ⇒ 3 file notes.db khác nhau.
 * (EN: DB path from `SQLITE_PATH`. This local path is the source of "stateful"
 *  behavior — 3 replicas ⇒ 3 independent notes.db files.)
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.SQLITE_PATH ?? '@app/sqlite-app/data/notes.db',
      entities: [Note],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Note]),
  ],
  controllers: [NoteController],
})
export class AppModule {}
