import React, { useState } from 'react';
import { X, Copy, Check, Hash, User, Calendar, Shield, Cpu, Activity } from 'lucide-react';
import { RegistroBitacora } from './PaginaBitacoraAuditoria';

interface ModalDetalleBitacoraProps {
  registro: RegistroBitacora | null;
  onClose: () => void;
}

export const ModalDetalleBitacora: React.FC<ModalDetalleBitacoraProps> = ({ registro, onClose }) => {
  const [copiadoHash, setCopiadoHash] = useState(false);
  const [copiadoPrev, setCopiadoPrev] = useState(false);

  if (!registro) return null;

  const copiarTexto = (texto: string, esHashActual: boolean) => {
    navigator.clipboard.writeText(texto);
    if (esHashActual) {
      setCopiadoHash(true);
      setTimeout(() => setCopiadoHash(false), 2000);
    } else {
      setCopiadoPrev(true);
      setTimeout(() => setCopiadoPrev(false), 2000);
    }
  };

  const getBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'EVENTOS_TECNICOS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACCESOS_DATOS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CAMBIOS_POLITICAS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SEGURIDAD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'AUDITORIA':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUPERVISION':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ERGONOMIA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LEGAL_COMPLIANCE':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Detalle de Registro de Auditoría</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle(registro.categoria)}`}>
                  {registro.categoria}
                </span>
              </h3>
              <p className="text-[11px] font-mono text-slate-500">ID: {registro.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Metadatos principales en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5 font-semibold">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Acción Registrada
              </span>
              <p className="text-sm font-bold text-slate-900">{registro.action}</p>
              <p className="text-xs text-slate-500 font-mono">Entidad: {registro.entity} ({registro.entityId || 'Global'})</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Estampa de Tiempo (ISO)
              </span>
              <p className="text-xs font-mono text-slate-800 font-medium">{new Date(registro.timestamp).toLocaleString()}</p>
              <p className="text-[10px] font-mono text-slate-400">{registro.timestamp}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5 font-semibold">
                <User className="w-3.5 h-3.5 text-amber-600" />
                Operador / Usuario
              </span>
              <p className="text-xs font-bold text-slate-900">
                {registro.usuario ? `${registro.usuario.nombre} ${registro.usuario.apellido}` : 'SISTEMA'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">{registro.usuario?.correo || 'Proceso Automático'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-violet-600" />
                Dirección IP / Origen
              </span>
              <p className="text-xs font-mono text-slate-800 font-medium">{registro.ipAddress || '127.0.0.1 (Local)'}</p>
              <p className="text-[10px] text-emerald-700 font-medium">Inferencia Local Verificada</p>
            </div>
          </div>

          {/* Bloques Criptográficos (Hashes) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" />
                  Hash SHA-256 de este Bloque
                </span>
                <button
                  type="button"
                  onClick={() => copiarTexto(registro.hash, true)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
                >
                  {copiadoHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiadoHash ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-emerald-800 font-medium break-all select-all">
                {registro.hash || '—'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  Hash del Bloque Previo (Cadena Criptográfica)
                </span>
                {registro.prevHash && (
                  <button
                    type="button"
                    onClick={() => copiarTexto(registro.prevHash, false)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
                  >
                    {copiadoPrev ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiadoPrev ? '¡Copiado!' : 'Copiar'}
                  </button>
                )}
              </div>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 font-medium break-all select-all">
                {registro.prevHash || 'Sin referencia visible'}
              </p>
            </div>
          </div>

          {/* Payload JSON / Detalles técnicos */}
          {registro.details && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700">Detalles y Metadatos del Evento</span>
              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-40 leading-relaxed shadow-inner">
                {JSON.stringify(registro.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
