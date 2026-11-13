import React from 'react';
import { Monitor, Wifi, WifiOff } from 'lucide-react';
import { useWebSocketSupervisor } from '../hooks/useWebSocketSupervisor';
import { TarjetaSemaforo } from './TarjetaSemaforo';

export const ConsolaMosaicoSemaforo: React.FC = () => {
  const { puestos, conectado } = useWebSocketSupervisor();

  const conteos = {
    VERDE: puestos.filter((p) => p.estado === 'VERDE').length,
    AMARILLO: puestos.filter((p) => p.estado === 'AMARILLO').length,
    NARANJA: puestos.filter((p) => p.estado === 'NARANJA').length,
    ROJO: puestos.filter((p) => p.estado === 'ROJO').length,
    GRIS: puestos.filter((p) => p.estado === 'GRIS').length,
  };

  return (
    <div className="space-y-4">
      {/* Barra de estado y contadores de semáforo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">Mosaico en Vivo</h3>
            <p className="text-[10px] text-slate-500 font-mono">Watchdog automático a 15 segundos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {conteos.VERDE} Óptimos
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {conteos.AMARILLO} Distraídos
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">
            {conteos.NARANJA} Riesgo Ergo
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {conteos.ROJO} Críticos
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {conteos.GRIS} Inactivos
          </span>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
              conectado
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {conectado ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
            <span>{conectado ? 'Canal WSS Activo' : 'Desconectado'}</span>
          </div>
        </div>
      </div>

      {/* Mosaico de puestos */}
      {puestos.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-8 text-center">
          <Monitor className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No hay puestos transmitiendo telemetría en tiempo real</p>
          <p className="text-[10px] text-slate-600 font-mono mt-1">
            Los evaluados y puestos de teletrabajo aparecerán aquí automáticamente al iniciar su sesión
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {puestos.map((puesto) => (
            <TarjetaSemaforo key={puesto.sessionId} puesto={puesto} />
          ))}
        </div>
      )}
    </div>
  );
};
