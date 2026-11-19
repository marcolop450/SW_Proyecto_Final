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
