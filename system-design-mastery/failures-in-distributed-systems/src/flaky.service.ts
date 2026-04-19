import { Injectable } from '@nestjs/common';

/**
 * Config uptime cho 1 service downstream
 * (EN: Uptime config for a simulated downstream service)
 */
export interface FlakyConfig {
  name: string;
  uptime: number; // 0..1, vd 0.99 = 99% thành công (EN: 0..1, e.g. 0.99 = 99% success)
}

/**
 * Flaky service — giả lập downstream call có xác suất fail
 * (EN: Flaky service — simulates a downstream call with failure probability)
 *
 * Side effect: throw Error khi random rơi vào vùng fail
 * (EN: throws Error when random falls into the failing band)
 */
@Injectable()
export class FlakyService {
  /**
   * Gọi 1 downstream service giả lập
   * (EN: call 1 simulated downstream service)
   *
   * @param cfg - tên service và tỉ lệ uptime
   * @returns kết quả hoặc throw nếu "fail"
   */
  async call(cfg: FlakyConfig): Promise<{ service: string; ok: true }> {
    // Random 1 số 0..1, nếu >= uptime → coi như service đang chết
    // (EN: random 0..1; if >= uptime, service is considered down)
    const roll = Math.random();

    // Thêm chút latency cho realistic (EN: small latency for realism)
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (roll >= cfg.uptime) {
      throw new Error(`[${cfg.name}] downstream failed (roll=${roll.toFixed(3)})`);
    }
    return { service: cfg.name, ok: true };
  }
}
