# Tasks

## 1. Erradicación de Meta-Contexto y Consentimiento No Intrusivo

- [x] 1.1 Eliminar el botón "Probar CU03" y referencias a códigos de testing en `frontend/src/components/layout/BarraNavegacion.tsx`, verificando un encabezado comercial limpio sin botones de prueba académicos
- [x] 1.2 Desmontar `ModalConsentimientoRequerido` de `frontend/src/components/layout/PlantillaPrivada.tsx`, verificando que la navegación en rutas administrativas opere fluidamente sin popups de bloqueo global

## 2. Consola de Ingresos y Facturación SaaS para Super Administrador

- [x] 2.1 Crear `frontend/src/pages/suscripciones/ConsolaIngresosSuperAdmin.tsx` con desglose de MRR global, empresas clientes con contratos vigentes y bitácora consolidada de facturas sin botones de compra
- [x] 2.2 Actualizar `frontend/src/pages/suscripciones/PaginaSuscripciones.tsx` para renderizar `ConsolaIngresosSuperAdmin` ante `SUPER_ADMINISTRADOR` y reservar el catálogo de contratación para `ADMIN_ORGANIZACION`

## 3. Identidad de Marca Distintiva e Ilustración Vectorial de Alta Gama

- [x] 3.1 Crear `frontend/src/components/ui/LogoErgoCheck.tsx` con isotipo vectorial propio de visión biométrica y sustituir el icono genérico `Sparkles` en `BarraLateral.tsx` y vistas de autenticación
- [x] 3.2 Rediseñar integralmente `frontend/src/auth/components/IlustracionAuth.tsx` reemplazando el dibujo básico de monigote y las cajas flotantes por una estación ergonómica curva con HUD de curvatura cervical y estética médica/tecnológica

## 4. Limpieza Tipográfica Anti-AISLOP y Verificación QA

- [x] 4.1 Limpiar las pastillas y chips repetitivos con bordes verdes en las vistas de acceso y paneles, priorizando tipografía editorial con jerarquía limpia
- [x] 4.2 Verificar que todos los archivos cumplan con el límite estricto de 250 líneas y cero emojis, ejecutando compilación de frontend (`tsc -b && vite build`) y suite QA (`node backend/test/qa-runner.js`) con 100% de aprobación

## Workflow follow-up

- Archivar la propuesta tras la implementación y validación exitosa de todas las tareas.
