# Architecture Research

**Domain:** Web-based 3D product viewer with photorealistic metal rendering and cross-platform AR
**Researched:** 2026-03-26
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
                         CLIENT DEVICES
 +-----------------+  +-----------------+  +------------------+
 | iPhone Safari   |  | Android Chrome  |  | Desktop Browser  |
 | WebGL: Yes      |  | WebGL: Yes      |  | WebGL: Yes       |
 | AR: Quick Look  |  | AR: WebXR       |  | AR: No           |
 | (USDZ only)     |  | + Scene Viewer  |  | (3D viewer only) |
 +---------+-------+  +---------+-------+  +---------+--------+
           |                    |                     |
           +--------------------+---------------------+
                                |
                           HTTPS (CDN)
                                |
 +------------------------------v-------------------------------+
 |                    VERCEL (Static Hosting)                    |
 |                                                               |
 |  React 19 + Vite 6 SPA          Static Assets                |
 |  +-----------------------+       +-----------------------+    |
 |  | React Router          |       | /models/*.glb (Draco) |    |
 |  |   / - Public Gallery  |       | /models/*.usdz        |    |
 |  |   /trophy/:slug       |       | /hdri/*.hdr           |    |
 |  |   /project/:code      |       | /images/*.webp        |    |
 |  |   /project/:code/:slug|       +-----------------------+    |
 |  +-----------------------+                                    |
 |                                                               |
 |  JS Bundle (<500 KB gzip)        Models (<5 MB each, Draco)  |
 +---------------------------------------------------------------+
```

### The Hybrid Rendering Architecture

This project requires two separate rendering engines on the same page. This is the defining architectural pattern:

1. **React Three Fiber** owns the primary 3D viewing experience -- full visual control over materials, lighting, post-processing, and camera.
2. **Google model-viewer** owns the AR handoff -- a hidden web component that handles platform detection and AR launch automatically.

These two engines never render simultaneously. R3F renders the interactive 3D scene; model-viewer activates only when the user taps "View in AR" and hands off to the native platform AR experience (Quick Look on iOS, WebXR/Scene Viewer on Android).

```
 TROPHY DETAIL PAGE
 +----------------------------------------------------+
 |                                                      |
 |   React Three Fiber Canvas (visible)                 |
 |   +----------------------------------------------+  |
 |   | <Canvas>                                      |  |
 |   |   <Environment> (HDRI studio)                 |  |
 |   |   <TrophyModel> (useGLTF + MeshPhysical)     |  |
 |   |   <OrbitControls> (touch/mouse interaction)   |  |
 |   |   <ContactShadows>                            |  |
 |   |   <EffectComposer> (Bloom + ACES)             |  |
 |   +----------------------------------------------+  |
 |                                                      |
 |   model-viewer (hidden, zero-size until AR tap)      |
 |   +----------------------------------------------+  |
 |   | <model-viewer                                 |  |
 |   |   src="trophy.glb"                            |  |
 |   |   ios-src="trophy.usdz"  (optional)           |  |
 |   |   ar                                          |  |
 |   |   ar-modes="webxr scene-viewer quick-look"    |  |
 |   | />                                            |  |
 |   +----------------------------------------------+  |
 |                                                      |
 |   [View in AR] button -> triggers model-viewer AR    |
 |                                                      |
 +----------------------------------------------------+
```

**Why this hybrid, not one or the other:**
- R3F alone cannot do iPhone AR (WebXR not supported on iOS Safari).
- model-viewer alone cannot achieve the photorealistic rendering quality needed (no MeshPhysicalMaterial, no custom post-processing, no fine-grained scene control).
- The hybrid gives photorealistic 3D viewing (R3F) plus cross-platform AR (model-viewer) with zero platform detection code.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Router (App.tsx)** | URL routing, layout shell, page transitions | React Router v7 with `<Routes>` and `<Route>` |
| **Gallery Pages** | Data lookup, card grid layout, navigation | React components reading static TS data files |
| **PasscodeEntry** | Authentication gate for client projects | SHA-256 hash comparison, localStorage persistence, rate limiting |
| **TrophyViewer** | R3F Canvas wrapper, renderer config, Suspense boundary | `<Canvas>` with gl config, `<Suspense>` fallback |
| **TrophyScene** | Scene composition: lighting, environment, shadows, post-processing | drei `<Environment>`, `<ContactShadows>`, postprocessing `<EffectComposer>` |
| **TrophyModel** | Load .glb, apply metal preset materials, center/scale | `useGLTF` hook, material traversal, drei `<Center>` |
| **ARButton** | Trigger model-viewer AR activation | Hidden `<model-viewer>` element, programmatic `.activateAR()` call |
| **Metal Presets** | Material configuration constants | TypeScript object mapping preset names to MeshPhysicalMaterial params |
| **Static Data** | Trophy/project metadata | TypeScript files exporting typed arrays (`projects.ts`, `showcase.ts`) |

## Recommended Project Structure

```
src/
├── main.tsx                    # App entry, React DOM root
├── App.tsx                     # Router + global layout shell
│
├── pages/                      # Route-level components (one per route)
│   ├── PublicGallery.tsx       # / - Public showcase grid
│   ├── TrophyDetail.tsx        # /trophy/:slug - 3D viewer + AR
│   ├── ClientPortal.tsx        # /project/:code - Passcode gate + options
│   └── ClientDesign.tsx        # /project/:code/:slug - 3D viewer + AR
│
├── components/                 # Shared UI components
│   ├── TrophyCard.tsx          # Gallery card (thumbnail + info)
│   ├── DesignOption.tsx        # Expandable option with child iterations
│   ├── PasscodeEntry.tsx       # 4-digit passcode input
│   ├── LoadingSpinner.tsx      # Loading state for Suspense fallback
│   └── Header.tsx              # Site header / back navigation
│
├── viewer/                     # 3D rendering components (R3F-specific)
│   ├── TrophyViewer.tsx        # Canvas wrapper + renderer config
│   ├── TrophyScene.tsx         # Scene: environment, shadows, post-processing
│   ├── TrophyModel.tsx         # Model loader + material application
│   └── ARButton.tsx            # model-viewer AR handoff component
│
├── materials/                  # Material system
│   └── metalPresets.ts         # MeshPhysicalMaterial preset configs
│
├── data/                       # Static data (MVP, no backend)
│   ├── projects.ts             # Client projects with hashed passcodes
│   └── showcase.ts             # Public showcase trophies
│
├── styles/                     # Global styles
│   └── globals.css             # CSS custom properties, dark theme
│
├── types/                      # Shared TypeScript interfaces
│   └── index.ts                # Trophy, Project, MetalPreset types
│
└── utils/                      # Utility functions
    ├── auth.ts                 # SHA-256 hashing, passcode validation
    └── deviceDetection.ts      # Platform detection (if needed beyond model-viewer)
```

### Structure Rationale

- **`pages/`:** One file per route. Each page composes components and handles data lookup for its URL params. `TrophyDetail` and `ClientDesign` both use the same `TrophyViewer` component but with different data sources (showcase vs. project).
- **`viewer/`:** Separated from generic `components/` because R3F components exist inside a Canvas context and follow different rules (useFrame, refs, no DOM). This boundary prevents mixing DOM components with Three.js scene components.
- **`materials/`:** Isolated because metal presets are pure data (no React, no Three.js imports needed). They define the configuration; `TrophyModel` consumes them.
- **`data/`:** Static TypeScript exports. Imported at build time. No API calls, no async data fetching for metadata. Models (.glb files) are still loaded async at runtime via `useGLTF`.
- **`types/`:** Single source of truth for shared interfaces (`PublicTrophy`, `ClientProject`, `DesignOption`, `Iteration`, `MetalPreset`). Prevents duplication across data files and components.

## Architectural Patterns

### Pattern 1: Suspense-Based Progressive Loading

**What:** Use React Suspense boundaries at two levels -- the page level (for route code splitting) and the viewer level (for 3D asset loading). The gallery shows thumbnails instantly. The 3D viewer shows a branded loading spinner while .glb and .hdr files download. Hover-preloading on gallery cards starts fetching the model before the user navigates.

**When to use:** Always. Every 3D asset load path needs a Suspense boundary.

**Trade-offs:** Suspense fallbacks re-trigger if a late-loaded resource is needed. Preloading on hover mitigates this. The gallery page itself loads near-instantly because it uses only thumbnail images.

**Example:**
```typescript
// In TrophyCard.tsx -- preload model on hover
const handleMouseEnter = () => {
  useGLTF.preload(trophy.modelPath)
}

// In TrophyViewer.tsx -- Suspense boundary for async model loading
<Canvas gl={rendererConfig}>
  <Suspense fallback={<LoadingSpinner />}>
    <TrophyScene modelPath={modelPath} metalPreset={preset} />
  </Suspense>
</Canvas>

// useGLTF.preload at module level for critical models
useGLTF.preload('/models/fa-cup.glb')
```

### Pattern 2: Scene-as-Component Composition

**What:** The 3D scene is composed from discrete React components, each owning one responsibility. `TrophyScene` composes `TrophyModel`, environment, shadows, and post-processing. `TrophyModel` handles only model loading and material application. This follows R3F's declarative pattern where the scene graph maps directly to the component tree.

**When to use:** Always for R3F scenes. This is the standard pattern.

**Trade-offs:** More components means more files, but each is small, testable, and reusable. The `TrophyScene` can be reused identically for both public showcase and client portal viewers.

**Example:**
```typescript
// TrophyScene.tsx -- composes the full scene from parts
function TrophyScene({ modelPath, metalPreset }: Props) {
  return (
    <>
      <Environment files="/hdri/studio.hdr" />
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} blur={2} />
      <Center>
        <TrophyModel path={modelPath} preset={metalPreset} />
      </Center>
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
      <EffectComposer>
        <Bloom luminanceThreshold={0.9} intensity={0.3} />
      </EffectComposer>
    </>
  )
}
```

### Pattern 3: Hidden model-viewer for AR Handoff

**What:** A `<model-viewer>` web component is rendered in the DOM but hidden (zero dimensions, off-screen, or `display: none` until needed). When the user taps "View in AR", JavaScript calls `modelViewerRef.activateAR()` programmatically. model-viewer handles all platform detection -- WebXR on Android, Scene Viewer as fallback, Quick Look on iOS.

**When to use:** On every trophy detail page where AR is supported.

**Trade-offs:** Two separate rendering engines exist in the DOM. model-viewer may download the .glb a second time (its own loader is separate from R3F's `useGLTF`). Mitigate by ensuring the browser HTTP cache serves the same .glb URL. The AR experience uses the native platform renderer (not your custom R3F scene), so materials may look slightly different -- this is unavoidable and acceptable since AR is for spatial/scale verification, not final render quality.

**Example:**
```typescript
// ARButton.tsx
function ARButton({ glbPath, usdzPath }: Props) {
  const modelViewerRef = useRef<HTMLElement>(null)

  const handleAR = () => {
    const mv = modelViewerRef.current as any
    if (mv?.canActivateAR) {
      mv.activateAR()
    }
  }

  return (
    <>
      <button onClick={handleAR}>View in AR</button>
      <model-viewer
        ref={modelViewerRef}
        src={glbPath}
        ios-src={usdzPath}
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{ width: 0, height: 0, position: 'absolute' }}
      />
    </>
  )
}
```

### Pattern 4: Mutable Refs for Animation (Not React State)

**What:** Any value that changes per frame (rotation, position, opacity during transitions) must be mutated via `useRef` inside `useFrame`, never via `useState`. React state triggers re-renders; at 60fps that would be 60 re-renders per second, killing performance. Three.js object properties are mutable by design.

**When to use:** All animations, camera movements, and per-frame updates inside the R3F Canvas.

**Trade-offs:** Bypasses React's declarative model. Values changed via refs are invisible to React DevTools. This is the correct pattern for R3F -- it is how the library is designed to work.

## Data Flow

### Page Load Flow

```
User navigates to URL
    |
    v
React Router resolves route
    |
    +-- Gallery page? --> Read static data --> Render thumbnail grid
    |                                              |
    |                                         (hover card)
    |                                              |
    |                                         useGLTF.preload(modelPath)
    |
    +-- Trophy detail? --> Read static data --> Mount TrophyViewer
    |                                              |
    |                                         <Canvas> mounts
    |                                              |
    |                                         <Suspense> shows spinner
    |                                              |
    |                                         useGLTF loads .glb (async)
    |                                         <Environment> loads .hdr (async)
    |                                              |
    |                                         Both loaded --> Scene renders at 60fps
    |                                              |
    |                                         model-viewer loads same .glb (cached)
    |
    +-- Client portal? --> Show PasscodeEntry
                               |
                          User enters code
                               |
                          SHA-256 hash --> compare to stored hash
                               |
                          Match? --> localStorage.set() --> Show project
                          No match? --> Increment attempts --> Show error
                               |
                          5 failures --> Lockout message
```

### AR Activation Flow

```
User taps "View in AR"
    |
    v
ARButton calls modelViewerRef.activateAR()
    |
    v
model-viewer detects platform
    |
    +-- Android Chrome? --> Try WebXR (browser-based AR)
    |       |                   |
    |       |              Fail? --> Try Scene Viewer (native Android app)
    |       |
    +-- iOS Safari? --> Has ios-src USDZ?
            |              |
            +-- Yes --> Launch Quick Look with provided .usdz
            |
            +-- No  --> Auto-generate USDZ from .glb --> Launch Quick Look
```

### State Management

This application does not need a state management library. State is minimal and local:

```
Static Data (build-time)              Runtime State (per-component)
+------------------------+            +----------------------------------+
| projects.ts            |            | PasscodeEntry: attempts count    |
|   - ClientProject[]    |            | PasscodeEntry: lockout timer     |
| showcase.ts            |            | Gallery: (none -- pure render)   |
|   - PublicTrophy[]     |            | TrophyViewer: loading state      |
+------------------------+            |   (handled by Suspense)          |
                                      | OrbitControls: camera position   |
Browser Storage                       |   (internal to drei)             |
+------------------------+            | useFrame: animation refs         |
| localStorage           |            |   (mutable refs, not state)      |
|   - passcode sessions  |            +----------------------------------+
+------------------------+
```

**No Zustand, no Redux, no Context API for global state.** The data is static. The passcode session is in localStorage. The 3D scene state is in Three.js refs. React state is only used for UI toggles (e.g., expanded/collapsed design options). This simplicity is a feature, not a limitation.

### Key Data Flows

1. **Gallery to Detail:** User clicks trophy card --> React Router navigates to `/trophy/:slug` --> Page component reads `slug` param --> Looks up trophy from static data array --> Passes `modelPath` and `metalPreset` to `TrophyViewer`.

2. **Client Authentication:** User visits `/project/:code` --> React Router resolves `code` param --> Check localStorage for valid session --> If no session, show PasscodeEntry --> User enters code --> SHA-256 hash --> Compare against `project.passcode` --> Match sets localStorage --> Re-render shows project content.

3. **Model Loading:** `TrophyModel` mounts inside Canvas --> `useGLTF(modelPath)` suspends --> Draco decoder loads (first time only, then cached) --> .glb downloads --> Geometry + materials returned --> Component traverses mesh nodes --> Applies `MeshPhysicalMaterial` with preset values --> Mesh renders into scene.

4. **AR Launch:** User taps AR button --> `modelViewerRef.activateAR()` called --> model-viewer checks `ar-modes` priority --> Platform-appropriate AR experience launches --> User exits AR --> Returns to browser --> R3F scene still rendered.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-20 trophies (MVP) | Static TypeScript data files. All models in `/public/models/`. Single deploy per content update. This is the right approach. |
| 20-100 trophies | Static data files still work but get tedious. Consider a JSON file per project loaded at runtime, or a simple headless CMS (Contentful free tier, Sanity). Models still static in `/public/`. |
| 100+ trophies | Need a CMS or admin UI. Consider moving models to cloud storage (Cloudflare R2, S3) with CDN. Gallery needs pagination or virtual scrolling. Thumbnails need lazy loading with IntersectionObserver. |

### Scaling Priorities

1. **First bottleneck: Model file size on mobile networks.** A 5 MB .glb on a slow 4G connection takes 3-5 seconds. Draco compression is mandatory. Consider LOD (Level of Detail) variants for gallery preview vs. detail view if models are complex. This is a content pipeline concern, not an architecture change.

2. **Second bottleneck: Vercel bandwidth limits.** Free tier is 100 GB/month. Each trophy view is ~7 MB (model + HDRI + thumbnails). That is roughly 14,000 views/month before hitting limits. If traffic grows, move static assets to Cloudflare R2 (free egress) or upgrade Vercel plan.

3. **Third bottleneck: Content management friction.** Adding a trophy requires editing TypeScript, committing, and deploying. Acceptable for a solo designer managing <20 trophies. Not acceptable if non-developers need to manage content. At that point, introduce a headless CMS.

## Anti-Patterns

### Anti-Pattern 1: React State for Per-Frame Updates

**What people do:** Use `useState` to track rotation, position, or opacity that changes every frame inside the R3F Canvas.
**Why it is wrong:** Each `setState` triggers a React re-render. At 60fps, that is 60 re-renders per second. React reconciliation is fast but not free -- this causes frame drops on mobile, especially with post-processing enabled.
**Do this instead:** Use `useRef` and mutate the Three.js object directly in `useFrame`. React never needs to know about per-frame values.

### Anti-Pattern 2: Loading HDRI from CDN Presets in Production

**What people do:** Use `<Environment preset="studio" />` which loads from a public CDN (polyhaven CDN via drei).
**Why it is wrong:** External CDN dependency. Unpredictable latency. No cache control. CDN could go down. File could change between versions of drei.
**Do this instead:** Download the .hdr file, place it in `/public/hdri/`, and reference it locally: `<Environment files="/hdri/studio.hdr" />`. Full control over the asset.

### Anti-Pattern 3: Rendering model-viewer Visibly Alongside R3F

**What people do:** Show both the R3F Canvas and a visible model-viewer on the same page, giving the user two 3D viewers.
**Why it is wrong:** Two WebGL contexts running simultaneously. Double GPU cost. Confusing UX. Visual inconsistency between the two renderers (different materials, lighting, tone mapping).
**Do this instead:** R3F is the visible viewer. model-viewer is hidden (zero-size) and exists only as the AR trigger mechanism. Only one renderer is active at a time.

### Anti-Pattern 4: Putting All Components Inside a Single Canvas

**What people do:** Try to render HTML UI elements (trophy name, material selector, back button) inside the R3F Canvas using drei's Html component.
**Why it is wrong:** `<Html>` inside Canvas is a CSS3DRenderer overlay. It works but fights against normal DOM layout, breaks accessibility, complicates responsive design, and cannot use standard CSS features reliably.
**Do this instead:** Keep UI outside the Canvas. The Canvas is a self-contained viewport for the 3D scene. Overlay UI elements on top of the Canvas using standard CSS `position: absolute` or flexbox layout. This gives full DOM/CSS control for the UI and full Three.js control for the 3D scene.

### Anti-Pattern 5: Uncapped Pixel Ratio on Mobile

**What people do:** Use `window.devicePixelRatio` without capping, resulting in 3x rendering on high-DPI phones.
**Why it is wrong:** 3x pixel ratio means 9x the pixels to render compared to 1x. On an iPhone 15 Pro Max, this is 2796x1290 at 3x = over 10 million pixels per frame. Bloom and post-processing multiply this cost. Frame rate drops to 30fps or worse.
**Do this instead:** Cap at 2x: `pixelRatio: Math.min(window.devicePixelRatio, 2)`. The visual difference between 2x and 3x is negligible on phone-sized screens. The performance difference is dramatic.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel | Git push triggers auto-deploy. Static site, no serverless functions for MVP. | Framework preset: Vite. Output dir: `dist`. Free tier: 100 GB bandwidth/month. |
| Poly Haven HDRIs | Downloaded at build time, bundled in `/public/hdri/`. No runtime dependency. | Use 2K .hdr for mobile. CC0 license. |
| Google Fonts | `<link>` in `index.html` for Playfair Display + Inter. | Preconnect to `fonts.googleapis.com` for faster load. |
| model-viewer CDN | Import `@google/model-viewer` as npm package (bundled), not CDN script tag. | Avoids external runtime dependency. Bundled with the app. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pages <-> Data | Direct import of static TS arrays | No async. No API. Build-time resolution. Pages import from `data/` and filter by slug/code. |
| Pages <-> Viewer | Props (modelPath, metalPreset, dimensions) | The viewer is a controlled component. It receives what to render, not where to find it. |
| TrophyViewer <-> TrophyScene | React component composition inside Canvas | TrophyViewer owns the Canvas and Suspense boundary. TrophyScene owns everything inside the scene graph. |
| TrophyScene <-> TrophyModel | Props (path, preset) | TrophyModel is a leaf component. It loads one model and applies one material preset. TrophyScene composes it with environment, shadows, controls. |
| ARButton <-> model-viewer | Ref + programmatic method call | ARButton renders the hidden `<model-viewer>` and calls `.activateAR()` on user interaction. No data flows back -- AR is a fire-and-forget handoff to the native platform. |
| PasscodeEntry <-> localStorage | Read/write via utility functions in `utils/auth.ts` | Passcode session persists across page reloads. Validation logic isolated in auth utility, not scattered across components. |

## Build Order (Dependency Graph)

The component dependency graph determines what must be built first:

```
Phase 1: Foundation + Render Quality
    types/index.ts (data types)
    materials/metalPresets.ts (material configs)
    viewer/TrophyModel.tsx (model loading + material application)
    viewer/TrophyScene.tsx (scene composition)
    viewer/TrophyViewer.tsx (Canvas wrapper)
    styles/globals.css (dark theme tokens)
    -- Validates: render quality on real hardware (the #1 risk)

Phase 2: AR Integration
    viewer/ARButton.tsx (model-viewer AR handoff)
    -- Depends on: Phase 1 (needs a working viewer page to embed AR)
    -- Validates: cross-platform AR on real iPhone + Android

Phase 3: Public Gallery
    data/showcase.ts (public trophy data)
    components/TrophyCard.tsx (gallery card)
    components/Header.tsx (navigation)
    pages/PublicGallery.tsx (gallery grid)
    pages/TrophyDetail.tsx (viewer page + AR)
    App.tsx (router setup)
    -- Depends on: Phase 1 (viewer), Phase 2 (AR button)
    -- Validates: full user flow from gallery to 3D to AR

Phase 4: Client Portal
    data/projects.ts (client project data with hashed passcodes)
    utils/auth.ts (SHA-256 hashing, validation, rate limiting)
    components/PasscodeEntry.tsx (auth UI)
    components/DesignOption.tsx (expandable option cards)
    pages/ClientPortal.tsx (passcode gate + options)
    pages/ClientDesign.tsx (viewer for client iterations)
    -- Depends on: Phase 3 (router, viewer, card components)
    -- Validates: authenticated client flow end-to-end

Phase 5: Polish + Content
    Loading states, transitions, responsive refinements
    Real .glb files from Cinema 4D
    Hover preloading on gallery cards
    QR code generation utility
    -- Depends on: Phase 4 (all features exist to polish)

Phase 6: Deploy
    Vercel configuration, custom domain, first client test
    -- Depends on: Phase 5 (production-ready content)
```

**Why this order:** Render quality is the highest-risk, highest-value concern. If metals do not look photorealistic in the browser, the product has no value. Building the viewer first (Phase 1) validates this assumption on real hardware before investing in galleries, routing, and authentication. Each subsequent phase adds a layer that depends on the previous one, with no circular dependencies.

## Sources

- [React Three Fiber Documentation](https://r3f.docs.pmnd.rs/) -- Official R3F docs, scaling performance guide [HIGH confidence]
- [React Three Fiber: Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) -- On-demand rendering, visual regression, instancing [HIGH confidence]
- [model-viewer AR Documentation](https://modelviewer.dev/examples/augmentedreality/) -- AR attributes, ar-modes, Quick Look, WebXR [HIGH confidence]
- [model-viewer Official Docs](https://modelviewer.dev/docs/) -- Web component API [HIGH confidence]
- [High-Performance 3D Product Viewers with Three.js + React](https://dev.to/kellythomas/how-to-create-high-performance-3d-product-viewers-using-threejs-react-for-modern-ecommerce-stores-5f7p) -- Architecture patterns, performance optimization [MEDIUM confidence]
- [From Flat to Spatial: 3D Product Grid with R3F (Codrops)](https://tympanus.net/codrops/2026/02/24/from-flat-to-spatial-creating-a-3d-product-grid-with-react-three-fiber/) -- Production R3F patterns, state management [MEDIUM confidence]
- [Building Efficient Three.js Scenes (Codrops)](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) -- Performance while maintaining quality [MEDIUM confidence]
- [Vercel: Add 3D to Web Projects with R3F](https://vercel.com/blog/add-3d-to-your-web-projects-with-v0-and-react-three-fiber) -- Vercel + R3F integration [MEDIUM confidence]
- [model-viewer-react (GitHub)](https://github.com/devhims/model-viewer-react) -- React wrapper patterns for model-viewer [LOW confidence -- reference only]
- [100 Three.js Tips That Actually Improve Performance](https://www.utsubo.com/blog/threejs-best-practices-100-tips) -- Performance tips compilation [MEDIUM confidence]
- Thomas Lyte `_research/` documents (architecture-overview.md, render-quality-research.md, ios-ar-compatibility.md, github-repos-and-tech-stack.md, workflow.md, cinema4d-export-pipeline.md) -- Project-specific prior research [HIGH confidence]

---
*Architecture research for: Thomas Lyte 3D Trophy Gallery & AR Viewer*
*Researched: 2026-03-26*
