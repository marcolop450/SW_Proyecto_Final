export class AuditorPresenciaRostros {
  private tiempoInicioAusencia: number | null = null;
  private tiempoInicioMultiples: number | null = null;
  private alertaAusenciaEmitida = false;
  private alertaMultiplesEmitida = false;

  evaluar(cantidadRostros: number): {
    evento: 'FACE_ABSENT' | 'MULTIPLE_FACES' | null;
    duracionMs: number;
  } {
    const ahora = Date.now();

    // 1. Caso de ausencia de rostro
    if (cantidadRostros === 0) {
      if (this.tiempoInicioAusencia === null) {
        this.tiempoInicioAusencia = ahora;
      }
      this.tiempoInicioMultiples = null;
      this.alertaMultiplesEmitida = false;

      const duracionMs = ahora - this.tiempoInicioAusencia;
      if (duracionMs >= 5000 && !this.alertaAusenciaEmitida) {
        this.alertaAusenciaEmitida = true;
        return { evento: 'FACE_ABSENT', duracionMs };
      }
      return { evento: null, duracionMs };
    }

    // 2. Caso de múltiples rostros detectados
    if (cantidadRostros >= 2) {
      if (this.tiempoInicioMultiples === null) {
        this.tiempoInicioMultiples = ahora;
      }
      this.tiempoInicioAusencia = null;
      this.alertaAusenciaEmitida = false;

      const duracionMs = ahora - this.tiempoInicioMultiples;
      if (duracionMs >= 1000 && !this.alertaMultiplesEmitida) {
        this.alertaMultiplesEmitida = true;
        return { evento: 'MULTIPLE_FACES', duracionMs };
      }
      return { evento: null, duracionMs };
    }

    // 3. Caso normal (1 solo rostro)
    this.tiempoInicioAusencia = null;
    this.tiempoInicioMultiples = null;
    this.alertaAusenciaEmitida = false;
    this.alertaMultiplesEmitida = false;
    return { evento: null, duracionMs: 0 };
  }

  reset(): void {
    this.tiempoInicioAusencia = null;
    this.tiempoInicioMultiples = null;
    this.alertaAusenciaEmitida = false;
    this.alertaMultiplesEmitida = false;
  }
}
