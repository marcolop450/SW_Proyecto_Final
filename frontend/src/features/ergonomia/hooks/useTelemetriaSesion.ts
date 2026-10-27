import { useEffect } from 'react';
import { EvaluacionRula } from '../types/ergonomia.types';
import { api } from '../../../api/client';

export function useTelemetriaSesion(
  sessionId: string | null,
  evaluacion: EvaluacionRula | null
): void {
  useEffect(() => {
    if (!sessionId || !evaluacion) return;

    const t = setInterval(async () => {
      try {
        await api.post(`/ergonomia/sesion/${sessionId}/muestra`, {
          rulaScore: evaluacion.puntaje,
          neckAngle: evaluacion.anguloCuello,
          trunkAngle: evaluacion.anguloTronco,
          staticLoad: evaluacion.cargaEstatica,
          riskLevel: evaluacion.nivelRiesgo,
          timestamp: new Date().toISOString(),
        });
      } catch (_e) {}
    }, 5000);

    return () => clearInterval(t);
  }, [sessionId, evaluacion]);
}
