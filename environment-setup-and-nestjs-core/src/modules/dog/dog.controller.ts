import { Controller, Get, Param } from '@nestjs/common';
import { DogService } from './dog.service';

/**
 * DogController — Controller xử lý các HTTP request cho domain Dog.
 * Không chứa business logic — chỉ nhận request, chuyển cho DogService, trả response.
 * (EN: Controller handling HTTP requests for the Dog domain.
 * Contains NO business logic — only receives requests, delegates to DogService, returns response.)
 */
@Controller('dogs')
export class DogController {
  // NestJS inject DogService tự động — không dùng "new"
  // (EN: NestJS auto-injects DogService — no "new" keyword)
  constructor(private readonly dogService: DogService) {}

  /**
   * GET /dogs — Lời giới thiệu của chó.
   * (EN: GET /dogs — Dog self-introduction.)
   *
   * @returns string — Chuỗi giới thiệu (EN: introduction string)
   */
  @Get()
  introduce(): string {
    // Ủy thác hoàn toàn cho service — controller không tự xử lý
    // (EN: Fully delegate to service — controller does not handle logic itself)
    return this.dogService.introduce();
  }

  /**
   * GET /dogs/spy — Chó nghe lén mèo qua cross-module CatService.
   * (EN: GET /dogs/spy — Dog spies on cat via cross-module CatService.)
   *
   * @returns string — Câu trích dẫn lời mèo (EN: quoted cat message)
   */
  @Get('spy')
  spyOnCat(): string {
    // Gọi spyOnCat — request này đi qua DogService → CatService (cross-module)
    // (EN: Call spyOnCat — this request goes through DogService → CatService (cross-module))
    return this.dogService.spyOnCat();
  }

  /**
   * GET /dogs/steal/:food — Chó cố cướp thức ăn của mèo.
   * (EN: GET /dogs/steal/:food — Dog tries to steal the cat's food.)
   *
   * @param food - Loại thức ăn lấy từ route param (EN: food name from route param)
   * @returns string — Kết quả sau thách thức (EN: challenge result)
   */
  @Get('steal/:food')
  stealFood(@Param('food') food: string): string {
    // Chuyển param từ URL xuống service — không xử lý gì thêm ở đây
    // (EN: Pass URL param down to service — no additional processing at this layer)
    return this.dogService.challengeCat(food);
  }
}
