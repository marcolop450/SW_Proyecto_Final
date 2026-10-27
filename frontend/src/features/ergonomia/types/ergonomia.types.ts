export interface BaselineCalibracion {
  anguloCuelloBase: number;
  anguloTroncoBase: number;
  inclinacionHombrosBase: number;
  luminanciaPromedio: number;
  calibradoEn: string;
}

export type NivelRiesgoRula = 'OPTIMO' | 'BAJO' | 'MEDIO' | 'CRITICO';

export interface EvaluacionRula {
  puntaje: number;
  nivelRiesgo: NivelRiesgoRula;
  etiquetaRiesgo: string;
  anguloCuello: number;
  anguloTronco: number;
  anguloBrazos: number;
  cargaEstatica: boolean;
  segundosEnRiesgo: number;
  tiempoEstaticoSeg: number;
}

export interface MuestraTelemetriaDto {
  rulaScore: number;
  neckAngle: number;
  trunkAngle: number;
  staticLoad: boolean;
  riskLevel: NivelRiesgoRula;
  timestamp: string;
}

export interface UmbralesAlertaConfig {
  segundosParaAlerta: number;
  alertaSonora: boolean;
  umbralRulaMinimo: number;
  recordatorioPausaMinutos: number;
}
