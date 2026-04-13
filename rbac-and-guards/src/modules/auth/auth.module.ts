import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../common/strategies';
import { UserModule } from '../user';

/**
 * AuthModule — Module xác thực tích hợp hệ thống Role.
 * (EN: AuthModule — Auth module integrating Role system.)
 */
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'STARCI_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
