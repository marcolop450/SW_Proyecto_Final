import { useState, useEffect, useRef, useCallback } from 'react';

export function useMedidorDedicacion(activo: boolean, enDescanso: boolean = false) {
  const [tiempoActivoSeg, setTiempoActivoSeg] = useState(0);
  const [tiempoOciosoSeg, setTiempoOciosoSeg] = useState(0);
  const [tiempoDescansoSeg, setTiempoDescansoSeg] = useState(0);
  const [estaOcioso, setEstaOcioso] = useState(false);

  const ultimoMovimientoRef = useRef<number>(Date.now());
  const UMBRAL_OCIOSO_MS = 180000; // 3 minutos

  const reiniciarContadores = useCallback(() => {
    setTiempoActivoSeg(0);
    setTiempoOciosoSeg(0);
    setTiempoDescansoSeg(0);
    setEstaOcioso(false);
    ultimoMovimientoRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!activo) return;

    const registrarActividad = () => {
      ultimoMovimientoRef.current = Date.now();
      setEstaOcioso((prev) => (prev ? false : prev));
    };

    window.addEventListener('mousemove', registrarActividad);
    window.addEventListener('keydown', registrarActividad);
    window.addEventListener('click', registrarActividad);
    window.addEventListener('scroll', registrarActividad);

    const intervalo = setInterval(() => {
      if (enDescanso) {
        setTiempoDescansoSeg((prev) => prev + 1);
        setEstaOcioso(false);
        return;
      }

      const transcurridoInactivo = Date.now() - ultimoMovimientoRef.current;
      if (transcurridoInactivo >= UMBRAL_OCIOSO_MS) {
        setEstaOcioso(true);
        setTiempoOciosoSeg((prev) => prev + 1);
      } else {
        setEstaOcioso(false);
        setTiempoActivoSeg((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', registrarActividad);
      window.removeEventListener('keydown', registrarActividad);
      window.removeEventListener('click', registrarActividad);
      window.removeEventListener('scroll', registrarActividad);
      clearInterval(intervalo);
    };
  }, [activo, enDescanso]);

  return {
    tiempoActivoSeg,
    tiempoOciosoSeg,
    tiempoDescansoSeg,
    estaOcioso,
    reiniciarContadores,
  };
}
