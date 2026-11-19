import React from 'react';
import { Activity, ArrowRight, Camera, CheckCircle2, Coffee, ShieldCheck } from 'lucide-react';

interface Props {
  onIniciarCalibracion: () => void;
  tieneConsentimiento: boolean;
}

export const PanelInicioErgonomia: React.FC<Props> = ({ onIniciarCalibracion, tieneConsentimiento }) => (
  <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
    <div className="flex flex-col items-start p-6 sm:p-8 lg:p-10">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Activity className="h-5 w-5" /></div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-emerald-700">Tu espacio de bienestar</p>
      <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Empieza con una postura cómoda</h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600">Prepara la cámara y calibra tu posición para consultar indicadores de postura y recordatorios durante tu sesión.</p>
      <button type="button" onClick={onIniciarCalibracion} disabled={!tieneConsentimiento} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
        Preparar mi sesión <ArrowRight className="h-4 w-4" />
      </button>
      {!tieneConsentimiento && <p className="mt-2 text-xs text-rose-700">Necesitas un consentimiento vigente para iniciar.</p>}
      <div className="mt-6 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>La cámara se utiliza durante la sesión. Revisa los permisos de tu navegador antes de empezar.</span></div>
    </div>
    <div className="border-t border-slate-100 bg-slate-50/70 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Antes de empezar</p>
      <h3 className="mt-2 text-lg font-bold text-slate-900">Tres pasos para prepararte</h3>
      <ol className="mt-5 divide-y divide-slate-200/80">
        <li className="flex gap-3 py-4 first:pt-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700"><Camera className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-slate-800">Enciende tu cámara</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Permite el acceso si tu navegador lo solicita y busca un lugar iluminado.</p></div></li>
        <li className="flex gap-3 py-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700"><CheckCircle2 className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-slate-800">Calibra tu posición</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Siéntate cómodamente y sigue las indicaciones de la pantalla.</p></div></li>
        <li className="flex gap-3 py-4 last:pb-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700"><Coffee className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-slate-800">Consulta y descansa</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Revisa tus indicadores y utiliza las pausas guiadas disponibles.</p></div></li>
      </ol>
    </div>
  </section>
);
