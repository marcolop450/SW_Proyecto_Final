import React, { useState } from 'react';
import { Sliders, Volume2, VolumeX, Clock, ShieldAlert, Check, X } from 'lucide-react';
import { UmbralesAlertaConfig } from './types/ergonomia.types';
import { Boton } from '../../components/ui/Boton';

interface ConfiguracionUmbralesAlertaProps {
  configActual: UmbralesAlertaConfig;
  onGuardar: (nuevaConfig: UmbralesAlertaConfig) => void;
  onCerrar?: () => void;
}

export const ConfiguracionUmbralesAlerta: React.FC<ConfiguracionUmbralesAlertaProps> = ({
  configActual,
  onGuardar,
  onCerrar,
}) => {
  const [form, setForm] = useState<UmbralesAlertaConfig>(configActual);
  const [guardado, setGuardado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(form);
    setGuardado(true);
    setTimeout(() => {
      setGuardado(false);
      if (onCerrar) onCerrar();
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Configuración de Alertas y Ergonomía</h3>
            <p className="text-xs text-slate-500">Personalice la sensibilidad de notificación y pausas activas</p>
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Tiempo Forzado para Alerta</span>
          </label>
          <select
            value={form.segundosParaAlerta}
            onChange={(e) => setForm({ ...form, segundosParaAlerta: Number(e.target.value) })}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          >
            <option value={30}>30 segundos (Sensibilidad Alta)</option>
            <option value={60}>60 segundos (Recomendado ISO 11226)</option>
            <option value={90}>90 segundos (Sensibilidad Media)</option>
            <option value={120}>120 segundos (Sensibilidad Baja)</option>
          </select>
          <p className="text-[11px] text-slate-500">Segundos sostenidos en RULA crítico antes de alertar.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>Umbral RULA Mínimo</span>
          </label>
          <select
            value={form.umbralRulaMinimo}
            onChange={(e) => setForm({ ...form, umbralRulaMinimo: Number(e.target.value) })}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          >
            <option value={4}>Puntaje &ge; 4 (Nivel 2: Investigar puesto)</option>
            <option value={5}>Puntaje &ge; 5 (Nivel 3: Modificación pronta)</option>
            <option value={6}>Puntaje &ge; 6 (Nivel 3+: Riesgo elevado)</option>
            <option value={7}>Puntaje = 7 (Nivel 4: Acción inmediata)</option>
          </select>
          <p className="text-[11px] text-slate-500">Nivel de puntaje mínimo para considerar riesgo postural.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Recordatorio de Pausa Activa</span>
          </label>
          <select
            value={form.recordatorioPausaMinutos}
            onChange={(e) => setForm({ ...form, recordatorioPausaMinutos: Number(e.target.value) })}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
          >
            <option value={20}>Cada 20 minutos (Regla 20-20-20)</option>
            <option value={30}>Cada 30 minutos</option>
            <option value={45}>Cada 45 minutos (Estándar de oficina)</option>
            <option value={60}>Cada 60 minutos</option>
          </select>
          <p className="text-[11px] text-slate-500">Intervalo preventivo para realizar ErgoBreak.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            {form.alertaSonora ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>Alerta Sonora Sintetizada</span>
          </label>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-600">Tono discreto Web Audio API</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, alertaSonora: !form.alertaSonora })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${form.alertaSonora ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'}`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Emite un bip suave cuando se superen los umbrales configurados.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {onCerrar && (
          <Boton variante="secundario" className="py-1.5 px-3 text-xs" onClick={onCerrar}>
            Cancelar
          </Boton>
        )}
        <Boton variante="primario" className="py-1.5 px-3 text-xs" type="submit">
          {guardado ? <Check className="w-4 h-4 mr-1" /> : null}
          <span>{guardado ? 'Configuración Guardada' : 'Guardar Preferencias'}</span>
        </Boton>
      </div>
    </form>
  );
};
