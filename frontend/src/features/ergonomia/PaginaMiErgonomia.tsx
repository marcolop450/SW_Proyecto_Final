import React, { useEffect, useState, useCallback } from 'react';
import { Play, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { api } from '../../api/client';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { BaselineCalibracion, UmbralesAlertaConfig } from './types/ergonomia.types';
import { VisorCamaraCalibracion } from './VisorCamaraCalibracion';
import { MonitoreoErgonomicoEnVivo } from './MonitoreoErgonomicoEnVivo';
import { ReproductorPausaActiva } from './ReproductorPausaActiva';
import { ConfiguracionUmbralesAlerta } from './ConfiguracionUmbralesAlerta';
import { TarjetasResumenErgonomia } from './TarjetasResumenErgonomia';
import { HistorialSesionesErgonomia } from './HistorialSesionesErgonomia';
import { BannerSesionActiva } from './BannerSesionActiva';
import { Boton } from '../../components/ui/Boton';
import { Insignia } from '../../components/ui/Insignia';

export const PaginaMiErgonomia: React.FC = () => {
  const { usuario, tieneConsentimiento } = useAuth();
  const { mostrarError } = useNotificacion();
  const [resumen, setResumen] = useState<any>(null);
  const [sesionActiva, setSesionActiva] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const [modo, setModo] = useState<'PANEL' | 'CALIBRANDO' | 'MONITOREANDO'>('PANEL');
  const [baseline, setBaseline] = useState<BaselineCalibracion | null>(null);
  const [sesionIdReanudada, setSesionIdReanudada] = useState<string | null>(null);
  const [modalPausa, setModalPausa] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState(false);

  const [config, setConfig] = useState<UmbralesAlertaConfig>({
    segundosParaAlerta: 60,
    alertaSonora: true,
    umbralRulaMinimo: 5,
    recordatorioPausaMinutos: 45,
  });

  const cargarDatos = useCallback(async () => {
    if (!tieneConsentimiento) return;
    setCargando(true);
    try {
      const [resResumen, resActiva] = await Promise.all([
        api.get('/ergonomia/resumen'),
        api.get('/ergonomia/sesion/activa'),
      ]);
      setResumen(resResumen.data);
      setSesionActiva(resActiva.data || null);
    } catch (err: any) {
      if (err.response?.status !== 403) mostrarError(err, 'Error al obtener telemetría ergonómica');
    } finally {
      setCargando(false);
    }
  }, [tieneConsentimiento, mostrarError]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCalibracionCompletada = (base: BaselineCalibracion) => {
    setBaseline(base);
    setSesionIdReanudada(null);
    setModo('MONITOREANDO');
  };

  const reanudarSesion = (s: any) => {
    setBaseline({
      anguloCuelloBase: 12.0,
      anguloTroncoBase: 8.0,
      inclinacionHombrosBase: 0,
      luminanciaPromedio: 128,
      calibradoEn: s.startTime,
    });
    setSesionIdReanudada(s.id);
    setModo('MONITOREANDO');
  };

  const forzarFinalizar = async (id: string) => {
    try {
      await api.post(`/ergonomia/sesion/${id}/finalizar`, { promedioRula: 2.0, totalAlertas: 0 });
      cargarDatos();
    } catch (err) {
      mostrarError(err, 'No se pudo finalizar la sesión');
    }
  };

  const handleFinalizarSesion = () => {
    setModo('PANEL');
    setSesionIdReanudada(null);
    cargarDatos();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Telemetría Biomecánica Edge AI
            </span>
            <span className="text-xs text-slate-500 font-mono">ISO 11226 / RULA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Monitoreo Postural en Tiempo Real
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Puesto de trabajo asignado a {usuario?.nombre} {usuario?.apellido}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Insignia variante={tieneConsentimiento ? 'exito' : 'peligro'}>
            {tieneConsentimiento ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            <span>Telemetría {tieneConsentimiento ? 'Autorizada' : 'Bloqueada'}</span>
          </Insignia>

          {tieneConsentimiento && modo === 'PANEL' && (
            <Boton variante="primario" onClick={() => setModo('CALIBRANDO')}>
              <Play className="w-4 h-4 fill-current mr-1.5" />
              <span>Iniciar Calibración</span>
            </Boton>
          )}
        </div>
      </div>

      {/* Flujo Activo */}
      {modo === 'CALIBRANDO' && (
        <div className="space-y-4">
          <VisorCamaraCalibracion
            alFinalizarCalibracion={handleCalibracionCompletada}
            alCancelar={() => setModo('PANEL')}
          />
        </div>
      )}

      {modo === 'MONITOREANDO' && baseline && (
        <MonitoreoErgonomicoEnVivo
          baseline={baseline}
          config={config}
          sesionExistenteId={sesionIdReanudada}
          onFinalizarSesion={handleFinalizarSesion}
          onAbrirPausa={(m) => setModalPausa(m)}
          onAbrirConfig={() => setModalConfig(true)}
        />
      )}

      {/* Vista de Panel Principal */}
      {modo === 'PANEL' && (
        <>
          {sesionActiva && (
            <BannerSesionActiva
              horaInicio={sesionActiva.startTime}
              alReanudar={() => reanudarSesion(sesionActiva)}
              alFinalizar={() => forzarFinalizar(sesionActiva.id)}
            />
          )}

          <TarjetasResumenErgonomia cargando={cargando} resumen={resumen} />

          <HistorialSesionesErgonomia
            sesiones={resumen?.sesiones || []}
            alReanudarSesion={reanudarSesion}
            alFinalizarSesion={forzarFinalizar}
          />
        </>
      )}

      {/* Modales */}
      {modalPausa && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <ReproductorPausaActiva
              motivo={modalPausa}
              onCerrar={() => setModalPausa(null)}
              onCompletada={() => setTimeout(() => setModalPausa(null), 1500)}
            />
          </div>
        </div>
      )}

      {modalConfig && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <ConfiguracionUmbralesAlerta
              configActual={config}
              onGuardar={(nueva) => setConfig(nueva)}
              onCerrar={() => setModalConfig(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
