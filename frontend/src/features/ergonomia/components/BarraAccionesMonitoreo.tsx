import React from 'react';
import { Square, Sliders, Coffee } from 'lucide-react';
import { Boton } from '../../../components/ui/Boton';

interface BarraAccionesMonitoreoProps {
  onAbrirPausa: (motivo: string) => void;
  onAbrirConfig: () => void;
  onTerminarSesion: () => void;
}

export const BarraAccionesMonitoreo: React.FC<BarraAccionesMonitoreoProps> = ({
  onAbrirPausa,
  onAbrirConfig,
  onTerminarSesion,
}) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
      <div className="flex items-center gap-2">
        <Boton
          variante="secundario"
          className="py-1.5 px-3 text-xs"
          onClick={() => onAbrirPausa('Pausa activa')}
        >
          <Coffee className="w-3.5 h-3.5 text-emerald-600 mr-1" />
          <span>ErgoBreak</span>
        </Boton>
        <Boton
          variante="secundario"
          className="py-1.5 px-3 text-xs"
          onClick={onAbrirConfig}
        >
          <Sliders className="w-3.5 h-3.5 mr-1" />
          <span>Umbrales</span>
        </Boton>
      </div>

      <Boton
        variante="peligro"
        className="py-1.5 px-3 text-xs"
        onClick={onTerminarSesion}
      >
        <Square className="w-3.5 h-3.5 fill-current mr-1" />
        <span>Finalizar Sesión</span>
      </Boton>
    </div>
  );
};
