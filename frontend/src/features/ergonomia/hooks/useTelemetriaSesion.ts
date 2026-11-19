import { useEffect, useRef } from 'react';
import { EvaluacionRula } from '../types/ergonomia.types';
import { api } from '../../../api/client';

export function useTelemetriaSesion(sessionId: string | null, evaluacion: EvaluacionRula | null): void {
  const ultimaEvaluacion = useRef(evaluacion);
  ultimaEvaluacion.current = evaluacion;

  useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(async () => {
      const muestra = ultimaEvaluacion.current;
      if (!muestra) return;
      try {
        await api.post(`/ergonomia/sesion/${sessionId}/muestra`, {
          rulaScore: muestra.puntaje,
          neckAngle: muestra.anguloCuello,
          trunkAngle: muestra.anguloTronco,
          staticLoad: muestra.cargaEstatica,
          riskLevel: muestra.nivelRiesgo,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('No se pudo guardar la medición ergonómica', error);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [sessionId]);
}
