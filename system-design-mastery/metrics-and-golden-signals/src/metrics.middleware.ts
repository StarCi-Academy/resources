import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { inFlightRequests, requestDurationMs, requestsTotal } from './golden-signals';

/**
 * Middleware đo 4 Golden Signals cho mọi HTTP request
 * (EN: middleware measuring the 4 Golden Signals on every HTTP request)
 *
 * Side effect: tăng counter in-flight, ghi histogram latency khi response kết thúc
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Bỏ qua chính endpoint /metrics để tránh metrics self-inflation
    // (EN: skip /metrics itself to avoid self-inflating counters)
    if (req.originalUrl === '/metrics') {
      return next();
    }

    // SATURATION: tăng in-flight (EN: increment in-flight)
    inFlightRequests.inc();

    // Ghi mốc bắt đầu để đo latency (EN: capture start for latency)
    const startHrtime = process.hrtime.bigint();

    // Khi response finish → cập nhật metrics (EN: update metrics on finish)
    res.on('finish', () => {
      // Route canonical (EN: canonical route, vd /orders/:id)
      const route = (req.route && req.route.path) || req.baseUrl + req.path || req.path;

      const labels = { route, method: req.method, status: String(res.statusCode) };

      // LATENCY (EN: latency)
      const durationMs = Number(process.hrtime.bigint() - startHrtime) / 1_000_000;
      requestDurationMs.observe(labels, durationMs);

      // TRAFFIC + ERRORS (EN: traffic + errors derived from status)
      requestsTotal.inc(labels);

      // SATURATION: giảm in-flight (EN: decrement in-flight)
      inFlightRequests.dec();
    });

    next();
  }
}
