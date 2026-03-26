# 3D Trophy Gallery & AR Viewer

## What This Is

A web-based 3D gallery and AR viewer for Thomas Lyte, a luxury trophy and silverware manufacturer. Clients scan a QR code on a PDF presentation deck, enter a 4-digit passcode, and interact with photorealistic 3D trophy models in their browser. They can project trophies life-size onto real surfaces using their phone camera. A public showcase gallery displays well-known Thomas Lyte trophies for marketing purposes.

## Core Value

Trophy renders must look convincingly real in-browser — approaching Cinema 4D / Redshift quality with photorealistic polished metal reflections. If the rendering doesn't sell the luxury product, nothing else matters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Web-based 3D gallery with grid/card layout
- [ ] Interactive 3D viewer with rotate, zoom, pan controls
- [ ] Photorealistic metal rendering (gold, silver, chrome, rose gold) using MeshPhysicalMaterial + HDRI + bloom
- [ ] Phone AR on Android via WebXR / Scene Viewer
- [ ] Phone AR on iPhone via Apple Quick Look / USDZ
- [ ] Accept .glb files exported from Cinema 4D with baked PBR materials
- [ ] Shareable unique URLs per trophy — no app install required
- [ ] Mobile-first responsive design
- [ ] Dark luxury theme matching Thomas Lyte brand and AI Design v4.0 aesthetic
- [ ] Client portal with 4-digit passcode authentication per project
- [ ] Design option parent-child UI (Option A/B/C with child iterations v1/v2/v3)
- [ ] Public showcase gallery (no auth) for well-known trophies
- [ ] QR code generation for embedding in PDF decks
- [ ] 60 FPS on modern phones, < 3 second load on 4G

### Out of Scope

- Material switcher (toggle metal finishes on same model) — post-MVP
- Engraving preview (custom text/logo on trophy surface) — post-MVP
- Gallery management UI (upload/remove/reorder) — post-MVP, content managed via code for now
- Password protection beyond 4-digit passcode — disproportionate to risk level
- VR gallery walkthrough — future, requires headset hardware
- Real-time collaboration — future, high complexity
- Integration with AI Design v4.0 pipeline — future
- Video turntable export — future
- Backend database — static TypeScript data files sufficient for MVP (<20 trophies)
- Serverless passcode validation — client-side SHA-256 hashing sufficient for MVP

## Context

- Thomas Lyte already has an AI Design v4.0 system producing 2D renders. The 3D viewer extends the existing deck workflow — same Cinema 4D models serve double duty.
- Alex Marley is the sole designer. He exports .glb from Cinema 4D and manages content via code commits.
- Clients are busy executives. No account creation — just a 4-digit code shared by the account handler.
- The QR code and passcode stay the same across all revisions. Clients rescan to see updates.
- Two experiences: private client portal (passcode) and public showcase (no auth).
- Data hierarchy: Project > Design Options > Iterations (each with its own .glb model).
- Content pipeline: Cinema 4D > export .glb > place in /public/models/ > add metadata to TypeScript > deploy to Vercel.

## Constraints

- **Tech stack**: React 19 + Vite 6 + TypeScript, React Three Fiber, drei, model-viewer for AR. No Tailwind — plain CSS.
- **Hosting**: Vercel free tier (100 GB bandwidth/month). Azure Static Web Apps as fallback if IT requires Microsoft ecosystem.
- **File size**: Trophy .glb < 5 MB (Draco compressed), HDRI < 2 MB, thumbnails < 100 KB, JS bundle < 500 KB gzipped.
- **Performance**: 60 FPS in 3D viewer, 30+ FPS in AR, < 3 second initial load on 4G.
- **Platform**: iPhone Safari (Quick Look AR), Android Chrome (WebXR AR), Desktop (3D only, no AR).
- **No backend**: Fully static site for MVP. Data in TypeScript files.
- **Pixel ratio**: Capped at 2x — 3x kills mobile performance.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Three Fiber over plain Three.js | Declarative component model, hooks, R3F ecosystem | -- Pending |
| model-viewer for AR over native WebXR only | Cross-platform iOS + Android in single component. WebXR alone fails on iPhone. | -- Pending |
| Static site over backend server | No server needed for read-only gallery. Free hosting. Simpler. | -- Pending |
| Client-side passcode (SHA-256) over serverless auth | Proportionate to risk level. Design concepts, not financial data. | -- Pending |
| CSS over Tailwind | Match AI Design v4.0 theme exactly. Gallery is not CSS-heavy. | -- Pending |
| HDRI studio lighting over manual light setup | Professional studio photography look with minimal setup | -- Pending |
| Coarse phase structure | Fewer broader phases for faster iteration on a solo-developer project | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check -- still the right priority?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 after initialization*
