import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText,
  Edit3,
} from 'lucide-react';
import { api } from '../../../api/client';
import { ModalAuditarIncidente } from './ModalAuditarIncidente';
import { DetalleSenal } from './DetalleSenal';

export interface SignalExplicativa {
  tipo: string;
  criterio?: string;
  valor?: any;
  timestamp: string;
  confianza?: number;
  recomendacionForense?: string;
}

export interface Incidente {
  id: string;
  sessionId: string;
  tipo: string;
  severidad: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'DESESTIMADO' | 'FALSO_POSITIVO';
  resumen: string;
  signals?: SignalExplicativa[];
  timestamp: string;
  justificacion?: string;
  session?: {
    usuario: { nombre: string; apellido: string } | null;
    questionnaire: { titulo: string } | null;
    tipo: string;
    inicio: string;
  };
}

interface Props {
  sessionId: string;
  onIncidenteAuditado?: () => void;
}

const SEVERIDAD_CONFIG = {
  CRITICAL: { label: 'Crítico', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  HIGH: { label: 'Alto', badge: 'bg-orange-50 text-orange-800 border-orange-200' },
  MEDIUM: { label: 'Medio', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  LOW: { label: 'Bajo', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const LineaTiempoIncidentes: React.FC<Props> = ({ sessionId, onIncidenteAuditado }) => {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditandoId, setAuditandoId] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [incidenteModal, setIncidenteModal] = useState<Incidente | null>(null);

  const cargarIncidentes = async () => {
    if (!sessionId) return;
    setCargando(true);
    setError(null);
    try {
      const res = await api.get(`/supervision/incidentes/${sessionId}`);
      setIncidentes(res.data || []);
    } catch {
      setIncidentes([]);
      setError('No se pudieron cargar las situaciones. Comprueba la conexión e inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIncidentes();
  }, [sessionId]);

  const auditarRapido = async (incidenteId: string, estado: string) => {
    setAuditandoId(incidenteId);
    try {
      await api.put(`/supervision/incidentes/${incidenteId}/auditar`, {
        estado,
        justificacion: `Auditado por el supervisor como ${estado} mediante acción rápida en consola`,
      });
      await cargarIncidentes();
      onIncidenteAuditado?.();
    } catch {
      // Ignorar error
    } finally {
      setAuditandoId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900">Situaciones para revisar</h4>
          {!cargando && !error && <span className="text-[10px] font-mono text-slate-500">({incidentes.length})</span>}
        </div>
        <button
          onClick={cargarIncidentes}
          disabled={cargando}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          title="Actualizar incidentes"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? <p role="alert" className="p-4 text-sm text-rose-700">{error}</p> : cargando ? <p className="p-4 text-sm text-slate-500">Cargando situaciones…</p> : incidentes.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-50 rounded-2xl border border-slate-200">
          No hay resultados para mostrar. Pulsa «Revisar eventos» para analizar los eventos registrados.
        </div>
      ) : (
        <div className="space-y-2.5">
          {incidentes.map((inc) => {
            const sev = SEVERIDAD_CONFIG[inc.severidad] || SEVERIDAD_CONFIG.LOW;
            const tieneSignals = inc.signals && inc.signals.length > 0;
            const estaExpandido = expandidoId === inc.id;

            return (
              <div
                key={inc.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-200 pb-2 text-xs text-slate-600">
                  <span><strong className="text-slate-900">Persona evaluada:</strong> {inc.session?.usuario ? `${inc.session.usuario.nombre} ${inc.session.usuario.apellido}` : 'No disponible'}</span>
                  <span><strong className="text-slate-900">Sesión:</strong> {inc.session?.questionnaire?.titulo || (inc.session?.tipo === 'EXAMEN' ? 'Examen sin nombre' : inc.session?.tipo === 'TELETRABAJO' ? 'Teletrabajo' : inc.session?.tipo || 'No disponible')}</span>
                  {inc.session?.inicio && <span>Iniciada: {new Date(inc.session.inicio).toLocaleString()}</span>}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-semibold ${sev.badge}`}>
                        {sev.label}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">{inc.tipo}</span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(inc.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{inc.resumen}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-semibold ${
                        inc.estado === 'CONFIRMADO'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : inc.estado === 'DESESTIMADO'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : inc.estado === 'FALSO_POSITIVO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {inc.estado}
                    </span>

                    <button
                      type="button"
                      onClick={() => setIncidenteModal(inc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
                      title="Revisar y añadir una nota"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Justificación si ya fue auditado */}
                {inc.justificacion && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-mono text-slate-700 flex items-start gap-1.5 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Decisión:</strong> {inc.justificacion}</span>
                  </div>
                )}

                {/* Botón para expandir señales explicativas */}
                {tieneSignals && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandidoId(estaExpandido ? null : inc.id)}
                      aria-expanded={estaExpandido}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>{estaExpandido ? 'Ocultar detalles' : `Ver detalles (${inc.signals?.length})`}</span>
                      {estaExpandido ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {estaExpandido && (
                      <div className="mt-2 p-3.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono space-y-2.5 shadow-2xs">
                        {inc.signals?.map((sig, sIdx) => <DetalleSenal key={sIdx} señal={sig} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones de auditoría rápida */}
                {inc.estado === 'PENDIENTE' && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => auditarRapido(inc.id, 'FALSO_POSITIVO')}
                      disabled={auditandoId === inc.id}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Falso Positivo</span>
                    </button>
                    <button
                      onClick={() => auditarRapido(inc.id, 'DESESTIMADO')}
                      disabled={auditandoId === inc.id}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <XCircle className="w-3 h-3 text-slate-500" />
                      <span>Desestimar</span>
                    </button>
                    <button
                      onClick={() => auditarRapido(inc.id, 'CONFIRMADO')}
                      disabled={auditandoId === inc.id}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>Confirmar Falta</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal interactivo de auditoría con justificación técnica */}
      <ModalAuditarIncidente
        incidente={incidenteModal}
        abierto={!!incidenteModal}
        onCerrar={() => setIncidenteModal(null)}
        onAuditado={() => {
          cargarIncidentes();
          onIncidenteAuditado?.();
        }}
      />
    </div>
  );
};
