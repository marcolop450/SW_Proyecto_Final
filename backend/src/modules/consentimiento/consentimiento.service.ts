import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsentType } from '@prisma/client';

export interface FirmarConsentimientoDto {
  type?: ConsentType;
  version?: string;
}

@Injectable()
export class ConsentimientoService {
  private readonly logger = new Logger(ConsentimientoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async obtenerEstado(userId: string) {
    const consentimiento = await this.prisma.legalConsent.findFirst({
      where: {
        userId,
        type: ConsentType.CAMERA_AND_BIOMETRICS,
        isAccepted: true,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      tieneConsentimiento: !!consentimiento,
      consentimiento: consentimiento || null,
      requiereFirma: !consentimiento,
    };
  }

  async firmarConsentimiento(
    userId: string,
    dto: FirmarConsentimientoDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const version = dto.version || '1.0';
    const type = dto.type || ConsentType.CAMERA_AND_BIOMETRICS;

    const nuevoConsentimiento = await this.prisma.legalConsent.create({
      data: {
        userId,
        type,
        version,
        isAccepted: true,
        acceptedAt: new Date(),
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Client Browser',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CONSENTIMIENTO_FIRMADO',
        entity: 'LegalConsent',
        entityId: nuevoConsentimiento.id,
        categoria: 'LEGAL_COMPLIANCE',
        ipAddress,
        details: {
          type,
          version,
          acceptedAt: nuevoConsentimiento.acceptedAt,
        },
      },
    });

    this.logger.log(`Consentimiento otorgado para usuario ${userId} [${type} v${version}]`);

    return {
      exito: true,
      mensaje: 'Consentimiento informado registrado exitosamente.',
      consentimiento: nuevoConsentimiento,
    };
  }

  async revocarConsentimiento(userId: string, ipAddress?: string) {
    await this.prisma.legalConsent.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), isAccepted: false },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CONSENTIMIENTO_REVOCADO',
        entity: 'LegalConsent',
        categoria: 'LEGAL_COMPLIANCE',
        ipAddress,
        details: {
          revokedAt: new Date(),
          motivo: 'Revocación voluntaria por el titular o prueba de QA',
        },
      },
    });

    this.logger.log(`Consentimiento revocado para usuario ${userId}`);

    return {
      exito: true,
      mensaje: 'Consentimiento revocado. El acceso a cámara y telemetría ha sido suspendido.',
    };
  }
}
