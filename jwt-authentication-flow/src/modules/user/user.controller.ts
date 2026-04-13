import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * UserController — Endpoint yêu cầu bảo mật.
 * (EN: UserController — Protected endpoints.)
 */
@Controller('users')
export class UserController {
  
  /**
   * GET /users/profile — Chỉ truy cập được nếu có Token hợp lệ.
   * (EN: GET /users/profile — Accessible only with valid Token.)
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // Trả về thông tin user đã được JwtStrategy giải mã và gán vào request
    // (EN: Returns user info decoded and assigned to request by JwtStrategy)
    return {
      message: 'Bạn đã truy cập vào khu vực bảo mật! (EN: You have accessed a secure area!)',
      user: req.user,
    };
  }
}
