import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

/**
 * AuthController — Cung cấp các endpoint điều hướng Google OAuth2.
 * (EN: AuthController — Provides Google OAuth2 navigation endpoints.)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * GET /auth/google — Khởi chạy quá trình đăng nhập (Redirect tới Google).
   * (EN: GET /auth/google — Initiates login. Redirects to Google.)
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // NestJS/Passport sẽ tự động chuyển hướng người dùng sang trang Login của Google
    // (EN: NestJS/Passport automatically redirects user to Google Login page)
  }

  /**
   * GET /auth/google/callback — Google gửi mã xác thực về endpoint này.
   * (EN: GET /auth/google/callback — Google sends auth code back here.)
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: any) {
    // passport-google-oauth20 sẽ trích xuất profile và gán vào req.user
    // (EN: profile is extracted and assigned to req.user)
    return this.authService.googleLogin(req.user);
  }
}
