import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/**
 * ParsePositiveIntPipe — Pipe validate và transform route param thành số nguyên dương.
 * Chạy SAU Guard, TRƯỚC khi giá trị param được truyền vào handler.
 * (EN: Validates and transforms a route param into a positive integer.
 * Runs AFTER Guard, BEFORE the param value is passed into the handler.)
 *
 * Usecase: đảm bảo client không truyền id âm, 0, hoặc chuỗi không hợp lệ vào.
 * (EN: Usecase: ensures client cannot pass negative ids, 0, or invalid strings.)
 *
 * Ném BadRequestException nếu không hợp lệ — NestJS tự map thành HTTP 400.
 * (EN: Throws BadRequestException if invalid — NestJS automatically maps to HTTP 400.)
 */
@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  /**
   * Validate và convert giá trị string từ route param thành số nguyên dương.
   * (EN: Validates and converts a string value from a route param into a positive integer.)
   *
   * @param value - Giá trị thô từ route param (EN: raw value from route param)
   * @param metadata - Metadata mô tả param (tên, loại) (EN: metadata describing the param (name, type))
   * @returns number — Số nguyên dương đã được validate (EN: validated positive integer)
   * @throws BadRequestException nếu giá trị không hợp lệ (EN: if the value is invalid)
   */
  transform(value: string, metadata: ArgumentMetadata): number {
    // Parse string thành integer — parseInt trả về NaN nếu chuỗi không phải số
    // (EN: Parse string to integer — parseInt returns NaN if the string is not a number)
    const parsed = parseInt(value, 10);

    // Kiểm tra có phải số hợp lệ hay không — NaN check trước để tránh NaN > 0 trả về false
    // (EN: Check if it is a valid number — NaN check first to avoid NaN > 0 returning false)
    if (isNaN(parsed)) {
      throw new BadRequestException(
        `Validation failed for param '${metadata.data}': '${value}' is not a number`,
      );
    }

    // Kiểm tra tính dương — 0 và số âm đều bị reject vì id phải bắt đầu từ 1
    // (EN: Check positivity — 0 and negatives are rejected because ids must start from 1)
    if (parsed <= 0) {
      throw new BadRequestException(
        `Validation failed for param '${metadata.data}': ${parsed} must be a positive integer (> 0)`,
      );
    }

    return parsed;
  }
}
