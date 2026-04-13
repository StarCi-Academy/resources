import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * AtStrategy — Chiến lược xác thực Access Token (ngắn hạn).
 * (EN: AtStrategy — Access Token authentication strategy (short-lived).)
 */
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'AT_SECRET',
    });
  }

  validate(payload: any) {
    // Trả về payload đã giải mã (EN: Return decoded payload)
    return payload;
  }
}
