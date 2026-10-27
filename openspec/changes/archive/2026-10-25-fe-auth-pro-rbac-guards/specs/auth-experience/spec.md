# Spec Delta

## Purpose

Define y estandariza la experiencia de autenticación visual profesional basada en el patrón split-card, integrando gráficos SVG contextuales de telemetría y ergonomía, controles de visibilidad de contraseña y navegación optimizada para ErgoCheck AI.

## ADDED Requirements

### Requirement: Professional Split-Card Authentication Interface
The authentication views SHALL render a responsive two-column card featuring an illustrative branding panel on the left and a streamlined credential form on the right, providing fluid responsive stacking on mobile viewports.

#### Scenario: Split-card rendering on desktop
- **WHEN** an unauthenticated visitor views the login or registration route on a desktop display
- **THEN** the interface displays the left panel with ergonomic telemetry SVG illustration and certification badge, alongside the right form panel.

#### Scenario: Responsive adaptation on mobile
- **WHEN** a visitor views the login view on a mobile screen below 768px
- **THEN** the layout gracefully stacks or collapses the decorative left panel, presenting the full input form without horizontal scroll.

### Requirement: Advanced Password Controls and Remember Me
The authentication form SHALL include an interactive password visibility toggle (show/hide), a session persistence checkbox ("Recordarme"), and direct error messaging with error tracking credentials.

#### Scenario: Password visibility toggle
- **WHEN** the user clicks the eye icon within the password input
- **THEN** the field input type alternates smoothly between password and plain text.
