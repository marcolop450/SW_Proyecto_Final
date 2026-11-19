import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Building2, ClipboardList, FileText, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { api } from '../../api/client';

const accesos = [
  { titulo: 'Exámenes y cuestionarios', descripcion: 'Crea evaluaciones y consulta las disponibles.', ruta: '/cuestionarios', icono: ClipboardList },
  { titulo: 'Consola de supervisión', descripcion: 'Consulta las sesiones en vivo y revisa sus eventos.', ruta: '/consola-supervision', icono: Activity },
  { titulo: 'Centro de reportes', descripcion: 'Consulta y prepara informes para tu organización.', ruta: '/reportes', icono: FileText },
];

export const PaginaDashboard: React.FC = () => {
  const { usuario, tieneConsentimiento } = useAuth();
  const [resumen, setResumen] = useState<{ miembros: number; departamentos: number } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [actualizado, setActualizado] = useState<Date | null>(null);
  const esGlobal = usuario?.rol === 'SUPER_ADMINISTRADOR';
  const cargar = useCallback(async () => {
    setCargando(true); setError(false);
    try {
      const respuesta = await api.get('/organizaciones/mi-organizacion');
      const miembros = respuesta.data?._count?.membresias;
      const departamentos = respuesta.data?.departamentos;
      if (typeof miembros !== 'number' || !Array.isArray(departamentos)) throw new Error('Resumen incompleto');
      setResumen({ miembros, departamentos: departamentos.length });
      setActualizado(new Date());
    } catch { setResumen(null); setActualizado(null); setError(true); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { if (!esGlobal) void cargar(); else setCargando(false); }, [cargar, esGlobal]);
  return (
    <main className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Seguridad y salud en el trabajo</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Panel general SST</h1><p className="mt-2 text-sm text-slate-500">Hola, {usuario?.nombre || 'bienvenido'}. {esGlobal ? 'Accede a las herramientas de supervisión.' : `Este es el resumen de ${usuario?.organizationName || 'tu organización'}.`}</p></div>
        {!esGlobal && <button type="button" onClick={cargar} disabled={cargando} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />Actualizar resumen</button>}
      </header>
      {!esGlobal && <section aria-labelledby="resumen-titulo" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><div><h2 id="resumen-titulo" className="text-lg font-bold text-slate-900">Tu organización</h2><p className="text-sm text-slate-500">Datos generales registrados en el sistema.</p></div>{actualizado && <span className="text-xs text-slate-500">Actualizado a las {actualizado.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}</div>
        {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">No se pudo cargar el resumen. Comprueba tu conexión y pulsa «Actualizar resumen».</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          {[{ nombre: 'Colaboradores', valor: resumen?.miembros, ayuda: 'Miembros registrados', Icono: Users }, { nombre: 'Departamentos', valor: resumen?.departamentos, ayuda: 'Áreas registradas', Icono: Building2 }].map(({ nombre, valor, ayuda, Icono }) => <div key={nombre} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center justify-between text-slate-500"><span className="text-sm font-semibold">{nombre}</span><Icono className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-3xl font-bold text-slate-900">{cargando ? '…' : valor ?? '—'}</p><p className="mt-1 text-xs text-slate-500">{error ? 'Dato no disponible' : ayuda}</p></div>)}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center justify-between text-slate-500"><span className="text-sm font-semibold">Tu consentimiento</span><ShieldCheck className="h-5 w-5 text-emerald-600" /></div><p className={`mt-3 text-xl font-bold ${tieneConsentimiento ? 'text-emerald-700' : 'text-amber-700'}`}>{tieneConsentimiento ? 'Vigente' : 'Pendiente'}</p><p className="mt-1 text-xs text-slate-500">Estado de tu autorización personal</p></div>
        </div>
      </section>}
      <section aria-labelledby="acciones-titulo" className="space-y-3"><div><h2 id="acciones-titulo" className="text-lg font-bold text-slate-900">¿Qué necesitas hacer?</h2><p className="text-sm text-slate-500">Elige una herramienta para continuar.</p></div><div className="grid gap-4 lg:grid-cols-3">{accesos.map(({ titulo, descripcion, ruta, icono: Icono }) => <Link key={ruta} to={ruta} className="group flex min-h-44 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"><Icono className="h-6 w-6 text-emerald-600" /><h3 className="mt-4 font-bold text-slate-900">{titulo}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{descripcion}</p><span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-emerald-700">Abrir <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div></section>
      <p className="text-xs leading-relaxed text-slate-500">Para ver actividad en tiempo real o resultados individuales, abre la consola de supervisión.</p>
    </main>
  );
};
