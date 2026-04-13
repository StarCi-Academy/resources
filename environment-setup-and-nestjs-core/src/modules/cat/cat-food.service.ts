import { Injectable, Logger } from '@nestjs/common';

/**
 * CatFoodService — Provider innermost trong DI chain của CatModule.
 * Quản lý danh sách thức ăn của mèo, không phụ thuộc vào bất kỳ service nào khác.
 * (EN: Innermost provider in the CatModule DI chain. Manages the cat food inventory with no dependencies.)
 *
 * @side-effects Ghi log khi chuẩn bị bữa ăn (EN: logs when preparing a meal)
 */
@Injectable()
export class CatFoodService {
  private readonly logger = new Logger(CatFoodService.name);

  // Danh sách thức ăn hợp lệ — hardcode cho mục đích demo DI
  // (EN: Valid food menu — hardcoded for DI demo purposes)
  private readonly menu: string[] = ['tuna', 'salmon', 'chicken'];

  /**
   * Trả về toàn bộ danh sách thức ăn hiện có.
   * (EN: Returns the full list of available food items.)
   *
   * @returns string[] — mảng tên thức ăn (EN: array of food names)
   */
  getMenu(): string[] {
    // Trả thẳng array nội bộ — chỉ đọc, không mutate
    // (EN: Return the internal array directly — read-only, no mutation)
    return this.menu;
  }

  /**
   * Chuẩn bị bữa ăn cho mèo nếu thức ăn có trong menu.
   * (EN: Prepares a meal for the cat if the food exists in the menu.)
   *
   * @param food - Tên thức ăn cần chuẩn bị (EN: name of the food to prepare)
   * @returns string — Mô tả bữa ăn hoặc thông báo lỗi (EN: meal description or error message)
   */
  prepareMeal(food: string): string {
    // Kiểm tra thức ăn có trong menu không — tránh phục vụ thức ăn không hợp lệ
    // (EN: Validate food exists in menu — prevent serving invalid food)
    if (!this.menu.includes(food)) {
      return `❌ Sorry, we don't have ${food} on the menu.`;
    }

    // Log để trace luồng chuẩn bị bữa ăn trong runtime
    // (EN: Log to trace the meal preparation flow at runtime)
    this.logger.log(`🍽️  Preparing a bowl of ${food}...`);

    return `A freshly prepared bowl of ${food}`;
  }
}
