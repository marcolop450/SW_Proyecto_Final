export interface Punto2D {
  x: number;
  y: number;
}

export function calcularAnguloPuntos(
  puntoA: Punto2D,
  verticeB: Punto2D,
  puntoC: Punto2D,
): number {
  const v1x = puntoA.x - verticeB.x;
  const v1y = puntoA.y - verticeB.y;
  const v2x = puntoC.x - verticeB.x;
  const v2y = puntoC.y - verticeB.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.round((Math.acos(cosTheta) * 180) / Math.PI);
}

export function calcularFlexionCuello(oreja: Punto2D, hombro: Punto2D): number {
  const vertical = { x: hombro.x, y: hombro.y - 0.4 };
  return calcularAnguloPuntos(oreja, hombro, vertical);
}

export function calcularInclinacionTronco(hombro: Punto2D, cadera: Punto2D): number {
  const vertical = { x: cadera.x, y: cadera.y - 0.5 };
  return calcularAnguloPuntos(hombro, cadera, vertical);
}

export function calcularElevacionBrazo(hombro: Punto2D, codo: Punto2D): number {
  const verticalInferior = { x: hombro.x, y: hombro.y + 0.5 };
  return calcularAnguloPuntos(codo, hombro, verticalInferior);
}
