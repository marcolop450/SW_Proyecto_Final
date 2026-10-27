import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, ChevronRight, X, Heart } from 'lucide-react';
import { Boton } from '../../components/ui/Boton';

interface EjercicioPausa {
  titulo: string;
  zona: string;
  descripcion: string;
  duracionSeg: number;
}

const EJERCICIOS_DEFAULT: EjercicioPausa[] = [
  {
    titulo: 'Descompresión Cervical',
    zona: 'Cuello y Trapecios',
    descripcion: 'Inclina lentamente la cabeza hacia el hombro derecho por 10s, luego hacia el izquierdo. Mantén los hombros relajados.',
    duracionSeg: 20,
  },
  {
    titulo: 'Retracción Escapular',
    zona: 'Espalda Alta y Pectoral',
    descripcion: 'Lleva los hombros hacia atrás y abajo, juntando los omóplatos suavemente. Sostén una respiración pausada.',
    duracionSeg: 20,
  },
  {
    titulo: 'Extensión Lordótica Lumbar',
    zona: 'Columna Lumbar',
    descripcion: 'Coloca las manos en la parte baja de la espalda y arquea el torso suavemente hacia atrás con la mirada al frente.',
    duracionSeg: 20,
  },
];

interface ReproductorPausaActivaProps {
  onCompletada?: () => void;
  onCerrar?: () => void;
  motivo?: string;
}

export const ReproductorPausaActiva: React.FC<ReproductorPausaActivaProps> = ({
  onCompletada,
  onCerrar,
  motivo = 'Pausa sugerida para prevención de sobrecarga muscular',
}) => {
  const [indice, setIndice] = useState(0);
  const [segundos, setSegundos] = useState(EJERCICIOS_DEFAULT[0].duracionSeg);
  const [corriendo, setCorriendo] = useState(true);
  const [completado, setCompletado] = useState(false);

  const ejercicio = EJERCICIOS_DEFAULT[indice];

  useEffect(() => {
    let t: any;
    if (corriendo && segundos > 0) {
      t = setInterval(() => setSegundos((s) => s - 1), 1000);
    } else if (segundos === 0) {
      if (indice < EJERCICIOS_DEFAULT.length - 1) {
        setIndice((i) => i + 1);
        setSegundos(EJERCICIOS_DEFAULT[indice + 1].duracionSeg);
      } else {
        setCorriendo(false);
        setCompletado(true);
        if (onCompletada) onCompletada();
      }
    }
    return () => clearInterval(t);
  }, [corriendo, segundos, indice, onCompletada]);

  const reiniciar = () => {
    setIndice(0);
    setSegundos(EJERCICIOS_DEFAULT[0].duracionSeg);
    setCorriendo(true);
    setCompletado(false);
  };

  const progreso = Math.round(
    (((indice * 20) + (ejercicio.duracionSeg - segundos)) / (EJERCICIOS_DEFAULT.length * 20)) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 space-y-5 max-w-lg mx-auto">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-semibold block mb-0.5">
            Protocolo ErgoBreak Activo
          </span>
          <h3 className="text-base font-bold text-slate-900">{ejercicio.titulo}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{motivo}</p>
        </div>
        {onCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span>Paso {indice + 1} de {EJERCICIOS_DEFAULT.length}</span>
          <span>{progreso}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Zona: {ejercicio.zona}</span>
          <span className="text-3xl font-mono font-black text-emerald-700">{segundos}s</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{ejercicio.descripcion}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {completado ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Protocolo finalizado</span>
            </div>
          ) : (
            <Boton
              variante="secundario"
              className="py-1.5 px-3 text-xs"
              onClick={() => setCorriendo(!corriendo)}
            >
              {corriendo ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              <span>{corriendo ? 'Pausar' : 'Reanudar'}</span>
            </Boton>
          )}
          <button
            type="button"
            onClick={reiniciar}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Reiniciar pausa"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {completado && onCerrar && (
          <Boton variante="primario" className="py-1.5 px-3 text-xs" onClick={onCerrar}>
            <span>Volver al Monitoreo</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Boton>
        )}
      </div>
    </div>
  );
};
