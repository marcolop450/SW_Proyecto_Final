# Diseño de Arquitectura — Sprint 4

## 1. Módulo Backend: SupervisionSp4
- **Gateway WSS (`SupervisionGateway`):** Namespace `/supervision` que mantiene una tabla en memoria de puestos activos (`PuestoMonitoreo`), recibe eventos `registrar_puesto`, `heartbeat` y `actualizar_estado`, y ejecuta un temporizador watchdog cada 5s para marcar inactivos (>15s) en estado `GRIS`.
- **Motor de Correlación (`MotorCorrelacionService`):** Examina la ventana deslizante de 60 segundos de eventos de conducta en PostgreSQL, evaluando 4 reglas clave (Sospecha de celular en regazo, Fuga crítica de foco, Presencia de múltiples rostros y Abandono de terminal).
- **Bitácora Inmutable (`BitacoraInmutableService`):** Implementa el patrón WORM con encadenamiento criptográfico SHA-256 (`prevHash` -> `hash`) garantizando la detección inmediata de cualquier adulteración manual de registros.
- **Generador de Reportes (`GeneradorReportesService`):** Emite documentos binarios en memoria con ExcelJS (hojas de resumen e incidentes) y PDFKit (diseño corporativo Clean Tech, índice de integridad y bloque de sello SHA-256).

## 2. Componentes Frontend (React 19 + Tailwind CSS)
- `useWebSocketSupervisor`: Hook que gestiona el socket client, escucha `puestos_actualizados` y envía latidos cada 10s.
- `TarjetaSemaforo`: Renderiza el estado del evaluado con los colores oficiales de marca.
- `ConsolaMosaicoSemaforo`: Cuadrícula responsive con métricas de puestos.
- `LineaTiempoIncidentes`: Línea de auditoría con botones de acción (Confirmado, Desestimado, Falso Positivo).
- `PaginaConsolaSupervision`, `PaginaReportes`, `PaginaBitacoraAuditoria`: Páginas enlazadas en la barra lateral con lazy loading y control de acceso basado en roles (RBAC).
