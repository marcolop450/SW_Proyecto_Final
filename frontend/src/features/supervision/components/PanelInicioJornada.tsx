import React, { useEffect, useState } from 'react';
import { Play, Clock, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  onIniciar: () => void;
  deshabilitado?: boolean;
  metaHoras: number;
  onCambiarMeta: (horas: number) => void;
}

export const PanelInicioJornada: React.FC<Props> = ({ onIniciar, deshabilitado, metaHoras, onCambiarMeta }) => {
  const [horaActual, setHoraActual] = useState('');
  const [fechaActual, setFechaActual] = useState('');

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setFechaActual(
        ahora.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    actualizarFechaHora();
    const timer = setInterval(actualizarFechaHora, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 text-center max-w-2xl mx-auto my-2 space-y-5 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto shadow-xs">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize">{fechaActual}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">
          {horaActual}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto pt-2">
          Tu jornada de teletrabajo aún no ha iniciado. Haz clic en el botón inferior para sellar tu hora de ingreso.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fichaje de Ingreso</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Registro con marca temporal exacta.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Presencia Local</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Verificación biométrica en tu navegador.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pausas Flexibles</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Almuerzo, café y estiramiento protegidos.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <fieldset disabled={deshabilitado} className="mb-5">
          <legend className="mx-auto mb-2 text-sm font-semibold text-slate-700">Elige tu meta de jornada</legend>
          <div className="flex justify-center gap-2">{[4, 6, 8].map(horas => <label key={horas} className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold ${metaHoras === horas ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'}`}><input type="radio" name="meta-jornada" value={horas} checked={metaHoras === horas} onChange={() => onCambiarMeta(horas)} className="mr-2 accent-emerald-700" />{horas} h</label>)}</div>
        </fieldset>
        <button
          onClick={onIniciar}
          disabled={deshabilitado}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm tracking-tight shadow-md hover:shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Iniciar Jornada de Teletrabajo</span>
        </button>

        <p className="text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cumplimiento Zero-Image: ningún fotograma se graba ni se transmite.</span>
        </p>
      </div>
    </div>
  );
};
