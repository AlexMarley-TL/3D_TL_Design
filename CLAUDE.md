# CLAUDE.md — 3D Trophy Gallery & AR Viewer

## Project

Thomas Lyte 3D Trophy Gallery & AR Viewer. Luxury trophy manufacturer.
Web-based 3D gallery with photorealistic metal rendering and cross-platform AR.
Clients scan a QR code on a PDF deck, enter a 4-digit passcode, and view trophy designs in interactive 3D + AR on their phone.

All research and planning documents are in `_research/`. Read them for full context:
- `_research/PRD.md` — Product requirements
- `_research/workflow.md` — How it fits into the real sales process (QR codes, passcodes, deck integration)
- `_research/architecture-overview.md` — System architecture, components, data model, routes
- `_research/render-quality-research.md` — Photorealistic metal rendering (MeshPhysicalMaterial, HDRI, post-processing)
- `_research/cinema4d-export-pipeline.md` — Cinema 4D to .glb export
- `_research/github-repos-and-tech-stack.md` — Tech stack decisions and key repos
- `_research/ios-ar-compatibility.md` — iOS AR limitations and dual-platform strategy

## Tech Stack

- React 19 + Vite 6 + TypeScript 5
- React Three Fiber (`@react-three/fiber` v9)
- `@react-three/drei` v10 — Environment, OrbitControls, useGLTF, ContactShadows, Center
- `@react-three/postprocessing` v3 — Bloom, ToneMapping
- Google `<model-viewer>` v4 — cross-platform AR (handles iPhone Quick Look + Android WebXR)
- `three` v0.170+
- CSS (no Tailwind) — custom dark luxury theme
- React Router for client-side routing
- Hosted on Vercel (static site, free tier)

## Architecture

Two experiences served from the same app:

1. **Public Showcase** (no auth) — curated gallery of well-known trophies at `/`
2. **Client Portal** (4-digit passcode) — private project designs at `/project/:code`

Routes:
- `/` — Public showcase gallery grid
- `/trophy/:slug` — Public trophy 3D viewer + AR
- `/project/:code` — Client project (passcode gate → design options)
- `/project/:code/:slug` — Client iteration 3D viewer + AR

Hybrid rendering strategy:
- React Three Fiber for the main 3D viewer (full visual control)
- Google `<model-viewer>` for AR handoff (handles platform detection automatically)

## Data Model

```typescript
interface ClientProject {
  code: string;              // URL slug: "nations-2026"
  passcode: string;          // SHA-256 hashed 4-digit code
  clientName: string;
  projectName: string;
  designOptions: DesignOption[];
  dateCreated: string;
}

interface DesignOption {
  slug: string;              // "option-a-contemporary"
  name: string;              // "Option A — Contemporary"
  iterations: Iteration[];
}

interface Iteration {
  slug: string;              // "v1", "v2"
  label: string;             // "Initial concept"
  modelPath: string;         // "/models/nations-2026/option-a-v1.glb"
  usdzPath?: string;
  thumbnailPath: string;
  dimensions: { heightMm: number; widthMm: number; depthMm: number };
  materials: { primary: MetalPreset; secondary?: MetalPreset };
  dateAdded: string;
}

interface PublicTrophy {
  slug: string;
  name: string;
  description: string;
  modelPath: string;
  usdzPath?: string;
  thumbnailPath: string;
  dimensions: { heightMm: number; widthMm: number; depthMm: number };
  materials: { primary: MetalPreset; secondary?: MetalPreset };
}

type MetalPreset =
  | 'polishedGold' | 'polishedSilver' | 'chrome'
  | 'brushedSilver' | 'brushedGold' | 'roseGold'
  | 'platinum' | 'antiqueBronze';
```

MVP data is stored in static TypeScript files (`src/data/projects.ts`, `src/data/showcase.ts`). No backend database.

## Design Theme (matches AI Design v4.0)

| Token | Value |
|-------|-------|
| Primary background | `#0d0d0f` |
| Secondary background | `#161619` |
| Tertiary background | `#1e1e22` |
| Gold accent | `#c9a962` |
| Gold light | `#ddc07a` |
| Gold dark | `#a8893f` |
| Text primary | `#ffffff` |
| Text secondary | `#a0a0a8` |
| Heading font | Playfair Display (Google Fonts) |
| Body font | Inter (Google Fonts) |
| Border radius | 12px |
| Card shadow | `0 4px 24px rgba(0,0,0,0.4)` |

