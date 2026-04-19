import { Injectable } from '@nestjs/common';
import { FakeDatabaseService, Product } from './fake-database.service';
import { CacheService } from './cache.service';

/**
 * Product service áp dụng pattern Cache-Aside (Lazy Loading)
 * (EN: Product service applying Cache-Aside / Lazy Loading pattern)
 *
 * Flow:
 *  1. App đọc cache trước (EN: app reads cache first)
 *  2. Cache miss → đọc DB → ghi lại vào cache (EN: on miss, read DB then populate cache)
 *  3. Cache hit → trả luôn (EN: on hit, return immediately)
 */
@Injectable()
export class ProductService {
  // TTL 60s cho mỗi entry (EN: 60s TTL per entry)
  private static readonly CACHE_TTL = 60;

  constructor(
    private readonly db: FakeDatabaseService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Tạo cache key thống nhất theo id
   * (EN: build canonical cache key by id)
   */
  private key(id: number): string {
    return `product:${id}`;
  }

  /**
   * Lấy product với Cache-Aside
   * (EN: get product with Cache-Aside)
   *
   * @param id - product id
   * @returns Product hoặc null nếu không tồn tại
   */
  async getById(id: number): Promise<{ source: 'cache' | 'db'; data: Product | null }> {
    // B1: Thử cache trước (EN: try cache first)
    const cached = await this.cache.get<Product>(this.key(id));
    if (cached) {
      return { source: 'cache', data: cached };
    }

    // B2: Miss → truy DB (EN: miss → hit DB)
    const product = await this.db.findById(id);
    if (!product) {
      return { source: 'db', data: null };
    }

    // B3: Ghi lại vào cache để lần sau hit (EN: populate cache for future hits)
    await this.cache.set(this.key(id), product, ProductService.CACHE_TTL);
    return { source: 'db', data: product };
  }

  /**
   * Update giá — phải invalidate cache sau khi ghi DB
   * (EN: update price — must invalidate cache after writing DB)
   *
   * Đây là điểm mấu chốt của Cache-Aside: write-through cache là 1 option khác,
   * nhưng phổ biến nhất là write DB trước → del cache (đơn giản, ít bug consistency).
   * (EN: Cache-Aside canonical approach: write DB then invalidate — simpler than write-through.)
   */
  async updatePrice(id: number, newPrice: number): Promise<Product | null> {
    // B1: Ghi DB (EN: write DB)
    const updated = await this.db.updatePrice(id, newPrice);
    if (!updated) return null;

    // B2: Invalidate cache để lần read tiếp theo lấy giá mới
    // (EN: invalidate cache so next read fetches fresh data)
    await this.cache.del(this.key(id));

    return updated;
  }
}
