# Phase 2: Public Gallery & AR - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning
**Mode:** Auto-generated (user away — autonomous mode)

<domain>
## Phase Boundary

Build the public showcase gallery at `/` with trophy cards, and integrate cross-platform AR via Google model-viewer. Users browse a grid of trophies, tap into the 3D viewer at `/trophy/:slug`, and can place trophies in AR on their phone. No authentication required.

</domain>

<decisions>
## Implementation Decisions

### Gallery Layout
- CSS Grid with responsive columns (1 col mobile, 2 col tablet, 3 col desktop)
- Trophy cards show thumbnail image, name, and short description
- Dark luxury theme using existing CSS custom properties from globals.css
- Cards link to `/trophy/:slug` which already exists from Phase 1

### AR Integration
- Use `@google/model-viewer` v4 web component (already installed)
- React 19 has native custom element support — no wrapper needed
- model-viewer handles platform detection: iPhone → Quick Look, Android → WebXR/Scene Viewer
- Hidden `<model-viewer>` element on the page, "View in AR" button triggers it
- AR button hidden on desktop (model-viewer provides `ar` attribute detection)
- model-viewer auto-converts GLB to USDZ for iPhone (no manual USDZ needed)

### Navigation & URLs
- Each trophy has shareable URL at `/trophy/:slug` (already works from Phase 1)
- Back navigation from detail → gallery via browser back or explicit link
- Gallery is the default route at `/` (replace current redirect to test-trophy)

### Claude's Discretion
- Trophy card hover/interaction effects
- Gallery page header/title treatment
- Loading states for thumbnail images
- AR button styling and placement within the viewer

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TrophyViewer` — persistent Canvas with R3F scene (src/viewer/TrophyViewer.tsx)
- `TrophyScene` — HDRI, controls, post-processing (src/viewer/TrophyScene.tsx)
- `TrophyModel` — GLB loading with original material support (src/viewer/TrophyModel.tsx)
- `TrophyInfo` — name, dimensions, materials overlay (src/components/TrophyInfo.tsx)
- `TrophyDetail` — routed detail page (src/pages/TrophyDetail.tsx)
- `SHOWCASE_TROPHIES` data array (src/data/showcase.ts)
- `PublicTrophy` type with `useOriginalMaterials` flag (src/types/index.ts)
- Dark theme CSS custom properties in globals.css
- `METAL_PRESETS` for code-applied finishes (src/materials/metalPresets.ts)

### Established Patterns
- Functional components with hooks, no class components
- CSS custom properties for theming (--color-gold, --bg-primary, etc.)
- React Router v7 for client-side routing (import from "react-router")
- App.tsx manages active model state, passes to TrophyViewer via props
- useGLTF for model loading with Suspense fallback

### Integration Points
- App.tsx needs new gallery route at `/` and TrophyCard navigation
- showcase.ts needs more trophy entries for gallery display
- model-viewer needs to be added to TrophyDetail page for AR handoff
- globals.css needs gallery grid and card styles

</code_context>

<specifics>
## Specific Ideas

- User has C4D trophies with original materials — useOriginalMaterials flag already supported
- Thumbnails are large JPEGs from C4D renders — can resize later but work for now
- User confirmed they want C4D materials preserved, not overridden with metal presets
- Export pipeline established: Save Selected Objects → Export GLB with textures, normals, UVs
- Double-sided rendering enabled for C4D models
- X-axis mirror applied for C4D left-handed coordinate system

</specifics>

<deferred>
## Deferred Ideas

- Thumbnail image optimization (resize to 600px, convert to WebP) — post-MVP polish
- Material switcher UI for code-applied presets — future feature
- Preloading models on card hover — performance optimization for later

</deferred>
