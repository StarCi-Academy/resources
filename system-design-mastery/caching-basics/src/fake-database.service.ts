import { Injectable, Logger } from '@nestjs/common';

/**
 * Model sản phẩm mô phỏng dữ liệu DB
 * (EN: Product model mimicking DB data)
 */
export interface Product {
  id: number;
  name: string;
  price: number;
}

/**
 * Fake Database — mô phỏng DB chậm (delay 500ms mỗi query)
 * (EN: Fake Database — simulates slow DB with 500ms delay per query)
 *
 * Dùng để demo chênh lệch hiệu năng khi có/không có cache
 * (EN: used to demonstrate perf gap with/without cache)
 */
@Injectable()
export class FakeDatabaseService {
  private readonly logger = new Logger(FakeDatabaseService.name);

  // Dataset cố định trong RAM, giả lập bảng product (EN: static dataset simulating product table)
  private readonly products: Record<number, Product> = {
    1: { id: 1, name: 'iPhone 15', price: 999 },
    2: { id: 2, name: 'MacBook Pro', price: 2499 },
    3: { id: 3, name: 'AirPods', price: 199 },
  };

  /**
   * Query product theo id — cố tình delay 500ms để giả làm DB chậm
   * (EN: query product by id — artificial 500ms delay to simulate slow DB)
   */
  async findById(id: number): Promise<Product | null> {
    this.logger.warn(`[DB HIT] SELECT * FROM products WHERE id=${id}`);

    // Giả lập latency disk I/O (EN: simulate disk I/O latency)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.products[id] ?? null;
  }

  /**
   * Update giá — dùng để test cache invalidation
   * (EN: update price — used to test cache invalidation)
   */
  async updatePrice(id: number, newPrice: number): Promise<Product | null> {
    const product = this.products[id];
    if (!product) return null;

    product.price = newPrice;
    this.logger.warn(`[DB WRITE] UPDATE products SET price=${newPrice} WHERE id=${id}`);
    return product;
  }
}
