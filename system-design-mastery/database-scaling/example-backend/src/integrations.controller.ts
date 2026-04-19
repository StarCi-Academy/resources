import { Body, Controller, Get, Post } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';

/**
 * HTTP API kiểm tra kết nối tới 4 Helm release (Postgres HA, Redis Cluster, Mongo sharded, Cassandra)
 *
 * @remarks Dùng cho demo Module 4.3 — không thay thế test tải (EN: demo-only for Module 4.3 — not a load test.)
 */
@Controller()
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  /**
   * Liveness — không gọi DB (EN: liveness — does not touch databases)
   *
   * @returns `{ ok: true }`
   */
  @Get('health')
  health(): { ok: true } {
    return { ok: true };
  }

  /**
   * Ping song song 4 backend
   *
   * @returns trạng thái + ms từng backend
   */
  @Get('integrations')
  async status(): Promise<ReturnType<IntegrationsService['pingAll']>> {
    return this.integrations.pingAll();
  }

  /**
   * Ghi dữ liệu mẫu lên Mongo + Cassandra + Redis counter
   *
   * @param body - `{ "message": "..." }`
   * @returns kết quả ghi (EN: write summary)
   */
  @Post('integrations/demo-write')
  async demoWrite(@Body() body: { message?: string }): Promise<unknown> {
    const message = body.message ?? `hello-${Date.now()}`;
    return this.integrations.writeDemo(message);
  }
}
