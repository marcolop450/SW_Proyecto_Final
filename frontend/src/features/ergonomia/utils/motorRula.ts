import { EvaluacionRula, NivelRiesgoRula } from '../types/ergonomia.types';

// Tablas de puntuación RULA estándar (ISO 11226)
// Grupo A: Brazo, Antebrazo, Muñeca
// Grupo B: Cuello, Tronco, Piernas
export class MotorRula {
  private tiempoMismaPosturaSeg: number = 0;
  private ultimoCuello: number = 0;
  private ultimoTronco: number = 0;
  private segundosEnRiesgo: number = 0;

  public evaluar(
    anguloCuello: number,
    anguloTronco: number,
    anguloBrazos: number = 20,
    deltaTiempoSeg: number = 1,
  ): EvaluacionRula {
    // 1. Puntuación Cuello (1 - 4)
    let scoreCuello = 1;
    if (anguloCuello > 20) scoreCuello = 3;
    else if (anguloCuello > 10) scoreCuello = 2;
    if (anguloCuello > 35) scoreCuello = 4;

    // 2. Puntuación Tronco (1 - 4)
    let scoreTronco = 1;
    if (anguloTronco > 20) scoreTronco = 3;
    else if (anguloTronco > 10) scoreTronco = 2;
    if (anguloTronco > 45) scoreTronco = 4;

    // 3. Puntuación Brazos (1 - 3)
    let scoreBrazos = 1;
    if (anguloBrazos > 45) scoreBrazos = 3;
    else if (anguloBrazos > 20) scoreBrazos = 2;

    // 4. Detección de Postura Estática y Sobrecarga Muscular (CU08 / SP2-7)
    const varCuello = Math.abs(anguloCuello - this.ultimoCuello);
    const varTronco = Math.abs(anguloTronco - this.ultimoTronco);

    if (varCuello <= 3 && varTronco <= 3) {
      this.tiempoMismaPosturaSeg += deltaTiempoSeg;
    } else if (varCuello > 5 || varTronco > 5) {
      // Reseteo por movimiento compensatorio
      this.tiempoMismaPosturaSeg = 0;
    }

    this.ultimoCuello = anguloCuello;
    this.ultimoTronco = anguloTronco;

    // Penalización estática si se mantiene > 60 segundos
    const cargaEstatica = this.tiempoMismaPosturaSeg >= 60;
    const penalizacion = cargaEstatica ? 1 : 0;

    // 5. Matriz RULA combinada simplificada (Escala 1 a 7)
    const scoreBase = Math.round((scoreCuello * 1.5 + scoreTronco * 1.2 + scoreBrazos) / 2);
    const puntajeFinal = Math.min(7, Math.max(1, scoreBase + penalizacion));

    if (puntajeFinal >= 5) {
      this.segundosEnRiesgo += deltaTiempoSeg;
    } else {
      this.segundosEnRiesgo = Math.max(0, this.segundosEnRiesgo - deltaTiempoSeg * 2);
    }

    let nivelRiesgo: NivelRiesgoRula = 'OPTIMO';
    let etiquetaRiesgo = 'Postura Óptima';

    if (puntajeFinal <= 2) {
      nivelRiesgo = 'OPTIMO';
      etiquetaRiesgo = 'Postura Óptima (Riesgo Despreciable)';
    } else if (puntajeFinal <= 4) {
      nivelRiesgo = 'BAJO';
      etiquetaRiesgo = 'Bajo Riesgo (Aceptable)';
    } else if (puntajeFinal <= 6) {
      nivelRiesgo = 'MEDIO';
      etiquetaRiesgo = 'Riesgo Medio (Requiere Corrección)';
    } else {
      nivelRiesgo = 'CRITICO';
      etiquetaRiesgo = 'Riesgo Alto (Intervención Inmediata)';
    }

    return {
      puntaje: puntajeFinal,
      nivelRiesgo,
      etiquetaRiesgo,
      anguloCuello,
      anguloTronco,
      anguloBrazos,
      cargaEstatica,
      segundosEnRiesgo: this.segundosEnRiesgo,
      tiempoEstaticoSeg: this.tiempoMismaPosturaSeg,
    };
  }

  public resetear(): void {
    this.tiempoMismaPosturaSeg = 0;
    this.segundosEnRiesgo = 0;
    this.ultimoCuello = 0;
    this.ultimoTronco = 0;
  }
}
