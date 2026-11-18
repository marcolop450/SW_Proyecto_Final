import React, { useState } from 'react';
import { Monitor, Wifi, WifiOff, Sparkles, Search, Filter } from 'lucide-react';
import { useWebSocketSupervisor, EstadoSemaforo } from '../hooks/useWebSocketSupervisor';
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
  const [busqueda, setBusqueda] = useState<string>('');
  const [simulando, setSimulando] = useState<boolean>(false);

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

  const conteos: Record<EstadoSemaforo, number> = {
    VERDE: puestos.filter((p) => p.estado === 'VERDE').length,
    AMARILLO: puestos.filter((p) => p.estado === 'AMARILLO').length,
    NARANJA: puestos.filter((p) => p.estado === 'NARANJA').length,
    ROJO: puestos.filter((p) => p.estado === 'ROJO').length,
    GRIS: puestos.filter((p) => p.estado === 'GRIS').length,
  };

  const puestosFiltrados = puestos.filter((p) => {
    const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    const coincideTexto =
      !busqueda.trim() ||
      p.usuarioNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sessionId.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.motivoAlerta && p.motivoAlerta.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideTexto;
  });

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

        {/* Filtros por Estado y Búsqueda */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              aria-pressed={filtroEstado === 'TODOS'}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filtroEstado === 'TODOS'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({puestos.length})
            </button>
            <button
              onClick={() => setFiltroEstado('VERDE')}
              aria-pressed={filtroEstado === 'VERDE'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filtroEstado === 'VERDE'
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" /> Óptimos ({conteos.VERDE})
            </button>
            <button
              onClick={() => setFiltroEstado('AMARILLO')}
              aria-pressed={filtroEstado === 'AMARILLO'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filtroEstado === 'AMARILLO'
                  ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" /> Distraídos ({conteos.AMARILLO})
            </button>
            <button
              onClick={() => setFiltroEstado('NARANJA')}
              aria-pressed={filtroEstado === 'NARANJA'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filtroEstado === 'NARANJA'
                  ? 'bg-orange-500 text-white font-semibold shadow-2xs'
                  : 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500" /> Riesgo Ergo ({conteos.NARANJA})
            </button>
            <button
              onClick={() => setFiltroEstado('ROJO')}
              aria-pressed={filtroEstado === 'ROJO'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filtroEstado === 'ROJO'
                  ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-500" /> Críticos ({conteos.ROJO})
            </button>
            <button
              onClick={() => setFiltroEstado('GRIS')}
              aria-pressed={filtroEstado === 'GRIS'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                filtroEstado === 'GRIS'
                  ? 'bg-slate-700 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span aria-hidden="true" className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-400" /> Inactivos ({conteos.GRIS})
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-60 md:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario o puesto..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {puestosFiltrados.map((puesto) => (
            <TarjetaSemaforo
              key={puesto.sessionId}
              puesto={puesto}
              onSeleccionar={onSeleccionarSesion}
              seleccionado={sesionSeleccionadaId === puesto.sessionId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
