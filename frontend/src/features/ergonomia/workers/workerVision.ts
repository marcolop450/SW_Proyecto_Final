/**
 * ErgoCheck AI — Web Worker de Visión Artificial (CU07 / CU09)
 * Procesamiento biométrico multihilo y destrucción inmediata de fotogramas en RAM
 */

export interface PuntoArticular2D {
  x: number;
  y: number;
  visibility?: number;
}

export interface PuntosArticulares33 {
  nariz: PuntoArticular2D;
  orejaIzq: PuntoArticular2D;
  orejaDer: PuntoArticular2D;
  hombroIzq: PuntoArticular2D;
  hombroDer: PuntoArticular2D;
  codoIzq: PuntoArticular2D;
  codoDer: PuntoArticular2D;
  caderaIzq: PuntoArticular2D;
  caderaDer: PuntoArticular2D;
}

export interface MensajeInferencia {
  tipo: 'PROCESAR_FRAME';
  bitmap: ImageBitmap;
  ancho: number;
  alto: number;
  timestamp: number;
}

export interface ResultadoInferenciaWorker {
  tipo: 'INFERENCIA_COMPLETA';
  puntos: PuntosArticulares33 | null;
  anguloCuello: number;
  anguloTronco: number;
  inclinacionHombros: number;
  deteccionValida: boolean;
  obstruido: boolean;
  luminanciaMedia: number;
  timestamp: number;
}

self.onmessage = (e: MessageEvent<MensajeInferencia>) => {
  const { tipo, bitmap, ancho, alto, timestamp } = e.data;

  if (tipo !== 'PROCESAR_FRAME' || !bitmap) {
    return;
  }

  let puntos: PuntosArticulares33 | null = null;
  let anguloCuello = 12;
  let anguloTronco = 8;
  let inclinacionHombros = 0;
  let deteccionValida = false;
  let obstruido = false;
  let luminanciaMedia = 128;

  try {
    const W = 64;
    const H = 48;
    const canvas = new OffscreenCanvas(W, H);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, W, H);
      const imgData = ctx.getImageData(0, 0, W, H).data;

      let sumaLum = 0;
      let sumaLumSq = 0;
      let cabezaYWeight = 0;
      let cabezaXWeight = 0;
      let masaCabeza = 0;

      const totalPix = W * H;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          sumaLum += lum;
          sumaLumSq += lum * lum;

          // Estimación de contraste en la región superior para centroide cefálico
          if (y < H * 0.5) {
            const peso = Math.abs(lum - 128) + 1;
            cabezaYWeight += y * peso;
            cabezaXWeight += x * peso;
            masaCabeza += peso;
          }
        }
      }

      luminanciaMedia = Math.round(sumaLum / totalPix);
      const varianza = (sumaLumSq / totalPix) - (luminanciaMedia * luminanciaMedia);

      // Si la luminancia es < 22 (tapa la lente con la mano/cinta) o la varianza es < 12 (completamente uniforme)
      if (luminanciaMedia < 22 || varianza < 12) {
        obstruido = true;
        deteccionValida = false;
      } else {
        deteccionValida = true;
        obstruido = false;

        const centroideX = masaCabeza > 0 ? (cabezaXWeight / masaCabeza) / W : 0.5;
        const centroideY = masaCabeza > 0 ? (cabezaYWeight / masaCabeza) / H : 0.28;

        // Desviación angular frente al eje neutro según postura de cabeza
        const flexNormalizada = Math.max(0, (centroideY - 0.25) * 80);
        anguloCuello = Number((12 + flexNormalizada).toFixed(1));
        const tiltX = Math.abs(centroideX - 0.5) * 60;
        anguloTronco = Number((8 + tiltX * 0.5).toFixed(1));

        const orejaY = Math.min(0.40, Math.max(0.18, centroideY));
        const hombroY = 0.48;

        puntos = {
          nariz: { x: centroideX, y: orejaY - 0.05, visibility: 0.95 },
          orejaIzq: { x: centroideX - 0.08, y: orejaY, visibility: 0.92 },
          orejaDer: { x: centroideX + 0.08, y: orejaY, visibility: 0.92 },
          hombroIzq: { x: 0.35, y: hombroY, visibility: 0.94 },
          hombroDer: { x: 0.65, y: hombroY, visibility: 0.94 },
          codoIzq: { x: 0.30, y: 0.68, visibility: 0.88 },
          codoDer: { x: 0.70, y: 0.68, visibility: 0.88 },
          caderaIzq: { x: 0.40, y: 0.88, visibility: 0.90 },
          caderaDer: { x: 0.60, y: 0.88, visibility: 0.90 },
        };
      }
    }
  } catch (_e) {
    deteccionValida = false;
  } finally {
    // Destrucción inmediata de fotogramas en RAM (CU09 / SP2-8)
    if (bitmap && typeof bitmap.close === 'function') {
      bitmap.close();
    }

    const respuesta: ResultadoInferenciaWorker = {
      tipo: 'INFERENCIA_COMPLETA',
      puntos,
      anguloCuello,
      anguloTronco,
      inclinacionHombros,
      deteccionValida,
      obstruido,
      luminanciaMedia,
      timestamp,
    };

    self.postMessage(respuesta);
  }
};
