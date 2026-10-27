import React from 'react';
import { Calendar, Play, Square, RotateCw } from 'lucide-react';
import { Insignia } from '../../components/ui/Insignia';

interface SesionItem {
  id: string;
  startTime: string;
  endTime: string | null;
  averageRula: number | null;
  totalAlerts: number;
}

interface HistorialSesionesProps {
  sesiones: SesionItem[];
  alReanudarSesion: (sesion: SesionItem) => void;
  alFinalizarSesion: (id: string) => void;
}

export const HistorialSesionesErgonomia: React.FC<HistorialSesionesProps> = ({
  sesiones,
  alReanudarSesion,
  alFinalizarSesion,
}) => {
  if (sesiones.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Historial Reciente de Sesiones</h3>
          <p className="text-xs text-slate-500">Registros de telemetría postural en base de datos</p>
        </div>
        <span className="text-xs text-slate-500 font-mono">Últimas 10 evaluaciones</span>
      </div>

      <div className="divide-y divide-slate-100">
        {sesiones.map((s) => {
          const enCurso = !s.endTime;
          return (
            <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-800 font-semibold">
                    {new Date(s.startTime).toLocaleDateString([], { day: '2-digit', month: 'short' })} -{' '}
                    {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    {enCurso ? 'Sesión en curso actualmente' : `Finalizado: ${new Date(s.endTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="font-mono text-slate-600">
                  RULA: <strong className="text-slate-900">{s.averageRula ? s.averageRula.toFixed(1) : '1.0'}</strong>
                </span>

                <Insignia variante={s.totalAlerts === 0 ? 'exito' : 'advertencia'}>
                  {s.totalAlerts} {s.totalAlerts === 1 ? 'alerta' : 'alertas'}
                </Insignia>

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
                  <span className="text-[11px] font-mono text-slate-400">Archivada</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
