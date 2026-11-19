import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Video, VideoOff, Eye, EyeOff, ExternalLink, ShieldCheck, UserCheck, AlertTriangle, UserX } from 'lucide-react';
import { obtenerDetectorFacial, reiniciarDetectorFacial } from '../services/detectorFacial';

export type EstadoPresencia = 'PRESENTE' | 'AUSENTE' | 'MULTIPLE' | 'REPOSO';

interface Props {
  enDescanso: boolean;
  onCambioEstadoPresencia: (estado: EstadoPresencia) => void;
}

export const VisorPresenciaTeletrabajo: React.FC<Props> = ({
  enDescanso,
  onCambioEstadoPresencia,
}) => {
  const [estado, setEstado] = useState<EstadoPresencia>('PRESENTE');
  const [modoDiscreto, setModoDiscreto] = useState(false);
  const [pipActivo, setPipActivo] = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const ultimoProcesoRef = useRef<number>(0);
  const inicioAusenciaRef = useRef<number | null>(null);
  const onCambioRef = useRef(onCambioEstadoPresencia);
  const ultimoEstadoNotificadoRef = useRef<EstadoPresencia | null>(null);

  useEffect(() => {
    onCambioRef.current = onCambioEstadoPresencia;
  }, [onCambioEstadoPresencia]);

  const notificarEstado = useCallback((nuevoEstado: EstadoPresencia) => {
    setEstado((prev) => (prev === nuevoEstado ? prev : nuevoEstado));
    if (ultimoEstadoNotificadoRef.current !== nuevoEstado) {
      ultimoEstadoNotificadoRef.current = nuevoEstado;
      onCambioRef.current(nuevoEstado);
    }
  }, []);

  // Iniciar / detener cámara según descanso
  useEffect(() => {
    let activo = true;

    if (enDescanso) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCamaraLista(false);
      notificarEstado('REPOSO');
      return;
    }

    const arrancarCamara = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (!activo) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
        }
        setCamaraLista(true);
      } catch (err) {
        console.error('Error al inicializar cámara para teletrabajo:', err);
      }
    };

    arrancarCamara();

    return () => {
      activo = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [enDescanso, notificarEstado]);

  // Manejo de eventos Picture-in-Picture
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const alEntrarPip = () => setPipActivo(true);
    const alSalirPip = () => setPipActivo(false);

    video.addEventListener('enterpictureinpicture', alEntrarPip);
    video.addEventListener('leavepictureinpicture', alSalirPip);

    return () => {
      video.removeEventListener('enterpictureinpicture', alEntrarPip);
      video.removeEventListener('leavepictureinpicture', alSalirPip);
    };
  }, []);

  const alternarPip = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Picture-in-Picture no disponible o denegado:', err);
    }
  }, []);

  // Bucle de inferencia facial ligero (1 FPS)
  useEffect(() => {
    let activo = true;

    const bucle = async () => {
      if (!activo) return;
      const ahora = performance.now();
      const video = videoRef.current;

      if (!enDescanso && video && video.readyState >= 2 && ahora - ultimoProcesoRef.current >= 1000) {
        ultimoProcesoRef.current = ahora;
        try {
          const detector = await obtenerDetectorFacial();
          if (detector && activo) {
            const res = detector.detectForVideo(video, ahora);
            const caras = res?.faceLandmarks || [];
            const canvas = canvasRef.current;

            if (caras.length === 1) {
              inicioAusenciaRef.current = null;
              notificarEstado('PRESENTE');
              if (canvas && !modoDiscreto) dibujarCaja(canvas, caras[0], '#10B981');
            } else if (caras.length >= 2) {
              inicioAusenciaRef.current = null;
              notificarEstado('MULTIPLE');
              if (canvas && !modoDiscreto) dibujarCaja(canvas, caras[0], '#F59E0B');
            } else {
              if (canvas) limpiarCanvas(canvas);
              if (inicioAusenciaRef.current === null) {
                inicioAusenciaRef.current = Date.now();
              }
              const transcurrido = Date.now() - inicioAusenciaRef.current;
              if (transcurrido >= 10000) {
                notificarEstado('AUSENTE');
              }
            }
          }
        } catch (_err) {
          reiniciarDetectorFacial();
        }
      }

      if (activo) animFrameRef.current = requestAnimationFrame(bucle);
    };

    animFrameRef.current = requestAnimationFrame(bucle);

    return () => {
      activo = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enDescanso, modoDiscreto, notificarEstado]);

  const dibujarCaja = (canvas: HTMLCanvasElement, landmarks: { x: number; y: number }[], color: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.clientWidth || 320;
    canvas.height = canvas.clientHeight || 240;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const p of landmarks) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const bx = minX * canvas.width;
    const by = minY * canvas.height;
    const bw = (maxX - minX) * canvas.width;
    const bh = (maxY - minY) * canvas.height;
    const corner = Math.min(bw, bh) * 0.25;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by);
    ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner);
    ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh);
    ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner);
    ctx.stroke();
  };

  const limpiarCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Barra superior de visor */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {estado === 'PRESENTE' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
          {estado === 'AUSENTE' && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />}
          {estado === 'MULTIPLE' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
          {estado === 'REPOSO' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}

          <span className="text-xs font-semibold text-slate-800">
            {estado === 'PRESENTE' && 'Presencia Verificada en Puesto'}
            {estado === 'AUSENTE' && 'Puesto Desatendido (Sin Detección)'}
            {estado === 'MULTIPLE' && 'Múltiples Personas en Encuadre'}
            {estado === 'REPOSO' && 'Sensor en Pausa (Descanso Activo)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModoDiscreto(!modoDiscreto)}
            title={modoDiscreto ? 'Mostrar video' : 'Ocultar video (Modo Discreto)'}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {modoDiscreto ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={alternarPip}
            title="Abrir Ventana Flotante (Picture-in-Picture)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              pipActivo
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{pipActivo ? 'Flotante Activo' : 'Ventana Flotante'}</span>
          </button>
        </div>
      </div>

      {/* Área de Cámara */}
      <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 flex items-center justify-center overflow-hidden">
        {enDescanso ? (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Cámara en Reposo</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Tu privacidad está protegida mientras dure la pausa programada.
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                modoDiscreto ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none ${
                modoDiscreto ? 'hidden' : 'block'
              }`}
            />
            {modoDiscreto && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-center p-6 space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <p className="text-sm font-semibold text-white">Modo Discreto Activo</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Tu imagen no es visible en pantalla, pero la verificación de presencia continúa activa en segundo plano.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
