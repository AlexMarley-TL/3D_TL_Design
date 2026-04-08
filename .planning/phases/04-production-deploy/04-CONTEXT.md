# Phase 4: Production & Deploy - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning
**Mode:** Auto-generated (user away — autonomous mode)

<domain>
## Phase Boundary

Production optimization: Draco-compress GLB models, optimize JS bundle for <500KB gzipped, generate QR codes for client project URLs, verify Vercel deployment serves all routes and assets correctly. This is the final phase before real client use.

</domain>

<decisions>
## Implementation Decisions

### Draco Compression
- Use gltf-pipeline CLI to compress all .glb files in public/models/
- Target: each .glb under 5MB after compression
- Three.js has built-in Draco decoder (loaded from Google CDN via drei)
- Run as a build-time script, not runtime

### Bundle Optimization
- Code-split model-viewer with dynamic import (it's ~150KB gzipped)
- Lazy-load 3D viewer routes with React.lazy + Suspense
- Target: <500KB gzipped total JS bundle
- Current bundle: 437KB gzipped — may already be under budget without model-viewer

### QR Code Generation
- Use a QR code library (qrcode package) to generate PNG and SVG
- Generate QR codes for each client project URL: https://3-d-tl-design.vercel.app/project/:code
- Output to public/qr/ directory as PNG and SVG files
- Script-based generation (not runtime) — QR images included in PDF decks

### Vercel Deployment
- Site already live at 3-d-tl-design.vercel.app
- vercel.json already configured with SPA rewrites
- Verify all routes work: /, /trophy/:slug, /project/:code, /project/:code/:slug
- Verify static assets: models/, images/, hdri/ served correctly
- Verify HTTPS (required for AR)

### Claude's Discretion
- Whether to add a build script for Draco compression or document as manual step
- Code-splitting strategy details
- QR code styling (plain black/white vs branded)

</decisions>

<code_context>
## Existing Code Insights

### Current State
- Bundle: 437KB gzipped (close to 500KB limit)
- Models: SheenChair.glb (4MB), UEFA-Womens-Euro-Trophy.glb (2.3MB) — both under 5MB
- HDRI: studio_small_09_2k.hdr in public/hdri/
- Vercel: auto-deploys on push to main, vercel.json with SPA rewrites
- GitHub: AlexMarley-TL/3D_TL_Design

### Integration Points
- package.json needs qrcode dependency and build scripts
- vite.config.ts may need code-splitting config
- public/qr/ directory for generated QR code images

</code_context>

<specifics>
## Specific Ideas

- QR codes go on Thomas Lyte PDF presentation decks
- Production URL is 3-d-tl-design.vercel.app (may change to custom domain later)
- Models are already reasonably sized — Draco compression is nice-to-have optimization

</specifics>

<deferred>
## Deferred Ideas

- Custom domain setup (post-MVP)
- CDN caching headers optimization
- Service worker for offline model caching
- Analytics / visitor tracking

</deferred>
