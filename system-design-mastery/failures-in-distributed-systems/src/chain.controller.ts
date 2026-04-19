import { Controller, Get, Query } from '@nestjs/common';
import { FlakyService } from './flaky.service';

/**
 * Controller demo — chứng minh failure amplification trong chuỗi service
 * (EN: Controller — proves failure amplification across a service chain)
 *
 * Request /chain gọi tuần tự A → B → C → D, mỗi service có uptime 99%.
 * Xác suất toàn chuỗi thành công = 0.99^4 ≈ 96.1%
 * (EN: sequential A → B → C → D each 99% up — end-to-end success ≈ 96.1%)
 */
@Controller()
export class ChainController {
  constructor(private readonly flaky: FlakyService) {}

  /**
   * GET /chain — gọi 1 request qua chuỗi 4 service, trả về kết quả
   * (EN: GET /chain — executes one request through a 4-service chain)
   */
  @Get('chain')
  async oneShot() {
    try {
      // Gọi tuần tự — nếu bất kỳ service nào fail → cả chain fail
      // (EN: sequential — if any fails, entire chain fails)
      const a = await this.flaky.call({ name: 'ServiceA', uptime: 0.99 });
      const b = await this.flaky.call({ name: 'ServiceB', uptime: 0.99 });
      const c = await this.flaky.call({ name: 'ServiceC', uptime: 0.99 });
      const d = await this.flaky.call({ name: 'ServiceD', uptime: 0.99 });
      return { ok: true, trace: [a, b, c, d] };
    } catch (err) {
      const e = err as Error;
      return { ok: false, reason: e.message };
    }
  }

  /**
   * GET /chain/simulate?n=1000 — chạy n vòng để thống kê % thành công thực tế
   * (EN: GET /chain/simulate?n=1000 — runs n iterations to measure end-to-end success)
   */
  @Get('chain/simulate')
  async simulate(@Query('n') rawN?: string) {
    // Số lượt request mô phỏng — cap 10,000 để khỏi treo (EN: cap at 10k)
    const total = Math.min(Number(rawN ?? 1000), 10_000);
    let success = 0;

    for (let i = 0; i < total; i++) {
      const result = await this.oneShot();
      if (result.ok) success += 1;
    }

    return {
      total,
      success,
      failure: total - success,
      successRate: `${((success / total) * 100).toFixed(2)}%`,
      theoreticalRate: `${(0.99 ** 4 * 100).toFixed(2)}%`,
    };
  }
}
