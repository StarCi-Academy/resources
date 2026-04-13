import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * JwtStrategy — Xác thực Token và trích xuất thông tin User kèm Role.
 * (EN: JwtStrategy — Authenticates Token and extracts User info with Role.)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'STARCI_SECRET',
    });
  }

  async validate(payload: any) {
    // [confirm] Gán role vào request.user để RolesGuard kiểm soát
    // (EN: Assign role to request.user for RolesGuard to control)
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
