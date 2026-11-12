import React from 'react';
import { Clock, Activity, Coffee, CheckCircle, ShieldCheck } from 'lucide-react';
import { useMedidorDedicacion } from '../hooks/useMedidorDedicacion';

export const ConsolaTeletrabajo: React.FC = () => {
  const { tiempoActivoSeg, tiempoOciosoSeg, estaOcioso } = useMedidorDedicacion(true);

  const formatoTiempo = (segundosTotales: number) => {
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segs = segundosTotales % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  };

  const totalSeg = tiempoActivoSeg + tiempoOciosoSeg;
  const ratioProductivo = totalSeg > 0 ? Math.round((tiempoActivoSeg / totalSeg) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Modo Teletrabajo
            </span>
            <span className="text-xs text-slate-500 font-mono">Jornada Activa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Panel de Dedicación Efectiva y Foco Laboral
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Monitoreo transparente de tiempo activo frente a la pantalla y prevención de fatiga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-mono text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacidad por Diseño (Cero Capturas)</span>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tiempo Activo en Tarea</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-3">{formatoTiempo(tiempoActivoSeg)}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {ratioProductivo}% de la jornada en foco activo
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tiempo de Inactividad</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              estaOcioso ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-600'
            }`}>
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-3">{formatoTiempo(tiempoOciosoSeg)}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {estaOcioso ? 'Inactividad prolongada (>3 min)' : 'Pausas dentro del umbral normal'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estado de Conexión</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-lg font-bold text-slate-900">En Línea</p>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Telemetría de actividad sincronizada localmente
          </p>
        </div>
      </div>
    </div>
  );
};
