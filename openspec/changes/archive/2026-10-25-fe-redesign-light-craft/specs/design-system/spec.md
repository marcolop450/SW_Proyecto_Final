# Spec Delta

## Purpose

Define y estandariza el sistema de diseño visual *Light Craft* para la plataforma ErgoCheck AI, proporcionando una interfaz clara, no saturada, tipográficamente distintiva, con fondos atmosféricos de profundidad sutil y micro-animaciones coreografiadas de alto impacto.

## ADDED Requirements

### Requirement: Light Craft Color System
The frontend SHALL implement an un-oversaturated, high-contrast light theme with warm mineral and alabaster backgrounds (`#F8FAFC`, `#FFFFFF`), deep slate text hierarchy (`#0F172A`, `#475569`), precision technical accents (`#059669`, `#0284C7`), and strict compliance with WCAG 2.1 AA/AAA contrast ratios.

#### Scenario: Light theme application
- **WHEN** any user navigates across the application surfaces
- **THEN** surfaces display clean light backgrounds without harsh glaring saturation, text maintains crisp readability, and border contrast remains subtle and precise.

### Requirement: Distinctive Typography Architecture
The frontend SHALL adopt an expressive, non-generic dual-font architecture consisting of a premium geometric sans-serif for interface headings and body, coupled with a technical monospace font for telemetry, metrics, and numerical data, avoiding overused generic fonts (Inter, Roboto, Arial, Space Grotesk).

#### Scenario: Typography rendering
- **WHEN** pages and biometric metrics are rendered on screen
- **THEN** headers use the distinctive geometric typeface and numerical telemetry renders in the technical monospace font with optimal optical tracking.

### Requirement: Atmosphere and Layered Depth Backgrounds
The frontend SHALL provide visual depth through ambient radial gradients and technical dot/grid matrix textures rather than flat solid backgrounds, while strictly prohibiting nested card containers (flat & layered depth).

#### Scenario: Background depth rendering
- **WHEN** the dashboard or portal views are displayed
- **THEN** subtle ambient lighting and a fine dot grid are visible behind clean content surfaces without introducing visual noise or performance degradation.

### Requirement: Choreographed Staggered Motion and Micro-interactions
The frontend SHALL execute coordinated entry transitions using staggered delays (`animation-delay`) on initial view load, interactive scale/elevation feedback on actionable controls, and fluid modal transitions.

#### Scenario: Staggered page load
- **WHEN** a user navigates to a new view or opens the dashboard
- **THEN** metric cards and content modules reveal in an orchestrated sequence from bottom-to-top with smooth opacity transitions.

### Requirement: Rigorous Responsive Adaptability
The frontend SHALL adapt seamlessly to viewport widths from mobile devices (360px+) to ultra-wide displays (1920px+), enforcing zero horizontal overflow (`overflow-x-hidden`) and responsive drawer/table behaviors.

#### Scenario: Mobile viewport navigation
- **WHEN** a user accesses the portal on a mobile screen width below 768px
- **THEN** the sidebar collapses into an accessible slide-over drawer, metrics wrap into single/dual column grids, and tables preserve fluid horizontal scrolling within their bounded container without breaking viewport width.
