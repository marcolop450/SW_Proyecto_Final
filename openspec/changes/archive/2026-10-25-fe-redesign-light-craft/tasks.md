# Tasks

## 1. Tokens de Diseño Light Craft, Tipografía y Atmósfera

- [x] 1.1 Configurar importación de fuentes *Plus Jakarta Sans* y *JetBrains Mono* en `frontend/index.html` con preconnect y font-display swap y verificar su carga en el navegador.
- [x] 1.2 Configurar variables CSS, paleta de colores claros minerales, utilidades de atmósfera (radial mesh, dot grid) y keyframes de animación escalonada en `frontend/src/index.css`.
- [x] 1.3 Verificar que la tipografía y las variables de color compilen sin errores en `frontend` mediante `npm run build`.

## 2. Rediseño de Componentes Atómicos e Iconografía

- [x] 2.1 Rediseñar `Boton.tsx` con variantes de acento (*primario*, *secundario*, *peligro*, *fantasma*), micro-interacciones hover/active y soporte de iconos vectoriales.
- [x] 2.2 Rediseñar `CampoTexto.tsx` con foco técnico suave, estados de validación y alta legibilidad.
- [x] 2.3 Rediseñar `Insignia.tsx` con pastillas sutiles (*badges*) de tono suave para roles y estados.
- [x] 2.4 Rediseñar `Modal.tsx` con backdrop borroso y animación de escala elástica.
- [x] 2.5 Rediseñar `NotificacionError.tsx` con estilo mineral claro, botón de copia de `errorReference` y micro-animación de entrada.

## 3. Arquitectura de Layout y Responsividad Mobile-First

- [x] 3.1 Rediseñar `BarraLateral.tsx` con soporte adaptable: fija en desktop y menú deslizable (drawer) en móvil con botón de cierre accesible.
- [x] 3.2 Rediseñar `BarraNavegacion.tsx` con selector de organización, perfil de usuario, botón de menú móvil y acciones rápidas.
- [x] 3.3 Rediseñar `PlantillaPrivada.tsx` con fondo atmosférico dot grid, contención de desbordamiento horizontal y transiciones fluidas de contenido.

## 4. Rediseño de Vistas y Orquestación Escalonada

- [x] 4.1 Rediseñar `PaginaInicioSesion.tsx` y `PaginaRegistro.tsx` con tarjeta de acceso flotante, atmósfera luminosa y mensajes de error amigables.
- [x] 4.2 Rediseñar `PaginaDashboard.tsx` con revelado escalonado (`staggered delay`), métricas en `JetBrains Mono` y tarjetas sin bordes anidados.
- [x] 4.3 Rediseñar `PaginaOrganizaciones.tsx` y `ModalNuevoDepartamento.tsx` con tabla estilizada y modales desacoplados (<250 líneas).
- [x] 4.4 Rediseñar `PaginaUsuarios.tsx` y `ModalInvitarUsuario.tsx` con tabla responsiva de colaboradores, avatares y filtro visual.
- [x] 4.5 Rediseñar `PaginaSuscripciones.tsx` y `ModalPagarSandbox.tsx` con tarjetas de planes pulidas, cotizador reactivo y comprobante digital.
- [x] 4.6 Rediseñar `ModalConsentimientoRequerido.tsx` con banner de privacidad legal claro y firma digital accesible.

## 5. Auditoría de Calidad QA, Rendimiento y Validación de Reglas

- [x] 5.1 Auditar que ningún archivo de frontend supere las 250 líneas de código y que no existan emojis en la interfaz.
- [x] 5.2 Verificar la responsividad móvil en breakpoints (`sm:`, `md:`, `lg:`) con cero desbordamiento horizontal.
- [x] 5.3 Ejecutar build de producción en `frontend` verificando code-splitting y tamaño óptimo de chunks.
