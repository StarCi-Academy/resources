import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

/**
 * GoogleStrategy — Chiến lược xác thực OAuth2 với Google.
 * (EN: GoogleStrategy — OAuth2 authentication strategy with Google.)
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      // Client ID và Secret lấy từ Google Cloud Console
      // (EN: Client ID and Secret from Google Cloud Console)
      clientID: 'GOOGLE_CLIENT_ID', // Thực tế nên dùng process.env
      clientSecret: 'GOOGLE_CLIENT_SECRET',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  /**
   * Hàm validate được Google gọi sau khi người dùng đăng nhập thành công.
   * (EN: validate method called by Google after successful user login.)
   *
   * @param accessToken - Token truy cập từ Google (EN: Google access token)
   * @param refreshToken - Token làm mới từ Google (EN: Google refresh token)
   * @param profile - Thông tin profile người dùng (EN: User profile info)
   * @param done - Callback trả về kết quả (EN: Result callback)
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // Trích xuất thông tin cần thiết từ Profile Google (EN: Extract info from Google Profile)
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    
    // Trả về user data cho passport (EN: Return user data to passport)
    done(null, user);
  }
}
