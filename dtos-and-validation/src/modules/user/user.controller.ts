import { Controller, Post, Get, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * UsersController — Endpoint trình diễn sức mạnh của DTO & Validation.
 * (EN: UsersController — Endpoints demonstrating the power of DTO & Validation.)
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users — Tạo user mới với sự bảo vệ của DTO.
   * Nếu body không khớp với CreateUserDto, NestJS sẽ trả về 400 Bad Request ngay lập tức.
   * (EN: POST /users — Create user protected by DTO.
   * If the body doesn't match CreateUserDto, NestJS returns 400 Bad Request instantly.)
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // Controller nhận được data đã "sạch" và đúng kiểu dữ liệu
    // (EN: Controller receives "clean" and correctly typed data)
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users — Lấy danh sách users.
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
