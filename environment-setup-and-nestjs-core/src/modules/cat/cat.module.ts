import { Module } from '@nestjs/common';
import { CatController } from './cat.controller';
import { CatService } from './cat.service';
import { CatFoodService } from './cat-food.service';
import { CatHealthService } from './cat-health.service';

/**
 * CatModule — Bounded context cho toàn bộ domain Cat.
 * Đăng ký các providers và controller liên quan đến mèo vào IoC Container.
 * (EN: Bounded context for the entire Cat domain.
 * Registers all Cat-related providers and controller into the IoC Container.)
 *
 * Encapsulation (Đóng gói):
 *   - CatFoodService và CatHealthService là PRIVATE — không module nào ngoài có thể inject trực tiếp.
 *   - Chỉ CatService được export ra ngoài để các module khác (ví dụ DogModule) sử dụng.
 * (EN: Encapsulation:
 *   - CatFoodService and CatHealthService are PRIVATE — no outside module can inject them directly.
 *   - Only CatService is exported for other modules (e.g. DogModule) to consume.)
 *
 * Dependency graph do IoC Container tự giải quyết:
 * (EN: Dependency graph auto-resolved by the IoC Container:)
 *
 *   CatController
 *     └── CatService
 *           ├── CatFoodService        ← singleton #1
 *           └── CatHealthService
 *                 └── CatFoodService  ← cùng singleton #1 được tái sử dụng!
 *                                        (EN: same singleton #1 reused!)
 */
@Module({
  // Đăng ký controller nhận HTTP request từ bên ngoài
  // (EN: Register controller to accept HTTP requests from outside)
  controllers: [CatController],

  // Đăng ký toàn bộ providers vào DI Container — IoC tự giải quyết dependency graph
  // (EN: Register all providers into the DI Container — IoC auto-resolves the dependency graph)
  providers: [CatFoodService, CatHealthService, CatService],

  // Chỉ export CatService — CatFoodService và CatHealthService ở lại private trong module này
  // (EN: Only export CatService — CatFoodService and CatHealthService remain private to this module)
  exports: [CatService],
})
export class CatModule {}
