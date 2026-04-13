import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * ExecutionTimerInterceptor — Interceptor đo thời gian thực thi của handler.
 * Đọc timestamp được gắn bởi TimingGuard, tính duration và log kết quả.
 * (EN: Measures the execution time of a handler.
 * Reads the timestamp set by TimingGuard, calculates duration, and logs the result.)
 *
 * Usecase thực tế: performance monitoring, SLA tracking, phát hiện handler chậm.
 * (EN: Real-world usecase: performance monitoring, SLA tracking, detecting slow handlers.)
 *
 * Vị trí trong lifecycle: SAU Guard, BAO QUANH handler + pipe.
 * (EN: Position in lifecycle: AFTER Guard, WRAPS handler + pipe.)
 *
 * @side-effects Ghi log duration sau khi handler trả về (EN: logs duration after handler returns)
 */
@Injectable()
export class ExecutionTimerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExecutionTimerInterceptor.name);

  /**
   * Bao quanh handler để đo thời gian thực thi từ lúc interceptor tiếp nhận đến khi response hoàn tất.
   * (EN: Wraps the handler to measure execution time from interceptor entry to response completion.)
   *
   * @param context - ExecutionContext chứa thông tin request (EN: ExecutionContext holding request info)
   * @param next - CallHandler để tiếp tục xử lý về phía handler (EN: CallHandler to proceed toward the handler)
   * @returns Observable — stream của response (EN: response stream)
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Lấy request để đọc timestamp được gắn bởi TimingGuard
    // (EN: Get request to read the timestamp set by TimingGuard)
    const request = context.switchToHttp().getRequest<Request>();

    // Dùng timestamp từ Guard nếu có — để đo toàn bộ thời gian từ Guard đến response
    // Nếu không có (Guard bị bỏ qua), fallback về thời điểm interceptor chạy
    // (EN: Use Guard timestamp if available — measures total time from Guard to response
    // If missing (Guard was skipped), fallback to interceptor entry time)
    const guardEntryTime = request.headers['x-guard-entry-time']
      ? Number(request.headers['x-guard-entry-time'])
      : Date.now();

    // Lấy tên handler để log context cụ thể
    // (EN: Get handler name for specific context logging)
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    // Dùng tap() để thực hiện side-effect (log) mà không thay đổi giá trị trong stream
    // (EN: Use tap() to perform side-effects (logging) without modifying the stream value)
    return next.handle().pipe(
      tap(() => {
        // Tính duration sau khi handler và pipe đã hoàn tất
        // (EN: Calculate duration after handler and pipe have completed)
        const duration = Date.now() - guardEntryTime;

        this.logger.log(`⚡ [Timer] ${className}.${handlerName}() — ${duration}ms`);
      }),
    );
  }
}
