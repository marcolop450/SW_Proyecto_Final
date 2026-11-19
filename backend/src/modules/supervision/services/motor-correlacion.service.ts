import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface SignalExplicativa {
  tipo: string;
  criterio: string;
  valor: any;
  timestamp: string;
  confianza: number;
  recomendacionForense: string;
}

@Injectable()
export class MotorCorrelacionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * CU20: Evalúa ventanas deslizantes de 60 segundos cruzando postura, mirada y telemetría.
   * Si la sesión tiene eventos históricos, analiza toda la línea temporal en ventanas de 60s.
   * Si se ejecuta en vivo, analiza los últimos 60 segundos desde el momento actual.
   */
  async evaluarVentanaDeslizante(sessionId: string): Promise<any[]> {
    // 1. Obtener todos los eventos de conducta de la sesión ordenados temporalmente
    const todosEventos = await this.prisma.behaviorEvent.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });

    if (todosEventos.length === 0) return [];

    const incidentesGenerados: any[] = [];
    const minTime = todosEventos[0].timestamp.getTime();
    const maxTime = todosEventos[todosEventos.length - 1].timestamp.getTime();

    // Deslizar ventana de 60 segundos con paso de 30 segundos
    const duracionVentanaMs = 60000;
    const pasoMs = 30000;

    // Si la sesión abarca menos de 60s, evaluamos el intervalo completo
    const puntosInicio: number[] = [];
    if (maxTime - minTime <= duracionVentanaMs) {
      puntosInicio.push(minTime);
    } else {
      for (let t = minTime; t <= maxTime; t += pasoMs) {
        puntosInicio.push(t);
      }
    }

    for (const inicioMs of puntosInicio) {
      const finMs = inicioMs + duracionVentanaMs;
      const ventanaEventos = todosEventos.filter(
        (e) => e.timestamp.getTime() >= inicioMs && e.timestamp.getTime() <= finMs,
      );

      if (ventanaEventos.length === 0) continue;

      // ── Regla 1: Sospecha de celular en regazo (Mirada hacia abajo repetida) ──
      const eventosCelular = ventanaEventos.filter((e) => e.tipo === 'GAZE_DOWN_SUSTAINED');
      if (eventosCelular.length >= 2) {
        const eventoRef = eventosCelular[0];
        const yaExiste = await this.prisma.incident.findFirst({
          where: {
            sessionId,
            tipo: 'SOSPECHA_CELULAR_REGASO',
            timestamp: {
              gte: new Date(eventoRef.timestamp.getTime() - duracionVentanaMs),
              lte: new Date(eventoRef.timestamp.getTime() + duracionVentanaMs),
            },
          },
        });
        if (!yaExiste) {
          const signals: SignalExplicativa[] = eventosCelular.map((e) => ({
            tipo: e.tipo,
            criterio: `Desvío sostenido de mirada hacia el regazo (pitch negativo pronunciado)`,
            valor: e.detalles,
            timestamp: e.timestamp.toISOString(),
            confianza: 92,
            recomendacionForense: 'Verificar si el postulante mantiene un teléfono móvil o notas físicas sobre las piernas.',
          }));

          const inc = await this.prisma.incident.create({
            data: {
              sessionId,
              tipo: 'SOSPECHA_CELULAR_REGASO',
              severidad: 'HIGH',
              estado: 'PENDIENTE',
              resumen: `Desvío sostenido de mirada hacia el regazo detectado ${eventosCelular.length} veces en ventana de 60s.`,
              signals: signals as any,
              timestamp: eventoRef.timestamp,
            },
          });
          incidentesGenerados.push(inc);
        }
      }

      // ── Regla 2: Fuga de foco crítica (Pérdida de ventana + mirada fuera de pantalla) ──
      const blurEvents = ventanaEventos.filter((e) => e.tipo === 'WINDOW_BLUR');
      const gazeOffEvents = ventanaEventos.filter((e) => e.tipo === 'GAZE_OFFSCREEN');
      if (blurEvents.length >= 1 && (blurEvents.some((b) => (b.duracionMs || 0) > 4000) || gazeOffEvents.length >= 1)) {
        const eventoRef = blurEvents[0] || gazeOffEvents[0];
        const yaExiste = await this.prisma.incident.findFirst({
          where: {
            sessionId,
            tipo: 'FUGA_FOCO_CRITICA',
            timestamp: {
              gte: new Date(eventoRef.timestamp.getTime() - duracionVentanaMs),
              lte: new Date(eventoRef.timestamp.getTime() + duracionVentanaMs),
            },
          },
        });
        if (!yaExiste) {
          const signals: SignalExplicativa[] = [...blurEvents, ...gazeOffEvents].map((e) => ({
            tipo: e.tipo,
            criterio: 'Pérdida de foco activo de ventana combinada con desvío ocular fuera del monitor',
            valor: { duracionMs: e.duracionMs, detalles: e.detalles },
            timestamp: e.timestamp.toISOString(),
            confianza: 96,
            recomendacionForense: 'Revisar interacción con navegadores externos, software de mensajería o pantallas secundarias.',
          }));

          const inc = await this.prisma.incident.create({
            data: {
              sessionId,
              tipo: 'FUGA_FOCO_CRITICA',
              severidad: 'HIGH',
              estado: 'PENDIENTE',
              resumen: 'Pérdida prolongada de foco de ventana combinada con desvío visual de pantalla.',
              signals: signals as any,
              timestamp: eventoRef.timestamp,
            },
          });
          incidentesGenerados.push(inc);
        }
      }

      // ── Regla 3: Múltiples personas en escena (Suplantación o ayuda no autorizada) ──
      const multipleFaces = ventanaEventos.filter((e) => e.tipo === 'MULTIPLE_FACES');
      if (multipleFaces.length >= 1) {
        const eventoRef = multipleFaces[0];
        const yaExiste = await this.prisma.incident.findFirst({
          where: {
            sessionId,
            tipo: 'MULTIPLES_PERSONAS',
            timestamp: {
              gte: new Date(eventoRef.timestamp.getTime() - duracionVentanaMs),
              lte: new Date(eventoRef.timestamp.getTime() + duracionVentanaMs),
            },
          },
        });
        if (!yaExiste) {
          const signals: SignalExplicativa[] = multipleFaces.map((e) => ({
            tipo: e.tipo,
            criterio: 'Reconocimiento biométrico de dos o más rostros simultáneos en el cuadro de visión',
            valor: e.detalles || { duracionMs: e.duracionMs },
            timestamp: e.timestamp.toISOString(),
            confianza: 99,
            recomendacionForense: 'Incidente de máxima severidad. Posible tercero dictando respuestas o presenciando la prueba.',
          }));

          const inc = await this.prisma.incident.create({
            data: {
              sessionId,
              tipo: 'MULTIPLES_PERSONAS',
              severidad: 'CRITICAL',
              estado: 'PENDIENTE',
              resumen: 'Detección de dos o más rostros simultáneos en el encuadre de la cámara.',
              signals: signals as any,
              timestamp: eventoRef.timestamp,
            },
          });
          incidentesGenerados.push(inc);
        }
      }

      // ── Regla 4: Abandono de terminal de trabajo / evaluación ──
      const faceAbsent = ventanaEventos.filter((e) => e.tipo === 'FACE_ABSENT');
      if (faceAbsent.some((e) => (e.duracionMs || 0) >= 5000)) {
        const eventoRef = faceAbsent[0];
        const yaExiste = await this.prisma.incident.findFirst({
          where: {
            sessionId,
            tipo: 'ABANDONO_TERMINAL',
            timestamp: {
              gte: new Date(eventoRef.timestamp.getTime() - duracionVentanaMs),
              lte: new Date(eventoRef.timestamp.getTime() + duracionVentanaMs),
            },
          },
        });
        if (!yaExiste) {
          const signals: SignalExplicativa[] = faceAbsent.map((e) => ({
            tipo: e.tipo,
            criterio: 'Ausencia total de puntos de referencia faciales (Face Mesh) durante más de 5 segundos',
            valor: { duracionMs: e.duracionMs },
            timestamp: e.timestamp.toISOString(),
            confianza: 95,
            recomendacionForense: 'El postulante o colaborador abandonó el puesto sin previa pausa activa autorizada.',
          }));

          const inc = await this.prisma.incident.create({
            data: {
              sessionId,
              tipo: 'ABANDONO_TERMINAL',
              severidad: 'HIGH',
              estado: 'PENDIENTE',
              resumen: 'El evaluado abandonó el encuadre de la cámara por más de 5 segundos.',
              signals: signals as any,
              timestamp: eventoRef.timestamp,
            },
          });
          incidentesGenerados.push(inc);
        }
      }

      // ── Regla 5: Intento de copiado o atajos bloqueados ──
      const shortcuts = ventanaEventos.filter((e) => e.tipo === 'SHORTCUT_BLOCKED');
      if (shortcuts.length >= 2) {
        const eventoRef = shortcuts[0];
        const yaExiste = await this.prisma.incident.findFirst({
          where: {
            sessionId,
            tipo: 'ATAJOS_BLOQUEADOS_REPETIDOS',
            timestamp: {
              gte: new Date(eventoRef.timestamp.getTime() - duracionVentanaMs),
              lte: new Date(eventoRef.timestamp.getTime() + duracionVentanaMs),
            },
          },
        });
        if (!yaExiste) {
          const signals: SignalExplicativa[] = shortcuts.map((e) => ({
            tipo: e.tipo,
            criterio: 'Intento repetido de utilizar atajos restringidos del sistema operativo (Ctrl+C, Ctrl+V, Alt+Tab)',
            valor: e.detalles,
            timestamp: e.timestamp.toISOString(),
            confianza: 90,
            recomendacionForense: 'Comprobar si se intentó extraer o pegar contenido externo en el área de examen.',
          }));

          const inc = await this.prisma.incident.create({
            data: {
              sessionId,
              tipo: 'ATAJOS_BLOQUEADOS_REPETIDOS',
              severidad: 'HIGH',
              estado: 'PENDIENTE',
              resumen: `Intento de uso de atajos no permitidos detectado ${shortcuts.length} veces en 60 segundos.`,
              signals: signals as any,
              timestamp: eventoRef.timestamp,
            },
          });
          incidentesGenerados.push(inc);
        }
      }

      // ── Regla 6: Riesgo Ergonómico y Fatiga Postural Severa (Cruce Multidimensional) ──
      const eventosPosturaForzada = ventanaEventos.filter(
        (e) => e.tipo === 'POSTURA_FORZADA' || (e.detalles && (e.detalles as any).rulaScore >= 5),
      );
      if (eventosPosturaForzada.length >= 2) {
        const eventoRef = eventosPosturaForzada[0];
        const yaExiste = await this.prisma.incident.findFirst({
          where: {
            sessionId,
            tipo: 'RIESGO_POSTURAL_RULA_CRITICO',
            timestamp: {
              gte: new Date(eventoRef.timestamp.getTime() - duracionVentanaMs),
              lte: new Date(eventoRef.timestamp.getTime() + duracionVentanaMs),
            },
          },
        });
        if (!yaExiste) {
          const signals: SignalExplicativa[] = eventosPosturaForzada.map((e) => ({
            tipo: e.tipo,
            criterio: 'Puntuación biomecánica ISO 11226 / RULA >= 5 sostenida en ventana temporal',
            valor: e.detalles,
            timestamp: e.timestamp.toISOString(),
            confianza: 88,
            recomendacionForense: 'Postura con alto riesgo de lesión musculoesquelética. Requiere pausa activa obligatoria.',
          }));

          const inc = await this.prisma.incident.create({
            data: {
              sessionId,
              tipo: 'RIESGO_POSTURAL_RULA_CRITICO',
              severidad: 'MEDIUM',
              estado: 'PENDIENTE',
              resumen: 'Inclinación forzada de columna o cuello con nivel RULA crítico durante más de 60s.',
              signals: signals as any,
              timestamp: eventoRef.timestamp,
            },
          });
          incidentesGenerados.push(inc);
        }
      }
    }

    // Actualizar el conteo de incidentes en la sesión
    const totalInc = await this.prisma.incident.count({ where: { sessionId } });
    await this.prisma.supervisionSession.update({
      where: { id: sessionId },
      data: { totalIncidentes: totalInc },
    });

    return this.prisma.incident.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async obtenerIncidentes(sessionId: string): Promise<any[]> {
    return this.prisma.incident.findMany({
      where: { sessionId },
      include: { session: { select: { usuario: { select: { nombre: true, apellido: true } }, questionnaire: { select: { titulo: true } }, tipo: true, inicio: true } } },
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
      return {
        sessionId,
        indiceIntegridad: 100,
        indiceBienestar: 100,
        totalIncidentes: 0,
        totalEventos: 0,
        estadoSST: 'OPTIMO',
        desgloseIntegridad: { totalDeducciones: 0 },
        desgloseBienestar: { eventosFatiga: 0, clasificacion: 'OPTIMO' },
      };
    }

    const incidentes = session.incidentes || [];
    let deducciones = 0;
    let criticos = 0;
    let altos = 0;
    let medios = 0;
    let bajos = 0;
    let desestimados = 0;
    let falsosPositivos = 0;

    for (const inc of incidentes) {
      if (inc.estado === 'DESESTIMADO') {
        desestimados++;
        continue;
      }
      if (inc.estado === 'FALSO_POSITIVO') {
        falsosPositivos++;
        continue;
      }

      if (inc.severidad === 'CRITICAL') {
        criticos++;
        deducciones += 25;
      } else if (inc.severidad === 'HIGH') {
        altos++;
        deducciones += 15;
      } else if (inc.severidad === 'MEDIUM') {
        medios++;
        deducciones += 8;
      } else {
        bajos++;
        deducciones += 4;
      }
    }

    const indiceIntegridad = Math.max(0, 100 - deducciones);

    const eventos = session.eventosConducta || [];
    const eventosFatiga = eventos.filter(
      (e) => e.tipo === 'GAZE_DOWN_SUSTAINED' || e.tipo === 'FACE_ABSENT',
    ).length;
    const deduccionBienestar = Math.min(60, eventosFatiga * 6);
    const indiceBienestar = Math.max(40, 100 - deduccionBienestar);
    const estadoSST =
      indiceBienestar >= 80 ? 'OPTIMO' : indiceBienestar >= 60 ? 'MODERADO' : 'CRITICO';

    // Persistir el score de integridad en la sesión en base de datos
    await this.prisma.supervisionSession.update({
      where: { id: sessionId },
      data: { scoreIntegridad: indiceIntegridad },
    });

    return {
      sessionId,
      indiceIntegridad,
      indiceBienestar,
      totalIncidentes: incidentes.length,
      totalEventos: eventos.length,
      estadoSST,
      desgloseIntegridad: {
        criticos,
        altos,
        medios,
        bajos,
        desestimados,
        falsosPositivos,
        totalDeducciones: deducciones,
      },
      desgloseBienestar: {
        eventosFatiga,
        clasificacion: estadoSST,
        recomendacionSST:
          estadoSST === 'OPTIMO'
            ? 'Postura y pausas en rango saludable'
            : estadoSST === 'MODERADO'
            ? 'Se recomiendan pausas activas cada 45 minutos'
            : 'Riesgo ergonómico elevado; requiere ajuste de puesto de trabajo',
      },
    };
  }
}
