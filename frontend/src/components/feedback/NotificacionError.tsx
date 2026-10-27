import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Check, X } from 'lucide-react';
import { useNotificacion } from '../../context/ContextoNotificacion';

export const NotificacionError: React.FC = () => {
  const { notificacion, cerrar } = useNotificacion();
  const [copiado, setCopiado] = useState(false);

  if (!notificacion) return null;

  const copiarReferencia = () => {
    if (notificacion.errorReference) {
      navigator.clipboard.writeText(notificacion.errorReference);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const esError = notificacion.tipo === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-4 rounded-2xl border shadow-xl backdrop-blur-md ${
          esError
            ? 'bg-slate-900/95 border-rose-500/40 text-slate-100'
            : 'bg-slate-900/95 border-emerald-500/40 text-slate-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {esError ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white">{notificacion.titulo}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notificacion.mensaje}</p>

            {notificacion.errorReference ? (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">Ref: {notificacion.errorReference}</span>
                <button
                  type="button"
                  onClick={copiarReferencia}
                  className="flex items-center gap-1 text-[#C6F432] hover:text-[#b5e028] font-semibold cursor-pointer"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? 'Copiado' : 'Copiar Incidente'}</span>
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
