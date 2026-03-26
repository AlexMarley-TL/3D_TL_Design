# Feature Research

**Domain:** Web-based 3D luxury product visualiser with cross-platform AR
**Researched:** 2026-03-26
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unprofessional. For a luxury product visualiser pitched to high-end clients, the bar is higher than generic e-commerce 3D viewers.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Interactive 3D orbit controls (rotate, zoom, pan) | Every 3D product viewer ships this. Without it the model is a static image. | LOW | drei `OrbitControls` with `enableDamping: true`. Touch and mouse. Auto-detect input device. |
| Photorealistic metal rendering | This is the core value proposition. Luxury clients will compare to Cinema 4D renders in the PDF deck. If the web version looks cheap, trust collapses. | HIGH | MeshPhysicalMaterial + HDRI + ACES tone mapping + Bloom. Quality is the #1 priority per PRD. |
| Mobile-responsive layout | Clients scan QR codes on phones. 60%+ traffic is mobile. A non-responsive gallery is unusable. | MEDIUM | Mobile-first CSS. Touch-optimised controls. Viewport-aware canvas sizing. |
| Fast loading with visual feedback | Models are 2-5 MB. Clients on 4G expect something visible within 3 seconds. A blank screen = they leave. | MEDIUM | React Suspense + skeleton/spinner for gallery. Progressive load: thumbnail first, then 3D model. Preload on hover. |
| Cross-platform AR (iPhone + Android) | AR is a headline feature. Luxury clients disproportionately use iPhones. If AR only works on Android, half the audience is excluded. | HIGH | model-viewer handles dual-path: WebXR/Scene Viewer on Android, Quick Look on iPhone. Non-negotiable architectural decision. |
| Shareable unique URLs per trophy | Sales team shares links in emails and decks. Each trophy must have a permanent, bookmarkable URL. | LOW | React Router with `/trophy/:slug` and `/project/:code/:slug` patterns. |
| Dark luxury theme | Thomas Lyte is a luxury brand. A generic white/grey UI screams "prototype" to a luxury client. | MEDIUM | CSS custom properties matching AI Design v4.0 tokens. Playfair Display headings, Inter body. Gold accent `#c9a962`. |
| Gallery grid with thumbnails | Clients need to browse multiple designs at a glance before drilling into 3D. A single-model page is not a gallery. | LOW | Responsive CSS grid. WebP/JPEG thumbnails < 100 KB. Card layout with name, materials, dimensions. |
| Trophy info panel (name, dimensions, materials) | Clients need to know what they are looking at: how tall it is, what metal it is, which design option and iteration. | LOW | Overlay or sidebar panel on the 3D viewer page. Data from static TypeScript files. |
| Back navigation | Clients need to return to the gallery or project landing page. A dead-end 3D viewer with no way back is broken UX. | LOW | React Router navigation. Back button/link in viewer header. |
| HTTPS and basic access control | Client designs are confidential. Serving over HTTP or with zero authentication is unacceptable, even for low-risk design concepts. | LOW | Vercel provides HTTPS automatically. 4-digit passcode with SHA-256 hashing for client portal. |
| Contact shadows or ground plane | A floating trophy looks like a 3D model demo, not a product photograph. Grounding the object in space is essential for realism. | LOW | drei `ContactShadows` component. Subtle, soft shadow beneath the trophy. |

### Differentiators (Competitive Advantage)

