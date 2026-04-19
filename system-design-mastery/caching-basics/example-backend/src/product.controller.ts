import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { hostname } from 'os';
import type { Response } from 'express';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';

/**
 * Controller demo 3 pattern cache trong 1 app NestJS
 *
 * @remarks
 *  - (1) Cache-Aside bằng `@Inject(CACHE_MANAGER)` — manual get/set/del với Redis.
 *  - (2) Query-level cache của TypeORM qua `.cache()` — cache kết quả query SQL.
 *  - (3) Response cache của NestJS qua `CacheInterceptor` — cache cả JSON body theo URL.
 *
 * (EN: three cache patterns in one NestJS app — Cache-Aside, TypeORM query cache, response cache.)
 */
@Controller('products')
export class ProductController {
  // HOSTNAME trong container K8s chính là tên pod (EN: HOSTNAME == pod name in K8s)
  private readonly podName = process.env.HOSTNAME ?? hostname();

  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    // CACHE_MANAGER là Redis-backed cache, đăng ký global trong AppModule
    // (EN: CACHE_MANAGER is Redis-backed, registered globally in AppModule)
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Healthcheck cho readiness/liveness probe
   *
   * @returns `{ pod, ok }`
   */
  @Get('health')
  health(): { pod: string; ok: true } {
    return { pod: this.podName, ok: true };
  }

  /**
   * [Pattern 1] Cache-Aside với `@Inject(CACHE_MANAGER)`
   *
   * @param id - ID sản phẩm (EN: product id)
   * @returns `{ source: 'cache' | 'db', pod, durationMs, data }`
   * @remarks
   *  - Miss → query DB (có `pg_sleep` 300ms giả lập DB chậm) → set cache TTL 60s.
   *  - Hit  → trả từ Redis, không chạm DB.
   *  (EN: Miss → query DB (slowed by pg_sleep) → populate cache. Hit → serve from Redis.)
   */
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ source: 'cache' | 'db'; pod: string; durationMs: number; data: Product }> {
    const started = Date.now();
    const key = `product:${id}`;

    // Bước 1: thử đọc cache trước (EN: try cache first)
    const cached = await this.cacheManager.get<Product>(key);
    if (cached) {
      return { source: 'cache', pod: this.podName, durationMs: Date.now() - started, data: cached };
    }

    // Bước 2: cache miss → đọc DB chậm (EN: miss → query slow DB)
    const row = await this.readFromSlowDb(id);

    // Bước 3: ghi lại cache với TTL 60s cho lần đọc sau (EN: populate cache for next reads)
    await this.cacheManager.set(key, row, 60_000);
    return { source: 'db', pod: this.podName, durationMs: Date.now() - started, data: row };
  }

  /**
   * [Pattern 2] Query-level cache của TypeORM
   *
   * @returns danh sách 20 product rẻ nhất + nguồn `typeorm-cache` hoặc `db`
   * @remarks `.cache(key, ttl)` bảo TypeORM ghi/đọc `queryResultCache` (backend = Redis).
   * (EN: `.cache(key, ttl)` tells TypeORM to use `queryResultCache` — backed by Redis.)
   */
  @Get()
  async listCheapest(@Res({ passthrough: true }) res: Response): Promise<{
    source: 'typeorm-cache' | 'db';
    pod: string;
    durationMs: number;
    count: number;
    items: Product[];
  }> {
    const started = Date.now();
    const cacheId = 'products:cheapest';

    // Bật `.cache()` → TypeORM tự quản lý key trong Redis, trả cache nếu còn TTL
    // (EN: `.cache()` → TypeORM manages the Redis key, serves cache while TTL valid)
    const items = await this.repo
      .createQueryBuilder('p')
      .orderBy('p.price', 'ASC')
      .take(20)
      .cache(cacheId, 30_000)
      .getMany();

    const durationMs = Date.now() - started;

    // Heuristic: query đi qua TypeORM cache luôn < 20ms (Redis round-trip),
    // còn DB thật sẽ lâu hơn do disk IO + ORDER BY
    // (EN: heuristic — TypeORM-cache roundtrip <20ms; real DB queries take longer)
    const source: 'typeorm-cache' | 'db' = durationMs < 20 ? 'typeorm-cache' : 'db';

    // HTTP cache header — browser/CDN có thể cache 10s, proxy (Nginx) cache 30s
    // (EN: HTTP cache header — browser/CDN 10s, proxy (Nginx) 30s)
    res.setHeader('Cache-Control', 'public, max-age=10, s-maxage=30');

    return { source, pod: this.podName, durationMs, count: items.length, items };
  }

  /**
   * [Pattern 3] Response cache qua `CacheInterceptor` của NestJS
   *
   * @returns thống kê đơn giản — toàn bộ response body được cache theo key cố định
   * @remarks Lần đầu chạy aggregate thật; lần sau đọc body đã serialize từ Redis → cực rẻ.
   * (EN: first call runs the aggregate; subsequent calls read serialized body from Redis.)
   */
  @Get('stats/summary')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('products:stats-summary')
  @CacheTTL(15_000)
  async statsSummary(): Promise<{ pod: string; total: number; avgPrice: number }> {
    // Query aggregate nặng — nếu không cache response, mọi request đều chạy lại
    // (EN: heavy aggregate — without response cache, runs on every request)
    const raw = await this.repo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'total')
      .addSelect('AVG(p.price)', 'avgPrice')
      .getRawOne<{ total: string; avgPrice: string }>();

    return {
      pod: this.podName,
      total: Number(raw?.total ?? 0),
      avgPrice: Number(raw?.avgPrice ?? 0),
    };
  }

  /**
   * Update giá và invalidate cache liên quan (cả 3 layer)
   *
   * @param id - ID sản phẩm (EN: product id)
   * @param body - `{ price }` giá mới (EN: new price)
   * @returns product đã update kèm danh sách cache key đã xoá
   */
  @Put(':id/price')
  async updatePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { price: number },
  ): Promise<{ pod: string; product: Product; invalidated: string[] }> {
    // Ghi xuống DB trước (source of truth) (EN: DB is source of truth — write first)
    await this.repo.update(id, { price: body.price, updatedByPod: this.podName });
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    // Fan-out invalidate qua cả 3 layer (EN: fan-out invalidate across all 3 layers)
    const invalidated: string[] = [];

    // Layer 1: xoá cache-aside key (EN: drop Cache-Aside key)
    await this.cacheManager.del(`product:${id}`);
    invalidated.push(`product:${id}`);

    // Layer 3: xoá response cache của CacheInterceptor (EN: drop response cache)
    await this.cacheManager.del('products:stats-summary');
    invalidated.push('products:stats-summary');

    // Layer 2: xoá TypeORM query cache theo identifier (EN: drop TypeORM query cache by id)
    await this.dataSource.queryResultCache?.remove(['products:cheapest']);
    invalidated.push('products:cheapest');

    return { pod: this.podName, product, invalidated };
  }

  /**
   * Đọc DB "chậm" — dùng `pg_sleep` để giả lập query nặng ngay trong Postgres
   *
   * @param id - ID sản phẩm (EN: product id)
   * @returns Product row
   * @remarks Không phải delay app-side — ép chính Postgres chậm để đo đúng cost DB.
   * (EN: not app-side delay — slow Postgres itself to measure real DB cost.)
   */
  private async readFromSlowDb(id: number): Promise<Product> {
    // pg_sleep(0.3) = 300ms blocking ngay trong Postgres (EN: 300ms block inside Postgres)
    await this.dataSource.query('SELECT pg_sleep(0.3)');
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Product ${id} not found`);
    return row;
  }
}
