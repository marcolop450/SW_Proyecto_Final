import { useState, useRef, useCallback, useEffect } from 'react';
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
  const onRespuestaRef = useRef(onRespuestaCapturada);
  const preguntaRef = useRef<PreguntaControlActiva | null>(null);
  const segundosRef = useRef<number>(0);

  useEffect(() => {
    onRespuestaRef.current = onRespuestaCapturada;
  }, [onRespuestaCapturada]);

  useEffect(() => {
    preguntaRef.current = preguntaActiva;
    segundosRef.current = segundosRestantes;
  }, [preguntaActiva, segundosRestantes]);

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

  const procesarMuestraBlendshapes = useCallback((blendshapes: Record<string, number>) => {
    const actual = preguntaRef.current;
    if (!actual || segundosRef.current === 0) return;

    const browLeft = blendshapes['browDownLeft'] || 0;
    const browRight = blendshapes['browDownRight'] || 0;
    const tensionActual = (browLeft + browRight) / 2;
    const deltaTension = Math.max(0, tensionActual - baselineTensionRef.current);
    const latenciaMs = Date.now() - inicioPreguntaRef.current;

    onRespuestaRef.current({
      preguntaId: actual.id,
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
  }, []);

  return {
    preguntaActiva,
    segundosRestantes,
    recibirPreguntaControl,
    procesarMuestraBlendshapes,
  };
}
