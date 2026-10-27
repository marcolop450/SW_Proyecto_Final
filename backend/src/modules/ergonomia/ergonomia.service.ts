import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { MuestraTelemetriaDto } from './dto/muestra-telemetria.dto';
import { FinalizarSesionDto } from './dto/finalizar-sesion.dto';

@Injectable()
export class ErgonomiaService {
  constructor(private readonly prisma: PrismaService) {}

  async iniciarSesion(userId: string, _dto: IniciarSesionDto) {
    const sesion = await this.prisma.ergonomicSession.create({
      data: {
        userId,
        startTime: new Date(),
        averageRula: 1.0,
        totalAlerts: 0,
      },
    });

    return {
      id: sesion.id,
      startTime: sesion.startTime,
      mensaje: 'Sesión ergonómica iniciada exitosamente',
    };
  }

  async registrarMuestra(sessionId: string, userId: string, dto: MuestraTelemetriaDto) {
    const sesion = await this.prisma.ergonomicSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión ergonómica no encontrada o no autorizada.');
    }

    const prevRula = sesion.averageRula || dto.rulaScore;
    const nuevoPromedio = Number(((prevRula * 0.95) + (dto.rulaScore * 0.05)).toFixed(2));
    const incrementaAlerta = dto.rulaScore >= 5 || dto.staticLoad;

    const actualizada = await this.prisma.ergonomicSession.update({
      where: { id: sessionId },
      data: {
        averageRula: nuevoPromedio,
        totalAlerts: incrementaAlerta ? sesion.totalAlerts + 1 : sesion.totalAlerts,
      },
    });

    return {
      registrado: true,
      sessionId,
      rulaScore: dto.rulaScore,
      promedioActual: actualizada.averageRula,
      totalAlertas: actualizada.totalAlerts,
    };
  }

  async finalizarSesion(sessionId: string, userId: string, dto: FinalizarSesionDto) {
    const sesion = await this.prisma.ergonomicSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión ergonómica no encontrada o no autorizada.');
    }

    const fin = new Date();
    const finalizada = await this.prisma.ergonomicSession.update({
      where: { id: sessionId },
      data: {
        endTime: fin,
        averageRula: dto.promedioRula ?? sesion.averageRula,
        totalAlerts: dto.totalAlertas ?? sesion.totalAlerts,
      },
    });

    return {
      id: finalizada.id,
      startTime: finalizada.startTime,
      endTime: finalizada.endTime,
      averageRula: finalizada.averageRula,
      totalAlerts: finalizada.totalAlerts,
      mensaje: 'Sesión ergonómica finalizada y consolidada.',
    };
  }

  async obtenerResumen(userId: string) {
    const sesiones = await this.prisma.ergonomicSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 10,
    });

    const totalSesiones = sesiones.length;
    if (totalSesiones === 0) {
      return {
        totalSesiones: 0,
        promedioRula: 0,
        clasificacionRula: 'Sin mediciones previas',
        minutosMonitoreados: 0,
        alertasTotales: 0,
        sesionesHoy: 0,
        sesiones: [],
      };
    }

    const sumaRula = sesiones.reduce((acc, s) => acc + (s.averageRula || 0), 0);
    const promedioRula = Number((sumaRula / totalSesiones).toFixed(1));

    let clasificacionRula = 'Bajo Riesgo';
    if (promedioRula <= 2.0) clasificacionRula = 'Riesgo Despreciable (Óptimo)';
    else if (promedioRula <= 4.0) clasificacionRula = 'Bajo Riesgo (Aceptable)';
    else if (promedioRula <= 6.0) clasificacionRula = 'Riesgo Medio (Ajustar Puesto)';
    else clasificacionRula = 'Alto Riesgo (Intervención)';

    let minutosMonitoreados = 0;
    for (const s of sesiones) {
      if (s.endTime && s.startTime) {
        const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
        minutosMonitoreados += Math.max(1, Math.round(diffMs / 60000));
      } else {
        minutosMonitoreados += 15;
      }
    }

    const alertasTotales = sesiones.reduce((acc, s) => acc + s.totalAlerts, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const sesionesHoy = sesiones.filter((s) => new Date(s.startTime) >= hoy).length;

    return {
      totalSesiones,
      promedioRula,
      clasificacionRula,
      minutosMonitoreados,
      alertasTotales,
      sesionesHoy,
      sesiones: sesiones.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        averageRula: s.averageRula,
        totalAlerts: s.totalAlerts,
      })),
    };
  }

  async obtenerSesionActiva(userId: string) {
    return this.prisma.ergonomicSession.findFirst({
      where: { userId, endTime: null },
      orderBy: { startTime: 'desc' },
    });
  }
}
