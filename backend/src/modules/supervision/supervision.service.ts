import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearCuestionarioDto } from './dto/crear-cuestionario.dto';
import { IniciarSupervisionDto } from './dto/iniciar-supervision.dto';
import { EventoConductaDto } from './dto/evento-conducta.dto';
import { DispararPreguntaDto } from './dto/disparar-pregunta.dto';
import { RespuestaPreguntaDto } from './dto/respuesta-pregunta.dto';
import { FinalizarSupervisionDto } from './dto/finalizar-supervision.dto';
import * as crypto from 'crypto';

@Injectable()
export class SupervisionService {
  constructor(private readonly prisma: PrismaService) {}

  async crearCuestionario(organizacionId: string, creadorId: string, dto: CrearCuestionarioDto) {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const codigoAcceso = `EXAM-${randomSuffix}`;
    const vigenciaHoras = dto.vigenciaHoras || 24;
    const expiraEn = new Date(Date.now() + vigenciaHoras * 3600 * 1000);

    return this.prisma.questionnaire.create({
      data: {
        organizationId: organizacionId,
        creadorId,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: dto.tipo || 'EXAMEN',
        urlExterna: dto.urlExterna,
        duracionMinutos: dto.duracionMinutos || 60,
        codigoAcceso,
        expiraEn,
        activo: true,
      },
    });
  }

  async listarCuestionarios(organizacionId: string) {
    return this.prisma.questionnaire.findMany({
      where: { organizationId: organizacionId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { sesiones: true } },
      },
    });
  }

  async validarCodigo(codigoAcceso: string) {
    const q = await this.prisma.questionnaire.findUnique({
      where: { codigoAcceso },
    });

    if (!q || !q.activo) {
      throw new NotFoundException('Cuestionario no encontrado o inactivo.');
    }

    if (new Date() > q.expiraEn) {
      throw new BadRequestException('El código de acceso ha expirado.');
    }

    return {
      valido: true,
      id: q.id,
      titulo: q.titulo,
      tipo: q.tipo,
      urlExterna: q.urlExterna,
      duracionMinutos: q.duracionMinutos,
      expiraEn: q.expiraEn,
    };
  }

  async iniciarSesion(userId: string, organizacionId: string, dto: IniciarSupervisionDto) {
    let questionnaireId: string | null = null;
    let tipo = dto.tipo || 'EXAMEN';

    if (dto.codigoAcceso && dto.codigoAcceso !== 'TELETRABAJO') {
      const q = await this.validarCodigo(dto.codigoAcceso);
      questionnaireId = q.id;
      tipo = q.tipo;
    }

    const sesion = await this.prisma.supervisionSession.create({
      data: {
        userId,
        organizationId: organizacionId,
        questionnaireId,
        tipo,
        estado: 'EN_PROGRESO',
        inicio: new Date(),
        scoreIntegridad: 100.0,
        totalIncidentes: 0,
      },
      include: {
        questionnaire: true,
      },
    });

    return {
      id: sesion.id,
      tipo: sesion.tipo,
      estado: sesion.estado,
      inicio: sesion.inicio,
      urlExterna: sesion.questionnaire?.urlExterna || null,
      duracionMinutos: sesion.questionnaire?.duracionMinutos || 60,
    };
  }

  async registrarEvento(sessionId: string, userId: string, dto: EventoConductaDto) {
    const sesion = await this.prisma.supervisionSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión de supervisión no encontrada.');
    }

    const evento = await this.prisma.behaviorEvent.create({
      data: {
        sessionId,
        userId,
        tipo: dto.tipo,
        severidad: dto.severidad || 'LOW',
        duracionMs: dto.duracionMs,
        detalles: dto.detalles || {},
        timestamp: new Date(),
      },
    });

    await this.prisma.supervisionSession.update({
      where: { id: sessionId },
      data: { totalIncidentes: { increment: 1 } },
    });

    return { registrado: true, eventoId: evento.id, tipo: evento.tipo };
  }

  async dispararPregunta(sessionId: string, evaluadorId: string, dto: DispararPreguntaDto) {
    const sesion = await this.prisma.supervisionSession.findUnique({
      where: { id: sessionId },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada.');

    const controlQ = await this.prisma.controlQuestion.create({
      data: {
        questionnaireId: sesion.questionnaireId,
        pregunta: dto.pregunta,
        categoria: dto.categoria || 'INTEGRIDAD',
        tiempoEsperaSeg: dto.tiempoEsperaSeg || 5,
      },
    });

    const responseRecord = await this.prisma.controlQuestionResponse.create({
      data: {
        sessionId,
        preguntaId: controlQ.id,
        evaluadorId,
        disparadaEn: new Date(),
      },
      include: { pregunta: true },
    });

    return responseRecord;
  }

  async registrarRespuestaPregunta(sessionId: string, dto: RespuestaPreguntaDto) {
    const responseRecord = await this.prisma.controlQuestionResponse.findFirst({
      where: { sessionId, preguntaId: dto.preguntaId },
    });

    if (!responseRecord) {
      throw new NotFoundException('Registro de pregunta de control no encontrado.');
    }

    return this.prisma.controlQuestionResponse.update({
      where: { id: responseRecord.id },
      data: {
        latenciaRespuestaMs: dto.latenciaRespuestaMs,
        deltaTensionFacial: dto.deltaTensionFacial,
        detallesBiometricos: dto.detallesBiometricos || {},
        notasEvaluador: dto.notasEvaluador,
      },
    });
  }

  async finalizarSesion(sessionId: string, userId: string, dto: FinalizarSupervisionDto) {
    const sesion = await this.prisma.supervisionSession.findFirst({
      where: { id: sessionId, userId },
      include: { eventosConducta: true },
    });

    if (!sesion) throw new NotFoundException('Sesión no encontrada.');

    let score = dto.scoreIntegridad;
    if (score === undefined || score === null) {
      let penalizacion = 0;
      for (const ev of sesion.eventosConducta) {
        if (ev.tipo === 'GAZE_DOWN_SUSTAINED') penalizacion += 20;
        else if (ev.tipo === 'MULTIPLE_FACES') penalizacion += 25;
        else if (ev.tipo === 'FACE_ABSENT' && (ev.duracionMs || 0) > 5000) penalizacion += 15;
        else if (ev.tipo === 'WINDOW_BLUR' && (ev.duracionMs || 0) > 5000) penalizacion += 10;
        else if (ev.tipo === 'SHORTCUT_BLOCKED') penalizacion += 5;
        else if (ev.tipo === 'GAZE_OFFSCREEN') penalizacion += 5;
      }
      score = Math.max(0, 100 - penalizacion);
    }

    return this.prisma.supervisionSession.update({
      where: { id: sessionId },
      data: {
        estado: 'FINALIZADA',
        fin: new Date(),
        scoreIntegridad: score,
        tiempoActivoSeg: dto.tiempoActivoSeg || 0,
        tiempoOciosoSeg: dto.tiempoOciosoSeg || 0,
        tiempoFueraSeg: dto.tiempoFueraSeg || 0,
      },
    });
  }

  async obtenerSesion(sessionId: string, userId: string) {
    const sesion = await this.prisma.supervisionSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        questionnaire: true,
        eventosConducta: { orderBy: { timestamp: 'asc' } },
        respuestasControl: { include: { pregunta: true } },
      },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada.');
    return sesion;
  }
}
