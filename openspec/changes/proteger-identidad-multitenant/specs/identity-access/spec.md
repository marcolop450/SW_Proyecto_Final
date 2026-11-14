## ADDED Requirements

### Requirement: Registro público en una organización nueva
El sistema SHALL crear el usuario, la organización y la membresía inicial en una transacción.

#### Scenario: El nombre de la organización ya está en uso
- **WHEN** el slug normalizado coincide con el de una organización existente
- **THEN** la API devuelve 409 y la transacción no deja cuentas ni membresías parciales

### Requirement: Gestión de membresías dentro de una organización
Las rutas administrativas de usuarios SHALL limitarse a la organización de la sesión y excluir el rol de superadministrador de los roles que pueden asignar o modificar.

#### Scenario: Intento de asignar el rol de plataforma
- **WHEN** una cuenta administradora intenta conceder el rol de superadministrador
- **THEN** la API devuelve 403 y la membresía conserva su rol

#### Scenario: Invitación a un departamento ajeno
- **WHEN** una cuenta administradora envía un departamento de otra organización
- **THEN** la API devuelve 404 y la invitación no se crea

### Requirement: JWT vinculado a una membresía vigente
La API SHALL exigir un secreto JWT configurado y usar el rol actual de la membresía en la organización indicada por el token.

#### Scenario: Membresía retirada u organización desactivada
- **WHEN** el JWT tiene firma válida pero la membresía ya no existe o su organización está inactiva
- **THEN** la API devuelve 401
