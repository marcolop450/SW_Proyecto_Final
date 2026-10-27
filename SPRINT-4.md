# Sprint 4 — Correlación, dashboard en tiempo real y reportería forense

**Semanas:** 11–13 · **Puntos:** 53 · **Casos de uso:** CU20–CU26 · **Módulos:** 8 (Dashboard y correlación) y 9 (Analítica, reportería forense y auditoría)
**PO / SM:** Integrante 5 / Ojeda Claros Jhonny *(rotación propuesta)*

## Objetivo
Convertir la telemetría en decisiones: motor de reglas, mosaico en vivo, auditoría humana de incidentes, índices y reportes finales; cerrar con pruebas integrales, despliegue y documentación.

## Casos de uso

| ID | Caso de uso | Prio | Pts | Resumen |
|---|---|---|---|---|
| CU20 | Correlacionar eventos multidimensionales por reglas | Alta | 13 | Cruza postura, mirada y telemetría en ventanas deslizantes y califica severidad (Nest.js) |
| CU21 | Visualizar consola de monitoreo en tiempo real (mosaico) | Alta | 8 | Semáforo: verde (en foco), amarillo (distraído), naranja (riesgo ergonómico), rojo (anomalía), gris (desconectado) |
| CU22 | Consultar línea de tiempo y auditar incidentes manualmente | Alta | 8 | Validar, desestimar o marcar falso positivo |
| CU23 | Cómputo automatizado de índices sintéticos | Media | 5 | Integridad (100 − penalizaciones) y Bienestar Ergonómico |
| CU24 | Generar reporte ergonómico corporativo (PDF/Excel) | Alta | 8 | Distribución RULA, horas en riesgo, mapa de calor de fatiga, recomendaciones |
| CU25 | Generar reporte forense individual (PDF) | Alta | 8 | Pérdidas de foco, sospecha de celular, mapa de reacción, puntaje de integridad; incluye entrevistas |
| CU26 | Auditar bitácora de eventos y seguridad | Media | 3 | Consulta y exportación de registros inmutables |

**Requisitos funcionales:** RF42–RF51.

## Tareas

### Backend
- [x] **SP4-1** Motor de correlación por reglas sobre ventanas deslizantes (CU20) — `MotorCorrelacionService` con ventanas de 60s
- [x] **SP4-2** Cálculo de severidad con `signals` explicativas (CU20) — matriz de severidad LOW/MEDIUM/HIGH/CRITICAL con explicabilidad forense
- [x] **SP4-4** Sincronización de estados de puestos por WebSocket; gris por heartbeat (CU21) — `SupervisionGateway` (/supervision) con watchdog timer a 15s
- [x] **SP4-6** Endpoint de validación/desestimación/falso positivo con auditoría (CU22) — `PUT /supervision/incidentes/:id/auditar` con log WORM inmutable
- [x] **SP4-7** Cálculo de Índice de Integridad e Índice de Bienestar al cerrar sesión (CU23) — `POST /supervision/sesiones/:id/cerrar` y `POST /ergonomia/sesiones/:id/cerrar`
- [x] **SP4-8** Reporte ergonómico PDF y Excel → S3 (CU24) — `GeneradorArchivosReporteService` con ExcelJS (.xlsx multi-pestaña) y PDFKit
- [x] **SP4-9** Reporte forense individual PDF (CU25) — Dictamen con mapa de desvíos, focos, penalizaciones y sello criptográfico SHA-256
- [x] **SP4-10** Bitácora inmutable y exportación de registros (CU26) — `audit_logs` con hash encadenado SHA-256 y exportación CSV/JSON

### Frontend
- [x] **SP4-3** Consola de mosaico tipo semáforo (CU21) — `ConsolaMosaicoSemaforo.tsx` con los 5 estados (Verde, Amarillo, Naranja, Rojo, Gris), WebSocket en vivo y controles de simulación
- [x] **SP4-5** Línea de tiempo de la sesión con hitos de entrevista (CU22) — `PaginaSupervisionExamen.tsx` con badges de señales correlacionadas (`signals`)
- [x] Acciones de auditoría de incidentes en la UI (CU22) — Modal interactivo de auditoría con justificación técnica
- [x] Pantalla de consulta/exportación de bitácora (CU26) — `PaginaBitacoraAuditoria.tsx` con filtros, verificación de hash SHA-256 y exportación CSV/JSON
- [x] Descarga de reportes desde el panel (CU24–25) — `PaginaReportes.tsx` con descarga directa de archivos binarios (.xlsx y .pdf)

### Cierre
- [x] **SP4-11** Pruebas integrales y corrección de errores (14/14 tests backend, 29/29 tests frontend, builds sin errores)
- [x] **SP4-12** Documentación final y presentación del producto
- [x] Medición de densidad de fallas vs. meta (≤ 25/KLOC)

## Dependencias
- Requiere Sprints 1–3 (eventos, incidentes base, sesiones). Ruta crítica: `D1 → E1 (8 d) → E2 (7 d) → F1 (4 d)`.
- Holgura total del proyecto: 10 días hábiles (55 de 65).

## Riesgos del sprint
R10 documentación no completada a tiempo (ALTA) · R5 saturación WebSocket con muchos puestos · R3 falsos positivos (la auditoría manual los mitiga) · R1 sobrecarga.

## Definición de terminado (DoD)
- [x] Los incidentes se generan con severidad y muestran las señales que los causaron (`signals` explicativas).
- [x] El mosaico refleja los 5 estados (Verde, Amarillo, Naranja, Rojo, Gris) y cambia en tiempo real al variar la sesión vía WebSocket y watchdog timer de 15 segundos.
- [x] El evaluador valida/desestima un incidente y queda registrado en la bitácora inmutable `audit_logs`.
- [x] Al cerrar una sesión se calculan los índices correspondientes a su modo (Índice de Integridad e Índice de Bienestar Ergonómico).
- [x] Se descargan el reporte ergonómico (PDF y Excel) y el forense (PDF) con datos reales y sello criptográfico SHA-256.
- [x] `audit_logs` es consultable, exportable (CSV/JSON) e inmutable con hash encadenado SHA-256.
- [x] Los 26 CU implementados y verificados; suites de pruebas en verde; TypeScript y Vite build exitosos.
- [x] Documentación final entregada.
