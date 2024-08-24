import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FORBIDDEN_ROLES } from 'src/shared/decorators/ForbiddenRoles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private matchRoles(forbiddenRoles: string[], userRole: string) {
    const isUserRoleForbidden = forbiddenRoles.includes(userRole)
      ? false
      : true;

    return isUserRoleForbidden;
  }

  canActivate(context: ExecutionContext): boolean {
    const forbiddenRoles = this.reflector.get<string[]>(
      FORBIDDEN_ROLES,
      context.getHandler(),
    );
    if (!forbiddenRoles || forbiddenRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole;
    return this.matchRoles(forbiddenRoles, userRole);
  }
}
