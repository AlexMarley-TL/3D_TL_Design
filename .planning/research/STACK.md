# Technology Stack

**Project:** 3D Trophy Gallery & AR Viewer
**Researched:** 2026-03-26
**Overall confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | ^19.2.4 | UI framework | R3F v9 requires React 19. Full custom element support means model-viewer works without wrappers. React 19 is stable (4th patch release). | HIGH |
| Vite | ^8.0.2 | Build tool & dev server | Vite 8 uses Rolldown (Rust-based bundler) for 10-30x faster builds over Vite 6. New projects should use v8 from day one. Plugin compatibility is excellent. The CLAUDE.md references Vite 6 -- upgrade to 8. | HIGH |
| TypeScript | ^6.0.2 | Type safety | TS 6.0 is the latest stable release (March 2026). Last JS-based compiler before the Go rewrite in TS 7. Strict mode for 3D material configs and data models. | HIGH |
| @vitejs/plugin-react | ^6.0.1 | React + Vite integration | v6 pairs with Vite 8. Now uses Oxc for React Refresh (Babel removed as dependency). Smaller install, faster transforms. | HIGH |

### 3D Engine & Rendering

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| three | ^0.183.2 | 3D engine | Latest stable. Peer dep for both R3F (>=0.156) and model-viewer (^0.182.0). MeshPhysicalMaterial, PMREM, ACES tonemapping all mature. WebGPU renderer available but not needed here (WebGL is sufficient for single-model product viewers). | HIGH |
| @react-three/fiber | ^9.5.0 | React renderer for Three.js | The standard for React + 3D. Declarative JSX, hooks, Suspense for loading, automatic render loop. v9 pairs with React 19. Maintained by pmndrs. | HIGH |
| @react-three/drei | ^10.7.7 | Helper components | Environment (HDRI loading), OrbitControls (camera), useGLTF (model loading), ContactShadows, Center, Float. Eliminates boilerplate. | HIGH |
| @react-three/postprocessing | ^3.0.4 | Post-processing effects | Bloom, ToneMapping (ACES Filmic), Vignette, optional SSAO. Built on pmndrs/postprocessing. Integrates with R3F's render loop. | HIGH |
| @types/three | ^0.183.1 | TypeScript types for three.js | Match the three.js version. Required for typed material configs and scene graph. | HIGH |

### AR (Cross-Platform)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @google/model-viewer | ^4.2.0 | Cross-platform AR handoff | Single web component handles Android (WebXR / Scene Viewer) and iPhone (Quick Look / USDZ auto-generation). Zero platform-detection code. React 19 has native custom element support so no wrapper needed. This is the only viable approach for iPhone AR in a web app -- WebXR does not work on iOS Safari. | HIGH |

### Routing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-router | ^7.13.2 | Client-side routing | v7 is current stable, works with React 19, supports SPA mode natively. In v7, import everything from "react-router" (react-router-dom no longer needed as separate package). Non-breaking upgrade from v6 patterns. | HIGH |

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | N/A | Static hosting + CDN | Zero-config for Vite, auto-deploy on git push, preview URLs per branch, free tier (100GB bandwidth), built-in serverless functions for future auth upgrade. | HIGH |
| Poly Haven HDRIs | N/A | Studio lighting environments | CC0 licensed, 2K/4K resolution, studio presets optimised for product photography. No alternatives needed -- Poly Haven is the standard for free professional HDRIs. | HIGH |
| Draco (via gltf-pipeline) | ^4.3.0 | GLB mesh compression | 60-80% file size reduction on .glb models. Three.js has built-in Draco decoder. Essential for meeting the <5MB per trophy budget. | HIGH |

### Development Tools

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| gltfjsx | ^6.5.3 | Generate typed R3F components from .glb files | Run once per model to get typed mesh refs and auto-Draco setup |
| gltf-pipeline | ^4.3.0 | Draco compress .glb files | Part of the Cinema 4D export pipeline, run after each C4D export |
| leva | latest | Debug UI controls during development | Tune material params (roughness, envMapIntensity, etc.) in real-time. Dev only, strip from production. |

## Version Compatibility Matrix

This is critical. These libraries have interlocking peer dependencies:

```
React 19.2.x
  |
  +-- @react-three/fiber 9.5.x  (requires react >=19 <19.3)
  |     |
  |     +-- three >=0.156  (use 0.183.x)
  |
  +-- @react-three/drei 10.7.x  (requires r3f 9.x)
  |
  +-- @react-three/postprocessing 3.0.x  (requires r3f 8.x or 9.x)
  |
  +-- react-router 7.13.x  (supports React 19)
  |
  +-- @google/model-viewer 4.2.x  (requires three ^0.182.0)

three 0.183.x satisfies BOTH:
  - R3F's >=0.156
  - model-viewer's ^0.182.0
```

