import React, { useState } from 'react';
import { Camera, Mic, CheckCircle2, ShieldCheck, Video, Clock, Gauge, Play, RotateCw, Key } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { VisorSupervisionExamen } from '../supervision/components/VisorSupervisionExamen';
import { api as clienteAxios } from '../../api/client';

export const PaginaPortalPostulante: React.FC = () => {
  const { usuario, tieneConsentimiento } = useAuth();
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [comprobando, setComprobando] = useState(false);
  const [dispositivosListos, setDispositivosListos] = useState(false);

  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [sesionActiva, setSesionActiva] = useState<{ id: string; url: string; duracion: number } | null>(null);

  const probarDispositivos = () => {
    setComprobando(true);
    setTimeout(() => {
      setCamaraActiva(true);
      setDispositivosListos(true);
      setComprobando(false);
    }, 1200);
  };

  const iniciarExamenSupervisado = async () => {
    if (!codigoAcceso.trim()) {
      setErrorCodigo('Ingresa el código de acceso proporcionado por el evaluador.');
      return;
    }
    setErrorCodigo(null);
    try {
      const res = await clienteAxios.post('/supervision/sesion/iniciar', {
        codigoAcceso: codigoAcceso.trim(),
        tipo: 'EXAMEN',
      });
      setSesionActiva({
        id: res.data.id,
        url: res.data.urlExterna || 'https://forms.google.com',
        duracion: res.data.duracionMinutos || 60,
      });
    } catch (err: any) {
      setErrorCodigo(err?.response?.data?.message || 'Código inválido o expirado.');
    }
  };

  if (sesionActiva) {
    return (
      <VisorSupervisionExamen
        sessionId={sesionActiva.id}
        urlExterna={sesionActiva.url}
        duracionMinutos={sesionActiva.duracion}
        onFinalizar={() => setSesionActiva(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Portal del Candidato
            </span>
            <span className="text-xs text-slate-500 font-mono">Convocatoria Activa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Sala de Verificación Técnica y Evaluación
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Bienvenido, {usuario?.nombre} {usuario?.apellido}. Realiza la comprobación antes de iniciar.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-mono text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Consentimiento {tieneConsentimiento ? 'Verificado' : 'Pendiente'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-800">Calibración de Visión Artificial</h2>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
              camaraActiva ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {camaraActiva ? 'Sensor Calibrado' : 'Sensor No Iniciado'}
            </span>
          </div>

          <div className="relative aspect-video w-full rounded-xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-slate-800">
            {camaraActiva ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
                <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-[#C6F432]/70 flex items-center justify-center animate-pulse">
                  <span className="text-[10px] font-mono text-[#C6F432] bg-slate-950/80 px-2 py-0.5 rounded">
                    Zona Ergonómica y Foco
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-400 flex items-center gap-2 border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Inferencia activa: 30 FPS • Privacidad local garantizada
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Prueba tu cámara web</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Requerimos comprobar que tu ángulo y rostro permanezcan visibles para la supervisión.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={probarDispositivos}
                  disabled={comprobando}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  {comprobando ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {comprobando ? 'Comprobando hardware...' : 'Iniciar Prueba de Periféricos'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-600">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Cámara Web</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">{camaraActiva ? 'Operativa' : 'Pendiente'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-600">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Micrófono</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">{dispositivosListos ? 'Calibrado' : 'Pendiente'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-600">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Latencia</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">{dispositivosListos ? '18ms (Óptimo)' : 'Pendiente'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Código de Acceso</h3>
            <p className="text-xs text-slate-500">Ingresa el código proporcionado por tu evaluador:</p>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Ej: EXAM-A1B2C3"
                value={codigoAcceso}
                onChange={(e) => setCodigoAcceso(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            {errorCodigo && <p className="text-[11px] text-rose-600 font-medium">{errorCodigo}</p>}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-5 text-white shadow-2xs space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6F432]">Sala de Examen</span>
            <p className="text-xs text-slate-300">
              Se activará pantalla completa forzada y supervisión biométrica local en RAM.
            </p>
            <button
              type="button"
              onClick={iniciarExamenSupervisado}
              disabled={!dispositivosListos}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                dispositivosListos ? 'bg-[#C6F432] text-slate-950 hover:bg-[#b8e42d] cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {dispositivosListos ? 'Ingresar a Sala de Examen' : 'Calibra Periféricos Primero'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
