import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * RequestIdMiddleware — Middleware gắn một UUID duy nhất vào mỗi HTTP request.
 * Chạy TRƯỚC guard, interceptor, pipe — đảm bảo mọi layer sau đều có thể đọc requestId.
 * (EN: Attaches a unique UUID to every HTTP request.
 * Runs BEFORE guards, interceptors, and pipes — ensures every downstream layer can read requestId.)
 *
 * Usecase thực tế: distributed tracing, correlate logs across services, debug cụ thể 1 request.
 * (EN: Real-world usecase: distributed tracing, cross-service log correlation, per-request debugging.)
 *
 * @side-effects Mutate req.headers bằng cách thêm 'x-request-id' (EN: mutates req.headers by adding 'x-request-id')
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * Gắn requestId vào header của request rồi chuyển tiếp.
   * (EN: Attaches requestId to the request header then forwards.)
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Hàm chuyển tiếp (EN: forwarding function)
   * @returns void
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Dùng header có sẵn nếu client truyền vào (ví dụ API Gateway forward), ngược lại tự sinh mới
    // (EN: Use existing header if client sends one (e.g. API Gateway forwarding), otherwise generate a new one)
    const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();

    // Gắn vào header để các layer sau (interceptor, controller) đọc được qua req.headers
    // (EN: Attach to header so downstream layers (interceptor, controller) can read it via req.headers)
    req.headers['x-request-id'] = requestId;

    // Gắn vào response header để client biết requestId của request mình gửi — hữu ích khi debug
    // (EN: Attach to response header so client knows the requestId of their request — useful for debugging)
    res.setHeader('x-request-id', requestId);

    // Chuyển tiếp — middleware không block, chỉ enrich thêm metadata
    // (EN: Forward — this middleware does not block, it only enriches metadata)
    next();
  }
}
