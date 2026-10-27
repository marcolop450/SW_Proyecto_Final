# Tasks

## 1. Auto-cierre de Notificaciones Toast y Correcciones de Alineación

- [x] 1.1 Implementar temporizador de auto-cierre en `frontend/src/context/ContextoNotificacion.tsx` (4s para éxito, 6s para errores) con limpieza en desmontaje
- [x] 1.2 Agregar `whitespace-nowrap shrink-0` en `frontend/src/components/ui/Insignia.tsx` y reemplazar separador de migas de pan en `frontend/src/components/layout/BarraNavegacion.tsx` por icono SVG `ChevronRight`

## 2. Diferenciación Estricta entre Super Admin y Admin de Organización

- [x] 2.1 Actualizar `frontend/src/components/layout/BarraLateral.tsx` mostrando navegación de "Directorio Global" y "Auditoría de Plataforma" para `SUPER_ADMINISTRADOR`, y "Mi Organización" para `ADMIN_ORGANIZACION`
- [x] 2.2 Adaptar `frontend/src/pages/organizaciones/PaginaOrganizaciones.tsx` para listar todas las empresas registradas cuando el rol sea `SUPER_ADMINISTRADOR`, manteniendo la vista de tenant único para `ADMIN_ORGANIZACION`

## 3. Telemetría Ergonómica Real desde Base de Datos

- [x] 3.1 Implementar controlador y servicio `GET /api/ergonomia/resumen` en el backend conectado a `ErgonomicSession` en Supabase, y sembrar sesiones biométricas reales para `juan.matienzo@visitask.com`
- [x] 3.2 Actualizar `frontend/src/features/ergonomia/PaginaMiErgonomia.tsx` para consultar y renderizar métricas calculadas en vivo desde la base de datos eliminando valores fijos simulados

## 4. Verificación de Calidad QA y Límite de 250 Líneas

- [x] 4.1 Verificar que todos los archivos creados o editados cumplan con el límite de 250 líneas y cero emojis
- [x] 4.2 Ejecutar compilación de frontend (`tsc -b && vite build`) y suite automatizada (`node backend/test/qa-runner.js`) con 100% de pruebas aprobadas

## Workflow follow-up

- Archivar la propuesta tras aprobación y validación exitosa de todas las tareas.
