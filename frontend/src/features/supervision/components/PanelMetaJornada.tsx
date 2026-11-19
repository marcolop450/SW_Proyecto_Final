import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface Props { metaHoras: number; segundosJornada: number; enPausa: boolean; }
export const PanelMetaJornada: React.FC<Props> = ({ metaHoras, segundosJornada, enPausa }) => {
  const metaSeg = metaHoras * 3600;
  const restante = Math.max(0, metaSeg - segundosJornada);
  const porcentaje = Math.min(100, Math.floor(segundosJornada / metaSeg * 100));
  const salida = new Date(Date.now() + restante * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs" aria-label="Progreso de la jornada">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Tu jornada</p><h2 className="mt-1 text-lg font-bold text-slate-900">Meta: {metaHoras} horas</h2><p className="mt-1 text-xs text-slate-500">Tiempo registrado fuera de las pausas; es una estimación.</p></div><div className="text-left sm:text-right"><p className="flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock className="h-4 w-4"/> Salida estimada</p><p className="mt-1 text-xl font-bold text-slate-900">{restante === 0 ? 'Meta alcanzada' : enPausa ? 'Al reanudar' : salida}</p><p className="text-xs text-slate-500">{enPausa ? 'Se recalcula al terminar la pausa.' : 'Sin pausas futuras; cambia con tus descansos.'}</p></div></div>
    <div className="mt-4 flex justify-between text-xs font-semibold text-slate-600"><span>Progreso estimado</span><span>{porcentaje}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progreso de jornada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={porcentaje}><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${porcentaje}%` }}/></div>
    {restante === 0 && <p role="status" className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4"/> ¡Meta de jornada alcanzada! Puedes descansar y desconectarte.</p>}
  </section>;
};
