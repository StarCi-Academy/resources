import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller xử lý HTTP request — điều hướng đến service
 * (EN: Controller handling HTTP requests — routes to service)
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint kiểm tra sức khỏe kết nối MySQL + Redis
   * (EN: Health check endpoint for MySQL + Redis connections)
   *
   * @returns Promise<object> - Trạng thái hệ thống (EN: system status)
   */
  @Get('health')
  async health() {
    return this.appService.healthCheck();
  }

  /**
   * Endpoint lấy danh sách items (có cache Redis)
   * (EN: Endpoint to get items list — Redis cached)
   *
   * @returns Promise<Item[]> - Danh sách item (EN: list of items)
   */
  @Get('items')
  async getItems() {
    return this.appService.getItems();
  }

  /**
   * Endpoint tạo item mới
   * (EN: Endpoint to create a new item)
   *
   * @param body.name - Tên item (EN: item name)
   * @returns Promise<Item> - Item vừa tạo (EN: the created item)
   */
  @Post('items')
  async createItem(@Body() body: { name: string }) {
    return this.appService.createItem(body.name);
  }
}
