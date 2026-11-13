import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { api } from '../../../api/client';

export interface Incidente {
  id: string;
  sessionId: string;
  tipo: string;
  severidad: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'DESESTIMADO' | 'FALSO_POSITIVO';
  resumen: string;
  signals?: any[];
  timestamp: string;
  justificacion?: string;
}

interface Props {
  sessionId: string;
}

const SEVERIDAD_CONFIG = {
  CRITICAL: { label: 'Crítico', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  HIGH: { label: 'Alto', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  MEDIUM: { label: 'Medio', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  LOW: { label: 'Bajo', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export const LineaTiempoIncidentes: React.FC<Props> = ({ sessionId }) => {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [auditandoId, setAuditandoId] = useState<string | null>(null);

  const cargarIncidentes = async () => {
    if (!sessionId) return;
    setCargando(true);
    try {
      const res = await api.get(`/supervision/incidentes/${sessionId}`);
      setIncidentes(res.data || []);
    } catch {
      setIncidentes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIncidentes();
  }, [sessionId]);

  const auditar = async (incidenteId: string, estado: string) => {
    setAuditandoId(incidenteId);
    try {
      await api.put(`/supervision/incidentes/${incidenteId}/auditar`, {
        estado,
        justificacion: `Auditado por el supervisor de turno (${estado})`,
      });
      await cargarIncidentes();
    } catch {
      // Ignorar o registrar error
    } finally {
      setAuditandoId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-lime-400" />
          <h4 className="text-xs font-semibold text-slate-200">Incidentes Correlacionados</h4>
          <span className="text-[10px] font-mono text-slate-500">({incidentes.length})</span>
        </div>
        <button
          onClick={cargarIncidentes}
          disabled={cargando}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Actualizar incidentes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {incidentes.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-xs font-mono">
          Cero anomalías o incidentes reportados en esta sesión
        </div>
      ) : (
        <div className="space-y-2">
          {incidentes.map((inc) => {
            const sev = SEVERIDAD_CONFIG[inc.severidad] || SEVERIDAD_CONFIG.LOW;
            return (
              <div
                key={inc.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono ${sev.badge}`}>
                        {sev.label}
                      </span>
                      <span className="font-semibold text-slate-200 text-xs">{inc.tipo}</span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(inc.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{inc.resumen}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase shrink-0 ${
                      inc.estado === 'CONFIRMADO'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : inc.estado === 'DESESTIMADO'
                        ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        : inc.estado === 'FALSO_POSITIVO'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {inc.estado}
                  </span>
                </div>

                {inc.estado === 'PENDIENTE' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => auditar(inc.id, 'FALSO_POSITIVO')}
                      disabled={auditandoId === inc.id}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Falso Positivo</span>
                    </button>
                    <button
                      onClick={() => auditar(inc.id, 'DESESTIMADO')}
                      disabled={auditandoId === inc.id}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3 text-slate-400" />
                      <span>Desestimar</span>
                    </button>
                    <button
                      onClick={() => auditar(inc.id, 'CONFIRMADO')}
                      disabled={auditandoId === inc.id}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Confirmar Falta</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
