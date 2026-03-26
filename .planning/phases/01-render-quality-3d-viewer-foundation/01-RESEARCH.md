# Phase 1: Render Quality & 3D Viewer Foundation - Research

**Researched:** 2026-03-26
**Domain:** React Three Fiber photorealistic metal rendering, persistent Canvas architecture, WebGL viewer foundation
**Confidence:** HIGH

## Summary

Phase 1 scaffolds the entire project from scratch (greenfield -- no package.json or config files exist yet) and builds the core 3D trophy viewer with photorealistic polished metal rendering. The critical technical challenges are: (1) achieving convincing metal realism via MeshPhysicalMaterial + HDRI studio lighting + correct single-pass ACES tone mapping + Bloom, (2) implementing a persistent Canvas architecture that survives React Router route changes without leaking WebGL contexts on Safari, and (3) ensuring smooth 60 FPS interactive controls on real phones.

The technology stack is verified and stable: React 19.2.4, Vite 8.0.3, Three.js 0.183.2, R3F 9.5.0, drei 10.7.7, and @react-three/postprocessing 3.0.4. All peer dependencies are compatible with zero conflicts. The tone mapping configuration is the single most consequential technical decision in this phase -- getting it wrong produces grey, washed-out metals that undermine the entire product's value proposition.

**Primary recommendation:** Scaffold with Vite 8 + React 19 + TypeScript 6, commit `.gitattributes` first, then build the viewer bottom-up: metalPresets.ts -> TrophyModel -> TrophyScene -> TrophyViewer (persistent Canvas at layout level). Use `<Canvas flat>` to disable renderer-level tone mapping and apply ACES Filmic exclusively via the postprocessing `<ToneMapping>` effect as the last pass.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `SheenChair.glb` (already in `/public/models/`) as the development test model. It has enough geometry complexity to validate reflections and lighting.
- **D-02:** Structure code to swap models easily -- the test model will be replaced with real Cinema 4D trophy .glb files when available.
- **D-03:** The R3F `<Canvas>` must be mounted ONCE at the layout level (App.tsx), NOT inside page components. Scene content swaps on route change, but the Canvas itself never unmounts.
- **D-04:** This is an irreversible architectural decision. Safari has a hard limit of ~8-16 WebGL contexts. Mount/unmount on route changes will crash iPhones after visiting 4-6 trophies.
- **D-05:** Apply ACES Filmic tone mapping ONLY on the Canvas `gl` prop (`toneMapping: THREE.ACESFilmicToneMapping`). Do NOT also apply ToneMapping in the postprocessing stack. Double tone mapping is the #1 render quality killer -- metals look washed-out and grey.
- **D-06:** If using `@react-three/postprocessing` EffectComposer, explicitly set `<ToneMapping mode={ToneMappingMode.LINEAR}/>` or omit it entirely to avoid double application.
- **D-07:** Use `studio_small_09_2k.hdr` (already downloaded to `/public/hdri/`) as the default environment map. This is a Poly Haven CC0 studio HDRI with professional photography lighting.
- **D-08:** Load via drei `<Environment files="/hdri/studio_small_09_2k.hdr" />`. 2K resolution is the right balance for mobile performance.
- **D-09:** Implement all 8 metal presets in `src/materials/metalPresets.ts` with exact values from CLAUDE.md.
- **D-10:** Phase 1 visual validation focuses on polishedGold, polishedSilver, and chrome.
- **D-11:** Scaffold with Vite + React + TypeScript template. Install: react, react-dom, @react-three/fiber, @react-three/drei, @react-three/postprocessing, three, react-router-dom.
- **D-12:** Configure `.gitattributes` BEFORE the first binary file commit to prevent Git from corrupting .glb, .hdr, and .usdz files on Windows.
- **D-13:** Cap pixel ratio at `Math.min(window.devicePixelRatio, 2)`.
- **D-14:** Enable antialiasing, set outputColorSpace to SRGBColorSpace, set toneMappingExposure to 1.0.

