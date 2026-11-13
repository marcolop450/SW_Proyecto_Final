# Propuesta OpenSpec — Sprint 4: Correlación, Mosaico WSS y Reportería Forense

## Contexto y Motivación
El objetivo del Sprint 4 de ErgoCheck AI es culminar el ciclo de telemetría y vigilancia biomecánica convirtiendo los eventos sensoriales (postura RULA, mirada, ausencia facial, cambios de foco) en decisiones operativas y evidencia legalmente válida para los supervisores y comités SST.

## Casos de Uso Abordados
1. **CU20 — Correlación por Reglas:** Motor de correlación con ventana deslizante de 60 segundos que detecta combinaciones de eventos de sospecha (celular en regazo, fuga prolongada de foco, múltiples rostros, abandono del puesto) asignando severidad (LOW, MEDIUM, HIGH, CRITICAL).
2. **CU21 — Mosaico de Supervisión en Tiempo Real:** Gateway WebSocket `/supervision` con protocolo de semáforo de 5 estados (Verde, Amarillo, Naranja, Rojo, Gris) y watchdog timer a 15 segundos.
3. **CU22 — Auditoría de Incidentes:** Interfaz forense para validar, desestimar o clasificar como falso positivo los incidentes detectados con registro inmutable WORM.
4. **CU23 — Índices Sintéticos:** Cálculo automatizado de Índice de Integridad (100 - deducciones) y Bienestar Ergonómico.
5. **CU24 — Reporte Ergonómico Corporativo:** Exportación en hojas de cálculo Excel multi-pestaña (.xlsx) con distribución de posturas RULA, niveles de riesgo y recomendaciones con ExcelJS.
6. **CU25 — Dictamen Forense Certificado:** Emisión de dictamen individual en PDF con resumen de incidentes y sello criptográfico SHA-256 de no-repudio con PDFKit.
7. **CU26 — Bitácora Inmutable WORM:** Registro inmutable encadenado con hashes SHA-256 en base de datos, verificación matemática de cadena y exportación a CSV.
