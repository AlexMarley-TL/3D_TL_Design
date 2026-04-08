# Phase 2: Public Gallery & AR - Research

**Researched:** 2026-04-08
**Domain:** CSS gallery layout, Google model-viewer AR integration, React 19 custom elements
**Confidence:** HIGH

## Summary

Phase 2 builds the public showcase gallery at `/` and integrates cross-platform AR via Google model-viewer. The Phase 1 codebase provides a solid foundation: persistent Canvas, R3F rendering pipeline, dark theme CSS custom properties, React Router v7, and showcase data. The main work is (1) a new gallery page with responsive CSS Grid trophy cards, (2) installing and integrating `@google/model-viewer` v4.2.0 as a hidden web component for AR handoff, (3) a custom "View in AR" button that conditionally renders based on AR capability, and (4) wiring up navigation between gallery and detail views.

The critical architectural insight is the **dual-renderer pattern**: React Three Fiber handles photorealistic 3D viewing, while a hidden `<model-viewer>` element on the detail page handles AR activation. model-viewer auto-generates USDZ for iPhone Quick Look (no manual USDZ conversion needed). The AR button must call `activateAR()` synchronously from a user click handler -- this is a hard requirement for iOS Quick Look to work.

**Primary recommendation:** Install `@google/model-viewer` v4.2.0, add a hidden `<model-viewer>` to the TrophyDetail page with a custom "View in AR" button, use `canActivateAR` to conditionally show the button (auto-hidden on desktop), and build the gallery grid with CSS Grid using the existing theme tokens.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- CSS Grid with responsive columns (1 col mobile, 2 col tablet, 3 col desktop)
- Trophy cards show thumbnail image, name, and short description
- Dark luxury theme using existing CSS custom properties from globals.css
- Cards link to `/trophy/:slug` which already exists from Phase 1
- Use `@google/model-viewer` v4 web component (already planned, not yet installed)
- React 19 has native custom element support -- no wrapper needed
- model-viewer handles platform detection: iPhone -> Quick Look, Android -> WebXR/Scene Viewer
- Hidden `<model-viewer>` element on the page, "View in AR" button triggers it
- AR button hidden on desktop (model-viewer provides `ar` attribute detection)
- model-viewer auto-converts GLB to USDZ for iPhone (no manual USDZ needed)
- Each trophy has shareable URL at `/trophy/:slug` (already works from Phase 1)
- Back navigation from detail -> gallery via browser back or explicit link
- Gallery is the default route at `/` (replace current redirect to test-trophy)

### Claude's Discretion
- Trophy card hover/interaction effects
- Gallery page header/title treatment
- Loading states for thumbnail images
- AR button styling and placement within the viewer

### Deferred Ideas (OUT OF SCOPE)
- Thumbnail image optimization (resize to 600px, convert to WebP) -- post-MVP polish
- Material switcher UI for code-applied presets -- future feature
- Preloading models on card hover -- performance optimization for later
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AR-01 | User can tap "View in AR" to project trophy life-size onto a real surface | model-viewer `activateAR()` method with `ar` attribute; hidden element pattern with custom button |
| AR-02 | AR works on iPhone (Safari) via Apple Quick Look / USDZ through model-viewer | model-viewer auto-generates USDZ from GLB on-the-fly; `ar-modes="webxr scene-viewer quick-look"` |
| AR-03 | AR works on Android (Chrome) via WebXR / Scene Viewer through model-viewer | model-viewer tries WebXR first, falls back to Scene Viewer; same `ar-modes` attribute |
| AR-04 | AR button hidden on desktop (no AR capability) | `canActivateAR` property returns false on desktop; conditional rendering hides button |
| SHOW-01 | Public gallery at `/` displays a grid of curated trophy cards with thumbnails | CSS Grid responsive layout; `SHOWCASE_TROPHIES` data array exists with 2 entries |
| SHOW-02 | User can click a trophy card to open the full 3D viewer at `/trophy/:slug` | React Router `<Link>` from gallery cards; TrophyDetail page exists from Phase 1 |
| SHOW-03 | Public gallery requires no authentication | Gallery route at `/` with no guards; replace current redirect |
| SHOW-04 | Each public trophy has a shareable unique URL | `/trophy/:slug` routes already work from Phase 1 |
| UI-01 | Dark luxury theme with CSS custom properties matching Thomas Lyte brand | All CSS custom properties already defined in globals.css |
| UI-02 | Playfair Display for headings, Inter for body text (Google Fonts) | Google Fonts NOT currently loaded in index.html -- must add `<link>` tags |
| UI-03 | Mobile-first responsive design -- primary use case is phone | CSS Grid with `auto-fill` or media queries; 1/2/3 column breakpoints |
| UI-05 | Back navigation from 3D viewer to gallery or project landing page | Add back link in TrophyDetail; use React Router `<Link to="/">` |
| QR-03 | Each trophy and project iteration has a unique shareable URL | Already satisfied by `/trophy/:slug` routing from Phase 1 |
</phase_requirements>

