# Design

## Context

El usuario requiere erradicar el meta-contexto ("Probar CU03"), eliminar pantallas de aviso bloqueantes en rutas administrativas, corregir la lógica de la página de suscripciones para el `SUPER_ADMINISTRADOR` (quien no debe ver opciones para contratarse planes a sí mismo, sino una consola de ingresos y MRR del SaaS), y elevar la calidad gráfica erradicando el "AI slop" (cajas repetitivas, iconos genéricos y monigotes básicos en el login).

## Goals / Non-Goals

**Goals:**
- Separar de forma tajante la vista de `PaginaSuscripciones.tsx`: para `SUPER_ADMINISTRADOR`, mostrar la `ConsolaIngresosSuperAdmin.tsx` con MRR global, clientes activos, desglose de contratos y auditoría de facturas; para `ADMIN_ORGANIZACION`, mantener el catálogo de compra y cotizador.
- Eliminar el botón "Probar CU03" y cualquier texto de meta-contexto en [`BarraNavegacion.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/layout/BarraNavegacion.tsx).
- Desmontar [`ModalConsentimientoRequerido.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/pages/consentimiento/ModalConsentimientoRequerido.tsx) de [`PlantillaPrivada.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/layout/PlantillaPrivada.tsx) para no interrumpir la navegación administrativa con popups globales.
- Crear un componente de isotipo oficial distintivo [`LogoErgoCheck.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/ui/LogoErgoCheck.tsx) que reemplace el icono genérico de estrella `Sparkles` en pastillas cuadradas.
- Rediseñar por completo la ilustración vectorial de [`IlustracionAuth.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/auth/components/IlustracionAuth.tsx) con un monitor curvo de precisión, arco de curvatura cervical, malla de postura sutil y estética de ingeniería biomédica, sin monigotes ni cajas flotantes.

**Non-Goals:**
- Modificar el esquema de base de datos de PostgreSQL en Supabase.
- Modificar la lógica de firma criptográfica o el funcionamiento interno de `ConsentGuard` en el backend.

## Decisions

- **Decisión 1: Módulo independiente `ConsolaIngresosSuperAdmin.tsx`:** Para cumplir con el límite estricto de 250 líneas por archivo (Regla 1 de `AGENTS.md`), la consola de facturación consolidada del Super Admin se desacopla en un archivo modular en `src/pages/suscripciones/ConsolaIngresosSuperAdmin.tsx`.
- **Decisión 2: Consentimiento por demanda funcional:** En lugar de desplegar un modal que secuestra la interfaz en cualquier ruta privada, el consentimiento se maneja en los puntos de entrada que activan la cámara o telemetría en vivo, manteniendo a los administradores libres de fricción innecesaria.
- **Decisión 3: Isotipo vectorial dedicado (`LogoErgoCheck.tsx`):** Creación de un glifo SVG exclusivo basado en el concepto de "Apertura Biométrica y Visión Ergonómica", con soporte para tamaños y colores corporativos, erradicando la dependencia de `Sparkles`.
- **Decisión 4: Ilustración de alta fidelidad con arte geométrico puro:** En [`IlustracionAuth.tsx`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/auth/components/IlustracionAuth.tsx), la interfaz proyecta un monitor con pedestal ergonómico de aluminio, gradientes sutiles de estudio, HUD con vector de ángulo cervical y retícula de calibración, proyectando profesionalismo B2B.

## Risks / Trade-offs

- **[Riesgo]** Desmontar el modal global de consentimiento podría permitir que un usuario intente encender la cámara sin saber que debe autorizarla.
  - *Mitigación:* Las páginas biométricas (`/mi-ergonomia` y `/portal-evaluacion`) contienen un banner interactivo inline que permite otorgar el consentimiento inmediatamente en un clic, además del resguardo ineludible de `ConsentGuard` en la API (403 `ERR_CONSENT_REQUIRED`).
