# Design: Sprint 2 — Visión Artificial en el Borde, Ergonomía RULA y Alertas

## Context

Véase `proposal.md` y `SPRINT-2.md`. El Sprint 1 consolidó la plataforma, autenticación criptográfica, multi-tenancy estricto por `organizationId`, y el gating post-login con `PantallaConsentimientoPrevio` y `ConsentGuard`. El **Sprint 2 (CU06–CU10)** implementa la visión artificial local (Edge AI), la evaluación de iluminación y calibración de postura neutra (CU06), el motor biomecánico RULA en Web Worker con 33 nodos de MediaPipe (CU07), la detección de postura estática forzada $> 60$ s (CU08), la garantía de destrucción inmediata de fotogramas en RAM con `ImageBitmap.close()` (CU09), y el sistema de alertas multi-canal configurables con pausas activas (CU10). Todo bajo las reglas de `AGENTS.md` (archivos `< 250 líneas`, cero emojis, SVG vectoriales y envelope estándar con `errorReference`).

## Goals / Non-Goals

**Goals:**
- Implementar el pipeline de visión artificial en el cliente (Edge AI) mediante Web Worker procesando fotogramas de la webcam localmente y destruyéndolos de inmediato en RAM (`ImageBitmap.close()`), garantizando cero fuga de video a disco o red (0 KB de video transmitido).
- Desarrollar el asistente de evaluación de iluminación y calibración neutra en 3 segundos con silueta visual de alineación y cálculo del vector base articular (CU06).
- Construir el motor matemático RULA en cliente (CU07) que calcule los ángulos de flexión de cuello ($\theta_{\text{cuello}}$), inclinación de tronco ($\theta_{\text{tronco}}$) y elevación de hombros, mapeando a las tablas de puntuación RULA e ISO 11226 cada segundo.
- Implementar el detector de postura estática (CU08) que aplique penalización acumulativa (+1) ante inmovilidad forzada $> 60$ s y la reinicie al detectar movimiento compensatorio.
- Implementar el ciclo de vida de sesiones de monitoreo en NestJS (`POST /api/ergonomia/sesion/iniciar`, `POST /api/ergonomia/sesion/:id/muestra`, `POST /api/ergonomia/sesion/:id/finalizar`), aseguradas por `ConsentGuard` y `JwtAuthGuard`.
- Proveer el sistema de alertas visuales/sonoras con umbrales configurables y el reproductor interactivo de pausas activas ErgoBreak (CU10).
- Respetar el límite estricto de 250 líneas por archivo y estética limpia Dark/Clean Tech.

**Non-Goals:**
- Algoritmo PnP 3D de detección de celulares en el regazo y anti-cheat para postulantes (reservado para Sprint 3 / CU11–CU19).
- Generación y descarga de informes masivos en formato PDF/Excel con firmas WORM (reservado para Sprint 4 / CU20–CU26).

## Decisions

### 1. Inferencia Edge AI en Web Worker con MediaPipe Pose (33 Nodos)
- **Decisión**: La captura e inferencia se ejecutan 100% en un Web Worker en el navegador del usuario utilizando MediaPipe PoseLandmarker (33 puntos anatómicos). El hilo principal de React permanece desahogado (CPU $\le 20\%$). Tras cada frame procesado, se ejecuta `ImageBitmap.close()`.
- **Alternativa descartada**: Enviar stream de video al backend, lo cual violaría la privacidad exigida por ISO 11226/GDPR y saturaría el ancho de banda.

