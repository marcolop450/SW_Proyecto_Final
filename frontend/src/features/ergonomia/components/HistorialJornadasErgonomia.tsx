import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Activity, AlertTriangle, RotateCw, Play, Square, CheckCircle } from 'lucide-react';
import { Insignia } from '../../../components/ui/Insignia';

export interface SesionErgonomicaItem {
  id: string;
  startTime: string;
  endTime: string | null;
  averageRula: number | null;
  totalAlerts: number;
}

type FiltroTemporal = 'SEMANA' | 'MES' | 'TODAS';

interface Props {
  sesiones: SesionErgonomicaItem[];
  alReanudarSesion: (s: SesionErgonomicaItem) => void;
  alFinalizarSesion: (id: string) => void;
  alActualizar: () => void;
  cargando: boolean;
}

export const HistorialJornadasErgonomia: React.FC<Props> = ({
  sesiones,
  alReanudarSesion,
  alFinalizarSesion,
  alActualizar,
  cargando,
}) => {
  const [filtro, setFiltro] = useState<FiltroTemporal>('SEMANA');

  const sesionesFiltradas = useMemo(() => {
    const ahora = new Date();
    return sesiones.filter((s) => {
      const fecha = new Date(s.startTime);
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
    const total = sesionesFiltradas.length;
    if (total === 0) return { promedioRula: 0, minutosTotales: 0, alertas: 0, total: 0 };

    const mediciones = sesionesFiltradas.map(s => s.averageRula).filter((valor): valor is number => typeof valor === 'number' && Number.isFinite(valor) && valor >= 1 && valor <= 7);
    const promedioRula = mediciones.length ? Number((mediciones.reduce((a, b) => a + b, 0) / mediciones.length).toFixed(1)) : 0;

    let minutosTotales = 0;
    for (const s of sesionesFiltradas) {
      if (s.endTime && s.startTime) {
        const diffMs = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
        if (Number.isFinite(diffMs) && diffMs >= 0) minutosTotales += Math.round(diffMs / 60000);
      }
    }

    const alertas = sesionesFiltradas.reduce((acc, s) => acc + (s.totalAlerts || 0), 0);
    return { promedioRula, minutosTotales, alertas, total };
  }, [sesionesFiltradas]);

  const formatearTiempo = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatearFecha = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-ES', {
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
      <div><h2 className="text-lg font-bold text-slate-900">Tu historial</h2><p className="text-sm text-slate-500">Consulta tus sesiones y filtra los resultados por período.</p></div>
      {/* Filtros Temporales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFiltro('SEMANA')}
            aria-pressed={filtro === 'SEMANA'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtro === 'SEMANA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setFiltro('MES')}
            aria-pressed={filtro === 'MES'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtro === 'MES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setFiltro('TODAS')}
            aria-pressed={filtro === 'TODAS'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtro === 'TODAS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas las Sesiones
          </button>
        </div>

        <button
          onClick={alActualizar}
          disabled={cargando}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Métricas Acumuladas del Período */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Indicador de postura</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
            {kpis.promedioRula > 0 ? kpis.promedioRula.toFixed(1) : '--'}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            {kpis.promedioRula === 0 ? 'Sin mediciones' : kpis.promedioRula <= 2.0 ? 'Nivel bajo' :
             kpis.promedioRula <= 4.0 ? 'Aceptable (Nivel 2)' : 'Riesgo Postural'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Duración registrada</span>
          <p className="text-2xl font-mono font-bold text-emerald-700 mt-1">
            {formatearTiempo(kpis.minutosTotales)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">solo sesiones finalizadas</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Alertas Posturales</span>
          <p className="text-2xl font-mono font-bold text-amber-700 mt-1">
            {kpis.alertas}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">fatiga e inmovilidad</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sesiones Realizadas</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
            {kpis.total}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">sesiones del período</span>
        </div>
      </div>

      {/* Bitácora de Sesiones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tus sesiones
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {sesionesFiltradas.length} {sesionesFiltradas.length === 1 ? 'evaluación' : 'evaluaciones'}
          </span>
        </div>

        {sesionesFiltradas.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <p className="text-xs font-semibold text-slate-600">No hay evaluaciones en este período</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Tus sesiones ergonómicas completadas se sincronizarán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sesionesFiltradas.map((s) => {
              const enCurso = !s.endTime;
              return (
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
                        {formatearFecha(s.startTime)}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Inicio: {formatearHora(s.startTime)} · {enCurso ? 'En curso' : `Fin: ${formatearHora(s.endTime)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-right w-full sm:w-auto justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Indicador</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {s.averageRula != null ? s.averageRula.toFixed(1) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Alertas</span>
                      <Insignia variante={s.totalAlerts === 0 ? 'exito' : 'advertencia'}>
                        {s.totalAlerts} {s.totalAlerts === 1 ? 'alerta' : 'alertas'}
                      </Insignia>
                    </div>

                    <div>
                      {enCurso ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => alReanudarSesion(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Reanudar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => alFinalizarSesion(s.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                            title="Cerrar sesión"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span>Cerrar</span>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>Archivada</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
