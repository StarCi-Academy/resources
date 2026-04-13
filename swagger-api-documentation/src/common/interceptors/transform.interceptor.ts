import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';

/**
 * ResponseShape — Định nghĩa cấu trúc trả về thống nhất cho mọi API.
 * (EN: ResponseShape — Defines a unified response structure for all APIs.)
 */
export interface ResponseShape<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * TransformInterceptor — Interceptor bọc mọi kết quả trả về vào một cấu trúc JSON duy nhất.
 * Đọc Metadata từ @ResponseMessage để tùy chỉnh thông báo thành công.
 * (EN: TransformInterceptor — Interceptor that wraps every result into a single JSON structure.
 * Reads Metadata from @ResponseMessage to customize success messages.)
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseShape<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseShape<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    // Đọc message từ metadata của handler (EN: Read message from handler metadata)
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Success';

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message, // Sử dụng message đã được tùy chỉnh (EN: Use customized message)
        data: data || null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
