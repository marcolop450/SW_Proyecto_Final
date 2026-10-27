export interface AngulosArticularesReales {
  anguloCuello: number;
  anguloTronco: number;
  anguloBrazos: number;
  inclinacionHombros: number;
}

export function calcularAngulosDesdeLandmarks(
  landmarks: Array<{ x: number; y: number; visibility?: number }>,
): AngulosArticularesReales | null {
  if (!landmarks || landmarks.length < 13) {
    return null;
  }

  const nariz = landmarks[0];
  const orejaIzq = landmarks[7];
  const orejaDer = landmarks[8];
  const hombroIzq = landmarks[11];
  const hombroDer = landmarks[12];
  const caderaIzq = landmarks[23];
  const caderaDer = landmarks[24];
  const codoIzq = landmarks[13];
  const codoDer = landmarks[14];

  if (!nariz || !hombroIzq || !hombroDer) {
    return null;
  }

  // Punto medio cefálico (promedio de orejas o nariz)
  const cabezaX = orejaIzq && orejaDer ? (orejaIzq.x + orejaDer.x) / 2 : nariz.x;
  const cabezaY = orejaIzq && orejaDer ? (orejaIzq.y + orejaDer.y) / 2 : nariz.y;

  // Punto medio de la cintura escapular (hombros)
  const hombroMedioX = (hombroIzq.x + hombroDer.x) / 2;
  const hombroMedioY = (hombroIzq.y + hombroDer.y) / 2;

  // 1. Ángulo de flexión del cuello frente al eje vertical neutro
  const dXCuello = Math.abs(cabezaX - hombroMedioX);
  const dYCuello = Math.max(0.05, Math.abs(hombroMedioY - cabezaY));
  const anguloCuelloRad = Math.atan2(dXCuello, dYCuello);
  let anguloCuello = Number(((anguloCuelloRad * 180) / Math.PI).toFixed(1));

  // Ajuste por compresión vertical cefálica (si baja la cabeza, dY se achica)
  if (dYCuello < 0.15) {
    anguloCuello = Math.min(60, anguloCuello + Math.round((0.15 - dYCuello) * 120));
  }

  // 2. Ángulo de inclinación del tronco
  let anguloTronco = 8.0;
  if (caderaIzq && caderaDer) {
    const caderaMediaX = (caderaIzq.x + caderaDer.x) / 2;
    const caderaMediaY = (caderaIzq.y + caderaDer.y) / 2;
    const dXTronco = Math.abs(hombroMedioX - caderaMediaX);
    const dYTronco = Math.max(0.1, Math.abs(caderaMediaY - hombroMedioY));
    anguloTronco = Number(((Math.atan2(dXTronco, dYTronco) * 180) / Math.PI).toFixed(1));
  } else {
    // Si la cadera está fuera de plano, inferir inclinación lateral por desbalance de hombros
    const tiltHombros = Math.abs(hombroDer.y - hombroIzq.y);
    anguloTronco = Number((8.0 + tiltHombros * 70).toFixed(1));
  }

  // 3. Elevación de brazos
  let anguloBrazos = 15.0;
  if (codoIzq && codoDer) {
    const elevIzq = Math.max(0, hombroIzq.y - codoIzq.y);
    const elevDer = Math.max(0, hombroDer.y - codoDer.y);
    anguloBrazos = Number((15.0 + Math.max(elevIzq, elevDer) * 90).toFixed(1));
  }

  const inclinacionHombros = Number((Math.abs(hombroDer.y - hombroIzq.y) * 100).toFixed(1));

  return {
    anguloCuello: Math.max(5, Math.min(75, anguloCuello)),
    anguloTronco: Math.max(4, Math.min(60, anguloTronco)),
    anguloBrazos: Math.max(10, Math.min(90, anguloBrazos)),
    inclinacionHombros,
  };
}
