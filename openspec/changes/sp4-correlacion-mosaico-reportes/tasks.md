# Tareas Técnicas — Sprint 4

- [x] Actualización del modelo Prisma: agregado de modelo `Incident` y encadenamiento `prevHash` / `hash` en `AuditLog`.
- [x] Implementación de `MotorCorrelacionService` con ventanas deslizantes de 60s y cálculo de índices sintéticos (CU20, CU23).
- [x] Implementación de `SupervisionGateway` con semáforo de 5 estados y watchdog timer a 15s (CU21).
- [x] Implementación de `GeneradorReportesService` con generación de Excel (.xlsx) y PDF certificado con sello SHA-256 (CU24, CU25).
- [x] Implementación de `BitacoraInmutableService` con verificación matemática de integridad y exportación CSV (CU26).
- [x] Creación de `SupervisionSp4Controller` con endpoints REST protegidos por JWT y ConsentGuard.
- [x] Registro de servicios y controlador en `SupervisionModule`.
- [x] Creación de componentes frontend de tiempo real: `useWebSocketSupervisor`, `TarjetaSemaforo`, `ConsolaMosaicoSemaforo`, `LineaTiempoIncidentes`.
- [x] Creación de pantallas de usuario: `PaginaConsolaSupervision`, `PaginaReportes`, `PaginaBitacoraAuditoria`.
- [x] Integración de rutas protegidas en `AppRoutes.tsx` y navegación en `BarraLateral.tsx`.
- [x] Creación de suite automatizada de pruebas `qa-sprint4-correlacion-reportes.js`.
- [x] Validación de límites de código (< 250 líneas por archivo) y compilación limpia de frontend y backend.
