# Phase 1: Render Quality & 3D Viewer Foundation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the React + Vite + TypeScript project, install all dependencies, build the core TrophyViewer with photorealistic polished metal rendering using MeshPhysicalMaterial + HDRI studio lighting + ACES tone mapping + Bloom post-processing. Interactive orbit controls with auto-rotate. Persistent Canvas architecture that survives route changes. Loading state with React Suspense. Trophy info panel. Validate rendering quality on a real phone.

Requirements: RNDR-01..07, VIEW-01..04, PIPE-01, PIPE-02, INFRA-01, UI-04, UI-06

</domain>

<decisions>
## Implementation Decisions

### Test model strategy
- **D-01:** Use `SheenChair.glb` (already in `/public/models/`) as the development test model. It has enough geometry complexity to validate reflections and lighting.
- **D-02:** Structure code to swap models easily — the test model will be replaced with real Cinema 4D trophy .glb files when available.

### Canvas persistence pattern
- **D-03:** The R3F `<Canvas>` must be mounted ONCE at the layout level (App.tsx), NOT inside page components. Scene content swaps on route change, but the Canvas itself never unmounts.
- **D-04:** This is an irreversible architectural decision. Safari has a hard limit of ~8-16 WebGL contexts. Mount/unmount on route changes will crash iPhones after visiting 4-6 trophies.

### Tone mapping configuration
- **D-05:** Apply ACES Filmic tone mapping ONLY on the Canvas `gl` prop (`toneMapping: THREE.ACESFilmicToneMapping`). Do NOT also apply ToneMapping in the postprocessing stack. Double tone mapping is the #1 render quality killer — metals look washed-out and grey.
- **D-06:** If using `@react-three/postprocessing` EffectComposer, explicitly set `<ToneMapping mode={ToneMappingMode.LINEAR}/>` or omit it entirely to avoid double application.

### HDRI selection
- **D-07:** Use `studio_small_09_2k.hdr` (already downloaded to `/public/hdri/`) as the default environment map. This is a Poly Haven CC0 studio HDRI with professional photography lighting.
- **D-08:** Load via drei `<Environment files="/hdri/studio_small_09_2k.hdr" />`. 2K resolution is the right balance for mobile performance.

### Metal preset scope
- **D-09:** Implement all 8 metal presets in `src/materials/metalPresets.ts` (polishedGold, polishedSilver, chrome, brushedSilver, brushedGold, roseGold, platinum, antiqueBronze) with exact values from CLAUDE.md.
- **D-10:** Phase 1 visual validation focuses on polishedGold, polishedSilver, and chrome — these are the most demanding and most commonly used.

### Project scaffolding
- **D-11:** Scaffold with Vite + React + TypeScript template. Install: react, react-dom, @react-three/fiber, @react-three/drei, @react-three/postprocessing, three, react-router-dom.
- **D-12:** Configure `.gitattributes` BEFORE the first binary file commit to prevent Git from corrupting .glb, .hdr, and .usdz files on Windows.

### Renderer configuration
- **D-13:** Cap pixel ratio at `Math.min(window.devicePixelRatio, 2)` — 3x kills mobile performance.
- **D-14:** Enable antialiasing, set outputColorSpace to SRGBColorSpace, set toneMappingExposure to 1.0.

### Claude's Discretion
- Exact OrbitControls damping and zoom limits
- Loading spinner design (simple, functional — luxury styling comes in Phase 2)
- Trophy info panel layout (minimal for Phase 1 — enough to show name, dimensions, materials)
- Bloom threshold, intensity, and radius fine-tuning within the ranges from CLAUDE.md
- ContactShadows opacity and blur values
- Auto-rotate speed and idle timeout duration
- Vite config and tsconfig specifics

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Rendering quality
- `_research/render-quality-research.md` — Deep dive into MeshPhysicalMaterial, HDRI, post-processing, and photorealistic metal rendering techniques
- `CLAUDE.md` §Rendering — Metal preset values table, lighting config, post-processing settings, renderer config

### Architecture
- `_research/architecture-overview.md` — System architecture, component diagram, rendering pipeline, data structures
- `.planning/research/ARCHITECTURE.md` — Hybrid R3F + model-viewer pattern, persistent Canvas requirement, viewer/ directory separation
- `.planning/research/PITFALLS.md` — Double tone mapping, Safari WebGL context limit, .gitattributes, touch control issues

### Content pipeline
- `_research/cinema4d-export-pipeline.md` — Cinema 4D to .glb export workflow, material baking
- `CLAUDE.md` §Data Model — TypeScript interfaces for PublicTrophy, ClientProject, MetalPreset

### Stack
- `.planning/research/STACK.md` — Verified library versions, peer dependency compatibility, installation commands
- `_research/github-repos-and-tech-stack.md` — Technology decisions and evaluated repos

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/hdri/studio_small_09_2k.hdr`: Pre-downloaded Poly Haven studio HDRI — ready to use as default environment map
- `public/models/SheenChair.glb`: Test model with enough geometry to validate reflections and lighting during development

### Established Patterns
- No existing code patterns (greenfield) — this phase establishes all foundational patterns
- Directory structure already matches CLAUDE.md spec: `src/{components,data,materials,pages,styles,utils}`, `public/{models,hdri,images}`

### Integration Points
- This phase creates the foundational components that all subsequent phases build on
- TrophyViewer + TrophyScene + TrophyModel are the core 3D components reused by Phase 2 (gallery), Phase 3 (portal), and Phase 4 (production)
- metalPresets.ts is consumed by TrophyModel and any future material-related features
- Persistent Canvas architecture constrains how routing works in Phase 2+

</code_context>

<specifics>
## Specific Ideas

- Rendering quality is the #1 priority per PRD. "Client cannot distinguish from a photograph at first glance" is the target.
- Polished metals must show sharp environment reflections. Gold must have warm, accurate colour. Silver/chrome must show clean mirror-like reflections.
- The viewer should feel like professional studio photography — not a generic 3D model viewer.
- Must test on a real phone (iPhone 13+ or Samsung S21+) during this phase, not just desktop browser.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-render-quality-3d-viewer-foundation*
*Context gathered: 2026-03-26*