## Standard Stack

### Core (to install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/model-viewer | 4.2.0 | Cross-platform AR web component | Only viable solution for iPhone AR from web; handles WebXR, Scene Viewer, and Quick Look automatically |

### Already Installed (from Phase 1)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react | ^19.2.4 | UI framework | Native custom element support for model-viewer |
| react-router | ^7.13.2 | Client-side routing | Gallery and detail routes |
| three | ^0.183.2 | 3D engine | Satisfies model-viewer peer dep (^0.182.0) |
| @react-three/fiber | ^9.5.0 | React renderer for Three.js | TrophyViewer already built |
| @react-three/drei | ^10.7.7 | Helper components | useGLTF, Environment, OrbitControls already used |

### No New Dev Dependencies Required

All tooling from Phase 1 is sufficient.

**Installation:**
```bash
npm install @google/model-viewer@^4.2.0
```

**Version verification:** model-viewer 4.2.0 is current (published March 2026). Peer dependency `three ^0.182.0` is satisfied by the project's `three@0.183.2`.

## Architecture Patterns

### Current App Architecture (from Phase 1)

```
App.tsx
  BrowserRouter
    div.app-layout
      TrophyViewer (persistent Canvas -- never unmounts)
      div.dom-overlay (pointer-events: none, children: auto)
        Routes
          "/" -> Navigate to /trophy/test-trophy (REPLACE IN PHASE 2)
          "/trophy/:slug" -> TrophyDetail
```

**Key constraint:** The Canvas is persistent at the layout level. The gallery page must coexist with this architecture. When on the gallery page, `activeModel` should be `null` so the Canvas shows nothing (or a subtle background).

### Phase 2 Target Architecture

```
App.tsx
  BrowserRouter
    div.app-layout
      TrophyViewer (persistent Canvas)
      div.dom-overlay
        Routes
          "/" -> PublicGallery (NEW)
          "/trophy/:slug" -> TrophyDetail (MODIFIED: add AR, add back nav)
```

### Pattern 1: Gallery Page with Scrollable DOM Overlay

**What:** The gallery page is a full-screen scrollable DOM layer rendered on top of the Canvas. When active, the Canvas shows no model (empty scene). The gallery needs `overflow-y: auto` and an opaque background to cover the empty canvas.

**When to use:** Any page that is primarily DOM content (text, images, grid) rather than 3D.

**Example:**
```typescript
// PublicGallery.tsx
import { useEffect } from 'react'
import { Link } from 'react-router'
import { SHOWCASE_TROPHIES } from '../data/showcase.ts'

interface PublicGalleryProps {
  onModelChange: (path: string | null) => void
}

export function PublicGallery({ onModelChange }: PublicGalleryProps) {
  useEffect(() => {
    onModelChange(null)  // clear Canvas when on gallery
  }, [onModelChange])

  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <h1 className="gallery-title">Thomas Lyte</h1>
        <p className="gallery-subtitle">Luxury Trophies & Silverware</p>
      </header>
      <div className="gallery-grid">
        {SHOWCASE_TROPHIES.map((trophy) => (
          <Link key={trophy.slug} to={`/trophy/${trophy.slug}`} className="trophy-card">
            <div className="trophy-card-image">
              <img src={trophy.thumbnailPath} alt={trophy.name} loading="lazy" />
            </div>
            <div className="trophy-card-info">
              <h2 className="trophy-card-name">{trophy.name}</h2>
              <p className="trophy-card-description">{trophy.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### Pattern 2: Hidden model-viewer for AR Handoff

**What:** A `<model-viewer>` element is rendered with minimal visibility on the TrophyDetail page. A custom "View in AR" button checks `canActivateAR` and calls `activateAR()`. The model-viewer loads the same GLB the R3F viewer uses.

**When to use:** Any page that needs AR activation alongside an existing 3D viewer.

**Critical requirement:** `activateAR()` MUST be called synchronously from a user click handler. iOS Quick Look will silently fail if called asynchronously (e.g., from a Promise chain or setTimeout).

**Example:**
```typescript
// ARButton.tsx
import { useRef, useState, useEffect } from 'react'

interface ARButtonProps {
  modelPath: string
}

