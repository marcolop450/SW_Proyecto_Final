import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { gzipSync } from 'node:zlib';
import { request as httpRequest } from 'node:http';
import * as request from 'supertest';
import * as ExcelJS from 'exceljs';
import { ReporteErgonomicoExcelBuilder } from '../src/modules/supervision/services/reporte-ergonomico-excel.builder';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

@Controller()
class ParserSecurityController {
  @Post('entrada')
  entrada(@Body() body: Record<string, unknown>) { return body; }

  @Get('estado')
  estado() { return { disponible: true }; }
}

describe('Compatibilidad de las dependencias corregidas', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [ParserSecurityController] }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.listen(0, '127.0.0.1');
  });

  afterAll(async () => { await app?.close(); });

  function enviarGzip(payload: Buffer): Promise<{ status: number; body: unknown }> {
    return new Promise((resolve, reject) => {
      const req = httpRequest({
        hostname: '127.0.0.1', port: app.getHttpServer().address().port,
        method: 'POST', path: '/entrada', headers: {
          'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'Content-Length': payload.length,
        },
      }, res => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) }); }
          catch (error) { reject(error); }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => req.destroy(new Error('La petición gzip excedió el tiempo de prueba.')));
      req.end(payload);
    });
  }

  it('acepta un cuerpo JSON gzip válido', async () => {
    const payload = gzipSync(JSON.stringify({ valor: 'seguro' }));
    const response = await enviarGzip(payload);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ valor: 'seguro' });
  });

  it('rechaza bytes adicionales tras gzip y conserva la disponibilidad del proceso', async () => {
    const payload = Buffer.concat([gzipSync(JSON.stringify({ valor: 'seguro' })), Buffer.from('contenido-invalido')]);
    const response = await enviarGzip(payload);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ statusCode: 400, errorCode: 'ERR_VALIDATION_FAILED' });
    await request(app.getHttpServer()).get('/estado').expect(200, { disponible: true });
  });

  it('conserva el error 413 al superar el límite del cuerpo de la solicitud', async () => {
    const response = await request(app.getHttpServer()).post('/entrada').send({ valor: 'x'.repeat(200000) });
    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({ statusCode: 413, errorCode: 'ERR_PAYLOAD_TOO_LARGE' });
  });

  it('conserva el error 415 para una codificación de contenido incompatible', async () => {
    const response = await request(app.getHttpServer()).post('/entrada')
      .set('Content-Encoding', 'codificacion-invalida').send({ valor: 'seguro' });
    expect(response.status).toBe(415);
    expect(response.body).toMatchObject({ statusCode: 415, errorCode: 'ERR_UNSUPPORTED_MEDIA_TYPE' });
  });

  it('conserva la generación y lectura de los reportes ergonómicos', async () => {
    const data = await ReporteErgonomicoExcelBuilder.generar({
      evaluado: 'Evaluación QA', promedioRula: 3,
      incluirEventos: true, incluirReferencia: true,
      eventosErgonomicos: [{ timestamp: new Date(), tipo: 'POSTURA_FORZADA', severidad: 'MEDIUM',
        detalles: { rulaScore: 3, cuelloAngulo: 12, troncoAngulo: 8 }, duracionMs: 1000 }],
      formatearFecha: (value: Date) => value.toISOString(),
    });
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(data as unknown as Parameters<typeof book.xlsx.load>[0]);
    expect(book.getWorksheet('Resumen').getCell('B2').value).toBe('Evaluación QA');
    expect(book.getWorksheet('Eventos posturales').getCell('D2').value).toBe(3);
    expect(book.getWorksheet('Referencia RULA').rowCount).toBeGreaterThan(4);
  });

  it('conserva uuid.v4 en el formato condicional extendido de ExcelJS', async () => {
    const book = new ExcelJS.Workbook();
    const sheet = book.addWorksheet('Indicadores');
    sheet.addRows([[2], [5]]);
    sheet.addConditionalFormatting({ ref: 'A1:A2', rules: [{
      type: 'dataBar', priority: 1, gradient: false,
      cfvo: [{ type: 'min' }, { type: 'max' }],
    }] });
    const data = await book.xlsx.writeBuffer();
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(data);
    expect(loaded.getWorksheet('Indicadores').getCell('A1').value).toBe(2);
    const zip = await require('jszip').loadAsync(data);
    const xml = await zip.file('xl/worksheets/sheet1.xml').async('string');
    expect(xml).toContain('x14:cfRule');
    expect(xml).toMatch(/id="\{[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\}"/);
  });
});
