import React, { useState } from 'react';
import { Monitor, ShieldCheck, PlayCircle, Activity } from 'lucide-react';
import { ConsolaMosaicoSemaforo } from '../../features/supervision/components/ConsolaMosaicoSemaforo';
import { LineaTiempoIncidentes } from '../../features/supervision/components/LineaTiempoIncidentes';
import { api } from '../../api/client';

export const PaginaConsolaSupervision: React.FC = () => {
  const [sessionIdAuditoria, setSessionIdAuditoria] = useState('');
  const [indices, setIndices] = useState<any | null>(null);
  const [correlacionando, setCorrelacionando] = useState(false);

  const ejecutarCorrelacion = async () => {
    if (!sessionIdAuditoria.trim()) return;
    setCorrelacionando(true);
    try {
      await api.post(`/supervision/correlacion/${sessionIdAuditoria.trim()}`);
      const resIndices = await api.get(`/supervision/indices/${sessionIdAuditoria.trim()}`);
      setIndices(resIndices.data);
    } catch {
      // Ignorar o manejar error
    } finally {
      setCorrelacionando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-lime-400" />
            <span>Consola de Supervisión en Tiempo Real</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo biométrico simultáneo, detección de incidentes en ventanas de 60s y semáforo SST
          </p>
        </div>
      </div>

      {/* Mosaico de puestos en vivo */}
      <ConsolaMosaicoSemaforo />

      {/* Panel de correlación y auditoría detallada de sesión */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Auditoría Forense y Motor de Correlación</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Ingrese el ID de una sesión para correlacionar eventos y consultar índices sintéticos
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="UUID de la sesión..."
              value={sessionIdAuditoria}
              onChange={(e) => setSessionIdAuditoria(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-lime-400/50 w-full sm:w-64"
            />
            <button
              onClick={ejecutarCorrelacion}
              disabled={correlacionando || !sessionIdAuditoria.trim()}
              className="px-3 py-1.5 rounded-lg bg-lime-400 text-slate-950 font-bold text-xs hover:bg-lime-300 transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{correlacionando ? 'Analizando...' : 'Correlacionar'}</span>
            </button>
          </div>
        </div>

        {indices && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Índice de Integridad</span>
                <span className="font-mono font-bold text-slate-200 text-sm">{indices.indiceIntegridad} / 100</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Bienestar Ergonómico</span>
                <span className="font-mono font-bold text-slate-200 text-sm">{indices.indiceBienestar} / 100</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <span className="font-mono font-bold text-xs">{indices.totalIncidentes}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Incidentes Detectados</span>
                <span className="font-mono text-slate-300 text-xs font-semibold">{indices.estadoSST}</span>
              </div>
            </div>
          </div>
        )}

        {sessionIdAuditoria.trim() && (
          <div className="pt-2">
            <LineaTiempoIncidentes sessionId={sessionIdAuditoria.trim()} />
          </div>
        )}
      </div>
    </div>
  );
};
