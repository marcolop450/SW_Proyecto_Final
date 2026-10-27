import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BaselineCalibracion, EvaluacionRula, UmbralesAlertaConfig } from './types/ergonomia.types';
import { MotorRula } from './utils/motorRula';
import { emitirTonoAlerta } from './utils/sonidoAlerta';
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
  const [sessionId, setSessionId] = useState<string | null>(sesionExistenteId || null);
  const [evaluacion, setEvaluacion] = useState<EvaluacionRula | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [hayPersona, setHayPersona] = useState(true);
  const [modoDiscreto, setModoDiscreto] = useState(false);
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
      console.error('Error al registrar sesión ergonómica:', err);
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
              procesarAlerta(diag.mensajeAlerta || 'Persona no detectada o cámara obstruida', 380);
              if (canvasRef.current) dibujarEsqueletoArticular(canvasRef.current, null, 0, 0);
            } else if (diag.manoTapaCara) {
              setHayPersona(true);
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
  useTelemetriaSesion(sessionId, evaluacion);

  const terminarSesion = useCallback(async () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    reiniciarDetectorPose();
    if (sessionId) {
      try {
        await api.post(`/ergonomia/sesion/${sessionId}/finalizar`, {
          promedioRula: evaluacion?.puntaje || 1.0,
          totalAlertas: alertasCount,
        });
      } catch (_e) {}
    }
    onFinalizarSesion();
  }, [sessionId, evaluacion, alertasCount, onFinalizarSesion]);

  return (
    <div className="space-y-4">
      <BannerAlertaPostural mensaje={alertaVisual} onIniciarPausa={onAbrirPausa} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <IndicadorRulaEnVivo
            evaluacion={evaluacion}
            activo={hayPersona}
            duracionSegundos={segundos}
            alertasCount={alertasCount}
          />
          <BarraAccionesMonitoreo
            onAbrirPausa={onAbrirPausa}
            onAbrirConfig={onAbrirConfig}
            onTerminarSesion={terminarSesion}
          />
        </div>

        <div className="lg:col-span-1">
          <VisorMonitoreoCamara
            videoRef={videoRef}
            canvasRef={canvasRef}
            obstruido={!hayPersona}
            deteccionValida={hayPersona}
            anguloCuello={evaluacion?.anguloCuello || 12.0}
            anguloTronco={evaluacion?.anguloTronco || 8.0}
            modoDiscreto={modoDiscreto}
            alAlternarModoDiscreto={() => setModoDiscreto(!modoDiscreto)}
          />
        </div>
      </div>
    </div>
  );
};
