import React from 'react';
import { Building2, ShieldCheck, ShieldAlert, Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { Insignia } from '../ui/Insignia';

interface Props {
  alAbrirMovil?: () => void;
}

export const BarraNavegacion: React.FC<Props> = ({ alAbrirMovil }) => {
  const { usuario, tieneConsentimiento, revocarConsentimiento } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMINISTRADOR';

  return (
    <header className="h-16 bg-white/80 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        {alAbrirMovil ? (
          <button
            type="button"
            onClick={alAbrirMovil}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        ) : null}

        <div className="flex items-center gap-2 text-xs">
          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-800">
            {esSuperAdmin
              ? 'Panel Central SaaS Global'
              : (usuario?.organizationName || 'Organización')}
          </span>
          {usuario?.departamentoNombre && !esSuperAdmin ? (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
              <span className="text-slate-500 hidden sm:inline">{usuario.departamentoNombre}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Insignia variante={tieneConsentimiento ? 'exito' : 'advertencia'}>
          {tieneConsentimiento ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Consentimiento:</span>
          <span>{tieneConsentimiento ? 'Vigente' : 'Pendiente'}</span>
        </Insignia>

        {tieneConsentimiento && (
          <button
            type="button"
            onClick={revocarConsentimiento}
            title="Revocar consentimiento para volver a evaluar la autorización"
            className="text-[11px] font-medium text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Revocar
          </button>
        )}
      </div>
    </header>
  );
};