### 2. Algoritmo Trigonométrico Articular RULA y Penalización Estática (ISO 11226)
- **Decisión**: Los ángulos de flexión de cuello y tronco se calculan mediante producto punto vectorial sobre las coordenadas 2D normalizadas de los puntos de hombros, orejas y caderas:
  $$\vec{u} = (x_A - x_B, y_A - y_B), \quad \vec{v} = (x_C - x_B, y_C - y_B)$$
  $$\theta = \arccos\left(\frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}\right) \times \frac{180}{\pi}$$
  La puntuación RULA se actualiza continuamente cada segundo:
  - 1-2: Óptimo / Aceptable (Verde `#10B981`)
  - 3-4: Bajo Riesgo / Monitorear (Lima `#C6F432`)
  - 5-6: Riesgo Medio / Modificar Puesto (Ámbar `#F59E0B`)
  - 7: Riesgo Muy Alto / Intervención Urgente (Rojo `#EF4444`)
  Si la postura permanece estática sin variación $> \pm 3^\circ$ durante más de 60 segundos, se añade $+1$ al puntaje de carga estática (CU08).
- **Alternativa descartada**: Estimación visual subjetiva sin rigor biomecánico.

### 3. Ciclo de Vida de Sesiones en Backend y ConsentGuard
- **Decisión**: La entidad `ErgonomicSession` gestiona el estado de la sesión (`ACTIVE`, `COMPLETED`). Todos los endpoints de sesión están protegidos por `ConsentGuard`. Si el usuario no tiene consentimiento vigente en PostgreSQL, la API retorna inmediatamente HTTP 403 `ERR_CONSENT_REQUIRED`.
- **Alternativa descartada**: Permitir iniciar sesiones sin validar consentimiento en cada llamada crítica.

### 4. Modularidad Estricta en Frontend (< 250 Líneas)
- **Decisión**: Descomponer el módulo de ergonomía en componentes atómicos:
  - `VisorCamaraCalibracion.tsx`: Manejo de webcam, comprobación de luz, silueta de centrado y cuenta regresiva de 3 s (CU06).
  - `IndicadorRulaEnVivo.tsx`: Tacómetro/Gauge digital con puntuación RULA, semáforo de riesgo y ángulos en vivo (CU07).
  - `ModuloPausaActiva.tsx`: Reproductor de estiramientos con temporizador regresivo (CU10).
  - `ConfiguracionUmbralesAlerta.tsx`: Panel administrativo de límites de tiempo y sensibilidad de alertas (CU10).
  - `PaginaMiErgonomia.tsx`: Layout orquestador limpio conectando historial y sesión en vivo.
- **Alternativa descartada**: Un solo archivo gigante de 1,200 líneas que mezcle canvas, webcam, lógica matemática y UI.

## Cross-Sprint Dependencies & Re-adjustment Hooks

| Caso de Uso Origen (Sprint 2) | Caso de Uso Destino (Futuro) | Punto de Enlace (Hook) en Sprint 2 | Tarea de Reajuste al Implementar el Sprint Futuro |
|---|---|---|---|
| **CU06 / CU07** (Calibración y Sesión RULA) | **CU11 / CU12** (Anti-Cheat y Proctoring - Sprint 3) | Estructura de sesión `ErgonomicSession` con campo opcional `examId`. | En Sprint 3, vincular la sesión ergonómica con los cuestionarios de evaluación técnica y añadir el cálculo de desviación de mirada (pitch/yaw). |
| **CU07** (Telemetría de Muestras) | **CU20 / CU24** (Correlación y Reportes PDF - Sprint 4) | Persistencia de `averageRula`, `totalAlerts` y duraciones en `ergonomic_sessions`. | En Sprint 4, consumir el historial consolidado de `ErgonomicSession` para alimentar el motor de correlación y generar reportes vectoriales en PDFKit con gráficos de evolución temporal. |

## Risks / Trade-offs

- **[Variación en condiciones de luz y ángulo de webcam]** → *Mitigación*: El asistente de calibración valida la iluminación ambiental y la estabilidad de los puntos clave antes de iniciar la cuenta de 3 segundos; si se pierde la detección o la luz es deficiente, alerta al usuario visualmente.
- **[Consumo de CPU en computadoras portátiles de oficina]** → *Mitigación*: La inferencia corre en Web Worker a una tasa regulada de 15–20 FPS y la agregación de métricas al backend se despacha a 1 muestra/segundo, manteniendo el uso de CPU en el hilo principal por debajo del 20%.
