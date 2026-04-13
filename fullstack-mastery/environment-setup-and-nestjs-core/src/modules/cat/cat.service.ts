import { Injectable, Logger } from '@nestjs/common';
import { CatFoodService } from './cat-food.service';
import { CatHealthService } from './cat-health.service';

/**
 * CatService — Provider top-level trong CatModule, được export ra ngoài cho các module khác dùng.
 * Phụ thuộc đồng thời vào CatFoodService và CatHealthService — minh họa inject lồng nhau cấp 3.
 * (EN: Top-level provider in CatModule, exported for other modules to consume.
 * Depends on both CatFoodService and CatHealthService — demonstrates level-3 nested injection.)
 *
 * Dependency graph do IoC Container tự giải quyết:
 *   CatService → CatFoodService (singleton #1)
 *   CatService → CatHealthService → CatFoodService (cùng singleton #1!)
 * (EN: Dependency graph auto-resolved by IoC Container:
 *   CatService → CatFoodService (singleton #1)
 *   CatService → CatHealthService → CatFoodService (same singleton #1!))
 *
 * @side-effects Ghi log khi compile báo cáo trạng thái (EN: logs when compiling status report)
 */
@Injectable()
export class CatService {
  private readonly logger = new Logger(CatService.name);

  constructor(
    // IoC Container inject 2 dependencies cùng lúc — thứ tự khai báo không quan trọng
    // (EN: IoC Container injects both dependencies simultaneously — declaration order does not matter)
    private readonly catFoodService: CatFoodService,
    private readonly catHealthService: CatHealthService,
  ) {}

  /**
   * Tổng hợp trạng thái đầy đủ của mèo từ cả hai sub-service.
   * Hàm này kích hoạt toàn bộ DI chain để minh họa singleton reuse.
   * (EN: Compiles a full cat status report by pulling from both sub-services.
   * This method exercises the full DI chain to demonstrate singleton reuse.)
   *
   * @returns string — Báo cáo trạng thái nhiều dòng (EN: multi-line status report)
   */
  getCatStatus(): string {
    // Gọi checkHealth qua CatHealthService — nó sẽ gọi tiếp CatFoodService bên trong
    // (EN: Call checkHealth via CatHealthService — it will internally call CatFoodService)
    const health = this.catHealthService.checkHealth();

    // Gọi thẳng CatFoodService để lấy menu — chứng minh cùng 1 singleton được dùng ở 2 nơi
    // (EN: Call CatFoodService directly to get menu — proves the same singleton is used in two places)
    const menu = this.catFoodService.getMenu();

    // Log để trace entry point của request tại top-level service
    // (EN: Log to trace the request entry point at the top-level service)
    this.logger.log('📋 CatService: compiling full cat status report...');

    return `[Cat Status]\n${health}\nFavorite food: ${menu[0]}`;
  }

  /**
   * Cho mèo ăn bằng cách ủy thác xuống CatHealthService.
   * (EN: Feeds the cat by delegating down to CatHealthService.)
   *
   * @param food - Tên loại thức ăn (EN: name of the food)
   * @returns string — Kết quả cho ăn (EN: feeding result)
   */
  feedCat(food: string): string {
    // Ủy thác cho CatHealthService thay vì gọi trực tiếp CatFoodService
    // — giữ đúng responsibility của từng layer trong DI chain
    // (EN: Delegate to CatHealthService instead of calling CatFoodService directly
    // — preserves each layer's responsibility in the DI chain)
    return this.catHealthService.feedCat(food);
  }

  /**
   * Trả về lời giới thiệu của mèo — minh họa rằng đây là singleton được IoC quản lý.
   * (EN: Returns the cat's self-introduction — illustrates this is an IoC-managed singleton.)
   *
   * @returns string — Chuỗi giới thiệu (EN: introduction string)
   */
  introduce(): string {
    return '🐱 Hello! I am a Cat. I am managed by the NestJS IoC Container.';
  }
}
