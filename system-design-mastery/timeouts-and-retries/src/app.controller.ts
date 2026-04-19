import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ResilientHttpService } from './resilient-http.service';

/**
 * Controller demo — gọi fake downstream trên :4001 với 3 kịch bản
 * (EN: Demo controller — calls fake downstream on :4001 in 3 scenarios)
 */
@Controller()
export class AppController {
  constructor(private readonly http: ResilientHttpService) {}

  /**
   * GET /call/fast — gọi endpoint nhanh, không fail — để thấy happy path
   * (EN: GET /call/fast — calls the fast endpoint, happy path)
   */
  @Get('call/fast')
  fast() {
    return this.http.get('http://localhost:4001/fast', {
      timeoutMs: 1000,
      maxRetries: 2,
      baseBackoffMs: 200,
      maxBackoffMs: 2000,
    });
  }

  /**
   * GET /call/slow — downstream hang 5s, nhưng timeout của ta là 1s
   * (EN: GET /call/slow — downstream hangs 5s, our timeout is 1s)
   *
   * Kỳ vọng: bị timeout → retry 2 lần với backoff → vẫn fail → trả 500
   * (EN: expect timeout → 2 retries with backoff → eventual 500)
   */
  @Get('call/slow')
  async slow() {
    try {
      return await this.http.get('http://localhost:4001/slow', {
        timeoutMs: 1000,
        maxRetries: 2,
        baseBackoffMs: 300,
        maxBackoffMs: 2000,
      });
    } catch (err) {
      // Convert thành 500 cho gọn (EN: convert to 500 for brevity)
      throw new InternalServerErrorException((err as Error).message);
    }
  }

  /**
   * GET /call/flaky — downstream fail ~30%, retry thường cứu được
   * (EN: GET /call/flaky — downstream fails ~30%, retry usually recovers)
   */
  @Get('call/flaky')
  flaky() {
    return this.http.get('http://localhost:4001/flaky?rate=0.7', {
      timeoutMs: 1000,
      maxRetries: 4,
      baseBackoffMs: 200,
      maxBackoffMs: 2000,
    });
  }
}
