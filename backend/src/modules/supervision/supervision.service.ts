import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearCuestionarioDto } from './dto/crear-cuestionario.dto';
import { IniciarSupervisionDto } from './dto/iniciar-supervision.dto';
import { EventoConductaDto } from './dto/evento-conducta.dto';
import { DispararPreguntaDto } from './dto/disparar-pregunta.dto';
import { RespuestaPreguntaDto } from './dto/respuesta-pregunta.dto';
import { FinalizarSupervisionDto } from './dto/finalizar-supervision.dto';
import { BitacoraInmutableService } from './services/bitacora-inmutable.service';
import * as crypto from 'crypto';
import { SupervisionGateway } from './gateways/supervision.gateway';

@Injectable()
export class SupervisionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bitacora: BitacoraInmutableService,
    private readonly gateway: SupervisionGateway,
  ) {}

  async crearCuestionario(organizacionId: string, creadorId: string, dto: CrearCuestionarioDto) {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const codigoAcceso = `EXAM-${randomSuffix}`;
    const vigenciaHoras = dto.vigenciaHoras || 24;
    const expiraEn = new Date(Date.now() + vigenciaHoras * 3600 * 1000);

    const cuestionario = await this.prisma.questionnaire.create({
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

    await this.bitacora.registrar({
      userId: creadorId,
      action: 'CREAR_CUESTIONARIO',
      entity: 'Questionnaire',
      entityId: cuestionario.id,
      categoria: 'CAMBIOS_POLITICAS',
      details: {
        titulo: dto.titulo,
        tipo: dto.tipo || 'EXAMEN',
        duracionMinutos: dto.duracionMinutos || 60,
        codigoAcceso,
      },
    });

    return cuestionario;
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

  async validarCodigo(codigoAcceso: string, organizacionId?: string) {
    const q = await this.prisma.questionnaire.findUnique({
      where: { codigoAcceso },
    });

    if (!q || !q.activo || (organizacionId && q.organizationId !== organizacionId)) {
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

    if (dto.codigoAcceso === 'TELETRABAJO' && await this.obtenerJornadaActiva(userId, organizacionId)) {
      throw new BadRequestException('Ya tienes una jornada activa. Recupérala antes de iniciar otra.');
    }

    if (dto.codigoAcceso && dto.codigoAcceso !== 'TELETRABAJO') {
      const q = await this.validarCodigo(dto.codigoAcceso, organizacionId);
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
        scoreIntegridad: tipo === 'TELETRABAJO' ? null : 100.0,
        totalIncidentes: 0,
        ...(tipo === 'TELETRABAJO' ? { eventosConducta: { create: { userId, tipo: 'JORNADA_CONFIGURACION', severidad: 'LOW', detalles: { metaHoras: dto.metaHoras || 8 } } } } : {}),
      },
      include: {
        questionnaire: true,
      },
    });

    await this.bitacora.registrar({
      userId,
      action: 'INICIAR_SESION_SUPERVISION',
      entity: 'SupervisionSession',
      entityId: sesion.id,
      categoria: 'EVENTOS_TECNICOS',
      details: {
        tipo: sesion.tipo,
        questionnaireId: sesion.questionnaireId,
        duracionMinutos: sesion.questionnaire?.duracionMinutos || 60,
      },
    });
    await this.gateway.vincularSesion(sesion.id, userId);

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
      where: { id: sessionId, userId, estado: 'EN_PROGRESO' },
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

    this.gateway.registrarTelemetria(sessionId, sesion.organizationId, evento.tipo, dto.detalles || {});

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
      where: { id: sessionId, userId, estado: 'EN_PROGRESO' },
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

    const finalizada = await this.prisma.supervisionSession.update({
      where: { id: sessionId },
      data: {
        estado: 'FINALIZADA',
        fin: new Date(),
        scoreIntegridad: sesion.tipo === 'TELETRABAJO' ? null : score,
        tiempoActivoSeg: dto.tiempoActivoSeg || 0,
        tiempoOciosoSeg: dto.tiempoOciosoSeg || 0,
        tiempoFueraSeg: dto.tiempoFueraSeg || 0,
        ...(sesion.tipo === 'TELETRABAJO' && dto.notaJornada?.trim() ? { eventosConducta: { create: { userId, tipo: 'JORNADA_NOTAS', severidad: 'LOW', detalles: { nota: dto.notaJornada.trim() } } } } : {}),
      },
    });
    this.gateway.finalizarSesion(sessionId);
    return finalizada;
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

  async listarSesionesTeletrabajo(userId: string, organizationId: string) {
    return this.prisma.supervisionSession.findMany({
      where: { userId, organizationId, tipo: 'TELETRABAJO' },
      orderBy: { inicio: 'desc' },
    });
  }

  async obtenerJornadaActiva(userId: string, organizationId: string) {
    return this.prisma.supervisionSession.findFirst({
      where: { userId, organizationId, tipo: 'TELETRABAJO', estado: 'EN_PROGRESO' },
      orderBy: { inicio: 'desc' },
      include: { eventosConducta: { where: { tipo: { in: ['PAUSA_DESCANSO', 'JORNADA_CONFIGURACION'] } }, orderBy: { timestamp: 'desc' } } },
    });
  }

  async obtenerComprobanteJornada(id: string, userId: string, organizationId: string) {
    const sesion = await this.prisma.supervisionSession.findFirst({
      where: { id, userId, organizationId, tipo: 'TELETRABAJO', estado: 'FINALIZADA', fin: { not: null } },
      include: { usuario: true, organizacion: true, eventosConducta: { where: { tipo: { in: ['PAUSA_DESCANSO', 'JORNADA_CONFIGURACION', 'JORNADA_NOTAS'] } }, orderBy: { timestamp: 'asc' } } },
    });
    if (!sesion) throw new NotFoundException('Jornada finalizada no encontrada.');
    return sesion;
  }

  async guardarProgresoTeletrabajo(id: string, userId: string, organizationId: string, dto: FinalizarSupervisionDto) {
    const resultado = await this.prisma.supervisionSession.updateMany({
      where: { id, userId, organizationId, tipo: 'TELETRABAJO', estado: 'EN_PROGRESO' },
      data: { tiempoActivoSeg: dto.tiempoActivoSeg, tiempoOciosoSeg: dto.tiempoOciosoSeg, tiempoFueraSeg: dto.tiempoFueraSeg },
    });
    if (!resultado.count) throw new NotFoundException('Jornada activa no encontrada.');
    return { guardado: true };
  }
}
