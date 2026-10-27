import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface BannerAlertaPosturalProps {
  mensaje: string | null;
  onIniciarPausa: (motivo: string) => void;
}

export const BannerAlertaPostural: React.FC<BannerAlertaPosturalProps> = ({
  mensaje,
  onIniciarPausa,
}) => {
  if (!mensaje) return null;

  return (
    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-2xs animate-pulse">
      <div className="flex items-center gap-2 text-xs font-bold">
        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
        <span>{mensaje}</span>
      </div>
      <button
        onClick={() => onIniciarPausa(mensaje)}
        className="text-[11px] font-bold px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
      >
        Iniciar Pausa Activa
      </button>
    </div>
  );
};
