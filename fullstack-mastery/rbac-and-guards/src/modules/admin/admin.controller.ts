import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '../user';

/**
 * AdminController — Chỉ dành cho quyền Quản trị viên (ADMIN).
 * (EN: AdminController — Reserved for Admin role.)
 */
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  
  /**
   * Truy cập Dashboard quản trị.
   * (EN: Access admin dashboard.)
   */
  @Get('dashboard')
  @Roles(Role.ADMIN) // Chỉ Admin được phép (EN: Only Admin allowed)
  getDashboard() {
    return {
      message: 'Chào mừng Admin vào khu vực mật! (EN: Welcome Admin to secret area!)',
      stats: { users: 100, orders: 15 },
    };
  }
}
