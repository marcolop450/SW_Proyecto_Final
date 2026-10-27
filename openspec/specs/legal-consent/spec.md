# legal-consent Specification

## Purpose
Garantiza el cumplimiento normativo y ético registrando la autorización explícita e informada del usuario antes de habilitar captura de cámara o telemetría.

## Requirements

### Requirement: Registro Digital de Consentimiento Informado
El sistema SHALL registrar la aceptación explícita del consentimiento informado capturando tipo de consentimiento, versión de términos, dirección IP del cliente, User-Agent y marca temporal inmutable.

#### Scenario: Aceptación exitosa de términos y biometría
- **WHEN** el usuario autenticado acepta los términos de uso de cámara y telemetría
- **THEN** el sistema persiste el registro en la base de datos y retorna el estado de consentimiento vigente.

### Requirement: Bloqueo de Sesiones sin Consentimiento Vigente (ConsentGuard)
El sistema SHALL bloquear cualquier intento de iniciar o participar en sesiones de monitoreo ergonómico o supervisión si el usuario no cuenta con un consentimiento vigente activo, garantizando a la vez que las rutas puramente administrativas no sean interrumpidas por modales bloqueantes de pantalla completa.

#### Scenario: Administrative navigation without consent modal interruption
- **WHEN** an administrator without camera consent accesses `/dashboard`, `/organizaciones`, or `/usuarios`
- **THEN** the interface renders the administrative view without displaying an intrusive full-screen blocking modal.

#### Scenario: Intento de inicio de sesión sin consentimiento con credencial de error
- **WHEN** un usuario sin consentimiento aceptado intenta invocar un endpoint protegido por `ConsentGuard`
- **THEN** el sistema rechaza la petición con HTTP 403, `errorCode: "ERR_CONSENT_REQUIRED"`, mensaje comprensible y la credencial `errorReference`.

#### Scenario: Acceso permitido con consentimiento vigente
- **WHEN** un usuario con consentimiento activo invoca el inicio de calibración o sesión
- **THEN** el guard permite la ejecución hacia el controlador correspondiente.
