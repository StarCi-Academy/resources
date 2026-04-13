import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user';

/**
 * AuthModule — Đóng gói logic xác thực với kết nối Database User.
 * (EN: AuthModule — Encapsulates authentication logic with User database connection.)
 */
@Module({
  imports: [
    UserModule, // Import để lấy User Repository (EN: Import to get User Repository)
    PassportModule,
    JwtModule.register({
      secret: 'STARCI_SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