export function ARButton({ modelPath }: ARButtonProps) {
  const modelViewerRef = useRef<HTMLElement>(null)
  const [arAvailable, setArAvailable] = useState(false)

  useEffect(() => {
    const el = modelViewerRef.current
    if (!el) return

    const checkAR = () => {
      setArAvailable((el as any).canActivateAR ?? false)
    }

    el.addEventListener('load', checkAR)
    checkAR()
    return () => el.removeEventListener('load', checkAR)
  }, [modelPath])

  const handleARClick = () => {
    const el = modelViewerRef.current as any
    if (el?.activateAR) {
      el.activateAR()  // MUST be synchronous from click handler
    }
  }

  return (
    <>
      {/* @ts-expect-error -- model-viewer custom element */}
      <model-viewer
        ref={modelViewerRef}
        src={modelPath}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      />
      {arAvailable && (
        <button className="ar-button" onClick={handleARClick}>
          View in AR
        </button>
      )}
    </>
  )
}
```

### Pattern 3: TypeScript Type Declaration for model-viewer

**What:** Augment JSX types so TypeScript recognizes `<model-viewer>` as a valid element. With `jsx: "react-jsx"` in tsconfig, augment `react/jsx-runtime`.

**Example:**
```typescript
// src/types/model-viewer.d.ts
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          'ios-src'?: string
          ar?: boolean
          'ar-modes'?: string
          'ar-scale'?: string
          'ar-placement'?: string
          'xr-environment'?: boolean
          loading?: 'auto' | 'lazy' | 'eager'
          poster?: string
          style?: React.CSSProperties
        },
        HTMLElement
      >
    }
  }
}
```

### Pattern 4: Responsive CSS Grid Gallery

**What:** CSS Grid with responsive columns using media queries (not auto-fill, for explicit control over column count).

**Example:**
```css
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}

