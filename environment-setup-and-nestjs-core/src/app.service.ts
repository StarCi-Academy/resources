import { Injectable } from '@nestjs/common';

/**
 * AppService — Service gốc của ứng dụng, đăng ký tại AppModule.
 * Được giữ lại từ NestJS scaffold mặc định — dùng để minh họa root provider.
 * (EN: Root application service registered in AppModule.
 * Kept from the default NestJS scaffold — used to demonstrate a root-level provider.)
 */
@Injectable()
export class AppService {
  /**
   * Trả về chuỗi chào mừng cơ bản.
   * (EN: Returns a basic greeting string.)
   *
   * @returns string — Chuỗi "Hello World!" mặc định (EN: default "Hello World!" string)
   */
  getHello(): string {
    // Trả về string tĩnh — không có side effect, không call DB hay service nào
    // (EN: Return a static string — no side effects, no DB or service calls)
    return 'Hello World!';
  }
}
