# Pitfalls Research

**Domain:** Web-based 3D product viewer with photorealistic metal rendering and cross-platform AR
**Researched:** 2026-03-26
**Confidence:** HIGH (verified across official docs, GitHub issues, and multiple community sources)

## Critical Pitfalls

### Pitfall 1: Double Tone Mapping Destroys Metal Realism

**What goes wrong:**
When using `@react-three/postprocessing` with `<ToneMapping>` while also setting `toneMapping: THREE.ACESFilmicToneMapping` on the Canvas `gl` prop, tone mapping is applied twice. The result is washed-out, desaturated metals that look grey instead of gold. Polished gold becomes muddy yellow. Chrome loses all contrast. The entire luxury aesthetic is ruined.

**Why it happens:**
Three.js applies tone mapping at the renderer level. The postprocessing EffectComposer then applies it again as an effect pass. The CLAUDE.md spec currently includes both: `toneMapping: THREE.ACESFilmicToneMapping` on the Canvas AND `<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />` in the EffectComposer. If both are active simultaneously, the image is double-processed.

**How to avoid:**
When using `@react-three/postprocessing`, set `gl={{ toneMapping: THREE.NoToneMapping }}` on the Canvas and let the `<ToneMapping>` effect handle it as the final pass in the EffectComposer. Tone mapping must always be the last step in the pipeline, applied exactly once.

```jsx
// CORRECT: Disable renderer tone mapping, use postprocessing only
<Canvas gl={{ toneMapping: THREE.NoToneMapping }}>
  <EffectComposer>
    <Bloom ... />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>
</Canvas>
```

**Warning signs:**
- Gold trophies look flat, grey, or desaturated
- Specular highlights lack punch even with bloom enabled
- Metals look noticeably different (worse) from reference renders in Cinema 4D
- Lowering `toneMappingExposure` helps slightly but never fixes it

**Phase to address:**
Phase 1 (Foundation & Render Quality Proof) -- this must be correct from the first render test. Getting this wrong means all subsequent material tuning is meaningless.

---

### Pitfall 2: iOS Safari WebGL Context Limits Crash the App on Route Changes

