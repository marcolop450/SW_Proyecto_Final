import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, Clock, Bell, UserCheck } from 'lucide-react';
import { EvaluacionRula } from './types/ergonomia.types';

interface IndicadorRulaEnVivoProps {
  evaluacion: EvaluacionRula | null;
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
  activo,
  duracionSegundos,
  alertasCount,
}) => {
  const formatoTiempo = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const nivel = evaluacion?.nivelRiesgo || 'OPTIMO';
  const conf = confPorNivel[nivel];
  const puntaje = evaluacion?.puntaje || 1;
  const porcentaje = Math.min(100, Math.round((puntaje / 7) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Evaluación Biomecánica RULA</h3>
            <p className="text-xs text-slate-500">Inferencia continua ISO 11226 cada segundo</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Puntaje RULA */}
        <div className={`p-4 rounded-xl border ${conf.border} ${conf.bg} flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Puntaje Global</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${conf.badge}`}>
              {evaluacion?.etiquetaRiesgo || 'Postura Óptima'}
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${conf.text}`}>{puntaje}</span>
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
          <span className="text-xs font-semibold text-slate-800 block">Ángulos Articulares en Vivo</span>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Flexión de Cuello</span>
                <span className="font-mono font-bold text-slate-800">{evaluacion?.anguloCuello.toFixed(1) || '0.0'}°</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${(evaluacion?.anguloCuello || 0) > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ((evaluacion?.anguloCuello || 0) / 45) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Inclinación de Tronco</span>
                <span className="font-mono font-bold text-slate-800">{evaluacion?.anguloTronco.toFixed(1) || '0.0'}°</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${(evaluacion?.anguloTronco || 0) > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ((evaluacion?.anguloTronco || 0) / 50) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Elevación de Brazos</span>
                <span className="font-mono font-bold text-slate-800">{evaluacion?.anguloBrazos.toFixed(1) || '0.0'}°</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${(evaluacion?.anguloBrazos || 0) > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ((evaluacion?.anguloBrazos || 0) / 80) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carga Estática */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between space-y-2">
          <span className="text-xs font-semibold text-slate-800 block">Dinamismo & Carga Muscular</span>
          <div className={`p-3 rounded-lg border ${evaluacion?.cargaEstatica ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-700'}`}>
            <div className="flex items-center gap-2 mb-1">
              {evaluacion?.cargaEstatica ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span className="text-xs font-bold">
                {evaluacion?.cargaEstatica ? 'Sobrecarga Estática (> 60s)' : 'Postura Dinámica y Segura'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {evaluacion?.cargaEstatica
                ? `Inmovilidad sostenida por ${evaluacion.tiempoEstaticoSeg}s (+1 penalización RULA). Realice un cambio postural.`
                : 'Variación articular adecuada. Sin sobrecarga isométrica sostenida.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 font-mono">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Tiempo en riesgo acumulado: {evaluacion?.segundosEnRiesgo || 0}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
