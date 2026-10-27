import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanType, SubscriptionStatus, InvoiceStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface CotizacionDto {
  planType?: PlanType;
  tipoPlan?: PlanType;
  puestos?: number;
  puestosContratados?: number;
  examenes?: number;
}

export interface ProcesarPagoDto {
  subscriptionId?: string;
  planType?: PlanType;
  tipoPlan?: PlanType;
  puestos?: number;
  puestosContratados?: number;
  examenes?: number;
  metodoPago?: string;
  numeroTarjetaSimulada?: string;
  transactionId?: string;
}

@Injectable()
export class SuscripcionesService {
  private readonly logger = new Logger(SuscripcionesService.name);

  constructor(private readonly prisma: PrismaService) {}

  listarPlanes() {
    return [
      {
        tipo: PlanType.SAAS_SEAT_MONTHLY,
        nombre: 'Plan Profesional por Puesto',
        descripcion: 'Ideal para empresas con colaboradores en trabajo híbrido o presencial.',
        precioBase: 19.0,
        unidad: 'USD / puesto / mes',
        caracteristicas: [
          'Evaluación RULA/REBA en tiempo real',
          'Alertas visuales, sonoras y push móvil',
          'Bitácora y reportes ergonómicos ISO 11226',
          'Soporte multi-departamento',
        ],
      },
      {
        tipo: PlanType.PAY_PER_EXAM_PACKAGE,
        nombre: 'Paquete de Evaluación / Proctoring',
        descripcion: 'Orientado a instituciones y procesos de selección con cuestionarios externos.',
        precioBase: 2.5,
        unidad: 'USD / examen supervisado',
        caracteristicas: [
          'Supervisión de mirada y detección de celular',
          'Bloqueo de atajos y pantalla completa forzada',
          'Mosaico de monitoreo en tiempo real',
          'Expediente forense individual con firma digital',
        ],
      },
      {
        tipo: PlanType.ENTERPRISE_CUSTOM,
        nombre: 'Plan Enterprise Corporativo',
        descripcion: 'Solución a medida para grandes organizaciones con infraestructura dedicada.',
        precioBase: 499.0,
        unidad: 'USD / mes (hasta 100 usuarios)',
        caracteristicas: [
          'Todas las funciones de ergonomía y proctoring',
          'Integración con Active Directory / SAML SSO',
          'Exportación WORM SHA-256 de auditoría',
          'SLA 99.9% y soporte técnico 24/7',
        ],
      },
    ];
  }

  cotizar(dto: CotizacionDto) {
    const planType = dto.planType || dto.tipoPlan || PlanType.SAAS_SEAT_MONTHLY;
    const puestos = dto.puestos || dto.puestosContratados || 5;
    const examenes = dto.examenes || 50;
    let montoTotal = 0;

    switch (planType) {
      case PlanType.SAAS_SEAT_MONTHLY:
        montoTotal = puestos * 19.0;
        break;
      case PlanType.PAY_PER_EXAM_PACKAGE:
        montoTotal = examenes * 2.5;
        break;
      case PlanType.ENTERPRISE_CUSTOM:
        montoTotal = 499.0;
        break;
    }

    const fechaInicio = new Date();
    const fechaFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      planType,
      puestos,
      examenes,
      montoTotal,
      moneda: 'USD',
      vigenciaDias: 30,
      fechaInicio,
      fechaFin,
    };
  }

  async obtenerSuscripcionActual(organizationId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { organizationId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      return {
        tieneSuscripcion: false,
        suscripcion: null,
      };
    }

    return {
      tieneSuscripcion: true,
      suscripcion: sub,
    };
  }

  async procesarPagoSandbox(organizationId: string, dto: ProcesarPagoDto) {
    const planType = dto.planType || dto.tipoPlan || PlanType.SAAS_SEAT_MONTHLY;
    const puestos = dto.puestos || dto.puestosContratados || 5;
    const examenes = dto.examenes || 50;

    const cotizacion = this.cotizar({
      planType,
      puestos,
      examenes,
    });

    // Simulación de transacción con idempotencia
    const transactionId = dto.transactionId || `txn_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const resultado = await this.prisma.$transaction(async (tx) => {
      let sub = await tx.subscription.findFirst({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      });

      if (sub) {
        sub = await tx.subscription.update({
          where: { id: sub.id },
          data: {
            planType,
            status: SubscriptionStatus.ACTIVE,
            seatsAllocated: cotizacion.puestos,
            examsAllocated: cotizacion.examenes,
            currentPeriodStart: cotizacion.fechaInicio,
            currentPeriodEnd: cotizacion.fechaFin,
          },
        });
      } else {
        sub = await tx.subscription.create({
          data: {
            organizationId,
            planType,
            status: SubscriptionStatus.ACTIVE,
            seatsAllocated: cotizacion.puestos,
            examsAllocated: cotizacion.examenes,
            currentPeriodStart: cotizacion.fechaInicio,
            currentPeriodEnd: cotizacion.fechaFin,
          },
        });
      }

      const invoice = await tx.invoice.create({
        data: {
          subscriptionId: sub.id,
          invoiceNumber,
          amount: cotizacion.montoTotal,
          currency: 'USD',
          status: InvoiceStatus.PAID,
          paymentProvider: 'SANDBOX_PASARELA',
          transactionId,
          paidAt: new Date(),
        },
      });

      return { sub, invoice };
    });

    this.logger.log(`Pago procesado en Sandbox: Factura ${invoiceNumber} por $${cotizacion.montoTotal}`);

    return {
      exito: true,
      mensaje: 'Pago procesado exitosamente en sandbox. Suscripción activada.',
      suscripcion: resultado.sub,
      factura: resultado.invoice,
    };
  }

  async listarFacturas(organizationId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return [];

    return this.prisma.invoice.findMany({
      where: { subscriptionId: sub.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
