import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Camera, Lock, ArrowRight, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { api } from '../../api/client';
import { Boton } from '../../components/ui/Boton';
import { LogoErgoCheck } from '../../components/ui/LogoErgoCheck';

export const PantallaConsentimientoPrevio: React.FC = () => {
  const { usuario, actualizarEstadoConsentimiento, cerrarSesion } = useAuth();
  const { mostrarError, mostrarExito } = useNotificacion();
  const [cargando, setCargando] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const otorgarConsentimiento = async () => {
    if (!terminosAceptados) {
      mostrarError({ message: 'Debes marcar la casilla para confirmar tu aceptación.' }, 'Validación');
      return;
    }
    setCargando(true);
    try {
      await api.post('/consentimiento/firmar', {
        type: 'CAMERA_AND_BIOMETRICS',
        version: '1.0-ISO11226',
      });
      await actualizarEstadoConsentimiento();
      mostrarExito('Consentimiento registrado con firma digital y auditoría inmutable.', 'Autorización Otorgada');
    } catch (err) {
      mostrarError(err, 'Fallo al registrar consentimiento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] bg-dot-grid bg-ambient-mesh flex items-center justify-center p-4 sm:p-6 text-slate-800">
      <div className="max-w-2xl w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/40 space-y-6 animate-fade-up">
        {/* Cabecera con Logo y Estado */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <LogoErgoCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-700">
                Paso Previo Requerido
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Consentimiento de Telemetría y Biometría
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Firma Requerida</span>
          </div>
        </div>

        {/* Mensaje Contextual para el Usuario */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Hola, <strong className="text-slate-900">{usuario?.nombre} {usuario?.apellido}</strong> ({usuario?.rol ? usuario.rol.replace(/_/g, ' ') : 'Usuario'}). Para cumplir con la normativa de privacidad y el estándar ergonómico ISO 11226, debes autorizar el tratamiento seguro de telemetría antes de acceder a la consola.
        </p>

        {/* Pilares de Privacidad y Cumplimiento Técnico */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Memoria Volátil</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Los fotogramas se procesan exclusivamente en RAM local y se destruyen inmediatamente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Cero Retención</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nunca se graban ni transmiten videos o imágenes a servidores externos o nubes públicas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Auditoría SHA-256</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Solo se transmiten vectores numéricos de alineación postural (RULA/REBA) con firma digital.
            </p>
          </div>
        </div>

        {/* Casilla de Confirmación */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 cursor-pointer select-none transition-colors hover:bg-emerald-50">
            <input
              type="checkbox"
              checked={terminosAceptados}
              onChange={(e) => setTerminosAceptados(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              He leído y autorizo el inicio de la telemetría bajo los términos de privacidad descritos, entendiendo que puedo revocar mi autorización en cualquier momento.
            </span>
          </label>
        </div>

        {/* Acciones */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cancelar y Cerrar Sesión</span>
          </button>

          <Boton
            onClick={otorgarConsentimiento}
            cargando={cargando}
            disabled={!terminosAceptados}
            icono={ArrowRight}
            className="w-full sm:w-auto px-6 py-2.5 text-xs shadow-md"
          >
            Aceptar y Acceder a la Plataforma
          </Boton>
        </div>
      </div>
    </div>
  );
};
