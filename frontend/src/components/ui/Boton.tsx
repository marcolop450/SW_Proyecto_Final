import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'oscuro';
  icono?: LucideIcon;
  cargando?: boolean;
}

export const Boton: React.FC<BotonProps> = ({
  children,
  variante = 'primario',
  icono: Icono,
  cargando = false,
  className = '',
  disabled,
  ...props
}) => {
  const estilosBase =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variantes = {
    primario:
      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs shadow-emerald-600/20 font-medium',
    secundario:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-slate-300',
    peligro:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 shadow-2xs',
    fantasma:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
    oscuro:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-xs shadow-slate-900/10 font-medium',
  };

  return (
    <button
      disabled={disabled || cargando}
      className={`${estilosBase} ${variantes[variante]} ${className}`}
      {...props}
    >
      {cargando ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icono ? (
        <Icono className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
