import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsentGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.id) {
      throw new ForbiddenException({
        errorCode: 'ERR_AUTH_REQUIRED',
        message: 'Usuario no autenticado para verificar consentimiento.',
      });
    }

    const consent = await this.prisma.legalConsent.findFirst({
      where: {
        userId: user.id,
        type: 'CAMERA_AND_BIOMETRICS',
        isAccepted: true,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!consent) {
      throw new ForbiddenException({
        errorCode: 'ERR_CONSENT_REQUIRED',
        message: 'Se requiere consentimiento informado vigente antes de acceder a la cámara o telemetría.',
      });
    }

    return true;
  }
}
