import { useCallback, useEffect, useRef, useState } from 'react';

export function usePruebaCamara() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vigente = useRef(0);
  const [lista, setLista] = useState(false);
  const [comprobando, setComprobando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detener = useCallback(() => {
    vigente.current++;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setLista(false);
  }, []);
  useEffect(() => () => { vigente.current++; streamRef.current?.getTracks().forEach(track => track.stop()); }, []);
  const probar = useCallback(async () => {
    const intento = ++vigente.current;
    setComprobando(true); setError(null); setLista(false);
    try {
      streamRef.current?.getTracks().forEach(track => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (intento !== vigente.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('No se pudo abrir la vista previa');
      video.srcObject = stream;
      await video.play();
      if (intento !== vigente.current) return;
      stream.getVideoTracks().forEach(track => { track.onended = () => { if (intento === vigente.current) { setLista(false); setError('La cámara se desconectó. Vuelve a intentarlo.'); } }; });
      setLista(true);
    } catch (err) {
      if (intento !== vigente.current) return;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setError(err instanceof DOMException && err.name === 'NotAllowedError' ? 'Permite el acceso a la cámara en tu navegador y vuelve a intentarlo.' : 'No se pudo abrir la cámara. Comprueba que esté conectada y vuelve a intentarlo.');
    } finally { if (intento === vigente.current) setComprobando(false); }
  }, []);
  return { videoRef, lista, comprobando, error, probar, detener };
}
