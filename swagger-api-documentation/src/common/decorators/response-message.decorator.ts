import { SetMetadata } from '@nestjs/common';

/**
 * Key định danh cho Metadata message.
 * (EN: Metadata key for response message.)
 */
export const RESPONSE_MESSAGE = 'response_message';

/**
 * ResponseMessage — Decorator dùng để tùy chỉnh thông điệp (message) trả về trong Unified Response.
 * (EN: ResponseMessage — Decorator to customize the 'message' field in the Unified Response.)
 *
 * @param message - Nội dung thông báo (EN: message content)
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);
