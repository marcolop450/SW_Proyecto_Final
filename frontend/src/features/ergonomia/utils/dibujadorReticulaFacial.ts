import { DiagnosticoFacial } from './detectorFacialOclusion';

export function dibujarReticulaFacialDinamica(
  canvas: HTMLCanvasElement,
  diag: DiagnosticoFacial | null,
  centrado: boolean
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.clientWidth || 320;
  canvas.height = canvas.clientHeight || 240;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!diag || !diag.hayPersona || diag.camaraTapada) {
    return;
  }

  const W = canvas.width;
  const H = canvas.height;

  // Si se tapa la cara con la mano: alerta visual directa sobre el área
  if (diag.manoTapaCara && diag.cajaFacial) {
    const box = diag.cajaFacial;
    const bx = box.x * W;
    const by = box.y * H;
    const bw = box.w * W;
    const bh = box.h * H;

    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.fillRect(bx, by, bw, bh);
    return;
  }

  // Si el rostro está visible: esquinas dinámicas de tracking (Clean Tech HUD)
  if (diag.cajaFacial) {
    const box = diag.cajaFacial;
    const bx = box.x * W;
    const by = box.y * H;
    const bw = box.w * W;
    const bh = box.h * H;
    const color = centrado ? '#10B981' : '#F59E0B';
    const cornerSize = Math.min(bw, bh) * 0.22;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Esquina Superior Izquierda
    ctx.beginPath();
    ctx.moveTo(bx, by + cornerSize);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + cornerSize, by);
    ctx.stroke();

    // Esquina Superior Derecha
    ctx.beginPath();
    ctx.moveTo(bx + bw - cornerSize, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + cornerSize);
    ctx.stroke();

    // Esquina Inferior Izquierda
    ctx.beginPath();
    ctx.moveTo(bx, by + bh - cornerSize);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + cornerSize, by + bh);
    ctx.stroke();

    // Esquina Inferior Derecha
    ctx.beginPath();
    ctx.moveTo(bx + bw - cornerSize, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - cornerSize);
    ctx.stroke();

    // Puntos de vista/ojos
    if (diag.ojoIzq && diag.ojoDer) {
      const oI = { x: diag.ojoIzq.x * W, y: diag.ojoIzq.y * H };
      const oD = { x: diag.ojoDer.x * W, y: diag.ojoDer.y * H };

      [oI, oD].forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = centrado ? '#34D399' : '#FBBF24';
        ctx.fill();
      });
    }
  }
}
