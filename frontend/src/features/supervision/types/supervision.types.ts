export interface OrientacionCabeza {
  pitch: number; // Inclinación vertical (grados: < -20° es mirar abajo)
  yaw: number;   // Giro horizontal (grados: < -30° o > 30° es fuera de pantalla)
  roll: number;  // Balanceo lateral (grados)
  pitchEfectivo: number; // Pitch compensado con vector de iris
  gazeX: number; // -1 (izq) a 1 (der)
  gazeY: number; // -1 (abajo) a 1 (arriba)
}

export type TipoEventoConducta =
  | 'GAZE_DOWN_SUSTAINED'
  | 'GAZE_OFFSCREEN'
  | 'FACE_ABSENT'
  | 'MULTIPLE_FACES'
  | 'WINDOW_BLUR'
  | 'WINDOW_FOCUS'
  | 'FULLSCREEN_EXIT'
  | 'SHORTCUT_BLOCKED'
  | 'INACTIVITY_IDLE';

export type SeveridadEvento = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EventoConductaLocal {
  id: string;
  tipo: TipoEventoConducta;
  severidad: SeveridadEvento;
  descripcion: string;
  timestamp: Date;
  duracionMs?: number;
  detalles?: Record<string, any>;
}

export interface CuestionarioSupervisado {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'EXAMEN' | 'ENTREVISTA' | 'EVALUACION_LABORAL';
  urlExterna: string;
  duracionMinutos: number;
  codigoAcceso: string;
  expiraEn: string;
  activo: boolean;
}

export interface PreguntaControlActiva {
  id: string;
  pregunta: string;
  categoria: string;
  tiempoEsperaSeg: number;
  disparadaEn: number;
}