## Rendering — Priority #1 is Photorealistic Metals

The renders must look convincingly real. This is a luxury product visualiser, not a "good enough for web" standard.

### Material: MeshPhysicalMaterial

All metals use `MeshPhysicalMaterial` with `metalness: 1`. Key presets:

| Preset | color | roughness | clearcoat | clearcoatRoughness | envMapIntensity | anisotropy |
|--------|-------|-----------|-----------|--------------------|-----------------| -----------|
| polishedGold | `#FFD700` | 0.05 | 0.3 | 0.05 | 1.5 | — |
| polishedSilver | `#C0C0C0` | 0.05 | 0.3 | 0.05 | 1.5 | — |
| chrome | `#FFFFFF` | 0.0 | 1.0 | 0.0 | 2.0 | — |
| brushedSilver | `#C0C0C0` | 0.35 | 0.1 | 0.2 | 1.2 | 0.8 |
| brushedGold | `#FFD700` | 0.35 | 0.1 | 0.2 | 1.2 | 0.8 |
| roseGold | `#B76E79` | 0.08 | 0.3 | 0.05 | 1.5 | — |
| platinum | `#E5E4E2` | 0.12 | 0.2 | 0.1 | 1.3 | — |
| antiqueBronze | `#CD7F32` | 0.4 | 0.0 | — | 1.0 | — |

### Lighting: HDRI Studio Environment

- Use Poly Haven studio HDRIs (free, CC0): `pav_studio_03`, `photo_studio_loft_hall`, `studio_small_09`
- Load via `<Environment files="/hdri/studio.hdr" />` from drei
- 2K resolution for mobile, 4K for desktop
- Can combine HDRI with supplementary spotLight / rectAreaLight for accent

### Post-Processing

- **ACES Filmic tone mapping** — non-negotiable for realistic metals
- **Bloom** — threshold: 0.9, intensity: 0.3, radius: 0.5 (makes specular highlights pop)
- **Vignette** — subtle edge darkening (optional, cheap)
- SSAO — desktop only if needed (expensive on mobile)

### Renderer Config

```jsx
<Canvas
  gl={{
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    outputColorSpace: THREE.SRGBColorSpace,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  }}
>
```

Cap pixel ratio at 2x — 3x kills mobile performance.

## File Structure

```
3D Design/
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # Router + layout
│   ├── pages/
│   │   ├── PublicGallery.tsx      # Public showcase grid
│   │   ├── ClientPortal.tsx       # Passcode gate + design options
│   │   └── TrophyDetail.tsx       # 3D viewer + AR
│   ├── components/
│   │   ├── TrophyCard.tsx         # Gallery card (thumbnail + info)
│   │   ├── DesignOption.tsx       # Expandable option with child iterations
│   │   ├── PasscodeEntry.tsx      # 4-digit passcode input
│   │   ├── TrophyViewer.tsx       # R3F Canvas + scene wrapper
│   │   ├── TrophyScene.tsx        # Scene setup (lights, env, camera)
│   │   ├── TrophyModel.tsx        # Load + display .glb model
│   │   ├── ARButton.tsx           # model-viewer AR trigger
│   │   ├── MaterialSwitcher.tsx   # Toggle metal finishes
│   │   └── LoadingSpinner.tsx     # Loading state
│   ├── materials/
│   │   └── metalPresets.ts        # MeshPhysicalMaterial preset configs
│   ├── data/
│   │   ├── projects.ts            # Client project data (private)
│   │   └── showcase.ts            # Public trophy data
│   ├── styles/
│   │   └── globals.css            # Dark luxury theme
│   └── utils/
│       └── deviceDetection.ts     # Platform/capability detection
├── public/
│   ├── models/                    # .glb and .usdz files
│   ├── hdri/                      # Studio HDRI .hdr files
│   └── images/                    # Trophy thumbnails
├── _research/                     # Research documents (read-only reference)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                      # This file
```

## AR Strategy

model-viewer handles platform detection automatically:
- Android → WebXR first, falls back to Scene Viewer
- iPhone → Apple Quick Look with USDZ (auto-generated from .glb by model-viewer)

Pattern: The main 3D viewer uses React Three Fiber. A hidden `<model-viewer>` element on the page handles AR. The "View in AR" button triggers model-viewer's AR activation.

