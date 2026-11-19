import React, { useState } from 'react';
import { Camera, CheckCircle2, Clock, KeyRound, Play, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { VisorSupervisionExamen } from '../supervision/components/VisorSupervisionExamen';
import { api } from '../../api/client';
import { usePruebaCamara } from './hooks/usePruebaCamara';

export const PaginaPortalPostulante: React.FC = () => {
  const { usuario, tieneConsentimiento } = useAuth();
  const camara = usePruebaCamara();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [examen, setExamen] = useState<{ titulo: string; duracionMinutos: number; codigo: string; urlExterna: string } | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [sesion, setSesion] = useState<{ id: string; url: string; duracion: number } | null>(null);
  const consultar = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = codigo.trim();
    if (!valor || consultando) return;
    setConsultando(true); setError(null); setExamen(null);
    try {
      const res = await api.get(`/supervision/cuestionarios/codigo/${encodeURIComponent(valor)}`);
      if (!res.data.urlExterna) { setError('Este examen no tiene un enlace disponible. Consulta con tu evaluador.'); return; }
      setExamen({ titulo: res.data.titulo, duracionMinutos: res.data.duracionMinutos, urlExterna: res.data.urlExterna, codigo: valor });
    } catch (err: any) { setError(err?.response?.data?.message || 'No se pudo encontrar el examen. Comprueba el código e inténtalo de nuevo.'); }
    finally { setConsultando(false); }
  };
  const iniciar = async () => {
    if (!examen || !camara.lista || !tieneConsentimiento || iniciando) return;
    setIniciando(true); setError(null);
    try {
      const res = await api.post('/supervision/sesion/iniciar', { codigoAcceso: examen.codigo, tipo: 'EXAMEN' });
      camara.detener();
      setSesion({ id: res.data.id, url: res.data.urlExterna || examen.urlExterna, duracion: res.data.duracionMinutos ?? examen.duracionMinutos });
    } catch (err: any) { setError(err?.response?.data?.message || 'No se pudo iniciar el examen. Inténtalo de nuevo.'); }
    finally { setIniciando(false); }
  };
  if (sesion) return <VisorSupervisionExamen sessionId={sesion.id} urlExterna={sesion.url} duracionMinutos={sesion.duracion} onFinalizar={() => setSesion(null)} />;
  return (
    <main className="space-y-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Portal del postulante</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Prepárate para tu examen</h1><p className="mt-1 text-sm text-slate-500">Hola, {usuario?.nombre}. Comprueba tu cámara y busca tu examen para comenzar.</p></div>
        <span className={`inline-flex items-center gap-2 text-sm font-medium ${tieneConsentimiento ? 'text-emerald-700' : 'text-amber-700'}`}><ShieldCheck className="h-4 w-4" />Consentimiento {tieneConsentimiento ? 'vigente' : 'pendiente'}</span>
      </header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-start">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs" aria-labelledby="camara-titulo">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-semibold text-emerald-700">PASO 1</p><h2 id="camara-titulo" className="mt-1 text-lg font-bold text-slate-900">Comprueba tu cámara</h2><p className="mt-1 text-sm text-slate-500">Permite el acceso y comprueba que tu rostro se vea con claridad.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${camara.lista ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{camara.lista ? 'Cámara disponible' : 'Pendiente'}</span></div>
          <div className="relative mx-auto aspect-video max-h-80 overflow-hidden rounded-xl bg-slate-950"><video ref={camara.videoRef} playsInline muted className={`h-full w-full -scale-x-100 object-cover ${camara.lista ? '' : 'opacity-0'}`} />{!camara.lista && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center text-slate-300"><Camera className="h-8 w-8 text-slate-400" /><p className="text-sm font-semibold">Tu vista previa aparecerá aquí</p><p className="text-xs text-slate-400">Enciende la cámara para comprobarla.</p></div>}</div>
          {camara.error && <p role="alert" className="text-sm text-rose-700">{camara.error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">Busca buena luz y mantén tu rostro dentro de la imagen.</p><button type="button" onClick={camara.probar} disabled={camara.comprobando || !tieneConsentimiento} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{camara.comprobando ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}{camara.comprobando ? 'Comprobando…' : camara.lista ? 'Volver a comprobar' : 'Probar cámara'}</button></div>
        </section>
        <div className="space-y-4">
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><p className="text-xs font-semibold text-emerald-700">PASO 2</p><h2 className="text-lg font-bold text-slate-900">Busca tu examen</h2><p className="text-sm text-slate-500">Ingresa el código que te proporcionó tu evaluador.</p><form onSubmit={consultar} className="space-y-3"><label htmlFor="codigo-examen" className="text-sm font-semibold text-slate-700">Código de acceso</label><div className="relative"><KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input id="codigo-examen" value={codigo} onChange={e => { setCodigo(e.target.value.toUpperCase()); setExamen(null); setError(null); }} disabled={consultando || iniciando} placeholder="Ej.: EXAM-A1B2C3" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100" /></div><button disabled={consultando || !codigo.trim()} className="w-full rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">{consultando ? 'Buscando…' : 'Buscar examen'}</button></form>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}</section>
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div><p className="text-xs font-semibold text-emerald-700">PASO 3</p><h2 className="mt-1 text-lg font-bold text-slate-900">Revisa y comienza</h2></div><dl className="space-y-2 text-sm"><div><dt className="text-slate-500">Postulante</dt><dd className="font-semibold text-slate-900">{usuario?.nombre} {usuario?.apellido}</dd><dd className="break-all text-xs text-slate-500">{usuario?.correo}</dd></div><div><dt className="text-slate-500">Examen</dt><dd className="font-semibold text-slate-900">{examen?.titulo || 'Aún no seleccionado'}</dd></div>{examen && <div className="flex items-center gap-2 text-slate-600"><Clock className="h-4 w-4" />{examen.duracionMinutos} minutos</div>}</dl><p className="text-xs leading-relaxed text-slate-500">La sesión quedará asociada a esta cuenta. Comprueba tus datos antes de comenzar.</p><button type="button" onClick={iniciar} disabled={!camara.lista || !examen || !tieneConsentimiento || iniciando || consultando} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400"><Play className="h-4 w-4" />{iniciando ? 'Iniciando…' : 'Iniciar examen'}</button><p className="flex items-start gap-2 text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{!tieneConsentimiento ? 'Necesitas un consentimiento vigente.' : !camara.lista ? 'Primero comprueba tu cámara.' : !examen ? 'Busca tu examen para continuar.' : 'Todo listo para comenzar.'}</p></section>
        </div>
      </div>
    </main>
  );
};
