# Roadmap: 3D Trophy Gallery & AR Viewer

## Overview

This roadmap delivers a web-based 3D trophy gallery and AR viewer for Thomas Lyte. The ordering is risk-driven: Phase 1 validates the existential risk (photorealistic metal rendering) and establishes irreversible architectural decisions (persistent Canvas, tone mapping, .gitattributes). Phase 2 builds the public gallery and AR experience, validating the complete browse-to-viewer-to-AR flow. Phase 3 layers the client portal with passcode authentication and design option hierarchy. Phase 4 polishes for production and ships to Vercel.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Render Quality & 3D Viewer Foundation** - Photorealistic metal rendering in a persistent R3F Canvas with interactive controls, proven on real phones
- [ ] **Phase 2: Public Gallery & AR** - Browsable trophy gallery with dark luxury theme and cross-platform AR on iPhone and Android
- [ ] **Phase 3: Client Portal** - Passcode-protected project access with design option parent-child UI and iteration browsing
- [ ] **Phase 4: Production & Deploy** - QR code generation, performance optimization, Draco compression, and live deployment to Vercel

## Phase Details

### Phase 1: Render Quality & 3D Viewer Foundation
**Goal**: A single trophy renders with photorealistic polished metal in the browser at 60 FPS on a real phone, inside an architectural skeleton that supports all subsequent phases
**Depends on**: Nothing (first phase)
**Requirements**: RNDR-01, RNDR-02, RNDR-03, RNDR-04, RNDR-05, RNDR-06, RNDR-07, VIEW-01, VIEW-02, VIEW-03, VIEW-04, PIPE-01, PIPE-02, INFRA-01, UI-04, UI-06
**Success Criteria** (what must be TRUE):
  1. A polished gold trophy on a real iPhone renders with warm saturated metal color (not grey or washed out) with visible specular highlights and studio reflections
  2. User can rotate, zoom, and pan the trophy with smooth touch controls on a phone and mouse controls on desktop
  3. Trophy auto-rotates when untouched and stops immediately on user interaction
  4. Navigating away from the viewer and back does not crash the browser or produce WebGL errors (persistent Canvas verified with 10+ navigations on Safari)
  5. A loading spinner appears while the .glb model loads, replaced by the rendered trophy when ready
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- Scaffold project, .gitattributes, types, metal presets, static data, CSS theme
- [x] 01-02-PLAN.md -- Core 3D rendering pipeline: TrophyModel, TrophyScene, TrophyViewer, persistent Canvas, loading states
- [x] 01-03-PLAN.md -- Trophy info panel, TrophyDetail page, phone rendering quality verification

### Phase 2: Public Gallery & AR
**Goal**: Users can browse a public gallery of trophies, view any trophy in photorealistic 3D, and project it life-size onto a real surface via AR on their phone
**Depends on**: Phase 1
**Requirements**: AR-01, AR-02, AR-03, AR-04, SHOW-01, SHOW-02, SHOW-03, SHOW-04, UI-01, UI-02, UI-03, UI-05, QR-03
**Success Criteria** (what must be TRUE):
  1. Public gallery at `/` displays a grid of trophy cards with thumbnails, names, and descriptions -- no login required
  2. Tapping a trophy card navigates to `/trophy/:slug` showing the full 3D viewer with trophy info (name, dimensions, materials)
  3. Tapping "View in AR" on an iPhone launches Apple Quick Look with the trophy at life-size; on Android launches WebXR or Scene Viewer
  4. AR button is hidden on desktop browsers where AR is not available
  5. Every trophy has a unique shareable URL that works when shared via text or email, and back navigation returns to the gallery
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md -- Public gallery page with responsive trophy cards, Google Fonts, dark luxury theme, routing and back navigation
- [x] 02-02-PLAN.md -- Cross-platform AR via model-viewer (iPhone Quick Look + Android WebXR), phone verification checkpoint

### Phase 3: Client Portal
**Goal**: Clients scan a QR code, enter a 4-digit passcode, and browse their project's design options and iterations in 3D with AR
**Depends on**: Phase 2
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06, PORT-07, PORT-08, PORT-09
**Success Criteria** (what must be TRUE):
  1. Client navigates to `/project/:code` and sees a passcode entry screen that accepts a 4-digit numeric code
  2. Correct passcode reveals a project landing page with expandable design option cards (Option A, B, C) that show child iterations (v1, v2, v3) when tapped
  3. Client returns to the same project URL days later and is not asked for the passcode again (localStorage persistence)
  4. After 5 incorrect passcode attempts, a lockout message is displayed and no further attempts are accepted
  5. Tapping an iteration opens the full 3D viewer with AR at `/project/:code/:slug`
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md -- Passcode authentication: SHA-256 utility, sample project data, PasscodeEntry component, ClientPortal page with passcode gate, routing
- [ ] 03-02-PLAN.md -- Design option browsing: expandable DesignOption cards with child iterations, IterationDetail 3D viewer with AR

### Phase 4: Production & Deploy
**Goal**: The complete application is production-optimized, generates QR codes for PDF decks, and is live on Vercel for real client use
**Depends on**: Phase 3
**Requirements**: PIPE-03, INFRA-02, INFRA-03, INFRA-04, QR-01, QR-02
**Success Criteria** (what must be TRUE):
  1. All .glb trophy files are Draco-compressed to under 5 MB each
  2. Initial page load completes in under 3 seconds on a 4G mobile connection and JS bundle is under 500 KB gzipped
  3. Each client project has a generated QR code (PNG and SVG) that, when scanned on a phone, opens the correct project URL
  4. The site is live on Vercel at a production URL and serves all routes, models, and HDRI assets correctly
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Render Quality & 3D Viewer Foundation | 3/3 | Planning complete | - |
| 2. Public Gallery & AR | 0/2 | Planning complete | - |
| 3. Client Portal | 0/2 | Planning complete | - |
| 4. Production & Deploy | 0/0 | Not started | - |
