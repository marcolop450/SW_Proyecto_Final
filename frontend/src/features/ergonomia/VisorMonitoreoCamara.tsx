import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, ShieldAlert, ExternalLink, Minimize2, Maximize2, Video } from 'lucide-react';

interface VisorMonitoreoCamaraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  obstruido: boolean;
  deteccionValida: boolean;
  anguloCuello: number | null;
  anguloTronco: number | null;
  modoDiscreto: boolean;
  alAlternarModoDiscreto: () => void;
  camaraActiva: boolean;
  minimizado: boolean;
  alAlternarMinimizado: () => void;
}

export const VisorMonitoreoCamara: React.FC<VisorMonitoreoCamaraProps> = ({
  videoRef,
  canvasRef,
  obstruido,
  deteccionValida,
  anguloCuello,
  anguloTronco,
  modoDiscreto,
  alAlternarModoDiscreto,
  camaraActiva,
  minimizado,
  alAlternarMinimizado,
}) => {
  const [pipActivo, setPipActivo] = useState(false);
  const posturaEnRiesgo = (anguloCuello ?? 0) > 20 || (anguloTronco ?? 0) > 20;

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
  }, [videoRef]);

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
  }, [videoRef]);

  return (
    <div className={minimizado ? 'fixed bottom-4 right-4 z-40' : 'bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col'}>
      {minimizado && <button type="button" onClick={alAlternarMinimizado} className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-lg hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" aria-label="Mostrar el visor de cámara"><Video className="h-4 w-4 text-emerald-700"/><span>{camaraActiva ? 'Cámara en uso' : 'Cámara no disponible'} · Mostrar</span><Maximize2 className="h-3.5 w-3.5 text-slate-500"/></button>}
      <div className={minimizado ? 'sr-only' : ''} aria-hidden={minimizado} inert={minimizado}>
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">Cámara en vivo</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={alAlternarMinimizado} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100" title="Minimizar visor"><Minimize2 className="h-3.5 w-3.5"/><span className="hidden sm:inline">Minimizar</span></button>
          <button
            type="button"
            onClick={alAlternarModoDiscreto}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title={modoDiscreto ? 'Mostrar video' : 'Ocultar imagen en pantalla; la cámara sigue activa'}
          >
            {modoDiscreto ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{modoDiscreto ? 'Ver Cámara' : 'Modo Discreto'}</span>
          </button>

          <button
            type="button"
            onClick={alternarPip}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              pipActivo
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Abrir Ventana Flotante (Picture-in-Picture)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{pipActivo ? 'Flotante Activo' : 'Ventana Flotante'}</span>
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-4/3 bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Elemento de Video Mirrored */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover -scale-x-100 ${modoDiscreto ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        />

        {/* Canvas de Superposición de Esqueleto Articular */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none -scale-x-100 ${modoDiscreto ? 'hidden' : 'block'}`}
        />

        {/* Modo Discreto Activo */}
        {modoDiscreto && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-slate-300 space-y-2">
            <EyeOff className="w-8 h-8 text-slate-500" />
            <p className="text-xs font-semibold text-slate-200">Imagen oculta en pantalla</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              La cámara analiza tu postura localmente en memoria sin mostrar tu rostro en pantalla.
            </p>
          </div>
        )}

        {/* Overlay de Alerta: Cámara Obstruida o Fuera de Encuadre */}
        {(obstruido || !deteccionValida) && !modoDiscreto && (
          <div className="absolute inset-x-3 top-3 p-3 rounded-xl bg-rose-600/90 text-white backdrop-blur-xs flex items-center gap-2.5 shadow-lg animate-pulse z-10">
            <ShieldAlert className="w-5 h-5 text-white shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Cámara Obstruida o Sujeto Fuera de Encuadre</p>
              <p className="text-[11px] text-rose-100">
                Coloca tu rostro y hombros frente a la cámara para continuar.
              </p>
            </div>
          </div>
        )}

        {/* Indicador Flotante de Estado Postural en Esquina Inferior */}
        {!modoDiscreto && deteccionValida && !obstruido && anguloCuello !== null && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span
              className={`text-[10px] font-mono px-2 py-1 rounded-md backdrop-blur-md font-semibold border ${
                posturaEnRiesgo
                  ? 'bg-rose-500/80 text-white border-rose-400'
                  : 'bg-emerald-600/80 text-white border-emerald-400'
              }`}
            >
              {posturaEnRiesgo ? 'Postura Desalineada' : 'Alineación Correcta'}
            </span>
            <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-900/80 text-slate-300 backdrop-blur-md">
              Cuello: {anguloCuello.toFixed(1)}°
            </span>
          </div>
        )}
      </div>

      <div className="p-3 bg-white text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
        <span>Procesamiento en el navegador</span>
        <span className="font-medium text-slate-600">{camaraActiva ? 'Cámara en uso' : 'Cámara no disponible'}</span>
      </div>
      </div>
    </div>
  );
};
