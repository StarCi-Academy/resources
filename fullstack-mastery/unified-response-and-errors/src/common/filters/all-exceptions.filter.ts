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
 * AllExceptionsFilter — Hứng mọi loại lỗi và trả về cấu trúc JSON đồng nhất.
 * (EN: AllExceptionsFilter — Catches all errors and returns unified JSON structure.)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Phân loại lỗi (EN: Determine error type)
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Trích xuất message (EN: Extract message)
    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const message =
      (exceptionResponse as any)?.message ||
      (exception as any)?.message ||
      'Internal Server Error';

    // 3. Log cho kỹ thuật (EN: Log for technical audit)
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Msg: ${message}`,
      (exception as any)?.stack,
    );

    // 4. Trả về JSON (EN: Return JSON)
    response.status(status).json({
      statusCode: status,
      error: isHttpException ? (exception as any).name : 'Internal Error',
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