@media (min-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Anti-Patterns to Avoid

- **Wrapping model-viewer in a React component that manages its lifecycle:** React 19 supports custom elements natively. No wrapper component or `useCustomElement` hook needed. Just render the JSX element.
- **Calling activateAR() from async code:** iOS Quick Look requires synchronous invocation from user gesture. Never chain it after `await` or `setTimeout`.
- **Mounting model-viewer globally in App.tsx:** Mount it only on the TrophyDetail page where AR is needed. This avoids loading the model-viewer library on the gallery page.
- **Using display:none on model-viewer:** Use `width:0; height:0; overflow:hidden` instead. Some browsers may not initialize components with `display:none`.
- **Building a custom AR detection utility:** model-viewer's `canActivateAR` already handles all platform detection. Do not hand-roll user-agent sniffing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AR platform detection | User-agent parsing for iOS/Android | model-viewer `canActivateAR` property | Platform detection is fragile, model-viewer tests actual capability |
| USDZ file generation | Manual GLB-to-USDZ conversion pipeline | model-viewer auto-generates USDZ on-the-fly | Three.js USDZExporter is built into model-viewer; manual pipeline adds build complexity |
| AR session management | Custom WebXR session handling | model-viewer `activateAR()` | model-viewer handles WebXR session, Scene Viewer intents, and Quick Look activation |
| Responsive grid framework | Custom JS-based layout | CSS Grid with media queries | Browser-native, zero JS, perfect for a 2-20 item gallery |

**Key insight:** model-viewer abstracts away the entire AR pipeline. The only code needed is: render the element, check `canActivateAR`, call `activateAR()` on click. Everything else (USDZ generation, platform detection, AR session management) is handled internally.

## Common Pitfalls

### Pitfall 1: activateAR() Called Asynchronously
**What goes wrong:** iOS Quick Look silently fails. No error thrown, no AR session starts. Android may also fail depending on browser.
**Why it happens:** The developer wraps `activateAR()` in an async function, uses it after `await`, or defers it with `setTimeout`.
**How to avoid:** Call `activateAR()` directly in the click event handler. No async, no promises, no deferred execution.
**Warning signs:** AR works on Android but not iOS. No error in console.

### Pitfall 2: Google Fonts Not Loaded
**What goes wrong:** Gallery text renders in fallback serif/sans-serif fonts. Looks generic, not luxury.
**Why it happens:** Phase 1 only used CSS custom properties for font-family but never added `<link>` tags to index.html. The 3D viewer had no visible text, so this was not noticed.
**How to avoid:** Add Google Fonts `<link>` tags to `index.html` for Playfair Display and Inter before building the gallery.
**Warning signs:** Headings don't look like the design mockups. Flash of unstyled text (FOUT).

### Pitfall 3: Gallery Page Doesn't Scroll
**What goes wrong:** The gallery grid is clipped to viewport height, cards below the fold are invisible.
**Why it happens:** globals.css sets `html, body, #root { overflow: hidden }` for the 3D viewer. The dom-overlay also has `height: 100%` which constrains content.
**How to avoid:** The gallery page container needs `overflow-y: auto` and `height: 100%` to enable scrolling within the overlay. The body `overflow: hidden` stays (needed for Canvas) but the gallery DOM element scrolls independently.
**Warning signs:** Gallery looks fine with 1-2 trophies but breaks when more are added.

### Pitfall 4: Double Model Loading
**What goes wrong:** The same GLB is loaded twice -- once by R3F's useGLTF and once by model-viewer's internal Three.js loader. Memory usage doubles.
**Why it happens:** R3F and model-viewer are independent renderers with separate caches.
**How to avoid:** Accept the tradeoff for MVP. model-viewer loads the GLB on-demand (only when rendered on detail page). The R3F viewer loads it for display, model-viewer loads it for AR export. Future optimization: lazy-load model-viewer only when AR button is clicked.
**Warning signs:** High memory usage on mobile when viewing trophy detail page.

### Pitfall 5: model-viewer Side-Effect Import Missing
**What goes wrong:** `<model-viewer>` renders as an unknown HTML element -- no 3D, no AR button, just empty space.
**Why it happens:** Developer forgets `import '@google/model-viewer'` side-effect import. TypeScript won't warn because the JSX type declaration makes the element valid.
**How to avoid:** Add `import '@google/model-viewer'` at the top of the component file that renders the element (ARButton or TrophyDetail).
**Warning signs:** No console errors, but model-viewer does nothing. Element exists in DOM but has no shadow DOM.

### Pitfall 6: Canvas Showing Through Gallery
**What goes wrong:** The gallery page shows a transparent background, and the (empty) Canvas/WebGL context bleeds through, creating visual artifacts or a distracting dark gap.
**Why it happens:** The dom-overlay has `pointer-events: none` and no background. When no model is loaded, the Canvas shows its clear color.
**How to avoid:** Give the gallery page an opaque background (`var(--bg-primary)`) so it fully covers the Canvas beneath.
**Warning signs:** Flickering between gallery and detail transitions. Gallery page has inconsistent background.

## Code Examples

### model-viewer Side-Effect Import
```typescript
// Import once in the component that uses <model-viewer>
// This registers the custom element globally
import '@google/model-viewer'
```

### Responsive Trophy Card CSS
```css
.trophy-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trophy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.trophy-card-image {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.trophy-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trophy-card-info {
  padding: 16px;
}

.trophy-card-name {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.trophy-card-description {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}
```

### Back Navigation from Detail
```typescript
// In TrophyDetail.tsx or TrophyInfo.tsx
import { Link } from 'react-router'

<Link to="/" className="back-link">Back to Gallery</Link>
```

### Google Fonts Link Tags
```html
<!-- Add to index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual USDZ export pipeline | model-viewer auto-generates USDZ from GLB | model-viewer 1.7+ (2021) | No manual USDZ conversion needed |
| `@react-three/xr` for AR | model-viewer for cross-platform AR | N/A (different tools) | model-viewer is the only option for iPhone AR from web |
| `declare global { namespace JSX }` | `declare module 'react/jsx-runtime'` | React 19 (Dec 2024) | Custom element types must use new module augmentation pattern |
| react-router-dom separate package | `import from 'react-router'` (unified) | react-router v7 (2024) | Single import source, already used in Phase 1 |

**Deprecated/outdated:**
- `@react-three/xr` alone cannot handle iPhone AR (WebXR not available on iOS Safari)
- `declare global { namespace JSX { interface IntrinsicElements } }` pattern no longer works in React 19 -- must use module augmentation

## Open Questions

1. **USDZ Auto-Generation Quality with C4D Materials**
   - What we know: model-viewer auto-generates USDZ from GLB using Three.js USDZExporter. PBR materials (metalness, roughness) are supported. The C4D trophies use original materials baked into the GLB.
   - What's unclear: Whether the auto-generated USDZ preserves the visual quality of the original C4D materials. Quick Look has its own PBR renderer which may interpret materials differently.
   - Recommendation: Test with the UEFA Women's Euro Trophy GLB on a real iPhone. If quality is unacceptable, provide a manual `ios-src` USDZ file exported from Cinema 4D via Reality Converter.

2. **Model Loading Performance (Double Load)**
   - What we know: R3F loads the GLB for display, model-viewer loads it again for AR. Both use Three.js internally but have separate caches.
   - What's unclear: Whether the second load causes noticeable lag on mobile devices with the trophy models.
   - Recommendation: Accept for MVP. If slow, lazy-import model-viewer only when AR button is tapped (but this risks breaking the synchronous click requirement for iOS).

## Project Constraints (from CLAUDE.md)

- **No Tailwind** -- plain CSS with CSS custom properties
- **No class components** -- functional components with hooks only
- **TypeScript strict mode** -- enabled in tsconfig.app.json
- **Mobile-first** -- phone is the primary use case
- **Pixel ratio capped at 2x** -- already enforced in TrophyViewer
- **verbatimModuleSyntax** -- side-effect imports (`import '@google/model-viewer'`) are valid
- **Explicit .ts extensions** -- all imports use `.ts`/`.tsx` extensions
- **Persistent Canvas** -- Canvas never unmounts; scene content swaps via props
- **DOM overlay routing** -- all pages render as absolute-positioned DOM on top of Canvas
- **No backend** -- static TypeScript data files only

## Existing Code Inventory

### Files to MODIFY
| File | Change | Why |
|------|--------|-----|
| `src/App.tsx` | Replace `/` redirect with `PublicGallery` component; pass `onModelChange` | Gallery is the new root route |
| `src/pages/TrophyDetail.tsx` | Add ARButton component; add back navigation link | AR-01 through AR-04; UI-05 |
| `src/styles/globals.css` | Add gallery grid, card, AR button, back link styles | UI-01, UI-02, UI-03 |
| `index.html` | Add Google Fonts `<link>` tags | UI-02 (fonts not currently loaded) |

### Files to CREATE
| File | Purpose |
|------|---------|
| `src/pages/PublicGallery.tsx` | Gallery grid page with trophy cards |
| `src/components/TrophyCard.tsx` | Individual trophy card (thumbnail + name + description) |
| `src/components/ARButton.tsx` | Hidden model-viewer + "View in AR" button |
| `src/types/model-viewer.d.ts` | TypeScript JSX type declaration for `<model-viewer>` |

### Files Unchanged
- `src/viewer/TrophyViewer.tsx` -- no changes needed
- `src/viewer/TrophyScene.tsx` -- no changes needed
- `src/viewer/TrophyModel.tsx` -- no changes needed
- `src/data/showcase.ts` -- existing data sufficient (2 trophies)
- `src/materials/metalPresets.ts` -- no changes needed
- `src/types/index.ts` -- existing types sufficient
- `src/components/TrophyInfo.tsx` -- minor: may need to accommodate AR button placement
- `src/components/LoadingSpinner.tsx` -- no changes needed

## Sources

### Primary (HIGH confidence)
- [@google/model-viewer npm](https://www.npmjs.com/package/@google/model-viewer) -- v4.2.0, peer dep three ^0.182.0
- [model-viewer AR documentation (DeepWiki)](https://deepwiki.com/google/model-viewer/4.5-augmented-reality-features) -- ar attributes, canActivateAR, USDZ auto-generation
- [model-viewer AR examples](https://modelviewer.dev/examples/augmentedreality/index.html) -- custom AR button slot, ar-status CSS
- [model-viewer ar.ts source](https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/features/ar.ts) -- activateAR() method, canActivateAR getter
- [model-viewer hidden element pattern](https://github.com/google/model-viewer/discussions/4208) -- 0x0 size + activateAR approach
- [model-viewer AR button hiding](https://github.com/google/model-viewer/issues/1654) -- official guidance on AR button visibility

### Secondary (MEDIUM confidence)
- [React 19 custom element TypeScript types](https://iifx.dev/en/articles/456523166/upgrade-guide-handling-custom-element-types-after-moving-to-react-19) -- module augmentation for react/jsx-runtime
- [TypeScript verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html) -- side-effect imports are preserved
- [Google AR developer docs](https://developers.google.com/ar/develop/webxr/model-viewer) -- official AR integration guide

### Tertiary (LOW confidence)
- [model-viewer USDZ quality with PBR](https://www.khronos.org/news/permalink/model-viewer-1.7-released-with-auto-generation-of-usdz-on-the-fly) -- auto-generation since v1.7; quality with luxury metal materials untested in this project

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- model-viewer v4.2.0 is current, three peer dep satisfied, single package to install
- Architecture: HIGH -- dual-renderer pattern (R3F + model-viewer) is documented and field-proven; gallery is straightforward CSS Grid
- Pitfalls: HIGH -- activateAR synchronous requirement, Google Fonts gap, and scrolling issue are all verified concerns
- AR quality: LOW -- auto-generated USDZ quality with C4D metallic materials is untested; needs real-device validation

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable domain, model-viewer v4 is mature)
