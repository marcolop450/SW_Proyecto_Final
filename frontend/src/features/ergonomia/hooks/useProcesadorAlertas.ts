import { useState, useRef, useCallback } from 'react';
import { emitirTonoAlerta } from '../utils/sonidoAlerta';

export function useProcesadorAlertas(alertaSonoraHabilitada: boolean) {
  const [alertaVisual, setAlertaVisual] = useState<string | null>(null);
  const [alertasCount, setAlertasCount] = useState(0);
  const ultimoDisparoRef = useRef<{ motivo: string; timestamp: number }>({
    motivo: '',
    timestamp: 0,
  });

  const procesarAlerta = useCallback(
    (motivo: string | null, frecuencia = 520) => {
      if (!motivo) {
        setAlertaVisual(null);
        ultimoDisparoRef.current = { motivo: '', timestamp: 0 };
        return;
      }
      setAlertaVisual(motivo);
      const ahora = Date.now();
      const transcurrido = (ahora - ultimoDisparoRef.current.timestamp) / 1000;
      const esDistinto = ultimoDisparoRef.current.motivo !== motivo;

      // Anti-spam / Histeresis: solo registrar nuevo incidente si cambió de motivo o tras 8s
      if (esDistinto || transcurrido >= 8) {
        ultimoDisparoRef.current = { motivo, timestamp: ahora };
        setAlertasCount((prev) => prev + 1);
        if (alertaSonoraHabilitada) {
          emitirTonoAlerta(frecuencia, 160);
        }
      }
    },
    [alertaSonoraHabilitada]
  );

  return { alertaVisual, alertasCount, procesarAlerta };
}
