import { Controller, Get, Param } from '@nestjs/common';
import { CatService } from './cat.service';

/**
 * CatController — Controller xử lý các HTTP request cho domain Cat.
 * Không chứa business logic — chỉ nhận request, gọi service, trả response.
 * (EN: Controller handling HTTP requests for the Cat domain.
 * Contains NO business logic — only receives requests, calls service, returns response.)
 *
 * Anti-pattern bị cấm: KHÔNG viết logic trực tiếp trong controller!
 * (EN: Forbidden anti-pattern: DO NOT write business logic directly in the controller!)
 */
@Controller('cats')
export class CatController {
  // NestJS inject CatService tự động qua constructor — không dùng "new"
  // (EN: NestJS auto-injects CatService via constructor — no "new" keyword)
  constructor(private readonly catService: CatService) {}

  /**
   * GET /cats — Lời giới thiệu của mèo.
   * (EN: GET /cats — Cat self-introduction.)
   *
   * @returns string — Chuỗi giới thiệu (EN: introduction string)
   */
  @Get()
  introduce(): string {
    // Ủy thác hoàn toàn cho service — controller chỉ là cổng vào
    // (EN: Fully delegate to service — controller is just the entry gate)
    return this.catService.introduce();
  }

  /**
   * GET /cats/status — Báo cáo trạng thái đầy đủ, kích hoạt toàn bộ DI chain.
   * (EN: GET /cats/status — Full status report, exercises the entire DI chain.)
   *
   * @returns string — Báo cáo nhiều dòng (EN: multi-line status report)
   */
  @Get('status')
  getStatus(): string {
    // Gọi getCatStatus — request này sẽ đi qua CatService → CatHealthService → CatFoodService
    // (EN: Call getCatStatus — this request traverses CatService → CatHealthService → CatFoodService)
    return this.catService.getCatStatus();
  }

  /**
   * GET /cats/feed/:food — Cho mèo ăn loại thức ăn được chỉ định.
   * (EN: GET /cats/feed/:food — Feed the cat the specified food.)
   *
   * @param food - Tên thức ăn lấy từ route param (EN: food name from route param)
   * @returns string — Kết quả cho ăn (EN: feeding result)
   */
  @Get('feed/:food')
  feed(@Param('food') food: string): string {
    // Chuyển param từ URL xuống service — không xử lý gì thêm ở đây
    // (EN: Pass URL param down to service — no additional processing at this layer)
    return this.catService.feedCat(food);
  }
}
