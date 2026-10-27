# Design

## Context

El usuario observó que la pantalla de autenticación utilizó un tema oscuro indeseado (`#0B1020`), dimensiones fluidas desproporcionadas y una ilustración figurativa básica tipo muñeco de palitos. La plataforma requiere una estética clara (*Light Craft*), refinada, profesional y unificada, donde la tarjeta de autenticación mantenga un tamaño fijo y armónico, y la ilustración técnica represente un puesto de trabajo informático (PC con monitor, sensor de visión artificial y telemetría de postura) representativo de ErgoCheck AI.

## Goals / Non-Goals

**Goals:**
- **Contenedor Split-Card con Dimensiones Fijas:** Fijar el tamaño en escritorio a `max-w-[880px] min-h-[520px]` con distribución 50%/50% y altura consistente entre ambas columnas.
- **Paleta Clara y Luminosa (Light Craft):** Fondo general de página en `bg-[#F8FAFC]` con malla ambiental de baja saturación (`bg-ambient-mesh`, `bg-dot-grid` sutil) y tarjeta en blanco puro con sombra multicapa `shadow-xl shadow-slate-200/50`.
- **Ilustración Vectorial Técnica de PC (`IlustracionAuth.tsx`):**
  - Panel izquierdo con gradiente suave (`from-emerald-50/80 via-slate-50 to-teal-50/50`) y borde `border-slate-200/80`.
  - Monitor moderno ultradelgado con base metálica y pantalla encendida mostrando el dashboard biométrico de telemetría postural (arcos de calibración, ángulos articulares de cuello a 12°, indicador de 30 FPS).
  - Sensor de cámara web cenital con cono de detección visual sutilmente proyectado.
  - Teclado compacto y ratón ergonómico en la superficie del escritorio.
  - Cero figuras humanas esquemáticas o muñecos de palitos.
- **Mantener Funcionalidades de Seguridad y QA:**
  - Ojo conmutador de visibilidad de contraseña (`Eye` / `EyeOff`).
  - Casilla "Recordarme" y enlace "¿Olvidaste tu contraseña?".
  - Selector rápido de credenciales QA para los 5 roles (`Super Admin`, `Admin Org`, `Supervisor`, `Empleado`, `Postulante`).
  - Cero botones de Google OAuth.
- **Límite Estricto de 250 Líneas:** Modularización garantizada en componentes concisos y legibles.

**Non-Goals:**
- No se reintroduce tema oscuro ni paletas negras de fondo.
- No se modifican contratos de API ni endpoints del backend NestJS.

## Decisions

### Decisión 1: Dimensiones Fijas en Escritorio con Scroll Interno Seguro
- **Elección:** Envoltura `max-w-[880px] min-h-[520px] max-h-[580px] w-full` en escritorio (`lg:`). En dispositivos móviles (`< lg`), el contenedor colapsa fluidamente a `max-w-md w-full h-auto` ocultando el panel decorativo.
- **Justificación:** Evita el estiramiento vertical u horizontal desmedido que provocaba que la tarjeta flotara sin proporción respecto a la ventana del navegador.

### Decisión 2: Ilustración de Estación de Trabajo Informática (PC con Visión Artificial)
- **Elección:** Representar la tecnología central del proyecto (análisis biomecánico en tiempo real sobre estación de trabajo) mediante un vector SVG limpio del equipo informático, en lugar de intentar dibujar siluetas anatómicas humanas complejas que degeneran en estéticas no profesionales.
- **Justificación:** Transmite una sensación de software de ingeniería y telemetría de grado médico/SST corporativo de alta calidad.

### Decisión 3: Fondo Claro con Profundidad Layered (Sin cuadros dentro de cuadros)
- **Elección:** La columna izquierda utiliza un fondo sutil `bg-slate-50/90` con borde lateral limpio `border-r border-slate-200/70`, eliminando los contrastes duros y las cajas anidadas repetitivas.
- **Justificación:** Cumple con la regla de diseño anti-cuadros y la directriz de interfaz no sobre-saturada.

## Risks / Trade-offs

- **[Riesgo: Pantallas móviles con poca altura vertical]** → **Mitigación:** En pantallas móviles se permite scroll vertical natural sobre el contenedor raíz sin bloquear la altura fija de escritorio.
