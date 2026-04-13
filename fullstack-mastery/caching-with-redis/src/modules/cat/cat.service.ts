import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';

/**
 * Cat Service — Minh họa 3 tầng caching (DB, Logic, Response).
 * (EN: Cat Service — Demonstrates 3 caching layers: DB, Logic, Response.)
 */
@Injectable()
export class CatService {
  private readonly logger = new Logger(CatService.name);

  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
    // Inject CACHE_MANAGER để thực hiện manual caching bằng code logic
    // (EN: Inject CACHE_MANAGER for manual programmatic caching)
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  /**
   * LAYER 1: Database Query Cache (Tầng Database).
   * Dùng TypeORM để cache lại kết quả sau khi thực thi SQL.
   * (EN: LAYER 1: Database Query Cache (Database layer). Uses TypeORM to cache SQL execution results.)
   */
  async findByDbCache(): Promise<Cat[]> {
    this.logger.log('Executing Layer 1: TypeORM Query Cache check...');

    // [execute] DB query với tùy chọn cache của TypeORM
    // (EN: DB query with TypeORM cache option)
    return await this.catRepository.find({
      cache: {
        id: 'cats_db_layer_cache',
        milliseconds: 30000, // Cache trong 30 giây (EN: 30s cache)
      },
    });
  }

  /**
   * LAYER 2: Cache By Logic (Tầng Nghiệp vụ).
   * Tự viết code để kiểm tra cache trước khi thực hiện logic nặng.
   * (EN: LAYER 2: Cache By Logic (Business layer). Manually check cache before heavy logic.)
   */
  async findByLogicCache(): Promise<any> {
    const cacheKey = 'cats_logic_layer_cache';

    // [prepare] Kiểm tra xem dữ liệu đã có trong cache chưa
    // (EN: Check if data already exists in cache)
    this.logger.log('Executing Layer 2: Programmatic Logic Cache check...');
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      this.logger.debug('Logic Cache Hit! Returning data directly.');
      return cachedData;
    }

    // [execute] Giả lập xử lý nghiệp vụ nặng (EN: Simulate heavy business logic)
    this.logger.warn('Logic Cache Miss! Simulating heavy work...');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Sleep 2s
    const result = {
      message: 'Hải sản cho mèo cực phẩm',
      timestamp: new Date().toISOString()
    };

    // [confirm] Lưu kết quả vào cache đễ dùng cho lần sau
    // (EN: Save result to cache for future use)
    await this.cacheManager.set(cacheKey, result, 60000); // 1 phút (EN: 1 minute)

    return result;
  }

  /**
   * LAYER 3: Response Cache (Tầng Tiếp nhận).
   * Tầng này thường được handle ở Controller, service chỉ trả về data thô.
   * (EN: LAYER 3: Response Cache (Entry layer). Usually handled at Controller; service just returns raw data.)
   */
  async findForResponseCache(): Promise<string> {
    this.logger.log('Layer 3 flow: Request reaching Service (it means Response Cache was MISS)');
    return 'This data would be cached at the Controller level using CacheInterceptor';
  }
}
