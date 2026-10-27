# Spec Delta

## ADDED Requirements

### Requirement: Auto-Dismissing Toast Notifications and Text Wrap Shielding
The frontend notification system SHALL automatically dismiss active alerts after a 4-second timeout with exit animation while supporting manual close, and badges SHALL enforce strict non-wrapping boundaries to prevent status indicators from separating from their descriptive text.

#### Scenario: Toast auto-dismissal
- **WHEN** a success or information notification toast is displayed
- **THEN** the system automatically clears the toast after 4000ms without requiring user intervention.

#### Scenario: Badge non-wrapping layout
- **WHEN** a status badge renders within a narrow column or responsive card header
- **THEN** the badge maintains atomic non-wrapping alignment (`whitespace-nowrap`) preventing vertical splitting of status dots and text labels.
