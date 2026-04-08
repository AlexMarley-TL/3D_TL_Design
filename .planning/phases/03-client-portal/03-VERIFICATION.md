---
phase: 03-client-portal
verified: 2026-04-08T15:30:00Z
status: gaps_found
score: 8/9 must-haves verified
re_verification: false
gaps:
  - truth: "Single-iteration options navigate directly to 3D viewer instead of expanding"
    status: partial
    reason: "Option B — Classical has slug 'v1', which collides with Option A — Contemporary's 'v1' within the same project. IterationDetail.flatMap finds the first match, so navigating to /project/nations-2026/v1 via Option B always displays Option A's iteration data (polishedGold, 470mm) instead of Option B's (polishedSilver, 450mm). The navigation works but shows wrong data."
    artifacts:
      - path: "src/data/projects.ts"
        issue: "options 'option-a-contemporary' and 'option-b-classical' both contain an iteration with slug 'v1'; within a single project, iteration slugs must be unique across all design options for the flatMap lookup in IterationDetail to be unambiguous"
      - path: "src/pages/IterationDetail.tsx"
        issue: "flatMap lookup finds first slug match across all options — correct algorithm, but relies on slug uniqueness within a project that the sample data violates"
    missing:
      - "Make iteration slugs unique within a project (e.g., rename Option B's iteration to 'option-b-v1' or 'b-v1') OR scope the lookup to also match by design option slug via the URL"
human_verification:
  - test: "Passcode gate visual and UX on mobile"
    expected: "Passcode card centered on screen, numeric keyboard opens on iPhone, gold border appears on focus, 'Verifying...' label shows briefly during hash check"
    why_human: "Visual layout and mobile keyboard behaviour cannot be verified programmatically"
  - test: "Design option accordion animation"
    expected: "Tapping Option A — Contemporary smoothly expands to show v1 and v2 iteration rows with CSS transition, chevron rotates 90 degrees"
    why_human: "CSS max-height transition smoothness requires visual observation"
  - test: "AR button behaviour from iteration viewer"
    expected: "Tapping 'View in AR' on iPhone launches Apple Quick Look; on Android launches WebXR or Scene Viewer"
    why_human: "AR platform handoff requires physical device testing"
  - test: "localStorage persistence across page refresh"
    expected: "After entering correct passcode, refreshing /project/nations-2026 goes directly to the project landing page without showing passcode again"
    why_human: "localStorage state persistence across full browser refresh needs manual verification"
---

# Phase 3: Client Portal Verification Report

**Phase Goal:** Clients scan a QR code, enter a 4-digit passcode, and browse their project's design options and iterations in 3D with AR
**Verified:** 2026-04-08T15:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Client navigates to `/project/:code` and sees a passcode entry screen | VERIFIED | `ClientPortal.tsx` renders `<PasscodeEntry>` when `!authenticated`; route `/project/:code` wired in `App.tsx` line 49 |
| 2 | Correct 4-digit passcode reveals the project landing page | VERIFIED | `PasscodeEntry.handleSubmit` hashes input, compares to `storedHash`, calls `onAuthenticated()` on match; `ClientPortal` then renders portal header and `DesignOption` cards |
| 3 | Wrong passcode shows an error message and does not grant access | VERIFIED | `PasscodeEntry` sets `error('Incorrect passcode')` on hash mismatch; `onAuthenticated()` not called; error rendered at line 103 |
| 4 | After 5 incorrect attempts a lockout message is displayed | VERIFIED | `MAX_ATTEMPTS = 5`; when `attempts >= MAX_ATTEMPTS` component returns lockout card with text "Too many incorrect attempts. Please contact your project manager." |
| 5 | Returning client who previously authenticated is not asked for passcode again | VERIFIED | `PasscodeEntry` useEffect checks `localStorage.getItem('portal_auth_{projectCode}') === 'true'` on mount and calls `onAuthenticated()` immediately; `ClientPortal` also checks on mount and sets `authenticated: true` |
| 6 | Authenticated client sees expandable design option cards on the project landing page | VERIFIED | `ClientPortal` maps `project.designOptions` to `<DesignOption>` components (line 57); `DesignOption` renders accordion for multi-iteration options |
| 7 | Tapping a design option expands to show child iterations below it | VERIFIED | `DesignOption` uses `useState(false)` for `expanded`; `onClick` toggles; CSS `max-height: 0 / 500px` transition controls visibility |
| 8 | Single-iteration options navigate directly to 3D viewer instead of expanding | PARTIAL | Navigation link is correct — `to={/project/${projectCode}/${iteration.slug}}` — but `nations-2026` sample data has slug collision: Option B's `v1` collides with Option A's `v1`. `IterationDetail.flatMap` always finds Option A's iteration first. Wrong data displayed for Option B. |
| 9 | Tapping an iteration opens the full 3D viewer with AR at `/project/:code/:slug` | VERIFIED | `IterationDetail` at `/project/:code/:slug` calls `onModelChange(iteration.modelPath)`, `onPresetChange(iteration.materials.primary)`, renders `<ARButton>` with `iteration.modelPath`; route wired before `/project/:code` in `App.tsx` |

