# Project Research Summary

**Project:** Thomas Lyte 3D Trophy Gallery & AR Viewer
**Domain:** Web-based 3D luxury product visualiser with photorealistic metal rendering and cross-platform AR
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

This is a web-based 3D product viewer for a luxury trophy manufacturer, where clients scan a QR code on a PDF sales deck, enter a 4-digit passcode, and view trophy designs in interactive 3D with AR placement on their phone. The established approach in 2026 for this class of product is a hybrid rendering architecture: React Three Fiber (v9) for photorealistic 3D viewing with full material/lighting/post-processing control, and Google model-viewer (v4.2) as a hidden web component that handles the AR handoff to native platform experiences (Apple Quick Look on iPhone, WebXR/Scene Viewer on Android). No competitor in the bespoke trophy space offers this QR-to-AR pipeline with per-client access control and design iteration tracking. The combination of photorealistic quality, integrated sales workflow, and universal phone AR is the product's competitive moat.

The recommended stack is React 19 + Vite 8 + TypeScript 6, with three.js v0.183 as the shared 3D engine satisfying both R3F and model-viewer peer dependencies. The existing CLAUDE.md references outdated versions (Vite 6, TS 5, three v0.170) that should be upgraded; the upgrades are non-breaking and bring substantial build performance improvements (Vite 8's Rolldown bundler: 10-30x faster). The architecture is a static SPA on Vercel with four routes, static TypeScript data files (no backend), and client-side SHA-256 passcode validation. No state management library is needed -- React's built-in state handles the minimal runtime state, and Three.js refs handle per-frame animation.

The two highest risks are both Phase 1 concerns that must be resolved before any other work. First, render quality: double tone mapping (applying ACES both on the renderer and in the post-processing EffectComposer) destroys metal realism, and Cinema 4D Redshift materials export as black in glTF format. Both have documented solutions (disable renderer tone mapping when using postprocessing; export geometry only and apply materials in code). Second, Safari WebGL context exhaustion: mounting/unmounting the R3F Canvas per route change causes crashes on iPhone after 4-6 navigations. The architecture must use a single persistent Canvas from day one -- this is not retrofittable. These two risks, if unaddressed, make the product non-functional on its primary platform (iPhones held by luxury clients).

## Key Findings

### Recommended Stack

The stack is mature and well-integrated with no version conflicts. All libraries are verified against npm as of 2026-03-26. The critical constraint is that three.js must be pinned to ^0.183.0 to satisfy both R3F's `>=0.156` and model-viewer's `^0.182.0` peer dependency requirements.

**Core technologies:**
- **React 19 + Vite 8 + TypeScript 6:** Framework layer. React 19's native custom element support means model-viewer works without wrappers. Vite 8's Rolldown bundler provides 10-30x faster builds over the v6 referenced in CLAUDE.md.
- **React Three Fiber v9 + drei v10 + postprocessing v3:** 3D rendering layer. Declarative scene composition, Suspense-based model loading, HDRI environment maps, OrbitControls, Bloom, and ACES tone mapping. The pmndrs ecosystem is the standard for React + Three.js.
- **three.js v0.183:** Shared 3D engine. MeshPhysicalMaterial with metalness, roughness, clearcoat, and anisotropy properties is mature and handles all eight metal presets.
- **Google model-viewer v4.2:** AR layer. Single web component handles iPhone Quick Look and Android WebXR/Scene Viewer. The only viable approach for iPhone AR in a web app (WebXR is not supported on iOS Safari).
- **react-router v7:** Routing. Four routes, SPA mode, no SSR needed.
- **Vercel:** Hosting. Zero-config for Vite, auto-deploy on git push, HTTPS by default, free tier (100 GB bandwidth/month).

**Version corrections to CLAUDE.md:** Vite 6 -> 8, TypeScript 5 -> 6, three v0.170+ -> v0.183.x, @react-three/xr demoted from core to optional (model-viewer handles AR for both platforms).

### Expected Features

The feature landscape is well-defined by the sales workflow: QR scan on PDF deck -> passcode entry -> browse design options -> 3D viewer -> AR placement. No competitor in the trophy space offers this integrated pipeline.

**Must have (table stakes):**
- Photorealistic metal rendering (MeshPhysicalMaterial + HDRI + ACES + Bloom) -- core value proposition
- Interactive 3D orbit controls (rotate, zoom, touch + mouse) -- basic usability
- Cross-platform AR via model-viewer (iPhone Quick Look + Android WebXR) -- headline feature
- Gallery grid with thumbnail cards -- browse multiple designs
- Client portal with 4-digit passcode (SHA-256, localStorage persistence) -- confidentiality
- Design option parent-child UI (Option A/B/C with iterations v1/v2/v3) -- matches real workflow
- Public showcase gallery (no auth) -- marketing surface
- Dark luxury theme (CSS custom properties, brand fonts, gold accents) -- brand alignment
- QR code generation for PDF deck integration -- the delivery mechanism
- Mobile-first responsive design, loading states, shareable URLs, back navigation

**Should have (differentiators):**
- Auto-rotate on idle -- professional first impression
- Contact shadows -- grounds trophy in space
- Hover-to-preload on gallery cards -- perceived performance
- Client-specific branding on portal header
- Smooth camera entrance animation
- Dimensions overlay / hotspots
- SSAO on desktop only

**Defer (v2+):**
- Real-time material switcher (upload separate .glb per variant instead)
- Engraving/text preview (bake in Cinema 4D)
- Gallery management CMS (content managed via code for solo designer)
- Server-side passcode validation (client-side sufficient for design concepts)
- Video turntable export (Cinema 4D handles this better)
- Real-time collaboration (phone call + shared URL suffices)
- VR gallery walkthrough (no headset adoption among clients)

### Architecture Approach

The defining architectural pattern is the hybrid rendering approach: React Three Fiber owns the visible 3D viewer with full control over materials, lighting, and post-processing; a hidden model-viewer web component exists on the same page solely to handle AR activation. These two engines never render simultaneously. A single persistent Canvas instance lives at the app layout level and persists across route changes to avoid Safari's WebGL context limit. Scene contents swap via React state rather than Canvas mount/unmount. State management is deliberately absent -- static TypeScript data files at build time, localStorage for passcode sessions, and mutable refs for Three.js animation. No Zustand, no Redux, no Context API for global state.

**Major components:**
1. **Router + Layout Shell (App.tsx)** -- URL routing, persistent Canvas host, global dark theme
2. **Gallery Pages (PublicGallery, ClientPortal)** -- Data lookup from static TS files, thumbnail card grids, passcode gate
3. **Viewer Components (TrophyViewer, TrophyScene, TrophyModel)** -- R3F Canvas wrapper, scene composition (HDRI + shadows + post-processing), model loading + material application
4. **AR Handoff (ARButton)** -- Hidden model-viewer element, programmatic `.activateAR()` call, platform detection delegated to model-viewer
5. **Material System (metalPresets.ts)** -- Eight MeshPhysicalMaterial preset configurations, pure data consumed by TrophyModel
6. **Auth System (PasscodeEntry + auth.ts)** -- SHA-256 hash comparison, localStorage persistence, rate limiting (5 attempts then lockout)

### Critical Pitfalls

The five pitfalls below are ordered by recovery cost -- the first two require architectural decisions that cannot be changed later without major rewrites.

1. **Safari WebGL context exhaustion on route changes** -- Mounting/unmounting Canvas per page causes crashes after 4-6 navigations on iPhone Safari. Prevention: single persistent Canvas at the layout level from day one. Recovery cost if missed: HIGH (1-2 day rewrite of all page components).

2. **Double tone mapping destroys metal realism** -- Setting ACES tone mapping on both the Canvas renderer AND in the postprocessing EffectComposer applies it twice, producing washed-out desaturated metals. Prevention: set `gl={{ toneMapping: THREE.NoToneMapping }}` on Canvas and let `<ToneMapping>` in EffectComposer handle it as the final pass. Recovery cost: LOW (1 line change + material re-tuning).

3. **Cinema 4D Redshift materials export as black in glTF** -- Redshift materials are proprietary and have no mapping to glTF PBR. Prevention: export geometry only (no materials) from Cinema 4D and apply MeshPhysicalMaterial presets entirely in R3F code. Recovery cost: LOW per model but requires establishing the pipeline early.

4. **Git corrupts binary .glb and .hdr files via line ending conversion** -- `core.autocrlf` or `.gitattributes text=auto` silently corrupts binary 3D assets. Models load locally but fail in production. Prevention: commit `.gitattributes` marking *.glb, *.hdr, *.usdz, *.wasm as binary before any asset files are committed. Recovery cost: MEDIUM (must remove and re-add files).

5. **HDRI files blow the performance budget on mobile** -- A 4K HDRI is 8-20 MB and causes multi-second PMREM processing freezes on mobile GPUs. Prevention: use 1K HDRI for mobile, 2K for desktop. Never serve 4K. Preload HDRI on gallery card hover. Recovery cost: LOW.

## Implications for Roadmap

Based on combined research across stack, features, architecture, and pitfalls, the following six-phase structure is recommended. The ordering is driven by dependency chains and risk mitigation.

### Phase 1: Foundation and Render Quality Proof
**Rationale:** Render quality is the existential risk. If metals do not look photorealistic in the browser, the product has no value regardless of how polished the UI is. Phase 1 also establishes architectural decisions (persistent Canvas, .gitattributes, touch-action CSS) that propagate through every subsequent phase and cannot be retrofitted.
**Delivers:** A single polished gold trophy rendering photorealistically in a browser on a real iPhone and Android phone at 60 FPS. The architectural skeleton for all subsequent phases.
**Features addressed:** Photorealistic metal rendering, interactive orbit controls, auto-rotate on idle, contact shadows, dark luxury theme foundation.
**Pitfalls addressed:** Double tone mapping, Safari WebGL context leak (persistent Canvas), Cinema 4D export failures, Git binary corruption (.gitattributes), OrbitControls iOS touch issues (touch-action CSS), HDRI mobile performance (1K/2K strategy).
**Exit criteria:** Gold MeshPhysicalMaterial on a test .glb renders with warm saturated color (not grey/washed) on a real iPhone Safari, with smooth touch controls and no WebGL context errors after 10+ navigations.

### Phase 2: AR Integration
**Rationale:** AR is the second headline feature and requires the viewer from Phase 1 to exist. Testing on real devices validates the dual-platform strategy and surfaces USDZ quality issues early, while the scope is still a single trophy.
**Delivers:** Working "View in AR" flow on both iPhone (Quick Look) and Android (WebXR/Scene Viewer). Documented fallback pipeline for manual USDZ export.
**Features addressed:** Cross-platform AR via model-viewer, AR button (hidden on desktop, visible on mobile).
**Pitfalls addressed:** model-viewer auto-USDZ quality, USDZ MIME type on Vercel, model-viewer + R3F resource conflict.
**Exit criteria:** Tapping "View in AR" launches Quick Look on a real iPhone and Scene Viewer on a real Android phone. Trophy appears at correct scale with recognizable materials.

### Phase 3: Public Showcase Gallery
**Rationale:** The gallery pattern (grid, cards, routing, loading states) is reused by the client portal in Phase 4. Building it first for the public showcase (no auth complexity) establishes the patterns cleanly. This phase also validates the full user flow: browse gallery -> select trophy -> 3D viewer -> AR.
**Delivers:** Public-facing trophy gallery with thumbnail cards, dark luxury theme, full routing, loading states with progress feedback.
**Features addressed:** Gallery grid with thumbnails, trophy info panel, shareable unique URLs, back navigation, loading states with React Suspense, hover-to-preload, dark luxury theme (full implementation).
**Pitfalls addressed:** Gallery cards mounting separate Canvas instances (reuse persistent Canvas), thumbnail-to-viewer color mismatch, HDRI CDN dependency (use local files), font loading blocking first paint.
**Exit criteria:** Full gallery-to-viewer-to-AR flow works end-to-end. Lighthouse JS bundle < 500 KB gzipped. Page weight < 10 MB with model + HDRI.

### Phase 4: Client Portal
**Rationale:** The client portal layers authentication and the design option hierarchy on top of the gallery pattern from Phase 3. It is the final feature phase before polish.
**Delivers:** Complete QR-to-AR pipeline: scan QR -> enter passcode -> browse design options/iterations -> 3D viewer -> AR.
**Features addressed:** Passcode authentication (SHA-256, localStorage, rate limiting), design option parent-child UI, project routes, client-specific branding on portal header.
**Pitfalls addressed:** Passcode brute-force (rate limiting with lockout), all project data in single bundle (consider per-project code splitting), predictable project URL slugs.
**Exit criteria:** QR scan -> passcode entry -> browse options -> 3D viewer -> AR works on a phone with a real or realistic project dataset.

### Phase 5: Polish and Content
**Rationale:** Polish only makes sense when all features exist. This phase focuses on production readiness: real Cinema 4D models, Draco compression, responsive edge cases, QR code generation.
**Delivers:** Production-quality content and loading experience. All performance budgets met.
**Features addressed:** QR code generation for PDF decks, Draco compression pipeline, responsive refinements, smooth camera entrance animation, vignette post-processing, adaptive HDRI resolution (1K mobile / 2K desktop), lightweight analytics.
**Pitfalls addressed:** Oversized .glb files (Draco compression), QR code using localhost URL, Draco decoder CDN dependency (self-host decoder files), production build MIME type issues.
**Exit criteria:** Real trophy content loaded. All .glb files < 5 MB Draco-compressed. Initial page load < 3 seconds on 4G. 60 FPS in viewer. QR codes resolve to production URL.

### Phase 6: Deploy
**Rationale:** Ship to the first real client. Vercel deployment is zero-config for Vite, so the deployment itself is low risk. The real test is a client using it in a real sales meeting.
**Delivers:** Live production site on a custom domain, ready for the first client test.
**Features addressed:** Vercel configuration, custom domain, production monitoring.
**Exit criteria:** A real client scans a QR code from a PDF deck and views their trophy in AR on their phone.

### Phase Ordering Rationale

- **Phases are ordered by risk, not by feature completeness.** Phase 1 validates the existential risk (render quality) and establishes irreversible architectural decisions (persistent Canvas). Phase 2 validates the second headline feature (AR) before investing in UI layers.
- **The gallery pattern is built before the client portal** because the portal reuses the same card grid, routing, and viewer components. Building gallery first avoids duplication and establishes patterns that Phase 4 extends with auth.
- **Phase 1 architectural decisions propagate everywhere.** The persistent Canvas, .gitattributes, touch-action CSS, tone mapping configuration, and HDRI resolution strategy set in Phase 1 affect every subsequent phase. Getting any of these wrong requires costly rewrites.
- **The QR-to-AR pipeline is the capstone.** It requires the client portal (Phase 4), which requires the gallery pattern (Phase 3), which requires the viewer (Phase 1) and AR (Phase 2). The dependency chain is strictly linear.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** HIGH risk. The persistent Canvas + React Router integration pattern needs prototyping. Cinema 4D geometry-only export workflow must be validated with a real trophy model. Material tuning (eight metal presets) is subjective and requires iterative real-device testing.
- **Phase 2:** MEDIUM risk. model-viewer AR is well-documented, but auto-USDZ quality with luxury metal materials is untested. Vercel MIME type configuration for .usdz files needs verification. Manual USDZ pipeline via Reality Converter should be documented as a fallback.

Phases with standard patterns (skip deeper research):
- **Phase 3:** LOW risk. React Router + CSS grid + thumbnail cards. Well-documented, established patterns. The Suspense loading pattern is standard R3F.
- **Phase 4:** LOW risk. Client-side SHA-256 auth is simple. Design option UI is custom but straightforward React components.
- **Phase 5:** LOW risk. Draco compression, QR code generation, responsive CSS -- standard web optimization work.
- **Phase 6:** LOW risk. Vercel Vite deployment is zero-config.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registries. Peer dependency compatibility matrix confirmed. No conflicts. |
| Features | HIGH | Table stakes well-defined by competitive analysis and sales workflow research. Differentiators specific to Thomas Lyte's QR-to-AR pipeline. Anti-features clearly identified with rationale. |
| Architecture | HIGH | Hybrid R3F + model-viewer pattern is the documented industry standard. Persistent Canvas requirement is well-evidenced by multiple R3F GitHub issues. Data flow and component boundaries are straightforward for a static-data SPA. |
| Pitfalls | HIGH | Every critical pitfall verified against official docs, GitHub issues with reproduction steps, and community reports. Double tone mapping and WebGL context leak are especially well-documented with clear solutions. |

**Overall confidence:** HIGH

### Gaps to Address

- **Cinema 4D test export:** The geometry-only export approach (no materials, web-side MeshPhysicalMaterial) is the recommended path but has not been validated with a real trophy model. This is the single largest unknown and must be the first task in Phase 1.
- **Redshift vs Standard materials in Alex's C4D workflow:** If Alex uses Redshift, the material-free export is mandatory (Redshift materials cannot convert to glTF). If Standard/Physical materials, there is an option to export with materials and override in code. Clarify before Phase 1 planning.
- **Persistent Canvas + React Router integration:** The need is clear but the exact implementation pattern (Canvas at layout level, scene content swap via context/state, Router integration) needs prototyping. Phase 1 planning should include a spike for this.
- **USDZ quality on real trophies:** model-viewer auto-generation works for simple models but luxury metal materials may convert poorly. The manual USDZ pipeline via Reality Converter (macOS only) needs to be documented as a fallback before Phase 2.
- **Vercel bandwidth at scale:** Free tier allows ~14,000 trophy views/month (7 MB per view). Not a concern for MVP but should be monitored. Cloudflare R2 is the documented fallback for asset hosting.

## Sources

### Primary (HIGH confidence)
- [R3F Official Documentation](https://r3f.docs.pmnd.rs/) -- Architecture patterns, scaling performance, pitfalls
- [model-viewer Official Documentation](https://modelviewer.dev/docs/) -- AR attributes, Quick Look, WebXR, USDZ auto-generation
- [@react-three/fiber npm](https://www.npmjs.com/package/@react-three/fiber) -- v9.5.0, peer deps verified
- [@google/model-viewer npm](https://www.npmjs.com/package/@google/model-viewer) -- v4.2.0, three ^0.182.0 peer dep
- [three npm](https://www.npmjs.com/package/three) -- v0.183.2
- [react-router npm](https://www.npmjs.com/package/react-router) -- v7.13.2
- [Vite 8.0 release blog](https://vite.dev/blog/announcing-vite8) -- Rolldown bundler, 10-30x faster builds
- [TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Cinema 4D glTF Export Guide (Maxon)](https://help.maxon.net/c4d/r23/en-us/Content/html/FGLTFEXPORTER.html) -- Redshift material limitations
- [Poly Haven Studio HDRIs](https://polyhaven.com/hdris?c=studio) -- CC0 licensed

### Secondary (MEDIUM confidence)
- [R3F WebGL Context Leak -- GitHub Issue #3093](https://github.com/pmndrs/react-three-fiber/issues/3093) -- Safari context exhaustion reproduction
- [R3F WebGLRenderer Leak -- GitHub Issue #514](https://github.com/pmndrs/react-three-fiber/issues/514) -- Historical context
- [Tone Mapping with Post-Processing -- Three.js Forum](https://discourse.threejs.org/t/tone-mapping-with-post-processing/7281) -- Double tone mapping diagnosis
- [model-viewer USDZ Issues -- GitHub Issue #3300](https://github.com/google/model-viewer/issues/3300) -- Auto-USDZ loading failures
- [High-Performance 3D Product Viewers (dev.to)](https://dev.to/kellythomas/how-to-create-high-performance-3d-product-viewers-using-threejs-react-for-modern-ecommerce-stores-5f7p) -- Architecture patterns
- [From Flat to Spatial: 3D Product Grid with R3F (Codrops)](https://tympanus.net/codrops/2026/02/24/from-flat-to-spatial-creating-a-3d-product-grid-with-react-three-fiber/) -- Production R3F patterns
- [Zolak - 12 Best 3D Product Visualization Platforms 2026](https://zolak.tech/blog/best-3d-product-visualization-platforms-for-ecommerce) -- Competitive landscape
- [OrbitControls Touch Issues -- Three.js Issue #27073](https://github.com/mrdoob/three.js/issues/27073) -- iOS Safari touch conflicts

### Tertiary (LOW confidence)
- [model-viewer-react (GitHub)](https://github.com/devhims/model-viewer-react) -- React wrapper reference (not needed with React 19 custom element support)
- [100 Three.js Tips (utsubo.com)](https://www.utsubo.com/blog/threejs-best-practices-100-tips) -- Performance tips compilation

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
