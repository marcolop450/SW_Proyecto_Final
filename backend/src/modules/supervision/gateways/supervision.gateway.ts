import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { PuestosPersistidosService } from '../services/puestos-persistidos.service';
import type { EstadoSemaforo, PuestoMonitoreo } from '../types/puesto-monitoreo';

export type { EstadoSemaforo, PuestoMonitoreo } from '../types/puesto-monitoreo';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/supervision' })
export class SupervisionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnApplicationBootstrap, OnModuleDestroy {
  @WebSocketServer()
  server: Namespace;

  private puestos: Map<string, PuestoMonitoreo> = new Map();
  private watchdogInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly puestosPersistidos: PuestosPersistidosService,
  ) {}

  afterInit() {
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
  }

  async onApplicationBootstrap() {
    await this.cargarSesionesDesdeBaseDatos();

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

  onModuleDestroy() {
    if (this.watchdogInterval) clearInterval(this.watchdogInterval);
    this.watchdogInterval = null;
  }

  async cargarSesionesDesdeBaseDatos(organizationId?: string): Promise<PuestoMonitoreo[]> {
    try {
      await this.puestosPersistidos.recuperar(this.puestos, organizationId);
      this.emitirActualizacionPuestos();
    } catch {
      return this.obtenerPuestos(organizationId);
    }

    return this.obtenerPuestos(organizationId);
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
    await this.puestosPersistidos.simularDemo(this.puestos, organizationId);
    this.emitirActualizacionPuestos();
    return this.obtenerPuestos(organizationId);
  }

  private emitirActualizacionPuestos() {
    if (this.server) {
      this.puestos.forEach((puesto) => this.server.to(`org:${puesto.organizationId}`).emit('puestos_actualizados', this.obtenerPuestos(puesto.organizationId)));
    }
  }
}
