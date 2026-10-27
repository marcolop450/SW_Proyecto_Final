import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.rol) {
      throw new ForbiddenException({
        errorCode: 'ERR_ACCESS_DENIED',
        message: 'No posees un rol asignado para acceder a este recurso.',
      });
    }

    const hasRole = requiredRoles.includes(user.rol as Rol);
    if (!hasRole) {
      throw new ForbiddenException({
        errorCode: 'ERR_INSUFFICIENT_ROLE',
        message: `Acceso restringido. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}.`,
      });
    }

    return true;
  }
}
