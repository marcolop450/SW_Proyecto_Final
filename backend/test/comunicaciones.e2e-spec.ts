import { Controller, Get, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { WebSocketGateway } from '@nestjs/websockets';
import { Request } from 'express';
import { randomBytes } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import * as request from 'supertest';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { configurarComunicaciones } from '../src/common/http/configurar-comunicaciones';
import { crearPoliticaDeOrigenes } from '../src/common/http/origenes-web';

const SITIO = 'https://ergocheck.example';
const EXTERNO = 'https://externo.example';
const POLLING = '/socket.io/?EIO=4&transport=polling';

@Controller('prueba')
class ComunicacionesController {
  @Get()
  datos(@Req() req: Request) {
    return { ip: req.ip, protocolo: req.protocol };
  }
}

@WebSocketGateway()
class ComunicacionesGateway {}

describe('Comunicaciones HTTP y Socket.IO', () => {
  let app: NestExpressApplication;

  async function iniciarApp(config: Record<string, string>) {
    const modulo = await Test.createTestingModule({
      controllers: [ComunicacionesController],
      providers: [ComunicacionesGateway, {
        provide: ConfigService,
        useValue: new ConfigService(config),
      }],
    }).compile();
    app = modulo.createNestApplication<NestExpressApplication>({ logger: false });
    configurarComunicaciones(app);
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.listen(0, '127.0.0.1');
  }

  beforeEach(() => iniciarApp({ NODE_ENV: 'production', WEB_ALLOWED_ORIGINS: SITIO }));
  afterEach(async () => { await app.close(); });

  function respuestaUpgrade(origen?: string): Promise<{ estado: number; cuerpo?: string }> {
    const direccion = app.getHttpServer().address();
    if (!direccion || typeof direccion === 'string') throw new Error('Puerto de prueba no disponible.');

    return new Promise((resolve, reject) => {
      const req = httpRequest({
        host: '127.0.0.1',
        port: direccion.port,
        path: '/socket.io/?EIO=4&transport=websocket',
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          'Sec-WebSocket-Version': '13',
          'Sec-WebSocket-Key': randomBytes(16).toString('base64'),
          ...(origen === undefined ? {} : { Origin: origen }),
        },
      }, res => {
        const fragmentos: Buffer[] = [];
        res.on('data', fragmento => fragmentos.push(fragmento));
        res.on('end', () => resolve({
          estado: res.statusCode!,
          cuerpo: Buffer.concat(fragmentos).toString(),
        }));
      });
      req.on('upgrade', (res, socket) => {
        socket.destroy();
        resolve({ estado: res.statusCode! });
      });
      req.on('error', reject);
      req.setTimeout(3000, () => req.destroy(new Error('Tiempo de espera del handshake')));
      req.end();
    });
  }

  it('acepta el origen configurado y las peticiones sin Origin', async () => {
    const http = request(app.getHttpServer());
    await http.get('/prueba').set('Origin', SITIO).expect('Access-Control-Allow-Origin', SITIO).expect(200);
    await http.get('/prueba').expect(200);
    await http.options('/prueba').set('Origin', SITIO)
      .set('Access-Control-Request-Method', 'GET').expect('Access-Control-Allow-Origin', SITIO).expect(204);
  });

  it('rechaza orígenes externos y opacos en HTTP, incluido el preflight', async () => {
    const http = request(app.getHttpServer());
    const { body, headers } = await http.get('/prueba').set('Origin', EXTERNO).expect(403);
    expect(body).toMatchObject({ errorCode: 'ERR_ORIGIN_NOT_ALLOWED', statusCode: 403 });
    expect(headers['access-control-allow-origin']).toBeUndefined();
    await http.get('/prueba').set('Origin', 'null').expect(403);
    await http.options('/prueba').set('Origin', EXTERNO)
      .set('Access-Control-Request-Method', 'GET').expect(403);
  });

  it('aplica la misma política a polling y WebSocket directo', async () => {
    const http = request(app.getHttpServer());
    await http.get(POLLING).set('Origin', SITIO).expect('Access-Control-Allow-Origin', SITIO).expect(200);
    await http.get(POLLING).set('Origin', EXTERNO).expect(403);
    await expect(respuestaUpgrade(SITIO)).resolves.toMatchObject({ estado: 101 });
    await expect(respuestaUpgrade(EXTERNO)).resolves.toMatchObject({
      estado: 400,
      cuerpo: 'Origen web no permitido.',
    });
    await expect(respuestaUpgrade()).resolves.toMatchObject({ estado: 101 });
  });

  it('ignora cabeceras reenviadas cuando no está activada la confianza en Caddy', async () => {
    await request(app.getHttpServer()).get('/prueba')
      .set('X-Forwarded-For', '192.0.2.44')
      .set('X-Forwarded-Proto', 'https')
      .expect(200, { ip: '127.0.0.1', protocolo: 'http' });
  });
});

describe('Configuración de orígenes', () => {
  it('admite Vite local en desarrollo y exige un origen explícito en producción', () => {
    const desarrollo = crearPoliticaDeOrigenes(new ConfigService({ NODE_ENV: 'development' }));
    const produccion = crearPoliticaDeOrigenes(new ConfigService({ NODE_ENV: 'production' }));
    expect(desarrollo('http://localhost:5173')).toBe(true);
    expect(desarrollo('http://127.0.0.1:3000')).toBe(true);
    expect(desarrollo(EXTERNO)).toBe(false);
    expect(produccion('http://localhost:5173')).toBe(false);
    expect(produccion(undefined)).toBe(true);
  });

  it.each(['*', 'https://example.com/otra-ruta', 'https://example.com\\otra-ruta', 'https://user@example.com'])(
    'rechaza la entrada de origen inválida %s',
    valor => expect(() => crearPoliticaDeOrigenes(
      new ConfigService({ WEB_ALLOWED_ORIGINS: valor }),
    )).toThrow('WEB_ALLOWED_ORIGINS'),
  );
});
