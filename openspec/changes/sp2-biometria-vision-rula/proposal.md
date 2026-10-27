# Proposal: Sprint 2 — Visión Artificial en el Borde, Ergonomía RULA y Alertas

## Why

Una vez consolidada la base de plataforma, autenticación criptográfica, multi-tenancy y consentimiento legal (Sprint 1 / CU01–CU05), ErgoCheck AI requiere implementar su núcleo biométrico y de salud ocupacional correspondiente al **Sprint 2 (CU06 al CU10)** definido en `SPRINT-2.md`. Este incremento permite evaluar la postura del trabajador en tiempo real directamente en el navegador del cliente mediante visión artificial (Edge AI), garantizando privacidad absoluta (cero almacenamiento o transmisión de fotogramas a disco o red), y notificando proactivamente al usuario ante fatiga y riesgo ergonómico sostenido bajo la norma ISO 11226.

## What Changes

- **CU06 — Calibrar postura y entorno**: Verificación de condiciones de iluminación del entorno y captura guiada de 3 segundos de postura neutra para establecer la línea base (*baseline*) articular del usuario.
- **CU07 — Inferencia y evaluación ergonómica RULA en tiempo real**: Pipeline en cliente mediante Web Worker con MediaPipe PoseLandmarker (33 nodos articulares), cálculo trigonométrico continuo de ángulos (cuello, tronco, brazos) y emisión de puntaje RULA (1–7) cada segundo.
- **CU08 — Detectar postura estática y sobrecarga muscular**: Detección de inmovilidad postural sostenida por más de 60 segundos con penalización acumulativa (+1 al puntaje de carga estática) que se resetea al detectar movimiento compensatorio.
- **CU09 — Destrucción inmediata de fotogramas en RAM**: Liberación obligatoria de memoria mediante `ImageBitmap.close()` inmediatamente tras cada ciclo de inferencia, garantizando contractualmente 0 bytes de video o imágenes transmitidos por red o persistidos en disco.
- **CU10 — Disparar y configurar alertas de riesgo postural y fatiga**: Alertas visuales y sonoras en la interfaz cuando el puntaje RULA permanece en nivel de riesgo ($\ge 5$) sostenido, panel administrativo de configuración de umbrales y reproductor interactivo de pausas activas guiadas (ErgoBreak).
- **Ciclo de vida y telemetría de sesiones en backend**: Endpoints en NestJS protegidos por `ConsentGuard` para inicializar, recibir muestras numéricas por segundo y consolidar promedios en la tabla `ErgonomicSession`.

## Capabilities

### New Capabilities
- `posture-calibration`: Procedimiento de evaluación de iluminación y captura guiada de línea base neutra en 3 segundos (CU06).
- `rula-engine`: Motor biomecánico con MediaPipe Pose (33 nodos), cálculo trigonométrico y calificación continua RULA 1–7 (CU07).
- `static-posture`: Detector de inmovilidad postural sostenida $> 60$ s con cálculo de sobrecarga acumulativa (CU08).
- `zero-retention-privacy`: Garantía de procesamiento efímero en RAM con `ImageBitmap.close()`, asegurando cero fugas de video (CU09).
- `posture-alerts`: Motor de alertas preventivas (visuales/sonoras), panel de umbrales configurables y pausas activas guiadas (CU10).
- `ergonomic-session-lifecycle`: Endpoints y servicios en NestJS para inicializar, muestrear y finalizar sesiones con `ConsentGuard`.

### Modified Capabilities
- `ergonomic-telemetry`: Se expande la capacidad de telemetría para procesar e incorporar el flujo de muestras y alertas en vivo provenientes de la sesión activa en el navegador.

## Impact

- **Frontend**:
  - Web Worker dedicado para inferencia MediaPipe sin bloqueo del hilo principal de React.
  - Componentes atómicos modulares en `frontend/src/features/ergonomia/` (< 250 líneas cada uno): `VisorCamaraCalibracion.tsx`, `IndicadorRulaEnVivo.tsx`, `ReproductorPausaActiva.tsx`, `ConfiguracionUmbralesAlerta.tsx`.
- **Backend**:
  - Servicios de ingesta y endpoints de sesión en `ErgonomiaModule` decorados con `@UseGuards(JwtAuthGuard, ConsentGuard)`.
  - Persistencia de promedios, alertas y duraciones en `ErgonomicSession` (PostgreSQL / Prisma).
