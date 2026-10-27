# Spec Delta

## ADDED Requirements

### Requirement: Anti-AISLOP Typography and Card Purity
The frontend SHALL enforce clean, un-boxed typographic hierarchy without nested cards, eliminating excessive pill-chip badges with colored borders (such as "Multi-Tenant Aislado" or boxed footers), and strictly prohibiting meta-context or testing labels ("CU03", "Probar CU03") from production views.

#### Scenario: Absence of redundant badge boxes and testing markers
- **WHEN** any user navigates across top-level views or headers
- **THEN** interfaces display clean typography, subtle horizontal dividers without nested card outlines, and zero meta-contextual testing buttons or academic case labels.

### Requirement: Bespoke Biometric Brand Iconography
The design system SHALL provide a unique, customized SVG brand mark (ErgoTech biometric aperture and telemetry nexus) and technical icon styling, avoiding generic four-point star icons in rounded pastel boxes.

#### Scenario: Brand glyph rendering
- **WHEN** the brand header or sidebar emblem is displayed
- **THEN** the platform renders the distinctive vector aperture mark in place of generic star icons.