**Score:** 8/9 truths verified (1 partial)

---

### Required Artifacts

#### Plan 03-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/utils/crypto.ts` | SHA-256 hashing via Web Crypto API | VERIFIED | Exports `hashPasscode(passcode: string): Promise<string>` using `crypto.subtle.digest('SHA-256', ...)` — 7 lines, no stubs |
| `src/data/projects.ts` | Sample ClientProject data with hashed passcodes | VERIFIED | Exports `CLIENT_PROJECTS` (2 entries) and `getProjectByCode`; passcodes are pre-computed SHA-256 hex strings; typed via explicit `.ts` import |
| `src/components/PasscodeEntry.tsx` | 4-digit passcode input with validation, rate limiting, localStorage persistence | VERIFIED | `type="tel"`, `maxLength=4`, `inputMode="numeric"`; imports `hashPasscode`; localStorage write on auth; `MAX_ATTEMPTS = 5`; lockout branch rendered |
| `src/pages/ClientPortal.tsx` | Project landing page with passcode gate | VERIFIED | Uses `useParams`, `getProjectByCode`, `PasscodeEntry`, `DesignOption`; calls `onModelChange(null)` on mount; localStorage check on mount |

#### Plan 03-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/DesignOption.tsx` | Expandable design option card with child iteration list | VERIFIED | Handles `iterations.length === 1` as direct Link; multi-iteration uses accordion with expand state and CSS max-height transition |
| `src/pages/IterationDetail.tsx` | Iteration 3D viewer with AR, reusing TrophyViewer pipeline | VERIFIED | Calls `onModelChange`, `onPresetChange`, `onOriginalMaterialsChange` on mount; auth guard via `localStorage` check with `navigate replace`; renders `<ARButton>` |
| `src/pages/ClientPortal.tsx` (updated) | DesignOption cards replacing placeholder shell | VERIFIED | `project.designOptions.map(option => <DesignOption>)` at lines 56-59; no placeholder text remains |
| `src/App.tsx` | Route for `/project/:code/:slug` | VERIFIED | Route at line 40-48; placed BEFORE `/project/:code` (line 49) for correct specificity |

---

### Key Link Verification

#### Plan 03-01 Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ClientPortal.tsx` | `src/data/projects.ts` | `getProjectByCode(code)` | VERIFIED | Line 13: `const project = getProjectByCode(code ?? '')` |
| `ClientPortal.tsx` | `PasscodeEntry.tsx` | renders when `!authenticated` | VERIFIED | Lines 36-43: `<PasscodeEntry projectCode={...} storedHash={project.passcode} ... />` |
| `PasscodeEntry.tsx` | `src/utils/crypto.ts` | `hashPasscode()` | VERIFIED | Line 2 import; line 39: `const hash = await hashPasscode(passcode)` |
| `App.tsx` | `ClientPortal.tsx` | Route `path="/project/:code"` | VERIFIED | Line 49: `<Route path="/project/:code" element={<ClientPortal onModelChange={handleModelChange} />} />` |

