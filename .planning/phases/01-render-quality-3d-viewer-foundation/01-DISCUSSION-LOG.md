# Phase 1: Render Quality & 3D Viewer Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 01-render-quality-3d-viewer-foundation
**Areas discussed:** Test model strategy, Canvas persistence pattern, Tone mapping configuration, HDRI selection, Metal preset scope
**Mode:** Auto (--auto flag) — all gray areas selected, recommended defaults chosen

---

## Test Model Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| SheenChair.glb for dev | Use existing test model, replace with real trophy .glb later | ✓ |
| Source a trophy-like model | Find a more representative test model online | |
| Wait for real Cinema 4D export | Block on Alex providing a real trophy .glb | |

**User's choice:** [auto] SheenChair.glb for dev (recommended default)
**Notes:** SheenChair.glb already in /public/models/. Has enough geometry complexity to validate reflections. Avoids blocking on external dependency.

---

## Canvas Persistence Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent Canvas at layout level | Mount once in App.tsx, swap scene content on route change | ✓ |
| Canvas per page component | Mount/unmount Canvas with each route | |
| Offscreen Canvas with portal | Render offscreen and portal into view | |

**User's choice:** [auto] Persistent Canvas at layout level (recommended default)
**Notes:** Safari has hard limit of ~8-16 WebGL contexts. Per-page Canvas would crash iPhones. This is an irreversible architectural decision identified in pitfalls research.

---

## Tone Mapping Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Canvas gl prop only | ACES on renderer, disable/omit in postprocessing | ✓ |
| Postprocessing only | No tone mapping on renderer, ACES in effect composer | |
| Both (default mistake) | ACES on renderer AND in postprocessing — double tone mapping | |

**User's choice:** [auto] Canvas gl prop only (recommended default)
**Notes:** Double tone mapping is the #1 render quality killer per pitfalls research. Metals look washed-out and grey. Must be correct from day one.

---

## HDRI Selection

| Option | Description | Selected |
|--------|-------------|----------|
| studio_small_09_2k.hdr | Already downloaded, Poly Haven CC0, professional studio lighting | ✓ |
| pav_studio_03 | Alternative Poly Haven studio HDRI (needs download) | |
| photo_studio_loft_hall | Larger studio space HDRI (needs download) | |

**User's choice:** [auto] studio_small_09_2k.hdr (recommended default)
**Notes:** Already downloaded to /public/hdri/. 2K resolution balances quality and mobile performance. Can evaluate alternatives later.

---

## Metal Preset Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All 8 presets, validate 3 | Implement full set, visually validate gold/silver/chrome | ✓ |
| Only 3 core presets | polishedGold, polishedSilver, chrome only | |
| All 8 with full validation | Validate every preset visually in Phase 1 | |

**User's choice:** [auto] All 8 presets, validate 3 (recommended default)
**Notes:** Implementing all 8 is low cost (data file). Visual validation of the 3 most demanding presets proves the approach works for all.

---

## Claude's Discretion

- OrbitControls damping, zoom limits, pan limits
- Loading spinner design
- Trophy info panel minimal layout
- Bloom fine-tuning within CLAUDE.md ranges
- ContactShadows opacity/blur values
- Auto-rotate speed and idle timeout
- Vite config and tsconfig specifics

## Deferred Ideas

None — discussion stayed within phase scope.
