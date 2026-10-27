# auth-experience Specification

## Purpose
Define y estandariza la experiencia de autenticación visual profesional basada en el patrón split-card, integrando gráficos SVG contextuales de telemetría y ergonomía, controles de visibilidad de contraseña y navegación optimizada para ErgoCheck AI.

## Requirements

### Requirement: Professional Split-Card Authentication Interface
The authentication views SHALL render a fixed-proportion responsive card in light theme featuring a technical workstation PC illustration panel on the left and a streamlined credential form on the right, maintaining a bounded desktop footprint and clean mobile stacking.

#### Scenario: Split-card rendering on desktop
- **WHEN** an unauthenticated visitor views the login or registration route on a desktop display
- **THEN** the interface displays a fixed-dimension card with a light ambient background, a technical workstation PC illustration on the left panel, and the credential form on the right panel.

#### Scenario: Responsive adaptation on mobile
- **WHEN** a visitor views the login view on a mobile screen below 768px
- **THEN** the layout gracefully stacks or collapses the decorative left panel, presenting the full input form without horizontal scroll.

### Requirement: Advanced Password Controls and Remember Me
The authentication form SHALL include an interactive password visibility toggle (show/hide), a session persistence checkbox ("Recordarme"), and direct error messaging with error tracking credentials.

#### Scenario: Password visibility toggle
- **WHEN** the user clicks the eye icon within the password input
- **THEN** the field input type alternates smoothly between password and plain text.

### Requirement: Workstation Computer Vision Vector Illustration
The platform SHALL render an architectural, high-fidelity vector illustration of a modern ergonomic curved monitor with a technical biometric vision HUD (cervical angle arc, posture alignment vector, depth layers, calibration status) in clean studio lighting, without crude human stick figures, boxy floating pill text, or dark-saturated backdrops.

#### Scenario: Visitor observes illustration panel
- **WHEN** the authentication screen is rendered on desktop viewports
- **THEN** the left panel displays a precision SVG of a desktop monitor with biometric wireframe telemetry, active vision camera sensor, keyboard, and security certification badges.

#### Scenario: High-end vector illustration rendering
- **WHEN** an unauthenticated visitor views the login panel on desktop viewports
- **THEN** the illustration showcases a sleek ergonomic workstation display with precision computer vision lines, cervical curvature vector, and technical calibration HUD without stick figures or boxy badge chips.
