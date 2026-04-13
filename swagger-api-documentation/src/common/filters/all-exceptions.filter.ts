import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * AllExceptionsFilter — Bộ lọc hứng mọi lỗi phát sinh trong ứng dụng.
 * (EN: AllExceptionsFilter — Global exception filter for all types of errors.)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Xác định quy mô lỗi (EN: Determine error scale)
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Trích xuất thông điệp chi tiết (EN: Extract detailed message)
    // Ưu tiên exception.message hoặc phản hồi từ NestJS (EN: Prioritize exception.message or NestJS response)
    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const message =
      (exceptionResponse as any)?.message ||
      (exception as any)?.message ||
      'Internal Server Error';

    // 3. Log cho hệ thống cứu hộ (EN: Log for disaster recovery)
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Msg: ${message}`,
      (exception as any)?.stack,
    );

    // 4. Trả về cấu trúc JSON đồng bộ (EN: Return synchronized JSON structure)
    response.status(status).json({
      statusCode: status,
      error: isHttpException ? (exception as any).name : 'Internal Server Error',
      message: message, // Đảm bảo trả về error.message (EN: Ensure return error.message)
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
