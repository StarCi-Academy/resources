import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CatDto } from './cat.dto';
import { ResponseMessage } from '../../common/decorators';

/**
 * CatController — Minh họa cách dùng Swagger Decorators và ResponseMessage.
 * (EN: CatController — Demonstrates usage of Swagger Decorators and ResponseMessage.)
 */
@ApiTags('Cats') // Phân nhóm trong Swagger (EN: Grouping in Swagger)
@Controller('cats')
export class CatController {

  @Get()
  @ResponseMessage('Lấy danh sách mèo thành công (EN: Get all cats success)')
  @ApiOperation({ summary: 'Lấy tất cả mèo' })
  @ApiResponse({ status: 200, description: 'Trả về mảng JSON được bọc bởi Interceptor' })
  findAll() {
    return [{ name: 'Milo', age: 3 }];
  }

  @Post()
  @ResponseMessage('Tạo mèo mới thành công (EN: Create cat success)')
  @ApiOperation({ summary: 'Tạo mèo mới' })
  create(@Body() catDto: CatDto) {
    return { ...catDto, id: 1 };
  }

  @Get('error-demo')
  @ApiOperation({ summary: 'Demo lỗi (Hứng bởi Filters)' })
  triggerError() {
    // [execute] Cố tình ném lỗi để kiểm tra Exception Filter
    // (EN: Deliberately throw error to test Exception Filter)
    throw new BadRequestException('Đây là lỗi giả lập để test Unified Error Response');
  }
}
