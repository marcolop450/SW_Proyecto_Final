# Reglas de Arquitectura y Estándares de Ingeniería — ErgoCheck AI

Este documento establece las reglas obligatorias de diseño, seguridad, rendimiento, calidad de código y frontend para ErgoCheck AI.

---

## 1. Regla de Modularidad y Límite de Archivos (Anti-Monolito)
- **Límite Estricto:** Ningún archivo de código (`.ts`, `.tsx`, `.css`) debe superar las **250 líneas**.
- **Separación de Responsabilidades:** Toda pantalla o página compleja se debe descomponer en componentes pequeños dentro de una carpeta propia (ej: `features/<modulo>/components/`, `hooks/`, `services/`).
- **Prohibido:** Archivos gigantes de 1,000 líneas que mezclen llamadas a API, estado, modales, tablas y estilos.

---

## 2. Regla de Código Limpio y Anti-AISLOP (Cero Relleno)
- **Cero AISLOP:** Prohibido el código sobre-comentado o con explicaciones triviales redundantes (ej: `// incrementa x en 1`, `// función que maneja el click`).
- **Código Autoexplicativo:** Nombres de variables, funciones y tipos claros y expresivos. Los comentarios se reservan exclusivamente para decisiones de arquitectura no evidentes o fórmulas matemáticas/biométricas complejas.

---

## 3. Reglas de Frontend y Diseño Impeccable
- **Estándar de Calidad Impeccable:** La interfaz debe ser moderna, profesional, accesible y de alta factura visual (Dark Tech B2B SaaS).
- **Prohibido Cuadros dentro de Cuadros (Flat & Layered Depth):** Evitar anidaciones innecesarias de bordes y tarjetas (`Card` dentro de `Card` con bordes idénticos). Usar fondos sutiles (`bg-slate-900/50`, `bg-slate-800/30`), separadores limpios y espaciado consistente.
- **Responsividad Rigurosa:** Cero overflow horizontal (`overflow-x-hidden` en layouts raíz), diseño mobile-first adaptable con breakpoints testeados (`sm:`, `md:`, `lg:`, `xl:`).
- **Iconografía Profesional (Prohibido Emojis):** Uso exclusivo de iconos vectoriales SVG de alta definición (`lucide-react`). Prohibido usar emojis en textos, botones, banners, modales o notificaciones de la UI.
- **Cero Meta-Contexto (Producto Real):** Prohibido mostrar en la UI textos como "CU01", "Caso de Uso 3", "Sprint 1", "UAGRM", "Facultad de Ingeniería", "Proyecto de SW1". El usuario final debe interactuar con una plataforma de ciberseguridad y SST comercial de grado empresarial.
- **Tokens de Color Oficiales:**
  - Fondo profundo: `#0B1020` / `slate-950`
  - Acento de energía y marca: `#C6F432` (Lime Tech)
  - Semántica: Éxito (`emerald-500`), Error/Riesgo Crítico (`rose-500`), Advertencia/Fatiga (`amber-500`).
- **Code-Splitting Obligatorio:** En `AppRoutes.tsx`, todas las páginas deben importarse usando `React.lazy()` y `Suspense` con skeleton loaders.

---

## 4. Manejo Global de Errores y Credencial de Rastreo (Observabilidad)
- **Envelope de Error Estándar:** Todas las respuestas de error de la API (400, 401, 403, 404, 409, 422, 429, 500) deben retornar un formato JSON unificado:
  ```json
  {
    "statusCode": 403,
    "errorCode": "ERR_CONSENT_REQUIRED",
    "message": "Se requiere consentimiento informado vigente antes de acceder al servicio de telemetría.",
    "errorReference": "ERR-8F4A19B2",
    "timestamp": "2026-10-25T14:15:00.000Z"
  }
  ```
- **Credencial de Rastreo (`errorReference`):** Cada excepción capturada genera un código único de incidente (ej: `ERR-A1B2C3D4`) que se imprime en los logs del servidor para auditoría forense y se entrega al usuario para soporte.
- **Mensajes Amigables y Claros:** El frontend debe mostrar un mensaje comprensible acompañado del código de estado y la credencial de referencia, evitando volcar trazas técnicas crudas en pantalla.

---

## 5. Reglas de Seguridad y DevSecOps
- **Autenticación Real con Passport JWT:** Todo token debe ser validado con firma criptográfica y expiración mediante `JwtAuthGuard`. Prohibido decodificar Base64 manualmente.
- **Criptografía de Contraseñas:** Prohibido guardar contraseñas en memoria o texto plano. Siempre usar `bcryptjs` con salt rounds = 12.
- **Aislamiento Multi-Tenant Estricto:** Toda consulta a base de datos DEBE incluir `where: { organizationId: req.user.organizationId }`.
- **Consentimiento Legal Ineludible:** Todo acceso a telemetría o cámara DEBE estar protegido por `ConsentGuard`.