```html
<model-viewer src="trophy.glb" ios-src="trophy.usdz" ar ar-modes="webxr scene-viewer quick-look" />
```

## Authentication (MVP)

- 4-digit numeric passcode per client project
- Client-side validation: passcodes SHA-256 hashed in the data file
- localStorage persistence so clients don't re-enter on return visits
- Rate limiting: max 5 incorrect attempts display a lockout message
- Public showcase requires no authentication

## Performance Budget

| Asset | Target |
|-------|--------|
| Trophy .glb (Draco compressed) | < 5 MB |
| HDRI .hdr (2K) | ~2 MB |
| Trophy thumbnail | < 100 KB (WebP/JPEG) |
| JS bundle (gzipped) | < 500 KB |
| Initial page load | < 3 seconds on 4G |
| Frame rate | 60 FPS in 3D viewer |

Loading strategy: gallery shows thumbnails immediately, 3D models lazy-loaded via React Suspense, preload .glb on card hover.

## Conventions

- No Tailwind — plain CSS with CSS custom properties for theme tokens
- No unnecessary code comments — code should be self-documenting
- TypeScript strict mode
- Mobile-first responsive design
- Functional components with hooks only (no class components)
- Use `useGLTF.preload()` for model preloading
- Draco compression for all production .glb files

## Build Phases

### Phase 1 — Foundation & Render Quality Proof
Scaffold project, install deps, build TrophyViewer with gold MeshPhysicalMaterial, HDRI, bloom, ACES. Test on phone.

### Phase 2 — AR Integration
Add model-viewer, test dual-platform AR (Android WebXR + iPhone Quick Look).

### Phase 3 — Public Showcase Gallery
Gallery grid, TrophyCard, TrophyDetail page, routing, dark theme.

### Phase 4 — Client Portal
PasscodeEntry, ClientPortal page, DesignOption parent-child UI, project routes.

### Phase 5 — Polish & Content
QR code generation, responsive refinements, loading states, real .glb files from Cinema 4D.

### Phase 6 — Deploy
Vercel deployment, custom domain, first real client test.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**3D Trophy Gallery & AR Viewer**

A web-based 3D gallery and AR viewer for Thomas Lyte, a luxury trophy and silverware manufacturer. Clients scan a QR code on a PDF presentation deck, enter a 4-digit passcode, and interact with photorealistic 3D trophy models in their browser. They can project trophies life-size onto real surfaces using their phone camera. A public showcase gallery displays well-known Thomas Lyte trophies for marketing purposes.

**Core Value:** Trophy renders must look convincingly real in-browser — approaching Cinema 4D / Redshift quality with photorealistic polished metal reflections. If the rendering doesn't sell the luxury product, nothing else matters.

### Constraints

- **Tech stack**: React 19 + Vite 6 + TypeScript, React Three Fiber, drei, model-viewer for AR. No Tailwind — plain CSS.
- **Hosting**: Vercel free tier (100 GB bandwidth/month). Azure Static Web Apps as fallback if IT requires Microsoft ecosystem.
- **File size**: Trophy .glb < 5 MB (Draco compressed), HDRI < 2 MB, thumbnails < 100 KB, JS bundle < 500 KB gzipped.
- **Performance**: 60 FPS in 3D viewer, 30+ FPS in AR, < 3 second initial load on 4G.
- **Platform**: iPhone Safari (Quick Look AR), Android Chrome (WebXR AR), Desktop (3D only, no AR).
- **No backend**: Fully static site for MVP. Data in TypeScript files.
- **Pixel ratio**: Capped at 2x — 3x kills mobile performance.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
| Item | CLAUDE.md Says | Actual Current | Action |
|------|---------------|----------------|--------|
| Vite | v6 | v8.0.2 | Use Vite 8 -- 10-30x faster builds, Rolldown bundler |
| TypeScript | v5 | v6.0.2 | Use TS 6 -- current stable |
| three | v0.170+ | v0.183.2 | Use 0.183.x -- required by model-viewer ^0.182.0 |
| @react-three/xr | Listed as core dep | v6.6.29 | Demote to optional. model-viewer handles AR for both platforms. Only add xr if you want a richer Android AR experience beyond Scene Viewer. |
## Installation
# Create project
# Core dependencies
# TypeScript types
# Dev tools (strip from production)
# CLI tools for asset pipeline (run as needed, not bundled)
## Why NOT @react-three/xr in Core Dependencies
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
