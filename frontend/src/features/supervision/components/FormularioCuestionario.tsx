import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { api } from '../../../api/client';

interface Props { abierto: boolean; alCerrar: () => void; alCrear: () => void; }
const campo = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-200';

export const FormularioCuestionario: React.FC<Props> = ({ abierto, alCerrar, alCrear }) => {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState('EXAMEN');
  const [duracion, setDuracion] = useState(60);
  const [vigencia, setVigencia] = useState(24);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (abierto && !dialogo.current?.open) dialogo.current?.showModal(); if (!abierto && dialogo.current?.open) dialogo.current.close(); }, [abierto]);
  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setError('');
    try {
      const direccion = new URL(url.trim());
      if (!['http:', 'https:'].includes(direccion.protocol)) throw new Error('Enlace inválido');
      if (!titulo.trim()) throw new Error('Escribe un título para la evaluación.');
      setGuardando(true);
      await api.post('/supervision/cuestionarios', { titulo: titulo.trim(), urlExterna: direccion.href, tipo, duracionMinutos: duracion, vigenciaHoras: vigencia });
      setTitulo(''); setUrl(''); setTipo('EXAMEN'); setDuracion(60); setVigencia(24); alCrear();
    } catch (e: any) { setError(e?.response?.data?.message || e?.message || 'No se pudo crear la evaluación.'); }
    finally { setGuardando(false); }
  };
  return <dialog ref={dialogo} onClose={alCerrar} onCancel={e => { if (guardando) e.preventDefault(); }} aria-labelledby="titulo-nueva-evaluacion" className="m-auto max-h-[90vh] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-slate-200 p-0 shadow-2xl backdrop:bg-slate-900/50">
    <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 id="titulo-nueva-evaluacion" className="text-lg font-bold text-slate-900">Nueva evaluación</h2><p className="mt-1 text-sm text-slate-500">Registra el enlace y genera un código para tus postulantes.</p></div><button type="button" disabled={guardando} onClick={alCerrar} aria-label="Cerrar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4"/></button></div>
      <form onSubmit={crear} className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">Nombre de la evaluación<input autoFocus required maxLength={150} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Examen de ingreso" className={campo}/></label>
        <label className="block text-sm font-semibold text-slate-700">Enlace del examen<input required type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className={campo}/><span className="mt-1 block text-xs font-normal text-slate-500">Enlace al formulario o evaluación externa.</span></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Tipo<select value={tipo} onChange={e => setTipo(e.target.value)} className={campo}><option value="EXAMEN">Examen</option><option value="ENTREVISTA">Entrevista</option><option value="EVALUACION_LABORAL">Evaluación laboral</option></select></label><label className="block text-sm font-semibold text-slate-700">Duración (minutos)<input required type="number" min={1} max={1440} value={duracion} onChange={e => setDuracion(Number(e.target.value))} className={campo}/></label></div>
        <label className="block text-sm font-semibold text-slate-700">Vigencia del código (horas)<input required type="number" min={1} max={8760} value={vigencia} onChange={e => setVigencia(Number(e.target.value))} className={campo}/><span className="mt-1 block text-xs font-normal text-slate-500">El código vence después de este tiempo desde su creación.</span></label>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={guardando} onClick={alCerrar} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Plus className="h-4 w-4"/>{guardando ? 'Guardando...' : 'Crear evaluación'}</button></div>
      </form>
    </div>
  </dialog>;
};
