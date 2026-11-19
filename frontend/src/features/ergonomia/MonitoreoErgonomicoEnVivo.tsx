import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BaselineCalibracion, EvaluacionRula, UmbralesAlertaConfig } from './types/ergonomia.types';
import { MotorRula } from './utils/motorRula';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { dibujarEsqueletoArticular } from './utils/dibujadorEsqueleto';
import { calcularAngulosDesdeLandmarks } from './utils/calculadorAngulosPose';
import { obtenerDetectorPose, reiniciarDetectorPose } from './services/detectorPose';
import { evaluarPresenciaFacial, evaluarLuminanciaVideo } from './utils/detectorFacialOclusion';
import { IndicadorRulaEnVivo } from './IndicadorRulaEnVivo';
import { VisorMonitoreoCamara } from './VisorMonitoreoCamara';
import { BannerAlertaPostural } from './components/BannerAlertaPostural';
import { BarraAccionesMonitoreo } from './components/BarraAccionesMonitoreo';
import { useProcesadorAlertas } from './hooks/useProcesadorAlertas';
import { useTelemetriaSesion } from './hooks/useTelemetriaSesion';
import { api } from '../../api/client';
interface MonitoreoProps {
  baseline: BaselineCalibracion;
  config: UmbralesAlertaConfig;
  sesionExistenteId?: string | null;
  onFinalizarSesion: () => void;
  onAbrirPausa: (motivo: string) => void;
  onAbrirConfig: () => void;
}
export const MonitoreoErgonomicoEnVivo: React.FC<MonitoreoProps> = ({
  baseline,
  config,
  sesionExistenteId,
  onFinalizarSesion,
  onAbrirPausa,
  onAbrirConfig,
}) => {
  const { mostrarError } = useNotificacion();
  const [finalizando, setFinalizando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(sesionExistenteId || null);
  const [evaluacion, setEvaluacion] = useState<EvaluacionRula | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [hayPersona, setHayPersona] = useState(false);
  const [modoDiscreto, setModoDiscreto] = useState(false);
  const [visorMinimizado, setVisorMinimizado] = useState(false);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const { alertaVisual, alertasCount, procesarAlerta } = useProcesadorAlertas(config.alertaSonora);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const motorRef = useRef<MotorRula>(new MotorRula());
  const reqAnimRef = useRef<number | null>(null);
  const ultimaInferenciaRef = useRef<number>(0);
  const ultimoTimestampRef = useRef<number>(0);
  const sesionIniciadaRef = useRef(false);
  // 1. Inicializar cámara web una sola vez en el montaje
  useEffect(() => {
    let activo = true;
    const iniciarCamara = async () => {
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        if (!activo || !stream) {
          if (stream) stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCamaraActiva(true);
        stream.getVideoTracks().forEach((track) => { track.onended = () => setCamaraActiva(false); });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
        }
      } catch (err) {
        console.error('Error al inicializar cámara:', err);
      }
    };
    iniciarCamara();
    return () => {
      activo = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);
  // 2. Registro de sesión en backend sin reiniciar la cámara
  useEffect(() => {
    if (sessionId || sesionIniciadaRef.current) return;
    sesionIniciadaRef.current = true;
    api.post('/ergonomia/sesion/iniciar', {
      anguloCuelloBase: baseline.anguloCuelloBase,
      anguloTroncoBase: baseline.anguloTroncoBase,
      luminanciaPromedio: baseline.luminanciaPromedio,
    }).then((res) => {
      setSessionId(res.data.id);
    }).catch((err) => {
      setErrorRegistro(true);
      mostrarError(err, 'No se pudo registrar la sesión. Puedes salir y volver a intentarlo.');
    });
  }, [baseline, sessionId]);
  // 3. Loop continuo de detección de pose y oclusión facial
  useEffect(() => {
    let activo = true;
    const loopInferencia = async () => {
      if (!activo) return;
      const video = videoRef.current;
      const ahora = performance.now();
      if (video && video.readyState >= 2 && video.videoWidth > 0 && ahora - ultimaInferenciaRef.current >= 200) {
        const timestampMs = Math.max(ahora, (ultimoTimestampRef.current || 0) + 1);
        ultimoTimestampRef.current = timestampMs;
        ultimaInferenciaRef.current = ahora;
        try {
          const lum = evaluarLuminanciaVideo(video);
          const detector = await obtenerDetectorPose();
          if (detector && activo) {
            const res = detector.detectForVideo(video, timestampMs);
            const lm = res?.landmarks?.[0] || null;
            const diag = evaluarPresenciaFacial(lm, lum);
            if (diag.camaraTapada || !diag.hayPersona || !lm) {
              setHayPersona(false);
              setEvaluacion(null);
              procesarAlerta(diag.mensajeAlerta || 'Persona no detectada o cámara obstruida', 380);
              if (canvasRef.current) dibujarEsqueletoArticular(canvasRef.current, null, 0, 0);
            } else if (diag.manoTapaCara) {
              setHayPersona(false);
              setEvaluacion(null);
              procesarAlerta('Rostro cubierto con la mano — Mantén tu vista libre', 440);
              if (canvasRef.current) dibujarEsqueletoArticular(canvasRef.current, lm, 0, 0);
            } else {
              setHayPersona(true);
              const angulos = calcularAngulosDesdeLandmarks(lm);
              if (angulos) {
                const evalActual = motorRef.current.evaluar(
                  angulos.anguloCuello,
                  angulos.anguloTronco,
                  angulos.anguloBrazos,
                  0.2
                );
                setEvaluacion(evalActual);
                if (canvasRef.current) {
                  dibujarEsqueletoArticular(canvasRef.current, lm, angulos.anguloCuello, angulos.anguloTronco);
                }
                if (evalActual.puntaje >= config.umbralRulaMinimo || evalActual.cargaEstatica) {
                  const mot = evalActual.cargaEstatica
                    ? 'Sobrecarga muscular estática (> 60s)'
                    : `Riesgo postural elevado (RULA: ${evalActual.puntaje})`;
                  procesarAlerta(mot, 520);
                } else {
                  procesarAlerta(null);
                }
              }
            }
          }
        } catch (errInferencia) {
          console.warn('Recuperando MediaPipe en monitoreo:', errInferencia);
          reiniciarDetectorPose();
          setHayPersona(false);
          setEvaluacion(null);
          if (canvasRef.current) dibujarEsqueletoArticular(canvasRef.current, null, 0, 0);
        }
      }
      if (activo) reqAnimRef.current = requestAnimationFrame(loopInferencia);
    };
    reqAnimRef.current = requestAnimationFrame(loopInferencia);
    const timer = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => {
      activo = false;
      clearInterval(timer);
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      reiniciarDetectorPose();
    };
  }, [config]);
  // 3. Telemetría periódica a base de datos cada 5s
  useTelemetriaSesion(sessionId, camaraActiva && hayPersona ? evaluacion : null);
  const terminarSesion = useCallback(async () => {
    if (finalizando) return;
    if (!sessionId) {
      if (errorRegistro) onFinalizarSesion();
      return;
    }
    setFinalizando(true);
    try {
      await api.post(`/ergonomia/sesion/${sessionId}/finalizar`, {});
      onFinalizarSesion();
    } catch (error) {
      mostrarError(error, 'No se pudo finalizar la sesión. Vuelve a intentarlo.');
    } finally {
      setFinalizando(false);
    }
  }, [sessionId, finalizando, errorRegistro, mostrarError, onFinalizarSesion]);
  return (
    <div className="space-y-4">
      {errorRegistro && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">No se pudo guardar la sesión. Finalízala y vuelve a intentarlo cuando tengas conexión.</p>}
      <BannerAlertaPostural mensaje={alertaVisual} onIniciarPausa={onAbrirPausa} />
      <div className={`grid grid-cols-1 gap-5 ${visorMinimizado ? '' : 'lg:grid-cols-3'}`}>
        <div className={`space-y-4 ${visorMinimizado ? '' : 'lg:col-span-2'}`}>
          <IndicadorRulaEnVivo
            evaluacion={evaluacion}
            baseline={baseline}
            activo={camaraActiva && hayPersona}
            duracionSegundos={segundos}
            alertasCount={alertasCount}
          />
          <BarraAccionesMonitoreo
            onAbrirPausa={onAbrirPausa}
            onAbrirConfig={onAbrirConfig}
            onTerminarSesion={terminarSesion}
            finalizando={finalizando}
          />
        </div>
        <div className="lg:col-span-1">
          <VisorMonitoreoCamara
            videoRef={videoRef}
            canvasRef={canvasRef}
            obstruido={!hayPersona}
            deteccionValida={hayPersona}
            anguloCuello={evaluacion?.anguloCuello ?? null}
            anguloTronco={evaluacion?.anguloTronco ?? null}
            camaraActiva={camaraActiva}
            minimizado={visorMinimizado}
            alAlternarMinimizado={() => setVisorMinimizado((valor) => !valor)}
            modoDiscreto={modoDiscreto}
            alAlternarModoDiscreto={() => setModoDiscreto(!modoDiscreto)}
          />
        </div>
      </div>
    </div>
  );
};
