import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ContextoAuditoria } from '../../../common/auditoria/contexto-auditoria.module';
import { HASH_GENESIS, comprobarCadena } from './integridad-bitacora';
import { construirExcelBitacora } from './excel-bitacora.builder';
import { construirCsvBitacora } from './csv-bitacora.builder';
import { FiltrosBitacora, filtroBitacora, limitarReferencias } from './filtros-bitacora';

export type { FiltrosBitacora } from './filtros-bitacora';

@Injectable()
export class BitacoraInmutableService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contexto: ContextoAuditoria,
  ) {}

  private organizacionVisible(): string | null {
    const usuario = this.contexto.usuario();
    if (usuario?.rol === Rol.SUPER_ADMINISTRADOR) return null;
    if (usuario?.rol === Rol.ADMIN_ORGANIZACION && usuario.organizationId) {
      return usuario.organizationId;
    }
    throw new ForbiddenException('No tienes acceso a la bitácora.');
  }

  async registrar(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    categoria?: string;
    ipAddress?: string;
    details?: Record<string, unknown>;
  }) {
    const ultimoRegistro = await this.prisma.auditLog.findFirst({
      where: { hash: { not: null } },
      orderBy: { timestamp: 'desc' },
      select: { hash: true },
    });

    const prevHash = ultimoRegistro?.hash || HASH_GENESIS;
    const usuario = this.contexto.usuario();
    const detalles = { ...params.details };
    if (usuario?.rol === Rol.SUPER_ADMINISTRADOR && params.entity === 'AuditLog') {
      delete detalles.organizacionId;
    } else if (usuario?.organizationId) {
      detalles.organizacionId = usuario.organizationId;
    }
    const timestamp = new Date();
    const serialized = JSON.stringify(detalles);
    const hash = createHash('sha256').update([
      prevHash, params.userId || 'SISTEMA', params.action, params.entity,
      params.entityId || '', timestamp.toISOString(), serialized,
    ].join('|')).digest('hex');

    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        categoria: params.categoria || 'SEGURIDAD',
        ipAddress: params.ipAddress,
        details: JSON.parse(serialized) as Prisma.InputJsonObject,
        prevHash,
        hash,
        timestamp,
      },
    });
  }

  async consultarRegistros(filtros: FiltrosBitacora = {}) {
    const { limit = 50, offset = 0 } = filtros;
    const organizacionId = this.organizacionVisible();
    const where = filtroBitacora(organizacionId, filtros);
    const [total, registros] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
        include: {
          usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
        },
      }),
    ]);
    return { total, registros: limitarReferencias(registros, organizacionId), limit, offset };
  }

  async verificarIntegridadCadena() {
    const inicio = Date.now();
    const organizacionId = this.organizacionVisible();
    const bloques = this.prisma.auditLog.findMany({
      where: { hash: { not: null } },
      orderBy: { timestamp: 'asc' },
      select: { id: true, hash: true, prevHash: true },
    });

    if (organizacionId === null) {
      return comprobarCadena(await bloques, null, inicio);
    }

    const [cadena, propios] = await this.prisma.$transaction([
      bloques,
      this.prisma.auditLog.findMany({
        where: { ...filtroBitacora(organizacionId), hash: { not: null } },
        select: { id: true },
      }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });

    return comprobarCadena(cadena, new Set(propios.map(registro => registro.id)), inicio);
  }

  async obtenerEstadisticas() {
    const where = filtroBitacora(this.organizacionVisible());
    const [total, porCategoria, ultimo] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({ by: ['categoria'], where, _count: { id: true } }),
      this.prisma.auditLog.findFirst({
        where,
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true, hash: true, action: true },
      }),
    ]);

    return {
      totalRegistros: total,
      porCategoria: porCategoria.map(categoria => ({ categoria: categoria.categoria, count: categoria._count.id })),
      ultimoEvento: ultimo,
    };
  }

  async exportarExcel(categoria?: string): Promise<Buffer> {
    const organizacionId = this.organizacionVisible();
    const [verificacion, logs] = await Promise.all([
      this.verificarIntegridadCadena(),
      this.prisma.auditLog.findMany({
        where: filtroBitacora(organizacionId, { categoria }),
        orderBy: { timestamp: 'desc' },
        take: 1000,
        include: { usuario: { select: { nombre: true, apellido: true, correo: true } } },
      }),
    ]);
    return construirExcelBitacora(limitarReferencias(logs, organizacionId), categoria, verificacion);
  }

  async exportarCsv(categoria?: string): Promise<string> {
    const organizacionId = this.organizacionVisible();
    const logs = await this.prisma.auditLog.findMany({
      where: filtroBitacora(organizacionId, { categoria }),
      orderBy: { timestamp: 'desc' },
      take: 500,
      include: { usuario: { select: { correo: true } } },
    });
    return construirCsvBitacora(limitarReferencias(logs, organizacionId));
  }

  async exportarJson(categoria?: string) {
    const organizacionId = this.organizacionVisible();
    const [verificacion, logs] = await Promise.all([
      this.verificarIntegridadCadena(),
      this.prisma.auditLog.findMany({
        where: filtroBitacora(organizacionId, { categoria }),
        orderBy: { timestamp: 'desc' },
        take: 500,
        include: { usuario: { select: { id: true, nombre: true, apellido: true, correo: true } } },
      }),
    ]);

    return {
      metadata: {
        sistema: 'ErgoCheck AI — Plataforma SST & Proctoring',
        modulo: 'Bitácora Inmutable WORM (CU26)',
        fechaExportacion: new Date().toISOString(),
        totalRegistrosExportados: logs.length,
        alcance: organizacionId === null ? 'GLOBAL' : 'ORGANIZACION',
        integridadCadena: verificacion.valida ? 'VALIDA_CERTIFICADA' : 'COMPROMETIDA',
        genesisHash: verificacion.genesisHash,
        ultimoHash: verificacion.ultimoHash,
      },
      registros: limitarReferencias(logs, organizacionId),
    };
  }
}
