import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy, RtStrategy } from '../../common/strategies';
import { UserModule } from '../user';

/**
 * AuthModule — Module xác thực tích hợp các chiến lược AT/RT.
 * (EN: AuthModule — Auth module integrating AT/RT strategies.)
 */
@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