Features that set this apart from generic Sketchfab embeds, ImprintNext configurators, or competitors like Fabit/JH May who show static renders or basic CAD previews.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| QR-code-to-AR pipeline integrated with PDF decks | No competitor in the trophy space offers scan-a-QR-on-a-PDF, enter-a-code, see-your-trophy-in-AR. This bridges physical and digital sales workflow seamlessly. | MEDIUM | QR code generation (PNG/SVG for print). Project URL encoding. Branded QR with Thomas Lyte logo. The killer workflow feature. |
| Design option parent-child UI (Option A/B/C with iterations v1/v2/v3) | Clients see all design directions and revision history in one place. Competitors show flat lists. This matches how trophy design actually works: explore options, refine iterations. | MEDIUM | Expandable card UI. Tap option to reveal iterations. Single-iteration options skip the expansion and go straight to viewer. |
| Auto-rotate on idle | When the 3D viewer loads, a slow auto-rotate showcases the trophy before the client touches it. Professional product photography feel. Stops on user interaction. | LOW | OrbitControls `autoRotate: true`, `autoRotateSpeed: 1.5`. Disable on pointer down, re-enable after idle timeout. |
| HDRI studio lighting with supplementary accent lights | Generic 3D viewers use flat environment maps. Combining a professional studio HDRI with targeted spotlights/rect area lights creates the "product photography" look that sells luxury. | MEDIUM | Poly Haven studio HDRI + 1-2 supplementary drei lights for accent and rim lighting. |
| Persistent passcode session (localStorage) | Client enters the 4-digit code once. On return visits, they go straight to their designs. Frictionless for busy executives. | LOW | localStorage stores hashed passcode per project code. Check on page load before showing passcode entry. |
| Hover-to-preload on gallery cards | When a client hovers over a trophy card, the .glb starts downloading in the background. By the time they click, the model is partially or fully cached. Feels instant. | LOW | `useGLTF.preload(modelPath)` triggered on mouseenter/touchstart events on gallery cards. |
| Dimensions overlay / info hotspots | Show trophy height, width, depth as subtle annotations in or near the 3D scene. Clients care about physical scale. Competitors rarely show dimensions alongside 3D. | MEDIUM | model-viewer hotspot API or custom HTML overlays positioned via 3D-to-2D coordinate mapping in R3F. |
| Smooth camera entrance animation | Instead of snapping to the default orbit position, the camera eases in from a dramatic angle. First impression matters for luxury. | LOW | drei CameraControls or spring animation (react-spring) from initial position to orbit center on mount. |
| Vignette post-processing | Subtle edge darkening focuses attention on the trophy and adds photographic depth. Cheap performance-wise, significant visual upgrade. | LOW | @react-three/postprocessing Vignette effect. Very low GPU cost. |
| Client-specific branding on portal | Show the client name and project name on the portal landing page. "Royal Foundation -- Nations Trophy 2026" feels bespoke, not generic. | LOW | Pulled from static project data. Displayed in the portal header. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create disproportionate complexity, degrade the core experience, or solve problems that do not exist for this product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time material switcher (toggle gold/silver/chrome live) | Sounds impressive. "Let clients see it in different metals." | Requires separate material maps or runtime material swapping. Baked Cinema 4D textures may not map cleanly to runtime material changes. Doubles QA surface area. Most clients have already chosen a material from the PDF deck. | Defer to post-MVP. If needed, upload separate .glb files per material variant as distinct iterations. Each is individually photorealistic rather than a compromised runtime swap. |
| Engraving/text preview on trophy surface | "Let clients see their name on it." | UV mapping text onto arbitrary 3D geometry is fragile. Trophy shapes are complex -- text warps on curved surfaces. Font rendering in WebGL is a rabbit hole. Cinema 4D handles this far better. | Show engraving as a separate 2D mockup in the PDF deck. If 3D engraving is needed later, bake it into the .glb in Cinema 4D and upload as a new iteration. |
| Full gallery management CMS (upload/reorder/edit via web UI) | "Non-technical users should manage content." | Requires backend, file upload handling, image processing, auth system, admin UI. Massive scope increase for a product used by one designer (Alex). | Content managed via code: add .glb to /public/models/, update TypeScript data file, deploy. Takes 2 minutes. Build a CMS only if/when multiple people need to manage content. |
| Real-time collaboration (designer + client view same model) | "Review designs together remotely." | Requires WebSocket infrastructure, state synchronisation, presence indicators, conflict resolution. Enterprise-grade complexity for a feature that a phone call + shared URL already solves. | Share the URL. Client opens on their phone, designer opens on desktop. Discuss over a call. Zero infrastructure. |
| VR gallery walkthrough | "Walk through a virtual showroom." | Requires VR headset hardware that clients do not own. WebXR VR support is patchy. Completely different interaction paradigm from the phone-based QR-to-AR workflow. | Focus on the phone AR experience which clients actually use. VR is a future exploration when headset adoption justifies it. |
| Video turntable export (360 spinning MP4) | "Generate a video for social media." | Client-side video encoding from WebGL is slow and unreliable across browsers. File sizes are large. Quality is inferior to rendering the video in Cinema 4D. | Export turntable videos from Cinema 4D directly (existing capability). The web viewer is for interactive exploration and AR, not video production. |
| Server-side passcode validation | "Client-side auth is insecure." | Adds a serverless function, environment variable management, and API error handling. The threat model does not justify it: the content is design concepts, not financial data. A determined user reading JS source to bypass a passcode will see... a trophy render. | Client-side SHA-256 hashing for MVP. The passcode deters casual access, which is proportionate to the risk. Upgrade to serverless validation only if genuinely sensitive content is added. |
| SSAO (Screen Space Ambient Occlusion) on mobile | "More realistic shadows in crevices." | SSAO is expensive. On mobile GPUs it drops frame rate below 30 FPS, especially at 2x pixel ratio with MeshPhysicalMaterial already taxing the GPU. | Enable SSAO on desktop only (detect via GPU capability). Mobile gets ContactShadows + Bloom which are cheaper and still look professional. |
| User accounts and email registration | "Track who views what." | Clients are busy executives. They will not create accounts for a one-time design review. Registration friction kills the QR-scan-and-view workflow. | 4-digit passcode. No accounts. Add lightweight analytics (page views, AR button taps) via Vercel Analytics or a simple event tracker if usage data is needed. |
| Integration with AI Design v4.0 pipeline | "One-click export from AI Design to 3D gallery." | The AI Design pipeline and the 3D gallery are separate tools with different data models. Tight coupling creates fragile dependencies. The manual export step (2 minutes) does not justify an integration. | Keep them separate. Alex exports .glb from Cinema 4D manually. Build integration only if the manual step becomes a genuine bottleneck at scale (10+ projects/week). |

