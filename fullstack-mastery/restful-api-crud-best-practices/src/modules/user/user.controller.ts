import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';

/**
 * UsersController — Triển khai RESTful API theo Best Practices.
 * Tên resource là danh từ số nhiều: /users.
 * (EN: UsersController — Implements RESTful API according to Best Practices.
 * Resource name is a plural noun: /users.)
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * GET /users — Lấy danh sách tài nguyên.
   * Trả về mã 200 OK mặc định.
   * (EN: GET /users — Retrieve resource list. Returns default 200 OK.)
   */
  @Get()
  findAll(): User[] {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id — Lấy chi tiết một tài nguyên.
   * (EN: GET /users/:id — Retrieve a specific resource.)
   */
  @Get(':id')
  findOne(@Param('id') id: string): User {
    return this.usersService.findOne(id);
  }

  /**
   * POST /users — Tạo tài nguyên mới.
   * Tự động trả về mã 201 Created trong NestJS.
   * (EN: POST /users — Create a new resource. Automatically returns 201 Created in NestJS.)
   */
  @Post()
  create(@Body() payload: Partial<User>): User {
    return this.usersService.create(payload);
  }

  /**
   * PUT /users/:id — Thay thế toàn bộ tài nguyên.
   * Thường trả về 200 OK kèm dữ liệu mới.
   * (EN: PUT /users/:id — Completely replace a resource. Usually returns 200 OK with new data.)
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() payload: Partial<User>): User {
    return this.usersService.update(id, payload);
  }

  /**
   * PATCH /users/:id — Cập nhật một phần tài nguyên.
   * (EN: PATCH /users/:id — Partially update a resource.)
   */
  @Patch(':id')
  partialUpdate(@Param('id') id: string, @Body() payload: Partial<User>): User {
    return this.usersService.update(id, payload);
  }

  /**
   * DELETE /users/:id — Xóa tài nguyên.
   * Trả về mã 204 No Content nếu không có nội dung body.
   * (EN: DELETE /users/:id — Delete a resource. Returns 204 No Content if there's no body response.)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Ép kiểu Status Code về 204
  remove(@Param('id') id: string): void {
    this.usersService.remove(id);
  }
}
