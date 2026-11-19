import * as PDFDocument from 'pdfkit';

export function generarComprobanteJornada(sesion: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'A4', info: { Title: 'Comprobante de jornada', Author: 'ErgoCheck AI' } });
    const bloques: Buffer[] = [];
    doc.on('data', (bloque: Buffer) => bloques.push(bloque));
    doc.on('end', () => resolve(Buffer.concat(bloques))); doc.on('error', reject);
    const fecha = (valor: Date) => new Date(valor).toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
    const tiempo = (valor: number) => { const seg = Math.max(0, valor || 0); return `${Math.floor(seg / 3600)} h ${Math.floor((seg % 3600) / 60)} min ${seg % 60} s`; };
    const linea = (nombre: string, valor: string) => { doc.font('Helvetica-Bold').fontSize(10).fillColor('#334155').text(`${nombre}: `, { continued: true }).font('Helvetica').fillColor('#0f172a').text(valor); doc.moveDown(.3); };
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#065f46').text('Comprobante de jornada');
    doc.moveDown(.3).font('Helvetica').fontSize(10).fillColor('#64748b').text('Registro generado a partir de los datos guardados en ErgoCheck AI.'); doc.moveDown();
    linea('Persona', `${sesion.usuario.nombre} ${sesion.usuario.apellido}`); linea('Organización', sesion.organizacion.nombre);
    linea('Ingreso (hora de La Paz)', fecha(sesion.inicio)); linea('Salida (hora de La Paz)', fecha(sesion.fin));
    linea('Actividad en la página', tiempo(sesion.tiempoActivoSeg)); linea('Inactividad en la página', tiempo(sesion.tiempoOciosoSeg)); linea('Descansos acumulados', tiempo(sesion.tiempoFueraSeg));
    const meta = sesion.eventosConducta.find((e: any) => e.tipo === 'JORNADA_CONFIGURACION')?.detalles?.metaHoras;
    if (meta) linea('Meta configurada', `${meta} horas`);
    const pausas = sesion.eventosConducta.filter((e: any) => e.tipo === 'PAUSA_DESCANSO');
    doc.moveDown().font('Helvetica-Bold').fontSize(12).fillColor('#065f46').text('Descansos registrados'); doc.moveDown(.5);
    if (!pausas.length) doc.font('Helvetica').fontSize(10).fillColor('#475569').text('No hay descansos registrados.');
    pausas.forEach((p: any) => { const inicio = p.detalles?.inicio ? fecha(p.detalles.inicio) : fecha(p.timestamp); doc.font('Helvetica').fontSize(10).fillColor('#334155').text(`${inicio} · ${p.detalles?.titulo || 'Descanso'} · ${tiempo(Math.floor((p.duracionMs || 0) / 1000))}`); });
    const nota = sesion.eventosConducta.find((e: any) => e.tipo === 'JORNADA_NOTAS')?.detalles?.nota;
    if (nota) { doc.moveDown().font('Helvetica-Bold').fontSize(12).fillColor('#065f46').text('Nota del día'); doc.moveDown(.4).font('Helvetica').fontSize(10).fillColor('#334155').text(nota); }
    doc.moveDown().font('Helvetica').fontSize(9).fillColor('#64748b').text('Los tiempos de actividad describen el uso de la página y son aproximados. Este documento refleja registros del sistema y no certifica por sí solo asistencia o productividad.');
    doc.end();
  });
}
