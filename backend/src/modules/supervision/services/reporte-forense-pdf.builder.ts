import * as PDFDocument from 'pdfkit';

export class ReporteForensePdfBuilder {
  static generar(sesion: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: 'A4', info: { Title: 'Informe de supervisión', Author: 'ErgoCheck AI' } });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject);
      const fecha = (valor: any) => valor ? new Date(valor).toLocaleString('es-BO', { timeZone: 'America/La_Paz' }) : 'Sin datos';
      const titulo = (texto: string) => { if (doc.y > 700) doc.addPage(); doc.moveDown(0.8).font('Helvetica-Bold').fontSize(12).fillColor('#065f46').text(texto); doc.moveDown(0.35); };
      const linea = (etiqueta: string, valor: any) => { doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text(`${etiqueta}: `, { continued: true }).font('Helvetica').fillColor('#0f172a').text(String(valor ?? 'Sin datos')); };
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a').text('Informe de supervisión');
      doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('Resumen de la sesión y situaciones registradas');
      titulo('Datos de la sesión');
      linea('Persona evaluada', sesion.usuario ? `${sesion.usuario.nombre} ${sesion.usuario.apellido}` : 'Sin datos');
      linea('Correo', sesion.usuario?.correo); linea('Organización', sesion.organizacion?.nombre);
      linea('Examen o actividad', sesion.questionnaire?.titulo || sesion.tipo); linea('Estado', sesion.estado);
      linea('Inicio (hora de La Paz)', fecha(sesion.inicio)); linea('Fin', sesion.fin ? fecha(sesion.fin) : 'En curso');
      linea('Identificador de sesión', sesion.id); linea('Generado', fecha(new Date()));
      titulo('Resumen');
      linea('Índice de integridad del sistema', sesion.scoreIntegridad == null ? 'Sin datos' : `${sesion.scoreIntegridad} / 100`);
      linea('Situaciones registradas', sesion.incidentes?.length ?? 0); linea('Eventos registrados', sesion.eventosConducta?.length ?? 0);
      doc.moveDown(0.4).font('Helvetica').fontSize(9).fillColor('#475569').text('Los eventos son señales para revisión. Su presencia o ausencia no demuestra una falta; la decisión corresponde a una persona responsable.');
      if (sesion.incluirIncidentes) {
        titulo('Situaciones registradas');
        if (!sesion.incidentes?.length) doc.font('Helvetica').fontSize(9).fillColor('#475569').text('No hay situaciones registradas en esta sesión.');
        for (const inc of sesion.incidentes || []) {
          if (doc.y > 690) doc.addPage();
          doc.moveDown(0.4).font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text(String(inc.tipo).replace(/_/g, ' '));
          linea('Fecha', fecha(inc.timestamp)); linea('Severidad', inc.severidad); linea('Estado de revisión', inc.estado);
          linea('Descripción', inc.resumen); if (inc.justificacion) linea('Nota de revisión', inc.justificacion);
          doc.moveDown(0.4).strokeColor('#e2e8f0').moveTo(48, doc.y).lineTo(547, doc.y).stroke();
        }
      }
      if (sesion.incluirEventos) {
        titulo('Eventos registrados');
        if (!sesion.eventosConducta?.length) doc.font('Helvetica').fontSize(9).fillColor('#475569').text('No hay eventos registrados.');
        for (const ev of sesion.eventosConducta || []) {
          if (doc.y > 710) doc.addPage();
          doc.font('Helvetica').fontSize(9).fillColor('#334155').text(`${fecha(ev.timestamp)}  |  ${String(ev.tipo).replace(/_/g, ' ')}  |  ${ev.severidad}`);
        }
      }
      doc.end();
    });
  }
}
