import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { Workbook } from 'exceljs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const BITACORA = '/api/supervision/bitacora';

interface Cuenta {
  token: string;
  usuario: { organizationId: string };
}

describe('Aislamiento de la bitácora por organización', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  const http = () => request(app.getHttpServer());
  const auth = (cuenta: Cuenta) => ({ Authorization: `Bearer ${cuenta.token}` });
  const crearAdmin = async (sufijo: string): Promise<Cuenta> => {
    const { body } = await http().post('/api/auth/registro').send({
      nombre: 'Admin',
      apellido: 'QA',
      clave: 'AuditQA123!',
      correo: `bitacora-${sufijo}@example.com`,
      organizacionNombre: `Bitacora QA ${sufijo}`,
    }).expect(201);
    return body;
  };

  it('limita lecturas, estadísticas, integridad y archivos a la organización autenticada', async () => {
    const adminA = await crearAdmin(randomUUID());
    const adminB = await crearAdmin(randomUUID());
    const idA = adminA.usuario.organizationId;
    const idB = adminB.usuario.organizationId;
    const marcaA = `audit-a-${randomUUID()}`;
    const marcaB = `audit-b-${randomUUID()}`;
    const marcaHistorica = `audit-legacy-${randomUUID()}`;
    const sinAmbito = `audit-global-${randomUUID()}`;

    await http().post('/api/consentimiento/firmar').set(auth(adminA)).send({ version: marcaA }).expect(201);
    await http().post('/api/consentimiento/firmar').set(auth(adminB)).send({ version: marcaB }).expect(201);
    await prisma.auditLog.createMany({ data: [
      { action: marcaHistorica, entity: 'Usuario', details: { organizacionId: idA } },
      { action: sinAmbito, entity: 'Sistema' },
    ] });

    const { body: listadoA } = await http().get(BITACORA).set(auth(adminA))
      .query({ organizationId: idB }).expect(200);
    expect(listadoA.total).toBe(2);
    expect(listadoA.registros).toEqual(expect.arrayContaining([
      expect.objectContaining({ details: { version: marcaA, organizacionId: idA, type: expect.anything(), acceptedAt: expect.anything() } }),
      expect.objectContaining({ action: marcaHistorica, prevHash: null }),
    ]));
    expect(listadoA.registros.every(registro => registro.prevHash === null)).toBe(true);
    expect(JSON.stringify(listadoA)).not.toContain(marcaB);
    expect(JSON.stringify(listadoA)).not.toContain(sinAmbito);

    const { body: listadoB } = await http().get(BITACORA).set(auth(adminB)).expect(200);
    expect(listadoB.total).toBe(1);
    expect(listadoB.registros[0].details).toMatchObject({ version: marcaB, organizacionId: idB });
    expect(JSON.stringify(listadoB)).not.toContain(marcaA);
    expect(JSON.stringify(listadoB)).not.toContain(marcaHistorica);

    await http().get(`${BITACORA}/estadisticas`).set(auth(adminA)).expect(200)
      .expect(({ body }) => expect(body.totalRegistros).toBe(2));
    await http().get(`${BITACORA}/estadisticas`).set(auth(adminB)).expect(200)
      .expect(({ body }) => expect(body.totalRegistros).toBe(1));
    await http().get(`${BITACORA}/verificar`).set(auth(adminA)).expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ valida: true, totalRegistros: 1 }));

    const { body: json } = await http().get(`${BITACORA}/exportar-json`).set(auth(adminA)).expect(200);
    expect(json.metadata.alcance).toBe('ORGANIZACION');
    expect(JSON.stringify(json.registros)).toContain(marcaA);
    expect(JSON.stringify(json.registros)).not.toContain(marcaB);
    expect(JSON.stringify(json.registros)).not.toContain(sinAmbito);

    const csv = await http().get(`${BITACORA}/exportar`).set(auth(adminA)).expect(200);
    expect(csv.text).toContain(marcaHistorica);
    expect(csv.text).not.toContain(sinAmbito);
    expect(csv.text).not.toContain(listadoB.registros[0].id);

    const excel = await http().get(`${BITACORA}/exportar-excel`).set(auth(adminA)).expect(200)
      .buffer(true).parse((response, callback) => {
        const partes: Buffer[] = [];
        response.on('data', parte => partes.push(parte));
        response.on('end', () => callback(null, Buffer.concat(partes)));
        response.on('error', callback);
      });
    const libro = new Workbook();
    await libro.xlsx.load(excel.body);
    const celdas = JSON.stringify(libro.getWorksheet(1)!.getSheetValues());
    expect(celdas).toContain(marcaA);
    expect(celdas).toContain(marcaHistorica);
    expect(celdas).not.toContain(marcaB);
    expect(celdas).not.toContain(sinAmbito);

    const { body: global } = await http().post('/api/auth/login')
      .send({ correo: 'manuela@gmail.com', clave: '12345' }).expect(200);
    const { body: historico } = await http().get(BITACORA).set(auth(global))
      .query({ busqueda: sinAmbito }).expect(200);
    expect(historico.total).toBe(1);
    expect(historico.registros[0].action).toBe(sinAmbito);
    const { body: globalB } = await http().get(BITACORA).set(auth(global))
      .query({ busqueda: listadoB.registros[0].hash }).expect(200);
    expect(globalB.total).toBe(1);
    expect(globalB.registros[0].prevHash).toBeTruthy();
  }, 30000);
});
