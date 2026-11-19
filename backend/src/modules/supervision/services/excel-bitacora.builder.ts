import type { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

type RegistroExcel = Prisma.AuditLogGetPayload<{
  include: { usuario: { select: { nombre: true; apellido: true; correo: true } } };
}>;

export async function construirExcelBitacora(
  logs: RegistroExcel[],
  categoria: string | undefined,
  verificacion: { valida: boolean },
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ErgoCheck AI - Módulo de Auditoría y Trazabilidad';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Bitácora de Auditoría');

  // Configurar columnas
  ws.columns = [
    { key: 'num', width: 8 },
    { key: 'fecha', width: 22 },
    { key: 'accion', width: 34 },
    { key: 'operador', width: 26 },
    { key: 'correo', width: 30 },
    { key: 'entidad', width: 22 },
    { key: 'entityId', width: 26 },
    { key: 'categoria', width: 22 },
    { key: 'ip', width: 18 },
    { key: 'hash', width: 34 },
    { key: 'prevHash', width: 34 },
    { key: 'detalles', width: 45 },
  ];

  // Título Principal
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'ErgoCheck AI — Bitácora Inmutable de Auditoría y Seguridad';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF065F46' } };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // Subtítulo
  ws.mergeCells('A2:L2');
  const subCell = ws.getCell('A2');
  subCell.value = 'Registro Criptográfico SHA-256 • Modo WORM Inmutable • Trazabilidad y Cumplimiento Normativo SST';
  subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
  subCell.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.getRow(2).height = 18;

  // Resumen de metadatos (Fila 4)
  ws.getRow(4).values = [
    'Fecha:',
    new Date().toLocaleString(),
    'Filtro Categoría:',
    categoria || 'TODAS LAS CATEGORÍAS',
    'Total Registros:',
    logs.length,
    'Cadena SHA-256:',
    verificacion.valida ? '100% ÍNTEGRA Y CERTIFICADA' : 'RUPTURA DETECTADA',
  ];
  ws.getRow(4).font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
  ws.getRow(4).height = 20;

  // Encabezado de la tabla (Fila 6)
  const headerRow = ws.getRow(6);
  headerRow.values = [
    'N°',
    'Fecha y Hora',
    'Acción Realizada',
    'Operador / Usuario',
    'Correo Electrónico',
    'Entidad',
    'ID Entidad',
    'Categoría',
    'Dirección IP',
    'Hash SHA-256 (Bloque)',
    'Hash Previo (WORM)',
    'Detalles / Parámetros',
  ];
  headerRow.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 26;

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // Agregar filas de datos
  logs.forEach((log, index) => {
    const numFila = index + 1;
    const operadorNombre = log.usuario
      ? `${log.usuario.nombre} ${log.usuario.apellido}`
      : 'SISTEMA';
    const operadorCorreo = log.usuario?.correo || 'Proceso Automático';
    const detallesTexto = log.details ? JSON.stringify(log.details) : '—';

    const row = ws.addRow([
      numFila,
      new Date(log.timestamp).toLocaleString(),
      log.action,
      operadorNombre,
      operadorCorreo,
      log.entity,
      log.entityId || 'Global',
      log.categoria,
      log.ipAddress || '127.0.0.1 (Local)',
      log.hash || '—',
      log.prevHash || '—',
      detallesTexto,
    ]);

    row.height = 20;
    row.alignment = { vertical: 'middle' };

    // Estilo por celda
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(3).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(10).font = { name: 'Consolas', size: 8, color: { argb: 'FF047857' } };
    row.getCell(11).font = { name: 'Consolas', size: 8, color: { argb: 'FF64748B' } };
    row.getCell(12).font = { name: 'Consolas', size: 8, color: { argb: 'FF334155' } };

    const isEven = index % 2 === 1;
    row.eachCell((cell, colNumber) => {
      cell.border = borderThin;
      if (isEven && colNumber !== 8) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });

    // Color de categoría
    const catCell = row.getCell(8);
    let catBg = 'FFF1F5F9';
    let catFg = 'FF475569';
    if (log.categoria === 'EVENTOS_TECNICOS') { catBg = 'FFDBEAFE'; catFg = 'FF1D4ED8'; }
    else if (log.categoria === 'ACCESOS_DATOS') { catBg = 'FFE0E7FF'; catFg = 'FF4338CA'; }
    else if (log.categoria === 'CAMBIOS_POLITICAS') { catBg = 'FFF3E8FF'; catFg = 'FF7E22CE'; }
    else if (log.categoria === 'SEGURIDAD') { catBg = 'FFFFE4E6'; catFg = 'FFE11D48'; }
    else if (log.categoria === 'AUDITORIA') { catBg = 'FFFEF3C7'; catFg = 'FFB45309'; }
    else if (log.categoria === 'SUPERVISION') { catBg = 'FFE0F2FE'; catFg = 'FF0369A1'; }
    else if (log.categoria === 'ERGONOMIA') { catBg = 'FFD1FAE5'; catFg = 'FF047857'; }

    catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: catBg } };
    catCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: catFg } };
  });

  // Auto-filtro en la cabecera
  ws.autoFilter = {
    from: 'A6',
    to: `L${6 + logs.length}`,
  };

  // Congelar paneles
  ws.views = [{ state: 'frozen', ySplit: 6 }];

  const uint8Array = await workbook.xlsx.writeBuffer();
  return Buffer.from(uint8Array);
}
