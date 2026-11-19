import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { api } from '../../../api/client';

type Medicion = { id: string; timestamp: string; detalles: { indicadorPostura?: number; cuelloAngulo?: number; troncoAngulo?: number } };

export function MedicionesPosturaSesion({ sessionId }: { sessionId: string }) {
  const [datos, setDatos] = useState<Medicion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let activo = true;
    setDatos([]); setCargando(true); setError(false);
    api.get(`/supervision/sesiones/${sessionId}/postura`).then(res => { if (activo) setDatos(res.data); }).catch(() => { if (activo) setError(true); }).finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [sessionId, revision]);
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs" aria-labelledby="titulo-mediciones">
    <div className="flex items-start justify-between gap-3"><div><h3 id="titulo-mediciones" className="flex items-center gap-2 text-sm font-bold text-slate-900"><Activity className="h-4 w-4 text-emerald-600" />Mediciones de postura de esta sesión</h3><p className="mt-1 text-xs text-slate-500">Estimaciones orientativas; no constituyen una evaluación RULA completa ni indican una falta.</p></div><button type="button" onClick={() => setRevision(n => n + 1)} disabled={cargando} aria-label="Actualizar mediciones" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} /></button></div>
    {cargando ? <p className="mt-4 text-sm text-slate-500">Cargando mediciones…</p> : error ? <p role="alert" className="mt-4 text-sm text-rose-700">No se pudieron cargar las mediciones. Inténtalo de nuevo.</p> : !datos.length ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay mediciones de postura registradas para esta sesión.</p> : <div className="mt-4 max-h-72 overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="p-2">Fecha y hora</th><th className="p-2">Indicador / 7</th><th className="p-2">Cuello</th><th className="p-2">Tronco</th></tr></thead><tbody>{datos.map(d => <tr key={d.id} className="border-t border-slate-100 text-slate-700"><td className="p-2">{new Date(d.timestamp).toLocaleString()}</td><td className="p-2">{d.detalles?.indicadorPostura ?? '—'}</td><td className="p-2">{d.detalles?.cuelloAngulo != null ? `${d.detalles.cuelloAngulo}°` : '—'}</td><td className="p-2">{d.detalles?.troncoAngulo != null ? `${d.detalles.troncoAngulo}°` : '—'}</td></tr>)}</tbody></table><p className="mt-2 text-xs text-slate-500">Se muestran hasta 500 mediciones recientes de la sesión seleccionada.</p></div>}
  </section>;
}
