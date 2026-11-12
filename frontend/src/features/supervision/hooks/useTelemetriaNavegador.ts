import { useEffect, useRef, useState, useCallback } from 'react';
import { TipoEventoConducta } from '../types/supervision.types';

interface OpcionesTelemetria {
  habilitado: boolean;
  exigirPantallaCompleta?: boolean;
  onEventoDetectado: (tipo: TipoEventoConducta, duracionMs?: number, detalles?: any) => void;
}

export function useTelemetriaNavegador({
  habilitado,
  exigirPantallaCompleta = false,
  onEventoDetectado,
}: OpcionesTelemetria) {
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false);
  const [focoPerdido, setFocoPerdido] = useState(false);
  const tiempoSalidaRef = useRef<number | null>(null);

  const solicitarPantallaCompleta = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setEnPantallaCompleta(true);
      }
    } catch (err) {
      console.warn('No se pudo activar pantalla completa:', err);
    }
  }, []);

  useEffect(() => {
    if (!habilitado) return;

    // 1. Manejo de pérdida de foco y cambio de visibilidad
    const handleBlur = () => {
      setFocoPerdido(true);
      tiempoSalidaRef.current = Date.now();
      onEventoDetectado('WINDOW_BLUR', 0, { timestamp: new Date().toISOString() });
    };

    const handleFocus = () => {
      setFocoPerdido(false);
      if (tiempoSalidaRef.current) {
        const duracionMs = Date.now() - tiempoSalidaRef.current;
        tiempoSalidaRef.current = null;
        onEventoDetectado('WINDOW_FOCUS', duracionMs, { duracionMs });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    // 2. Control de pantalla completa
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setEnPantallaCompleta(isFull);
      if (!isFull && exigirPantallaCompleta) {
        onEventoDetectado('FULLSCREEN_EXIT', 0, { salida: true });
      }
    };

    // 3. Bloqueo de atajos prohibidos y portapapeles
    const handleKeyDown = (e: KeyboardEvent) => {
      const esCtrl = e.ctrlKey || e.metaKey;
      const tecla = e.key.toLowerCase();

      // Bloquear Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+P, F12, PrintScreen
      const atajoProhibido =
        (esCtrl && ['c', 'v', 'x', 'u', 'p', 's'].includes(tecla)) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (esCtrl && e.shiftKey && ['i', 'j', 'c'].includes(tecla));

      if (atajoProhibido) {
        e.preventDefault();
        e.stopPropagation();
        onEventoDetectado('SHORTCUT_BLOCKED', 0, { atajo: e.key, ctrl: esCtrl });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onEventoDetectado('SHORTCUT_BLOCKED', 0, { accion: 'CLIC_DERECHO' });
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [habilitado, exigirPantallaCompleta, onEventoDetectado]);

  return {
    enPantallaCompleta,
    focoPerdido,
    solicitarPantallaCompleta,
  };
}