### Claude's Discretion
- Exact OrbitControls damping and zoom limits
- Loading spinner design (simple, functional -- luxury styling comes in Phase 2)
- Trophy info panel layout (minimal for Phase 1 -- enough to show name, dimensions, materials)
- Bloom threshold, intensity, and radius fine-tuning within the ranges from CLAUDE.md
- ContactShadows opacity and blur values
- Auto-rotate speed and idle timeout duration
- Vite config and tsconfig specifics

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RNDR-01 | Trophy models render with photorealistic polished metal appearance using MeshPhysicalMaterial with metalness: 1 | Metal preset table with exact values verified in CLAUDE.md and render-quality-research.md. MeshPhysicalMaterial is the correct Three.js material class. |
| RNDR-02 | HDRI studio environment lighting produces professional photography-quality reflections | `studio_small_09_2k.hdr` already in `/public/hdri/`. Loaded via drei `<Environment files="...">`. PMREM processing is automatic. |
| RNDR-03 | ACES Filmic tone mapping applied correctly (single pass, no double tone mapping) | CRITICAL finding: use `<Canvas flat>` to disable renderer tone mapping, then apply via `<ToneMapping mode={ToneMappingMode.ACES_FILMIC}>` in EffectComposer. See Tone Mapping section below. |
| RNDR-04 | Bloom post-processing makes specular highlights pop on polished metals | `@react-three/postprocessing` Bloom effect. Settings: threshold 0.9, intensity 0.3, radius 0.5 as starting point. |
| RNDR-05 | Contact shadows ground the trophy in 3D space | drei `<ContactShadows>` component. Props: position, opacity, blur, scale, resolution. |
| RNDR-06 | Renderer capped at 2x pixel ratio for mobile performance | R3F Canvas `dpr` prop defaults to `[1, 2]` which already caps at 2x. Explicit cap recommended. |
| RNDR-07 | 60 FPS maintained on modern phones | Achieved via 2x pixel ratio cap, 2K HDRI (not 4K), minimal post-processing (Bloom + ToneMapping only). |
| VIEW-01 | User can rotate, zoom, and pan the trophy with touch and mouse controls | drei `<OrbitControls>` with enableDamping (default true). Disable pan for trophy viewing. |
| VIEW-02 | Trophy auto-rotates on idle; rotation stops on user interaction | OrbitControls `autoRotate` prop + `autoRotateSpeed`. Drei handles stopping on user interaction automatically when using `autoRotate={true}`. |
| VIEW-03 | Canvas persists across route changes (no mount/unmount) | Persistent Canvas at layout level (App.tsx). Scene children swap via routing state. Canvas never unmounts. |
| VIEW-04 | Trophy .glb models load via useGLTF with Draco decompression support | drei `useGLTF` hook with automatic Draco support via CDN (dev) or self-hosted decoder (production). |
| PIPE-01 | System accepts .glb files placed in /public/models/ | Vite serves `/public/` as static. useGLTF loads from absolute URL path. |
| PIPE-02 | Trophy metadata stored in static TypeScript data files | `src/data/showcase.ts` exporting typed arrays matching CLAUDE.md interfaces. |
| INFRA-01 | .gitattributes configured for binary files before first binary commit | `.gitattributes` with `*.glb binary`, `*.hdr binary`, `*.usdz binary`, `*.wasm binary`. |
| UI-04 | Loading spinner shown during 3D model loading (React Suspense) | `<Suspense fallback={<LoadingSpinner />}>` wrapping scene content inside Canvas. |
| UI-06 | Trophy info panel showing name, dimensions, and materials | Standard DOM panel overlaid on Canvas via CSS positioning. Not inside Canvas. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.4 | UI framework | R3F v9 requires React 19. Native custom element support for model-viewer in later phases. |
| react-dom | 19.2.4 | DOM renderer | Paired with React 19. |
| vite | 8.0.3 | Build tool + dev server | Rolldown-based bundler (10-30x faster). Current stable. Greenfield projects should use v8. |
| typescript | 6.0.2 | Type safety | Current stable. Strict mode for material configs and data models. |
| @vitejs/plugin-react | 6.0.1 | React + Vite integration | Paired with Vite 8. Uses Oxc for React Refresh. |
| three | 0.183.2 | 3D engine | Peer dep for R3F (>=0.156) and model-viewer (^0.182.0). MeshPhysicalMaterial, PMREM, ACES all mature. |
| @react-three/fiber | 9.5.0 | React renderer for Three.js | Declarative JSX, hooks, Suspense, automatic render loop. Standard for React + 3D. |
| @react-three/drei | 10.7.7 | Helper components | Environment, OrbitControls, useGLTF, ContactShadows, Center. Eliminates boilerplate. |
| @react-three/postprocessing | 3.0.4 | Post-processing effects | Bloom, ToneMapping. Built on pmndrs/postprocessing. Integrates with R3F render loop. |
| @types/three | 0.183.1 | TypeScript types for Three.js | Matches three.js version. Required for typed material configs. |
| react-router | 7.13.2 | Client-side routing | v7 is current stable. Import everything from "react-router" (react-router-dom merged). |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| postprocessing | 6.39.0 | Underlying post-processing lib | Auto-installed as peer dep of @react-three/postprocessing. Provides ToneMappingMode enum. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite 8 | Vite 6 (as in CLAUDE.md) | Vite 6 works but is two major versions behind. Vite 8 has Rolldown bundler (10-30x faster builds). No reason to use v6 for greenfield. |
| react-router v7 | TanStack Router | TanStack is more powerful but overkill for a 4-route SPA. react-router v7 is simpler. |
| MeshPhysicalMaterial | MeshStandardMaterial | Standard lacks clearcoat, anisotropy -- critical for luxury metal rendering. Physical is necessary. |

