import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — Tấm khiên bảo vệ các endpoint yêu cầu đăng nhập.
 * (EN: JwtAuthGuard — Shield protecting endpoints that require login.)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