## Feature Dependencies

```
Photorealistic Metal Rendering
    |--requires--> HDRI Studio Lighting
    |--requires--> ACES Filmic Tone Mapping
    |--enhanced-by--> Bloom Post-Processing
    |--enhanced-by--> Vignette Post-Processing
    |--enhanced-by--> Contact Shadows

Interactive 3D Viewer (OrbitControls)
    |--requires--> Photorealistic Metal Rendering (otherwise nothing worth rotating)
    |--enhanced-by--> Auto-Rotate on Idle
    |--enhanced-by--> Smooth Camera Entrance Animation

Cross-Platform AR
    |--requires--> Interactive 3D Viewer (AR button lives on viewer page)
    |--requires--> model-viewer Web Component (handles platform detection)

Gallery Grid
    |--requires--> Trophy Thumbnails (images, not 3D)
    |--enhanced-by--> Hover-to-Preload

Client Portal
    |--requires--> Passcode Authentication
    |--requires--> Gallery Grid (reuses card layout)
    |--requires--> Design Option Parent-Child UI

QR-Code-to-AR Pipeline
    |--requires--> Client Portal (QR encodes project URL)
    |--requires--> Passcode Authentication
    |--requires--> Cross-Platform AR

Dark Luxury Theme
    |--independent--> Can be built in parallel with any feature
    |--enhances--> Every visual feature

Dimensions Overlay
    |--requires--> Interactive 3D Viewer
    |--conflicts-with--> Cluttered UI (keep minimal, toggle-able)
```

### Dependency Notes

- **Photorealistic Metal Rendering requires HDRI + Tone Mapping:** Without both, metals look flat and fake. These three are one atomic unit, not separable features.
- **Cross-Platform AR requires model-viewer:** The dual-path (WebXR + Quick Look) is only possible through model-viewer's platform detection. Building this manually is a waste.
- **Client Portal requires Passcode + Gallery Grid:** The portal is a passcode gate in front of a gallery-like layout with design options. Building the gallery pattern first means the portal reuses it.
- **QR-Code-to-AR Pipeline is the capstone:** It ties together the portal, the auth, and the AR -- cannot exist without all three.
- **Dark Luxury Theme is independent:** CSS theming can be applied at any point and does not block other features. But applying it early ensures all components are styled correctly from the start, avoiding a "re-skin" pass later.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to put a real trophy in a real client's hands via QR code.

