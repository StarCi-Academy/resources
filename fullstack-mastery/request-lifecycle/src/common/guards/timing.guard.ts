import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * TimingGuard — Guard ghi nhận thời điểm request đi vào phase Guard và luôn cho phép đi qua.
 * Mục đích: minh họa vị trí của Guard trong lifecycle và cách Guard đọc context của request.
 * (EN: Guard that records the timestamp when a request enters the Guard phase, always allows through.
 * Purpose: illustrates the Guard's position in the lifecycle and how it reads the request context.)
 *
 * Guard vs Interceptor:
 *   - Guard chạy SAU middleware, TRƯỚC interceptor
 *   - Guard quyết định request có được phép tiếp tục không (return true/false)
 *   - Interceptor bao quanh toàn bộ handler — có thể can thiệp cả request lẫn response
 * (EN: Guard vs Interceptor:
 *   - Guard runs AFTER middleware, BEFORE interceptor
 *   - Guard decides whether the request is allowed to proceed (return true/false)
 *   - Interceptor wraps the entire handler — can intercept both request and response)
 *
 * @side-effects Ghi timestamp vào request header 'x-guard-entry-time'
 *               (EN: writes timestamp to request header 'x-guard-entry-time')
 */
@Injectable()
export class TimingGuard implements CanActivate {
  private readonly logger = new Logger(TimingGuard.name);

  /**
   * Kiểm tra và ghi nhận thời điểm request đến Guard — luôn trả về true (allow all).
   * (EN: Checks and records the timestamp when request reaches Guard — always returns true (allow all).)
   *
   * @param context - ExecutionContext chứa thông tin request hiện tại (EN: ExecutionContext holding current request info)
   * @returns boolean | Promise<boolean> | Observable<boolean> — true để cho phép đi tiếp (EN: true to allow through)
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Lấy HTTP request từ execution context — guard có thể dùng context này để đọc headers, user, v.v.
    // (EN: Extract HTTP request from execution context — guard can use this to read headers, user, etc.)
    const request = context.switchToHttp().getRequest<Request>();

    // Ghi nhận thời điểm request đến Guard bằng high-resolution timer
    // (EN: Record the timestamp when request reaches Guard using high-resolution timer)
    const guardEntryTime = Date.now();

    // Gắn timestamp vào header để ExecutionTimerInterceptor có thể tính duration sau khi handler chạy xong
    // (EN: Attach timestamp to header so ExecutionTimerInterceptor can calculate duration after handler completes)
    request.headers['x-guard-entry-time'] = String(guardEntryTime);

    // Lấy tên handler và class để log context cụ thể — không log chung chung
    // (EN: Get handler and class name to log specific context — avoid generic logging)
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    this.logger.log(`⏱️  [Guard] ${className}.${handlerName}() — entry at ${new Date(guardEntryTime).toISOString()}`);

    // Luôn trả về true — guard này chỉ có mục đích logging, không block request
    // (EN: Always return true — this guard is for logging only, it does not block requests)
    return true;
  }
}
