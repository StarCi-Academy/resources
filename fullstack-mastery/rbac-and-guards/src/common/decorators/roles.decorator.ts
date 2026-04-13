import { SetMetadata } from '@nestjs/common';
import { Role } from '../../modules/user/role.enum';

/**
 * Key định danh cho metadata Roles.
 * (EN: Metadata key for Roles.)
 */
export const ROLES_KEY = 'roles';

/**
 * Roles — Decorator dùng để chỉ định các nhóm quyền được phép truy cập endpoint.
 * (EN: Roles — Decorator to specify which role groups are allowed to access the endpoint.)
 *
 * @param roles - Danh sách các Role được phép (EN: List of allowed Roles)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
