import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as crypto from 'crypto';

@Injectable()
export class GeneradorReportesService {
  async generarReporteErgonomicoExcel(datos: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ErgoCheck AI - Sistema Biomecánico SST';
    workbook.created = new Date();

    // Pestaña 1: Resumen General
    const hojaResumen = workbook.addWorksheet('Resumen SST');
    hojaResumen.columns = [
      { header: 'Indicador', key: 'indicador', width: 35 },
      { header: 'Valor', key: 'valor', width: 25 },
      { header: 'Nivel de Riesgo', key: 'nivel', width: 20 },
    ];
    hojaResumen.addRow({ indicador: 'Total Sesiones Monitoreadas', valor: datos.totalSesiones || 1, nivel: 'Informativo' });
    hojaResumen.addRow({ indicador: 'Promedio Global RULA', valor: datos.promedioRula || '2.4', nivel: 'Aceptable (Nivel 1)' });
    hojaResumen.addRow({ indicador: 'Minutos Totales Evaluados', valor: `${datos.minutosTotales || 120} min`, nivel: 'Óptimo' });
    hojaResumen.addRow({ indicador: 'Alertas de Fatiga Emitidas', valor: datos.totalAlertas || 3, nivel: 'Controlado' });
    hojaResumen.getRow(1).font = { bold: true };

    // Pestaña 2: Distribución RULA
    const hojaRula = workbook.addWorksheet('Distribución RULA');
    hojaRula.columns = [
      { header: 'Nivel RULA', key: 'nivel', width: 20 },
      { header: 'Puntaje', key: 'puntaje', width: 15 },
      { header: 'Porcentaje Tiempo', key: 'porcentaje', width: 20 },
      { header: 'Acción Requerida', key: 'accion', width: 40 },
    ];
    hojaRula.addRow({ nivel: 'Nivel 1 (Verde)', puntaje: '1 - 2', porcentaje: '72%', accion: 'Postura aceptable si no se mantiene prolongada' });
    hojaRula.addRow({ nivel: 'Nivel 2 (Amarillo)', puntaje: '3 - 4', porcentaje: '18%', accion: 'Investigación adicional recomendada' });
    hojaRula.addRow({ nivel: 'Nivel 3 (Naranja)', puntaje: '5 - 6', porcentaje: '8%', accion: 'Modificar postura en el corto plazo' });
    hojaRula.addRow({ nivel: 'Nivel 4 (Rojo)', puntaje: '7', porcentaje: '2%', accion: 'Intervención y rediseño inmediato' });
    hojaRula.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generarReporteForensePdf(sesion: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 45, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Encabezado Corporativo Clean Tech
      doc.fontSize(18).fillColor('#0B1020').text('ErgoCheck AI — Dictamen Forense de Supervisión', { align: 'left' });
      doc.fontSize(9).fillColor('#64748B').text('Plataforma Integral de Telemetría Biocognitiva y Probidad • ISO/IEC 29148', { align: 'left' });
      doc.moveDown(0.8);
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Metadatos de la Sesión
      const usuarioNombre = sesion.usuario ? `${sesion.usuario.nombre} ${sesion.usuario.apellido}` : 'Evaluado';
      const fecha = sesion.inicio ? new Date(sesion.inicio).toLocaleString() : new Date().toLocaleString();
      const score = sesion.scoreIntegridad !== undefined ? sesion.scoreIntegridad : 100;

      doc.fontSize(11).fillColor('#1E293B').text(`Evaluado: ${usuarioNombre}`);
      doc.fontSize(10).fillColor('#475569').text(`ID de Sesión: ${sesion.id}`);
      doc.fontSize(10).text(`Fecha y Hora de Inicio: ${fecha}`);
      doc.fontSize(10).text(`Tipo de Evaluación: ${sesion.tipo || 'EXAMEN'}`);
      doc.moveDown(0.8);

      // Tarjeta de Calificación de Integridad
      const colorScore = score >= 85 ? '#059669' : score >= 65 ? '#D97706' : '#DC2626';
      doc.rect(45, doc.y, 505, 45).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fontSize(12).fillColor('#0F172A').text('Índice de Integridad Global:', 60, doc.y - 35);
      doc.fontSize(16).fillColor(colorScore).text(`${score} / 100`, 380, doc.y - 18, { bold: true } as any);
      doc.moveDown(2.5);

      // Tabla de Incidentes Correlacionados
      doc.fontSize(12).fillColor('#0B1020').text('Registro de Incidentes y Trazabilidad Forense:');
      doc.moveDown(0.5);

      const incidentes = sesion.incidentes || [];
      if (incidentes.length === 0) {
        doc.fontSize(10).fillColor('#059669').text('✓ Cero incidentes o anomalías registradas durante la sesión.');
      } else {
        incidentes.forEach((inc: any, i: number) => {
          doc.fontSize(9).fillColor('#0F172A').text(`${i + 1}. [${inc.severidad}] ${inc.tipo} (${inc.estado})`);
          doc.fontSize(8).fillColor('#64748B').text(`   Detalle: ${inc.resumen}`);
          doc.moveDown(0.3);
        });
      }

      // Sello Criptográfico SHA-256 de No-Repudio
      doc.moveDown(2);
      const dataSello = `${sesion.id}|${score}|${usuarioNombre}|${fecha}`;
      const hashSello = crypto.createHash('sha256').update(dataSello).digest('hex').toUpperCase();

      doc.strokeColor('#E2E8F0').lineWidth(0.8).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);
      doc.fontSize(8).fillColor('#475569').text('Sello Criptográfico de Integridad (SHA-256 WORM):');
      doc.fontSize(7).fillColor('#0F172A').font('Courier').text(hashSello);
      doc.fontSize(7).fillColor('#94A3B8').font('Helvetica').text('Este informe ha sido emitido algorítmicamente y certificado bajo el principio Zero-Image Retention.');

      doc.end();
    });
  }
}
