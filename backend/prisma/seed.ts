import { PrismaClient, Rol, PlanType, SubscriptionStatus, ConsentType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando siembra de datos segura en Supabase PostgreSQL...');

  // Limpiar datos existentes en orden de dependencia
  await prisma.auditLog.deleteMany();
  await prisma.ergonomicSession.deleteMany();
  await prisma.legalConsent.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.usuarioOrganizacion.deleteMany();
  await prisma.departamento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.organizacion.deleteMany();

  // 1. Crear Organizaciones
  const orgGlobal = await prisma.organizacion.create({
    data: {
      nombre: 'Visitask Global Enterprise',
      slug: 'visitask-global',
      identificacionFiscal: 'NIT-1029384756',
    },
  });

  const orgAndina = await prisma.organizacion.create({
    data: {
      nombre: 'Tecnología Andina S.A.',
      slug: 'tecnologia-andina',
      identificacionFiscal: 'NIT-5566778899',
    },
  });

  const orgUagrm = await prisma.organizacion.create({
    data: {
      nombre: 'Facultad de Ingeniería UAGRM',
      slug: 'uagrm-academica',
      identificacionFiscal: 'NIT-9988776655',
    },
  });

  // 2. Crear Departamentos
  const depSst = await prisma.departamento.create({
    data: {
      nombre: 'Seguridad y Salud en el Trabajo (SST)',
      organizacionId: orgGlobal.id,
      descripcion: 'Monitoreo ergonómico y bienestar laboral',
    },
  });

  const depDev = await prisma.departamento.create({
    data: {
      nombre: 'Ingeniería de Software & IA',
      organizacionId: orgAndina.id,
      descripcion: 'Desarrollo de visión y telemetría',
    },
  });

  const depEvaluacion = await prisma.departamento.create({
    data: {
      nombre: 'Centro de Evaluaciones Técnicas',
      organizacionId: orgUagrm.id,
      descripcion: 'Supervisión y control de probidad académica',
    },
  });

  // 3. Crear Usuarios con contraseñas seguras hasheadas con Bcrypt (Salt 12)
  const passwordHash = await bcrypt.hash('12345', 12);

  const usuariosData = [
    {
      correo: 'manuela@gmail.com',
      nombre: 'Manuela',
      apellido: 'Administradora',
      rol: Rol.SUPER_ADMINISTRADOR,
      orgId: orgGlobal.id,
      depId: depSst.id,
    },
    {
      correo: 'carlos.mendoza@visitask.com',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      rol: Rol.ADMIN_ORGANIZACION,
      orgId: orgGlobal.id,
      depId: depSst.id,
    },
    {
      correo: 'jairo.camacho@visitask.com',
      nombre: 'Jairo',
      apellido: 'Camacho',
      rol: Rol.SUPERVISOR,
      orgId: orgAndina.id,
      depId: depDev.id,
    },
    {
      correo: 'marco.lopez@visitask.com',
      nombre: 'Marco',
      apellido: 'López',
      rol: Rol.EVALUADOR,
      orgId: orgUagrm.id,
      depId: depEvaluacion.id,
    },
    {
      correo: 'juan.matienzo@visitask.com',
      nombre: 'Juan Manuel',
      apellido: 'Matienzo',
      rol: Rol.EMPLEADO,
      orgId: orgGlobal.id,
      depId: depSst.id,
    },
    {
      correo: 'candidato.demo@gmail.com',
      nombre: 'Ana María',
      apellido: 'Suárez',
      rol: Rol.POSTULANTE,
      orgId: orgUagrm.id,
      depId: depEvaluacion.id,
    },
  ];

  for (const item of usuariosData) {
    const usr = await prisma.usuario.create({
      data: {
        correo: item.correo,
        claveHash: passwordHash,
        nombre: item.nombre,
        apellido: item.apellido,
      },
    });

    await prisma.usuarioOrganizacion.create({
      data: {
        usuarioId: usr.id,
        organizacionId: item.orgId,
        departamentoId: item.depId,
        rol: item.rol,
      },
    });

    // Otorgar consentimiento activo a los usuarios de prueba excepto al candidato (para probar bloqueo)
    if (item.rol !== Rol.POSTULANTE) {
      await prisma.legalConsent.create({
        data: {
          userId: usr.id,
          type: ConsentType.CAMERA_AND_BIOMETRICS,
          isAccepted: true,
          acceptedAt: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ErgoCheck/1.0',
        },
      });
    }

    // Sembrar sesiones ergonómicas de telemetría real para el colaborador Juan Matienzo
    if (item.correo === 'juan.matienzo@visitask.com') {
      const ahora = Date.now();
      await prisma.ergonomicSession.createMany({
        data: [
          {
            userId: usr.id,
            startTime: new Date(ahora - 3 * 3600 * 1000),
            endTime: new Date(ahora - 2.2 * 3600 * 1000),
            averageRula: 2.1,
            totalAlerts: 1,
          },
          {
            userId: usr.id,
            startTime: new Date(ahora - 2 * 3600 * 1000),
            endTime: new Date(ahora - 1.2 * 3600 * 1000),
            averageRula: 1.8,
            totalAlerts: 0,
          },
          {
            userId: usr.id,
            startTime: new Date(ahora - 45 * 60 * 1000),
            endTime: new Date(ahora - 5 * 60 * 1000),
            averageRula: 2.4,
            totalAlerts: 2,
          },
        ],
      });
    }
  }

  // 4. Crear Suscripción y Factura Activa
  const sub = await prisma.subscription.create({
    data: {
      organizationId: orgGlobal.id,
      planType: PlanType.SAAS_SEAT_MONTHLY,
      status: SubscriptionStatus.ACTIVE,
      seatsAllocated: 25,
      examsAllocated: 100,
      examsUsed: 12,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      subscriptionId: sub.id,
      invoiceNumber: 'INV-2026-0001',
      amount: 149.0,
      currency: 'USD',
      status: 'PAID',
      paymentProvider: 'SANDBOX_STRIPE',
      transactionId: 'txn_sandbox_seed_001',
      paidAt: new Date(),
    },
  });

  console.log('Siembra de datos completada exitosamente en Supabase.');
}

main()
  .catch((e) => {
    console.error('Error durante la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
