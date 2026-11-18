import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export type EstadoSemaforo = 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO' | 'GRIS';

export interface PuestoMonitoreo {
  sessionId: string;
  organizationId: string;
  usuarioNombre: string;
  rol: string;
  tipo: string;
  estado: EstadoSemaforo;
  rulaScore?: number;
  pitchEfectivo?: number;
  ultimoHeartbeat: number;
  motivoAlerta?: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/supervision' })
export class SupervisionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private puestos: Map<string, PuestoMonitoreo> = new Map();
  private watchdogInterval: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async afterInit() {
    this.server.use(async (client, next) => {
      try {
        const token = client.handshake.auth?.token;
        if (!token) return next(new Error('No autenticado'));
        const payload = await this.jwt.verifyAsync<{ sub: string; organizationId: string }>(token);
        const membership = await this.prisma.usuarioOrganizacion.findFirst({
          where: { usuarioId: payload.sub, organizacionId: payload.organizationId, usuario: { activo: true }, organizacion: { activo: true } },
          select: { usuarioId: true, organizacionId: true },
        });
        if (!membership) return next(new Error('No autorizado'));
        client.data.userId = membership.usuarioId;
        client.data.organizationId = membership.organizacionId;
        next();
      } catch { next(new Error('No autenticado')); }
    });
    // Cargar sesiones reales desde PostgreSQL al iniciar
    await this.cargarSesionesDesdeBaseDatos();

    // Watchdog timer a 15 segundos: si no recibe heartbeat, conmuta a GRIS
    this.watchdogInterval = setInterval(() => {
      const ahora = Date.now();
      let cambio = false;

      this.puestos.forEach((puesto) => {
        if (puesto.estado !== 'GRIS' && ahora - puesto.ultimoHeartbeat > 15000) {
          puesto.estado = 'GRIS';
          puesto.motivoAlerta = 'Conexión perdida (watchdog > 15s)';
          cambio = true;
        }
      });

      if (cambio) {
        this.emitirActualizacionPuestos();
      }
    }, 5000);
  }

