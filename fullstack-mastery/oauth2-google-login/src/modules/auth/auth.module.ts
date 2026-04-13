import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from '../../common/strategies/google.strategy';
import { UserModule } from '../user';

/**
 * AuthModule — Đóng gói logic Google OAuth2.
 * (EN: AuthModule — Encapsulates Google OAuth2 logic.)
 */
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'INTERNAL_JWT_SECRET',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule { }
