import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, FileText, Download, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import { api } from '../../api/client';
import { SelectorSesiones, SesionSeleccionable } from '../../features/supervision/components/SelectorSesiones';

interface SesionReporte extends SesionSeleccionable {
  fin?: string | null;
  scoreIntegridad?: number | null;
}

const OpcionReporte: React.FC<{ titulo: string; descripcion: string; valor: boolean; alCambiar: (valor: boolean) => void }> = ({ titulo, descripcion, valor, alCambiar }) => (
  <label className={`group flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${valor ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
      <input type="checkbox" checked={valor} onChange={e => alCambiar(e.target.checked)} className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-slate-400 bg-white transition-colors checked:border-emerald-700 checked:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" />
      <Check aria-hidden="true" className="pointer-events-none relative h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
    </span>
    <span><span className="block text-sm font-semibold text-slate-800">{titulo}</span><span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{descripcion}</span></span>
  </label>
);

export const PaginaReportes: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [sesiones, setSesiones] = useState<SesionReporte[]>([]);
  const [seleccionada, setSeleccionada] = useState(params.get('sessionId') || '');
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState<'excel' | 'pdf' | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [eventosExcel, setEventosExcel] = useState(true);
  const [referencia, setReferencia] = useState(true);
  const [incidentes, setIncidentes] = useState(true);
  const [eventosPdf, setEventosPdf] = useState(false);
  const sesion = sesiones.find(s => s.id === seleccionada);

  const cargar = async () => {
    setCargando(true); setError('');
    try { const res = await api.get('/supervision/sesiones'); setSesiones(res.data); }
    catch { setError('No se pudieron cargar las sesiones. Vuelve a intentarlo.'); }
    finally { setCargando(false); }
  };
  useEffect(() => { void cargar(); }, []);
  useEffect(() => { const id = params.get('sessionId'); if (id) setSeleccionada(id); }, [params]);

  const descargar = async (tipo: 'excel' | 'pdf') => {
    if (!sesion || descargando) return;
    setDescargando(tipo); setError(''); setMensaje('');
    try {
      const opciones = tipo === 'excel' ? { eventos: eventosExcel, referencia } : { incidentes, eventos: eventosPdf };
      const ruta = tipo === 'excel' ? 'ergonomico-excel' : 'forense-pdf';
      const res = await api.get(`/supervision/reportes/${sesion.id}/${ruta}`, { params: opciones, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const enlace = document.createElement('a'); enlace.href = url; enlace.download = `informe-${tipo === 'excel' ? 'ergonomico' : 'supervision'}-${sesion.id.slice(0, 8)}.${tipo === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(enlace); enlace.click(); enlace.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMensaje('Informe descargado.');
    } catch { setError('No se pudo generar el informe. Comprueba la conexión y vuelve a intentarlo.'); }
    finally { setDescargando(null); }
  };

  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div><h1 className="text-xl font-bold text-slate-900">Centro de reportes</h1><p className="mt-1 text-sm text-slate-500">Elige una sesión y prepara un informe con los datos que necesitas.</p></div>
      <button onClick={() => navigate('/consola-supervision')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4"/> Volver a supervisión</button>
    </header>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {mensaje && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{mensaje}</p>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">1. Selecciona la sesión</p>
        {sesion ? <><h2 className="mt-2 text-lg font-bold text-slate-900">{sesion.usuario ? `${sesion.usuario.nombre} ${sesion.usuario.apellido}` : 'Persona no disponible'}</h2><p className="mt-1 text-sm text-slate-600">{sesion.questionnaire?.titulo || (sesion.tipo === 'EXAMEN' ? 'Examen sin nombre' : sesion.tipo === 'TELETRABAJO' ? 'Teletrabajo' : sesion.tipo)} · {sesion.estado === 'EN_PROGRESO' ? 'En curso' : ['FINALIZADA', 'COMPLETADA'].includes(sesion.estado) ? 'Finalizada' : sesion.estado}</p><p className="mt-1 text-xs text-slate-500">Inicio: {new Date(sesion.inicio).toLocaleString()} · ID: {sesion.id.slice(0, 8)}</p><p className="mt-2 text-xs text-slate-500">{sesion._count?.eventosConducta ?? 0} eventos · {sesion._count?.incidentes ?? 0} situaciones registradas</p></> : <p className="mt-2 text-sm text-slate-600">{cargando ? 'Cargando sesiones...' : seleccionada ? 'La sesión solicitada no está disponible. Elige otra sesión.' : 'Aún no has elegido una sesión.'}</p>}</div>
        <div className="flex items-center gap-2"><SelectorSesiones sesiones={sesiones} seleccionada={seleccionada} deshabilitado={!!descargando} onSeleccionar={(id) => { setSeleccionada(id); setMensaje(''); }} /><button onClick={cargar} disabled={cargando} aria-label="Actualizar sesiones" title="Actualizar sesiones" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`}/></button></div>
      </div>
    </section>
    <section><h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">2. Personaliza y descarga</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><FileSpreadsheet className="h-6 w-6 text-emerald-600"/><h3 className="font-bold text-slate-900">Informe ergonómico · Excel</h3></div><p className="mt-3 text-sm text-slate-600">Incluye un resumen de la sesión y los valores posturales disponibles.</p>
          <fieldset className="mt-5 flex-1 space-y-2 text-sm text-slate-700"><legend className="mb-2 text-xs font-semibold text-slate-500">APARTADOS OPCIONALES</legend><OpcionReporte titulo="Eventos posturales" descripcion="Fecha, puntuación y ángulos disponibles." valor={eventosExcel} alCambiar={setEventosExcel} /><OpcionReporte titulo="Referencia RULA" descripcion="Rangos y orientación para interpretar la puntuación." valor={referencia} alCambiar={setReferencia} /></fieldset>
          <button disabled={!sesion || !!descargando} onClick={() => descargar('excel')} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4"/>{descargando === 'excel' ? 'Generando...' : 'Descargar Excel'}</button>
        </article>
        <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><FileText className="h-6 w-6 text-sky-600"/><h3 className="font-bold text-slate-900">Informe de supervisión · PDF</h3></div><p className="mt-3 text-sm text-slate-600">Resume la sesión y permite incluir el detalle de situaciones y eventos.</p>
          <fieldset className="mt-5 flex-1 space-y-2 text-sm text-slate-700"><legend className="mb-2 text-xs font-semibold text-slate-500">APARTADOS OPCIONALES</legend><OpcionReporte titulo="Situaciones y decisiones" descripcion="Incluye las observaciones y notas de revisión." valor={incidentes} alCambiar={setIncidentes} /><OpcionReporte titulo="Eventos registrados" descripcion="Añade la lista de eventos de la sesión." valor={eventosPdf} alCambiar={setEventosPdf} /></fieldset>
          <button disabled={!sesion || !!descargando} onClick={() => descargar('pdf')} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-4 w-4"/>{descargando === 'pdf' ? 'Generando...' : 'Descargar PDF'}</button>
        </article>
      </div>
      <p className="mt-3 text-xs text-slate-500">Los informes reflejan los datos registrados para la sesión elegida. Las situaciones requieren revisión humana.</p>
    </section>
  </div>;
};
export default PaginaReportes;
