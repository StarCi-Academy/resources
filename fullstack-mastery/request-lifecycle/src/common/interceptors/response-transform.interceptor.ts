import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Cấu trúc chuẩn của mọi API response sau khi qua ResponseTransformInterceptor.
 * (EN: Standard structure of every API response after passing through ResponseTransformInterceptor.)
 */
export interface StandardResponse<T> {
  // Dữ liệu thực sự trả về từ handler (EN: actual data returned from the handler)
  data: T;
  // Thời điểm server tạo response (EN: timestamp when server generated the response)
  timestamp: string;
  // UUID gắn bởi RequestIdMiddleware — dùng để trace request (EN: UUID attached by RequestIdMiddleware — used to trace the request)
  requestId: string | undefined;
}

/**
 * ResponseTransformInterceptor — Interceptor bọc toàn bộ response vào cấu trúc chuẩn.
 * (EN: Wraps every response into a standardized structure.)
 *
 * Usecase thực tế: đảm bảo mọi API endpoint trả về cùng 1 shape — frontend không cần xử lý đặc biệt.
 * (EN: Real-world usecase: ensures every API endpoint returns the same shape — frontend needs no special handling.)
 *
 * Vị trí trong lifecycle: SAU Guard, BAO QUANH handler — transform OUTPUT của handler.
 * (EN: Position in lifecycle: AFTER Guard, WRAPS handler — transforms the handler OUTPUT.)
 *
 * Trước transform:  { id: 1, name: "Cat" }
 * Sau transform:    { data: { id: 1, name: "Cat" }, timestamp: "...", requestId: "uuid" }
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  /**
   * Bọc toàn bộ response của handler vào cấu trúc StandardResponse.
   * (EN: Wraps the handler's entire response into a StandardResponse structure.)
   *
   * @param context - ExecutionContext để đọc request (EN: ExecutionContext to read the request)
   * @param next - CallHandler để tiếp tục về phía handler (EN: CallHandler to proceed toward the handler)
   * @returns Observable<StandardResponse<T>> — stream với response đã được transform (EN: stream with transformed response)
   */
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>> {
    // Lấy request để đọc requestId được gắn bởi RequestIdMiddleware
    // (EN: Get request to read requestId set by RequestIdMiddleware)
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string | undefined;

    // Dùng map() để transform mọi giá trị emit từ handler vào StandardResponse
    // (EN: Use map() to transform every value emitted by the handler into a StandardResponse)
    return next.handle().pipe(
      map((data: T): StandardResponse<T> => ({
        // Dữ liệu gốc từ handler — không bị thay đổi hay lọc bỏ
        // (EN: Original data from handler — not modified or filtered)
        data,

        // Timestamp server-side theo ISO 8601 — client luôn có thể biết khi nào response được tạo
        // (EN: Server-side ISO 8601 timestamp — client can always know when response was generated)
        timestamp: new Date().toISOString(),

        // requestId để client có thể match log với request cụ thể khi debug
        // (EN: requestId so client can match logs with a specific request when debugging)
        requestId,
      })),
    );
  }
}
