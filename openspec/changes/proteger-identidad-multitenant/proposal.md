## Motivo

El registro público reutiliza organizaciones existentes y una cuenta administradora de organización puede asignar el rol global de superadministrador.

## Cambio

Crear organizaciones de forma atómica durante el registro, proteger los roles de plataforma y validar en cada petición la membresía vinculada al JWT. El formulario de registro mostrará los conflictos con las notificaciones existentes.

## Alcance

Identidad y gestión de miembros. Los flujos de activación de invitaciones y la autorización de supervisión y WebSocket corresponden a incrementos posteriores.
