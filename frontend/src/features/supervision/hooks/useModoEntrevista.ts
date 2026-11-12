import { useState, useRef, useCallback } from 'react';
import { PreguntaControlActiva } from '../types/supervision.types';

export function useModoEntrevista(onRespuestaCapturada: (datos: {
  preguntaId: string;
  latenciaRespuestaMs: number;
  deltaTensionFacial: number;
  detallesBiometricos: any;
}) => void) {
  const [preguntaActiva, setPreguntaActiva] = useState<PreguntaControlActiva | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState<number>(0);
  const baselineTensionRef = useRef<number>(0.15);
  const inicioPreguntaRef = useRef<number>(0);
  const temporizadorRef = useRef<any>(null);

  const recibirPreguntaControl = useCallback((pregunta: PreguntaControlActiva) => {
    setPreguntaActiva(pregunta);
    setSegundosRestantes(pregunta.tiempoEsperaSeg || 5);
    inicioPreguntaRef.current = Date.now();

    if (temporizadorRef.current) clearInterval(temporizadorRef.current);

    temporizadorRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(temporizadorRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const procesarMuestraBlendshapes = useCallback(
    (blendshapes: Record<string, number>) => {
      if (!preguntaActiva || segundosRestantes === 0) return;

      const browLeft = blendshapes['browDownLeft'] || 0;
      const browRight = blendshapes['browDownRight'] || 0;
      const tensionActual = (browLeft + browRight) / 2;
      const deltaTension = Math.max(0, tensionActual - baselineTensionRef.current);
      const latenciaMs = Date.now() - inicioPreguntaRef.current;

      onRespuestaCapturada({
        preguntaId: preguntaActiva.id,
        latenciaRespuestaMs: latenciaMs,
        deltaTensionFacial: Number(deltaTension.toFixed(3)),
        detallesBiometricos: {
          browDownLeft: browLeft,
          browDownRight: browRight,
          jawOpen: blendshapes['jawOpen'] || 0,
          mouthSmileLeft: blendshapes['mouthSmileLeft'] || 0,
        },
      });

      setPreguntaActiva(null);
      if (temporizadorRef.current) clearInterval(temporizadorRef.current);
    },
    [preguntaActiva, segundosRestantes, onRespuestaCapturada],
  );

  return {
    preguntaActiva,
    segundosRestantes,
    recibirPreguntaControl,
    procesarMuestraBlendshapes,
  };
}
