import { Controller, Get } from '@nestjs/common';
import { BreakerService } from './breaker.service';

@Controller()
export class AppController {
  constructor(private readonly breaker: BreakerService) {}

  /**
   * GET /data — gọi downstream qua circuit breaker
   * (EN: GET /data — call downstream through circuit breaker)
   */
  @Get('data')
  data() {
    return this.breaker.call();
  }

  /**
   * GET /breaker/stats — xem trạng thái breaker (CLOSED/OPEN/HALF_OPEN)
   * (EN: GET /breaker/stats — inspect breaker state)
   */
  @Get('breaker/stats')
  stats() {
    return this.breaker.stats();
  }
}
