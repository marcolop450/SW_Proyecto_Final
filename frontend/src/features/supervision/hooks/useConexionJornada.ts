import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../../../api/client';

export function useConexionJornada(sessionId: string | null, activa: boolean, tiempos: { tiempoActivoSeg: number; tiempoOciosoSeg: number; tiempoDescansoSeg: number }, onError: (mensaje: string) => void) {
  const tiemposRef = useRef(tiempos);
  const errorRef = useRef(onError);
  tiemposRef.current = tiempos; errorRef.current = onError;
  useEffect(() => {
    if (!sessionId || !activa) return;
    const socket = io(`${window.location.origin}/supervision`, { auth: { token: localStorage.getItem('ergocheck_token') }, transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('registrar_puesto', { sessionId }));
    socket.on('connect_error', () => errorRef.current('La conexión en vivo no está disponible. La jornada sigue abierta; revisa tu conexión.'));
    socket.on('disconnect', () => errorRef.current('Se interrumpió la conexión en vivo. La jornada sigue abierta y se intentará reconectar.'));
    const latido = setInterval(() => { if (socket.connected) socket.emit('heartbeat', { sessionId }); }, 5000);
    const guardar = async () => {
      const t = tiemposRef.current;
      try { await api.post(`/supervision/sesion/${sessionId}/teletrabajo/progreso`, { tiempoActivoSeg: t.tiempoActivoSeg, tiempoOciosoSeg: t.tiempoOciosoSeg, tiempoFueraSeg: t.tiempoDescansoSeg }); }
      catch { errorRef.current('No se pudo guardar el avance de la jornada. Se intentará nuevamente.'); }
    };
    const guardado = setInterval(guardar, 15000);
    return () => { clearInterval(latido); clearInterval(guardado); socket.removeAllListeners(); socket.disconnect(); };
  }, [sessionId, activa]);
}
