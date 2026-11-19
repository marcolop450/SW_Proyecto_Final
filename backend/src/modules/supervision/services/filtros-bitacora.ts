import type { Prisma } from '@prisma/client';

export interface FiltrosBitacora {
  categoria?: string;
  accion?: string;
  busqueda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  limit?: number;
  offset?: number;
}

const CATEGORIAS_HISTORICAS = new Map([
  ['EVENTOS_TECNICOS', ['EVENTOS_TECNICOS', 'SUPERVISION', 'SISTEMA']],
  ['ACCESOS_DATOS', ['ACCESOS_DATOS', 'SEGURIDAD']],
  ['CAMBIOS_POLITICAS', ['CAMBIOS_POLITICAS', 'LEGAL_COMPLIANCE', 'AUDITORIA', 'CONFIGURACION']],
]);

export function filtroBitacora(
  organizacionId: string | null,
  filtros: FiltrosBitacora = {},
): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = organizacionId === null
    ? {}
    : { details: { path: ['organizacionId'], equals: organizacionId } };
  const { categoria, accion, busqueda, fechaInicio, fechaFin } = filtros;
  if (categoria && categoria !== 'TODAS') {
    const equivalencias = CATEGORIAS_HISTORICAS.get(categoria);
    where.categoria = equivalencias ? { in: equivalencias } : categoria;
  }
  if (accion) where.action = { contains: accion, mode: 'insensitive' };
  if (fechaInicio || fechaFin) {
    const hasta = fechaFin ? new Date(fechaFin) : undefined;
    hasta?.setHours(23, 59, 59, 999);
    where.timestamp = { gte: fechaInicio ? new Date(fechaInicio) : undefined, lte: hasta };
  }
  if (busqueda?.trim()) {
    const coincide = { contains: busqueda.trim(), mode: 'insensitive' as const };
    where.OR = [
      { action: coincide },
      { entity: coincide },
      { entityId: coincide },
      { hash: coincide },
      { usuario: { OR: [{ nombre: coincide }, { apellido: coincide }, { correo: coincide }] } },
    ];
  }
  return where;
}

export function limitarReferencias<T extends { prevHash: string | null }>(
  registros: T[],
  organizacionId: string | null,
): T[] {
  return organizacionId === null
    ? registros
    : registros.map(registro => ({ ...registro, prevHash: null }));
}
