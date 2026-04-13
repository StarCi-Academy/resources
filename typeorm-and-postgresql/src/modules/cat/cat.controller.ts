import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CatService } from './cat.service';
import { Cat } from './entities';

/**
 * Cat Controller — Điểm tiếp nhận request cho domain Cat.
 * (EN: Request entry point for the Cat domain.)
 */
@Controller('cats')
export class CatController {
  constructor(private readonly catService: CatService) {}

  /**
   * GET /cats — Lấy toàn bộ danh sách mèo (JOIN).
   * (EN: GET /cats — Get all cats (JOIN).)
   */
  @Get()
  async findAll(): Promise<Cat[]> {
    // Gọi service xử lý logic (EN: call service for logic)
    return await this.catService.findAll();
  }

  /**
   * POST /cats — Tạo mèo mới kèm quan hệ.
   * (EN: POST /cats — Create new cat with relations.)
   */
  @Post()
  async create(@Body() catData: Partial<Cat>): Promise<Cat> {
    // Chuyển dữ liệu xuống service layer (EN: pass data to service layer)
    return await this.catService.create(catData);
  }

  /**
   * GET /cats/:id — Xem chi tiết mèo.
   * (EN: GET /cats/:id — View cat details.)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Cat> {
    // Tìm kiếm mèo theo ID (EN: find cat by ID)
    return await this.catService.findOne(id);
  }
}
