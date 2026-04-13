import { Controller, Get, UseInterceptors, Logger } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CatService } from './cat.service';

/**
 * Cat Controller — Trình diễn 3 tầng caching qua 3 endpoints khác nhau.
 * (EN: Cat Controller — Demonstrates 3 caching layers through 3 different endpoints.)
 */
@Controller('cats')
export class CatController {
  private readonly logger = new Logger(CatController.name);

  constructor(private readonly catService: CatService) { }

  /**
   * ENDPOINT 1: Demo Response Cache (Request Level).
   * Tự động cache toàn bộ HTTP Response dựa trên URL và Key.
   * (EN: ENDPOINT 1: Demo Response Cache (Request Level). Auto-caches HTTP Response based on URL and Key.)
   */
  @Get('response-layer')
  @UseInterceptors(CacheInterceptor) // Tầng 3: Chặn ngay tại entry point (EN: Block at entry point)
  @CacheKey('cats_res_layer')
  @CacheTTL(30000) // 30 giây (EN: 30 seconds)
  async getResponseCache() {
    this.logger.log('--- Triggering Layer 3 (Response Cache) flow ---');
    return await this.catService.findForResponseCache();
  }

  /**
   * ENDPOINT 2: Demo Logic Cache (Service Level).
   * Service chủ động kiểm tra cache bằng code trước khi tính toán.
   * (EN: ENDPOINT 2: Demo Logic Cache (Service Level). Service manually checks cache before computing.)
   */
  @Get('logic-layer')
  async getLogicCache() {
    this.logger.log('--- Triggering Layer 2 (Logic Cache) flow ---');
    return await this.catService.findByLogicCache();
  }

  /**
   * ENDPOINT 3: Demo DB Query Cache (Data Level).
   * TypeORM tự động cache kết quả của câu lệnh SQL.
   * (EN: ENDPOINT 3: Demo DB Query Cache (Data Level). TypeORM auto-caches SQL query results.)
   */
  @Get('db-layer')
  async getDbCache() {
    this.logger.log('--- Triggering Layer 1 (DB Query Cache) flow ---');
    return await this.catService.findByDbCache();
  }
}
