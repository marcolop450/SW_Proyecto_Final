import { useCallback, useEffect, useRef, useState } from 'react';

function detenerPistas(stream: MediaStream): void {
  stream.getTracks().forEach(pista => pista.stop());
}

export function usePruebaPerifericos() {
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [comprobando, setComprobando] = useState(false);
  const [dispositivosListos, setDispositivosListos] = useState(false);
  const [errorHardware, setErrorHardware] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const solicitudRef = useRef<AbortController | null>(null);

  const liberarCaptura = useCallback(() => {
    solicitudRef.current?.abort();
    solicitudRef.current = null;
    if (streamRef.current) {
      detenerPistas(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => liberarCaptura, [liberarCaptura]);

  useEffect(() => {
    if (camaraActiva && videoRef.current) videoRef.current.srcObject = streamRef.current;
  }, [camaraActiva]);

  function detenerCamaraPreview() {
    liberarCaptura();
    setCamaraActiva(false);
    setComprobando(false);
  }

  async function probarDispositivos() {
    liberarCaptura();
    setCamaraActiva(false);
    setComprobando(true);
    setErrorHardware(null);

    const solicitud = new AbortController();
    solicitudRef.current = solicitud;
    const video = { facingMode: 'user' };

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      } catch {
        if (solicitud.signal.aborted) return;
        stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
      }

      // El navegador puede resolver getUserMedia aunque el portal ya se haya cerrado.
      if (solicitud.signal.aborted) {
        detenerPistas(stream);
        return;
      }

      streamRef.current = stream;
      setCamaraActiva(true);
      setDispositivosListos(true);
    } catch {
      if (solicitud.signal.aborted) return;
      setErrorHardware('No se pudo acceder a la cámara web. Verifica los permisos del navegador.');
      setDispositivosListos(false);
    } finally {
      if (!solicitud.signal.aborted) {
        solicitudRef.current = null;
        setComprobando(false);
      }
    }
  }

  return {
    camaraActiva,
    comprobando,
    dispositivosListos,
    errorHardware,
    videoRef,
    detenerCamaraPreview,
    probarDispositivos,
  };
}
