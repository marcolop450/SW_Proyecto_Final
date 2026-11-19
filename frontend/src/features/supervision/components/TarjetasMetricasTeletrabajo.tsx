import React from 'react';
import { Clock, Activity, Coffee, CheckCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { EstadoPresencia } from './VisorPresenciaTeletrabajo';

interface Props {
  tiempoActivoSeg: number;
  tiempoOciosoSeg: number;
  tiempoDescansoSeg: number;
  estaOcioso: boolean;
  totalPausas: number;
  estadoPresencia: EstadoPresencia;
  enDescanso: boolean;
  ratioProductivo: number;
  formatoTiempo: (s: number) => string;
}

export const TarjetasMetricasTeletrabajo: React.FC<Props> = ({
  tiempoActivoSeg,
  tiempoOciosoSeg,
  tiempoDescansoSeg,
  estaOcioso,
  totalPausas,
  estadoPresencia,
  enDescanso,
  ratioProductivo,
  formatoTiempo,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">Actividad en esta página</span>
        <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{formatoTiempo(tiempoActivoSeg)}</p>
        <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          {ratioProductivo}% de la sesión activa
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">Inactividad de Mouse/Teclado</span>
        <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{formatoTiempo(tiempoOciosoSeg)}</p>
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          {estaOcioso ? 'Inactividad detectada (>3 min)' : 'Dentro del umbral normal'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">Pausas Acumuladas</span>
        <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{formatoTiempo(tiempoDescansoSeg)}</p>
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          {totalPausas} {totalPausas === 1 ? 'pausa registrada' : 'pausas registradas'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">Presencia en Puesto</span>
        <div className="mt-2 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            enDescanso ? 'bg-blue-500' :
            estadoPresencia === 'PRESENTE' ? 'bg-emerald-500 animate-pulse' :
            estadoPresencia === 'AUSENTE' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <p className="text-xl font-bold text-slate-900">
            {enDescanso ? 'En Pausa' :
             estadoPresencia === 'PRESENTE' ? 'Detectada' :
             estadoPresencia === 'AUSENTE' ? 'Ausente' : estadoPresencia === 'MULTIPLE' ? 'Múltiples' : estadoPresencia === 'REPOSO' ? 'Pausada' : 'No disponible'}
          </p>
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-1">
          {enDescanso || estadoPresencia === 'REPOSO' ? 'Cámara en reposo' : estadoPresencia === 'NO_DISPONIBLE' ? 'Comprueba la cámara' : 'Detección de presencia en vivo'}
        </p>
      </div>
    </div>
  );
};
