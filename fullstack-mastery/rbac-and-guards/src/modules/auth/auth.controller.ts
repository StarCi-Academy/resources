import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * AuthController — Cung cấp các Endpoint đăng ký/đăng nhập kèm Role.
 * (EN: AuthController — Provides sign-up/sign-in endpoints with Role.)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() body: any) {
    // Body nên bao gồm { email, password, role } (EN: Body should include email, password, role)
    return this.authService.signUp(body);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() body: any) {
    return this.authService.signIn(body);
  }
}
