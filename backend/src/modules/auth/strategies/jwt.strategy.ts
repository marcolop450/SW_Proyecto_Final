import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  correo: string;
  rol: string;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'ergocheck-ai-secure-jwt-secret-key-2026-uagrm'),
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        membresias: {
          include: {
            organizacion: true,
            departamento: true,
          },
        },
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_SESSION',
        message: 'La sesión no es válida o el usuario ha sido deshabilitado.',
      });
    }

    const membresiaActiva =
      usuario.membresias.find((m) => m.organizacionId === payload.organizationId) ||
      usuario.membresias[0];

    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fotoUrl: usuario.fotoUrl,
      rol: membresiaActiva?.rol || 'EMPLEADO',
      organizationId: membresiaActiva?.organizacionId || '',
      organizationName: membresiaActiva?.organizacion?.nombre || 'Organización',
      departamentoId: membresiaActiva?.departamentoId || null,
      departamentoNombre: membresiaActiva?.departamento?.nombre || null,
    };
  }
}
