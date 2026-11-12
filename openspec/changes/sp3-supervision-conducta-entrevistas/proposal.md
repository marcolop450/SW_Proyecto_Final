# Proposal: Sprint 3 — Supervisión de Conducta, Anti-Cheat, Exámenes y Entrevistas

## Why

Una vez consolidada la base ergonómica y de biometría postural en el cliente (Sprint 2 / CU06–CU10), ErgoCheck AI evoluciona para soportar los dos modos de supervisión avanzada comprometidos en el PAPS y en `SPRINT-3.md`:
1. **Modo Exámenes y Certificaciones (Proctoring & Assessment)**: Detección no invasiva de conductas anómalas (desvío de mirada, sospecha de celular en regazo, ausencia o múltiples personas), control del entorno del navegador (pantalla completa, bloqueo de atajos y pérdida de foco) y supervisión sobre cuestionarios externos (Google Forms).
2. **Modo Entrevista Psicotécnica (Interview Mode)**: Lanzamiento en pantalla de preguntas de control y captura focalizada de microexpresiones faciales (blendshapes) y latencia de reacción para análisis no verbal objetivo.
3. **Modo Teletrabajo**: Medición de dedicación activa frente a tiempo ocioso (> 3 minutos de inactividad).

## What Changes

- **CU11 — Estimar orientación de cabeza y vector de mirada**: Inferencia con MediaPipe FaceLandmarker en el cliente, cálculo de ángulos de Euler (Pitch, Yaw, Roll) y vector de iris.
- **CU12 — Detectar desvío hacia dispositivos ocultos**: Algoritmo vectorial de sospecha de celular en regazo ($Pitch_{\text{efectivo}} < -20^\circ$ por $\ge 2$ s, $\ge 3$ veces en 60 s sin tecleo).
- **CU13 — Auditar presencia de rostros**: Detección de abandono de encuadre (`FACE_ABSENT` $> 5$ s) y presencia no autorizada (`MULTIPLE_FACES` $\ge 2$ personas).
- **CU14 — Auditar foco de pantalla y enforzar pantalla completa**: Listeners de `WINDOW_BLUR`, `WINDOW_FOCUS` con duración transcurrida y bloqueo modal ante salidas de pantalla completa.
- **CU15 — Interceptar y bloquear atajos y portapapeles**: Cancelación estricta de `Ctrl+C`, `Ctrl+V`, `F12`, `PrintScreen` y clic derecho.
- **CU16 — Medir tiempos de dedicación efectiva y clasificar aplicaciones**: Medición de tiempo activo vs. ocioso (> 3 min) en el panel de teletrabajo.
- **CU17 — Configurar supervisión y cuestionarios externos**: Endpoints y UI para registrar formularios de terceros (Google Forms) con enlaces y códigos de acceso temporales con expiración (`EXAM-XXXXXX`).
- **CU18 — Lanzar preguntas de control tipo entrevista**: Disparo en pantalla de preguntas críticas por el evaluador abriendo ventana focalizada de 5 segundos.
- **CU19 — Capturar respuesta gestual y sincronizar hitos**: Medición de deltas de blendshapes de tensión facial y latencia de respuesta.

## Capabilities

### New Capabilities
- `head-pose-gaze`: Estimación de orientación 3D de cabeza y vector de mirada por iris (CU11).
- `hidden-device-detection`: Detección algorítmica de celular en regazo (CU12).
- `face-presence-audit`: Auditoría de ausencia de rostro y presencia múltiple (CU13).
- `browser-anti-cheat`: Enforzamiento de pantalla completa, pérdida de foco y bloqueo de atajos (CU14, CU15).
- `effective-dedication`: Contador de tiempo activo frente a tiempo ocioso en teletrabajo (CU16).
- `external-questionnaires`: Marco supervisado para Google Forms con códigos de acceso temporales (CU17).
- `interview-mode`: Preguntas de control con captura de microgestos y latencia de respuesta (CU18, CU19).

## Impact

- **Frontend**:
  - Descarga y despliegue local de `face_landmarker.task` en `frontend/public/models/`.
  - Componentes modulares en `features/supervision/` (< 250 líneas cada uno): `VisorSupervisionExamen.tsx`, `ModalPreguntaEntrevista.tsx`, `PanelGestionCuestionarios.tsx`, `ConsolaTeletrabajo.tsx`.
  - Integración en `PaginaPortalPostulante.tsx` y enrutamiento en `AppRoutes.tsx`.
- **Backend**:
  - Módulo `SupervisionModule` en NestJS con entidades en Prisma: `Questionnaire`, `SupervisionSession`, `BehaviorEvent`, `ControlQuestion`, `ControlQuestionResponse`.
  - Endpoints protegidos por `ConsentGuard` para inicio, telemetría y modo entrevista.
  - Suite de pruebas automatizadas `qa-sprint3-supervision.js`.
