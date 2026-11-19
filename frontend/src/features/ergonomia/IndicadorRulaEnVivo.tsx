import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, Clock, Bell, UserCheck } from 'lucide-react';
import { BaselineCalibracion, EvaluacionRula } from './types/ergonomia.types';

interface IndicadorRulaEnVivoProps {
  evaluacion: EvaluacionRula | null;
  baseline: BaselineCalibracion;
  activo: boolean;
  duracionSegundos: number;
  alertasCount: number;
}

const confPorNivel = {
  OPTIMO: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  BAJO: {
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-800',
    bar: 'bg-lime-500',
    badge: 'bg-lime-100 text-lime-800 border-lime-200',
  },
  MEDIO: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  CRITICO: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export const IndicadorRulaEnVivo: React.FC<IndicadorRulaEnVivoProps> = ({
  evaluacion,
  baseline,
  activo,
  duracionSegundos,
  alertasCount,
}) => {
  const formatoTiempo = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const medicion = activo ? evaluacion : null;
  const nivel = medicion?.nivelRiesgo || 'OPTIMO';
  const conf = medicion ? confPorNivel[nivel] : { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200' };
  const puntaje = medicion?.puntaje ?? 0;
  const porcentaje = Math.min(100, Math.round((puntaje / 7) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tu postura en este momento</h3>
            <p className="text-xs text-slate-500">Estimación simplificada de postura; no sustituye una evaluación profesional</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatoTiempo(duracionSegundos)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>{alertasCount} alertas</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${activo ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {activo ? 'Activo' : 'Pausado'}
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">Referencia inicial estimada: cuello {baseline.anguloCuelloBase.toFixed(1)}° · tronco {baseline.anguloTroncoBase.toFixed(1)}°. Es una comparación orientativa, no una postura ideal garantizada.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Puntaje RULA */}
        <div className={`p-4 rounded-xl border ${conf.border} ${conf.bg} flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Indicador de postura</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${conf.badge}`}>
              {medicion?.etiquetaRiesgo || 'Sin medición'}
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${conf.text}`}>{medicion ? puntaje : '—'}</span>
            <span className="text-sm text-slate-500 font-mono">/ 7.0</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div className={`h-full ${conf.bar} transition-all duration-300`} style={{ width: `${porcentaje}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 (Óptimo)</span>
              <span>4 (Aceptable)</span>
              <span>7 (Crítico)</span>
            </div>
          </div>
        </div>

        {/* Métricas Angulares */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-3">
          <span className="text-xs font-semibold text-slate-800 block">Movimientos observados</span>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Cuello</span>
                <span className="font-mono font-bold text-slate-800">{medicion ? `${medicion.anguloCuello.toFixed(1)}°` : '—'}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${(medicion?.anguloCuello || 0) > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ((medicion?.anguloCuello || 0) / 45) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Tronco</span>
                <span className="font-mono font-bold text-slate-800">{medicion ? `${medicion.anguloTronco.toFixed(1)}°` : '—'}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${(medicion?.anguloTronco || 0) > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ((medicion?.anguloTronco || 0) / 50) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Brazos</span>
                <span className="font-mono font-bold text-slate-800">{medicion ? `${medicion.anguloBrazos.toFixed(1)}°` : '—'}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${(medicion?.anguloBrazos || 0) > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ((medicion?.anguloBrazos || 0) / 80) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carga Estática */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between space-y-2">
          <span className="text-xs font-semibold text-slate-800 block">Movimiento durante la sesión</span>
          <div className={`p-3 rounded-lg border ${medicion?.cargaEstatica ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-700'}`}>
            <div className="flex items-center gap-2 mb-1">
              {medicion?.cargaEstatica ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="text-xs font-bold">
                {!medicion ? 'Esperando una medición' : medicion.cargaEstatica ? 'Poco movimiento durante más de 60 s' : 'Movimiento detectado'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {!medicion ? 'Asegúrate de que la cámara pueda verte.' : medicion.cargaEstatica
                ? `Llevas ${medicion.tiempoEstaticoSeg} segundos con poco movimiento. Considera cambiar de postura.`
                : 'Se observan cambios de postura durante la sesión.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 font-mono">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Tiempo en riesgo acumulado: {medicion ? `${medicion.segundosEnRiesgo}s` : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
