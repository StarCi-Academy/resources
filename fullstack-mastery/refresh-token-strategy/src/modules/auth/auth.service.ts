import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user';

/**
 * AuthService — Xử lý chiến lược Refresh Token Rotation.
 * (EN: AuthService — Handles Refresh Token Rotation strategy.)
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
   *
   * @param dto - Thông tin đăng ký (EN: signup data)
   * @returns Promise<any> - Cặp token AT và RT (EN: AT and RT token pair)
   */
  async signUp(dto: any) {
    // [prepare] Mã băm mật khẩu bảo mật (EN: Securely hash password)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // [execute] Tạo và lưu user vào database (EN: Create and save user to database)
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // [confirm] Trả về cặp token đầu tiên (EN: Return first token pair)
    return this.getTokens(user.id, user.email);
  }

  /**
   * Đăng nhập và cấp cặp Token.
   * (EN: Sign in and issue token pair.)
   *
   * @param dto - Thông tin đăng nhập (EN: signin data)
   * @returns Promise<any> - Cặp token AT và RT (EN: AT and RT token pair)
   */
  async signIn(dto: any) {
    // [prepare] Tìm user và kiểm tra mật khẩu (EN: Find user and check password)
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Access Denied');
    }

    // [execute] Sinh cặp token mới và lưu hash RT (EN: Generate tokens and save RT hash)
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    
    // [confirm] Trả về kết quả (EN: Return result)
    this.logger.log({ message: 'User logged in', userId: user.id });
    return tokens;
  }

  /**
   * Đăng xuất - Thu hồi Token (Revocation).
   * (EN: Logout — Revoke token.)
   *
   * @param userId - ID người dùng (EN: user id)
   */
  async logout(userId: string) {
    // [execute] Xóa hash trong DB để vô hiệu hóa RT (EN: Nullify hash in DB to invalidate RT)
    await this.userRepository.update(userId, { refreshTokenHash: null });
    this.logger.log({ message: 'User logged out', userId });
  }

  /**
   * Cấp lại Access Token + Xoay vòng Refresh Token (Rotation).
   * (EN: Refresh AT + Rotate RT.)
   *
   * @param userId - ID người dùng (EN: user id)
   * @param rt - Refresh Token hiện tại (EN: current RT)
   * @returns Promise<any> - Cặp token MỚI (EN: NEW token pair)
   */
  async refreshTokens(userId: string, rt: string) {
    // [prepare] Kiểm tra user và token hash tồn tại (EN: Check user and token hash exists)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) throw new ForbiddenException('Access Denied');

    // [execute] So khớp mã băm và sinh cặp token mới (EN: Compare hashes and generate new tokens)
    const rtMatches = await bcrypt.compare(rt, user.refreshTokenHash);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    // [confirm] Trả về cặp token xoay vòng (EN: Return rotated token pair)
    return tokens;
  }

  /**
   * Cập nhật Hash của Refresh Token vào Database.
   * (EN: Updates Refresh Token Hash in Database.)
   *
   * @param userId - ID người dùng (EN: user id)
   * @param rt - Refresh Token thô (EN: raw RT)
   */
  async updateRtHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }

  /**
   * Sinh cặp token AT (15ph) và RT (7ngày).
   * (EN: Generates AT (15m) and RT (7d) pair.)
   *
   * @param userId - ID người dùng (EN: user id)
   * @param email - Email người dùng (EN: user email)
   */
  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'AT_SECRET', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'RT_SECRET', expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
