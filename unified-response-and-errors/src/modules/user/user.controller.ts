import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ResponseMessage } from '../../common';

/**
 * UsersController — Demo luồng phản hồi Thống nhất.
 * (EN: UsersController — Demos unified response flow.)
 */
@Controller('users')
export class UsersController {
  
  @Get()
  @ResponseMessage('Lấy danh sách thành công (EN: Get all success)')
  findAll() {
    return [{ id: 1, name: 'John Doe' }];
  }

  @Post()
  @ResponseMessage('Tạo mới thành công (EN: Create success)')
  create(@Body() body: any) {
    if (!body.name) {
      // [execute] Ném lỗi giả định để test Exception Filter
      // (EN: Throw dummy error to test Exception Filter)
      throw new BadRequestException('Tên không được để trống (EN: Name is required)');
    }
    return { ...body, id: Date.now() };
  }
}
