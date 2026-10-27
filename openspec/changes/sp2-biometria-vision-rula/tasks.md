# Tasks

## 1. Calibración de Postura y Entorno (CU06)

- [x] 1.1 Implementar `frontend/src/features/ergonomia/VisorCamaraCalibracion.tsx` con evaluación de condiciones lumínicas del entorno (SP2-2, CU06).
- [x] 1.2 Implementar captura del baseline neutro de 3 segundos con silueta visual de alineación y persistencia del vector base articular en memoria (SP2-3, CU06).

## 2. Inferencia Local Edge AI y Destrucción en RAM (CU07, CU09)

- [x] 2.1 Implementar Web Worker para inferencia de visión con MediaPipe PoseLandmarker sobre 33 nodos articulares sin bloquear el hilo principal (SP2-1, CU07).
- [x] 2.2 Implementar liberación inmediata de memoria con `ImageBitmap.close()` tras cada ciclo de inferencia (SP2-8, CU09).
- [x] 2.3 Crear prueba automatizada verificando contractualmente que ningún fotograma de video sea escrito a disco o transmitido por red (0 KB de video en tráfico) (SP2-9, CU09).

## 3. Motor Biomecánico RULA y Detección de Postura Estática (CU07, CU08)

- [x] 3.1 Implementar `frontend/src/features/ergonomia/utils/calculadorAngulos.ts` calculando $\theta_{\text{cuello}}$, $\theta_{\text{tronco}}$ y brazos con producto punto vectorial (SP2-4, CU07).
- [x] 3.2 Implementar `frontend/src/features/ergonomia/utils/motorRula.ts` con tablas RULA e ISO 11226 emitiendo puntaje (1–7) cada segundo con tests de vectores fijos (SP2-5, CU07).
- [x] 3.3 Implementar detector de postura estática $> 60$ s con penalización acumulativa (+1) y reseteo por movimiento compensatorio (SP2-7, CU08).
- [x] 3.4 Construir `frontend/src/features/ergonomia/IndicadorRulaEnVivo.tsx` (< 200 líneas) con tacómetro/gauge digital semafórico y métricas angulares en tiempo real.

## 4. Backend NestJS: Ciclo de Vida de Sesiones con ConsentGuard

- [x] 4.1 Crear DTOs y endpoints `POST /api/ergonomia/sesion/iniciar`, `POST /api/ergonomia/sesion/:id/muestra` y `POST /api/ergonomia/sesion/:id/finalizar` en `ErgonomiaController` asegurados por `@UseGuards(JwtAuthGuard, ConsentGuard)`.
- [x] 4.2 Implementar métodos en `ErgonomiaService` para persistir inicio, recibir muestras por segundo y consolidar promedios en `ErgonomicSession` (SP2-6).

## 5. Alertas Configurables, Pausas Activas y Verificación QA (CU10)

- [x] 5.1 Implementar sistema de alertas visuales y sonoras en la interfaz cuando el puntaje RULA permanezca $\ge 5$ sostenido (SP2-11, CU10).
- [x] 5.2 Implementar `frontend/src/features/ergonomia/ConfiguracionUmbralesAlerta.tsx` permitiendo al administrador configurar límites de tiempo y sensibilidad de alertas (SP2-13, CU10).
- [x] 5.3 Implementar `frontend/src/features/ergonomia/ReproductorPausaActiva.tsx` con temporizador guiado de estiramientos (ErgoBreak) ante fatiga o postura forzada (SP2-12, CU10).
- [x] 5.4 Integrar el flujo completo en `frontend/src/features/ergonomia/PaginaMiErgonomia.tsx` (< 250 líneas) conectando calibración, monitoreo RULA, alertas y pausas activas.
- [x] 5.5 Crear y ejecutar la suite de pruebas automatizadas `backend/test/qa-sprint2-ergonomia.js` validando inicio, rechazo 403 con `ConsentGuard`, ingesta de telemetría y consolidación con 100% de éxito.

## Workflow follow-up

- Aplicar las tareas mediante `/opsx-apply` y verificar la compilación frontend y backend.
- Archivar la propuesta tras la validación integral del Sprint 2.
