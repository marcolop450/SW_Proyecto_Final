import React from 'react';
import type { SignalExplicativa } from './LineaTiempoIncidentes';

const niveles = [
  { rango: '1–2', detalle: 'Aceptable si no se mantiene o repite durante largos periodos.' },
  { rango: '3–4', detalle: 'Conviene investigar; podrían ser necesarios cambios.' },
  { rango: '5–6', detalle: 'Se recomienda investigar y hacer cambios pronto.' },
  { rango: '7', detalle: 'Se recomienda investigar y hacer cambios de inmediato.' },
];

export const DetalleSenal: React.FC<{ señal: SignalExplicativa }> = ({ señal }) => {
  const valor = señal.valor && typeof señal.valor === 'object' && !Array.isArray(señal.valor) ? señal.valor as Record<string, unknown> : null;
  const puntuacion = typeof valor?.rulaScore === 'number' && Number.isInteger(valor.rulaScore) && valor.rulaScore >= 1 && valor.rulaScore <= 7 ? valor.rulaScore : null;
  const nivelActual = puntuacion === null ? -1 : puntuacion <= 2 ? 0 : puntuacion <= 4 ? 1 : puntuacion <= 6 ? 2 : 3;
  const angulos = [ ['Cuello', valor?.cuelloAngulo], ['Tronco', valor?.troncoAngulo] ] as const;
  const esPostura = señal.tipo === 'POSTURA_FORZADA';
  return <article className="border-b border-slate-100 py-4 last:border-0">
    <h5 className="text-sm font-semibold text-slate-900">{esPostura ? 'Postura que necesita revisión' : señal.tipo.replace(/_/g, ' ')}</h5>
    {señal.criterio && !esPostura && <p className="mt-1 text-sm text-slate-600">{señal.criterio}</p>}
    {puntuacion !== null && <div className="mt-3 rounded-xl bg-slate-50 p-4">
      <div className="flex flex-wrap items-baseline gap-x-3"><span className="text-sm font-semibold text-slate-800">Puntuación RULA registrada</span><span className="text-xl font-bold text-amber-700">{puntuacion} <span className="text-sm text-slate-500">/ 7</span></span></div>
      <p className="mt-1 text-sm text-slate-700">{niveles[nivelActual].detalle}</p>
      <h6 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Referencia para comparar</h6>
      <div className="mt-2 space-y-1">{niveles.map((nivel, i) => <div key={nivel.rango} className={`flex gap-3 rounded-lg px-2 py-1.5 text-xs ${i === nivelActual ? 'bg-amber-100 font-semibold text-amber-900' : 'text-slate-600'}`}><span className="w-8 shrink-0">{nivel.rango}</span><span>{nivel.detalle}{i === nivelActual ? ' (resultado registrado)' : ''}</span></div>)}</div>
      <p className="mt-3 text-xs text-slate-500">RULA orienta la revisión de una postura; 1–2 no garantiza ausencia de riesgo. El resultado mostrado procede de los datos registrados por el sistema.</p>
      <a className="mt-2 inline-block text-xs font-medium text-emerald-700 underline" href="https://www.ergo.human.cornell.edu/ErgoPROJECTS/HOffice/rula.htm" target="_blank" rel="noreferrer">Consultar la referencia RULA de Cornell</a>
    </div>}
    {angulos.some(([, n]) => typeof n === 'number' && Number.isFinite(n)) && <div className="mt-3"><p className="text-xs font-semibold text-slate-700">Ángulos registrados</p><div className="mt-1 flex flex-wrap gap-3">{angulos.map(([nombre, n]) => typeof n === 'number' && Number.isFinite(n) ? <span key={nombre} className="text-sm text-slate-600">{nombre}: <strong>{n}°</strong></span> : null)}</div><p className="mt-1 text-xs text-slate-500">Los ángulos requieren interpretación según la postura y el contexto; no se comparan aquí con un único valor normal.</p></div>}
    {señal.recomendacionForense && !esPostura && <p className="mt-3 text-sm text-slate-600">{señal.recomendacionForense}</p>}
    {señal.valor != null && <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer text-emerald-700">Ver datos registrados</summary><pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3">{JSON.stringify(señal.valor, null, 2)}</pre></details>}
  </article>;
};