#### Plan 03-02 Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ClientPortal.tsx` | `DesignOption.tsx` | `designOptions.map` | VERIFIED | Lines 56-59: `project.designOptions.map((option) => <DesignOption key={option.slug} option={option} projectCode={project.code} />)` |
| `DesignOption.tsx` | `/project/:code/:slug` | `Link to` each iteration | VERIFIED | Lines 26 and 63: `to={\`/project/${projectCode}/${iteration.slug}\`}` |
| `IterationDetail.tsx` | `src/data/projects.ts` | `getProjectByCode` | VERIFIED | Line 3 import; line 20: `const project = getProjectByCode(code ?? '')` |
| `IterationDetail.tsx` | `ARButton.tsx` | renders AR button | VERIFIED | Line 4 import; line 59: `<ARButton modelPath={iteration.modelPath} usdzPath={iteration.usdzPath} />` |
| `App.tsx` | `IterationDetail.tsx` | Route `path="/project/:code/:slug"` | VERIFIED | Lines 40-48; route correctly placed before `/project/:code` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ClientPortal.tsx` | `project.designOptions` | `CLIENT_PROJECTS` array in `projects.ts` (static) | Yes — 2 real project entries, 3 design options, 5 iterations | FLOWING |
| `PasscodeEntry.tsx` | `storedHash` | Passed as prop from `ClientPortal` (`project.passcode`) | Yes — pre-computed SHA-256 hex strings | FLOWING |
| `IterationDetail.tsx` | `iteration` | `flatMap` across `project.designOptions` | Yes — real iteration data; however slug collision in sample data means wrong iteration may be returned for Option B of `nations-2026` | PARTIAL |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles clean | `npx tsc --noEmit` | No output (zero errors) | PASS |
| Vite production build succeeds | `npm run build` | Built in 1.36s, 701 modules transformed | PASS |
| Phase commits exist in git | `git log --oneline` for hashes 7911a44, 005b7f3, e9c1678, c467d99, 8c0685f | All 5 commits confirmed present | PASS |
| Module exports present | File existence + grep | All 6 new files present; all required exports found | PASS |
| CSS classes present | grep on `globals.css` | All 16 required CSS classes found | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PORT-01 | 03-01 | Client accesses project at `/project/:code` via QR code scan | SATISFIED | Route wired in `App.tsx`; `ClientPortal` at that path |
| PORT-02 | 03-01 | Client enters 4-digit numeric passcode to access designs | SATISFIED | `PasscodeEntry` with `type="tel"`, `maxLength=4`, `inputMode="numeric"` |
| PORT-03 | 03-01 | Passcode validated client-side against SHA-256 hash | SATISFIED | `hashPasscode()` via Web Crypto API; compared to `project.passcode` (SHA-256 hex) |
| PORT-04 | 03-01 | Passcode persists in localStorage so client doesn't re-enter | SATISFIED | `localStorage.setItem('portal_auth_{code}', 'true')` on auth; checked on mount |
| PORT-05 | 03-01 | Rate limiting: max 5 incorrect attempts, then lockout | SATISFIED | `MAX_ATTEMPTS = 5`; lockout branch rendered when `attempts >= MAX_ATTEMPTS` |
| PORT-06 | 03-02 | Project landing shows design options as expandable cards | SATISFIED | `DesignOption` accordion cards rendered via `designOptions.map` |
| PORT-07 | 03-02 | Tapping a design option expands child iterations | SATISFIED | Multi-iteration `DesignOption` uses `useState(expanded)` with CSS max-height transition |
| PORT-08 | 03-02 | Single-iteration options skip expansion and go directly to 3D viewer | PARTIAL | Navigation link correct, but slug collision in sample data (`nations-2026` Option B `v1` = Option A `v1`) causes wrong iteration data to be displayed. The mechanism is correct; the data is flawed. |
| PORT-09 | 03-02 | Each iteration opens full 3D viewer + AR at `/project/:code/:slug` | SATISFIED | `IterationDetail` sets model, preset, and renders `ARButton`; route wired |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/data/projects.ts` | 39 | Iteration slug `'v1'` in `option-b-classical` duplicates slug `'v1'` in `option-a-contemporary` within the same project `nations-2026` | Warning | `IterationDetail.flatMap` lookup returns Option A's iteration when client navigates to Option B's single-iteration link — wrong dimensions and material displayed |
| `src/pages/IterationDetail.tsx` | 22-24 | `flatMap` across all design options finds first slug match, with no design option scope | Info | Correct algorithm for globally unique slugs; becomes a bug when slugs collide within a project |

