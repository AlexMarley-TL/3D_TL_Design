---
phase: 04-production-deploy
plan: 01
subsystem: infra
tags: [vite, code-splitting, rolldown, draco, gltf-pipeline, performance, bundle-optimization]

requires:
  - phase: 03-client-portal
    provides: Complete app with all routes and components to optimize

provides:
  - Code-split JS bundle under 500 KB gzipped initial load
  - Lazy-loaded route pages via React.lazy
  - Dynamically imported model-viewer (deferred ~65 KB gzip)
  - Lazy-loaded TrophyScene with postprocessing (deferred ~127 KB gzip)
  - Vendor chunk splitting (three.js, react) for independent caching
  - Draco compression script for .glb model files

affects: [04-production-deploy]

tech-stack:
  added: [gltf-pipeline, tsx]
  patterns: [React.lazy dynamic imports for route pages, dynamic import for model-viewer side-effect, lazy TrophyScene inside R3F Canvas, Rolldown manualChunks function for vendor splitting]

key-files:
  created:
    - scripts/compress-models.ts
  modified:
    - src/App.tsx
    - src/components/ARButton.tsx
    - src/viewer/TrophyViewer.tsx
    - vite.config.ts
    - package.json

key-decisions:
  - "Used Rolldown manualChunks function (not object map) -- Vite 8 uses Rolldown which requires function form"
  - "Lazy-loaded TrophyScene inside TrophyViewer to defer postprocessing/drei from initial load -- reduced initial JS from 507 KB to 377 KB gzip"
  - "model-viewer loaded via useEffect dynamic import with loaded state tracking -- ensures custom element is registered before DOM interaction"

patterns-established:
  - "React.lazy with named export conversion: lazy(() => import('./Page.tsx').then(m => ({ default: m.Page })))"
  - "Side-effect dynamic import pattern for web components: import('@google/model-viewer') in useEffect"
  - "Rolldown vendor chunk splitting via manualChunks function in build.rolldownOptions.output"

requirements-completed: [PIPE-03, INFRA-03]

duration: 9min
completed: 2026-04-08
---

# Phase 04 Plan 01: Bundle Optimization Summary

**Code-split JS bundle from 573 KB to ~377 KB gzipped initial load via React.lazy routes, deferred model-viewer/postprocessing, and Rolldown vendor chunk splitting; added Draco compression script for .glb models**

## Performance

- **Duration:** 9 min
- **Started:** 2026-04-08T15:02:30Z
- **Completed:** 2026-04-08T15:11:54Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Reduced initial JS load from 573 KB to ~377 KB gzipped (34% reduction) -- well under 500 KB budget
- model-viewer (65.5 KB gzip) deferred until ARButton renders, postprocessing/drei (127 KB gzip) deferred until TrophyScene loads
- Build now produces 13 separate JS chunks with proper vendor splitting for cache efficiency
- Draco compression script ready for manual use on .glb models via `npm run compress-models`

## Task Commits

Each task was committed atomically:

1. **Task 1: Code-split model-viewer and lazy-load route pages** - `5ded770` (feat)
2. **Task 2: Create Draco compression script for .glb models** - `03281ba` (feat)

## Files Created/Modified
- `src/App.tsx` - Replaced eager page imports with React.lazy, added Suspense wrapper around Routes
- `src/components/ARButton.tsx` - Converted model-viewer from top-level import to dynamic import in useEffect
- `src/viewer/TrophyViewer.tsx` - Lazy-loaded TrophyScene to defer postprocessing bundle
- `vite.config.ts` - Added Rolldown manualChunks for vendor-three and vendor-react chunk splitting
- `scripts/compress-models.ts` - Draco compression script using gltf-pipeline processGlb
- `package.json` - Added compress-models npm script, gltf-pipeline and tsx devDependencies

## Decisions Made
- **Rolldown manualChunks function form:** Vite 8 uses Rolldown bundler which requires manualChunks as a function (not Rollup's object map). Used function form that matches node_modules paths.
- **Lazy TrophyScene (deviation from plan):** Plan only specified lazy routes and model-viewer, but that alone brought initial load to 507 KB (still over budget). Lazy-loading TrophyScene inside the existing Suspense boundary deferred postprocessing/drei (~127 KB gzip) and brought initial load to 377 KB. This is an import mechanism change only -- no component logic changed.
- **model-viewer loaded state tracking:** Added `modelViewerLoaded` state to ARButton to ensure the custom element is registered before the AR availability check runs. The original code's useEffect depended on the element being present at mount.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Lazy-loaded TrophyScene to meet 500 KB budget**
- **Found during:** Task 1 (code-splitting)
- **Issue:** After lazy-loading routes and model-viewer per plan, initial JS was 507 KB gzip (still over 500 KB budget). The postprocessing library contributed ~182 KB to the main index chunk.
- **Fix:** Made TrophyScene a React.lazy import inside TrophyViewer. The existing `<Suspense fallback={null}>` already wrapped TrophyScene's render position, so this required only an import change.
- **Files modified:** src/viewer/TrophyViewer.tsx
- **Verification:** Build shows initial chunks sum to ~377 KB gzip
- **Committed in:** 5ded770 (Task 1 commit)

**2. [Rule 3 - Blocking] Used --legacy-peer-deps for npm install**
- **Found during:** Task 2 (installing gltf-pipeline)
- **Issue:** npm refused to install due to model-viewer's three.js peer dep conflict (known issue from Phase 02)
- **Fix:** Used `npm install --save-dev gltf-pipeline tsx --legacy-peer-deps`
- **Files modified:** package.json, package-lock.json
- **Verification:** Both packages appear in devDependencies
- **Committed in:** 03281ba (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to meet the 500 KB budget and install dependencies. No scope creep.

## Issues Encountered
None beyond the documented deviations.

## User Setup Required
None - no external service configuration required.

## Build Output Reference

```
Initial load chunks (eagerly loaded):
  rolldown-runtime    0.41 KB gzip
  vendor-react       73.46 KB gzip
  index              51.69 KB gzip
  vendor-three      251.60 KB gzip
  TOTAL:            377.16 KB gzip  (<500 KB budget)

Deferred chunks (lazy loaded):
  TrophyScene       126.54 KB gzip  (loaded when model renders)
  model-viewer       65.53 KB gzip  (loaded when ARButton mounts)
  decode              5.48 KB gzip  (loaded with TrophyScene)
  Page chunks         5.37 KB gzip  (loaded per route)
```

## Next Phase Readiness
- Bundle optimized and under budget, ready for Vercel deployment (Plan 04-02)
- Draco compression script available for model optimization before deploy
- All routes work with code-splitting active

## Self-Check: PASSED

All 5 created/modified source files verified present. Both task commits (5ded770, 03281ba) verified in git log.

---
*Phase: 04-production-deploy*
*Completed: 2026-04-08*
