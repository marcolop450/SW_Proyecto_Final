import React from 'react';

interface InsigniaProps {
  children: React.ReactNode;
  variante?: 'exito' | 'peligro' | 'advertencia' | 'marca' | 'neutro' | 'azul';
  className?: string;
}

export const Insignia: React.FC<InsigniaProps> = ({
  children,
  variante = 'neutro',
  className = '',
}) => {
  const variantes = {
    exito: 'bg-emerald-50 text-emerald-700 border-emerald-200/90 font-medium',
    peligro: 'bg-rose-50 text-rose-700 border-rose-200/90 font-medium',
    advertencia: 'bg-amber-50 text-amber-800 border-amber-200/90 font-medium',
    marca: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    azul: 'bg-sky-50 text-sky-700 border-sky-200/90 font-medium',
    neutro: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs border whitespace-nowrap shrink-0 ${variantes[variante]} ${className}`}
    >
      {children}
    </span>
  );
};
