import React, { useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, Search } from 'lucide-react';

export interface SesionSeleccionable {
  id: string;
  tipo: string;
  estado: string;
  inicio: string;
  usuario?: { nombre: string; apellido: string; correo: string };
  questionnaire?: { titulo: string } | null;
  questionnaireId?: string | null;
  _count?: { incidentes: number; eventosConducta: number };
}

interface Props {
  sesiones: SesionSeleccionable[];
  seleccionada: string;
  deshabilitado?: boolean;
  onSeleccionar: (id: string) => void;
}

export const SelectorSesiones: React.FC<Props> = ({ sesiones, seleccionada, deshabilitado, onSeleccionar }) => {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('TODAS');
  const resultados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();
    return sesiones.filter((s) => {
      const textoSesion = [s.usuario?.nombre, s.usuario?.apellido, s.usuario?.correo, s.questionnaire?.titulo, s.tipo, s.id, new Date(s.inicio).toLocaleString()].join(' ').toLocaleLowerCase();
      const activa = s.estado === 'EN_PROGRESO';
      return (!texto || textoSesion.includes(texto)) && (estado === 'TODAS' || (estado === 'ACTIVAS' ? activa : !activa));
    });
  }, [sesiones, busqueda, estado]);
  const grupos = useMemo(() => {
    const lista = new Map<string, { titulo: string; sesiones: SesionSeleccionable[] }>();
    for (const sesion of resultados) {
      const clave = sesion.questionnaireId ? `examen:${sesion.questionnaireId}` : `tipo:${sesion.tipo}`;
      const titulo = sesion.questionnaire?.titulo || (sesion.tipo === 'EXAMEN' ? 'Exámenes sin nombre' : sesion.tipo === 'TELETRABAJO' ? 'Teletrabajo' : sesion.tipo);
      const grupo = lista.get(clave) || { titulo, sesiones: [] };
      grupo.sesiones.push(sesion);
      lista.set(clave, grupo);
    }
    return Array.from(lista.entries());
  }, [resultados]);

  return <>
    <button type="button" disabled={deshabilitado} onClick={() => dialogo.current?.showModal()} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">
      <Search className="h-4 w-4" /> {seleccionada ? 'Cambiar sesión' : 'Elegir sesión'}
    </button>
    <dialog ref={dialogo} aria-labelledby="titulo-selector-sesiones" className="m-auto w-[min(42rem,calc(100%-2rem))] max-h-[85vh] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="titulo-selector-sesiones" className="text-lg font-bold text-slate-900">Elegir una sesión</h2><p className="mt-1 text-sm text-slate-500">Busca por persona, examen, fecha o identificador.</p></div>
          <button type="button" onClick={() => dialogo.current?.close()} className="text-sm text-slate-600 hover:text-slate-900">Cerrar</button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">Buscar sesiones</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input autoFocus value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, examen o fecha" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none" /></label>
          <label><span className="sr-only">Filtrar por estado</span><select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"><option value="TODAS">Todas las sesiones</option><option value="ACTIVAS">En curso</option><option value="FINALIZADAS">Finalizadas</option></select></label>
        </div>
        <p aria-live="polite" className="mt-4 text-xs text-slate-500">{resultados.length} {resultados.length === 1 ? 'sesión encontrada' : 'sesiones encontradas'}</p>
        <div className="mt-2 max-h-[50vh] space-y-2 overflow-y-auto">
          {grupos.map(([clave, grupo]) => <section key={clave} className="pt-3 first:pt-0"><h3 className="px-1 pb-2 text-sm font-bold text-slate-800">{grupo.titulo} <span className="font-normal text-slate-500">({grupo.sesiones.length})</span></h3><div className="space-y-2">{grupo.sesiones.map((s) => <button type="button" key={s.id} onClick={() => { onSeleccionar(s.id); dialogo.current?.close(); }} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${s.id === seleccionada ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{s.usuario ? `${s.usuario.nombre} ${s.usuario.apellido}` : 'Sin nombre'}</span><span className="mt-1 block text-xs text-slate-600">{s.estado === 'EN_PROGRESO' ? 'En curso' : ['FINALIZADA', 'COMPLETADA'].includes(s.estado) ? 'Finalizada' : s.estado} · {s._count?.incidentes ?? 0} situaciones registradas</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="h-3 w-3" />{new Date(s.inicio).toLocaleString()} · {s.id.slice(0, 8)}</span></span>
            {s.id === seleccionada && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Sesión seleccionada" />}
          </button>)}</div></section>)}
          {resultados.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No se encontraron sesiones. Prueba con otra búsqueda o filtro.</p>}
        </div>
      </div>
    </dialog>
  </>;
};
