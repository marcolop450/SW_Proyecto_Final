import { useState, useEffect, useRef, useCallback } from 'react';

export function useMedidorDedicacion(activo: boolean, enDescanso: boolean = false) {
  const [tiempoActivoSeg, setTiempoActivoSeg] = useState(0);
  const [tiempoOciosoSeg, setTiempoOciosoSeg] = useState(0);
  const [tiempoDescansoSeg, setTiempoDescansoSeg] = useState(0);
  const [estaOcioso, setEstaOcioso] = useState(false);
  const ultimoMovimientoRef = useRef(Date.now());

  const establecerTiempos = useCallback((activoSeg = 0, ociosoSeg = 0, descansoSeg = 0) => {
    setTiempoActivoSeg(activoSeg); setTiempoOciosoSeg(ociosoSeg); setTiempoDescansoSeg(descansoSeg);
    ultimoMovimientoRef.current = Date.now(); setEstaOcioso(false);
  }, []);

  useEffect(() => {
    if (!activo) return;
    if (!enDescanso) ultimoMovimientoRef.current = Date.now();
    let ultimoTick = Date.now();
    const registrarActividad = () => { ultimoMovimientoRef.current = Date.now(); setEstaOcioso(false); };
    window.addEventListener('mousemove', registrarActividad);
    window.addEventListener('keydown', registrarActividad);
    window.addEventListener('click', registrarActividad);
    window.addEventListener('scroll', registrarActividad);
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const segundos = Math.floor((ahora - ultimoTick) / 1000);
      if (segundos < 1) return;
      ultimoTick += segundos * 1000;
      if (enDescanso) { setTiempoDescansoSeg(prev => prev + segundos); setEstaOcioso(false); return; }
      const inactivo = document.hidden || ahora - ultimoMovimientoRef.current >= 180000;
      setEstaOcioso(inactivo);
      if (inactivo) setTiempoOciosoSeg(prev => prev + segundos);
      else setTiempoActivoSeg(prev => prev + segundos);
    }, 1000);
    return () => {
      window.removeEventListener('mousemove', registrarActividad); window.removeEventListener('keydown', registrarActividad);
      window.removeEventListener('click', registrarActividad); window.removeEventListener('scroll', registrarActividad);
      clearInterval(intervalo);
    };
  }, [activo, enDescanso]);
  return { tiempoActivoSeg, tiempoOciosoSeg, tiempoDescansoSeg, estaOcioso, establecerTiempos };
}
