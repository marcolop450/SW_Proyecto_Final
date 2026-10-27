import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth & Multi-Tenant E2E Tests (Sprint 1)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('1. POST /api/auth/login - Credenciales válidas emiten JWT firmado', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ correo: 'carlos.mendoza@visitask.com', clave: '12345' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario).toHaveProperty('id');
    expect(res.body.usuario.correo).toBe('carlos.mendoza@visitask.com');
  });

  it('2. POST /api/auth/login - Credenciales inválidas retornan 401 con errorReference', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ correo: 'carlos.mendoza@visitask.com', clave: 'clave_erronea' })
      .expect(401);

    expect(res.body).toHaveProperty('errorReference');
    expect(res.body.errorReference).toMatch(/^ERR-[A-Z0-9]{8}$/);
    expect(res.body.errorCode).toBe('ERR_INVALID_CREDENTIALS');
  });

  it('3. GET /api/organizaciones/mi-organizacion - Sin token retorna 401 con envelope estándar', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/organizaciones/mi-organizacion')
      .expect(401);

    expect(res.body).toHaveProperty('errorReference');
    expect(res.body.statusCode).toBe(401);
  });

  it('4. GET /api/organizaciones/mi-organizacion - Con token retorna datos del tenant autenticado', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ correo: 'carlos.mendoza@visitask.com', clave: '12345' });

    const token = loginRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/api/organizaciones/mi-organizacion')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body.slug).toBe('visitask-global');
  });

  it('5. GET /api/suscripciones/planes - Endpoint público accesible sin autenticación', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/suscripciones/planes')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });
});