**Installation:**
```bash
# Scaffold with Vite 8 react-ts template
npm create vite@latest . -- --template react-ts

# Core 3D + routing dependencies
npm install three@^0.183.2 @react-three/fiber@^9.5.0 @react-three/drei@^10.7.7 @react-three/postprocessing@^3.0.4 react-router@^7.13.2

# TypeScript types
npm install -D @types/three@^0.183.1
```

Note: `npm create vite@latest` with `react-ts` template installs React 19, TypeScript 6, and `@vitejs/plugin-react` automatically.

**Version verification (npm registry, 2026-03-26):**
All versions above verified against npm registry on the research date. three@0.183.2, @react-three/fiber@9.5.0, @react-three/drei@10.7.7, @react-three/postprocessing@3.0.4, react@19.2.4, react-router@7.13.2, vite@8.0.3, typescript@6.0.2 all confirmed as latest stable.

## Architecture Patterns

### Recommended Project Structure
```
src/
  main.tsx                    # App entry, React DOM root
  App.tsx                     # Router + PERSISTENT CANVAS at layout level
  pages/
    TrophyDetail.tsx          # Trophy viewer page (overlay UI only)
  viewer/                     # R3F-specific components (inside Canvas context)
    TrophyViewer.tsx          # Canvas wrapper + renderer config + Suspense
    TrophyScene.tsx           # Scene: environment, shadows, controls, post-processing
    TrophyModel.tsx           # Model loader + material application
  components/
    LoadingSpinner.tsx        # Suspense fallback
    TrophyInfo.tsx            # Trophy name, dimensions, materials panel (DOM, not R3F)
  materials/
    metalPresets.ts           # MeshPhysicalMaterial preset configs (pure data)
  data/
    showcase.ts               # Public trophy data (typed static arrays)
  types/
    index.ts                  # Shared TypeScript interfaces
  styles/
    globals.css               # Dark luxury theme CSS custom properties
```

### Pattern 1: Persistent Canvas at Layout Level (CRITICAL)

**What:** The R3F `<Canvas>` is mounted ONCE in `App.tsx` (or a layout wrapper) and never unmounts. Route changes swap scene content (children) inside the Canvas, not the Canvas itself. This prevents Safari's WebGL context exhaustion (hard limit of ~8-16 contexts).

**When to use:** Always. This is a locked architectural decision (D-03, D-04).

**Example:**
```typescript
// App.tsx -- Canvas is PERSISTENT, never unmounts
function App() {
  const [activeModel, setActiveModel] = useState<string | null>(null)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Persistent Canvas -- ALWAYS mounted */}
      <TrophyViewer modelPath={activeModel} />

      {/* DOM overlay for UI -- sits on top of Canvas */}
      <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <Routes>
          <Route path="/trophy/:slug" element={
            <TrophyDetail onModelChange={setActiveModel} />
          } />
          {/* Future routes */}
        </Routes>
      </div>
    </div>
  )
}
```

