import React from 'react';
import { Activity, Clock, Layers, AlertCircle } from 'lucide-react';

interface TarjetasResumenProps {
  cargando: boolean;
  resumen: {
    promedioRula: number;
    clasificacionRula: string;
    minutosMonitoreados: number;
    totalSesiones: number;
    sesionesHoy: number;
    alertasTotales: number;
  } | null;
}

export const TarjetasResumenErgonomia: React.FC<TarjetasResumenProps> = ({ cargando, resumen }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Índice RULA Promedio</span>
          <Activity className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-bold text-slate-900 font-mono">
          {cargando ? '...' : resumen ? `${resumen.promedioRula} / 7.0` : '0.0'}
        </p>
        <span className="inline-block text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {resumen?.clasificacionRula || 'Sin datos'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Minutos Monitoreados</span>
          <Clock className="w-4 h-4 text-sky-600" />
        </div>
        <p className="text-2xl font-bold text-slate-900 font-mono">
          {cargando ? '...' : `${resumen?.minutosMonitoreados || 0} min`}
        </p>
        <span className="inline-block text-[11px] text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          Tiempo real acumulado
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Sesiones Ergonómicas</span>
          <Layers className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-bold text-slate-900 font-mono">
          {cargando ? '...' : resumen?.totalSesiones || 0}
        </p>
        <span className="inline-block text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {resumen?.sesionesHoy || 0} registradas hoy
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-medium">Alertas Posturales</span>
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-slate-900 font-mono">
          {cargando ? '...' : resumen?.alertasTotales || 0}
        </p>
        <span className="inline-block text-[11px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Micro-desviaciones registradas
        </span>
      </div>
    </div>
  );
};
