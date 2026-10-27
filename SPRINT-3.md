# Sprint 3 — Supervisión de conducta, anti-cheat, cuestionarios y entrevistas

**Semanas:** 8–10 · **Puntos:** 59 (el más cargado) · **Casos de uso:** CU11–CU19 · **Módulos:** 5 (Supervisión ocular), 6 (Telemetría digital), 7 (Evaluación psicotécnica)
**PO / SM:** Integrante 4 / Integrante 5 *(rotación propuesta)*

## Objetivo
Detectar conductas anómalas (mirada, celular, rostros, foco, atajos) y soportar exámenes sobre cuestionarios externos y entrevistas con preguntas de control.

## Casos de uso

| ID | Caso de uso | Prio | Pts | Resumen |
|---|---|---|---|---|
| CU11 | Estimar orientación de cabeza y vector de mirada | Alta | 13 | Pitch/Yaw/Roll por PnP + desplazamiento del iris |
| CU12 | Detectar desvío hacia dispositivos ocultos | Alta | 8 | Pitch < −20° por > 2 s, ≥ 3 veces en 60 s, sin teclado |
| CU13 | Auditar presencia de rostros | Alta | 5 | `FACE_ABSENT` (> 5 s) y `MULTIPLE_FACES` (≥ 2) |
| CU14 | Auditar foco de pantalla y enforzar pantalla completa | Alta | 5 | `WINDOW_BLUR/FOCUS`, tiempo fuera, pantalla completa obligatoria |
| CU15 | Interceptar y bloquear atajos y portapapeles | Media | 5 | Ctrl+C/V, capturas, recargas, F12 |
| CU16 | Medir dedicación efectiva y clasificar aplicaciones | Media | 5 | Activo vs. ocioso (> 3 min); permitidas vs. no autorizadas |
| CU17 | Configurar supervisión y accesos para cuestionarios externos | Alta | 5 | Registra Google Forms u otros en el visor; enlaces/códigos temporales; incluye control de cuotas |
| CU18 | Lanzar preguntas de control tipo entrevista | Media | 5 | Pregunta en pantalla y ventana de captura biométrica focalizada |
| CU19 | Capturar respuesta gestual y sincronizar hitos | Media | 8 | Deltas de blendshapes vs. baseline + latencia, marcados en la línea de tiempo |

**Requisitos funcionales:** RF27–RF41.

## Tareas

### Visión (cliente)
- [x] **SP3-1** Head pose por PnP: Pitch, Yaw, Roll (CU11)
- [x] **SP3-2** Vector de mirada por desplazamiento relativo del iris (CU11)
- [x] **SP3-3** Regla de sospecha de celular (CU12), con tests de umbrales y falsos positivos
- [x] **SP3-4** Auditoría de ausencia (> 5 s) y múltiples rostros (CU13)
- [x] **SP3-13** Ventana de captura biométrica focalizada tras el estímulo (CU18)
- [x] **SP3-14** Extracción de blendshapes y deltas contra baseline (CU19)
- [x] **SP3-15** Latencia de respuesta y marcado de hitos (CU19)

### Telemetría (navegador)
- [x] **SP3-5** `WINDOW_BLUR/FOCUS` y tiempo fuera de pestaña (CU14)
- [x] **SP3-6** Pantalla completa forzada en exámenes (CU14)
- [x] **SP3-7** Bloqueo y auditoría de atajos y portapapeles (CU15)
- [x] **SP3-8** Tiempo efectivo vs. ocioso > 3 min (CU16)
- [x] **SP3-9** Clasificación de pestañas/aplicaciones permitidas y no autorizadas (CU16)

### Backend + UI de evaluación
- [x] **SP3-10** Registro de cuestionarios externos en el visor supervisado (CU17)
- [x] **SP3-11** Enlaces y códigos temporales de acceso con expiración (CU17)
- [x] **SP3-12** Modo entrevista: el evaluador dispara preguntas de control (CU18)
- [x] Persistencia de `behavior_events` y `control_questions` con marca de tiempo
- [x] Control de cuotas por plan (incluido en CU17)

## Dependencias
- Requiere Sprint 2 (Worker, cámara, WebSocket, sesiones, baseline). Ruta crítica: `C1 → D1` (10 días); `D2` (CU17–19, 6 días) depende de `C1` y `B2`.
- Habilita Sprint 4 (los eventos alimentan correlación, mosaico y reportes).

## Riesgos del sprint
**R3 falsos positivos en mirada/celular (ALTA)** → exigir señales combinadas y validación humana · R1 sobrecarga · R7 permisos y navegadores. Si la velocidad real es menor, trasladar CU de prioridad Media (CU15, CU16, CU18, CU19) al siguiente ciclo.

## Definición de terminado (DoD)
- [x] La mirada y orientación se estiman y se registran como eventos con valores numéricos.
- [x] El patrón de celular dispara solo cuando se cumplen los tres criterios (2 s, 3 veces/60 s, sin teclado).
- [x] `FACE_ABSENT` y `MULTIPLE_FACES` se registran con marca de tiempo.
- [x] En modo examen, salir de pantalla completa o de la pestaña queda registrado; copiar/pegar y F12 se cancelan y auditan.
- [x] Un evaluador registra un formulario externo y entrega un código temporal que expira.
- [x] Una pregunta de control produce latencia y delta de blendshapes asociados a un hito.
- [x] Ningún fotograma persistido ni transmitido (test de CU09 sigue en verde).
- [x] Lint, tests, Sprint Review y Retrospectiva completados.
