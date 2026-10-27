import React, { useState } from 'react';
import { Play, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const ModuloPausaActiva: React.FC = () => {
  const [pausaEnCurso, setPausaEnCurso] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(120);

  const iniciarPausaActiva = () => {
    setPausaEnCurso(true);
    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setPausaEnCurso(false);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Pausa Activa Guiada</h2>
          <span className="text-[11px] font-mono text-slate-500">2 minutos sugeridos</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed">
            Estiramiento cervical: inclina lentamente la cabeza hacia cada hombro durante 10 segundos
            para aliviar la tensión muscular del cuello y trapecio.
          </p>

          {pausaEnCurso ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-800">
                <RotateCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>En progreso: {segundosRestantes} segundos restantes</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={iniciarPausaActiva}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Iniciar Temporizador de Pausa</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Recomendaciones de Calibración ISO 11226</h2>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Distancia del Monitor</p>
              <p className="text-[11px] text-slate-500">Aproximadamente 55-65 cm (longitud del brazo extendido).</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Soporte Lumbar</p>
              <p className="text-[11px] text-slate-500">Ajusta el respaldo para mantener la curva lordótica natural.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
