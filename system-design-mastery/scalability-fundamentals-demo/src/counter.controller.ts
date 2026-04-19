import { Controller, Post } from '@nestjs/common';
import { StatefulCounterService } from './stateful-counter.service';
import { StatelessCounterService } from './stateless-counter.service';

/**
 * Controller expose 2 endpoint demo — 1 stateful, 1 stateless
 * (EN: Controller exposing 2 demo endpoints — 1 stateful, 1 stateless)
 */
@Controller('counter')
export class CounterController {
  constructor(
    private readonly stateful: StatefulCounterService,
    private readonly stateless: StatelessCounterService,
  ) {}

  /**
   * POST /counter/local — tăng counter in-memory, KHÔNG scale được
   * (EN: POST /counter/local — increment in-memory counter, NOT scalable)
   */
  @Post('local')
  incrementLocal() {
    return this.stateful.increment();
  }

  /**
   * POST /counter/shared — tăng counter lưu trên Redis, scale được
   * (EN: POST /counter/shared — increment counter stored in Redis, scalable)
   */
  @Post('shared')
  async incrementShared() {
    return this.stateless.increment();
  }
}
