import { useEffect, useState } from 'react';
import { api } from '../../../api/client';
import { obtenerDetectorPose, reiniciarDetectorPose } from '../../ergonomia/services/detectorPose';
import { calcularAngulosDesdeLandmarks } from '../../ergonomia/utils/calculadorAngulosPose';
import { MotorRula } from '../../ergonomia/utils/motorRula';

export function usePosturaExamen(sessionId: string, videoRef: React.RefObject<HTMLVideoElement | null>, camaraLista: boolean) {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!camaraLista) return;
    let activo = true, ocupado = false, ultimoEnvio = 0;
    const motor = new MotorRula();
    const timer = setInterval(async () => {
      const video = videoRef.current;
      if (!activo || ocupado || !video || video.readyState < 2 || !video.videoWidth) return;
      ocupado = true;
      try {
        const detector = await obtenerDetectorPose();
        if (!activo) return;
        if (!detector) { setError('No se pudo iniciar la detección de postura.'); return; }
        const ahora = performance.now();
        const puntos = detector.detectForVideo(video, ahora).landmarks?.[0];
        if (!puntos || [0, 11, 12].some(i => !puntos[i] || (puntos[i].visibility ?? 0) < 0.5)) return;
        const angulos = calcularAngulosDesdeLandmarks(puntos);
        if (!angulos) return;
        if (ahora - ultimoEnvio < 15000 && ultimoEnvio !== 0) return;
        ultimoEnvio = ahora;
        const resultado = motor.evaluar(angulos.anguloCuello, angulos.anguloTronco, angulos.anguloBrazos, 0);
        try {
          await api.post(`/supervision/sesion/${sessionId}/evento`, { tipo: 'MEDICION_POSTURA', severidad: 'LOW', detalles: { indicadorPostura: resultado.puntaje, cuelloAngulo: angulos.anguloCuello, troncoAngulo: angulos.anguloTronco, metodo: 'estimacion_simplificada' } });
          if (activo) setError(null);
        } catch { if (activo) setError('No se pudo guardar una medición de postura.'); }
      } catch { if (activo) setError('La detección de postura no está disponible.'); }
      finally { ocupado = false; }
    }, 1000);
    return () => { activo = false; clearInterval(timer); reiniciarDetectorPose(); };
  }, [sessionId, videoRef, camaraLista]);
  return error;
}
