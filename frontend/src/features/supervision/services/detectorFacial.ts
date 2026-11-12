import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

let detectorFacialInstancia: FaceLandmarker | null = null;
let inicializando = false;

export async function obtenerDetectorFacial(): Promise<FaceLandmarker | null> {
  if (detectorFacialInstancia) {
    return detectorFacialInstancia;
  }

  if (inicializando) {
    let intentos = 0;
    while (!detectorFacialInstancia && intentos < 30) {
      await new Promise((r) => setTimeout(r, 100));
      intentos++;
    }
    return detectorFacialInstancia;
  }

  inicializando = true;
  try {
    const vision = await FilesetResolver.forVisionTasks('/wasm');
    detectorFacialInstancia = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 2,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });
    return detectorFacialInstancia;
  } catch (errGpu) {
    console.warn('FaceLandmarker GPU falló, usando CPU:', errGpu);
    try {
      const vision = await FilesetResolver.forVisionTasks('/wasm');
      detectorFacialInstancia = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/face_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numFaces: 2,
        minFaceDetectionConfidence: 0.4,
        minFacePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });
      return detectorFacialInstancia;
    } catch (errCpu) {
      console.error('Error al inicializar FaceLandmarker:', errCpu);
      return null;
    }
  } finally {
    inicializando = false;
  }
}

export function reiniciarDetectorFacial(): void {
  if (detectorFacialInstancia) {
    try {
      detectorFacialInstancia.close();
    } catch (_e) {}
    detectorFacialInstancia = null;
  }
  inicializando = false;
}
