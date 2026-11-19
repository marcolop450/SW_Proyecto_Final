import React, { useEffect, useRef } from 'react';

interface Props { abierto: boolean; ocupado: boolean; nota: string; error?: string; onNota: (valor: string) => void; onCerrar: () => void; onConfirmar: () => void; }
export const DialogoFinalizarJornada: React.FC<Props> = ({ abierto, ocupado, nota, error, onNota, onCerrar, onConfirmar }) => {
  const dialogo = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (abierto && !dialogo.current?.open) dialogo.current?.showModal(); else if (!abierto && dialogo.current?.open) dialogo.current.close(); }, [abierto]);
  return <dialog ref={dialogo} onClose={onCerrar} onCancel={e => { if (ocupado) e.preventDefault(); }} aria-labelledby="titulo-fin-jornada" className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-slate-950/50">
    <h2 id="titulo-fin-jornada" className="text-lg font-bold text-slate-900">¿Finalizar tu jornada?</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Se guardarán los tiempos registrados y se cerrará la jornada actual.</p>
    <label htmlFor="nota-jornada" className="mt-5 block text-sm font-semibold text-slate-800">¿En qué avanzaste hoy? <span className="font-normal text-slate-500">(opcional)</span></label>
    <textarea id="nota-jornada" value={nota} onChange={e => onNota(e.target.value)} maxLength={2000} rows={4} placeholder="Por ejemplo: reunión con el equipo, revisión de tareas..." className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-600 focus:outline-2 focus:outline-emerald-200" />
    <p className="text-xs text-slate-500">La nota se guarda con la sesión y puede ser consultada en los datos de supervisión.</p>
    {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" disabled={ocupado} onClick={onCerrar} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Continuar jornada</button><button type="button" disabled={ocupado} onClick={onConfirmar} className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50">{ocupado ? 'Guardando...' : 'Sí, finalizar'}</button></div>
  </dialog>;
};
