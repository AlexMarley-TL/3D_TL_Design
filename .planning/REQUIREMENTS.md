# Requirements: 3D Trophy Gallery & AR Viewer

**Defined:** 2026-03-26
**Core Value:** Trophy renders must look convincingly real in-browser -- approaching Cinema 4D / Redshift quality with photorealistic polished metal reflections.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Rendering

- [x] **RNDR-01**: Trophy models render with photorealistic polished metal appearance (gold, silver, chrome, rose gold) using MeshPhysicalMaterial with metalness: 1
- [x] **RNDR-02**: HDRI studio environment lighting produces professional photography-quality reflections on metal surfaces
- [x] **RNDR-03**: ACES Filmic tone mapping applied correctly (single pass, no double tone mapping)
- [x] **RNDR-04**: Bloom post-processing makes specular highlights pop on polished metals
- [x] **RNDR-05**: Contact shadows ground the trophy in 3D space (not floating)
- [x] **RNDR-06**: Renderer capped at 2x pixel ratio for mobile performance
- [x] **RNDR-07**: 60 FPS maintained on modern phones (iPhone 13+, Samsung S21+)

### 3D Viewer

- [x] **VIEW-01**: User can rotate, zoom, and pan the trophy with touch and mouse controls (OrbitControls)
- [x] **VIEW-02**: Trophy auto-rotates on idle; rotation stops on user interaction
- [x] **VIEW-03**: Canvas persists across route changes (no mount/unmount to avoid Safari WebGL context exhaustion)
- [x] **VIEW-04**: Trophy .glb models load via useGLTF with Draco decompression support

### AR Experience

- [x] **AR-01**: User can tap "View in AR" to project trophy life-size onto a real surface
- [x] **AR-02**: AR works on iPhone (Safari) via Apple Quick Look / USDZ through model-viewer
- [x] **AR-03**: AR works on Android (Chrome) via WebXR / Scene Viewer through model-viewer
- [x] **AR-04**: AR button hidden on desktop (no AR capability)

### Public Showcase

- [x] **SHOW-01**: Public gallery at `/` displays a grid of curated trophy cards with thumbnails
- [x] **SHOW-02**: User can click a trophy card to open the full 3D viewer at `/trophy/:slug`
- [x] **SHOW-03**: Public gallery requires no authentication
- [x] **SHOW-04**: Each public trophy has a shareable unique URL

### Client Portal

- [x] **PORT-01**: Client accesses their project at `/project/:code` via QR code scan
- [x] **PORT-02**: Client enters a 4-digit numeric passcode to access project designs
- [x] **PORT-03**: Passcode validated client-side against SHA-256 hash stored in static data
- [x] **PORT-04**: Passcode persists in localStorage so client doesn't re-enter on return visits
- [x] **PORT-05**: Rate limiting: max 5 incorrect passcode attempts, then lockout message displayed
- [x] **PORT-06**: Project landing page shows design options as expandable cards (Option A, B, C)
- [x] **PORT-07**: Tapping a design option expands child iterations (v1, v2, v3) below it
- [x] **PORT-08**: Single-iteration options skip expansion and go directly to 3D viewer
- [x] **PORT-09**: Each iteration opens the full 3D viewer + AR at `/project/:code/:slug`

### Content Pipeline

- [x] **PIPE-01**: System accepts .glb files exported from Cinema 4D placed in /public/models/
- [x] **PIPE-02**: Trophy metadata (name, dimensions, materials, paths) stored in static TypeScript data files
- [x] **PIPE-03**: .glb files support Draco compression for production (< 5 MB per trophy)

### UI & Theme

