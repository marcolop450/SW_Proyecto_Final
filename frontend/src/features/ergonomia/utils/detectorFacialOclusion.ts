export interface DiagnosticoFacial {
  hayPersona: boolean;
  caraVisible: boolean;
  ojosVisibles: boolean;
  manoTapaCara: boolean;
  camaraTapada: boolean;
  mensajeAlerta: string | null;
  cajaFacial: { x: number; y: number; w: number; h: number } | null;
  ojoIzq: { x: number; y: number } | null;
  ojoDer: { x: number; y: number } | null;
}

export function evaluarLuminanciaVideo(video: HTMLVideoElement): number {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 12;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 120;
    ctx.drawImage(video, 0, 0, 16, 12);
    const data = ctx.getImageData(0, 0, 16, 12).data;
    let suma = 0;
    for (let i = 0; i < data.length; i += 4) {
      suma += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return Math.round(suma / (data.length / 4));
  } catch {
    return 120;
  }
}

export function evaluarPresenciaFacial(
  landmarks: Array<{ x: number; y: number; visibility?: number }> | null | undefined,
  luminancia: number
): DiagnosticoFacial {
  // 1. Si la lente está totalmente tapada / negra
  if (luminancia < 25) {
    return {
      hayPersona: false,
      caraVisible: false,
      ojosVisibles: false,
      manoTapaCara: false,
      camaraTapada: true,
      mensajeAlerta: 'Cámara totalmente obstruida o tapada',
      cajaFacial: null,
      ojoIzq: null,
      ojoDer: null,
    };
  }

  // 2. Si no hay landmarks de pose
  if (!landmarks || landmarks.length < 13) {
    return {
      hayPersona: false,
      caraVisible: false,
      ojosVisibles: false,
      manoTapaCara: false,
      camaraTapada: false,
      mensajeAlerta: 'Persona no detectada en encuadre',
      cajaFacial: null,
      ojoIzq: null,
      ojoDer: null,
    };
  }

  const nariz = landmarks[0];
  const ojoIzq = landmarks[2];
  const ojoDer = landmarks[5];
  const orejaIzq = landmarks[7];
  const orejaDer = landmarks[8];

  const visNariz = nariz.visibility ?? 1;
  const visOjoIzq = ojoIzq?.visibility ?? 1;
  const visOjoDer = ojoDer?.visibility ?? 1;

  const caraVisible = visNariz > 0.35 && (visOjoIzq > 0.3 || visOjoDer > 0.3);
  const ojosVisibles = visOjoIzq > 0.35 && visOjoDer > 0.35;

  // Puntos de manos (muñecas 15, 16 y dedos 17 a 22)
  const puntosManos = [
    landmarks[15],
    landmarks[16],
    landmarks[17],
    landmarks[18],
    landmarks[19],
    landmarks[20],
  ].filter(Boolean);

  // Comprobar si la mano se interpone delante del rostro (nariz u ojos)
  let manoTapaCara = false;
  for (const mano of puntosManos) {
    const distNariz = Math.hypot(mano.x - nariz.x, mano.y - nariz.y);
    const distOjoI = ojoIzq ? Math.hypot(mano.x - ojoIzq.x, mano.y - ojoIzq.y) : 1;
    const distOjoD = ojoDer ? Math.hypot(mano.x - ojoDer.x, mano.y - ojoDer.y) : 1;

    if (distNariz < 0.14 || distOjoI < 0.13 || distOjoD < 0.13) {
      manoTapaCara = true;
      break;
    }
  }

  // Si hombros son visibles pero rostro se oculta repentinamente
  const visHombros = ((landmarks[11]?.visibility ?? 1) + (landmarks[12]?.visibility ?? 1)) / 2;
  if (visHombros > 0.6 && (!caraVisible || visNariz < 0.25)) {
    manoTapaCara = true;
  }

  // Caja envolvente facial dinámica
  const ptsFaciales = [nariz, ojoIzq, ojoDer, orejaIzq, orejaDer].filter(Boolean);
  let minX = 1,
    maxX = 0,
    minY = 1,
    maxY = 0;
  for (const pt of ptsFaciales) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const paddingX = 0.04;
  const paddingY = 0.06;
  const cajaFacial = {
    x: Math.max(0, minX - paddingX),
    y: Math.max(0, minY - paddingY),
    w: Math.min(1, maxX - minX + paddingX * 2),
    h: Math.min(1, maxY - minY + paddingY * 2),
  };

  let mensajeAlerta: string | null = null;
  if (manoTapaCara) {
    mensajeAlerta = 'Rostro cubierto con la mano — Destapa tu rostro';
  } else if (!caraVisible) {
    mensajeAlerta = 'Rostro no visible — Mira hacia la cámara';
  }

  return {
    hayPersona: true,
    caraVisible,
    ojosVisibles,
    manoTapaCara,
    camaraTapada: false,
    mensajeAlerta,
    cajaFacial,
    ojoIzq: ojoIzq ? { x: ojoIzq.x, y: ojoIzq.y } : null,
    ojoDer: ojoDer ? { x: ojoDer.x, y: ojoDer.y } : null,
  };
}
