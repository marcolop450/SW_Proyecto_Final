import React from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface VisorMonitoreoCamaraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  obstruido: boolean;
  deteccionValida: boolean;
  anguloCuello: number;
  anguloTronco: number;
  modoDiscreto: boolean;
  alAlternarModoDiscreto: () => void;
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
}) => {
  const posturaEnRiesgo = anguloCuello > 20 || anguloTronco > 20;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">Cámara y Biometría en Vivo</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600">
            Edge AI Local
          </span>
        </div>

        <button
          type="button"
          onClick={alAlternarModoDiscreto}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title={modoDiscreto ? 'Mostrar visor' : 'Ocultar video por privacidad'}
        >
          {modoDiscreto ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{modoDiscreto ? 'Ver Cámara' : 'Modo Discreto'}</span>
        </button>
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
            <p className="text-xs font-semibold text-slate-200">Modo Discreto de Privacidad Activo</p>
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
                Alinea tu rostro y hombros frente a la cámara para reanudar la inferencia postural.
              </p>
            </div>
          </div>
        )}

        {/* Indicador Flotante de Estado Postural en Esquina Inferior */}
        {!modoDiscreto && deteccionValida && !obstruido && (
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
        <span>0 KB transmitidos (Procesamiento en RAM)</span>
        <span className="font-mono text-emerald-600 font-medium">Tracking Activo</span>
      </div>
    </div>
  );
};
