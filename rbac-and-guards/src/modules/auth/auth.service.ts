import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user';

/**
 * AuthService — Quản lý đăng ký/đăng nhập và cấp phát JWT kèm Role.
 * (EN: AuthService — Manages sign-up/sign-in and JSV issuance with Role.)
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký người dùng kèm chỉ định Role.
   * (EN: Sign up user with Role specification.)
   *
   * @param dto - Thông tin đăng ký (EN: signup data)
   * @returns Promise<any> - Token kèm Role (EN: Token with Role)
   */
  async signUp(dto: any) {
    // [prepare] Mã hóa mật khẩu (EN: Hash password)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // [execute] Lưu user mới vào DB (EN: Save new user in DB)
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role, 
    });
    await this.userRepository.save(user);

    // [confirm] Trả về token (EN: Return token)
    return this.generateToken(user);
  }

  /**
   * Đăng nhập và trích xuất Role vào Token.
   * (EN: Sign in and embed Role into Token.)
   *
   * @param dto - Thông tin đăng nhập (EN: signin data)
   * @returns Promise<any> - Token kèm Role (EN: Token with Role)
   */
  async signIn(dto: any) {
    // [prepare] Tìm user và xác minh (EN: Find user and verify)
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // [confirm] Trả về kết quả (EN: Return result)
    return this.generateToken(user);
  }

  /**
   * Sinh JWT Token chứa thông tin Role.
   * (EN: Generates JWT Token containing Role info.)
   *
   * @param user - Thực thể người dùng (EN: User entity)
   */
  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
