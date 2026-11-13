import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../../context/ContextoAutenticacion';

export interface PuestoMonitoreo {
  sessionId: string;
  usuarioNombre: string;
  rol: string;
  tipo: string;
  estado: 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO' | 'GRIS';
  rulaScore?: number;
  pitchEfectivo?: number;
  ultimoHeartbeat: number;
  motivoAlerta?: string;
}

export function useWebSocketSupervisor() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [puestos, setPuestos] = useState<PuestoMonitoreo[]>([]);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    // Si no hay token, no intentamos conectar
    if (!token) return;

    const socketUrl = window.location.origin;
    const socket = io(`${socketUrl}/supervision`, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConectado(true);
    });

    socket.on('disconnect', () => {
      setConectado(false);
    });

    socket.on('puestos_actualizados', (data: PuestoMonitoreo[]) => {
      setPuestos(data || []);
    });

    heartbeatRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat', { ts: Date.now() });
      }
    }, 10000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      socket.disconnect();
    };
  }, [token]);

  const emitirActualizacion = useCallback((payload: any) => {
    socketRef.current?.emit('actualizar_estado', payload);
  }, []);

  const registrarPuesto = useCallback((sessionId: string, usuarioNombre: string, tipo: string) => {
    socketRef.current?.emit('registrar_puesto', { sessionId, usuarioNombre, tipo });
  }, []);

  return { puestos, conectado, emitirActualizacion, registrarPuesto };
}
