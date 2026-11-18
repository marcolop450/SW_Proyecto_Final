import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Copy, Check, Search, ExternalLink, Clock, Users, RefreshCw, ClipboardList } from 'lucide-react';
import { api } from '../../../api/client';
import { CuestionarioSupervisado } from '../types/supervision.types';
import { FormularioCuestionario } from './FormularioCuestionario';

type Evaluacion = CuestionarioSupervisado & { _count?: { sesiones: number } };
const nombres: Record<string, string> = { EXAMEN: 'Examen', ENTREVISTA: 'Entrevista', EVALUACION_LABORAL: 'Evaluación laboral' };

export const PanelGestionCuestionarios: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [copiado, setCopiado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('TODAS');
  const cargar = async () => {
    setCargando(true); setError('');
    try { const respuesta = await api.get('/supervision/cuestionarios'); setEvaluaciones(respuesta.data); }
    catch { setError('No se pudieron cargar las evaluaciones. Vuelve a intentarlo.'); }
    finally { setCargando(false); }
  };
  useEffect(() => { void cargar(); }, []);
  const resultados = useMemo(() => evaluaciones.filter(q => {
    const vigente = q.activo && new Date(q.expiraEn).getTime() > Date.now();
    const texto = `${q.titulo} ${q.codigoAcceso} ${nombres[q.tipo] || q.tipo}`.toLocaleLowerCase();
    return texto.includes(busqueda.trim().toLocaleLowerCase()) && (filtro === 'TODAS' || (filtro === 'VIGENTES' ? vigente : !vigente));
  }), [evaluaciones, busqueda, filtro]);
  const copiar = async (q: Evaluacion) => {
    try { await navigator.clipboard.writeText(q.codigoAcceso); setCopiado(q.id); setMensaje(`Código de «${q.titulo}» copiado.`); }
    catch { setError('No se pudo copiar el código. Puedes seleccionarlo y copiarlo manualmente.'); }
  };
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><h1 className="text-xl font-bold text-slate-900">Exámenes y cuestionarios</h1><p className="mt-1 text-sm text-slate-500">Organiza tus evaluaciones y comparte el código con cada postulante.</p></div><button onClick={() => setMostrarModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"><Plus className="h-4 w-4"/> Nueva evaluación</button></header>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{mensaje && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{mensaje}</p>}
    <div className="flex flex-wrap items-center gap-3"><label className="relative min-w-[200px] flex-1"><span className="sr-only">Buscar evaluación</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o código" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-emerald-600 focus:outline-2 focus:outline-emerald-200"/></label><label><span className="sr-only">Filtrar por vigencia</span><select value={filtro} onChange={e => setFiltro(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"><option value="TODAS">Todas</option><option value="VIGENTES">Vigentes</option><option value="NO_VIGENTES">No vigentes</option></select></label><button onClick={cargar} disabled={cargando} aria-label="Actualizar evaluaciones" title="Actualizar evaluaciones" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`}/></button></div>
    <p aria-live="polite" className="text-xs text-slate-500">{cargando ? 'Cargando evaluaciones...' : `${resultados.length} ${resultados.length === 1 ? 'evaluación' : 'evaluaciones'}`}</p>
    {!cargando && resultados.length === 0 && !error && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><ClipboardList className="mx-auto h-8 w-8 text-slate-400"/><p className="mt-3 text-sm font-semibold text-slate-700">No se encontraron evaluaciones</p><p className="mt-1 text-sm text-slate-500">Crea una evaluación o cambia la búsqueda y el filtro.</p></div>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{resultados.map(q => {
      const vigente = q.activo && new Date(q.expiraEn).getTime() > Date.now();
      return <article key={q.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-500">{nombres[q.tipo] || q.tipo}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${vigente ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{vigente ? 'Código vigente' : q.activo ? 'Código vencido' : 'Inactiva'}</span></div><h2 className="mt-3 break-words text-base font-bold text-slate-900">{q.titulo}</h2><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5"/>{q.duracionMinutos} min</span><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5"/>{q._count?.sesiones ?? 0} sesiones</span></div><p className="mt-2 text-xs text-slate-500">{vigente ? 'Vence' : 'Venció'}: {new Date(q.expiraEn).toLocaleString()}</p><div className="mt-4 flex items-center justify-between gap-3 border-y border-slate-100 py-3"><div><p className="text-xs text-slate-500">Código de acceso</p><p className="mt-1 select-all font-mono text-sm font-bold tracking-wide text-slate-900">{q.codigoAcceso}</p></div><button onClick={() => copiar(q)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{copiado === q.id ? <Check className="h-3.5 w-3.5 text-emerald-600"/> : <Copy className="h-3.5 w-3.5"/>}{copiado === q.id ? 'Copiado' : 'Copiar'}</button></div><div className="mt-4 flex flex-1 items-end justify-between gap-2"><p className="text-xs text-slate-500">Comparte el código con el postulante.</p><a href={q.urlExterna} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">Abrir enlace <ExternalLink className="h-3.5 w-3.5"/></a></div></article>;
    })}</div>
    <FormularioCuestionario abierto={mostrarModal} alCerrar={() => setMostrarModal(false)} alCrear={() => { setMostrarModal(false); setMensaje('Evaluación creada. Ya puedes copiar su código.'); void cargar(); }}/>
  </div>;
};
