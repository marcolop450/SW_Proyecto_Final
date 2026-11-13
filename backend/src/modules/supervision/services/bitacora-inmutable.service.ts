import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BitacoraInmutableService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    categoria?: string;
    ipAddress?: string;
    details?: any;
  }) {
    // 1. Obtener el último hash de la cadena para encadenamiento WORM
    const ultimoRegistro = await this.prisma.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { hash: true },
    });

    const prevHash = ultimoRegistro?.hash || 'GENESIS_HASH_ERGOCHECK_2026';
    const timestamp = new Date();
    const dataString = `${prevHash}|${params.userId || 'SISTEMA'}|${params.action}|${params.entity}|${params.entityId || ''}|${timestamp.toISOString()}|${JSON.stringify(params.details || {})}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');

    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        categoria: params.categoria || 'SEGURIDAD',
        ipAddress: params.ipAddress,
        details: params.details,
        prevHash,
        hash,
        timestamp,
      },
    });
  }

  async consultarRegistros(categoria?: string, limit = 50) {
    const where = categoria ? { categoria } : {};
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        usuario: { select: { nombre: true, apellido: true, correo: true } },
      },
    });
  }

  async verificarIntegridadCadena(): Promise<{ valida: boolean; totalRegistros: number; errorIndex?: number }> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
    });

    let prevHashCalculado = 'GENESIS_HASH_ERGOCHECK_2026';

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (log.prevHash && log.prevHash !== prevHashCalculado) {
        return { valida: false, totalRegistros: logs.length, errorIndex: i };
      }
      prevHashCalculado = log.hash || '';
    }

    return { valida: true, totalRegistros: logs.length };
  }

  async exportarCsv(): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 200,
    });

    const headers = 'ID,Fecha,Accion,Entidad,EntidadId,Categoria,Hash,PrevHash\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp.toISOString()}","${l.action}","${l.entity}","${l.entityId || ''}","${l.categoria}","${l.hash || ''}","${l.prevHash || ''}"`,
      )
      .join('\n');

    return headers + rows;
  }
}
