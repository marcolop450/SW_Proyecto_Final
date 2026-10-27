import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitarUsuarioDto } from './dto/invitar-usuario.dto';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorOrganizacion(organizationId: string) {
    const membresias = await this.prisma.usuarioOrganizacion.findMany({
      where: { organizacionId: organizationId },
      include: {
        usuario: {
          select: {
            id: true,
            correo: true,
            nombre: true,
            apellido: true,
            fotoUrl: true,
            activo: true,
            creadoEn: true,
          },
        },
        departamento: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { fechaIngreso: 'desc' },
    });

    return membresias.map((m) => ({
      id: m.usuario.id,
      correo: m.usuario.correo,
      nombre: m.usuario.nombre,
      apellido: m.usuario.apellido,
      fotoUrl: m.usuario.fotoUrl,
      activo: m.usuario.activo,
      rol: m.rol,
      departamento: m.departamento ? m.departamento.nombre : 'Sin asignar',
      departamentoId: m.departamentoId,
      fechaIngreso: m.fechaIngreso,
    }));
  }

  async invitarUsuario(organizationId: string, dto: InvitarUsuarioDto) {
    const correoNormalizado = dto.correo.trim().toLowerCase();

    // Comprobar si ya existe membresía en esta organización
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { correo: correoNormalizado },
      include: {
        membresias: {
          where: { organizacionId: organizationId },
        },
      },
    });

    if (usuarioExistente && usuarioExistente.membresias.length > 0) {
      throw new ConflictException({
        errorCode: 'ERR_USER_ALREADY_IN_ORG',
        message: 'Este usuario ya es miembro activo de tu organización.',
      });
    }

    let usuarioId = usuarioExistente?.id;

    if (!usuarioId) {
      const claveProvisoria = await bcrypt.hash('Temporal123!', 12);
      const nuevoUsuario = await this.prisma.usuario.create({
        data: {
          correo: correoNormalizado,
          claveHash: claveProvisoria,
          nombre: dto.nombre,
          apellido: dto.apellido,
        },
      });
      usuarioId = nuevoUsuario.id;
    }

    return this.prisma.usuarioOrganizacion.create({
      data: {
        usuarioId,
        organizacionId: organizationId,
        departamentoId: dto.departamentoId || null,
        rol: dto.rol,
      },
      include: {
        usuario: true,
        departamento: true,
      },
    });
  }

  async cambiarRol(organizationId: string, usuarioId: string, nuevoRol: Rol) {
    const membresia = await this.prisma.usuarioOrganizacion.findUnique({
      where: {
        usuarioId_organizacionId: {
          usuarioId,
          organizacionId: organizationId,
        },
      },
    });

    if (!membresia) {
      throw new NotFoundException({
        errorCode: 'ERR_USER_NOT_FOUND',
        message: 'El usuario no pertenece a tu organización.',
      });
    }

    return this.prisma.usuarioOrganizacion.update({
      where: {
        usuarioId_organizacionId: {
          usuarioId,
          organizacionId: organizationId,
        },
      },
      data: { rol: nuevoRol },
    });
  }
}
