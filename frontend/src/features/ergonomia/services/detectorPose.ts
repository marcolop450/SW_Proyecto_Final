import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let detectorInstancia: PoseLandmarker | null = null;
let inicializacion: Promise<PoseLandmarker | null> | null = null;
let generacion = 0;

export function obtenerDetectorPose(): Promise<PoseLandmarker | null> {
  if (detectorInstancia) return Promise.resolve(detectorInstancia);
  if (inicializacion) return inicializacion;
  const actual = generacion;
  const tarea = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks('/wasm');
      let detector: PoseLandmarker;
      try {
        detector = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task', delegate: 'GPU' },
          runningMode: 'VIDEO', numPoses: 1,
          minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5,
        });
      } catch {
        detector = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task', delegate: 'CPU' },
          runningMode: 'VIDEO', numPoses: 1,
          minPoseDetectionConfidence: 0.35, minPosePresenceConfidence: 0.35, minTrackingConfidence: 0.35,
        });
      }
      if (actual !== generacion) { detector.close(); return null; }
      detectorInstancia = detector;
      return detector;
    } catch (error) {
      console.error('No se pudo iniciar el detector de postura', error);
      return null;
    }
  })();
  inicializacion = tarea;
  void tarea.finally(() => { if (inicializacion === tarea) inicializacion = null; });
  return tarea;
}

export function reiniciarDetectorPose(): void {
  generacion++;
  inicializacion = null;
  if (detectorInstancia) {
    try { detectorInstancia.close(); } catch { /* El detector ya estaba cerrado. */ }
    detectorInstancia = null;
  }
}
