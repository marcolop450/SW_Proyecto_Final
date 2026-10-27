# Design

## Context

El frontend de ErgoCheck AI está construido sobre React 19, Vite y Tailwind CSS v4. La implementación de Sprint 1 operaba con una temática oscura (#0B1020). Siguiendo las directrices del proyecto y el brief de estética de frontend, se diseñará una arquitectura visual *Light Craft* que combine calidez mineral, tipografía de alta gama, micro-interacciones orquestadas y profundidad atmosférica, manteniendo todos los contratos de API y reglas de ingeniería (archivos <= 250 líneas, cero emojis, observabilidad con `errorReference`).

## Goals / Non-Goals

**Goals:**
- Definir e implementar el sistema de tokens *Light Craft* en `frontend/src/index.css`.
- Integrar la dupla tipográfica distintiva: **Plus Jakarta Sans** (interfaz, encabezados y navegación) y **JetBrains Mono** (telemetría, contadores, estados fiscales y métricas).
- Crear profundidad ambiental con gradiente radial suave (*ambient mesh*) y textura técnica punteada (*subtle dot grid*) sin recurrir a fondos planos o sobrecargados.
- Orquestar animaciones de entrada escalonadas (`staggered fade-up`) con `animation-delay` en CSS puro para máxima fluidez a 60 FPS sin impacto en el bundle.
- Rediseñar los componentes atómicos (`Boton`, `CampoTexto`, `Insignia`, `Modal`, `NotificacionError`) y layouts (`BarraLateral`, `BarraNavegacion`, `PlantillaPrivada`).
- Garantizar responsividad mobile-first con menú drawer colapsable y tablas fluidas con scroll horizontal contenido.

**Non-Goals:**
- No se modifican endpoints ni esquemas de backend.
- No se introducen dependencias pesadas que incrementen el bundle por encima de los límites de rendimiento.
- No se altera la lógica de negocio de autenticación, multi-tenancy ni facturación sandbox.

## Decisions

### Decisión 1: Dupla Tipográfica Distintiva (Plus Jakarta Sans + JetBrains Mono)
- **Elección:** Cargar *Plus Jakarta Sans* (pesos 400, 500, 600, 700) y *JetBrains Mono* (pesos 400, 600) en `frontend/index.html` con `font-display: swap`.
- **Justificación:** Plus Jakarta Sans aporta una personalidad limpia, moderna y tecnológica de grado internacional sin caer en fuentes sobreutilizadas como Inter o Arial. JetBrains Mono garantiza alineación tabular perfecta para lecturas biométricas y cifras de facturación.
- **Alternativas consideradas:** Inter (descartada por genérica / AI slop), Space Grotesk (descartada por excesiva familiaridad en interfaces IA).

### Decisión 2: Paleta de Color "Light Mineral Tech"
- **Elección:**
  - Lienzo base: `#F8FAFC` (Slate 50 cálido) con micro-tinte azul/mineral.
  - Tarjetas y contenedores: `#FFFFFF` (Blanco puro) con borde sutil `#E2E8F0` y sombra difusa suave (`shadow-xs` / `shadow-sm`).
  - Jerarquía de texto: Encabezados `#0F172A` (Slate 900), cuerpo `#334155` (Slate 700), metadatos `#64748B` (Slate 500).
  - Acentos de marca: Esmeralda de precisión (`#059669`) y Azul técnico (`#0284C7`), con toques lima suave (`#65A30D`).
  - Semántica: Éxito (`#059669`), Advertencia (`#D97706`), Riesgo (`#E11D48`).
- **Justificación:** Maximiza la luminosidad y el profesionalismo corporativo sin deslumbrar al usuario con saturaciones excesivas, cumpliendo contraste WCAG AAA.

### Decisión 3: Animaciones Coreografiadas en CSS Puro
- **Elección:** Definir keyframes `@keyframes fadeUp` y utilidades `.animate-fade-up` con variables `--stagger` en `index.css`:
  - Retardo escalonado de 60ms entre elementos consecutivos (`animation-delay: calc(var(--index) * 60ms)`).
- **Justificación:** Cero costo de ejecución en tiempo de JavaScript, rendimiento nativo a 60 FPS acelerado por GPU y carga de interfaz armoniosa.

### Decisión 4: Layout Responsivo con Barra Lateral Adaptable
- **Elección:** La `BarraLateral` se fija en desktop (`lg:w-64`) y se convierte en un panel flotante con backdrop borroso (`backdrop-blur-md`) accesible mediante botón de hamburguesa en pantallas móviles (`< lg`).
- **Justificación:** Previene problemas de compresión en pantallas de menos de 1024px y elimina cualquier desbordamiento horizontal.

## Risks / Trade-offs

- **[Riesgo: Parpadeo de carga de tipografía (FOUT)]** → **Mitigación:** Inclusión de `preconnect` a `fonts.googleapis.com` y `font-display: swap` con fuentes de fallback métricamente compatibles (`system-ui`, `monospace`).
- **[Riesgo: Contraste insuficiente en elementos claros]** → **Mitigación:** Verificación estricta de contrastes de texto `#0F172A` y `#334155` sobre `#FFFFFF` (relación > 12:1) y `#F8FAFC` (> 10:1), superando holgadamente el umbral WCAG AA (4.5:1).
- **[Riesgo: Exceder el límite de 250 líneas por archivo]** → **Mitigación:** Desacoplamiento continuo en componentes pequeños (`HeaderDashboard`, `MetricaCard`, etc.) si las vistas crecen en detalle visual.
