import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { obtenerSecretoJwt } from '../jwt-config';

export interface JwtPayload {
  sub: string;
  correo: string;
  rol: string;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: obtenerSecretoJwt(configService),
    });
  }

  async validate(payload: JwtPayload) {
    const membresia = payload.sub && payload.organizationId
      ? await this.prisma.usuarioOrganizacion.findFirst({
          where: {
            usuarioId: payload.sub,
            organizacionId: payload.organizationId,
            usuario: { activo: true },
            organizacion: { activo: true },
          },
          include: { usuario: true, organizacion: true, departamento: true },
        })
      : null;

    if (!membresia) {
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_SESSION',
        message: 'La sesión no es válida. Por favor inicia sesión nuevamente.',
      });
    }

    const { usuario, organizacion, departamento } = membresia;
    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fotoUrl: usuario.fotoUrl,
      rol: membresia.rol,
      organizationId: membresia.organizacionId,
      organizationName: organizacion.nombre,
      departamentoId: membresia.departamentoId,
      departamentoNombre: departamento?.nombre ?? null,
    };
  }
}
