import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AtGuard, RtGuard } from '../../common/guards';

/**
 * AuthController — Endpoint luồng Refresh Token.
 * (EN: AuthController — Refresh Token flow endpoints.)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: any) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: any) {
    return this.authService.signIn(dto);
  }

  /**
   * Đăng xuất - Thu hồi token.
   * (EN: Logout - Revoke token.)
   */
  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }

  /**
   * Cấp lại token - Xoay vòng Refresh Token.
   * (EN: Refresh token - RT Rotation.)
   */
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
