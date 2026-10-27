# Proposal

## Why

El diseño actual del frontend, aunque funcional y ordenado, adolece de la estética genérica "AI slop": paletas oscuras predecibles con acentos saturados, tipografías estándar y transiciones planas que restan distinción a la plataforma. Para posicionar ErgoCheck AI como una suite SaaS de ciberseguridad y SST comercial de nivel corporativo internacional, se requiere una transformación integral hacia una estética *Light Craft*: tonos claros refinados (no sobresaturados), tipografía técnica distintiva, atmósfera con profundidad y gradientes ambientales sutiles, y orquestación de movimiento con revelados escalonados.

## What Changes

- **Transformación de Tema a Light Tech Refinado:** Reemplazo de la estética oscura por una atmósfera luminosa, limpia y elegante basada en fondos minerales cálidos (`#F8FAFC`, `#FFFFFF`), contrastes nítidos de alta legibilidad (`#0F172A`), bordes translúcidos de precisión y acentos vivos no saturados (Esmeralda de precisión `#059669`, Azul técnico `#0284C7`).
- **Arquitectura Tipográfica Distintiva:** Implementación de fuentes tipográficas premium con identidad propia (combinación geométrica moderna de alta gama para jerarquía visual y monoespaciada para métricas biométricas), eliminando tipografías genéricas.
- **Atmósfera y Profundidad con Texturas de Fondo:** Incorporación de fondos con gradientes radiales suaves (mesh ambient) y sutil rejilla geométrica técnica (`radial dot pattern`), eliminando los fondos planos monótonos sin añadir sobrecarga visual.
- **Sistema de Animación y Microinteracciones Orquestadas:** Implementación de revelado escalonado en cascada (`staggered fade-up` con `animation-delay`), transiciones de foco y hover fluidas, y modales con apertura armónica mediante CSS y utilidades de movimiento.
- **Rediseño Completo de Componentes Atómicos y Vistas:** Modernización de `Boton`, `CampoTexto`, `Insignia`, `Modal`, `BarraLateral`, `BarraNavegacion`, `PaginaInicioSesion`, `PaginaDashboard`, `PaginaOrganizaciones`, `PaginaUsuarios` y `PaginaSuscripciones`.
- **Preservación Absoluta de Contratos de Ingeniería:** Mantenimiento estricto del límite de 250 líneas por archivo, cero emojis (Lucide icons vectoriales), manejo unificado de errores con credencial `errorReference`, e integración con la API existente sin alterar los modelos de datos.

## Capabilities

### New Capabilities
- `design-system`: Especificación del sistema de diseño visual *Light Craft*, tokens semánticos de color luminoso, tipografía distintiva, cuadrículas ambientales, coreografía de micro-animaciones escalonadas y adaptabilidad responsiva integral.

### Modified Capabilities
<!-- No se modifican los requerimientos funcionales de backend ni las capacidades de identidad, consentimiento o suscripciones ya implementadas. -->

## Impact

- **Frontend:** Actualización de `frontend/src/index.css` (tokens de diseño, clases de animación y fondos ambientales), `frontend/index.html` (carga de tipografías distintivas), componentes atómicos en `frontend/src/components/ui/` y plantillas de página en `frontend/src/pages/`.
- **Backend:** Cero impacto en API, esquemas de base de datos ni contratos de red existentes.
- **Dependencias:** Posible incorporación de utilidades ligeras de animación en CSS / React.
