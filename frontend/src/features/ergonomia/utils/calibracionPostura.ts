import { BaselineCalibracion } from '../types/ergonomia.types';
import { AngulosArticularesReales } from './calculadorAngulosPose';

export type MuestraCalibracion = AngulosArticularesReales & { luminancia: number };

export function calcularReferencia(muestras: MuestraCalibracion[]): BaselineCalibracion | null {
  const validas = muestras.filter(m => [m.anguloCuello, m.anguloTronco, m.inclinacionHombros, m.luminancia].every(Number.isFinite));
  if (validas.length < 5) return null;
  const promedio = (valor: (m: MuestraCalibracion) => number) =>
    Number((validas.reduce((total, muestra) => total + valor(muestra), 0) / validas.length).toFixed(1));
  return {
    anguloCuelloBase: promedio(m => m.anguloCuello),
    anguloTroncoBase: promedio(m => m.anguloTronco),
    inclinacionHombrosBase: promedio(m => m.inclinacionHombros),
    luminanciaPromedio: promedio(m => m.luminancia),
    calibradoEn: new Date().toISOString(),
  };
}
