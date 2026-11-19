import type { Prisma } from '@prisma/client';

type RegistroCsv = Prisma.AuditLogGetPayload<{
  include: { usuario: { select: { correo: true } } };
}>;

export function construirCsvBitacora(logs: RegistroCsv[]): string {
  const headers = 'ID,Fecha_ISO,Usuario_Correo,Accion,Entidad,Entidad_ID,Categoria,IP_Address,Hash_SHA256,Hash_Previo\n';
  const rows = logs
    .map((l) => {
      const u = l.usuario?.correo || 'SISTEMA';
      const clean = (val?: string | null) => (val ? `"${val.replace(/"/g, '""')}"` : '""');
      return [
        clean(l.id),
        clean(l.timestamp.toISOString()),
        clean(u),
        clean(l.action),
        clean(l.entity),
        clean(l.entityId),
        clean(l.categoria),
        clean(l.ipAddress),
        clean(l.hash),
        clean(l.prevHash),
      ].join(',');
    })
    .join('\n');

  return headers + rows;
}
