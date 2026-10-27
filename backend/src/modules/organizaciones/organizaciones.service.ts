import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerMiOrganizacion(organizationId: string) {
    const org = await this.prisma.organizacion.findUnique({
      where: { id: organizationId },
      include: {
        departamentos: true,
        suscripciones: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        _count: {
          select: { membresias: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException({
        errorCode: 'ERR_ORG_NOT_FOUND',
        message: 'La organización solicitada no existe o no se encuentra activa.',
      });
    }

    return org;
  }

  async listarDepartamentos(organizationId: string) {
    return this.prisma.departamento.findMany({
      where: { organizacionId: organizationId },
      include: {
        _count: { select: { membresias: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async listarTodas() {
    return this.prisma.organizacion.findMany({
      include: {
        departamentos: true,
        suscripciones: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        _count: {
          select: { membresias: true },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async crearDepartamento(organizationId: string, nombre: string, descripcion?: string) {
    return this.prisma.departamento.create({
      data: {
        nombre,
        descripcion,
        organizacionId: organizationId,
      },
    });
  }
}
