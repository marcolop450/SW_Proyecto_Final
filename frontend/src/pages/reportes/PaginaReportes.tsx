import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

export const PaginaReportes: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const descargarExcel = async () => {
    if (!sessionId.trim()) return;
    setDescargandoExcel(true);
    setMensajeExito(null);
    try {
      const res = await api.get(`/supervision/reportes/${sessionId.trim()}/ergonomico-excel`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-ergonomico-${sessionId.trim().slice(0, 8)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMensajeExito('Reporte ergonómico generado y descargado correctamente en Excel (.xlsx)');
    } catch {
      // Manejar error
    } finally {
      setDescargandoExcel(false);
    }
  };

  const descargarPdf = async () => {
    if (!sessionId.trim()) return;
    setDescargandoPdf(true);
    setMensajeExito(null);
    try {
      const res = await api.get(`/supervision/reportes/${sessionId.trim()}/forense-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dictamen-forense-${sessionId.trim().slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMensajeExito('Dictamen forense certificado generado y descargado con sello SHA-256 (.pdf)');
    } catch {
      // Manejar error
    } finally {
      setDescargandoPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-lime-400" />
          <span>Generación de Reportes y Dictámenes Certificados</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Exportación de auditorías biomecánicas corporativas en hojas de cálculo y expedientes forenses con sello criptográfico
        </p>
      </div>

      {/* Selector de Sesión */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-5 space-y-4 max-w-2xl">
        <label className="block text-xs font-semibold text-slate-200">
          ID de Sesión de Evaluación o Teletrabajo (UUID)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingrese el UUID de la sesión (ej: 4a2b1c3d-...)"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-lime-400/50"
          />
        </div>

        {mensajeExito && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Tarjeta Reporte Ergonómico Excel */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-slate-200">Reporte Corporativo SST (.xlsx)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cuadros analíticos de riesgo biomecánico RULA por puesto, distribución porcentual y alertas ergonómicas consolidadas.
              </p>
            </div>
            <button
              onClick={descargarExcel}
              disabled={descargandoExcel || !sessionId.trim()}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{descargandoExcel ? 'Generando Excel...' : 'Descargar Excel'}</span>
            </button>
          </div>

          {/* Tarjeta Dictamen Forense PDF */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-lime-400/30 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-slate-200">Dictamen Forense con Sello SHA-256 (.pdf)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Expediente individual de probidad con trazabilidad de incidentes, índice de integridad y sello criptográfico de no-repudio.
              </p>
            </div>
            <button
              onClick={descargarPdf}
              disabled={descargandoPdf || !sessionId.trim()}
              className="w-full py-2 px-3 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{descargandoPdf ? 'Generando PDF...' : 'Descargar Dictamen PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
