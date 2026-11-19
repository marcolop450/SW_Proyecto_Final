import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RotateCw, Play, X, Camera, CheckCircle2 } from 'lucide-react';
import { Boton } from '../../components/ui/Boton';
import { BaselineCalibracion } from './types/ergonomia.types';
import { obtenerDetectorPose, reiniciarDetectorPose } from './services/detectorPose';
import { evaluarPresenciaFacial, evaluarLuminanciaVideo, DiagnosticoFacial } from './utils/detectorFacialOclusion';
import { calcularAngulosDesdeLandmarks } from './utils/calculadorAngulosPose';
import { calcularReferencia, type MuestraCalibracion } from './utils/calibracionPostura';
import { dibujarReticulaFacialDinamica } from './utils/dibujadorReticulaFacial';
import { BadgeEstadoCalibracion, EstadoAlineacion } from './components/BadgeEstadoCalibracion';
import { InstruccionesCalibracion } from './components/InstruccionesCalibracion';
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
  const [errorDetector, setErrorDetector] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [estadoAlineacion, setEstadoAlineacion] = useState<EstadoAlineacion>('SIN_PERSONA');
  const [calibrando, setCalibrando] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(3);
  const ultimaInferenciaRef = useRef<number>(0);
  const montadoRef = useRef(false);
  const conteoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alineacionRef = useRef<EstadoAlineacion>('SIN_PERSONA');
  const muestrasRef = useRef<MuestraCalibracion[] | null>(null);
  const ultimaMuestraRef = useRef(0);
  const deteccionInterrumpidaRef = useRef(false);
  const solicitudRef = useRef(0);
  const iniciarCamara = useCallback(async () => {
    const solicitud = ++solicitudRef.current;
    setErrorCamara(null);
    setCamaraIniciada(false);
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
        if (!montadoRef.current || solicitud !== solicitudRef.current) return;
        setErrorCamara(
          err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Permite el acceso en el navegador.'
            : 'No se detectó un dispositivo de video disponible.'
        );
        return;
      }
    }
    if (!stream) return;
    if (!montadoRef.current || solicitud !== solicitudRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = stream;
    setCamaraIniciada(true);
    stream.getVideoTracks().forEach(track => { track.onended = () => {
      if (!montadoRef.current || solicitud !== solicitudRef.current) return;
      alineacionRef.current = 'SIN_PERSONA';
      setEstadoAlineacion('SIN_PERSONA');
      setCamaraIniciada(false);
      setErrorCamara('La cámara se desconectó. Comprueba la conexión y vuelve a intentarlo.');
    }; });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  }, []);
  useEffect(() => {
    montadoRef.current = true;
    iniciarCamara();
    return () => {
      montadoRef.current = false;
      solicitudRef.current++;
      if (conteoRef.current) clearInterval(conteoRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      reiniciarDetectorPose();
    };
  }, [iniciarCamara]);
  // Análisis facial dinámico y de oclusión con MediaPipe en tiempo real
  useEffect(() => {
    if (!camaraIniciada) return;
    let cancelado = false;
    let procesando = false;
    const intervalo = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0 || cancelado || procesando) return;
      procesando = true;
      const ahora = performance.now();
      const timestampMs = Math.max(ahora, (ultimaInferenciaRef.current || 0) + 1);
      ultimaInferenciaRef.current = timestampMs;
      try {
        const lum = evaluarLuminanciaVideo(video);
        const detector = await obtenerDetectorPose();
        if (cancelado) return;
        if (!detector) { setErrorDetector(true); alineacionRef.current = 'SIN_PERSONA'; setEstadoAlineacion('SIN_PERSONA'); return; }
        setErrorDetector(false);
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
          if (!hombroIzq || !hombroDer || (hombroIzq.visibility ?? 1) < 0.35 || (hombroDer.visibility ?? 1) < 0.35 || !diag.caraVisible) {
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
        if (muestrasRef.current && nuevoEstado !== 'CENTRADO') deteccionInterrumpidaRef.current = true;
        alineacionRef.current = nuevoEstado;
        setEstadoAlineacion(nuevoEstado);
        if (muestrasRef.current && nuevoEstado === 'CENTRADO' && lm) {
          const angulos = calcularAngulosDesdeLandmarks(lm);
          if (angulos) {
            muestrasRef.current.push({ ...angulos, luminancia: lum });
            ultimaMuestraRef.current = performance.now();
          }
        }
        if (canvasRef.current) {
          dibujarReticulaFacialDinamica(canvasRef.current, diag, nuevoEstado === 'CENTRADO');
        }
      } catch (err) {
        alineacionRef.current = 'SIN_PERSONA';
        setEstadoAlineacion('SIN_PERSONA');
        console.warn('Recuperando detector en calibración:', err);
        setErrorDetector(true);
        reiniciarDetectorPose();
      } finally {
        procesando = false;
      }
    }, 220);
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [camaraIniciada]);
  const iniciarConteoCalibracion = () => {
    setAviso(null);
    muestrasRef.current = [];
    deteccionInterrumpidaRef.current = false;
    ultimaMuestraRef.current = performance.now();
    setCalibrando(true);
    setSegundosRestantes(3);
    let sec = 3;
    conteoRef.current = setInterval(() => {
      if (deteccionInterrumpidaRef.current || alineacionRef.current !== 'CENTRADO' || performance.now() - ultimaMuestraRef.current > 900) {
        if (conteoRef.current) clearInterval(conteoRef.current);
        conteoRef.current = null;
        muestrasRef.current = null;
        setCalibrando(false);
        setAviso('Se perdió la detección durante la preparación. Vuelve a colocarte y prueba otra vez.');
        return;
      }
      sec -= 1;
      setSegundosRestantes(sec);
      if (sec <= 0) {
        if (conteoRef.current) clearInterval(conteoRef.current);
        conteoRef.current = null;
        const referencia = calcularReferencia(muestrasRef.current || []);
        muestrasRef.current = null;
        if (!referencia) {
          setCalibrando(false);
          setAviso('No se obtuvieron suficientes mediciones. Comprueba la cámara y vuelve a intentarlo.');
          return;
        }
        alFinalizarCalibracion(referencia);
      }
    }, 1000);
  };
  const mensajeEstado = !camaraIniciada
    ? 'Activa la cámara para comenzar.'
    : estadoAlineacion === 'CENTRADO'
    ? 'Todo listo. Mantén esta posición y comienza la preparación.'
    : estadoAlineacion === 'CAMARA_TAPADA'
    ? 'Revisa que la cámara esté descubierta y que haya suficiente luz.'
    : estadoAlineacion === 'MANO_TAPA_CARA'
    ? 'Deja tu rostro descubierto para que la cámara pueda verlo.'
    : estadoAlineacion === 'SIN_PERSONA'
    ? 'Ubícate frente a la cámara y asegúrate de que se vean tu rostro y hombros.'
    : 'Muévete suavemente hasta quedar en el centro de la imagen.';
  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Antes de comenzar</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Prepara tu cámara y postura</h2>
          <p className="mt-1 text-sm text-slate-500">Te ayudamos a colocarte para iniciar tu sesión.</p>
        </div>
        {alCancelar && <button type="button" onClick={alCancelar} aria-label="Cerrar preparación" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>}
      </header>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,1fr)] lg:items-start">
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950">
            <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100" />
            {camaraIniciada && !errorCamara && <BadgeEstadoCalibracion estado={estadoAlineacion} />}
            {!camaraIniciada && !errorCamara && <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">Preparando la cámara…</div>}
            {errorCamara && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center text-sm text-white"><AlertTriangle className="h-7 w-7 text-amber-400" /><strong>No se pudo activar la cámara</strong><p className="text-slate-300">{errorCamara}</p><button type="button" onClick={iniciarCamara} className="mt-2 rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-100">Intentar de nuevo</button></div>}
            {calibrando && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 text-white"><span className="text-6xl font-bold text-emerald-400">{segundosRestantes}</span><p className="text-sm">Mantén tu posición unos segundos</p></div>}
          </div>
          {errorDetector && <p role="status" className="text-sm text-amber-700">No se pudo iniciar la detección de postura. Comprueba la conexión y vuelve a intentarlo; se reintentará automáticamente.</p>}
          {aviso && <p role="status" className="text-sm text-amber-700">{aviso}</p>}
          <div aria-live="polite" className={`flex items-start gap-2 text-sm ${estadoAlineacion === 'CENTRADO' && camaraIniciada ? 'text-emerald-700' : 'text-slate-600'}`}>
            {estadoAlineacion === 'CENTRADO' && camaraIniciada ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Camera className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{mensajeEstado}</span>
          </div>
        </div>
        <InstruccionesCalibracion />
      </div>
      <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
        {alCancelar && <Boton variante="secundario" onClick={alCancelar}>Cancelar</Boton>}
        <Boton variante="primario" disabled={!camaraIniciada || calibrando || !!errorCamara || estadoAlineacion !== 'CENTRADO'} onClick={iniciarConteoCalibracion}>
          {calibrando ? <RotateCw className="mr-1.5 h-4 w-4 animate-spin" /> : <Play className="mr-1.5 h-4 w-4" />}
          {calibrando ? `Preparando (${segundosRestantes} s)` : 'Iniciar preparación'}
        </Boton>
      </footer>
    </section>
  );
};
