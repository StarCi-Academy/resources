import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LoggerMiddleware — Middleware ghi log mọi HTTP request đến server.
 * Chạy TRƯỚC tất cả guard, interceptor, pipe, controller.
 * (EN: Logs every incoming HTTP request. Runs BEFORE all guards, interceptors, pipes, and controllers.)
 *
 * Usecase thực tế: audit trail, debug traffic, monitor endpoint usage.
 * (EN: Real-world usecase: audit trail, traffic debugging, endpoint usage monitoring.)
 *
 * @side-effects Ghi log ra stdout (EN: writes log to stdout)
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /**
   * Xử lý request và ghi log thông tin cơ bản trước khi chuyển tiếp.
   * (EN: Processes the request and logs basic info before forwarding.)
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Hàm chuyển tiếp sang middleware hoặc handler tiếp theo (EN: function to pass to next middleware or handler)
   * @returns void
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Lấy method và url để log — đây là thông tin tối thiểu cần thiết để trace request
    // (EN: Extract method and url for logging — minimum info needed to trace a request)
    const { method, originalUrl, ip } = req;

    // Lắng nghe sự kiện "finish" của response để log status code sau khi xử lý xong
    // (EN: Listen to response "finish" event to log status code after processing completes)
    res.on('finish', () => {
      const { statusCode } = res;

      // Structured log với đầy đủ context: method, url, ip, status
      // (EN: Structured log with full context: method, url, ip, status)
      this.logger.log(`[${method}] ${originalUrl} — ${statusCode} — IP: ${ip}`);
    });

    // Chuyển tiếp sang middleware/handler tiếp theo — KHÔNG gọi next() sẽ làm request bị treo
    // (EN: Forward to next middleware/handler — NOT calling next() will hang the request)
    next();
  }
}