- [ ] Photorealistic 3D viewer (MeshPhysicalMaterial + HDRI + ACES + Bloom) -- core value
- [ ] Interactive orbit controls (rotate, zoom, pan, touch + mouse) -- basic usability
- [ ] Auto-rotate on idle -- professional first impression
- [ ] Contact shadows -- grounds the trophy in space
- [ ] Cross-platform AR via model-viewer (iPhone Quick Look + Android WebXR) -- headline feature
- [ ] Gallery grid with thumbnail cards -- browse multiple trophies
- [ ] Trophy info panel (name, dimensions, materials) -- context for what the client sees
- [ ] Client portal with 4-digit passcode (SHA-256, localStorage persistence) -- confidentiality
- [ ] Design option parent-child UI (options with expandable iterations) -- matches real workflow
- [ ] Public showcase gallery (no auth) -- marketing surface
- [ ] Dark luxury theme (CSS custom properties, brand fonts, gold accents) -- brand alignment
- [ ] QR code generation for PDF deck integration -- the delivery mechanism
- [ ] Mobile-first responsive design -- primary use case is phones
- [ ] Loading state (spinner or skeleton) with React Suspense -- perceived performance
- [ ] Shareable unique URLs per trophy and per project -- the sharing mechanism
- [ ] Back navigation from viewer to gallery/project -- basic UX

### Add After Validation (v1.x)

Features to add once the first real client has used the system and given feedback.

- [ ] Hover-to-preload on gallery cards -- add when load times feel slow in practice
- [ ] Smooth camera entrance animation -- add when first impression polish is prioritised
- [ ] Vignette post-processing -- add when visual polish pass happens
- [ ] Dimensions overlay / hotspots -- add when clients ask "how big is it?" during 3D viewing
- [ ] Client-specific branding on portal header -- add when multiple active client projects exist
- [ ] SSAO on desktop only -- add when desktop rendering quality is being optimised
- [ ] Lightweight analytics (page views, AR taps) -- add when usage data is needed for reporting
- [ ] HDRI adaptive resolution (2K mobile / 4K desktop) -- add when performance profiling reveals mobile bottleneck

### Future Consideration (v2+)

Features to defer until the core product is proven and there is genuine demand.

- [ ] Material switcher (toggle metal finishes on same model) -- only if clients request it AND Cinema 4D workflow supports clean runtime swaps
- [ ] Engraving preview -- only if 3D text rendering quality reaches luxury standard
- [ ] Gallery management CMS -- only if non-technical users need to manage content
- [ ] Server-side passcode validation -- only if content sensitivity increases
- [ ] Video turntable export -- only if social media content becomes a priority
- [ ] Multiple HDRI environments (choose lighting mood) -- only if clients want to see trophy in different contexts
- [ ] Real-time collaboration -- only if remote review sessions become frequent
- [ ] VR gallery walkthrough -- only if headset adoption warrants it

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Photorealistic metal rendering | HIGH | HIGH | P1 |
| Interactive 3D orbit controls | HIGH | LOW | P1 |
| Cross-platform AR (model-viewer) | HIGH | HIGH | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Fast loading with visual feedback | HIGH | MEDIUM | P1 |
| Dark luxury theme | HIGH | MEDIUM | P1 |
| Gallery grid with thumbnails | HIGH | LOW | P1 |
| Client portal with passcode | HIGH | MEDIUM | P1 |
| Design option parent-child UI | HIGH | MEDIUM | P1 |
| Public showcase gallery | MEDIUM | LOW | P1 |
| QR code generation | HIGH | LOW | P1 |
| Shareable unique URLs | HIGH | LOW | P1 |
| Trophy info panel | MEDIUM | LOW | P1 |
| Contact shadows | MEDIUM | LOW | P1 |
| Auto-rotate on idle | MEDIUM | LOW | P1 |
| Back navigation | HIGH | LOW | P1 |
| Hover-to-preload | MEDIUM | LOW | P2 |
| Smooth camera entrance animation | LOW | LOW | P2 |
| Vignette post-processing | LOW | LOW | P2 |
| Dimensions overlay / hotspots | MEDIUM | MEDIUM | P2 |
| Client branding on portal | LOW | LOW | P2 |
| SSAO desktop only | LOW | MEDIUM | P2 |
| Lightweight analytics | MEDIUM | LOW | P2 |
| Adaptive HDRI resolution | MEDIUM | LOW | P2 |
| Material switcher | MEDIUM | HIGH | P3 |
| Engraving preview | LOW | HIGH | P3 |
| Gallery CMS | LOW | HIGH | P3 |
| Server-side auth | LOW | MEDIUM | P3 |
| Video turntable export | LOW | HIGH | P3 |
| Real-time collaboration | LOW | HIGH | P3 |
| VR gallery | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch -- the QR-to-AR pipeline does not work without these
- P2: Should have, add after first client validates the concept
- P3: Nice to have, defer until genuine demand exists

