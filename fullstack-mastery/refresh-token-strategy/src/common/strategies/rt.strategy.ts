import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

/**
 * RtStrategy — Chiến lược xác thực Refresh Token (dài hạn).
 * (EN: RtStrategy — Refresh Token authentication strategy (long-lived).)
 */
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'RT_SECRET',
      passReqToCallback: true, // Cho phép lấy lại raw token từ request (EN: Allow raw token extraction)
    });
  }

  validate(req: Request, payload: any) {
    // [prepare] Trích xuất raw token từ header Authorization (EN: Extract raw token)
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();

    // Trả về cả payload và token để so sánh với DB (EN: Return payload and token for DB comparison)
    return {
      ...payload,
      refreshToken,
    };
  }
}
