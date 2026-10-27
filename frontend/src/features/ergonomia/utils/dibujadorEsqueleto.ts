export function dibujarEsqueletoArticular(
  canvas: HTMLCanvasElement,
  landmarks: Array<{ x: number; y: number; visibility?: number }> | null,
  cuello: number,
  tronco: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.clientWidth || 320;
  canvas.height = canvas.clientHeight || 240;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!landmarks || landmarks.length === 0) {
    return;
  }

  // Filtrar si puntos clave no alcanzan visibilidad anatómica mínima
  const visNariz = landmarks[0]?.visibility ?? 1;
  const visHombroIzq = landmarks[11]?.visibility ?? 1;
  const visHombroDer = landmarks[12]?.visibility ?? 1;

  if (landmarks.length < 13 || visNariz < 0.4 || (visHombroIzq < 0.4 && visHombroDer < 0.4)) {
    return;
  }

  const esRiesgo = cuello > 20 || tronco > 20;
  const strokeColor = esRiesgo ? '#EF4444' : '#10B981';

  const W = canvas.width;
  const H = canvas.height;

  const p = (lm: { x: number; y: number }) => ({ x: lm.x * W, y: lm.y * H });

  const nariz = p(landmarks[0]);
  const orejaIzq = landmarks[7] ? p(landmarks[7]) : null;
  const orejaDer = landmarks[8] ? p(landmarks[8]) : null;
  const hombroIzq = p(landmarks[11]);
  const hombroDer = p(landmarks[12]);
  const codoIzq = landmarks[13] ? p(landmarks[13]) : null;
  const codoDer = landmarks[14] ? p(landmarks[14]) : null;
  const munecaIzq = landmarks[15] ? p(landmarks[15]) : null;
  const munecaDer = landmarks[16] ? p(landmarks[16]) : null;
  const caderaIzq = landmarks[23] ? p(landmarks[23]) : null;
  const caderaDer = landmarks[24] ? p(landmarks[24]) : null;

  const medioHombros = { x: (hombroIzq.x + hombroDer.x) / 2, y: (hombroIzq.y + hombroDer.y) / 2 };

  ctx.lineWidth = 3;
  ctx.strokeStyle = strokeColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  // Barra de hombros y cuello
  ctx.moveTo(hombroIzq.x, hombroIzq.y);
  ctx.lineTo(hombroDer.x, hombroDer.y);
  ctx.moveTo(nariz.x, nariz.y);
  ctx.lineTo(medioHombros.x, medioHombros.y);

  // Columna / Torso
  if (caderaIzq && caderaDer) {
    const medioCaderas = { x: (caderaIzq.x + caderaDer.x) / 2, y: (caderaIzq.y + caderaDer.y) / 2 };
    ctx.moveTo(medioHombros.x, medioHombros.y);
    ctx.lineTo(medioCaderas.x, medioCaderas.y);
  } else {
    ctx.moveTo(medioHombros.x, medioHombros.y);
    ctx.lineTo(medioHombros.x, Math.min(H, medioHombros.y + 70));
  }

  // Brazos reales
  if (codoIzq) {
    ctx.moveTo(hombroIzq.x, hombroIzq.y);
    ctx.lineTo(codoIzq.x, codoIzq.y);
    if (munecaIzq) ctx.lineTo(munecaIzq.x, munecaIzq.y);
  }
  if (codoDer) {
    ctx.moveTo(hombroDer.x, hombroDer.y);
    ctx.lineTo(codoDer.x, codoDer.y);
    if (munecaDer) ctx.lineTo(munecaDer.x, munecaDer.y);
  }
  ctx.stroke();

  // Nodos articulares
  const articulaciones = [nariz, hombroIzq, hombroDer];
  if (orejaIzq) articulaciones.push(orejaIzq);
  if (orejaDer) articulaciones.push(orejaDer);
  if (codoIzq) articulaciones.push(codoIzq);
  if (codoDer) articulaciones.push(codoDer);

  articulaciones.forEach((pt) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = esRiesgo ? '#FCA5A5' : '#6EE7B7';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  });
}
