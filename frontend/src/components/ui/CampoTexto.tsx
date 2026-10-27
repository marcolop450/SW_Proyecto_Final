import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CampoTextoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
  icono?: LucideIcon;
  accionDerecha?: React.ReactNode;
}

export const CampoTexto: React.FC<CampoTextoProps> = ({
  etiqueta,
  error,
  icono: Icono,
  accionDerecha,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (etiqueta ? etiqueta.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {etiqueta ? (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          {etiqueta}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {Icono ? (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icono className="w-4 h-4" />
          </span>
        ) : null}
        <input
          id={inputId}
          className={`w-full bg-white border ${
            error
              ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-slate-200 text-slate-800 hover:border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/15'
          } rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 shadow-2xs transition-all ${
            Icono ? 'pl-10' : ''
          } ${accionDerecha ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {accionDerecha ? (
          <div className="absolute right-3 flex items-center">
            {accionDerecha}
          </div>
        ) : null}
      </div>
      {error ? <span className="text-[11px] font-medium text-rose-600">{error}</span> : null}
    </div>
  );
};
