import React from 'react';
import { WifiOff, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { PuestoMonitoreo } from '../hooks/useWebSocketSupervisor';

interface Props {
  puesto: PuestoMonitoreo;
}

const CONFIG_SEMAFORO = {
  VERDE: {
    label: 'Óptimo',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cardBorder: 'border-emerald-500/30 hover:border-emerald-500/50',
    dotClass: 'bg-emerald-400',
    Icono: CheckCircle2,
  },
  AMARILLO: {
    label: 'Atención / Distracción',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cardBorder: 'border-amber-500/30 hover:border-amber-500/50',
    dotClass: 'bg-amber-400',
    Icono: AlertTriangle,
  },
  NARANJA: {
    label: 'Riesgo Ergonómico',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    cardBorder: 'border-orange-500/30 hover:border-orange-500/50',
    dotClass: 'bg-orange-400',
    Icono: AlertTriangle,
  },
  ROJO: {
    label: 'Anomalía Crítica',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cardBorder: 'border-rose-500/30 hover:border-rose-500/50',
    dotClass: 'bg-rose-400 animate-pulse',
    Icono: ShieldAlert,
  },
  GRIS: {
    label: 'Desconectado',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    cardBorder: 'border-slate-800 hover:border-slate-700',
    dotClass: 'bg-slate-500',
    Icono: WifiOff,
  },
};

export const TarjetaSemaforo: React.FC<Props> = ({ puesto }) => {
  const cfg = CONFIG_SEMAFORO[puesto.estado] || CONFIG_SEMAFORO.GRIS;
  const IconoEstado = cfg.Icono;

  return (
    <div
      className={`relative rounded-xl bg-slate-900/60 border ${cfg.cardBorder} p-4 transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
            <h4 className="text-xs font-semibold text-slate-200 truncate">{puesto.usuarioNombre}</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
            {puesto.tipo} • {puesto.sessionId.slice(0, 8)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono ${cfg.badgeClass}`}>
          <IconoEstado className="w-3 h-3 shrink-0" />
          <span>{cfg.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800/60">
        <div>
          <span className="text-slate-500 text-[10px] block">Riesgo RULA</span>
          <span className="font-mono font-bold text-slate-300">
            {puesto.rulaScore !== undefined ? `${puesto.rulaScore} pts` : '—'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Inclinación Pitch</span>
          <span className="font-mono font-bold text-slate-300">
            {puesto.pitchEfectivo !== undefined ? `${puesto.pitchEfectivo.toFixed(1)}°` : '—'}
          </span>
        </div>
      </div>

      {puesto.motivoAlerta && (
        <div className="mt-2 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-2 py-1 truncate">
          {puesto.motivoAlerta}
        </div>
      )}
    </div>
  );
};