No version conflicts. Pin three to ^0.183.0 to satisfy both consumers.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite 8 | Vite 6 (as in CLAUDE.md) | Vite 6 is two major versions behind. Vite 8 has 10-30x faster builds via Rolldown. No reason to start a new project on v6. |
| Build tool | Vite 8 | Next.js / Remix | Unnecessary SSR/RSC complexity for a static 3D gallery. Vite is lighter, faster, and R3F starters use it. |
| 3D engine | React Three Fiber | Plain Three.js | R3F provides declarative components, hooks, Suspense loading, pointer events. Better DX for a React app. |
| 3D engine | React Three Fiber | Babylon.js | No mature React integration. Different ecosystem. R3F has drei, postprocessing, xr as first-class companions. |
| AR | model-viewer | @react-three/xr alone | WebXR does not work on iOS Safari. model-viewer is the only web-based solution for iPhone AR via Quick Look. |
| AR | model-viewer | 8th Wall | Commercial subscription. Overkill for a product viewer with <20 trophies. |
| Styling | CSS custom properties | Tailwind CSS | Gallery is not CSS-heavy. Custom properties match the AI Design v4.0 theme. Tailwind adds unnecessary dependency and learning curve for luxury-specific visual language. |
| Routing | react-router v7 | TanStack Router | react-router v7 is simpler for a 4-route SPA. TanStack is more powerful but overkill here. |
| State | React useState/useContext | Zustand | With <20 trophies and no complex shared state, React's built-in state is sufficient. Add Zustand only if gallery filtering/sorting becomes complex post-MVP. |
| Hosting | Vercel | Azure Static Web Apps | Vercel has better Vite support and DX. Azure is the fallback if Thomas Lyte IT mandates Microsoft ecosystem. |
| WebGPU | WebGL (default) | three/webgpu import | WebGPU is production-ready in Three.js since r171, but adds complexity for zero visual benefit in a single-model viewer. WebGL is universally supported and sufficient. Consider WebGPU only for future VR gallery walkthrough. |
| TypeScript | TS 6.0 | TS 5.x | TS 6.0 is current stable. No reason to use older version for greenfield. |

## CLAUDE.md Corrections

The existing CLAUDE.md specifies some outdated versions. Corrections:

| Item | CLAUDE.md Says | Actual Current | Action |
|------|---------------|----------------|--------|
| Vite | v6 | v8.0.2 | Use Vite 8 -- 10-30x faster builds, Rolldown bundler |
| TypeScript | v5 | v6.0.2 | Use TS 6 -- current stable |
| three | v0.170+ | v0.183.2 | Use 0.183.x -- required by model-viewer ^0.182.0 |
| @react-three/xr | Listed as core dep | v6.6.29 | Demote to optional. model-viewer handles AR for both platforms. Only add xr if you want a richer Android AR experience beyond Scene Viewer. |

## Installation

```bash
# Create project
npm create vite@latest trophy-gallery -- --template react-ts

# Core dependencies
npm install react@^19.2.4 react-dom@^19.2.4 three@^0.183.2 @react-three/fiber@^9.5.0 @react-three/drei@^10.7.7 @react-three/postprocessing@^3.0.4 @google/model-viewer@^4.2.0 react-router@^7.13.2

# TypeScript types
npm install -D @types/three@^0.183.1 typescript@^6.0.2

# Dev tools (strip from production)
npm install -D gltfjsx@^6.5.3

# CLI tools for asset pipeline (run as needed, not bundled)
npx gltf-pipeline -i trophy.glb -o trophy-compressed.glb --draco.compressionLevel=7
npx gltfjsx trophy.glb --types --transform
```

Note: `@vitejs/plugin-react@^6.0.1` is included automatically by `create vite` with the `react-ts` template on Vite 8.

## Why NOT @react-three/xr in Core Dependencies

The existing research lists `@react-three/xr` as a core dependency. This is unnecessary for the MVP and potentially confusing:

1. **model-viewer already handles AR for both platforms.** On Android it triggers WebXR/Scene Viewer. On iPhone it triggers Quick Look. One component, zero platform detection code.
2. **@react-three/xr provides a richer WebXR experience** (hit testing, custom AR UI in R3F) but only works on Android Chrome. It adds complexity for a platform that model-viewer already covers.
3. **Add @react-three/xr post-MVP** only if you want custom R3F-rendered AR scenes on Android (e.g., placing the trophy with your own lighting/environment rather than the native Scene Viewer).

For MVP: model-viewer for AR. Period.

## Sources

- [@react-three/fiber npm](https://www.npmjs.com/package/@react-three/fiber) -- v9.5.0, peer deps: react >=19 <19.3, three >=0.156
- [@react-three/drei npm](https://www.npmjs.com/package/@react-three/drei) -- v10.7.7
- [@react-three/postprocessing npm](https://www.npmjs.com/package/@react-three/postprocessing) -- v3.0.4
- [@google/model-viewer npm](https://www.npmjs.com/package/@google/model-viewer) -- v4.2.0, peer dep: three ^0.182.0
- [three npm](https://www.npmjs.com/package/three) -- v0.183.2
- [react-router npm](https://www.npmjs.com/package/react-router) -- v7.13.2
- [Vite 8.0 release blog](https://vite.dev/blog/announcing-vite8) -- Rolldown bundler, 10-30x faster
- [TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) -- current stable
- [R3F fiber package.json](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/package.json) -- verified peer deps
- [model-viewer package.json](https://github.com/google/model-viewer/blob/master/packages/model-viewer/package.json) -- verified three ^0.182.0
- [React 19 custom element support](https://react.dev/blog/2024/12/05/react-19) -- native web component integration
- [Poly Haven HDRIs](https://polyhaven.com/hdris) -- CC0 studio environments
- [gltf-pipeline npm](https://www.npmjs.com/package/gltf-pipeline) -- v4.3.0, Draco compression
