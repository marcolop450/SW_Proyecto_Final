import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Rol } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Aislamiento de identidad y membresías', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: { token: string; usuario: { id: string; organizationId: string } };
  let otraOrganizacion: { id: string };
  const sufijo = randomUUID();
  const registro = {
    nombre: 'Cuenta',
    apellido: 'QA',
    clave: 'RegistroQA123!',
    correo: `admin-${sufijo}@example.com`,
    organizacionNombre: `Identidad QA ${sufijo}`,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication({ logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);

    const response = await request(app.getHttpServer())
      .post('/api/auth/registro').send(registro).expect(201);
    admin = response.body;
    otraOrganizacion = await prisma.organizacion.create({
      data: { nombre: 'Otra organización QA', slug: `otra-qa-${sufijo}` },
    });
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  const auth = (token = admin.token) => ({ Authorization: `Bearer ${token}` });

  it('crea una organización propia y permite el login con su membresía', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/api/auth/login').send({ correo: registro.correo, clave: registro.clave }).expect(200);
    expect(body.usuario).toMatchObject({
      id: admin.usuario.id,
      organizationId: admin.usuario.organizationId,
      rol: Rol.ADMIN_ORGANIZACION,
    });
  });

  it('rechaza el nombre de una organización existente sin crear una cuenta', async () => {
    const correo = `conflicto-${sufijo}@example.com`;
    const { body } = await request(app.getHttpServer())
      .post('/api/auth/registro')
      .send({ ...registro, correo, organizacionNombre: registro.organizacionNombre.toUpperCase() })
      .expect(409);
    expect(body).toMatchObject({
      errorCode: 'ERR_ORGANIZATION_SLUG_TAKEN',
      errorReference: expect.stringMatching(/^ERR-/),
      message: expect.stringContaining('solicita una invitación'),
    });
    expect(await prisma.usuario.count({ where: { correo } })).toBe(0);
  });

  it('crea una sola cuenta cuando dos registros compiten por el mismo slug', async () => {
    const organizacionNombre = `Concurrencia ${sufijo}`;
    const correos = [`primero-${sufijo}@example.com`, `segundo-${sufijo}@example.com`];
    const respuestas = await Promise.all(correos.map(correo => request(app.getHttpServer())
      .post('/api/auth/registro').send({ ...registro, correo, organizacionNombre })));

    expect(respuestas.map(response => response.status).sort()).toEqual([201, 409]);
    expect(respuestas.find(response => response.status === 409).body.errorCode)
      .toBe('ERR_ORGANIZATION_SLUG_TAKEN');
    const organizaciones = await prisma.organizacion.findMany({
      where: { nombre: organizacionNombre },
      include: { membresias: true },
    });
    expect(organizaciones).toHaveLength(1);
    expect(organizaciones[0].membresias).toHaveLength(1);
    expect(await prisma.usuario.count({ where: { correo: { in: correos } } })).toBe(1);
  });

  it('permite gestionar roles ordinarios y protege el rol global', async () => {
    const api = request(app.getHttpServer());
    const invitacion = {
      correo: `invitado-${sufijo}@example.com`,
      nombre: 'Persona',
      apellido: 'Invitada',
    };
    const departamento = await prisma.departamento.create({
      data: { nombre: 'Departamento QA', organizacionId: admin.usuario.organizationId },
    });
    await api.post('/api/usuarios/invitar').set(auth())
      .send({ ...invitacion, rol: Rol.SUPER_ADMINISTRADOR }).expect(403);
    const { body } = await api.post('/api/usuarios/invitar').set(auth())
      .send({ ...invitacion, rol: Rol.EMPLEADO, departamentoId: departamento.id }).expect(201);
    expect(body.usuario).not.toHaveProperty('claveHash');
    expect(body.departamento.id).toBe(departamento.id);
    const cambiarRol = (id: string, rol: string) => api.patch(`/api/usuarios/${id}/rol`)
      .set(auth()).send({ rol });

    await cambiarRol(body.usuario.id, 'INVALIDO').expect(400);
    await cambiarRol(admin.usuario.id, Rol.SUPER_ADMINISTRADOR).expect(403);
    await cambiarRol(body.usuario.id, Rol.SUPER_ADMINISTRADOR).expect(403);
    const actualizado = await cambiarRol(body.usuario.id, Rol.SUPERVISOR).expect(200);
    expect(actualizado.body.rol).toBe(Rol.SUPERVISOR);
    await api.get('/api/organizaciones/todas').set(auth()).expect(403);

    const global = await prisma.usuarioOrganizacion.findFirstOrThrow({
      where: { rol: Rol.SUPER_ADMINISTRADOR },
      include: { usuario: true },
    });
    await cambiarRol(global.usuarioId, Rol.EMPLEADO).expect(404);
    await prisma.usuarioOrganizacion.create({
      data: {
        usuarioId: global.usuarioId,
        organizacionId: admin.usuario.organizationId,
        rol: Rol.SUPER_ADMINISTRADOR,
      },
    });
    await cambiarRol(global.usuarioId, Rol.EMPLEADO).expect(403);
    const login = await api.post('/api/auth/login')
      .send({ correo: global.usuario.correo, clave: '12345' }).expect(200);
    await api.get('/api/organizaciones/todas').set(auth(login.body.token)).expect(200);
  });

  it('rechaza departamentos ajenos y no crea el usuario de la invitación', async () => {
    const departamento = await prisma.departamento.create({
      data: { nombre: 'Departamento ajeno', organizacionId: otraOrganizacion.id },
    });
    const correo = `externo-${sufijo}@example.com`;
    await request(app.getHttpServer()).post('/api/usuarios/invitar').set(auth())
      .send({ correo, nombre: 'Externo', apellido: 'QA', rol: Rol.EMPLEADO, departamentoId: departamento.id })
      .expect(404);
    expect(await prisma.usuario.count({ where: { correo } })).toBe(0);
  });

  it('valida la membresía exacta y aplica cambios de rol a tokens ya emitidos', async () => {
    const api = request(app.getHttpServer());
    const { usuario } = admin;
    const membresia = {
      usuarioId: usuario.id,
      organizacionId: usuario.organizationId,
    };
    const tokenOtraOrganizacion = app.get(JwtService).sign({
      sub: usuario.id, organizationId: otraOrganizacion.id, rol: Rol.SUPER_ADMINISTRADOR,
    });
    await api.get('/api/auth/perfil').set(auth(tokenOtraOrganizacion)).expect(401);
    await prisma.usuarioOrganizacion.update({
      where: { usuarioId_organizacionId: membresia }, data: { rol: Rol.EMPLEADO },
    });
    await api.get('/api/usuarios').set(auth()).expect(403);
    await prisma.organizacion.update({
      where: { id: usuario.organizationId }, data: { activo: false },
    });
    await api.get('/api/auth/perfil').set(auth()).expect(401);
    await api.post('/api/auth/login')
      .send({ correo: registro.correo, clave: registro.clave }).expect(401);
    await prisma.organizacion.update({
      where: { id: usuario.organizationId }, data: { activo: true },
    });
    await prisma.usuarioOrganizacion.create({
      data: { usuarioId: usuario.id, organizacionId: otraOrganizacion.id, rol: Rol.EMPLEADO },
    });
    await prisma.usuarioOrganizacion.delete({ where: { usuarioId_organizacionId: membresia } });
    await api.get('/api/auth/perfil').set(auth()).expect(401);
  });
});
