import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * JwtStrategy — Định nghĩa cách Passport verify và giải mã JWT.
 * (EN: JwtStrategy — Defines how Passport verifies and decodes JWT.)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ header Authorization: Bearer <token>
      // (EN: Extract token from Authorization header)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Không cho phép token hết hạn (EN: Do not ignore expiration)
      ignoreExpiration: false,
      
      // Secret key dùng để verify chữ ký (EN: Secret key for signature verification)
      secretOrKey: 'STARCI_SECRET_KEY', 
    });
  }

  /**
   * Hàm validate được gọi sau khi chữ ký đã được verify thành công.
   * Dữ liệu trả về sẽ được gán vào request.user.
   * (EN: validate method called after successful signature verification. 
   * Returned data is assigned to request.user.)
   *
   * @param payload - Dữ liệu đã giải mã từ JWT (EN: Decoded JWT payload)
   */
  async validate(payload: any) {
    // Trả về dữ liệu tối thiểu cần thiết trong request (EN: Return minimal required data)
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
