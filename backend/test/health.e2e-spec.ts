import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Salud de la API', () => {
  let app: INestApplication;
  const consultar = jest.fn();
  const prisma = {
    $queryRaw: consultar,
    supervisionSession: { findMany: jest.fn().mockResolvedValue([]) },
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = modulo.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => consultar.mockReset());

  afterAll(async () => {
    await app?.close();
  });

  it('mantiene el contrato de GET /api y comprueba el proceso sin consultar la base', async () => {
    const { body } = await request(app.getHttpServer()).get('/api').expect(200);
    expect(body).toMatchObject({ estado: 'operativo', version: '1.0.0', documentacion: '/api/docs' });

    await request(app.getHttpServer())
      .get('/api/health/live')
      .expect('Cache-Control', 'no-store')
      .expect(200, { estado: 'activo' });
    expect(consultar).not.toHaveBeenCalled();
  });

  it('responde 503 sin filtrar el error de Prisma y recupera la disponibilidad', async () => {
    consultar.mockRejectedValueOnce(new Error('detalle privado de conexión')).mockResolvedValue([]);
    const { body } = await request(app.getHttpServer()).get('/api/health/ready').expect(503);
    expect(body).toMatchObject({ statusCode: 503, errorCode: 'ERR_DATABASE_UNAVAILABLE' });
    expect(body.errorReference).toMatch(/^ERR-[0-9A-F]{8}$/);
    expect(JSON.stringify(body)).not.toContain('detalle privado');

    await request(app.getHttpServer())
      .get('/api/health/ready')
      .expect('Cache-Control', 'no-store')
      .expect(200, { estado: 'disponible' });
  });

  it('limita la espera y evita acumular consultas si PostgreSQL deja de responder', async () => {
    let completar!: (resultado: unknown[]) => void;
    consultar.mockImplementationOnce(() => new Promise(resolver => { completar = resolver; }));
    consultar.mockResolvedValue([]);

    try {
      const servidor = app.getHttpServer();
      await Promise.all([
        request(servidor).get('/api/health/ready').timeout(4000).expect(503),
        request(servidor).get('/api/health/ready').timeout(4000).expect(503),
      ]);
      await request(servidor).get('/api/health/ready').timeout(1000).expect(503);
      expect(consultar).toHaveBeenCalledTimes(1);
    } finally {
      completar?.([]);
    }

    await request(app.getHttpServer()).get('/api/health/ready').expect(200, { estado: 'disponible' });
  }, 8000);
});
