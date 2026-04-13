import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

/**
 * AuthService — Quản lý toàn bộ luồng Đăng ký & Đăng nhập.
 * (EN: AuthService — Manages entire SignUp & SignIn flow.)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký người dùng mới.
   * (EN: Sign up a new user.)
   */
  async signUp(dto: any) {
    // [prepare] Kiểm tra user tồn tại & Hash mật khẩu (EN: Check existence & Hash password)
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại (EN: Email already exists)');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // [execute] Lưu vào database (EN: Save to database)
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // [confirm] Trả về token (EN: Return token)
    this.logger.log({ message: 'User signed up', email: dto.email });
    return this.generateToken(user);
  }

  /**
   * Đăng nhập người dùng hiện có.
   * (EN: Sign in an existing user.)
   */
  async signIn(dto: any) {
    // [prepare] Tìm user & Kiểm tra mật khẩu (EN: Find user & Check password)
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Thông tin không chính xác (EN: Invalid credentials)');
    }

    // [confirm] Trả về token (EN: Return token)
    this.logger.log({ message: 'User signed in', email: dto.email });
    return this.generateToken(user);
  }

  /**
   * Sinh JWT Token từ thông tin User.
   * (EN: Generates JWT Token from User info.)
   */
  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
