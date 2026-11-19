import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { EstadoSemaforo, PuestoMonitoreo } from '../types/puesto-monitoreo';

@Injectable()
export class PuestosPersistidosService {
  constructor(private readonly prisma: PrismaService) {}

  async recuperar(puestos: Map<string, PuestoMonitoreo>, organizationId?: string): Promise<void> {
    const sesiones = await this.prisma.supervisionSession.findMany({
      where: { ...(organizationId ? { organizationId } : {}), estado: 'EN_PROGRESO' },
      take: 10,
      orderBy: { inicio: 'desc' },
      include: {
        usuario: true,
        incidentes: { take: 3, orderBy: { timestamp: 'desc' } },
        eventosConducta: { take: 5, orderBy: { timestamp: 'desc' } },
      },
    });

    const ahora = Date.now();
    for (const sesion of sesiones) {
      let estado: EstadoSemaforo = 'VERDE';
      let motivo: string | undefined = undefined;
      let rulaScore = 2;
      let pitchEfectivo = -8.0;

      const tieneIncidentesCriticos = sesion.incidentes.some(
        (i) => i.severidad === 'CRITICAL' || i.severidad === 'HIGH',
      );
      const tieneRiesgoErgo = sesion.eventosConducta.some(
        (e) => (e.detalles as any)?.rulaScore >= 5 || e.tipo === 'POSTURA_FORZADA',
      );
      const tieneDistracciones = sesion.eventosConducta.some(
        (e) => e.tipo === 'GAZE_OFFSCREEN' || e.tipo === 'WINDOW_BLUR',
      );

      if (sesion.estado === 'COMPLETADA' || (ahora - new Date(sesion.inicio).getTime() > 3600000)) {
        estado = 'GRIS';
        motivo = 'Sesión finalizada o sin telemetría reciente';
      } else if (tieneIncidentesCriticos) {
        estado = 'ROJO';
        motivo = sesion.incidentes[0]?.resumen || 'Anomalía crítica detectada';
      } else if (tieneRiesgoErgo) {
        estado = 'NARANJA';
        rulaScore = 6;
        pitchEfectivo = -34.5;
        motivo = 'Riesgo ergonómico elevado (RULA >= 5)';
      } else if (tieneDistracciones) {
        estado = 'AMARILLO';
        rulaScore = 4;
        pitchEfectivo = -22.0;
        motivo = 'Desvío de mirada o ventana inactiva';
      } else {
        estado = 'VERDE';
        rulaScore = 2;
        pitchEfectivo = -7.5;
        motivo = 'Postura y ergonomía óptima';
      }

      const puesto: PuestoMonitoreo = {
        sessionId: sesion.id,
        usuarioNombre: sesion.usuario
          ? `${sesion.usuario.nombre} ${sesion.usuario.apellido}`
          : `Sesión ${sesion.id.slice(0, 8)}`,
        rol: 'EVALUADO',
        tipo: sesion.tipo,
        estado,
        rulaScore,
        pitchEfectivo,
        ultimoHeartbeat: ahora - 25000,
        organizationId: sesion.organizationId,
        motivoAlerta: motivo,
      };

      puestos.set(sesion.id, puesto);
    }
  }

