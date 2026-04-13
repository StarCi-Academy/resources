import { SetMetadata } from '@nestjs/common';

/**
 * Key định danh cho Metadata message. (EN: Metadata key for response message.)
 */
export const RESPONSE_MESSAGE = 'response_message';

/**
 * ResponseMessage — Decorator dùng để tùy chỉnh thông điệp thành công.
 * (EN: ResponseMessage — Decorator to customize success messages.)
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