## Competitor Feature Analysis

| Feature | Sketchfab Embed | ImprintNext (Trophy Configurator) | Fabit / JH May (Bespoke Manufacturers) | Thomas Lyte 3D Viewer (Our Approach) |
|---------|----------------|-----------------------------------|---------------------------------------|--------------------------------------|
| 3D interactive viewer | Yes (generic iframe) | Yes (configurator UI) | No (static renders/CAD screenshots) | Yes (custom R3F, photorealistic metals) |
| AR placement | Limited (Sketchfab AR beta) | Yes (basic smartphone AR) | No | Yes (model-viewer, iPhone + Android) |
| Photorealistic metals | Moderate (limited material control) | Low (generic materials) | N/A (offline renders only) | High (MeshPhysicalMaterial + HDRI + Bloom) |
| QR code to AR flow | No | No | No | Yes (QR on PDF deck, passcode, 3D + AR) |
| Client-specific access | No (public or password-wall) | No (e-commerce configurator) | No (email PDFs) | Yes (per-project 4-digit passcode) |
| Design iterations (versioning) | No (single model per page) | No | No (email new renders) | Yes (Option A/B/C with v1/v2/v3) |
| Luxury brand aesthetic | Generic Sketchfab chrome | Generic e-commerce UI | Corporate website | Custom dark theme matching brand |
| Phone-first experience | Responsive but not optimised | Desktop-first | Desktop-only | Mobile-first (primary use case is phone) |
| No-install, no-account | Yes (web viewer) | Yes (web configurator) | N/A | Yes (QR scan, passcode, done) |

**Key competitive insight:** No competitor in the bespoke trophy/awards space offers a QR-to-AR pipeline with per-client access control and design iteration tracking. The closest general-purpose tools (Sketchfab, model-viewer demos) lack the luxury aesthetic and the client-specific workflow integration. Thomas Lyte's advantage is not a single feature but the combination of photorealistic quality + integrated sales workflow + AR on every phone.

## Sources

- [Zolak - 12 Best 3D Product Visualization Platforms 2026](https://zolak.tech/blog/best-3d-product-visualization-platforms-for-ecommerce)
- [iONE360 - Trends Shaping 3D Configurators 2026](https://www.ione360.com/blog/what-trends-are-shaping-3d-configurators-in-2026/)
- [ProtoTech - Top 10 Best 3D Product Configurator Features 2026](https://blog.prototechsolutions.com/top-10-best-product-configurator-features-2026/)
- [VividWorks - Key Product Configurator Features](https://www.vividworks.com/blog/key-product-configurator-features)
- [Sketchfab 3D Viewer Features](https://sketchfab.com/features)
- [Google model-viewer AR Documentation](https://modelviewer.dev/examples/augmentedreality/index.html)
- [model-viewer Annotations](https://modelviewer.dev/examples/annotations/index.html)
- [Google model-viewer GitHub](https://github.com/google/model-viewer)
- [MIT Technology Review - Cartier and Tiffany AR for Luxury](https://www.technologyreview.com/2023/03/07/1069414/cartier-tiffany-ar-luxury-gen-z/)
- [ImprintNext Trophy Design Software](https://imprintnext.com/trophy-design-software)
- [Fabit Custom Trophies & Awards](https://fabit3d.com)
- [London Dynamics - 3D eCommerce Guide](https://londondynamics.com/blog/ecommerce/retailers-guide-to-3d-ecommerce/)
- [Vertebrae - 3D & AR eCommerce Use Cases](https://www.vertebrae.com/blog/3d-ar-ecommerce-examples-by-industry/)
- [REYDAR - 3D Product Visualization Guide](https://www.reydar.com/3d-product-visualization-guide-for-ecommerce-brands/)
- [Cylindo - QR Code Web-Native AR](https://blog.cylindo.com/cylido-qr-code-web-native-augmented-reality)
- [Poly Haven Studio HDRIs](https://polyhaven.com/hdris?c=studio)

---
*Feature research for: Web-based 3D luxury product visualiser with cross-platform AR*
*Researched: 2026-03-26*
