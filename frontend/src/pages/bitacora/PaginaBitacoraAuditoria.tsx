import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, RefreshCw, CheckCircle2, AlertTriangle, Hash, Lock } from 'lucide-react';
import { api } from '../../api/client';

export interface RegistroBitacora {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  categoria: string;
  hash: string;
  prevHash: string;
  timestamp: string;
  usuario?: {
    nombre: string;
    apellido: string;
    correo: string;
  };
}

export const PaginaBitacoraAuditoria: React.FC = () => {
  const [registros, setRegistros] = useState<RegistroBitacora[]>([]);
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [resultadoIntegridad, setResultadoIntegridad] = useState<{ valida: boolean; totalRegistros: number } | null>(null);

  const cargarBitacora = async () => {
    setCargando(true);
    try {
      const res = await api.get('/supervision/bitacora?limit=50');
      setRegistros(res.data || []);
    } catch {
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarBitacora();
  }, []);

  const verificarCadena = async () => {
    setVerificando(true);
    try {
      const res = await api.get('/supervision/bitacora/verificar');
      setResultadoIntegridad(res.data);
    } catch {
      setResultadoIntegridad({ valida: false, totalRegistros: 0 });
    } finally {
      setVerificando(false);
    }
  };

  const exportarCsv = async () => {
    try {
      const res = await api.get('/supervision/bitacora/exportar', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bitacora-inmutable-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Manejar error
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-lime-400" />
            <span>Bitácora Inmutable de Auditoría (WORM)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro encadenado criptográficamente mediante hashes SHA-256 para estricto cumplimiento normativo y no-repudio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={verificarCadena}
            disabled={verificando}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{verificando ? 'Auditando...' : 'Verificar Cadena'}</span>
          </button>
          <button
            onClick={exportarCsv}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={cargarBitacora}
            disabled={cargando}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Recargar bitácora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerta de Integridad Verificada */}
      {resultadoIntegridad && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            resultadoIntegridad.valida
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {resultadoIntegridad.valida ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>
            {resultadoIntegridad.valida
              ? `Integridad criptográfica verificada: la cadena de ${resultadoIntegridad.totalRegistros} bloques está íntegra y sin alteraciones.`
              : 'Alerta crítica de auditoría: se detectó una ruptura de secuencia en los hashes encadenados.'}
          </span>
        </div>
      )}

      {/* Tabla de Registros */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
              <tr>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Acción Realizada</th>
                <th className="py-2.5 px-3">Entidad</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Hash Actual (SHA-256)</th>
                <th className="py-2.5 px-3">Hash Previo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    No se han registrado operaciones en la bitácora inmutable aún
                  </td>
                </tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(reg.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{reg.action}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{reg.entity}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {reg.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-lime-400/90 truncate max-w-[140px]">
                      <span className="flex items-center gap-1" title={reg.hash}>
                        <Hash className="w-2.5 h-2.5 shrink-0 text-lime-400" />
                        {reg.hash ? `${reg.hash.slice(0, 16)}...` : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                      <span title={reg.prevHash}>{reg.prevHash ? `${reg.prevHash.slice(0, 12)}...` : 'GÉNESIS'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
