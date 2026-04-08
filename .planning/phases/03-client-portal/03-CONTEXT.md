# Phase 3: Client Portal - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning
**Mode:** Auto-generated (user away — autonomous mode)

<domain>
## Phase Boundary

Build the client portal at `/project/:code` with 4-digit passcode authentication, design option browsing with parent-child UI, and iteration viewing in the 3D viewer with AR. Clients access via QR code on a PDF deck.

</domain>

<decisions>
## Implementation Decisions

### Passcode Authentication
- 4-digit numeric passcode per client project
- Passcodes SHA-256 hashed in static data file (src/data/projects.ts)
- Client-side validation only (no backend for MVP)
- localStorage persistence so returning clients skip re-entry
- Rate limiting: max 5 incorrect attempts, then lockout message displayed
- Use Web Crypto API (crypto.subtle.digest) for SHA-256 hashing

### Design Options UI
- Project landing page shows expandable design option cards
- Each option (A, B, C) expands to show child iterations (v1, v2, v3)
- Tapping an iteration opens the 3D viewer with AR at `/project/:code/:slug`
- Cards use the same dark luxury theme as the public gallery
- Accordion/expandable pattern for option → iteration hierarchy

### Routing
- `/project/:code` — passcode gate → project landing
- `/project/:code/:slug` — iteration 3D viewer with AR
- Back navigation: iteration → project landing → (can't go back past passcode)

### Data Model
- Static TypeScript data in src/data/projects.ts
- Uses ClientProject, DesignOption, Iteration types from src/types/index.ts
- Sample project data for testing (e.g., "nations-2026" with 2-3 design options)

### Claude's Discretion
- Passcode input styling (4 individual boxes vs single input)
- Animation for option expansion
- Lockout message wording and duration
- Project header/title layout

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- TrophyViewer, TrophyScene, TrophyModel — full 3D rendering pipeline
- ARButton — model-viewer AR integration from Phase 2
- TrophyInfo — name/dimensions/materials overlay
- Dark theme CSS custom properties
- PublicTrophy type and SHOWCASE_TROPHIES pattern for static data

### Established Patterns
- React Router v7 with nested routes in App.tsx
- State lifted to App.tsx (activeModel, activePreset, useOriginalMaterials)
- Functional components with hooks
- CSS Grid for layouts, CSS custom properties for theme

### Integration Points
- App.tsx needs new routes for /project/:code and /project/:code/:slug
- New PasscodeEntry component for auth gate
- New ClientPortal page for design options
- DesignOption component for expandable cards
- projects.ts for sample client data

</code_context>

<specifics>
## Specific Ideas

- User exports trophies from C4D with original materials — useOriginalMaterials flag works for iterations too
- Iteration viewer reuses the same TrophyViewer/TrophyDetail pattern from public showcase
- Sample project data should have realistic names (e.g., "Nations League Trophy 2026")

</specifics>

<deferred>
## Deferred Ideas

- Server-side passcode validation (post-MVP)
- Lockout timer/cooldown (just show message for MVP)
- Client notification when new iterations are added

</deferred>
