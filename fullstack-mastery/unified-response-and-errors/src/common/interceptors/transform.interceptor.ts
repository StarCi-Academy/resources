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
 * ResponseShape — Cấu trúc trả về chuẩn. (EN: Standard response shape.)
 */
export interface ResponseShape<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * TransformInterceptor — Ép mọi response về một định dạng JSON duy nhất.
 * (EN: TransformInterceptor — Enforces a single JSON format for all responses.)
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

    // Đọc message từ decorator @ResponseMessage (EN: Read message from @ResponseMessage)
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
        context.getHandler(),
        context.getClass(),
      ]) || 'Success';

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message,
        data: data || null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
