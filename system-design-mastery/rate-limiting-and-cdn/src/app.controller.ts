import { Controller, Get, Header, Post } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

/**
 * Controller demo — 3 endpoint với policy rate limit khác nhau
 * (EN: Demo controller — 3 endpoints with different rate limit policies)
 */
@Controller()
export class AppController {
  /**
   * POST /login — rate limit khắt khe: 3 req / 10s
   * (EN: POST /login — strict rate limit: 3 req / 10s)
   *
   * Dùng ngưỡng riêng cho endpoint nhạy cảm (brute force password)
   * (EN: stricter threshold for sensitive endpoints like login)
   */
  @Throttle({ default: { limit: 3, ttl: 10_000 } })
  @Post('login')
  login() {
    return { ok: true, message: 'login attempted' };
  }

  /**
   * GET /api/data — dùng policy default (5/s, 30/phút)
   * (EN: GET /api/data — uses default policy (5/s, 30/min))
   */
  @Get('api/data')
  apiData() {
    return { data: 'expensive computation', now: new Date().toISOString() };
  }

  /**
   * GET /static/logo.svg — bypass rate limit, cache-friendly
   * (EN: GET /static/logo.svg — bypass rate limit, friendly to CDN cache)
   *
   * Header `Cache-Control` cho phép CDN edge cache 60s
   * (EN: Cache-Control allows CDN edge to cache for 60s)
   */
  @SkipThrottle()
  @Get('static/logo.svg')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 'public, max-age=60')
  staticAsset() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60">
  <rect width="200" height="60" fill="#222"/>
  <text x="10" y="38" fill="#fff" font-family="monospace" font-size="20">CDN DEMO</text>
</svg>`;
  }
}