**What goes wrong:**
When navigating between gallery cards and trophy detail views, each route change mounts and unmounts the R3F `<Canvas>` component. Safari (iOS and macOS) has a hard limit of approximately 8-16 active WebGL contexts. After visiting several trophies, the browser kills the oldest context with the error "There are too many active WebGL contexts on this page, the oldest context will be lost" and eventually crashes the tab entirely. This is a confirmed, long-standing issue documented across multiple R3F GitHub threads (Issues #514, #2655, #3093).

**Why it happens:**
React Router treats each route as a distinct component tree. If `<Canvas>` lives inside the trophy detail page component, it mounts fresh with each navigation. While R3F calls `forceContextLoss` on unmount, Safari does not reliably release the GPU memory in time before the next context is requested.

**How to avoid:**
Keep a single `<Canvas>` instance alive across the entire app lifecycle. Mount it once at the top level (in App.tsx or a layout component) and swap scene contents via React state or context rather than unmounting/remounting the Canvas. Use conditional rendering of scene children, not conditional rendering of the Canvas itself.

```jsx
// CORRECT: Single persistent Canvas, swap children
<Canvas>
  {currentView === 'detail' && <TrophyScene model={currentModel} />}
  {currentView === 'gallery' && null /* Canvas stays alive but empty */}
</Canvas>

// WRONG: Canvas inside routed page components
<Route path="/trophy/:slug" element={<TrophyDetail />} />
// where TrophyDetail renders its own <Canvas> that unmounts on navigate-away
```

**Warning signs:**
- White or blank Canvas after navigating back and forth 4-6 times
- Console error: "WebGL: CONTEXT_LOST_WEBGL"
- App crash or tab reload on iPhone Safari
- Works fine on desktop Chrome but fails on iPhone

**Phase to address:**
Phase 1 (Foundation) -- the Canvas architecture must be decided before building any pages. Retrofitting a persistent Canvas later means rewriting all page components.

---

### Pitfall 3: Cinema 4D Redshift Materials Export as Black/Missing in glTF

**What goes wrong:**
Trophy models exported from Cinema 4D using Redshift materials appear completely black, have missing textures, or show incorrect metallic properties when loaded in the web viewer. The model geometry is fine, but the materials are wrong.

**Why it happens:**
Redshift materials are proprietary to the Redshift renderer and are not compatible with the glTF PBR metallic-roughness material model. Cinema 4D's glTF exporter only reliably converts Standard/Physical materials. Redshift's node-based shading network has no automatic mapping to glTF. This is explicitly documented by Maxon: "errors or unpredictable behaviors are expected when exporting with other materials such as the Node, U-Render or Redshift materials."

**How to avoid:**
Use the "material-free export + web-side materials" approach already identified in the Cinema 4D export pipeline research. Export geometry + normals only (no materials) from Cinema 4D. Apply `MeshPhysicalMaterial` metal presets entirely in React Three Fiber code. This gives full control over material quality and avoids the lossy C4D-to-glTF material conversion entirely.

For multi-material trophies (e.g., gold body + silver plaque), use mesh names or vertex groups from the C4D export to identify which parts get which metal preset, and assign materials programmatically in the `TrophyModel` component.

**Warning signs:**
- Exported .glb looks fine in a standalone glTF viewer but renders black in R3F
- Material colors are wildly different from the Cinema 4D viewport
- `metalness` and `roughness` values in the exported glTF are 0 or 1 when they should be somewhere in between
- Console warnings about missing textures or unsupported material types

**Phase to address:**
Phase 1 (Foundation & Render Quality Proof) -- the very first test export must validate this workflow. The project's rendering quality depends entirely on getting this right early.

---

### Pitfall 4: model-viewer Auto-Generated USDZ Looks Wrong on iPhone AR

**What goes wrong:**
model-viewer can auto-generate USDZ from a GLB file for Apple Quick Look AR. However, the auto-generated USDZ often has material discrepancies: colors may not match, clearcoat and anisotropy properties are lost, and the trophy looks noticeably different (usually worse) in iPhone AR compared to the R3F web viewer. In some cases, the auto-generated USDZ fails to load entirely on certain iOS versions, showing a loading spinner that never resolves.

**Why it happens:**
The GLB-to-USDZ conversion is lossy. Apple's Quick Look renderer uses its own PBR pipeline that does not support the full glTF material spec. Vertex colors, multiple UV channels, and some advanced PBR properties are not preserved. Additionally, Quick Look uses Apple's own default environment lighting, so the trophy will have different reflections regardless of material accuracy. model-viewer's auto-generation has known bugs with fixed scaling and certain material configurations.

**How to avoid:**
Start with model-viewer auto-generation for the MVP -- it is zero effort and works for many cases. But test on a real iPhone immediately. If quality is insufficient, export USDZ separately from Cinema 4D or use Apple's Reality Converter (macOS) to convert GLB to USDZ with manual material adjustments. Provide the explicit USDZ via the `ios-src` attribute on `<model-viewer>`. Accept that iPhone AR will always look somewhat different from the web viewer -- Quick Look is for spatial/scale verification, not pixel-perfect rendering.

**Warning signs:**
- Gold looks orange or brown in Quick Look
- Chrome appears grey/flat instead of mirror-like
- Loading spinner on iPhone that never resolves
- AR model appears at wrong scale

**Phase to address:**
Phase 2 (AR Integration) -- test auto-generation first, have the manual USDZ pipeline as a documented fallback.

---

### Pitfall 5: Git Corrupts Binary .glb and .hdr Files via Line Ending Conversion

**What goes wrong:**
GLB models load perfectly in local development but fail in production (Vercel). The file appears corrupted -- Three.js throws parse errors, the model never loads, or it loads with garbled geometry. The same file works when served from a local filesystem.

**Why it happens:**
Git's `core.autocrlf` setting or a `.gitattributes` rule with `text=auto` treats .glb files as text and converts line endings (LF to CRLF on Windows, or vice versa). This byte-level modification corrupts the binary data. This is a well-documented issue in the R3F community, specifically mentioned in GitHub Discussions #1997 for models that "work in dev but not on Vercel prod."

**How to avoid:**
Create a `.gitattributes` file in the project root on day one, before any binary assets are committed:

```gitattributes
# Ensure all binary 3D assets are never modified by Git
*.glb binary
*.gltf binary
*.hdr binary
*.exr binary
*.usdz binary
*.wasm binary
```

If binary files have already been committed without this, you must remove them from Git, add the `.gitattributes` rules, re-add the files, and commit. Running `git add --renormalize .` after adding `.gitattributes` also helps fix existing tracked files.

**Warning signs:**
- Model loads locally but 404s or parse-fails on Vercel/Netlify
- File size in the repo differs slightly from the original export
- `git diff` shows unexpected changes in .glb files
- Three.js GLTFLoader throws "Unexpected token" or "Invalid glTF" errors in production only

**Phase to address:**
Phase 1 (Foundation) -- `.gitattributes` must be the very first file committed to the repo, before any .glb or .hdr files.

---

### Pitfall 6: OrbitControls Touch Gestures Break on iOS Safari

**What goes wrong:**
Pinch-to-zoom conflicts with the browser's native zoom behavior on iOS Safari. Users try to pinch-zoom the 3D model but instead zoom the entire webpage. Two-finger gestures sometimes get stuck, causing OrbitControls to enter a broken state where single-touch incorrectly triggers pan instead of rotate. The "pointerup" event does not fire reliably on iOS when frames are dropped, leaving controls in a limbo state.

**Why it happens:**
iOS Safari sets touch event listeners to `passive: true` by default, which means `preventDefault()` is ignored. OrbitControls relies on preventing the browser's default touch behavior to take exclusive control of gesture input. Additionally, iOS has aggressive gesture recognition for native pinch-to-zoom and swipe-to-navigate that compete with the Canvas's touch handlers.

**How to avoid:**
Set `touch-action: none` on the Canvas container element via CSS to prevent browser-level gesture handling on the 3D viewer area. Use the drei `<OrbitControls>` component which handles many edge cases. Add `enableDamping` for smoother interaction. Test aggressively on a real iPhone -- the iOS Simulator does not accurately reproduce touch gesture conflicts.

```css
/* On the Canvas container */
.trophy-viewer canvas {
  touch-action: none;
}
```

Also consider disabling pan (only allow rotate + zoom) for the trophy viewer, since panning a single object on a dark background is rarely useful and reduces gesture conflict surface area.

**Warning signs:**
- Two-finger zoom zooms the page instead of the model
- Controls freeze after a multi-touch gesture
- Rotation feels "sticky" or jerky on iPhone compared to desktop
- Users accidentally trigger Safari's swipe-back navigation gesture

**Phase to address:**
Phase 1 (Foundation) -- must be tested on a physical iPhone during initial render quality proof, not deferred to polish.

---

### Pitfall 7: HDRI Files Blow the Performance Budget on Mobile

**What goes wrong:**
A 4K HDRI (.hdr) file can be 8-20 MB. On a 4G connection, this adds 3-8 seconds to the loading time before any model is even visible, blowing past the 3-second load target. Once loaded, PMREM (Pre-filtered Mipmapped Radiance Environment Map) processing of a large HDRI on a mobile GPU causes a visible multi-second freeze or jank before the first render appears.

**Why it happens:**
HDRI files are uncompressed high dynamic range images. They contain full floating-point color data per pixel. Even a 2K HDRI is ~2 MB. Developers test on fast desktop connections and powerful GPUs where PMREM processing is instant, and never notice the mobile penalty.

**How to avoid:**
Use 1K HDRI for mobile and 2K for desktop (not 4K). Detect device capability and serve the appropriate resolution. Preload the HDRI before navigating to the detail page (start loading when the user hovers/touches a gallery card). Consider converting .hdr to compressed KTX2 format for faster loading. Use drei's `<Environment>` with its built-in PMREM processing, which is optimized.

The performance budget specifies HDRI at ~2 MB. A 2K .hdr file hits this. A 4K .hdr exceeds it by 4-10x. Never use 4K on mobile.

**Warning signs:**
- Long blank/spinner screen before 3D viewer appears
- Visible frame drop or freeze when the 3D scene first renders
- Total page weight exceeds 10 MB on mobile
- First Contentful Paint and Time to Interactive metrics are poor

**Phase to address:**
Phase 1 (Foundation) -- establish the correct HDRI resolution strategy and loading pattern from the start. Phase 3 (Gallery) adds preloading on hover.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded passcode hashes in JS bundle | No backend needed, simple client-side auth | Anyone can view source and extract hashes. SHA-256 is crackable at 18M attempts/sec for 4-digit codes (only 10,000 possibilities). | MVP only. Acceptable because content is design concepts, not sensitive data. Upgrade to serverless validation if real security is needed. |
| Loading all trophy data from a single TypeScript file | Zero infrastructure, instant reads, simple | File grows linearly, all data shipped to client even for private projects | Acceptable below ~20 trophies. Revisit when data exceeds 50 entries. |
| Using drei `<Environment preset="studio" />` (CDN) | Zero setup, no local HDRI files needed | CDN dependency for core functionality, no control over HDRI version, slower load, CDN downtime breaks the viewer | Development only, never production. Always use local `/hdri/` files in production. |
| Skipping Draco compression for MVP | Faster iteration, no build pipeline for 3D assets | 3-5x larger .glb files, fails performance budget on mobile | Acceptable for Phase 1 proof-of-concept only. Must add Draco pipeline before Phase 3 gallery with multiple models. |
| model-viewer auto-USDZ instead of manual export | Zero effort, works for simple models | Lossy material conversion, potential loading failures on certain iOS versions | Start here, replace with manual USDZ only if quality testing fails. |

## Integration Gotchas

Common mistakes when connecting to external services and libraries.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| model-viewer + R3F on same page | Both fighting for WebGL resources. model-viewer creates its own Canvas and renderer, consuming a WebGL context slot. | Keep model-viewer hidden (`display: none` or off-screen) and only initialize it when the AR button is pressed. Do not let it render a visible 3D view -- R3F handles that. |
| Draco decoder loading | Relying on Google CDN (`gstatic.com/draco`) in production. CDN version mismatch with Three.js version causes silent decode failure. | Host Draco WASM decoder files locally in `/public/draco/` and configure `useGLTF.setDecoderPath('/draco/')`. Prefetch decoder files with `<link rel="prefetch">`. |
| Vercel + large static assets | Putting 5 MB .glb files in the Git repo. Build size grows with every model. Vercel Hobby tier has 100 MB source file limit for CLI deployments. | Use Git LFS for .glb and .hdr files, or store large assets in external object storage (Cloudflare R2, S3) and reference via URL. For MVP with <20 trophies, direct `/public/models/` is acceptable but monitor total repo size. |
| React Router + Canvas | Placing `<Canvas>` inside routed page components. Each route transition unmounts and remounts, leaking WebGL contexts on Safari. | Single persistent `<Canvas>` at the layout level. Route changes swap scene children, not the Canvas itself. |
| USDZ serving on static hosts | Server returns wrong MIME type for .usdz files. Safari/Quick Look rejects the file silently. | Configure the hosting platform to serve .usdz with MIME type `model/vnd.usdz+zip`. On Vercel, add to `vercel.json` headers configuration. Similarly, .glb files need `model/gltf-binary`. |
| Google Fonts (Playfair Display, Inter) | Loading two font families blocks first paint. Web fonts compete with 3D asset loading for bandwidth. | Use `font-display: swap` and preload the critical font weights. Load Playfair Display for headings only (not body text). Consider self-hosting fonts to avoid third-party CDN dependency. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Mounting R3F `<Canvas>` per gallery card for 3D previews | Works with 2-3 cards, crashes with 8+. Each Canvas is a separate WebGL context. | Use 2D thumbnail images for gallery cards. Reserve the single Canvas for the detail view. | More than 6-8 cards visible simultaneously |
| Full `MeshPhysicalMaterial` with all features enabled on mobile | Choppy frame rate, phone gets hot, battery drains visibly | Enable only needed features per material. Polished metals need clearcoat but not anisotropy. Brushed metals need anisotropy but lower clearcoat. Never enable `transmission` on mobile. | Any mobile device, especially mid-range Android |
| Loading all .glb models eagerly on gallery page | Page load balloons to 50+ MB, mobile users on 4G wait forever | Lazy-load models only when entering detail view. Gallery shows static thumbnail images. Preload on hover/touch for perceived speed. | More than 3 trophies in the gallery |
| High-resolution environment map on all devices | PMREM processing causes 2-4 second freeze on first render on mobile | Detect device type, serve 1K HDRI on mobile, 2K on desktop. Never serve 4K HDRI to any device. | Any mobile device with a 4K .hdr |
| Post-processing effects stacked without mobile detection | Bloom + SSAO + Vignette combined drops mobile to 15-20 FPS | Use Bloom + ToneMapping only on mobile. Add SSAO/Vignette on desktop only. Detect via `navigator.maxTouchPoints` or screen width. | Any mobile device, especially with SSAO enabled |
| Pixel ratio above 2x | Renders at 3x resolution on Retina phones (iPhone 15 Pro is 3x). Quadruples pixel count vs 2x. | `Math.min(window.devicePixelRatio, 2)` -- already in the spec, but easy to forget or override | Any 3x Retina device (most modern iPhones) |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing plain-text passcodes in TypeScript data files | Any visitor can open DevTools, search for 4-digit strings, and try them against other projects | Always hash passcodes with SHA-256 in the data file. Yes, a determined user can brute-force 10,000 possibilities, but it raises the effort from "glance at source" to "run a script." |
| Predictable project URL slugs | Sequential slugs like `/project/001`, `/project/002` let anyone enumerate all client projects | Use descriptive slugs like `nations-2026` or random short IDs. Never use sequential numbers. |
| No rate limiting on passcode attempts | Automated brute force cracks any 4-digit code in seconds (only 10,000 combinations) | Implement client-side rate limiting: max 5 incorrect attempts, then 15-minute lockout stored in localStorage. Not cryptographically secure, but sufficient to deter casual attempts. |
| Client project data for ALL projects shipped in the JS bundle | A user authenticated for Project A can view source and find model paths, slugs, and metadata for Project B | Separate data files per project and use dynamic imports or code splitting so only the authenticated project's data is loaded. Or accept this risk for MVP given the low sensitivity of design concept data. |
| HDRI and model URLs are public regardless of passcode | Anyone with the direct URL to `/models/nations-2026/option-a-v1.glb` can download the file without authentication | For MVP, accept this. The passcode protects the organized viewing experience, not individual file URLs. For post-MVP, consider signed URLs via serverless functions. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Blank screen while 3D scene loads (no loading state) | Client scans QR, sees nothing for 5+ seconds, assumes it is broken, closes the tab | Show the trophy name, dimensions, and material info immediately. Display a branded loading animation with a progress bar (drei's `useProgress`). The info panel should render before the 3D scene. |
| AR button visible on desktop browsers | Users click "View in AR" on laptop, nothing happens or they get an error | Hide the AR button on desktop. Only show it on mobile devices where AR is actually supported. Use model-viewer's built-in AR capability detection. |
| Passcode entry has no visual feedback for incorrect attempts | Client enters wrong code, nothing happens, they try again, eventually get locked out without understanding why | Show clear error states: "Incorrect passcode" with a shake animation. Show remaining attempts: "2 attempts remaining." Show lockout state: "Too many attempts. Please try again in 15 minutes." |
| OrbitControls allows panning the model off-screen | Client pans the trophy off the viewport and cannot find it again. On touch devices, accidental pan is very common. | Disable panning (`enablePan={false}`). For trophy viewing, rotate and zoom are sufficient. Or constrain pan distance with `maxDistance` and `minDistance`. Add a "Reset view" button. |
| No visual indication that the model is interactive | Client sees a static-looking 3D render and does not realize they can rotate it | Add a subtle auto-rotate on first load (drei `<Float>` or OrbitControls `autoRotate`). Show a brief "Drag to rotate" tooltip on first interaction. Use a cursor change on hover (desktop). |
| QR code leads to broken experience on old devices | Client with an iPhone 8 or older Android gets WebGL errors or extremely poor performance | Detect device capability on load. If the device cannot handle the 3D viewer, show a graceful fallback: static thumbnail images of the trophy from multiple angles, with a message like "For the full 3D experience, please use a more recent device." |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **3D Viewer:** Looks great on desktop Chrome but never tested on a physical iPhone -- test on real iPhone Safari before declaring Phase 1 complete
- [ ] **Metal Presets:** Gold looks good but brushedSilver anisotropy direction is wrong -- verify anisotropy rotation matches the model's brush direction per mesh
- [ ] **AR Button:** model-viewer is on the page but the `.glb` path is wrong or the model is too large for Quick Look (>100K polygons, >2048px textures) -- verify AR actually works on both Android and iPhone
- [ ] **Passcode Gate:** Rate limiting works in testing but resets when the user clears localStorage or uses incognito -- accept this limitation or add server-side rate limiting
- [ ] **Loading States:** Suspense fallback shows a spinner but the HDRI is still processing after the model loads, causing a visible "pop" when the environment map appears -- load HDRI before or simultaneously with the model, not after
- [ ] **Responsive Layout:** Gallery grid looks good on desktop and phone portrait, but phone landscape mode is untested and often breaks -- test landscape orientation
- [ ] **Color Accuracy:** Tone mapping makes the gold look correct in the viewer, but the gallery thumbnail (a static JPG) uses different color processing, so the gold looks different between card and viewer -- ensure thumbnails are captured from the actual R3F scene or color-corrected to match
- [ ] **Production Build:** Dev server serves .glb fine via Vite, but production build on Vercel may have MIME type issues or different CORS behavior -- test the Vercel deployment URL, not just localhost
- [ ] **QR Code:** Generated QR works when scanned, but the URL uses `localhost:5173` instead of the production domain -- ensure QR generation uses the production URL
- [ ] **Draco Decoder:** Models load via CDN decoder in dev, but CDN is blocked or slow in production environments behind corporate firewalls -- self-host Draco decoder files

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double tone mapping | LOW | Set `gl={{ toneMapping: THREE.NoToneMapping }}` on Canvas. Takes 1 line change + material re-tuning. |
| WebGL context leak on route changes | HIGH | Requires architectural refactor: extract Canvas to layout level, change all page components to be scene children instead of Canvas owners. 1-2 day rewrite. |
| C4D Redshift materials export black | LOW | Switch to geometry-only export + web-side materials. 1-2 hours per model to assign materials in code. |
| Auto-USDZ quality poor | MEDIUM | Set up manual USDZ pipeline via Reality Converter. 30 min per model + build pipeline changes. |
| Git corrupts .glb files | MEDIUM | Add `.gitattributes`, remove corrupted files, re-add originals. Risk of data loss if originals were overwritten. Keep original exports outside Git as backup. |
| OrbitControls broken on iOS | LOW | Add `touch-action: none` CSS, disable pan, add damping. 30 minutes of CSS and prop changes. |
| HDRI too large for mobile | LOW | Resize HDRI to 1K with an image tool, add device detection logic. 1-2 hours. |
| All project data in single bundle | MEDIUM | Refactor to per-project dynamic imports with code splitting. 2-4 hours depending on data structure. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Double tone mapping | Phase 1 -- Foundation | Gold metal preset looks warm and saturated, not grey. Compare side-by-side with Cinema 4D reference render. |
| WebGL context leak | Phase 1 -- Foundation | Navigate between gallery and detail view 10+ times on iPhone Safari without crash or blank Canvas. |
| C4D material export failure | Phase 1 -- Foundation | First test .glb loads with correct materials. If using web-side materials, gold preset matches reference. |
| Auto-USDZ quality | Phase 2 -- AR Integration | Trophy in Quick Look AR on iPhone has recognizable gold/silver appearance. Acceptable if not pixel-perfect. |
| Git binary corruption | Phase 1 -- Foundation | `.gitattributes` committed before first .glb file. Vercel deployment loads model without parse errors. |
| OrbitControls iOS issues | Phase 1 -- Foundation | Two-finger pinch-zoom works on iPhone Safari without zooming the webpage. Rotation feels smooth. |
| HDRI mobile performance | Phase 1 -- Foundation | 3D viewer renders within 3 seconds on 4G throttled connection. No visible freeze on first render. |
| AR button on desktop | Phase 2 -- AR Integration | AR button hidden on desktop. Visible and functional on mobile. |
| Loading UX | Phase 3 -- Public Showcase | Progress bar visible during model load. Info panel renders immediately. No blank white screen. |
| Passcode brute force | Phase 4 -- Client Portal | After 5 wrong attempts, lockout message appears. Cannot bypass by refreshing page (localStorage persists). |
| USDZ MIME type on Vercel | Phase 2 -- AR Integration | `.usdz` file loads in Safari Quick Look when served from Vercel production URL. |
| model-viewer + R3F resource conflict | Phase 2 -- AR Integration | Opening AR does not crash or blank the R3F viewer. Both can coexist on the same page. |
| Gallery thumbnail color mismatch | Phase 3 -- Public Showcase | Thumbnail gold color matches 3D viewer gold color when displayed side by side. |
| QR code wrong URL | Phase 5 -- Polish & Content | Scanning QR code opens the production Vercel URL, not localhost. |
| Total bundle/asset size | Phase 3 -- Public Showcase | Lighthouse audit shows < 500 KB JS bundle. Total page weight < 10 MB with model + HDRI. |

## Sources

- [R3F Official Performance Pitfalls Documentation](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [3 React Three Fiber Mistakes -- Wawa Sensei](https://wawasensei.dev/tuto/3-react-three-fiber-mistakes)
- [R3F WebGL Context Leak on Unmount -- GitHub Issue #3093](https://github.com/pmndrs/react-three-fiber/issues/3093)
- [R3F WebGLRenderer Leak -- GitHub Issue #514](https://github.com/pmndrs/react-three-fiber/issues/514)
- [Too Many Active WebGL Contexts on Safari -- GitHub Discussion #2457](https://github.com/pmndrs/react-three-fiber/discussions/2457)
- [iOS 17 Safari Context Lost -- Three.js Issue #26829](https://github.com/mrdoob/three.js/issues/26829)
- [Tone Mapping with Post-Processing -- Three.js Forum](https://discourse.threejs.org/t/tone-mapping-with-post-processing/7281)
- [Pmndrs Post-Processing Tone Mapping Guidance -- Three.js Forum](https://discourse.threejs.org/t/pmndrs-post-processing-tone-mapping-guidance/59374)
- [model-viewer AR Quick Look Broken on iOS -- GitHub Issue #1496](https://github.com/google/model-viewer/issues/1496)
- [model-viewer Auto USDZ Loading Failure -- GitHub Issue #3300](https://github.com/google/model-viewer/issues/3300)
- [model-viewer USDZ MIME Type -- GitHub Issue #350](https://github.com/google/model-viewer/issues/350)
- [Cinema 4D glTF Export Guide -- BakedPixels](https://www.bakedpixels.nl/blog/export-to-gltf-with-cinema-4d)
- [Cinema 4D glTF Export Settings -- Maxon Docs](https://help.maxon.net/c4d/r23/en-us/Content/html/FGLTFEXPORTER.html)
- [MeshPhysicalMaterial Transmission Issues on Android -- Three.js Forum](https://discourse.threejs.org/t/transmission-of-meshphysicalmaterial-doesnt-work-on-some-android-devices/28836)
- [GLB Works in Dev but Not Vercel -- R3F Discussion #1997](https://github.com/pmndrs/react-three-fiber/discussions/1997)
- [Draco Loader Setup -- Three.js Issue #15091](https://github.com/mrdoob/three.js/issues/15091)
- [OrbitControls Stuck on iOS -- Three.js Forum](https://discourse.threejs.org/t/orbitcontrols-eventually-gets-stuck-on-ios-webkit/42383)
- [OrbitControls Touch Zoom Issues -- Three.js Issue #27073](https://github.com/mrdoob/three.js/issues/27073)
- [Git Binary File Corruption -- .gitattributes Documentation](https://git-scm.com/docs/gitattributes)
- [Vercel Deployment Limits](https://vercel.com/docs/limits)
- [USDZ Material Limitations -- Fab/Sketchfab Support](https://support.fab.com/s/article/glTF-GLB-and-USDZ)

---
*Pitfalls research for: Web-based 3D trophy gallery with photorealistic metal rendering and cross-platform AR*
*Researched: 2026-03-26*
