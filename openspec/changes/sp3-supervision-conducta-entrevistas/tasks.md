# Tasks: Sprint 3 — Supervisión de Conducta, Anti-Cheat, Exámenes y Entrevistas

## Visión (Cliente)
- [x] Descargar y desplegar `face_landmarker.task` en `frontend/public/models/`
- [x] Implementar servicio singleton `detectorFacial.ts` con soporte GPU/CPU
- [x] Implementar `calculadorOrientacionCabeza.ts` con resolución PnP e Iris Gaze
- [x] Implementar `detectorSospechaCelular.ts` con ventana deslizante de 60s
- [x] Implementar `auditorPresenciaRostros.ts` (ausencia $>5$s y múltiples rostros)
- [x] Implementar `useModoEntrevista.ts` con ventana de captura focalizada de 5s y blendshapes

## Telemetría y Navegador (Cliente)
- [x] Implementar `useTelemetriaNavegador.ts` para capturar `WINDOW_BLUR`, `WINDOW_FOCUS` y `FULLSCREEN_EXIT`
- [x] Bloquear atajos (`Ctrl+C`, `Ctrl+V`, `F12`, `PrintScreen`, clic derecho)
- [x] Implementar `useMedidorDedicacion.ts` para medir tiempo activo frente a ocioso ($>3$ min)

## Componentes UI (Frontend)
- [x] Construir `VisorSupervisionExamen.tsx` con iframe para Google Forms y miniatura webcam
- [x] Construir `ModalPreguntaEntrevista.tsx` con barra de progreso de 5 segundos
- [x] Construir `PanelGestionCuestionarios.tsx` para evaluadores y supervisores
- [x] Construir `ConsolaTeletrabajo.tsx` para empleados en jornada remota
- [x] Actualizar `PaginaPortalPostulante.tsx` con ingreso de código y lanzamiento de sesión
- [x] Registrar rutas y enlaces en `AppRoutes.tsx` y `BarraLateral.tsx`

## Backend (NestJS + Prisma)
- [x] Modelar entidades `Questionnaire`, `SupervisionSession`, `BehaviorEvent`, `ControlQuestion`, `ControlQuestionResponse` en `schema.prisma`
- [x] Ejecutar `prisma generate` para cliente tipado
- [x] Crear DTOs para cuestionarios, sesiones, eventos de conducta y preguntas de control
- [x] Implementar `SupervisionService` con validación de códigos temporales y penalizaciones
- [x] Implementar `SupervisionController` protegido por `ConsentGuard`
- [x] Registrar `SupervisionModule` en `AppModule`

## Aseguramiento de Calidad (QA)
- [x] Verificar regla de modularidad anti-monolito (< 250 líneas por archivo)
- [x] Compilación limpia de producción en backend (`npm run build`)
- [x] Compilación limpia de producción en frontend (`npm run build`)
- [x] Crear suite de pruebas automatizadas E2E en `backend/test/qa-sprint3-supervision.js`
