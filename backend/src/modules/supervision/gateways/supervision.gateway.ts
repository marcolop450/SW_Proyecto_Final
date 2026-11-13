import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type EstadoSemaforo = 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO' | 'GRIS';

export interface PuestoMonitoreo {
  sessionId: string;
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

  afterInit() {
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

  handleConnection(client: Socket) {
    client.emit('puestos_actualizados', Array.from(this.puestos.values()));
  }

  handleDisconnect(client: Socket) {
    // Marcar como gris el puesto asociado al socket
    const sessionId = client.data.sessionId;
    if (sessionId && this.puestos.has(sessionId)) {
      const puesto = this.puestos.get(sessionId)!;
      puesto.estado = 'GRIS';
      puesto.motivoAlerta = 'Socket desconectado';
      this.emitirActualizacionPuestos();
    }
  }

  @SubscribeMessage('registrar_puesto')
  handleRegistrarPuesto(client: Socket, payload: { sessionId: string; usuarioNombre: string; tipo: string }) {
    client.data.sessionId = payload.sessionId;
    const nuevoPuesto: PuestoMonitoreo = {
      sessionId: payload.sessionId,
      usuarioNombre: payload.usuarioNombre || 'Puesto Activo',
      rol: 'EVALUADO',
      tipo: payload.tipo || 'EXAMEN',
      estado: 'VERDE',
      ultimoHeartbeat: Date.now(),
    };
    this.puestos.set(payload.sessionId, nuevoPuesto);
    this.emitirActualizacionPuestos();
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(_client: Socket, payload: { sessionId: string }) {
    if (this.puestos.has(payload.sessionId)) {
      const puesto = this.puestos.get(payload.sessionId)!;
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
    _client: Socket,
    payload: {
      sessionId: string;
      estado: EstadoSemaforo;
      rulaScore?: number;
      pitchEfectivo?: number;
      motivo?: string;
    },
  ) {
    if (this.puestos.has(payload.sessionId)) {
      const puesto = this.puestos.get(payload.sessionId)!;
      puesto.estado = payload.estado;
      puesto.rulaScore = payload.rulaScore;
      puesto.pitchEfectivo = payload.pitchEfectivo;
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

  private emitirActualizacionPuestos() {
    if (this.server) {
      this.server.emit('puestos_actualizados', Array.from(this.puestos.values()));
    }
  }
}
