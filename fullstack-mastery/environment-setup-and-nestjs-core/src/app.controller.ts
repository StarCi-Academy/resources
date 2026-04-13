import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController — Controller gốc của ứng dụng.
 * Xử lý route mặc định tại root path "/".
 * Không chứa logic — chỉ ủy thác cho AppService.
 * (EN: Root application controller. Handles the default route at path "/".
 * Contains no logic — only delegates to AppService.)
 */
@Controller()
export class AppController {
  // NestJS inject AppService tự động qua IoC Container
  // (EN: NestJS auto-injects AppService via the IoC Container)
  constructor(private readonly appService: AppService) {}

  /**
   * GET / — Endpoint chào mừng mặc định của ứng dụng.
   * (EN: GET / — Default application welcome endpoint.)
   *
   * @returns string — Chuỗi chào mừng từ AppService (EN: greeting string from AppService)
   */
  @Get()
  getHello(): string {
    // Ủy thác cho AppService — controller không tự xử lý business logic
    // (EN: Delegate to AppService — controller does not handle business logic itself)
    return this.appService.getHello();
  }
}
