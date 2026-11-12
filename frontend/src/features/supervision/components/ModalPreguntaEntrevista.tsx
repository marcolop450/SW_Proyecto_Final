import React from 'react';
import { HelpCircle, Clock, Activity } from 'lucide-react';
import { PreguntaControlActiva } from '../types/supervision.types';

interface Props {
  pregunta: PreguntaControlActiva;
  segundosRestantes: number;
}

export const ModalPreguntaEntrevista: React.FC<Props> = ({ pregunta, segundosRestantes }) => {
  const porcentaje = (segundosRestantes / (pregunta.tiempoEsperaSeg || 5)) * 100;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
      <div className="bg-slate-900/95 border-2 border-[#C6F432] rounded-2xl p-5 shadow-2xl backdrop-blur-md pointer-events-auto text-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C6F432]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#C6F432] font-semibold">
              Pregunta de Control • Modo Entrevista
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{segundosRestantes}s ventana focal</span>
          </div>
        </div>

        <div className="py-3">
          <p className="text-base font-semibold text-slate-100">{pregunta.pregunta}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Categoría: {pregunta.categoria}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Analizando microgestos faciales (RAM)</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso de la ventana focal de 5 segundos */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#C6F432] h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </div>
  );
};
