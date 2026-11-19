import * as ExcelJS from 'exceljs';

export class ReporteErgonomicoExcelBuilder {
  static async generar(datos: any): Promise<Buffer> {
    const libro = new ExcelJS.Workbook();
    libro.creator = 'ErgoCheck AI'; libro.created = new Date();
    const cabecera = (hoja: ExcelJS.Worksheet, columnas: string[]) => {
      const fila = hoja.addRow(columnas); fila.font = { bold: true, color: { argb: 'FFFFFFFF' } }; fila.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }; fila.height = 24;
      hoja.views = [{ state: 'frozen', ySplit: 1 }];
    };
    const resumen = libro.addWorksheet('Resumen');
    resumen.columns = [{ width: 28 }, { width: 60 }];
    cabecera(resumen, ['Información de la sesión', 'Detalle']);
    const filas = [
      ['Persona evaluada', datos.evaluado], ['Correo', datos.correo], ['Organización', datos.organizacion],
      ['Examen o actividad', datos.titulo], ['Estado', datos.estado], ['Identificador', datos.sessionId],
      ['Inicio', datos.inicio], ['Fin', datos.fin || 'En curso'], ['Generado', datos.generado],
      ['Eventos posturales registrados', datos.eventosErgonomicos.length],
      ['Mediciones orientativas de postura', datos.muestrasPostura?.length ?? 0],
      ['Puntuación RULA promedio de eventos', datos.promedioRula == null ? 'Sin datos' : datos.promedioRula],
      ['Índice de bienestar del sistema', datos.scoreBienestar == null ? 'Sin datos' : `${datos.scoreBienestar} / 100`],
      ['Interpretación', 'El promedio se calcula solo con eventos que contienen un valor RULA válido; no representa el tiempo total ni una evaluación clínica.'],
    ];
    filas.forEach((valores, i) => { const r = resumen.addRow(valores); r.getCell(1).font = { bold: true, color: { argb: 'FF334155' } }; if (i % 2 === 0) r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; r.alignment = { vertical: 'middle', wrapText: true }; r.height = i === filas.length - 1 ? 42 : 22; });
    if (datos.incluirEventos) {
      const hoja = libro.addWorksheet('Eventos posturales');
      hoja.columns = [{width: 23}, {width: 25}, {width: 18}, {width: 14}, {width: 18}, {width: 18}, {width: 18}];
      cabecera(hoja, ['Fecha y hora', 'Evento', 'Severidad', 'RULA', 'Cuello (°)', 'Tronco (°)', 'Duración (s)']);
      datos.eventosErgonomicos.forEach((ev: any) => hoja.addRow([datos.formatearFecha(ev.timestamp), ev.tipo, ev.severidad, ev.detalles?.rulaScore ?? 'Sin datos', ev.detalles?.cuelloAngulo ?? 'Sin datos', ev.detalles?.troncoAngulo ?? 'Sin datos', ev.duracionMs == null ? 'Sin datos' : ev.duracionMs / 1000]));
      if (!datos.eventosErgonomicos.length) hoja.addRow(['No hay eventos posturales registrados.']);
      hoja.autoFilter = { from: 'A1', to: 'G1' };
    }
    if (datos.incluirEventos && datos.muestrasPostura?.length) {
      const hoja = libro.addWorksheet('Mediciones de postura');
      hoja.columns = [{width: 24}, {width: 22}, {width: 20}, {width: 20}];
      cabecera(hoja, ['Fecha y hora', 'Indicador estimado / 7', 'Cuello estimado (°)', 'Tronco estimado (°)']);
      datos.muestrasPostura.forEach((ev: any) => hoja.addRow([datos.formatearFecha(ev.timestamp), ev.detalles?.indicadorPostura ?? 'Sin datos', ev.detalles?.cuelloAngulo ?? 'Sin datos', ev.detalles?.troncoAngulo ?? 'Sin datos']));
      hoja.addRow(['Estimaciones orientativas; no constituyen una evaluación RULA completa.']);
    }
    if (datos.incluirReferencia) {
      const hoja = libro.addWorksheet('Referencia RULA'); hoja.columns = [{width: 15}, {width: 80}];
      cabecera(hoja, ['Puntuación', 'Orientación del método RULA']);
      [['1–2', 'Aceptable si no se mantiene ni repite durante periodos prolongados.'], ['3–4', 'Se necesita investigar; podrían requerirse cambios.'], ['5–6', 'Se necesita investigar y realizar cambios pronto.'], ['7', 'Se necesita investigar y realizar cambios de inmediato.']].forEach(r => hoja.addRow(r));
      hoja.addRow(['Fuente', 'https://www.ergo.human.cornell.edu/ErgoPROJECTS/HOffice/rula.htm']);
    }
    return Buffer.from(await libro.xlsx.writeBuffer());
  }
}
