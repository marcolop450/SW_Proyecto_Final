import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Prisma, Rol } from '@prisma/client';

export interface AuthResponse {
  token: string;
  usuario: {
    id: string;
    correo: string;
    nombre: string;
    apellido: string;
    rol: string;
    organizationId: string;
    organizationName: string;
    departamentoId?: string | null;
    departamentoNombre?: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const correoNormalizado = dto.correo.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: correoNormalizado },
      include: {
        membresias: {
          where: { organizacion: { activo: true } },
          orderBy: [{ fechaIngreso: 'asc' }, { id: 'asc' }],
          include: {
            organizacion: true,
            departamento: true,
          },
        },
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.',
      });
    }

    const esClaveValida = await bcrypt.compare(dto.clave, usuario.claveHash);
    if (!esClaveValida) {
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.',
      });
    }

    const membresiaPrincipal = usuario.membresias[0];
    if (!membresiaPrincipal) {
      throw new UnauthorizedException({
        errorCode: 'ERR_INVALID_SESSION',
        message: 'Tu cuenta no tiene una membresía en una organización activa.',
      });
    }

    const { rol, organizacionId: organizationId, organizacion, departamento } = membresiaPrincipal;

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol,
      organizationId,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Inicio de sesión exitoso: ${usuario.correo} [${rol}]`);

    return {
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol,
        organizationId,
        organizationName: organizacion.nombre,
        departamentoId: membresiaPrincipal.departamentoId,
        departamentoNombre: departamento?.nombre ?? null,
      },
    };
  }

  async registrar(dto: RegistroDto): Promise<AuthResponse> {
    const correoNormalizado = dto.correo.trim().toLowerCase();

    const claveHash = await bcrypt.hash(dto.clave, 12);
    const nombreOrg = dto.organizacionNombre?.trim() || `${dto.nombre} Enterprise`;
    const slug = nombreOrg.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const resultado = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          correo: correoNormalizado,
          claveHash,
          nombre: dto.nombre,
          apellido: dto.apellido,
        },
      });

      const organizacion = await tx.organizacion.create({
        data: { nombre: nombreOrg, slug },
      });

      await tx.usuarioOrganizacion.create({
        data: {
          usuarioId: usuario.id,
          organizacionId: organizacion.id,
          rol: Rol.ADMIN_ORGANIZACION,
        },
      });

      return { usuario, organizacion };
    }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const campos = error.meta?.target;
        if (Array.isArray(campos) && campos.includes('slug')) {
          throw new ConflictException({
            errorCode: 'ERR_ORGANIZATION_SLUG_TAKEN',
            message: 'Ya existe una organización con ese nombre. Elige otro nombre o solicita una invitación.',
          });
        }
        if (Array.isArray(campos) && campos.includes('correo')) {
          throw new ConflictException({
            errorCode: 'ERR_DUPLICATE_EMAIL',
            message: 'Ya existe una cuenta registrada con este correo electrónico.',
          });
        }
      }
      throw error;
    });

    const payload = {
      sub: resultado.usuario.id,
      correo: resultado.usuario.correo,
      rol: Rol.ADMIN_ORGANIZACION,
      organizationId: resultado.organizacion.id,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: resultado.usuario.id,
        correo: resultado.usuario.correo,
        nombre: resultado.usuario.nombre,
        apellido: resultado.usuario.apellido,
        rol: Rol.ADMIN_ORGANIZACION,
        organizationId: resultado.organizacion.id,
        organizationName: resultado.organizacion.nombre,
      },
    };
  }
}
