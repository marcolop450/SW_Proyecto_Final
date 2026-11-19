import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Cpu,
} from 'lucide-react';
import type { Incidente } from './LineaTiempoIncidentes';
import { api } from '../../../api/client';

interface Props {
  incidente: Incidente | null;
  abierto: boolean;
  onCerrar: () => void;
  onAuditado: () => void;
}

export const ModalAuditarIncidente: React.FC<Props> = ({
  incidente,
  abierto,
  onCerrar,
  onAuditado,
}) => {
  if (!abierto || !incidente) return null;

  const [estadoSeleccionado, setEstadoSeleccionado] = useState<'CONFIRMADO' | 'DESESTIMADO' | 'FALSO_POSITIVO'>(
    incidente.estado === 'PENDIENTE' ? 'CONFIRMADO' : (incidente.estado as any),
  );
  const [justificacion, setJustificacion] = useState(
    incidente.justificacion || '',
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardarAuditoria = async () => {
    if (!justificacion.trim()) {
      setError('Debe ingresar una justificación o nota forense para registrar el dictamen.');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await api.put(`/supervision/incidentes/${incidente.id}/auditar`, {
        estado: estadoSeleccionado,
        justificacion: justificacion.trim(),
      });
      onAuditado();
      onCerrar();
    } catch {
      setError('Error al registrar dictamen de auditoría. Intente nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-6 space-y-5 text-slate-800">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revisar situación</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Revisa lo ocurrido y registra tu decisión
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen del Incidente */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
            <span className="font-semibold text-emerald-700">{incidente.tipo}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(incidente.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">{incidente.resumen}</p>

          {incidente.signals && incidente.signals.length > 0 && (
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <Cpu className="w-3 h-3 text-sky-600" />
              <span>{incidente.signals.length} detalle(s) disponibles</span>
            </div>
          )}
        </div>

        {/* Selección de Dictamen */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Tu decisión:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setEstadoSeleccionado('CONFIRMADO')}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                estadoSeleccionado === 'CONFIRMADO'
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span className="text-[11px]">Confirmar</span>
            </button>

            <button
              type="button"
              onClick={() => setEstadoSeleccionado('DESESTIMADO')}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                estadoSeleccionado === 'DESESTIMADO'
                  ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              <span className="text-[11px]">Desestimar</span>
            </button>

            <button
              type="button"
              onClick={() => setEstadoSeleccionado('FALSO_POSITIVO')}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                estadoSeleccionado === 'FALSO_POSITIVO'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px]">Falso Positivo</span>
            </button>
          </div>
        </div>

        {/* Justificación Forense */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Justificación Técnica / Observaciones:</span>
          </label>
          <textarea
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            rows={3}
            placeholder="Ingrese las observaciones o justificación técnica del dictamen..."
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono resize-none"
          />
          {error && <p className="text-[10px] text-rose-600 font-mono">{error}</p>}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardarAuditoria}
            disabled={guardando}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <span>{guardando ? 'Guardando Dictamen...' : 'Registrar Dictamen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