  async cargarSesionesDesdeBaseDatos(organizationId?: string): Promise<PuestoMonitoreo[]> {
    try {
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

        this.puestos.set(sesion.id, puesto);
      }

      this.emitirActualizacionPuestos();
      return this.obtenerPuestos(organizationId);
    } catch {
      return this.obtenerPuestos(organizationId);
    }
  }

  handleConnection(client: Socket) {
    const organizationId = client.data.organizationId;
    client.join(`org:${organizationId}`);
    client.emit('puestos_actualizados', this.obtenerPuestos(organizationId));
  }

  handleDisconnect(client: Socket) {
    const sessionId = client.data.sessionId;
    if (sessionId && this.puestos.has(sessionId)) {
      const puesto = this.puestos.get(sessionId)!;
      puesto.estado = 'GRIS';
      puesto.motivoAlerta = 'Socket desconectado';
      this.emitirActualizacionPuestos();
    }
  }

  @SubscribeMessage('registrar_puesto')
  async handleRegistrarPuesto(client: Socket, payload: { sessionId: string }) {
    if (!client.data.userId || !payload?.sessionId) return;
    const session = await this.prisma.supervisionSession.findFirst({
      where: { id: payload.sessionId, userId: client.data.userId, organizationId: client.data.organizationId, estado: 'EN_PROGRESO' },
      include: { usuario: true },
    });
    if (!session) return;
    client.data.sessionId = session.id;
    client.join(`session:${session.id}`);
    this.registrarSesionActiva({ sessionId: session.id, organizationId: session.organizationId, usuarioNombre: `${session.usuario.nombre} ${session.usuario.apellido}`, tipo: session.tipo });
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(client: Socket, payload?: { sessionId?: string }) {
    const sessionId = payload?.sessionId || client.data?.sessionId;
    if (sessionId && this.puestos.has(sessionId)) {
      const puesto = this.puestos.get(sessionId)!;
      puesto.ultimoHeartbeat = Date.now();
      if (puesto.estado === 'GRIS') {
        puesto.estado = 'VERDE';
        puesto.motivoAlerta = undefined;
        this.emitirActualizacionPuestos();
      }
    }
  }

  @SubscribeMessage('actualizar_estado')
  handleActualizarEstado(
    client: Socket,
    payload: {
      sessionId?: string;
      estado: EstadoSemaforo;
      rulaScore?: number;
      pitchEfectivo?: number;
      motivo?: string;
    },
  ) {
    const sessionId = payload.sessionId || client.data?.sessionId;
    if (sessionId && sessionId === client.data?.sessionId && this.puestos.has(sessionId)) {
      const puesto = this.puestos.get(sessionId)!;
      puesto.estado = payload.estado;
      if (payload.rulaScore !== undefined) puesto.rulaScore = payload.rulaScore;
      if (payload.pitchEfectivo !== undefined) puesto.pitchEfectivo = payload.pitchEfectivo;
      puesto.motivoAlerta = payload.motivo;
      puesto.ultimoHeartbeat = Date.now();
      this.emitirActualizacionPuestos();
    }
  }

  public actualizarEstadoDesdeServicio(sessionId: string, estado: EstadoSemaforo, motivo?: string) {
    if (this.puestos.has(sessionId)) {
      const p = this.puestos.get(sessionId)!;
      p.estado = estado;
      p.motivoAlerta = motivo;
      this.emitirActualizacionPuestos();
    }
  }

  public obtenerPuestos(organizationId?: string): PuestoMonitoreo[] {
    return Array.from(this.puestos.values()).filter((p) => !organizationId || p.organizationId === organizationId);
  }

  public registrarSesionActiva(input: Pick<PuestoMonitoreo, 'sessionId' | 'organizationId' | 'usuarioNombre' | 'tipo'>) {
    this.puestos.set(input.sessionId, {
      ...input,
      rol: 'EVALUADO',
      estado: 'VERDE',
      ultimoHeartbeat: Date.now(),
      motivoAlerta: 'Examen iniciado; esperando telemetría',
    });
    this.emitirActualizacionPuestos();
  }

  public async vincularSesion(sessionId: string, userId: string) {
    const session = await this.prisma.supervisionSession.findFirst({
      where: { id: sessionId, userId, estado: 'EN_PROGRESO' },
      include: { usuario: true },
    });
    if (!session) return;
    this.registrarSesionActiva({
      sessionId,
      organizationId: session.organizationId,
      usuarioNombre: `${session.usuario.nombre} ${session.usuario.apellido}`,
      tipo: session.tipo,
    });
  }

  public registrarTelemetria(sessionId: string, organizationId: string, tipo: string, detalles: any) {
    const puesto = this.puestos.get(sessionId);
    if (!puesto || puesto.organizationId !== organizationId) return;
    puesto.ultimoHeartbeat = Date.now();
    const rula = Number(detalles?.rulaScore);
    if (Number.isFinite(rula)) puesto.rulaScore = rula;
    const pitch = Number(detalles?.pitchEfectivo ?? detalles?.pitch);
    if (Number.isFinite(pitch)) puesto.pitchEfectivo = pitch;
    if (['MULTIPLE_FACES', 'FACE_ABSENT'].includes(tipo)) {
      puesto.estado = 'ROJO'; puesto.motivoAlerta = tipo === 'MULTIPLE_FACES' ? 'Múltiples rostros detectados' : 'Rostro ausente';
    } else if (tipo === 'POSTURA_FORZADA' || (Number.isFinite(rula) && rula >= 5)) {
      puesto.estado = 'NARANJA'; puesto.motivoAlerta = 'Riesgo ergonómico detectado';
    } else if (['GAZE_OFFSCREEN', 'WINDOW_BLUR', 'GAZE_DOWN_SUSTAINED'].includes(tipo)) {
      puesto.estado = 'AMARILLO'; puesto.motivoAlerta = 'Distracción o desvío de mirada detectado';
    } else {
      puesto.estado = 'VERDE'; puesto.motivoAlerta = undefined;
    }
    this.emitirActualizacionPuestos();
  }

  public finalizarSesion(sessionId: string) {
    const puesto = this.puestos.get(sessionId);
    if (!puesto) return;
    puesto.estado = 'GRIS';
    puesto.motivoAlerta = 'Examen finalizado';
    this.emitirActualizacionPuestos();
  }

  public limpiarPuestos() {
    this.puestos.clear();
    this.emitirActualizacionPuestos();
  }

  public async simularPuestosDemo(organizationId: string): Promise<PuestoMonitoreo[]> {
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

    for (const [sessionId, puesto] of this.puestos) {
      if (puesto.organizationId === orgId) this.puestos.delete(sessionId);
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

      this.puestos.set(sesion.id, puesto);
    }

    this.emitirActualizacionPuestos();
    return this.obtenerPuestos(orgId);
  }

  private emitirActualizacionPuestos() {
    if (this.server) {
      this.puestos.forEach((puesto) => this.server.to(`org:${puesto.organizationId}`).emit('puestos_actualizados', this.obtenerPuestos(puesto.organizationId)));
    }
  }
}
