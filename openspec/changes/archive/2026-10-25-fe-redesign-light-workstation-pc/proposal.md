# Proposal

## Why

El usuario ha señalado con precisión que la interfaz de inicio de sesión y registro recayó en un tema oscuro no deseado (`#0B1020`), dimensiones fluidas desproporcionadas en la tarjeta de acceso y una ilustración figurativa básica (figura de palo). Para cumplir con los principios de `<frontend_aesthetics>` y la identidad visual de ErgoCheck AI, se requiere eliminar los fondos oscuros pesados en favor de una paleta clara y luminosa, fijar las proporciones del contenedor split-card (ancho y alto consistentes) y rediseñar la ilustración vectorial para representar un puesto de trabajo informático de alta precisión (monitor con telemetría de visión artificial, cámara de proctoring, teclado ergonómico y flujo de datos) sin trazos humanos esquemáticos.

## What Changes

- **Transición a Paleta Clara Refinada (Light Craft):** Sustitución del fondo oscuro por un lienzo claro con profundidad ambiental (`bg-slate-50`, sutil gradiente mesh esmeralda/menta de baja saturación y dot-grid tenue).
- **Dimensiones Fijas y Proporcionadas del Split-Card:** Establecimiento de dimensiones fijas en escritorio (`max-w-[880px] min-h-[520px]`) con distribución balanceada 50%/50% y colapso fluido en pantallas móviles.
- **Ilustración Vectorial Técnica de Estación de Trabajo PC (`IlustracionAuth.tsx`):** Creación de un vector SVG arquitectónico y profesional que ilustra un monitor moderno con dashboard de telemetría postural (ángulo de cuello, zonas ergonómicas, FPS de inferencia), sensor de cámara cenital con cono de escaneo óptico, teclado compacto y ratón ergonómico, eliminando cualquier figura humana básica.
- **Microinteracciones y Jerarquía Tipográfica:** Refinamiento de botones, inputs, etiquetas y animaciones con transiciones CSS suaves, respetando la regla de cero emojis y código menor a 250 líneas.

## Capabilities

### Modified Capabilities

- `auth-experience`: Establece proporciones fijas para la tarjeta de autenticación, paleta luminosa no saturada e ilustración vectorial de PC de telemetría biométrica.
- `design-system`: Refuerza la directriz de paleta clara empresarial con capas de profundidad sin marcos anidados redundantes.

## Impact

- Frontend: `IlustracionAuth.tsx`, `PaginaInicioSesion.tsx`, `PaginaRegistro.tsx`, `AppRoutes.tsx`.
- Cero impacto en backend o lógica de base de datos.
