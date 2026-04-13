import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user';

/**
 * AuthService — Xử lý logic trao đổi OAuth2 Token và quản lý người dùng.
 * (EN: AuthService — Handles OAuth2 Token swap logic and user management.)
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Xử lý thông tin người dùng từ Google và sinh JWT nội bộ.
   * (EN: Processes user info from Google and generates internal JWT.)
   *
   * @param reqUser - Dữ liệu người dùng từ Google Strategy (EN: User data from Google Strategy)
   * @returns Promise<any> - Access token của hệ thống (EN: System access token)
   */
  async googleLogin(reqUser: any) {
    if (!reqUser) {
      throw new InternalServerErrorException('Không có dữ liệu từ Google (EN: No user from google)');
    }

    // [prepare] Kiểm tra xem user đã tồn tại trong DB chưa (EN: Check user existence)
    let user = await this.userRepository.findOne({ where: { email: reqUser.email } });

    // [execute] Nếu chưa có, tự động đăng ký mới (Silent Register)
    // (EN: If not exists, perform silent registration)
    if (!user) {
      user = this.userRepository.create({
        email: reqUser.email,
        firstName: reqUser.firstName,
        lastName: reqUser.lastName,
        picture: reqUser.picture,
        isOAuthUser: true,
      });
      await this.userRepository.save(user);
    }

    // [confirm] Sinh JWT nội bộ để xác thực các request sau này
    // (EN: Generate internal JWT for future authenticated requests)
    const payload = { sub: user.id, email: user.email };
    return {
      message: 'Đăng nhập Google thành công! (EN: Google login success!)',
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
