import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  abierto,
  alCerrar,
  titulo,
  subtitulo,
  children,
}) => {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl shadow-slate-900/10 animate-fade-up">
        <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-3.5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{titulo}</h3>
            {subtitulo ? <p className="text-xs text-slate-500 mt-0.5">{subtitulo}</p> : null}
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
