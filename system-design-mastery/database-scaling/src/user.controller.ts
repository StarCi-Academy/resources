import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ShardService } from './shard.service';

/**
 * User controller — minh hoạ routing reads/writes + shard pick
 * (EN: User controller — illustrates read/write routing + shard picking)
 */
@Controller('users')
export class UserController {
  constructor(
    private readonly db: DatabaseService,
    private readonly shardService: ShardService,
  ) {}

  /**
   * GET /users — đọc danh sách (đi replica)
   * (EN: GET /users — list read from replica)
   *
   * Query param `strong=1` → ép đọc primary (EN: force primary with strong=1)
   */
  @Get()
  async list(@Query('strong') strong?: string) {
    const sql = 'SELECT id, email, name, created_at FROM users ORDER BY id';

    // Nếu client yêu cầu strong consistency → đi primary
    // (EN: if client requests strong consistency → hit primary)
    return strong === '1' ? this.db.readStrong(sql) : this.db.read(sql);
  }

  /**
   * POST /users — tạo user (đi primary)
   * (EN: POST /users — create user on primary)
   */
  @Post()
  async create(@Body() body: { email: string; name: string }) {
    const rows = await this.db.write<{ id: number }>(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id',
      [body.email, body.name],
    );
    return { id: rows[0]!.id, ...body };
  }

  /**
   * GET /users/:id/shard — trả về shard index nếu bảng này được shard
   * (EN: GET /users/:id/shard — returns the shard index if sharded)
   */
  @Get(':id/shard')
  whichShard(@Param('id', ParseIntPipe) id: number) {
    // Demo concept: với hàng triệu user, id được phân tán vào các shard riêng
    // (EN: with millions of users, ids are distributed across separate shards)
    return { userId: id, ...this.shardService.pickShard(id) };
  }
}
