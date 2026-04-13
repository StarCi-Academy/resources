import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from './';

/**
 * UserController — Endpoint dành cho mọi người dùng đã đăng nhập.
 * (EN: UserController — Endpoints for all logged-in users.)
 */
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {

  /**
   * Truy cập Profile cá nhân.
   * (EN: Access personal profile.)
   */
  @Get('profile')
  @Roles(Role.USER, Role.ADMIN) // Cả 2 role đều vào được (EN: Both roles allowed)
  getProfile(@Req() req: any) {
    return {
      message: 'Đây là dữ liệu cá nhân của bạn.',
      user: req.user,
    };
  }
}
