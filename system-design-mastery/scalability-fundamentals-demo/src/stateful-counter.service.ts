import { Injectable } from '@nestjs/common';

/**
 * Counter lưu trong memory của chính instance — mô hình STATEFUL
 * (EN: Counter stored in the instance memory — STATEFUL model)
 *
 * Side effect: khi có 2 instance chạy song song, mỗi instance có 1 biến đếm riêng.
 * Kết quả trả về khi client hit qua load balancer sẽ nhảy loạn.
 * (EN: with 2 instances, each has its own counter — results look inconsistent through LB)
 */
@Injectable()
export class StatefulCounterService {
  // Biến trong memory — riêng từng instance (EN: in-memory variable — per-instance only)
  private counter = 0;

  /**
   * Tăng counter và trả về giá trị hiện tại (ở instance này)
   * (EN: increment counter and return current value of this instance)
   *
   * @returns số lần đã tăng kể từ khi instance khởi động
   */
  increment(): { instanceId: string; counter: number } {
    this.counter += 1;
    return {
      instanceId: process.env.INSTANCE_ID ?? 'unknown',
      counter: this.counter,
    };
  }
}
