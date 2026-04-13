import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../modules/user';
import { ROLES_KEY } from '../decorators';

/**
 * RolesGuard — Bảo vệ tài nguyên dựa trên hệ thống phân quyền (Authorization).
 * (EN: RolesGuard — Protects resources based on the authorization system.)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Kiểm tra xem user hiện tại có đủ quyền hạn truy cập không.
   * (EN: Checks if the current user has sufficient permissions for access.)
   */
  canActivate(context: ExecutionContext): boolean {
    // [prepare] Trích xuất danh sách role yêu cầu từ metadata (EN: Extract required roles)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không yêu cầu role nào, mặc định cho phép qua (EN: If no roles required, allow access)
    if (!requiredRoles) {
      return true;
    }

    // [execute] Lấy thông tin user từ Request (được gán bởi JwtStrategy)
    // (EN: Get user info from Request (assigned by JwtStrategy))
    const { user } = context.switchToHttp().getRequest();
    
    // So khớp quyền hạn của user với danh sách yêu cầu (EN: Match user role with requirements)
    return requiredRoles.includes(user.role);
  }
}
