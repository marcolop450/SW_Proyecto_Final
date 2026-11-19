import React from 'react';
import { Square, Sliders, Coffee } from 'lucide-react';
import { Boton } from '../../../components/ui/Boton';

interface BarraAccionesMonitoreoProps {
  onAbrirPausa: (motivo: string) => void;
  onAbrirConfig: () => void;
  onTerminarSesion: () => void;
  finalizando: boolean;
}

export const BarraAccionesMonitoreo: React.FC<BarraAccionesMonitoreoProps> = ({
  onAbrirPausa,
  onAbrirConfig,
  onTerminarSesion,
  finalizando,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
      <div className="flex items-center gap-2">
        <Boton
          variante="secundario"
          className="py-1.5 px-3 text-xs"
          onClick={() => onAbrirPausa('Pausa activa')}
        >
          <Coffee className="w-3.5 h-3.5 text-emerald-600 mr-1" />
          <span>Pausa activa</span>
        </Boton>
        <Boton
          variante="secundario"
          className="py-1.5 px-3 text-xs"
          onClick={onAbrirConfig}
        >
          <Sliders className="w-3.5 h-3.5 mr-1" />
          <span>Configurar alertas</span>
        </Boton>
      </div>

      <Boton
        variante="peligro"
        className="py-1.5 px-3 text-xs"
        disabled={finalizando}
        onClick={onTerminarSesion}
      >
        <Square className="w-3.5 h-3.5 fill-current mr-1" />
        <span>{finalizando ? 'Finalizando…' : 'Finalizar sesión'}</span>
      </Boton>
    </div>
  );
};
