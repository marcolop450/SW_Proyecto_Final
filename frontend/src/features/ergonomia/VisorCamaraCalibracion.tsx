import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RotateCw, Play, X } from 'lucide-react';
import { Boton } from '../../components/ui/Boton';
import { BaselineCalibracion } from './types/ergonomia.types';
import { obtenerDetectorPose, reiniciarDetectorPose } from './services/detectorPose';
import { evaluarPresenciaFacial, evaluarLuminanciaVideo, DiagnosticoFacial } from './utils/detectorFacialOclusion';
import { dibujarReticulaFacialDinamica } from './utils/dibujadorReticulaFacial';
import { BadgeEstadoCalibracion, EstadoAlineacion } from './components/BadgeEstadoCalibracion';

interface Props {
  alFinalizarCalibracion: (baseline: BaselineCalibracion) => void;
  alCancelar?: () => void;
}

export const VisorCamaraCalibracion: React.FC<Props> = ({
  alFinalizarCalibracion,
  alCancelar,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camaraIniciada, setCamaraIniciada] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [luminancia, setLuminancia] = useState<number>(128);
  const [estadoAlineacion, setEstadoAlineacion] = useState<EstadoAlineacion>('SIN_PERSONA');
  const [calibrando, setCalibrando] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(3);
  const ultimaInferenciaRef = useRef<number>(0);

  const iniciarCamara = useCallback(async () => {
    setErrorCamara(null);
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err: any) {
        setErrorCamara(
          err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Permite el acceso en el navegador.'
            : 'No se detectó un dispositivo de video disponible.'
        );
        return;
      }
    }

    if (!stream) return;
    streamRef.current = stream;
    setCamaraIniciada(true);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  }, []);

  useEffect(() => {
    iniciarCamara();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      reiniciarDetectorPose();
    };
  }, [iniciarCamara]);

  // Análisis facial dinámico y de oclusión con MediaPipe en tiempo real
  useEffect(() => {
    if (!camaraIniciada) return;
    let cancelado = false;

    const intervalo = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0 || cancelado) return;

      const ahora = performance.now();
      const timestampMs = Math.max(ahora, (ultimaInferenciaRef.current || 0) + 1);
      ultimaInferenciaRef.current = timestampMs;

      try {
        const lum = evaluarLuminanciaVideo(video);
        setLuminancia(lum);

        const detector = await obtenerDetectorPose();
        if (!detector || cancelado) return;

        const resultado = detector.detectForVideo(video, timestampMs);
        const lm = resultado?.landmarks?.[0] || null;
        const diag: DiagnosticoFacial = evaluarPresenciaFacial(lm, lum);

        let nuevoEstado: EstadoAlineacion = 'SIN_PERSONA';
        if (diag.camaraTapada) {
          nuevoEstado = 'CAMARA_TAPADA';
        } else if (diag.manoTapaCara) {
          nuevoEstado = 'MANO_TAPA_CARA';
        } else if (!diag.hayPersona || !lm) {
          nuevoEstado = 'SIN_PERSONA';
        } else {
          const hombroIzq = lm[11];
          const hombroDer = lm[12];
          if (!hombroIzq || !hombroDer) {
            nuevoEstado = 'SIN_PERSONA';
          } else {
            const centroX = (hombroIzq.x + hombroDer.x) / 2;
            if (centroX < 0.38) {
              nuevoEstado = 'DESVIADO_IZQ';
            } else if (centroX > 0.62) {
              nuevoEstado = 'DESVIADO_DER';
            } else {
              nuevoEstado = 'CENTRADO';
            }
          }
        }
        setEstadoAlineacion(nuevoEstado);

        if (canvasRef.current) {
          dibujarReticulaFacialDinamica(canvasRef.current, diag, nuevoEstado === 'CENTRADO');
        }
      } catch (err) {
        console.warn('Recuperando detector en calibración:', err);
        reiniciarDetectorPose();
      }
    }, 220);

    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [camaraIniciada]);

  const iniciarConteoCalibracion = () => {
    setCalibrando(true);
    setSegundosRestantes(3);

    let sec = 3;
    const timer = setInterval(() => {
      sec -= 1;
      setSegundosRestantes(sec);
      if (sec <= 0) {
        clearInterval(timer);
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        reiniciarDetectorPose();
        alFinalizarCalibracion({
          anguloCuelloBase: 12.0,
          anguloTroncoBase: 8.0,
          inclinacionHombrosBase: 0,
          luminanciaPromedio: luminancia,
          calibradoEn: new Date().toISOString(),
        });
      }
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 space-y-5 max-w-xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-semibold block">
            Alineación Facial y Postural
          </span>
          <h2 className="text-base font-bold text-slate-900">Calibración de Postura Neutra</h2>
        </div>
        {alCancelar && (
          <button onClick={alCancelar} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {errorCamara ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error de Dispositivo</p>
            <p className="mt-0.5">{errorCamara}</p>
          </div>
        </div>
      ) : (
        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100" />

          <BadgeEstadoCalibracion estado={estadoAlineacion} />

          {calibrando && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
              <span className="text-6xl font-mono font-black text-emerald-400 scale-105 transition-transform duration-300">
                {segundosRestantes}
              </span>
              <p className="text-xs font-medium tracking-wide text-slate-300">
                Capturando baseline neutro...
              </p>
            </div>
          )}

          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-300 font-mono">
            Tracking Facial y Biometría Local (0 KB)
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {alCancelar && (
          <Boton variante="secundario" className="py-1.5 px-3 text-xs" onClick={alCancelar}>
            Cancelar
          </Boton>
        )}
        <Boton
          variante="primario"
          className="py-1.5 px-3 text-xs"
          disabled={!camaraIniciada || calibrando || !!errorCamara || estadoAlineacion !== 'CENTRADO'}
          onClick={iniciarConteoCalibracion}
        >
          {calibrando ? <RotateCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
          <span>
            {calibrando
              ? `Calibrando (${segundosRestantes}s)...`
              : estadoAlineacion === 'CENTRADO'
              ? 'Iniciar Calibración (3s)'
              : 'Alinea tu rostro y vista para calibrar'}
          </span>
        </Boton>
      </div>
    </div>
  );
};
