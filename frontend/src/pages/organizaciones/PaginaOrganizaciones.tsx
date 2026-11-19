import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Plus, Calendar, FolderTree, Users, RefreshCw, Search } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/ContextoAutenticacion';
import { Boton } from '../../components/ui/Boton';
import { ModalNuevoDepartamento } from './ModalNuevoDepartamento';
import { DirectorioClientesSuperAdmin } from './DirectorioClientesSuperAdmin';

type Departamento = { id: string; nombre: string; descripcion?: string | null; _count?: { membresias: number } };
type Organizacion = { nombre: string; identificacionFiscal?: string | null; creadoEn: string; _count?: { membresias: number } };

export const PaginaOrganizaciones: React.FC = () => {
  const { usuario } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMINISTRADOR';
  const [organizacion, setOrganizacion] = useState<Organizacion | null>(null);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [todas, setTodas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const cargarDatos = useCallback(async () => {
    setCargando(true); setError(false);
    try {
      if (esSuperAdmin) {
        const res = await api.get('/organizaciones/todas');
        setTodas(res.data);
      } else {
        const [org, deps] = await Promise.all([api.get('/organizaciones/mi-organizacion'), api.get('/organizaciones/departamentos')]);
        setOrganizacion(org.data); setDepartamentos(deps.data);
      }
    } catch { setError(true); }
    finally { setCargando(false); }
  }, [esSuperAdmin]);
  useEffect(() => { void cargarDatos(); }, [cargarDatos]);
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();
    return departamentos.filter(dep => `${dep.nombre} ${dep.descripcion || ''}`.toLocaleLowerCase().includes(texto));
  }, [departamentos, busqueda]);
  return (
    <main className="space-y-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Administración</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{esSuperAdmin ? 'Organizaciones' : 'Mi organización'}</h1><p className="mt-2 text-sm text-slate-500">{esSuperAdmin ? 'Consulta las organizaciones registradas.' : 'Consulta los datos de tu organización y organiza sus departamentos.'}</p></div>
        <button type="button" onClick={cargarDatos} disabled={cargando} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />Actualizar</button>
      </header>
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No se pudieron cargar los datos. Comprueba tu conexión y vuelve a intentarlo con «Actualizar».</div>}
      {cargando && <p role="status" className="py-8 text-sm text-slate-500">Cargando información de la organización…</p>}
      {!cargando && !error && esSuperAdmin && <DirectorioClientesSuperAdmin organizaciones={todas} />}
      {!cargando && !error && !esSuperAdmin && organizacion && <>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6" aria-labelledby="organizacion-titulo">
          <div className="flex items-start gap-4"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Building2 className="h-6 w-6" /></div><div><p className="text-xs font-semibold text-slate-500">Datos generales</p><h2 id="organizacion-titulo" className="mt-1 text-xl font-bold text-slate-900">{organizacion.nombre}</h2><p className="mt-1 text-sm text-slate-500">Información registrada de tu empresa</p></div></div>
          <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3"><div><dt className="text-xs text-slate-500">Identificación fiscal</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{organizacion.identificacionFiscal || 'No registrada'}</dd></div><div><dt className="text-xs text-slate-500">Fecha de registro</dt><dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Calendar className="h-4 w-4 text-slate-400" />{organizacion.creadoEn ? new Date(organizacion.creadoEn).toLocaleDateString() : 'No disponible'}</dd></div><div><dt className="text-xs text-slate-500">Miembros registrados</dt><dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Users className="h-4 w-4 text-slate-400" />{organizacion._count?.membresias ?? 'No disponible'}</dd></div></dl>
        </section>
        <section className="space-y-4" aria-labelledby="departamentos-titulo">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="departamentos-titulo" className="text-lg font-bold text-slate-900">Departamentos <span className="text-sm font-normal text-slate-500">({departamentos.length})</span></h2><p className="mt-1 text-sm text-slate-500">Organiza las áreas de tu empresa y consulta sus miembros.</p></div><Boton icono={Plus} onClick={() => setModalAbierto(true)}>Nuevo departamento</Boton></div>
          {departamentos.length > 0 && <label className="relative block max-w-sm"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar departamento" aria-label="Buscar departamento" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>}
          {filtrados.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtrados.map(dep => <article key={dep.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-start gap-3"><FolderTree className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div className="min-w-0"><h3 className="break-words font-bold text-slate-900">{dep.nombre}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{dep.descripcion || 'Sin descripción.'}</p></div></div><p className="mt-5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">{dep._count?.membresias ?? '—'} miembros</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><FolderTree className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 font-semibold text-slate-700">{busqueda ? 'No encontramos departamentos' : 'Todavía no hay departamentos'}</p><p className="mt-1 text-sm text-slate-500">{busqueda ? 'Prueba con otro término de búsqueda.' : 'Crea el primero para organizar las áreas de tu empresa.'}</p></div>}
        </section>
        <ModalNuevoDepartamento abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} alCrear={cargarDatos} />
      </>}
    </main>
  );
};
