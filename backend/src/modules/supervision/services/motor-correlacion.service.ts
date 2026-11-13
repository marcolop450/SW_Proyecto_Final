import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface SignalExplicativa {
  tipo: string;
  valor: any;
  timestamp: string;
}

@Injectable()
export class MotorCorrelacionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * CU20: Evalúa la ventana deslizante de 60 segundos y correlaciona incidentes
   */
  async evaluarVentanaDeslizante(sessionId: string): Promise<any[]> {
    const ahora = new Date();
    const haceUnMinuto = new Date(ahora.getTime() - 60000);

    const eventos = await this.prisma.behaviorEvent.findMany({
      where: {
        sessionId,
        timestamp: { gte: haceUnMinuto },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (eventos.length === 0) return [];

    const incidentesGenerados: any[] = [];

    // 1. Regla: Sospecha de celular en regazo
    const eventosCelular = eventos.filter((e) => e.tipo === 'GAZE_DOWN_SUSTAINED');
    if (eventosCelular.length >= 2) {
      const yaExiste = await this.prisma.incident.findFirst({
        where: { sessionId, tipo: 'SOSPECHA_CELULAR_REGASO', timestamp: { gte: haceUnMinuto } },
      });
      if (!yaExiste) {
        const signals: SignalExplicativa[] = eventosCelular.map((e) => ({
          tipo: e.tipo,
          valor: e.detalles,
          timestamp: e.timestamp.toISOString(),
        }));
        const inc = await this.prisma.incident.create({
          data: {
            sessionId,
            tipo: 'SOSPECHA_CELULAR_REGASO',
            severidad: 'HIGH',
            estado: 'PENDIENTE',
            resumen: `Desvío sostenido de mirada hacia el regazo repetido ${eventosCelular.length} veces en 60 segundos.`,
            signals: signals as any,
          },
        });
        incidentesGenerados.push(inc);
      }
    }

    // 2. Regla: Fuga de foco crítica
    const blurEvents = eventos.filter((e) => e.tipo === 'WINDOW_BLUR');
    const gazeOffEvents = eventos.filter((e) => e.tipo === 'GAZE_OFFSCREEN');
    if (blurEvents.length >= 1 && (blurEvents.some((b) => (b.duracionMs || 0) > 5000) || gazeOffEvents.length >= 2)) {
      const yaExiste = await this.prisma.incident.findFirst({
        where: { sessionId, tipo: 'FUGA_FOCO_CRITICA', timestamp: { gte: haceUnMinuto } },
      });
      if (!yaExiste) {
        const signals: SignalExplicativa[] = [...blurEvents, ...gazeOffEvents].map((e) => ({
          tipo: e.tipo,
          valor: { duracionMs: e.duracionMs, detalles: e.detalles },
          timestamp: e.timestamp.toISOString(),
        }));
        const inc = await this.prisma.incident.create({
          data: {
            sessionId,
            tipo: 'FUGA_FOCO_CRITICA',
            severidad: 'HIGH',
            estado: 'PENDIENTE',
            resumen: 'Pérdida prolongada de foco de ventana combinada con desvío visual de pantalla.',
            signals: signals as any,
          },
        });
        incidentesGenerados.push(inc);
      }
    }

    // 3. Regla: Múltiples personas en escena
    const multipleFaces = eventos.filter((e) => e.tipo === 'MULTIPLE_FACES');
    if (multipleFaces.length >= 1) {
      const yaExiste = await this.prisma.incident.findFirst({
        where: { sessionId, tipo: 'MULTIPLES_PERSONAS', timestamp: { gte: haceUnMinuto } },
      });
      if (!yaExiste) {
        const inc = await this.prisma.incident.create({
          data: {
            sessionId,
            tipo: 'MULTIPLES_PERSONAS',
            severidad: 'CRITICAL',
            estado: 'PENDIENTE',
            resumen: 'Detección de dos o más rostros simultáneos en el encuadre de la cámara.',
            signals: multipleFaces.map((e) => ({
              tipo: e.tipo,
              valor: e.duracionMs,
              timestamp: e.timestamp.toISOString(),
            })) as any,
          },
        });
        incidentesGenerados.push(inc);
      }
    }

    // 4. Regla: Abandono de terminal
    const faceAbsent = eventos.filter((e) => e.tipo === 'FACE_ABSENT');
    if (faceAbsent.some((e) => (e.duracionMs || 0) >= 5000)) {
      const yaExiste = await this.prisma.incident.findFirst({
        where: { sessionId, tipo: 'ABANDONO_TERMINAL', timestamp: { gte: haceUnMinuto } },
      });
      if (!yaExiste) {
        const inc = await this.prisma.incident.create({
          data: {
            sessionId,
            tipo: 'ABANDONO_TERMINAL',
            severidad: 'HIGH',
            estado: 'PENDIENTE',
            resumen: 'El evaluado abandonó el encuadre de la cámara por más de 5 segundos.',
            signals: faceAbsent.map((e) => ({
              tipo: e.tipo,
              valor: e.duracionMs,
              timestamp: e.timestamp.toISOString(),
            })) as any,
          },
        });
        incidentesGenerados.push(inc);
      }
    }

    return incidentesGenerados;
  }

  async obtenerIncidentes(sessionId: string): Promise<any[]> {
    return this.prisma.incident.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async auditarIncidente(incidentId: string, estado: string, justificacion?: string, auditorId?: string) {
    return this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        estado,
        justificacion,
        auditorId,
        auditadoEn: new Date(),
      },
    });
  }

  async calcularIndices(sessionId: string) {
    const session = await this.prisma.supervisionSession.findUnique({
      where: { id: sessionId },
      include: {
        incidentes: true,
        eventosConducta: true,
      },
    });

    if (!session) {
      return { indiceIntegridad: 100, indiceBienestar: 100, totalIncidentes: 0 };
    }

    const incidentes = session.incidentes || [];
    let deducciones = 0;
    for (const inc of incidentes) {
      if (inc.estado === 'DESESTIMADO' || inc.estado === 'FALSO_POSITIVO') continue;
      if (inc.severidad === 'CRITICAL') deducciones += 25;
      else if (inc.severidad === 'HIGH') deducciones += 15;
      else if (inc.severidad === 'MEDIUM') deducciones += 8;
      else deducciones += 4;
    }
    const indiceIntegridad = Math.max(0, 100 - deducciones);

    const eventos = session.eventosConducta || [];
    const eventosFatiga = eventos.filter((e) => e.tipo === 'GAZE_DOWN_SUSTAINED' || e.tipo === 'FACE_ABSENT').length;
    const deduccionBienestar = Math.min(60, eventosFatiga * 6);
    const indiceBienestar = Math.max(40, 100 - deduccionBienestar);

    return {
      sessionId,
      indiceIntegridad,
      indiceBienestar,
      totalIncidentes: incidentes.length,
      totalEventos: eventos.length,
      estadoSST: indiceBienestar >= 80 ? 'OPTIMO' : indiceBienestar >= 60 ? 'MODERADO' : 'CRITICO',
    };
  }
}
