export class DetectorSospechaCelular {
  private tiempoInicioInclinacion: number | null = null;
  private historicoOcurrencias: number[] = [];
  private readonly ventanaTiempoMs = 60000; // 60 segundos
  private readonly duracionMinimaMs = 2000; // 2 segundos continuos
  private readonly umbralPitch = -20; // Grados hacia abajo

  /**
   * Evalúa la muestra actual. Retorna true si se cumple la condición de sospecha de celular en regazo.
   */
  evaluar(pitchEfectivo: number, keyCountEnSeg: number): { sospechaDetectada: boolean; duracionMs: number } {
    const ahora = Date.now();

    // Limpiar ocurrencias fuera de la ventana de 60 segundos
    this.historicoOcurrencias = this.historicoOcurrencias.filter(
      (t) => ahora - t <= this.ventanaTiempoMs,
    );

    const condicionInclinada = pitchEfectivo < this.umbralPitch && keyCountEnSeg === 0;

    if (condicionInclinada) {
      if (this.tiempoInicioInclinacion === null) {
        this.tiempoInicioInclinacion = ahora;
      }

      const duracionMs = ahora - this.tiempoInicioInclinacion;

      // Si ha sostenido la mirada abajo por más de 2 segundos
      if (duracionMs >= this.duracionMinimaMs) {
        // Registrar ocurrencia si no ha sido registrada recientemente (debounce de 4s)
        const ultima = this.historicoOcurrencias[this.historicoOcurrencias.length - 1];
        if (!ultima || ahora - ultima > 4000) {
          this.historicoOcurrencias.push(ahora);
        }

        // Si se repite 3 o más veces en la ventana de 60 segundos
        if (this.historicoOcurrencias.length >= 3) {
          return { sospechaDetectada: true, duracionMs };
        }
      }
      return { sospechaDetectada: false, duracionMs };
    } else {
      this.tiempoInicioInclinacion = null;
      return { sospechaDetectada: false, duracionMs: 0 };
    }
  }

  reset(): void {
    this.tiempoInicioInclinacion = null;
    this.historicoOcurrencias = [];
  }
}
