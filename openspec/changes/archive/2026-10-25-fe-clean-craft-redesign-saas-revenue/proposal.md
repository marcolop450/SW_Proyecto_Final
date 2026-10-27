# Proposal

## Why

El usuario ha identificado defectos de diseño y usabilidad en la interfaz actual:
1. **Presencia de meta-contexto en producción:** Se observa el botón "Probar CU03" en el encabezado principal, violando la regla de cero meta-contexto académico o de testing en la UI comercial.
2. **Modal invasivo constante:** La pantalla de advertencia/bloqueo de consentimiento legal se renderiza globalmente bloqueando rutas administrativas que no requieren cámara ni telemetría inmediata.
3. **Incongruencia de negocio en Suscripciones:** En la vista de "Ingresos y Planes SaaS", el `SUPER_ADMINISTRADOR` (propietario global del SaaS) visualiza botones para "Contratar en Sandbox" / "Renovar" su propio plan, lo cual es conceptualmente incorrecto. El Super Admin debe visualizar una consola financiera de MRR y facturación global consolidada.
4. **Estética genérica ("AI Slop") y exceso de texto en cajas:** Uso repetitivo de insignias redondeadas ("Multi-Tenant Aislado", cajas con bordes verdes innecesarios) y el icono genérico de estrella en cuadrado verde (`Sparkles`).
5. **Ilustración del Login mejorable:** La ilustración actual en el login contiene un dibujo básico tipo monigote/palitos en el monitor y cajas de texto flotantes poco estéticas. Se requiere una ilustración técnica vectorial de alta gama con estética Clean Tech / Medical Precision.

## What Changes

- **Eliminación total de meta-contexto y botón de prueba:** Suprimir el botón y menciones a "CU03" o códigos de testing en [`BarraNavegacion.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/layout/BarraNavegacion.tsx) y vistas de usuario.
- **Flujo de consentimiento no intrusivo:** Desacoplar el [`ModalConsentimientoRequerido.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/pages/consentimiento/ModalConsentimientoRequerido.tsx) del layout raíz [`PlantillaPrivada.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/layout/PlantillaPrivada.tsx). La autorización solo se solicita contextual y amigablemente cuando el usuario interactúa con funciones que consumen cámara o telemetría activa.
- **Consola Financiera y de MRR para Super Administrador:** Rediseñar [`PaginaSuscripciones.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/pages/suscripciones/PaginaSuscripciones.tsx) para que, ante `SUPER_ADMINISTRADOR`, muestre el resumen financiero de ingresos del SaaS (MRR global, contratos activos, distribución de ingresos y auditoría consolidada de facturación), eliminando botones de compra o contratación para este rol.
- **Refinamiento Tipográfico y Erradicación de Cajas Repetitivas:** Reemplazar cajas flotantes y pastillas con bordes verdes por tipografía editorial limpia, espaciado consistente y jerarquía visual profesional.
- **Identidad de Marca e Iconografía Distintiva:** Reemplazar el icono genérico de chispa en caja verde por un glifo de marca vectorial único (Apertura Biométrica / Nodo Ergonómico ErgoCheck) y estilo iconográfico técnico coherente.
- **Rediseño Profesional de la Ilustración de Autenticación:** Reemplazar la ilustración en [`IlustracionAuth.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/auth/components/IlustracionAuth.tsx) por una obra vectorial de alta factura que represente una estación ergonómica moderna con HUD de análisis postural (malla sutil, curvatura cervical, vector de alineación) sin monigotes ni cajas de texto toscas.

## Capabilities

### Modified Capabilities
- `design-system`: Erradicar texto en cajas repetitivas, incorporar glifo vectorial de marca distintivo y remover elementos de meta-contexto visual.
- `subscription-billing`: Implementar la vista financiera de ingresos SaaS y auditoría consolidada para `SUPER_ADMINISTRADOR`, diferenciándola del catálogo de contratación para `ADMIN_ORGANIZACION`.
- `legal-consent`: Convertir la solicitud de consentimiento en un flujo no intrusivo y contextual para no bloquear vistas administrativas.
- `auth-experience`: Elevar la ilustración vectorial de la pantalla de acceso a un estándar estético de alta gama en diseño de estaciones ergonómicas y visión artificial.

## Impact

- Modificación de [`PlantillaPrivada.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/layout/PlantillaPrivada.tsx), [`BarraNavegacion.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/layout/BarraNavegacion.tsx), [`PaginaSuscripciones.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/pages/suscripciones/PaginaSuscripciones.tsx) e [`IlustracionAuth.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/auth/components/IlustracionAuth.tsx).
- Creación de componente modular de ingresos SaaS para Super Admin (`ConsolaIngresosSuperAdmin.tsx`) respetando el límite de 250 líneas por archivo.
- Cero regresiones en la suite de pruebas automatizadas QA.
