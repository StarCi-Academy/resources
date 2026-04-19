import { DataSource } from 'typeorm';
import { Product } from './product.entity';

/**
 * Seed dữ liệu mẫu — chạy 1 lần lúc app boot nếu bảng rỗng
 *
 * @param dataSource - TypeORM DataSource đã init (EN: initialized TypeORM DataSource)
 * @returns số record đã insert (EN: number of inserted rows)
 */
export async function seedProducts(dataSource: DataSource): Promise<number> {
  const repo = dataSource.getRepository(Product);
  // Chỉ seed khi bảng rỗng để tránh duplicate sau restart
  // (EN: only seed when empty so restarts don't duplicate rows)
  const existing = await repo.count();
  if (existing > 0) return 0;

  const rows = Array.from({ length: 50 }).map((_, i) =>
    repo.create({
      name: `Product ${i + 1}`,
      price: 100 + i * 10,
      updatedByPod: 'seed',
    }),
  );
  await repo.save(rows);
  return rows.length;
}
