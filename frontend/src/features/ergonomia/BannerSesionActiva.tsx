import React from 'react';
import { Play, Square, Activity } from 'lucide-react';
import { Boton } from '../../components/ui/Boton';

interface BannerSesionActivaProps {
  horaInicio: string;
  alReanudar: () => void;
  alFinalizar: () => void;
}

export const BannerSesionActiva: React.FC<BannerSesionActivaProps> = ({
  horaInicio,
  alReanudar,
  alFinalizar,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900">
              Sesión en Curso
            </span>
            <span className="text-xs text-emerald-700 font-mono">
              Iniciada a las {new Date(horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            Monitoreo Biomecánico Activo en Segundo Plano
          </h3>
          <p className="text-xs text-slate-600">
            Puedes reanudar el visor con esqueleto articular o finalizar y consolidar las métricas acumuladas.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        <Boton variante="secundario" className="py-1.5 px-3 text-xs" onClick={alFinalizar}>
          <Square className="w-3.5 h-3.5 mr-1" />
          <span>Finalizar</span>
        </Boton>
        <Boton variante="primario" className="py-1.5 px-3 text-xs" onClick={alReanudar}>
          <Play className="w-3.5 h-3.5 fill-current mr-1" />
          <span>Continuar Monitoreo</span>
        </Boton>
      </div>
    </div>
  );
};
