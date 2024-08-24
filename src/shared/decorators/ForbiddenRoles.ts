import { SetMetadata } from '@nestjs/common';

export const FORBIDDEN_ROLES = 'FORBIDDEN_ROLES';

export enum Roles {
  admin = 'admin',
  customer = 'customer',
}

export const ForbiddenRoles = (...forbiddenRoles: Roles[]) =>
  SetMetadata(FORBIDDEN_ROLES, forbiddenRoles);
