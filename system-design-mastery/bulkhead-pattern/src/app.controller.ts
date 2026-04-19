import { Controller, Get, Query } from '@nestjs/common';
import { BulkheadService } from './bulkhead.service';

/**
 * 3 endpoint chạy trong 3 khoang khác nhau — demo cô lập
 * (EN: 3 endpoints run in 3 compartments — demonstrates isolation)
 */
@Controller()
export class AppController {
  constructor(private readonly bulkhead: BulkheadService) {}

  /**
   * GET /checkout — core flow, khoang có 8 slot
   * (EN: GET /checkout — core flow, 8-slot compartment)
   */
  @Get('checkout')
  checkout() {
    return this.bulkhead.checkout(async () => {
      // Giả lập xử lý thanh toán ngắn (EN: simulate short payment work)
      await new Promise((r) => setTimeout(r, 200));
      return { ok: true, feature: 'checkout' };
    });
  }

  /**
   * GET /profile?slow=10 — feature phụ, có thể hang rất lâu (query param slow=giây)
   * (EN: GET /profile?slow=10 — secondary feature, can hang for N seconds)
   */
  @Get('profile')
  profile(@Query('slow') slow?: string) {
    // Delay có thể đặt lớn để test exhausting (EN: large delay exhausts pool)
    const delayMs = Number(slow ?? 10) * 1000;
    return this.bulkhead.profile(async () => {
      await new Promise((r) => setTimeout(r, delayMs));
      return { ok: true, feature: 'profile', delayMs };
    });
  }

  /**
   * GET /reporting — feature rất phụ, chỉ 1 slot
   * (EN: GET /reporting — tertiary feature, 1-slot only)
   */
  @Get('reporting')
  reporting() {
    return this.bulkhead.reporting(async () => {
      await new Promise((r) => setTimeout(r, 5000));
      return { ok: true, feature: 'reporting' };
    });
  }

  /**
   * GET /bulkhead/stats — xem số slot còn free mỗi khoang
   * (EN: GET /bulkhead/stats — inspect free slots per compartment)
   */
  @Get('bulkhead/stats')
  stats() {
    return this.bulkhead.stats();
  }
}