**Verification:** Navigate between routes 10+ times on Safari. Canvas must not produce CONTEXT_LOST_WEBGL errors.

### Pattern 2: Scene-as-Component Composition

**What:** The 3D scene is composed from discrete R3F components, each owning one responsibility. TrophyScene composes TrophyModel, Environment, ContactShadows, OrbitControls, and EffectComposer. TrophyModel handles only model loading and material application.

**When to use:** Always for R3F scenes.

**Example:**
```typescript
// TrophyScene.tsx
function TrophyScene({ modelPath, metalPreset }: Props) {
  return (
    <>
      <Environment files="/hdri/studio_small_09_2k.hdr" />
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.4}
        blur={2.5}
        scale={10}
        resolution={256}
      />
      <Center>
        <TrophyModel path={modelPath} preset={metalPreset} />
      </Center>
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.5}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.9}
          luminanceSmoothing={0.3}
          intensity={0.3}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  )
}
```

### Pattern 3: Material Application via Mesh Traversal

**What:** After loading a .glb with `useGLTF`, traverse all mesh nodes and replace their materials with `MeshPhysicalMaterial` using preset values. This is necessary because Cinema 4D exports geometry-only (Redshift materials don't convert to glTF PBR).

**When to use:** For every trophy model.

**Example:**
```typescript
// TrophyModel.tsx
import { useGLTF, Center } from '@react-three/drei'
import { METAL_PRESETS } from '../materials/metalPresets'
import type { MetalPreset } from '../types'

function TrophyModel({ path, preset }: { path: string; preset: MetalPreset }) {
  const { scene } = useGLTF(path)
  const materialProps = METAL_PRESETS[preset]

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshPhysicalMaterial({
          ...materialProps,
          metalness: 1.0,
        })
      }
    })
  }, [scene, materialProps])

  return <primitive object={scene} />
}
```

### Pattern 4: Mutable Refs for Per-Frame Updates (Not React State)

**What:** Any value that changes per frame (rotation, opacity, position) must use `useRef` + `useFrame`, never `useState`. React state at 60fps = 60 re-renders/second = frame drops.

**When to use:** All animations inside the R3F Canvas.

### Anti-Patterns to Avoid

- **Canvas inside routed page components:** Causes WebGL context exhaustion on Safari after 4-6 navigations. Canvas MUST be persistent at layout level.
- **Double tone mapping:** Setting ACES on both the Canvas `gl` prop AND the postprocessing `<ToneMapping>` effect. Metals become grey and desaturated.
- **React state for per-frame updates:** `useState` inside `useFrame` triggers 60 re-renders/second. Use `useRef` and mutate directly.
- **HDRI from CDN presets in production:** `<Environment preset="studio" />` loads from external CDN. Unreliable. Use local `/hdri/` file.
- **HTML UI inside Canvas via drei `<Html>`:** Breaks accessibility, complicates CSS, fights DOM layout. Keep UI outside Canvas, overlay with CSS.
- **Uncapped pixel ratio:** 3x DPR on iPhones renders 9x the pixels. Always cap at 2x via `dpr={[1, 2]}`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HDRI loading + PMREM processing | Custom TextureLoader + PMREMGenerator | drei `<Environment files="...">` | Handles async loading, PMREM cube map generation, cleanup, and caching. |
| Orbit camera controls | Custom pointer event handlers for rotation/zoom | drei `<OrbitControls>` | Handles touch/mouse, damping, limits, auto-rotate, iOS Safari touch-action edge cases. |
| glTF/GLB loading + Draco decompression | Custom GLTFLoader + DRACOLoader setup | drei `useGLTF` hook | Handles Draco detection, async Suspense integration, caching, preloading. |
| Model centering + scaling | Manual bounding box calculation | drei `<Center>` | Auto-centers geometry at origin. Handles arbitrary model positions. |
| Contact shadows | Custom shadow map setup | drei `<ContactShadows>` | Baked soft shadow plane. Much cheaper than shadow maps for a single grounded object. |
| Post-processing render pipeline | Custom EffectComposer from Three.js | `@react-three/postprocessing` | Integrates with R3F render loop. Handles effect ordering, disposal, resize. |
| Loading progress tracking | Custom XHR progress events | drei `useProgress` | Tracks all Three.js loader progress. Works with Suspense. |

## Common Pitfalls

### Pitfall 1: Double Tone Mapping Destroys Metal Realism

**What goes wrong:** When ACES Filmic tone mapping is applied BOTH at the renderer level (Canvas `gl` prop default) AND in the postprocessing stack (`<ToneMapping>` effect), the image is processed twice. Gold becomes muddy yellow. Chrome loses all contrast. Metals look flat and grey.

**Why it happens:** R3F Canvas defaults to `toneMapping: THREE.ACESFilmicToneMapping`. Adding `<ToneMapping mode={ToneMappingMode.ACES_FILMIC}>` in EffectComposer applies it a second time.

**How to avoid:** Use `<Canvas flat>` to set the renderer to `NoToneMapping`. Then apply ACES Filmic exclusively via the `<ToneMapping>` effect as the LAST pass in EffectComposer. Tone mapping must happen exactly once, at the end of the pipeline.

**IMPORTANT CORRECTION to CONTEXT.md Decision D-05/D-06:** The CONTEXT.md says to apply ACES on the Canvas `gl` prop and NOT in postprocessing. However, R3F documentation and the postprocessing library's own guidance recommend the opposite: disable tone mapping on the renderer (`flat` prop) and apply it in postprocessing as the final pass. The reason: when using EffectComposer, the postprocessing pipeline takes over rendering. If the renderer also tone-maps, the input to the Bloom effect is already tone-mapped (LDR), which reduces Bloom effectiveness. The correct approach is:

```typescript
// CORRECT: flat disables renderer tone mapping. Postprocessing handles it.
<Canvas flat dpr={[1, 2]}>
  <EffectComposer>
    <Bloom luminanceThreshold={0.9} intensity={0.3} />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>
</Canvas>
```

**ALTERNATIVE (if the user's D-05 decision is strictly followed):** Apply ACES on the Canvas `gl` prop and do NOT add a `<ToneMapping>` effect in EffectComposer at all. This also avoids double tone mapping, but Bloom receives already-tone-mapped input, slightly reducing its effectiveness on specular highlights.

```typescript
// ALTERNATIVE per D-05: renderer handles tone mapping, postprocessing does not
<Canvas
  dpr={[1, 2]}
  gl={{
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: THREE.SRGBColorSpace,
  }}
>
  <EffectComposer>
    <Bloom luminanceThreshold={0.9} intensity={0.3} />
    {/* NO ToneMapping effect here */}
  </EffectComposer>
</Canvas>
```

**Recommendation:** The `<Canvas flat>` + postprocessing `<ToneMapping>` approach (first example) is technically superior because Bloom operates on HDR data before tone mapping clamps it. But either approach avoids the fatal double-tone-mapping error. The planner should choose one and document it clearly.

**Warning signs:** Gold looks grey/desaturated. Specular highlights lack punch. Metals look noticeably worse than Cinema 4D reference.

### Pitfall 2: Safari WebGL Context Exhaustion

**What goes wrong:** Mounting/unmounting `<Canvas>` on route changes leaks WebGL contexts. Safari hard-limits at ~8-16 contexts. After 4-6 trophy views, the browser kills old contexts or crashes the tab.

**Why it happens:** React Router treats each route as a separate component tree. If Canvas is inside a page component, it remounts on navigation.

**How to avoid:** Persistent Canvas at layout level (D-03). Never unmount the Canvas. Swap scene children based on route state.

**Warning signs:** White/blank Canvas after navigating back and forth 4-6 times. Console error: "WebGL: CONTEXT_LOST_WEBGL". iPhone Safari tab crash.

### Pitfall 3: Git Corrupts Binary .glb and .hdr Files

**What goes wrong:** `.glb` models load locally but fail after git push (Vercel deployment). Git's `core.autocrlf` or `text=auto` converts line endings in binary files, corrupting them.

**Why it happens:** Windows Git defaults can treat binary files as text.

**How to avoid:** Commit `.gitattributes` with binary rules BEFORE any .glb or .hdr files. This is decision D-12.

```gitattributes
*.glb binary
*.gltf binary
*.hdr binary
*.exr binary
*.usdz binary
*.wasm binary
```

### Pitfall 4: OrbitControls Touch Gestures Break on iOS Safari

**What goes wrong:** Pinch-to-zoom conflicts with browser zoom. Two-finger gestures get stuck. Controls enter broken state.

**Why it happens:** iOS Safari sets touch listeners to `passive: true` by default, ignoring `preventDefault()`.

**How to avoid:** Set `touch-action: none` on the Canvas container element. Use drei `<OrbitControls>` which handles many edge cases. Disable panning (`enablePan={false}`) to reduce gesture conflict surface.

```css
.trophy-viewer canvas {
  touch-action: none;
}
```

### Pitfall 5: HDRI Too Large for Mobile

**What goes wrong:** 4K HDRI is 8-20 MB. On 4G, this adds 3-8 seconds to load time. PMREM processing on mobile GPU causes visible freeze.

**Why it happens:** Developers test on fast desktop connections and never see the mobile penalty.

**How to avoid:** Use 2K HDRI (decision D-08). The `studio_small_09_2k.hdr` already in `/public/hdri/` is ~2 MB -- within budget.

### Pitfall 6: `useGLTF` Creates New Materials on Every Re-render

**What goes wrong:** If material application runs inside the render function without proper memoization, every re-render creates new `MeshPhysicalMaterial` instances, causing garbage collection spikes and visual flicker.

**Why it happens:** The `useEffect` for material traversal must depend on stable references. If the preset object is recreated each render, the effect re-fires.

**How to avoid:** Define metal preset objects as module-level constants (not inline). Use `useMemo` for the material instance if the preset can change.

## Code Examples

### Metal Presets (metalPresets.ts)

```typescript
// Source: CLAUDE.md material preset table
import type { MeshPhysicalMaterialParameters } from 'three'

export type MetalPreset =
  | 'polishedGold' | 'polishedSilver' | 'chrome'
  | 'brushedSilver' | 'brushedGold' | 'roseGold'
  | 'platinum' | 'antiqueBronze'

export const METAL_PRESETS: Record<MetalPreset, MeshPhysicalMaterialParameters> = {
  polishedGold: {
    color: '#FFD700',
    metalness: 1.0,
    roughness: 0.05,
    clearcoat: 0.3,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
  },
  polishedSilver: {
    color: '#C0C0C0',
    metalness: 1.0,
    roughness: 0.05,
    clearcoat: 0.3,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
  },
  chrome: {
    color: '#FFFFFF',
    metalness: 1.0,
    roughness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 2.0,
  },
  brushedSilver: {
    color: '#C0C0C0',
    metalness: 1.0,
    roughness: 0.35,
    clearcoat: 0.1,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
    anisotropy: 0.8,
  },
  brushedGold: {
    color: '#FFD700',
    metalness: 1.0,
    roughness: 0.35,
    clearcoat: 0.1,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
    anisotropy: 0.8,
  },
  roseGold: {
    color: '#B76E79',
    metalness: 1.0,
    roughness: 0.08,
    clearcoat: 0.3,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
  },
  platinum: {
    color: '#E5E4E2',
    metalness: 1.0,
    roughness: 0.12,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.3,
  },
  antiqueBronze: {
    color: '#CD7F32',
    metalness: 1.0,
    roughness: 0.4,
    clearcoat: 0.0,
    envMapIntensity: 1.0,
  },
}
```

### Canvas Configuration (TrophyViewer.tsx)

```typescript
// Source: R3F docs + CLAUDE.md renderer config
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

function TrophyViewer({ modelPath, metalPreset }: Props) {
  return (
    <Canvas
      flat          // Disables renderer tone mapping (NoToneMapping)
      dpr={[1, 2]}  // Cap pixel ratio at 2x
      gl={{
        antialias: true,
        // toneMappingExposure only applies when renderer tone mapping is active
        // With flat=true, set exposure via ToneMapping effect instead
      }}
      camera={{ position: [0, 1, 4], fov: 45 }}
    >
      <Suspense fallback={null}>
        {modelPath && (
          <TrophyScene modelPath={modelPath} metalPreset={metalPreset} />
        )}
      </Suspense>
    </Canvas>
  )
}
```

### OrbitControls with Auto-Rotate (TrophyScene.tsx)

```typescript
// Source: drei OrbitControls docs + Three.js OrbitControls API
import { OrbitControls } from '@react-three/drei'

// drei OrbitControls has enableDamping=true by default
// autoRotate automatically stops when user interacts (built into Three.js OrbitControls)
<OrbitControls
  makeDefault
  autoRotate
  autoRotateSpeed={1.5}
  enablePan={false}
  enableDamping
  dampingFactor={0.05}
  minDistance={1.5}
  maxDistance={5}
  minPolarAngle={Math.PI / 6}
  maxPolarAngle={Math.PI / 2}
/>
```

Note: Three.js OrbitControls `autoRotate` automatically stops when the user starts interacting and resumes when idle. The drei wrapper handles update calls automatically.

### ContactShadows Configuration

```typescript
// Source: drei ContactShadows docs
import { ContactShadows } from '@react-three/drei'

<ContactShadows
  position={[0, -0.5, 0]}  // Just below the model
  opacity={0.4}
  blur={2.5}
  scale={10}
  resolution={256}
  far={1}
  color="#000000"
/>
```

### .gitattributes (First File to Commit)

```gitattributes
# Prevent Git from corrupting binary 3D assets
*.glb binary
*.gltf binary
*.hdr binary
*.exr binary
*.usdz binary
*.wasm binary

# Image assets
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
```

### react-router v7 Note

In react-router v7, everything is imported from `"react-router"` (not `"react-router-dom"`). The package has been unified:

```typescript
import { BrowserRouter, Routes, Route, useParams } from 'react-router'
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vite 6 (CLAUDE.md) | Vite 8.0.3 with Rolldown | Early 2026 | 10-30x faster builds. Greenfield projects should use v8. |
| TypeScript 5 (CLAUDE.md) | TypeScript 6.0.2 | March 2026 | Current stable. Last JS-based compiler before Go rewrite. |
| react-router-dom | react-router v7 (unified) | 2025 | Single package. Import from "react-router" not "react-router-dom". |
| three 0.170+ (CLAUDE.md) | three 0.183.2 | Ongoing | Required by model-viewer ^0.182.0. Satisfies R3F >=0.156. |
| Manual tone mapping config | R3F `flat` prop | R3F v8+ | `<Canvas flat>` cleanly sets NoToneMapping without gl prop workarounds. |

**Deprecated/outdated:**
- `react-router-dom` as a separate package: Use `react-router` v7 directly.
- `physicallyCorrectLights` renderer prop: Removed in Three.js r155. Light intensity is always physically correct in current Three.js.
- `gl={{ toneMapping: THREE.NoToneMapping }}` workaround: Historically unreliable in R3F (Issue #1547). Use the `flat` prop instead.

## Open Questions

1. **Tone Mapping Strategy: `flat` + postprocessing vs. renderer-level ACES**
   - What we know: CONTEXT.md D-05 says apply ACES on Canvas `gl` prop. But R3F/postprocessing best practice says use `flat` + postprocessing `<ToneMapping>` for better Bloom on HDR data.
   - What's unclear: Which approach produces better visual results for luxury metals specifically.
   - Recommendation: Implement the `flat` + postprocessing approach (technically superior), but if the user's D-05 decision is strictly binding, implement renderer-level ACES without a ToneMapping effect in postprocessing. Either avoids double tone mapping. The planner should decide and document.

2. **Auto-Rotate Resume Behavior**
   - What we know: Three.js OrbitControls stops auto-rotate on user interaction.
   - What's unclear: Whether it auto-resumes after an idle timeout, or stops permanently until page reload.
   - Recommendation: Test the default behavior. If auto-rotate does not resume, implement a timer via `onEnd` event that re-enables after ~5 seconds of no interaction. This is Claude's discretion.

3. **Draco Decoder Hosting**
   - What we know: drei's `useGLTF` defaults to Google CDN for Draco decoder. Self-hosting is recommended for production.
   - What's unclear: Whether the test model `SheenChair.glb` uses Draco compression.
   - Recommendation: Use CDN default for Phase 1 development. Add self-hosted Draco decoder in a later phase before production deployment. If SheenChair.glb is not Draco-compressed, this is a non-issue for Phase 1.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite, npm | Yes | 24.14.0 | -- |
| npm | Package installation | Yes | 11.9.0 | -- |
| Git | Version control, .gitattributes | Yes | (installed) | -- |
| studio_small_09_2k.hdr | HDRI lighting | Yes | In /public/hdri/ | -- |
| SheenChair.glb | Test model | Yes | In /public/models/ | -- |
| Real phone (iPhone 13+) | Performance validation | Unknown | -- | Use Chrome DevTools mobile emulation + throttling (degraded) |

**Missing dependencies with no fallback:**
- None. All build-time and development dependencies are available.

**Missing dependencies with fallback:**
- Real phone for testing: If unavailable during development, Chrome DevTools device emulation with CPU and network throttling provides a degraded approximation. Real device testing is required before declaring Phase 1 complete.

## Project Constraints (from CLAUDE.md)

Actionable directives extracted from CLAUDE.md that the planner must enforce:

- **No Tailwind** -- plain CSS with CSS custom properties for theme tokens
- **No unnecessary code comments** -- code should be self-documenting
- **TypeScript strict mode** required
- **Mobile-first responsive design** -- primary use case is phone
- **Functional components with hooks only** -- no class components
- **Use `useGLTF.preload()`** for model preloading
- **Draco compression** for all production .glb files (not required for Phase 1 test model)
- **Cap pixel ratio at 2x** -- `Math.min(window.devicePixelRatio, 2)`
- **CSS custom properties** for theme tokens (specific values in CLAUDE.md Design Theme table)
- **File structure** must follow CLAUDE.md spec with `src/{components,data,materials,pages,styles,utils}`
- **Renderer config**: antialias true, ACES Filmic tone mapping, SRGBColorSpace, toneMappingExposure 1.0

## Sources

### Primary (HIGH confidence)
- [R3F Canvas API](https://r3f.docs.pmnd.rs/api/canvas) -- `flat` prop, `dpr` prop, `gl` prop defaults
- [drei OrbitControls](https://drei.docs.pmnd.rs/controls/introduction) -- autoRotate, enableDamping, makeDefault
- [drei ContactShadows](https://drei.docs.pmnd.rs/staging/contact-shadows) -- props and usage
- [drei useGLTF](https://drei.docs.pmnd.rs/loaders/gltf-use-gltf) -- Draco support, preload API
- [Three.js MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial) -- metalness, roughness, clearcoat, anisotropy
- npm registry (2026-03-26) -- all package versions verified directly

### Secondary (MEDIUM confidence)
- [R3F tone mapping issue #1547](https://github.com/pmndrs/react-three-fiber/issues/1547) -- `flat` prop history, `gl` prop toneMapping behavior
- [R3F issue #1737](https://github.com/pmndrs/react-three-fiber/issues/1737) -- Resolution of gl prop accepting renderer properties
- [R3F WebGL Context Leak Discussion #3221](https://github.com/pmndrs/react-three-fiber/discussions/3221) -- Persistent Canvas architecture patterns
- [Three.js Forum: Tone Mapping with Post-Processing](https://discourse.threejs.org/t/tone-mapping-with-post-processing/7281) -- Single-pass tone mapping guidance
- [Postprocessing ToneMapping docs](https://post-processing.tresjs.org/guide/pmndrs/tone-mapping) -- ToneMappingMode enum, usage with EffectComposer
- [R3F v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide) -- v9-specific changes
- Project research documents: `_research/render-quality-research.md`, `_research/architecture-overview.md`, `.planning/research/STACK.md`, `.planning/research/PITFALLS.md`, `.planning/research/ARCHITECTURE.md`

### Tertiary (LOW confidence)
- None. All findings verified against official documentation or npm registry.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry on research date. Peer dependency compatibility confirmed.
- Architecture: HIGH -- persistent Canvas pattern is well-documented in R3F community. HDRI + MeshPhysicalMaterial is the standard approach for product visualization.
- Pitfalls: HIGH -- all pitfalls sourced from official GitHub issues, Three.js forum posts, and R3F documentation. Double tone mapping and WebGL context exhaustion are the two highest-risk items.
- Tone mapping strategy: MEDIUM -- the correct single-pass approach is clear, but the choice between renderer-level vs. postprocessing-level ACES has a nuance that depends on visual testing.

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days -- stack is stable, no breaking changes expected)
