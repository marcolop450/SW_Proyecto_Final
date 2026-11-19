import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, Activity, Coffee, RotateCw, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../../api/client';
import { descargarComprobanteJornada } from '../services/comprobanteJornada';

export interface SesionTeletrabajo {
  id: string;
  inicio: string;
  fin: string | null;
  tiempoActivoSeg: number;
  tiempoOciosoSeg: number;
  tiempoFueraSeg: number;
  estado: string;
}

type FiltroTemporal = 'SEMANA' | 'MES' | 'TODAS';

export const HistorialJornadasTeletrabajo: React.FC = () => {
  const [sesiones, setSesiones] = useState<SesionTeletrabajo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<FiltroTemporal>('SEMANA');

  const cargarHistorial = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await api.get('/supervision/sesiones/teletrabajo');
      setSesiones(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Error al cargar historial de teletrabajo:', err);
      setError('No se pudo cargar el historial. Inténtalo nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const sesionesFiltradas = useMemo(() => {
    const ahora = new Date();
    return sesiones.filter((s) => {
      const fecha = new Date(s.inicio);
      if (filtro === 'SEMANA') {
        const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fecha >= hace7Dias;
      }
      if (filtro === 'MES') {
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      }
      return true;
    });
  }, [sesiones, filtro]);

  const kpis = useMemo(() => {
    const totalActivoSeg = sesionesFiltradas.reduce((acc, s) => acc + (s.tiempoActivoSeg || 0), 0);
    const totalPausasSeg = sesionesFiltradas.reduce((acc, s) => acc + (s.tiempoFueraSeg || 0), 0);
    const jornadasCount = sesionesFiltradas.length;
    const promedioSeg = jornadasCount > 0 ? Math.round(totalActivoSeg / jornadasCount) : 0;
    return { totalActivoSeg, totalPausasSeg, jornadasCount, promedioSeg };
  }, [sesionesFiltradas]);

  const formatearSegundos = (segs: number) => {
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${segs}s`;
  };

  const formatearFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatearHora = (iso: string | null) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Barra de Filtros y Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFiltro('SEMANA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtro === 'SEMANA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setFiltro('MES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtro === 'MES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setFiltro('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtro === 'TODAS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas las Jornadas
          </button>
        </div>

        <button
          onClick={cargarHistorial}
          disabled={cargando}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas KPI Acumuladas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Actividad en la página</span>
          <p className="text-2xl font-mono font-bold text-emerald-700 mt-1">
            {formatearSegundos(kpis.totalActivoSeg)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">acumulado período</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Jornadas Registradas</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
            {kpis.jornadasCount}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">sesiones validadas</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Promedio Diario</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
            {formatearSegundos(kpis.promedioSeg)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">por día registrado</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tiempo en Pausas</span>
          <p className="text-2xl font-mono font-bold text-amber-700 mt-1">
            {formatearSegundos(kpis.totalPausasSeg)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">almuerzos y descansos</span>
        </div>
      </div>

      {/* Listado de Jornadas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Registro Histórico de Fichajes
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {sesionesFiltradas.length} {sesionesFiltradas.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {cargando ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-slate-300 mb-2" />
            Cargando registros desde base de datos...
          </div>
        ) : error ? <p role="alert" className="p-5 text-sm text-rose-700">{error}</p> : sesionesFiltradas.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <p className="text-xs font-semibold text-slate-600">No hay jornadas en este período</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Tus sesiones de teletrabajo iniciadas y finalizadas aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sesionesFiltradas.map((s) => (
              <div
                key={s.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 capitalize">
                      {formatearFecha(s.inicio)}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Ingreso: {formatearHora(s.inicio)} · Salida: {formatearHora(s.fin)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-right w-full sm:w-auto justify-between sm:justify-end">
                  {s.estado === 'FINALIZADA' && <button type="button" onClick={() => descargarComprobanteJornada(s.id).catch(() => setError('No se pudo descargar el comprobante.'))} className="rounded-lg border border-emerald-200 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Comprobante PDF</button>}
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Actividad</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {formatearSegundos(s.tiempoActivoSeg)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Pausas</span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {formatearSegundos(s.tiempoFueraSeg)}
                    </span>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                      s.estado === 'FINALIZADA'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {s.estado === 'FINALIZADA' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Completada</span>
                        </>
                      ) : (
                        <span>En progreso</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
