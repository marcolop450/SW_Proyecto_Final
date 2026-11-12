import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Maximize2, Video, Clock, CheckCircle } from 'lucide-react';
import { obtenerDetectorFacial, reiniciarDetectorFacial } from '../services/detectorFacial';
import { calcularOrientacionCabeza } from '../utils/calculadorOrientacionCabeza';
import { DetectorSospechaCelular } from '../utils/detectorSospechaCelular';
import { AuditorPresenciaRostros } from '../utils/auditorPresenciaRostros';
import { useTelemetriaNavegador } from '../hooks/useTelemetriaNavegador';
import { useModoEntrevista } from '../hooks/useModoEntrevista';
import { ModalPreguntaEntrevista } from './ModalPreguntaEntrevista';
import { api as clienteAxios } from '../../../api/client';

interface Props {
  sessionId: string;
  urlExterna: string;
  duracionMinutos: number;
  onFinalizar: () => void;
}

export const VisorSupervisionExamen: React.FC<Props> = ({
  sessionId,
  urlExterna,
  duracionMinutos,
  onFinalizar,
}) => {
  const [segundosRestantes, setSegundosRestantes] = useState(duracionMinutos * 60);
  const [infraccionActiva, setInfraccionActiva] = useState<string | null>(null);
  const [camaraLista, setCamaraLista] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorCelularRef = useRef(new DetectorSospechaCelular());
  const auditorRostrosRef = useRef(new AuditorPresenciaRostros());
  const animFrameRef = useRef<number | null>(null);

  const registrarEventoEnBackend = async (tipo: string, severidad: string, duracionMs = 0, detalles = {}) => {
    try {
      await clienteAxios.post(`/supervision/sesion/${sessionId}/evento`, {
        tipo,
        severidad,
        duracionMs,
        detalles,
      });
    } catch (_e) {}
  };

  const { enPantallaCompleta, focoPerdido, solicitarPantallaCompleta } = useTelemetriaNavegador({
    habilitado: true,
    exigirPantallaCompleta: true,
    onEventoDetectado: (tipo, duracionMs, detalles) => {
      let sev = 'LOW';
      let msg = '';
      if (tipo === 'WINDOW_BLUR') { sev = 'HIGH'; msg = 'Pérdida de foco detectada.'; }
      else if (tipo === 'FULLSCREEN_EXIT') { sev = 'HIGH'; msg = 'Salida de pantalla completa.'; }
      else if (tipo === 'SHORTCUT_BLOCKED') { sev = 'MEDIUM'; msg = 'Atajo no autorizado bloqueado.'; }
      
      setInfraccionActiva(msg);
      setTimeout(() => setInfraccionActiva(null), 3500);
      registrarEventoEnBackend(tipo, sev, duracionMs, detalles);
    },
  });

  const { preguntaActiva, segundosRestantes: segPregunta, procesarMuestraBlendshapes } = useModoEntrevista(
    async (datos) => {
      await clienteAxios.post(`/supervision/sesion/${sessionId}/respuesta-pregunta`, datos);
    },
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinalizar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinalizar]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detector: any = null;

    const iniciarInferencia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        detector = await obtenerDetectorFacial();
        setCamaraLista(true);

        const procesarFrame = () => {
          if (videoRef.current && detector && videoRef.current.readyState >= 2) {
            const timestamp = performance.now();
            const res = detector.detectForVideo(videoRef.current, timestamp);

            const caras = res.faceLandmarks || [];
            const matrices = res.facialTransformationMatrixes || [];
            const blendshapes = res.faceBlendshapes || [];

            // 1. Auditoría de presencia de rostros
            const audPresencia = auditorRostrosRef.current.evaluar(caras.length);
            if (audPresencia.evento === 'FACE_ABSENT') {
              setInfraccionActiva('Rostro ausente del encuadre.');
              registrarEventoEnBackend('FACE_ABSENT', 'HIGH', audPresencia.duracionMs);
            } else if (audPresencia.evento === 'MULTIPLE_FACES') {
              setInfraccionActiva('Múltiples personas detectadas.');
              registrarEventoEnBackend('MULTIPLE_FACES', 'CRITICAL', audPresencia.duracionMs);
            }

            // 2. Orientación de cabeza y celular
            if (caras.length === 1) {
              const orientacion = calcularOrientacionCabeza(caras[0], matrices[0]?.data);
              const { sospechaDetectada, duracionMs } = detectorCelularRef.current.evaluar(
                orientacion.pitchEfectivo,
                0,
              );

              if (sospechaDetectada) {
                setInfraccionActiva('Sospecha de dispositivo móvil en regazo.');
                registrarEventoEnBackend('GAZE_DOWN_SUSTAINED', 'HIGH', duracionMs, orientacion);
              }

              if (Math.abs(orientacion.yaw) > 30) {
                registrarEventoEnBackend('GAZE_OFFSCREEN', 'LOW', 0, orientacion);
              }

              // Procesar blendshapes en modo entrevista
              if (blendshapes.length > 0 && blendshapes[0].categories) {
                const mapBlend: Record<string, number> = {};
                for (const cat of blendshapes[0].categories) {
                  mapBlend[cat.categoryName] = cat.score;
                }
                procesarMuestraBlendshapes(mapBlend);
              }
            }
          }
          animFrameRef.current = requestAnimationFrame(procesarFrame);
        };
        animFrameRef.current = requestAnimationFrame(procesarFrame);
      } catch (err) {
        console.error('Error al inicializar cámara para supervisión:', err);
      }
    };

    iniciarInferencia();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      reiniciarDetectorFacial();
    };
  }, [sessionId, procesarMuestraBlendshapes]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-100 select-none">
      {/* Barra superior de control y estado */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Supervisión Activa
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}</span>
          </div>
        </div>

        {infraccionActiva && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{infraccionActiva}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!enPantallaCompleta && (
            <button
              onClick={solicitarPantallaCompleta}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs hover:bg-amber-500/30 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Pantalla Completa
            </button>
          )}
          <button
            onClick={onFinalizar}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#C6F432]" />
            Entregar Evaluación
          </button>
        </div>
      </div>

      {/* Contenedor del Cuestionario Externo (Google Forms) */}
      <div className="flex-1 w-full bg-white relative">
        <iframe
          src={urlExterna}
          title="Evaluación Supervisada"
          className="w-full h-full border-none"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      </div>

      {/* Miniatura flotante del sensor biométrico */}
      <div className="fixed bottom-4 right-4 w-48 aspect-video rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl z-40">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover mirror" />
        <div className="absolute top-1 left-2 flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-slate-950/80 px-1.5 rounded">
          <Video className="w-2.5 h-2.5" />
          <span>{camaraLista ? 'Visión Local Activa' : 'Cargando...'}</span>
        </div>
      </div>

      {/* Modal de Modo Entrevista cuando se activa */}
      {preguntaActiva && (
        <ModalPreguntaEntrevista pregunta={preguntaActiva} segundosRestantes={segPregunta} />
      )}
    </div>
  );
};
