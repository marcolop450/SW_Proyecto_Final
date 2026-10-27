import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Check, X } from 'lucide-react';

export interface NotificacionItem {
  id: string;
  tipo: 'error' | 'exito' | 'advertencia';
  titulo: string;
  mensaje: string;
  errorReference?: string;
  statusCode?: number;
}

interface Props {
  notificacion: NotificacionItem | null;
  alCerrar: () => void;
}

export const NotificacionError: React.FC<Props> = ({ notificacion, alCerrar }) => {
  const [copiado, setCopiado] = useState(false);

  if (!notificacion) return null;

  const copiarCredencial = async () => {
    if (!notificacion.errorReference) return;
    try {
      await navigator.clipboard.writeText(notificacion.errorReference);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Ignorar fallback
    }
  };

  const esError = notificacion.tipo === 'error';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-fade-up">
      <div
        className={`p-4 rounded-2xl bg-white border ${
          esError ? 'border-rose-200 shadow-rose-900/5' : 'border-emerald-200 shadow-emerald-900/5'
        } shadow-lg flex items-start gap-3`}
      >
        <div className="p-1.5 rounded-xl shrink-0 mt-0.5">
          {esError ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-xs font-bold ${
              esError ? 'text-rose-900' : 'text-emerald-900'
            }`}
          >
            {notificacion.titulo}
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
            {notificacion.mensaje}
          </p>

          {notificacion.errorReference ? (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                Ref: {notificacion.errorReference}
              </span>
              <button
                type="button"
                onClick={copiarCredencial}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {copiado ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copiar ref</span>
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={alCerrar}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer shrink-0"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
