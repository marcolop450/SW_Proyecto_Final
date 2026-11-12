import { OrientacionCabeza } from '../types/supervision.types';

export function calcularOrientacionCabeza(
  landmarks: Array<{ x: number; y: number; z: number }>,
  matrix?: number[],
): OrientacionCabeza {
  let pitch = 0;
  let yaw = 0;
  let roll = 0;

  if (matrix && matrix.length === 16) {
    // Extraer ángulos de Euler de la matriz 4x4 de transformación facial
    // R = [m0, m1, m2, m4, m5, m6, m8, m9, m10]
    const m0 = matrix[0];
    const m1 = matrix[1];
    const m4 = matrix[4];
    const m5 = matrix[5];
    const m8 = matrix[8];
    const m9 = matrix[9];
    const m10 = matrix[10];

    pitch = Math.atan2(-m9, m10) * (180 / Math.PI);
    yaw = Math.atan2(m8, Math.sqrt(m9 * m9 + m10 * m10)) * (180 / Math.PI);
    roll = Math.atan2(m4, m0) * (180 / Math.PI);
  } else if (landmarks && landmarks.length >= 468) {
    // Estimación geométrica canónica PnP simplificada
    const nariz = landmarks[1];
    const menton = landmarks[152];
    const ojoIzq = landmarks[33];
    const ojoDer = landmarks[263];

    const dxOjos = ojoDer.x - ojoIzq.x;
    const dyOjos = ojoDer.y - ojoIzq.y;
    roll = Math.atan2(dyOjos, dxOjos) * (180 / Math.PI);

    const centroOjosX = (ojoIzq.x + ojoDer.x) / 2;
    const centroOjosY = (ojoIzq.y + ojoDer.y) / 2;
    const distNarizCentroX = nariz.x - centroOjosX;
    yaw = (distNarizCentroX / (Math.abs(dxOjos) || 1)) * 90;

    const alturaCara = menton.y - centroOjosY;
    const posicionNarizY = nariz.y - centroOjosY;
    const ratioNariz = posicionNarizY / (alturaCara || 1);
    pitch = (ratioNariz - 0.55) * -120;
  }

  // Vector de mirada relativo (Iris y párpados)
  let gazeX = 0;
  let gazeY = 0.5;

  if (landmarks && landmarks.length > 473) {
    const irisIzq = landmarks[468];
    const parpadoSup = landmarks[159] || landmarks[386];
    const parpadoInf = landmarks[145] || landmarks[374];
    const cantoInterno = landmarks[133];
    const cantoExterno = landmarks[33];

    const anchoOjo = Math.abs(cantoInterno.x - cantoExterno.x) || 0.01;
    const altoOjo = Math.abs(parpadoInf.y - parpadoSup.y) || 0.01;

    gazeX = ((irisIzq.x - cantoExterno.x) / anchoOjo - 0.5) * 2;
    gazeY = (irisIzq.y - parpadoSup.y) / altoOjo;
  }

  // Pitch efectivo combinando cabeza e inclinación de mirada vertical
  const pitchEfectivo = pitch + 0.65 * (gazeY - 0.5) * 60;

  return {
    pitch: Number(pitch.toFixed(1)),
    yaw: Number(yaw.toFixed(1)),
    roll: Number(roll.toFixed(1)),
    pitchEfectivo: Number(pitchEfectivo.toFixed(1)),
    gazeX: Number(gazeX.toFixed(2)),
    gazeY: Number(gazeY.toFixed(2)),
  };
}