No placeholder stubs, `return null` short-circuits, empty handlers, or TODO comments found in any phase 3 file.

---

### Human Verification Required

#### 1. Passcode Gate Mobile UX

**Test:** Navigate to `/project/nations-2026` on an iPhone. Tap the passcode input.
**Expected:** Numeric keyboard opens automatically; gold border appears on input focus; entering 4 digits enables the Enter button; tapping Enter shows "Verifying..." briefly then reveals the project landing page.
**Why human:** Mobile keyboard activation, focus styling, and async UI state during hash verification require physical device observation.

#### 2. Design Option Accordion Animation

**Test:** On the authenticated project landing page, tap "Option A — Contemporary".
**Expected:** Child iterations v1 and v2 slide into view smoothly with the CSS max-height transition; chevron rotates 90 degrees. Tapping again collapses smoothly.
**Why human:** CSS transition smoothness and visual quality require live observation.

#### 3. Single-Iteration Direct Navigation (Option B — Classical)

**Test:** After fixing the slug collision (see Gaps), tap "Option B — Classical" on the `nations-2026` project landing page.
**Expected:** Navigates directly to the 3D viewer showing polishedSilver material and 450mm dimensions — no accordion expand step.
**Why human:** Requires verifying the 3D model appears with correct material preset visually.

#### 4. AR Button from Iteration Viewer

**Test:** From any iteration viewer page on iPhone Safari, tap "View in AR".
**Expected:** Apple Quick Look launches with the trophy model at life-size.
**Why human:** AR platform handoff requires physical device with camera.

#### 5. localStorage Persistence Across Full Browser Refresh

**Test:** Enter correct passcode "1234" for `nations-2026`, then close and reopen the tab or hard-refresh.
**Expected:** Project landing page shown immediately without passcode prompt.
**Why human:** localStorage persistence across a full browser session close requires manual testing; programmatic simulation is not reliable.

---

### Gaps Summary

One gap blocks complete goal achievement:

**Iteration slug collision in sample data (PORT-08 partial):** Both `option-a-contemporary` and `option-b-classical` within the `nations-2026` project use iteration slug `'v1'`. The URL `/project/nations-2026/v1` is ambiguous. `IterationDetail`'s `flatMap(...).find(iter => iter.slug === slug)` returns the first match — always Option A's iteration. When a client taps Option B — Classical (which is a single-iteration option and should navigate directly per PORT-08), they arrive at the 3D viewer but see Option A's data (polishedGold, 470mm) instead of Option B's (polishedSilver, 450mm).

**Fix:** Rename the iteration slugs to be unique within the project scope. For example, change Option B — Classical's iteration slug from `'v1'` to `'b-v1'` or `'option-b-v1'`. The route pattern, DesignOption links, and IterationDetail lookup all support this with no code changes — only `src/data/projects.ts` needs updating.

The authentication flow (PORT-01 through PORT-05), expandable cards (PORT-06, PORT-07), and iteration 3D viewer with AR (PORT-09) are all fully implemented and correct.

---

_Verified: 2026-04-08T15:30:00Z_
_Verifier: Claude (gsd-verifier)_
