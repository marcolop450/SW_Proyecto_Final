# Spec Delta

## MODIFIED Requirements

### Requirement: Professional Split-Card Authentication Interface
The authentication views SHALL render a fixed-proportion responsive card in light theme featuring a technical workstation PC illustration panel on the left and a streamlined credential form on the right, maintaining a bounded desktop footprint and clean mobile stacking.

#### Scenario: Split-card rendering on desktop
- **WHEN** an unauthenticated visitor views the login or registration route on a desktop display
- **THEN** the interface displays a fixed-dimension card with a light ambient background, a technical workstation PC illustration on the left panel, and the credential form on the right panel.

#### Scenario: Responsive adaptation on mobile
- **WHEN** a visitor views the login view on a mobile screen below 768px
- **THEN** the layout gracefully stacks or collapses the decorative left panel, presenting the full input form without horizontal scroll.

## ADDED Requirements

### Requirement: Workstation Computer Vision Vector Illustration
The platform SHALL render an architectural vector illustration of a modern ergonomic PC workstation displaying posture telemetry metrics on-screen and a vision sensor scan arc, without utilizing human stick figures or dark-saturated backdrops.

#### Scenario: Visitor observes illustration panel
- **WHEN** the authentication screen is rendered on desktop viewports
- **THEN** the left panel displays a precision SVG of a desktop monitor with biometric wireframe telemetry, active vision camera sensor, keyboard, and security certification badges.
