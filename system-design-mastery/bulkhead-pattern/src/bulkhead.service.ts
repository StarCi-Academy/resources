import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Semaphore } from 'async-mutex';

/**
 * Bulkhead service — cô lập tài nguyên theo feature bằng semaphore
 * (EN: Bulkhead service — isolates resources per feature via semaphore)
 *
 * Ý tưởng từ tàu biển: chia thân tàu thành nhiều khoang kín nước, 1 khoang
 * thủng thì chỉ khoang đó ngập, toàn tàu vẫn nổi.
 * (EN: inspired by ship hulls — a flooded compartment doesn't sink the ship.)
 *
 * Code: mỗi feature (checkout, profile, reporting) có semaphore riêng giới hạn
 * số concurrent request. Khi profile hang → chỉ tốn quota của profile, checkout
 * vẫn còn slot để chạy.
 * (EN: each feature has its own semaphore capping concurrency. A hanging feature
 * only exhausts its own quota; other features keep slots.)
 */
@Injectable()
export class BulkheadService {
  // Khoang 1: Checkout — 8 concurrent slots (core revenue)
  // (EN: compartment 1: Checkout — 8 slots, the core revenue flow)
  private readonly checkoutBulkhead = new Semaphore(8);

  // Khoang 2: Profile — chỉ 2 slots (feature phụ, không để nó ăn hết)
  // (EN: compartment 2: Profile — 2 slots only, don't let it hog)
  private readonly profileBulkhead = new Semaphore(2);

  // Khoang 3: Reporting — 1 slot (feature rất phụ)
  // (EN: compartment 3: Reporting — 1 slot, heavily restricted)
  private readonly reportingBulkhead = new Semaphore(1);

  /**
   * Chạy work bên trong khoang được chỉ định
   * (EN: run work inside the specified compartment)
   *
   * @param name - tên khoang
   * @param work - async function cần chạy
   * @returns kết quả của work hoặc throw 503 nếu khoang đầy
   */
  private async runIn<T>(
    name: 'checkout' | 'profile' | 'reporting',
    sem: Semaphore,
    work: () => Promise<T>,
  ): Promise<T> {
    // Kiểm tra còn slot không (EN: check free slot)
    const value = sem.getValue();
    if (value <= 0) {
      // Không để request đứng queue vô tận — fail fast để khoang khác sống
      // (EN: do not queue forever — fail fast so other compartments stay healthy)
      throw new ServiceUnavailableException(
        `bulkhead '${name}' full — fail fast to protect other features`,
      );
    }

    // Acquire slot, chạy xong release tự động qua [value, release]
    // (EN: acquire a slot, release after the work completes)
    const [, release] = await sem.acquire();
    try {
      return await work();
    } finally {
      release();
    }
  }

  checkout<T>(work: () => Promise<T>): Promise<T> {
    return this.runIn('checkout', this.checkoutBulkhead, work);
  }

  profile<T>(work: () => Promise<T>): Promise<T> {
    return this.runIn('profile', this.profileBulkhead, work);
  }

  reporting<T>(work: () => Promise<T>): Promise<T> {
    return this.runIn('reporting', this.reportingBulkhead, work);
  }

  /**
   * Trạng thái tất cả khoang — expose qua /bulkhead/stats
   * (EN: status of all compartments — exposed via /bulkhead/stats)
   */
  stats() {
    return {
      checkout: { free: this.checkoutBulkhead.getValue(), capacity: 8 },
      profile: { free: this.profileBulkhead.getValue(), capacity: 2 },
      reporting: { free: this.reportingBulkhead.getValue(), capacity: 1 },
    };
  }
}
