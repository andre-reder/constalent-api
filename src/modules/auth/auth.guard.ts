import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { env } from 'src/shared/config/env';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/IsPublic';
import { IS_SPECIFIC_TOKEN_KEY } from 'src/shared/decorators/IsSpecificAuthorizationToken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) {
      return true;
    }

    const specificAuthorizationToken = this.reflector.getAllAndOverride<string>(
      IS_SPECIFIC_TOKEN_KEY,
      [context.getClass(), context.getHandler()],
    );

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!!specificAuthorizationToken && specificAuthorizationToken === token) {
      return true;
    } else if (
      !!specificAuthorizationToken &&
      specificAuthorizationToken !== token
    ) {
      throw new UnauthorizedException();
    }

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.jwtSecret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['userId'] = payload.sub;
      request['userRole'] = payload.role;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
