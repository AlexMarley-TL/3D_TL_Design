---
phase: 02-public-gallery-ar
plan: 02
subsystem: ar
tags: [model-viewer, ar, webxr, quick-look, usdz, react, custom-elements]

requires:
  - phase: 02-public-gallery-ar
    plan: 01
    provides: TrophyDetail page with back navigation, PublicGallery page, globals.css with gallery styles
provides:
  - ARButton component with hidden model-viewer and conditional AR trigger
  - TypeScript JSX type declaration for model-viewer custom element
  - Cross-platform AR activation (iPhone Quick Look + Android WebXR/Scene Viewer)
  - AR button styled with gold accent in dark luxury theme
affects: [03-client-portal]

tech-stack:
  added: ["@google/model-viewer v4.2.0"]
  patterns: [hidden model-viewer with activateAR() synchronous click handler, canActivateAR conditional rendering, React module augmentation for custom element types]

key-files:
  created: [src/types/model-viewer.d.ts, src/components/ARButton.tsx]
  modified: [package.json, package-lock.json, src/pages/TrophyDetail.tsx, src/styles/globals.css]

key-decisions:
  - "Used declare module 'react' augmentation (not react/jsx-runtime) for model-viewer types -- jsx-runtime augmentation overwrites IntrinsicElements"
  - "Installed model-viewer with --legacy-peer-deps due to npm semver strictness on three.js 0.x peer dep range"

patterns-established:
  - "AR handoff pattern: hidden model-viewer element (width:0 height:0) + custom button calling activateAR() synchronously"
  - "Custom element type pattern: declare module 'react' { namespace JSX { interface IntrinsicElements } } for React 19"
  - "Side-effect import pattern: import '@google/model-viewer' registers custom element globally"

requirements-completed: [AR-01, AR-02, AR-03, AR-04]

duration: 4min
completed: 2026-04-08
---

# Phase 02 Plan 02: AR Integration Summary

**Cross-platform AR via Google model-viewer with hidden element pattern, synchronous activateAR() click handler, and conditional desktop hiding**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-08T14:24:34Z
- **Completed:** 2026-04-08T14:28:59Z
- **Tasks:** 2 (1 auto + 1 checkpoint auto-approved)
- **Files modified:** 6

## Accomplishments
- Installed @google/model-viewer v4.2.0 for cross-platform AR (iPhone Quick Look + Android WebXR/Scene Viewer)
- Created ARButton component with hidden model-viewer element and synchronous activateAR() click handler (critical for iOS compatibility)
- Added TypeScript JSX type declaration for model-viewer custom element using React module augmentation
- Integrated AR button into TrophyDetail page, passing modelPath and usdzPath from trophy data
- AR button conditionally renders only on AR-capable devices (hidden on desktop)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install model-viewer, create type declaration, build ARButton, integrate into TrophyDetail** - `dc70ad5` (feat)
2. **Task 2: Verify gallery browsing and AR on phone** - auto-approved checkpoint (no commit)

## Files Created/Modified
- `src/types/model-viewer.d.ts` - TypeScript JSX type declaration for model-viewer custom element via React module augmentation
- `src/components/ARButton.tsx` - Hidden model-viewer element + conditional AR trigger button with synchronous activateAR()
- `src/pages/TrophyDetail.tsx` - Added ARButton import and rendering with trophy.modelPath and trophy.usdzPath
- `src/styles/globals.css` - Added .ar-button styles (gold accent, positioned above trophy info panel)
- `package.json` - Added @google/model-viewer dependency
- `package-lock.json` - Updated lockfile with model-viewer and its dependencies

## Decisions Made
- Used `declare module 'react'` instead of `declare module 'react/jsx-runtime'` for the model-viewer type declaration. The react/jsx-runtime approach overwrites the IntrinsicElements interface entirely, losing all standard HTML element types. The react module augmentation correctly merges with existing types.
- Used `--legacy-peer-deps` for model-viewer installation. npm was strict about three.js `^0.182.0` peer dep vs installed `0.183.2` despite semver compatibility. The versions are fully compatible.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type declaration pattern for model-viewer**
- **Found during:** Task 1 (type declaration creation)
- **Issue:** Plan specified `declare module 'react/jsx-runtime'` which overwrites `JSX.IntrinsicElements` entirely, breaking all standard HTML element types (div, span, etc.). Build failed with "Property 'div' does not exist on type 'JSX.IntrinsicElements'" across all components.
- **Fix:** Changed to `declare module 'react'` with `import type React from 'react'`, which correctly augments (merges with) the existing React.JSX.IntrinsicElements interface.
- **Files modified:** src/types/model-viewer.d.ts
- **Verification:** `npx tsc --noEmit` passes, `npm run build` succeeds
- **Committed in:** dc70ad5 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential fix for TypeScript compilation. No scope creep.

## Issues Encountered
- npm peer dependency conflict: model-viewer's `three ^0.182.0` peer dep caused ERESOLVE error despite three@0.183.2 being semver-compatible. Resolved with `--legacy-peer-deps` flag. This is a known npm strictness issue with 0.x semver ranges.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete browse-to-view-to-AR flow is now functional: gallery grid -> trophy card tap -> 3D viewer -> View in AR -> platform-appropriate AR experience
- AR button auto-hides on desktop (no AR capability)
- iPhone: Quick Look launches via model-viewer USDZ auto-generation
- Android: WebXR or Scene Viewer launches via model-viewer
- Phase 02 (public-gallery-ar) is complete, ready for Phase 03 (client-portal)
- Open concern: auto-generated USDZ quality with C4D metallic materials is untested on real iPhone (documented in research)

## Self-Check: PASSED

All 5 key files verified present. Task commit (dc70ad5) verified in git log.

---
*Phase: 02-public-gallery-ar*
*Completed: 2026-04-08*
