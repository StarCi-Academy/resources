import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import Redis from 'ioredis';

/**
 * Controller expose 2 probe cho Kubernetes:
 *   - /health/live       — liveness: chỉ check app còn phản hồi (EN: is app alive)
 *   - /health/ready      — readiness: check cả app + dependencies (EN: is app ready to serve)
 *
 * (EN: Controller exposing 2 K8s probes — liveness and readiness.)
 *
 * Khác biệt quan trọng (EN: key distinction):
 *   - Liveness FAIL → K8s KILL container (restart)
 *   - Readiness FAIL → K8s chỉ bỏ pod khỏi load balancer, không restart
 *
 * Readiness probe KHÔNG nên fail khi dependency chết nhẹ,
 * vì restart không giải quyết được — chỉ cần tạm ngưng nhận traffic.
 */
@Controller('health')
export class HealthController {
  private readonly redis: Redis;

  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    // Kết nối async — không block startup (EN: connect async, don't block startup)
    void this.redis.connect().catch(() => {});
  }

  /**
   * GET /health/live — liveness probe
   * (EN: GET /health/live — liveness probe)
   *
   * Chỉ return 200 — nghĩa là event loop còn sống. Nếu K8s không nhận được
   * response → container bị kill và restart.
   */
  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  /**
   * GET /health/ready — readiness probe
   * (EN: GET /health/ready — readiness probe)
   *
   * Check dependency thật (Redis). Nếu Redis chết → app vẫn sống nhưng
   * trả "not ready" → K8s rút pod khỏi Service, client không bị lỗi.
   */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.checkRedis()]);
  }

  /**
   * Custom health indicator cho Redis
   * (EN: Custom health indicator for Redis)
   */
  private async checkRedis(): Promise<HealthIndicatorResult> {
    // API Terminus 11: sinh session rồi up/down (EN: Terminus 11 API)
    const indicator = this.indicator.check('redis');
    try {
      // Ping Redis, timeout implicit (EN: ping Redis, implicit timeout)
      const pong = await this.redis.ping();
      if (pong !== 'PONG') throw new Error('unexpected response');
      return indicator.up();
    } catch (err) {
      return indicator.down({ error: (err as Error).message });
    }
  }
}
