import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * AuthController — Cung cấp các Endpoint xác thực chính.
 * (EN: AuthController — Provides main authentication endpoints.)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản mới. Trả về Token để đăng nhập ngay.
   * (EN: Sign up a new account. Returns Token for immediate login.)
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() body: any) {
    return this.authService.signUp(body);
  }

  /**
   * Đăng nhập vào hệ thống.
   * (EN: Sign in to the system.)
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() body: any) {
    return this.authService.signIn(body);
  }
}