- [x] **UI-01**: Dark luxury theme with CSS custom properties matching Thomas Lyte brand (backgrounds #0d0d0f/#161619/#1e1e22, gold accent #c9a962)
- [x] **UI-02**: Playfair Display for headings, Inter for body text (Google Fonts)
- [x] **UI-03**: Mobile-first responsive design -- primary use case is phone
- [x] **UI-04**: Loading spinner or skeleton shown during 3D model loading (React Suspense)
- [x] **UI-05**: Back navigation from 3D viewer to gallery or project landing page
- [x] **UI-06**: Trophy info panel showing name, dimensions, and materials on the viewer page

### Infrastructure

- [x] **INFRA-01**: .gitattributes configured for binary files (.glb, .hdr, .usdz) before first binary commit
- [ ] **INFRA-02**: Initial page load < 3 seconds on 4G mobile connection
- [x] **INFRA-03**: JS bundle < 500 KB gzipped
- [ ] **INFRA-04**: Deployable to Vercel as a static site (React + Vite build)

### QR & Sharing

- [ ] **QR-01**: Each client project has a generated QR code encoding the project URL
- [ ] **QR-02**: QR code exportable as PNG/SVG for embedding in PDF decks
- [x] **QR-03**: Each trophy and project iteration has a unique shareable URL

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish & Enhancement

- **PLSH-01**: Hover-to-preload .glb on gallery card hover
- **PLSH-02**: Smooth camera entrance animation on viewer load
- **PLSH-03**: Vignette post-processing for photographic depth
- **PLSH-04**: Dimensions overlay / info hotspots in 3D scene
- **PLSH-05**: Client-specific branding on portal header (client name, project name)
- **PLSH-06**: SSAO on desktop only for enhanced ambient occlusion
- **PLSH-07**: Adaptive HDRI resolution (2K mobile / 4K desktop)
- **PLSH-08**: Lightweight analytics (page views, AR button taps)

### Advanced Features

- **ADV-01**: Material switcher (toggle metal finishes on same model)
- **ADV-02**: Engraving preview (custom text/logo on trophy surface)
- **ADV-03**: Gallery management CMS for non-technical users
- **ADV-04**: Server-side passcode validation via Vercel serverless function
- **ADV-05**: Video turntable export for social media

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaboration | Enterprise-grade WebSocket complexity. A phone call + shared URL solves the same problem. |
| VR gallery walkthrough | Requires headset hardware clients don't own. WebXR VR support is patchy. |
| User accounts / email registration | Clients are busy executives. Account creation friction kills the QR-scan workflow. |
| Integration with AI Design v4.0 pipeline | Separate tools, different data models. Manual 2-minute export doesn't justify integration. |
| Tailwind CSS | Plain CSS with custom properties matches AI Design v4.0 theme exactly. Gallery isn't CSS-heavy. |
| Backend database | Static TypeScript data files sufficient for MVP with < 20 trophies. |
| @react-three/xr for AR | model-viewer handles both platforms. @react-three/xr only adds value for richer Android WebXR post-MVP. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RNDR-01 | Phase 1 | Complete |
| RNDR-02 | Phase 1 | Complete |
| RNDR-03 | Phase 1 | Complete |
| RNDR-04 | Phase 1 | Complete |
| RNDR-05 | Phase 1 | Complete |
| RNDR-06 | Phase 1 | Complete |
| RNDR-07 | Phase 1 | Complete |
| VIEW-01 | Phase 1 | Complete |
| VIEW-02 | Phase 1 | Complete |
| VIEW-03 | Phase 1 | Complete |
| VIEW-04 | Phase 1 | Complete |
| AR-01 | Phase 2 | Complete |
| AR-02 | Phase 2 | Complete |
| AR-03 | Phase 2 | Complete |
| AR-04 | Phase 2 | Complete |
| SHOW-01 | Phase 2 | Complete |
| SHOW-02 | Phase 2 | Complete |
| SHOW-03 | Phase 2 | Complete |
| SHOW-04 | Phase 2 | Complete |
| PORT-01 | Phase 3 | Complete |
| PORT-02 | Phase 3 | Complete |
| PORT-03 | Phase 3 | Complete |
| PORT-04 | Phase 3 | Complete |
| PORT-05 | Phase 3 | Complete |
| PORT-06 | Phase 3 | Complete |
| PORT-07 | Phase 3 | Complete |
| PORT-08 | Phase 3 | Complete |
| PORT-09 | Phase 3 | Complete |
| PIPE-01 | Phase 1 | Complete |
| PIPE-02 | Phase 1 | Complete |
| PIPE-03 | Phase 4 | Complete |
| UI-01 | Phase 2 | Complete |
| UI-02 | Phase 2 | Complete |
| UI-03 | Phase 2 | Complete |
| UI-04 | Phase 1 | Complete |
| UI-05 | Phase 2 | Complete |
| UI-06 | Phase 1 | Complete |
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 4 | Pending |
| INFRA-03 | Phase 4 | Complete |
| INFRA-04 | Phase 4 | Pending |
| QR-01 | Phase 4 | Pending |
| QR-02 | Phase 4 | Pending |
| QR-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation (4-phase coarse structure)*
