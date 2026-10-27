import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let detectorInstancia: PoseLandmarker | null = null;
let inicializando = false;

export async function obtenerDetectorPose(): Promise<PoseLandmarker | null> {
  if (detectorInstancia) {
    return detectorInstancia;
  }

  if (inicializando) {
    let intentos = 0;
    while (!detectorInstancia && intentos < 30) {
      await new Promise((r) => setTimeout(r, 100));
      intentos++;
    }
    return detectorInstancia;
  }

  inicializando = true;
  try {
    const vision = await FilesetResolver.forVisionTasks('/wasm');
    detectorInstancia = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return detectorInstancia;
  } catch (errGpu) {
    console.warn('MediaPipe GPU falló o no disponible, usando modo CPU:', errGpu);
    try {
      const vision = await FilesetResolver.forVisionTasks('/wasm');
      detectorInstancia = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.35,
        minPosePresenceConfidence: 0.35,
        minTrackingConfidence: 0.35,
      });
      return detectorInstancia;
    } catch (errCpu) {
      console.error('Error al inicializar PoseLandmarker:', errCpu);
      return null;
    }
  } finally {
    inicializando = false;
  }
}

export function reiniciarDetectorPose(): void {
  if (detectorInstancia) {
    try {
      detectorInstancia.close();
    } catch (_e) {}
    detectorInstancia = null;
  }
  inicializando = false;
}
