import React, { useState, useMemo } from 'react';
import { Monitor, Wifi, WifiOff, Sparkles, Search, FileText, Laptop } from 'lucide-react';
import { useWebSocketSupervisor, EstadoSemaforo } from '../hooks/useWebSocketSupervisor';
import { agruparPuestosMosaico } from '../utils/agruparPuestosMosaico';
import { TarjetaSemaforo } from './TarjetaSemaforo';
import { api } from '../../../api/client';

interface Props {
  onSeleccionarSesion?: (sessionId: string) => void;
  sesionSeleccionadaId?: string;
}

export const ConsolaMosaicoSemaforo: React.FC<Props> = ({
  onSeleccionarSesion,
  sesionSeleccionadaId,
}) => {
  const { puestos, conectado } = useWebSocketSupervisor();
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroGrupo, setFiltroGrupo] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');
  const [simulando, setSimulando] = useState<boolean>(false);

  const examenesDisponibles = useMemo(() => {
    const titulos = new Set<string>();
    puestos.forEach((p) => {
      if (p.tipo !== 'TELETRABAJO') {
        titulos.add(p.examenTitulo?.trim() || 'Evaluación General');
      }
    });
    return Array.from(titulos).sort();
  }, [puestos]);

  const simularPuestos = async () => {
    setSimulando(true);
    try {
      await api.post('/supervision/puestos-en-vivo/simular');
    } catch {
      // Ignorar error si el canal WS ya emite
    } finally {
      setSimulando(false);
    }
  };

  const puestosPorGrupo = useMemo(() => {
    return puestos.filter((p) => {
      const esTeletrabajo = p.tipo === 'TELETRABAJO';
      const tituloExamen = p.examenTitulo?.trim() || 'Evaluación General';
      return (
        filtroGrupo === 'TODOS' ||
        (filtroGrupo === 'TELETRABAJO' && esTeletrabajo) ||
        (filtroGrupo === 'EXAMENES' && !esTeletrabajo) ||
        (filtroGrupo.startsWith('EXAMEN:') && !esTeletrabajo && tituloExamen === filtroGrupo.slice(7))
      );
    });
  }, [puestos, filtroGrupo]);

  const conteos: Record<EstadoSemaforo, number> = {
    VERDE: puestosPorGrupo.filter((p) => p.estado === 'VERDE').length,
    AMARILLO: puestosPorGrupo.filter((p) => p.estado === 'AMARILLO').length,
    NARANJA: puestosPorGrupo.filter((p) => p.estado === 'NARANJA').length,
    ROJO: puestosPorGrupo.filter((p) => p.estado === 'ROJO').length,
    GRIS: puestosPorGrupo.filter((p) => p.estado === 'GRIS').length,
  };

  const puestosFiltrados = puestosPorGrupo.filter((p) => {
    const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    const tituloExamen = p.examenTitulo?.trim() || 'Evaluación General';
    const coincideTexto =
      !busqueda.trim() ||
      p.usuarioNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sessionId.toLowerCase().includes(busqueda.toLowerCase()) ||
      tituloExamen.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.motivoAlerta && p.motivoAlerta.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideTexto;
  });

  const gruposVisibles = useMemo(() => agruparPuestosMosaico(puestosFiltrados), [puestosFiltrados]);

  return (
    <div className="space-y-4">
      {/* Panel unificado de control y filtros del Mosaico */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mosaico Semáforo en Tiempo Real</h3>
              <p className="text-xs text-slate-500">Supervisión en vivo de puestos • Actualización automática</p>
            </div>
          </div>

          {/* Acciones y Estado de Conexión */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={simularPuestos}
              disabled={simulando}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              title="Simula 5 puestos con telemetría en vivo"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${simulando ? 'animate-spin' : ''}`} />
              <span>{simulando ? 'Simulando...' : 'Simular Telemetría'}</span>
            </button>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium ${
                conectado
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {conectado ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-600" />}
              <span>{conectado ? 'En Línea' : 'Desconectado'}</span>
            </div>
          </div>
        </div>

        {/* Barra compacta de Comboboxes (Modalidad/Examen + Estado Semáforo) y Búsqueda */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <select
            aria-label="Filtrar por examen o modalidad"
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
          >
            <option value="TODOS">Modalidad: Todos los puestos ({puestos.length})</option>
            <option value="EXAMENES">Solo Exámenes</option>
            <option value="TELETRABAJO">Solo Teletrabajo</option>
            {examenesDisponibles.map((titulo) => (
              <option key={titulo} value={`EXAMEN:${titulo}`}>
                Examen: {titulo}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por estado del semáforo"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
          >
            <option value="TODOS">Estado: Todos ({puestosPorGrupo.length})</option>
            <option value="VERDE">Óptimos ({conteos.VERDE})</option>
            <option value="AMARILLO">Distraídos ({conteos.AMARILLO})</option>
            <option value="NARANJA">Riesgo Ergo ({conteos.NARANJA})</option>
            <option value="ROJO">Críticos ({conteos.ROJO})</option>
            <option value="GRIS">Inactivos ({conteos.GRIS})</option>
          </select>

          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por estudiante o puesto..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Mosaico de puestos */}
      {puestosFiltrados.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <Monitor className="w-8 h-8 text-slate-400 mx-auto" />
          <div>
            <p className="text-xs text-slate-800 font-semibold">
              {puestos.length === 0
                ? 'No hay puestos transmitiendo telemetría en tiempo real'
                : 'No se encontraron puestos con el filtro aplicado'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {puestos.length === 0
                ? 'Haga clic en "Simular Mosaico en Vivo" para inyectar 5 puestos y observar la conmutación del semáforo.'
                : 'Pruebe seleccionando "Todos" o limpiando el texto de búsqueda.'}
            </p>
          </div>
          {puestos.length === 0 && (
            <button
              onClick={simularPuestos}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular 5 Puestos Ahora</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {gruposVisibles.map((grupo) => (
            <section key={grupo.clave} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {grupo.tipo === 'EXAMEN' ? (
                    <FileText className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Laptop className="w-4 h-4 text-sky-600" />
                  )}
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {grupo.titulo}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {grupo.puestos.length} {grupo.puestos.length === 1 ? 'evaluado' : 'evaluados'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {grupo.puestos.map((puesto) => (
                  <TarjetaSemaforo
                    key={puesto.sessionId}
                    puesto={puesto}
                    onSeleccionar={onSeleccionarSesion}
                    seleccionado={sesionSeleccionadaId === puesto.sessionId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
