import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  ShieldCheck,
  PlayCircle,
  Activity,
  Sparkles,
  RefreshCw,
  User,
  Clock,
  Layers,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { ConsolaMosaicoSemaforo } from '../../features/supervision/components/ConsolaMosaicoSemaforo';
import { LineaTiempoIncidentes } from '../../features/supervision/components/LineaTiempoIncidentes';
import { SelectorSesiones } from '../../features/supervision/components/SelectorSesiones';
import { api } from '../../api/client';

interface SesionResumen {
  id: string;
  tipo: string;
  estado: string;
  inicio: string;
  questionnaire?: { titulo: string } | null;
  usuario?: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  _count?: {
    eventosConducta: number;
    incidentes: number;
  };
}

export const PaginaConsolaSupervision: React.FC = () => {
  const navigate = useNavigate();
  const [pestañaActiva, setPestañaActiva] = useState<'mosaico' | 'forense'>('mosaico');
  const [sesiones, setSesiones] = useState<SesionResumen[]>([]);
  const [sessionIdAuditoria, setSessionIdAuditoria] = useState('');
  const [indices, setIndices] = useState<any | null>(null);
  const [correlacionando, setCorrelacionando] = useState(false);
  const [generandoDemo, setGenerandoDemo] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisionIncidentes, setRevisionIncidentes] = useState(0);

  const cargarSesiones = async () => {
    try {
      const res = await api.get('/supervision/sesiones');
      setSesiones(res.data || []);
      if (res.data && res.data.length > 0 && !sessionIdAuditoria) {
        setSessionIdAuditoria(res.data[0].id);
      }
    } catch {
      setSesiones([]);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  const ejecutarCorrelacion = async (targetId?: string) => {
    const sid = targetId || sessionIdAuditoria.trim();
    if (!sid) return;
    setCorrelacionando(true);
    setMensajeExito(null);
    setError(null);
    try {
      const resCorrelacion = await api.post(`/supervision/correlacion/${sid}`);
      const resIndices = await api.get(`/supervision/indices/${sid}`);
      setIndices(resIndices.data);
      setRevisionIncidentes((n) => n + 1);
      setMensajeExito(
        `Revisión terminada: hay ${resCorrelacion.data.total} situaciones registradas en esta sesión.`,
      );
    } catch {
      setError('No se pudieron revisar los eventos. Comprueba la conexión y vuelve a intentarlo.');
    } finally {
      setCorrelacionando(false);
    }
  };

  const generarSesionDemo = async () => {
    setGenerandoDemo(true);
    setMensajeExito(null);
    setError(null);
    try {
      const res = await api.post('/supervision/sesiones/demo');
      const nuevaId = res.data.sessionId;
      setSessionIdAuditoria(nuevaId);
      setPestañaActiva('forense');
      await cargarSesiones();
      await ejecutarCorrelacion(nuevaId);
      setMensajeExito(
        '¡Sesión demo generada y correlacionada! Se inyectaron 10 eventos biométricos y se ejecutaron las reglas de correlación.',
      );
    } catch {
      // Manejar error silencioso
    } finally {
      setGenerandoDemo(false);
    }
  };

  const descargarExcel = async () => {
    if (!sessionIdAuditoria) return;
    setDescargandoExcel(true);
    try {
      const res = await api.get(`/supervision/reportes/${sessionIdAuditoria}/ergonomico-excel`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-ergonomico-${sessionIdAuditoria.slice(0, 8)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Ignorar error
    } finally {
      setDescargandoExcel(false);
    }
  };

  const descargarPdf = async () => {
    if (!sessionIdAuditoria) return;
    setDescargandoPdf(true);
    try {
      const res = await api.get(`/supervision/reportes/${sessionIdAuditoria}/forense-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dictamen-forense-${sessionIdAuditoria.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Ignorar error
    } finally {
      setDescargandoPdf(false);
    }
  };

  const cerrarSesionActual = async () => {
    if (!sessionIdAuditoria) return;
    setCerrandoSesion(true);
    setMensajeExito(null);
    setError(null);
    try {
      const res = await api.post(`/supervision/sesiones/${sessionIdAuditoria}/cerrar`);
      setIndices(res.data.indices);
      setMensajeExito(
        `Sesión cerrada formalmente. Integridad persistido: ${res.data.indices.indiceIntegridad}/100.`,
      );
      await cargarSesiones();
    } catch {
      setError('No se pudo cerrar la sesión. Vuelve a intentarlo.');
    } finally {
      setCerrandoSesion(false);
    }
  };

  useEffect(() => {
    let vigente = true;
    setIndices(null);
    setMensajeExito(null);
    setError(null);
    if (sessionIdAuditoria) {
      api
        .get(`/supervision/indices/${sessionIdAuditoria}`)
        .then((res) => { if (vigente) setIndices(res.data); })
        .catch(() => { if (vigente) setError('No se pudieron cargar los resultados de esta sesión.'); });
    }
    return () => { vigente = false; };
  }, [sessionIdAuditoria]);

  const sesionActual = sesiones.find((s) => s.id === sessionIdAuditoria);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-600" />
            <span>Consola de Supervisión en Tiempo Real</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión ergonómica continua y detección de anomalías en tiempo real
          </p>
        </div>

        <button
          onClick={generarSesionDemo}
          disabled={generandoDemo}
          className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          title="Genera una sesión de prueba con eventos de postura, mirada y atajos para probar el motor"
        >
          <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${generandoDemo ? 'animate-spin' : ''}`} />
          <span>{generandoDemo ? 'Generando...' : 'Generar Sesión Demo con Eventos'}</span>
        </button>
      </div>

      {/* Selector de Pestañas / Separación de Casos de Uso */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setPestañaActiva('mosaico')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            pestañaActiva === 'mosaico'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Mosaico Semáforo en Tiempo Real</span>
        </button>

        <button
          onClick={() => setPestañaActiva('forense')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            pestañaActiva === 'forense'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Revisión de sesión</span>
          {sessionIdAuditoria && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              {sesionActual?.estado === 'EN_PROGRESO' ? 'Sesión activa' : 'Sesión seleccionada'}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate(sessionIdAuditoria ? `/reportes?sessionId=${sessionIdAuditoria}` : '/reportes')}
          className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Centro de Reportes</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* PESTAÑA 1: Mosaico Semáforo en Vivo */}
      {pestañaActiva === 'mosaico' && (
        <div className="space-y-4">
          <ConsolaMosaicoSemaforo
            onSeleccionarSesion={(sid) => {
              setSessionIdAuditoria(sid);
              setMensajeExito(null);
              setError(null);
              void cargarSesiones();
              setPestañaActiva('forense');
            }}
            sesionSeleccionadaId={sessionIdAuditoria}
          />
        </div>
      )}

      {/* PESTAÑA 2: Panel de Correlación Forense */}
      {pestañaActiva === 'forense' && (
        <div className="space-y-4">
          {/* Tarjeta de Control y Selección de Sesión */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Información del Evaluado / Sesión Activa */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0 shadow-2xs">
                  {sesionActual?.usuario
                    ? `${sesionActual.usuario.nombre[0]}${sesionActual.usuario.apellido[0]}`
                    : 'EC'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {sesionActual?.usuario
                        ? `${sesionActual.usuario.nombre} ${sesionActual.usuario.apellido}`
                        : 'Sesión de Supervisión'}
                    </h3>
                    {sesionActual && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sesionActual.tipo}
                      </span>
                    )}
                    {sesionActual?.estado && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          sesionActual.estado !== 'EN_PROGRESO'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {sesionActual.estado === 'EN_PROGRESO' ? 'En curso' : ['FINALIZADA', 'COMPLETADA'].includes(sesionActual.estado) ? 'Finalizada' : sesionActual.estado}
                      </span>
                    )}
                  </div>
                  {sesionActual && <p className="mt-1 text-xs font-medium text-slate-600">{sesionActual.questionnaire?.titulo || (sesionActual.tipo === 'EXAMEN' ? 'Examen sin nombre' : sesionActual.tipo === 'TELETRABAJO' ? 'Teletrabajo' : sesionActual.tipo)}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                    {sesionActual?.inicio && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(sesionActual.inicio).toLocaleString()}
                      </span>
                    )}
                    {sesionActual?.id && (
                      <span className="text-slate-400">
                        ID: {sesionActual.id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selector y Botones de Acción */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                <SelectorSesiones sesiones={sesiones} seleccionada={sessionIdAuditoria} deshabilitado={correlacionando || cerrandoSesion} onSeleccionar={setSessionIdAuditoria} />

                <button
                  onClick={() => cargarSesiones()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title="Refrescar lista de sesiones"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => ejecutarCorrelacion()}
                  disabled={correlacionando || !sessionIdAuditoria.trim()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-40 cursor-pointer"
                >
                  <PlayCircle className={`w-3.5 h-3.5 ${correlacionando ? 'animate-spin' : ''}`} />
                  <span>{correlacionando ? 'Revisando...' : 'Revisar eventos'}</span>
                </button>

                <button
                  onClick={() => cerrarSesionActual()}
                  disabled={cerrandoSesion || !sessionIdAuditoria.trim() || sesionActual?.estado !== 'EN_PROGRESO'}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-40 cursor-pointer"
                  title="Finaliza la sesión seleccionada"
                >
                  <CheckCircle className={`w-3.5 h-3.5 text-emerald-600 ${cerrandoSesion ? 'animate-spin' : ''}`} />
                  <span>{cerrandoSesion ? 'Cerrando...' : 'Finalizar sesión'}</span>
                </button>
              </div>
            </div>

            {/* Mensaje de éxito de la correlación */}
            {mensajeExito && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{mensajeExito}</span>
              </div>
            )}
            {error && <p role="alert" className="mt-4 text-xs text-rose-700">{error}</p>}
          </div>

          <p className="text-sm text-slate-600">Selecciona una sesión y pulsa «Revisar eventos» para buscar situaciones que necesiten atención. Después puedes revisar cada resultado y registrar tu decisión.</p>
          {sesionActual && <p className="text-xs text-slate-500">Los resultados corresponden a la sesión de {sesionActual.usuario ? `${sesionActual.usuario.nombre} ${sesionActual.usuario.apellido}` : 'esta persona'}, iniciada el {new Date(sesionActual.inicio).toLocaleString()}.</p>}

          {/* Tarjetas de resultados */}
          {indices && indices.sessionId === sessionIdAuditoria && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    indices.indiceIntegridad >= 80
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : indices.indiceIntegridad >= 50
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono font-semibold">Integridad</span>
                  <span
                    className={`font-mono font-bold text-lg leading-tight ${
                      indices.indiceIntegridad >= 80
                        ? 'text-emerald-700'
                        : indices.indiceIntegridad >= 50
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {indices.indiceIntegridad} / 100
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    indices.indiceBienestar >= 80
                      ? 'bg-sky-50 border-sky-200 text-sky-600'
                      : indices.indiceBienestar >= 60
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono font-semibold">Bienestar</span>
                  <span
                    className={`font-mono font-bold text-lg leading-tight ${
                      indices.indiceBienestar >= 80
                        ? 'text-sky-700'
                        : indices.indiceBienestar >= 60
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {indices.indiceBienestar} / 100
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      indices.totalIncidentes === 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : indices.totalIncidentes <= 3
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <span className="font-mono font-bold text-sm">{indices.totalIncidentes}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-semibold">
                      Estado de bienestar ({indices.totalIncidentes} incidentes)
                    </span>
                    <span
                      className={`font-mono text-sm font-bold block ${
                        indices.estadoSST === 'OPTIMO'
                          ? 'text-emerald-700'
                          : indices.estadoSST === 'MODERADO'
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {indices.estadoSST}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(sessionIdAuditoria ? `/reportes?sessionId=${sessionIdAuditoria}` : '/reportes')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Descargar reporte oficial en Excel o dictamen en PDF"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reportes →</span>
                </button>
              </div>
            </div>
          )}

          {/* Línea de Tiempo de Incidentes Correlacionados */}
          {sessionIdAuditoria.trim() && (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
              <LineaTiempoIncidentes
                key={`${sessionIdAuditoria}-${revisionIncidentes}`}
                sessionId={sessionIdAuditoria.trim()}
                onIncidenteAuditado={() => {
                  api
                    .get(`/supervision/indices/${sessionIdAuditoria.trim()}`)
                    .then((res) => setIndices(res.data))
                    .catch(() => {});
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaginaConsolaSupervision;