  async simularDemo(puestos: Map<string, PuestoMonitoreo>, organizationId: string): Promise<void> {
    const ahora = new Date();
    const orgId = organizationId;
    const usuarios = await this.prisma.usuarioOrganizacion.findMany({ where: { organizacionId: orgId }, take: 5, include: { usuario: true } });

    const presets = [
      {
        estado: 'VERDE' as EstadoSemaforo,
        tipo: 'TELETRABAJO',
        rula: 2,
        pitch: -6.5,
        motivo: 'Postura y ergonomía óptima',
        evento: { tipo: 'POSTURA_NEUTRA', severidad: 'LOW', rulaScore: 2 },
        heartbeatOffset: 0,
      },
      {
        estado: 'AMARILLO' as EstadoSemaforo,
        tipo: 'EXAMEN',
        rula: 4,
        pitch: -26.0,
        motivo: 'Desvío de mirada sostenido hacia fuera de pantalla',
        evento: { tipo: 'GAZE_OFFSCREEN', severidad: 'MEDIUM', rulaScore: 4 },
        heartbeatOffset: 1000,
      },
      {
        estado: 'NARANJA' as EstadoSemaforo,
        tipo: 'TELETRABAJO',
        rula: 6,
        pitch: -38.2,
        motivo: 'Riesgo ergonómico severo (RULA 6, flexión cervical > 35°)',
        evento: { tipo: 'POSTURA_FORZADA', severidad: 'HIGH', rulaScore: 6 },
        heartbeatOffset: 2000,
      },
      {
        estado: 'ROJO' as EstadoSemaforo,
        tipo: 'EXAMEN',
        rula: 5,
        pitch: -12.0,
        motivo: 'Anomalía crítica: Múltiples rostros detectados en cámara',
        evento: { tipo: 'MULTIPLE_FACES', severidad: 'CRITICAL', rulaScore: 5 },
        heartbeatOffset: 1500,
      },
      {
        estado: 'GRIS' as EstadoSemaforo,
        tipo: 'EXAMEN',
        rula: 0,
        pitch: 0,
        motivo: 'Conexión perdida (watchdog > 15s sin telemetría)',
        evento: { tipo: 'FACE_ABSENT', severidad: 'HIGH', rulaScore: 0 },
        heartbeatOffset: 25000,
      },
    ];

    for (const [sessionId, puesto] of puestos) {
      if (puesto.organizationId === orgId) puestos.delete(sessionId);
    }

    for (let i = 0; i < presets.length; i++) {
      const p = presets[i];
      const usr = usuarios[i % usuarios.length]?.usuario;
      if (!usr) continue;

      // Crear sesión real persistida en PostgreSQL
      const sesion = await this.prisma.supervisionSession.create({
        data: {
          userId: usr.id,
          organizationId: orgId,
          tipo: p.tipo,
          estado: p.estado === 'GRIS' ? 'COMPLETADA' : 'EN_PROGRESO',
          inicio: new Date(ahora.getTime() - 15 * 60000),
          fin: p.estado === 'GRIS' ? ahora : null,
          scoreIntegridad: p.estado === 'ROJO' ? 45 : p.estado === 'NARANJA' ? 68 : p.estado === 'AMARILLO' ? 78 : 95,
        },
      });

      // Crear evento real persistido en PostgreSQL
      await this.prisma.behaviorEvent.create({
        data: {
          sessionId: sesion.id,
          userId: usr.id,
          tipo: p.evento.tipo,
          severidad: p.evento.severidad,
          duracionMs: 4500,
          detalles: { rulaScore: p.evento.rulaScore, motivo: p.motivo },
          timestamp: new Date(ahora.getTime() - p.heartbeatOffset),
        },
      });

      // Si es rojo o naranja, crear incidente en PostgreSQL
      if (p.estado === 'ROJO' || p.estado === 'NARANJA') {
        await this.prisma.incident.create({
          data: {
            sessionId: sesion.id,
            tipo: p.evento.tipo,
            severidad: p.estado === 'ROJO' ? 'CRITICAL' : 'HIGH',
            estado: 'PENDIENTE',
            resumen: p.motivo,
            signals: [{ tipo: p.evento.tipo, criterio: p.motivo, timestamp: ahora.toISOString() }],
            timestamp: new Date(ahora.getTime() - p.heartbeatOffset),
          },
        });
      }

      const puesto: PuestoMonitoreo = {
        sessionId: sesion.id,
        organizationId: orgId,
        usuarioNombre: `${usr.nombre} ${usr.apellido}`,
        rol: 'EVALUADO',
        tipo: p.tipo,
        estado: p.estado,
        rulaScore: p.rula,
        pitchEfectivo: p.pitch,
        ultimoHeartbeat: ahora.getTime() - p.heartbeatOffset,
        motivoAlerta: p.motivo,
      };

      puestos.set(sesion.id, puesto);
    }
  }
}