---

## 6. Gestión con OpenSpec y Cross-Sprint Hooks
- Todo incremento se desarrolla bajo una propuesta formal de OpenSpec (`openspec/changes/`).
- Si un CU prepara la estructura para un CU de un Sprint futuro, debe documentarse como **Hook de Reajuste** en `design.md` y `tasks.md`.

---

## 7. Rol de QA Profesional y Validación Exhaustiva E2E
- **Garantía de Calidad Previa:** El agente asume el rol de Ingeniero de Calidad de Software (QA Senior). Antes de entregar una funcionalidad o solicitar al usuario que la verifique, DEBE ejecutar una suite de pruebas exhaustiva (pruebas automatizadas de API, validación de endpoints, simulación de flujos de usuario, verificación de casos de éxito y error con scripts o tests E2E) comprobando que todo opere a la perfección sin requerir reinicios manuales ni dejar cabos sueltos.
- **Rutas Raíz y Salud de Servicios:** Toda API debe exponer un endpoint raíz amigable y saludable (`GET /api` y redirección/salud en `GET /`) con estado operativo, versión y enlace directo a la documentación interactiva (`/api/docs`), previniendo errores 404 al navegar a la URL base.

---

## 8. Lógica de Negocio y Separación Estricta de Roles Administrativos
- **Super Administrador (`SUPER_ADMINISTRADOR`):** Es el operador y propietario global del negocio SaaS.
  - **Prohibido:** Mostrarle botones de compra, cotizadores de contratación o flujos de "Contratar en Sandbox" para sí mismo.
  - **Obligatorio:** En planes y facturación, renderizar exclusivamente la **Consola Financiera de Ingresos Globales SaaS** (MRR consolidado, clientes de pago, desglose por plan e historial consolidado de facturación de toda la plataforma).
- **Admin de Organización (`ADMIN_ORGANIZACION`):** Administrador de una empresa cliente específica (single-tenant).
  - Gestiona los departamentos internos de su empresa, cotiza puestos adicionales y procesa el pago de su suscripción.

---

## 9. Erradicación de Patrones Repetitivos de IA (Cero "AI Slop" Visual & Cajas Innecesarias)
- **Prohibido el Abuso de Cajas de Texto y Pastillas:** Evitar encerrar textos descriptivos en pastillas redondeadas con bordes verdes o grises innecesarios (ej: "Multi-Tenant Aislado", etiquetas de pie de tarjeta con bordes idénticos). Usar tipografía editorial limpia, espaciado y divisores sutiles (`border-t border-slate-100`).
- **Isotipo Oficial Vectorial (Prohibido Sparkles Genérico):** Prohibido usar el icono `Sparkles` de cuatro puntas dentro de un cuadrado redondeado pastel como isotipo corporativo. Utilizar el componente oficial de marca vectorial [`LogoErgoCheck`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/components/ui/LogoErgoCheck.tsx) (Apertura Biométrica y Visión Ergonómica).
- **Ilustraciones Técnicas de Alta Factura:** Prohibido dibujar monigotes básicos con líneas o figuras infantiles en componentes de hardware o visión artificial. Toda ilustración debe representar equipo y telemetría médica/ergonómica con geometría limpia, arcos de alineación postural y estética Clean Tech.

---

## 10. Flujo de Consentimiento Digital Previo (Gating Post-Login)
- **Gating Post-Login Obligatorio:** Todo usuario que inicie sesión y no cuente con consentimiento informado digital vigente en base de datos (o cuyo consentimiento haya sido revocado) debe ser presentado inmediatamente con la pantalla de autorización (`PantallaConsentimientoPrevio`) justo después del login y **antes de ingresar a la interfaz del cliente** (Dashboard, Portal, Mi Ergonomía).
- **Prohibido Renderizar Interfaz Cliente sin Consentimiento:** Si el estado del consentimiento no está activo (`!tieneConsentimiento`), la aplicación no debe montar el layout principal ni exponer los módulos de trabajo hasta que el usuario marque la casilla y firme digitalmente con registro de IP y auditoría.
- **Pruebas y Revocación Dinámica:** En la barra superior (`BarraNavegacion`), el usuario autenticado cuenta con el indicador de estado ("Consentimiento: Vigente") y una acción directa de "Revocar", permitiendo al titular o al equipo de QA revocar la autorización voluntariamente para volver a experimentar y validar el flujo de consentimiento sin manipular la base de datos a mano.
