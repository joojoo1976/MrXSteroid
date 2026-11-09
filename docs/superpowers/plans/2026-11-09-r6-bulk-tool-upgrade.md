# R6 Bulk Tool Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every published SmartTool the R6.1 presentation shape (C1–C12 boxes, field tooltips, sliders where sensible, progress + prev/next, EMPTY/PARTIAL/FULL badge) without editing 250+ tool files by hand.

**Architecture:** One route-level shell wraps every tool once in `app/smarttools/[category]/[tool]/page.tsx`. A generated manifest supplies per-tool identity, progress index, category, neighbors and honest box content. A client-side field layer attaches tooltips and state detection to the tool's existing inputs through event delegation. Per-tool code is touched only by a codemod that tags numeric fields for sliders, in batches of 28.

**Tech Stack:** Next.js 15.5 (App Router), React 19, TypeScript 5.8, Tailwind, Vitest + Testing Library. No new runtime dependencies.

**Spec:** `docs/MRX Genius Cloud Unified R6.1/R6.1-CLOSURE-LAYER.md`, `docs/GENIUS_TOOL_STANDARD_V3.md`, current implementations in `components/tools/ResultBoxes.tsx`, `components/tools/GeniusTooltip.tsx`, `components/tools/DynamicStateBadge.tsx`.

## Global Constraints

- No DB writes, no Supabase mutation, no merge, no production deploy, no Batch 2, no Tool 263, R6.1 stays NOT ACTIVE until the owner says otherwise.
- Engines stay pure: no React, DOM, Date, storage or I/O inside `lib/tools/engines/**`.
- No new Header/Footer buttons. Existing Header/Footer language, measurement and theme behaviour stays untouched.
- 12 boxes use the fixed `GENIUS12_META` order and colors from `components/tools/ResultBoxes.tsx`; C1–C5 compact, C1–C12 full, C1 identical in both.
- Missing capabilities are rendered as `NOT_AVAILABLE`, never fabricated. Tool 132 remains a checklist and must say it does no video/MediaPipe analysis.
- Tooltip rules: hover + tap + keyboard (Enter/Space/Esc), AR/EN, dark/light/system, `role="tooltip"`, `aria-expanded`, source label (`engine` / `static` / `NOT_AVAILABLE`), no empty copy, click-outside closes.
- Verification per batch: `npx tsc --noEmit` 0 errors, `npm run build` success (506 pages today), route smoke test for every touched route.
- Commit messages use underscores (PowerShell rejects spaces in `-m`): `r6_bulk_batch_NN_NO_DB`.
- Only commit R6 files. The unrelated WIP currently in the working tree (dashboard metrics, pilots, shared/ui, tests, R5 docs) must be excluded.

## Current Baseline (measured 2026-11-09)

| Fact | Value |
|---|---|
| Tool component files under `components/tools/tool-*.tsx` | 257 |
| Catalog entries with a `slug` | 269 |
| Published routes returned by `getPublishedCatalogTools()` | 268 (`generateStaticParams`) |
| Tool files already using `ResultBoxes` + `GeniusTooltip` + `DynamicStateBadge` | 5 (111, 132, 137, 138, 139) |
| Tool files using `GeniusSlider` | 0 |
| Tool files using `type="range"` | 1 |
| Tooltip i18n JSON files | 123 |
| Breadcrumb + bottom prev/next | already global in the dynamic route page |
| Progress `N/268` | now implemented globally; total is 268 |

The owner's "~286" and the repo's 268 published routes differ. The route-level shell covers every published route, so the exact count cannot cause a miss.

### Known route gap found in Phase 0

18 published tools have a **bespoke route file** (`app/smarttools/<category>/<slug>/page.tsx`) that shadows `app/smarttools/[category]/[tool]/page.tsx`. They bypass the shared route and therefore do not receive the shell in Phase 0:

```
tool-108-ai-body-composition-vision-engine      tool-134-mobility-movement-symmetry-screen
tool-126-neuromuscular-explosiveness-modeler      tool-135-exercise-substitution-ai
tool-127-ai-daily-readiness-explainer             tool-136-physique-golden-ratio-score
tool-128-training-load-acute-chronic-ratio        tool-140-dosage-unit-conversion-engine
tool-129-ai-adaptive-training-planner             tool-143-storage-stability-thermal-degradation-estimator
tool-130-ai-plateau-detective                     tool-144-homebrew-chemistry-calculator
tool-131-transformation-forecast-trajectory-engine tool-145-habit-intelligence-consistency-coach
tool-133-rep-tempo-velocity-loss-analyzer         tool-146-ai-safety-gate-emergency-protocol
                                                  tool-148-personal-fitness-memory-layer
                                                  tool-149-physique-trajectory-simulator
```

Phase 0 therefore covers **250 of 268** routes through the shared shell (`268 − 18`), of which 5 are frozen (progress line only). The remaining 18 are Phase 1 route-normalization work: each bespoke page renders a different pilot component, so they must be migrated deliberately, not blanket-wrapped. No tool is claimed as upgraded until its route exposes the shell.

## File Structure

Create:

- `lib/tools/r6/manifest.ts` — pure functions: published tool list, per-slug index/total, per-slug box content, neighbor lookup. No React.
- `lib/tools/r6/manifest.test.ts` — unit tests for index, C1–C12 order, NOT_AVAILABLE defaults, 5-tool exemption.
- `components/tools/r6/R6ToolShell.tsx` — client shell: progress, badge, 12 boxes, field tooltip layer, slider enhancer portal.
- `components/tools/r6/R6FieldLayer.tsx` — client event-delegation tooltips + EMPTY/PARTIAL/FULL observer.
- `components/tools/r6/R6Progress.tsx` — server-safe progress line `Tool N/268`.
- `components/tools/r6/R6ToolShell.test.tsx` — DOM tests for 12 boxes, tooltip open/Esc/click-outside, badge transitions.
- `scripts/r6/tag-slider-fields.mjs` — TypeScript-AST codemod; adds `data-r6-slider` + bounds to numeric inputs that already have `min`/`max`.
- `scripts/r6/verify-routes.mjs` — starts the built app and asserts HTTP 200 + C1..C12 presence for a slug list.
- `docs/superpowers/plans/2026-11-09-r6-bulk-tool-upgrade.md` — this file.

Modify:

- `app/smarttools/[category]/[tool]/page.tsx` — render `<R6ToolShell>` around `<ToolComponent />`; add `<R6Progress>` under the breadcrumb; keep existing top breadcrumb and bottom prev/next.
- `components/tools/ResultBoxes.tsx` — only if a `data-source` label slot is needed; otherwise unchanged.

Do not modify:

- `components/tools/tool-111-*.tsx`, `tool-132-*.tsx`, `tool-137-*.tsx`, `tool-138-*.tsx`, `tool-139-*.tsx` in Phase 0. They are exempt from the shell boxes because they already render their own; their UI is frozen per owner decision.
- `lib/tools/engines/**`, `shared/ui/**`, Header/Footer, Supabase, migrations.

## Review Focus

- A tool with zero inputs (reference/lookup tool) must still show 12 boxes and an EMPTY/PARTIAL/FULL badge without crashing.
- A tool whose root is RTL or whose inputs are generated dynamically must still get tooltips after re-render.
- A numeric field without `min`/`max` must never receive a guessed slider range.
- A tool slug that is not in the catalog must not render a shell around a 404.
- The 5 already-upgraded tools must not show duplicate C1–C12 blocks.

---

## Task 0: Manifest and progress index

**Files:**
- Create: `lib/tools/r6/manifest.ts`
- Test: `lib/tools/r6/manifest.test.ts`

**Interfaces:**
- `getR6ManifestEntry(slug: string): R6ManifestEntry | null`
- `buildR6Boxes(entry: R6ManifestEntry, locale: 'ar' | 'en'): Array<{ id: string; title: string; content: string }>`
- `type R6ManifestEntry = { slug: string; index: number; total: number; titleEn: string; titleAr: string; descriptionEn: string; descriptionAr: string; categorySlug: string; prevSlug: string | null; nextSlug: string | null; hasOwnBoxes: boolean }`
- `R6_EXEMPT_SLUGS = new Set(['tool-111-smart-food-macro-substitution', 'tool-132-ai-pose-form-coach', 'tool-137-peptide-hormone-reconstitution-calculator', 'tool-138-raw-powder-density-oil-formulation-engine', 'tool-139-solvent-emulsifier-ratio-calculator'])`

- [ ] **Step 1: Write the failing test.** Assert: `getR6ManifestEntry('tool-111-smart-food-macro-substitution')?.index === 111`; total is `252` for numbered slugs; `buildR6Boxes` returns exactly 12 entries in C1..C12 order; C3/C4/C5/C8/C11 are `NOT_AVAILABLE`; unknown slug returns `null`; the 5 exempt slugs have `hasOwnBoxes === true`.
- [ ] **Step 2: Run it.** `npx vitest run lib/tools/r6/manifest.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement.** Derive entries from `getPublishedCatalogTools()`, `getCategoryOfSlug`, `getToolNeighbors`, sorted by catalog order. Parse `tool-(\d{3})` for display index; fall back to array position. C1 = educational/medical disclaimer, C2 = catalog description, C7 = safety notice pointer, C9 = deterministic-engine explanation, C10 = input-dependent uncertainty, C12 = next tool title; C3/C4/C5/C6/C8/C11 = `NOT_AVAILABLE`.
- [ ] **Step 4: Run it.** `npx vitest run lib/tools/r6/manifest.test.ts` → PASS.
- [ ] **Step 5: Commit.** `git add lib/tools/r6/manifest.ts lib/tools/r6/manifest.test.ts` then `git commit -m r6_bulk_manifest_NO_DB`.

## Task 1: R6 progress and shell frame

**Files:**
- Create: `components/tools/r6/R6Progress.tsx`, `components/tools/r6/R6ToolShell.tsx`
- Test: `components/tools/r6/R6ToolShell.test.tsx`
- Modify: `app/smarttools/[category]/[tool]/page.tsx`

**Interfaces:**
- `<R6Progress index={number} total={number} locale={'ar'|'en'} />` renders `Tool {index}/{total}` with `<progress>` and `aria-valuenow`.
- `<R6ToolShell entry={R6ManifestEntry} locale={'ar'|'en'}>{children}</R6ToolShell>` renders: progress, children, badge, and `<ResultBoxes compact={false} boxes={...} />` unless `entry.hasOwnBoxes`.

- [ ] **Step 1: Write the failing test.** Render the shell for `tool-132` with locale `en`; assert 12 `[data-box-id]` nodes are absent (exempt) and progress is `132/252`. Render for `tool-001`; assert 12 nodes exist in order C1..C12, a `role="status"` badge exists, and `data-source` labels include `static` or `NOT_AVAILABLE`.
- [ ] **Step 2: Run it.** `npx vitest run components/tools/r6/R6ToolShell.test.tsx` → FAIL.
- [ ] **Step 3: Implement.** Server-safe progress; client shell with a single `<div data-r6-shell>` wrapper. Wire into `page.tsx` after the breadcrumb and around `ToolComponent`.
- [ ] **Step 4: Run it.** `npx vitest run components/tools/r6/R6ToolShell.test.tsx` → PASS. Then `npx tsc --noEmit` → 0 errors.
- [ ] **Step 5: Commit.** `git add components/tools/r6 app/smarttools` then `git commit -m r6_bulk_shell_NO_DB`.

## Task 2: Global field tooltip layer

**Files:**
- Create: `components/tools/r6/R6FieldLayer.tsx`
- Test: `components/tools/r6/R6ToolShell.test.tsx` (extend)

**Interfaces:**
- `<R6FieldLayer toolTitle={string} locale={'ar'|'en'}>{children}</R6FieldLayer>`
- Behaviour: `pointerenter` + `focusin` on `input, select, textarea` opens one fixed-position tooltip; `Enter`/`Space` on a focused field opens it; `Esc`, `click` outside, or blur closes it; `aria-describedby` points at the tooltip; `aria-expanded` mirrors state.
- Copy rule: label text = `aria-label` → associated `<label>` → `name` → `placeholder`. Description = existing `title`/`data-tip` when present; otherwise one specific sentence: `{label} input for {toolTitle}. Processed locally by the tool engine; nothing is stored or sent.` Source = `static`.
- No empty strings; if no label can be found, skip the field rather than show generic copy.

- [ ] **Step 1: Add failing tests.** Table-driven render with a labelled input, an unlabelled input, and a `<select>`. Assert tooltip opens on focus, closes on Esc, closes on outside click, unlabelled field is skipped, and `aria-expanded` toggles.
- [ ] **Step 2: Run tests** → FAIL.
- [ ] **Step 3: Implement** with a `useRef` container, one `useState` for `{label, description, rect, source}`, and a single `position: fixed` tooltip portal.
- [ ] **Step 4: Run tests** → PASS.
- [ ] **Step 5: Commit.** `git commit -m r6_bulk_tooltips_NO_DB`.

## Task 3: EMPTY / PARTIAL / FULL observer

**Files:**
- Create: inside `R6FieldLayer.tsx`
- Test: `components/tools/r6/R6ToolShell.test.tsx`

**Interfaces:**
- Observe `input, select, textarea` under the shell (excluding `type=hidden`, `type=submit`, `type=button`).
- `EMPTY` = 0 filled; `PARTIAL` = 1..n-1 filled or 0 inputs; `FULL` = all filled and no validation alert present (`[role="alert"]`).
- Render `<DynamicStateBadge state=... locale=... missingFields=... />` with a stable `data-state`.

- [ ] **Step 1: Failing tests.** Empty form → EMPTY; type one value → PARTIAL; fill all → FULL; zero inputs → PARTIAL (reference tool, never a false FULL).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** with `MutationObserver` + `input`/`change` listeners and a `requestAnimationFrame` throttle.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit.** `git commit -m r6_bulk_state_NO_DB`.

## Task 4: Slider codemod (opt-in, batched)

**Files:**
- Create: `scripts/r6/tag-slider-fields.mjs`
- Modify: 28 tool files per batch (only where a numeric input already declares both `min` and `max`).

**Interfaces:**
- Codemod adds `data-r6-slider="true"` and keeps existing `min`/`max`/`step`.
- `R6FieldLayer` upgrades only tagged inputs: hides the native number input visually, renders a `GeniusSlider`-style track + dot + bubble + ticks, and writes back through the native input setter + `input`/`change` events so React state stays canonical.
- Numeric inputs without `min` and `max` are left untouched (no guessed ranges).

- [ ] **Step 1: Write a fixture test** with one eligible and one ineligible numeric input; run codemod in dry-run and assert only the eligible file changes.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** using the TypeScript compiler API (already installed) and a `--write` flag; default is dry-run.
- [ ] **Step 4: Run** on 28 files; `npx tsc --noEmit`; `npm run build`.
- [ ] **Step 5: Commit** the codemod + the 28 files: `r6_bulk_sliders_batch_01_NO_DB`.

## Task 5: Route verification script

**Files:**
- Create: `scripts/r6/verify-routes.mjs`

**Interfaces:**
- Input: newline-separated slugs from `scripts/r6/batch.txt`.
- Starts `npm run start` on port 3111, waits for readiness, fetches each route with `x-locale: en` and `x-locale: ar`, asserts status 200 and `data-box-id="C12"` when the tool is not exempt.
- Prints `PASS n/n` or a list of failures; exits non-zero.

- [ ] **Step 1: Implement and run against the current build** with the 5 sample slugs; expect PASS.
- [ ] **Step 2: Add the 28 pilot slugs; run** → PASS.
- [ ] **Step 3: Commit.** `r6_bulk_verify_NO_DB`.

## Task 6: Pilot batch — 28 tools

Pick 28 tools across at least 5 categories, including one reference/lookup tool, one checklist tool, one tool with numeric inputs, one with selects only, and one RTL-heavy tool.

- [ ] **Step 1:** Generate `scripts/r6/batch-01.txt`.
- [ ] **Step 2:** Run codemod dry-run, review diff, then `--write`.
- [ ] **Step 3:** `npx tsc --noEmit` → 0 errors.
- [ ] **Step 4:** `npm run build` → success (506+ pages).
- [ ] **Step 5:** `node scripts/r6/verify-routes.mjs scripts/r6/batch-01.txt` → PASS 28/28 in EN and AR.
- [ ] **Step 6:** Capture local screenshots of 3 pilot routes with the browser tool (12 boxes, tooltip open, slider, badge).
- [ ] **Step 7:** Commit + push. Return commit hash + branch preview URLs.

## Task 7: Remaining batches (28 tools each)

252 remaining = 9 batches of 28.

| Batch | Tools | Focus |
|---|---|---|
| 01 (pilot) | 28 | mixed categories, edge cases |
| 02–04 | 84 | nutrition + body composition + training |
| 05–06 | 56 | hormonal + medical monitoring |
| 07–08 | 56 | injection/formulation + pharmacokinetics |
| 09 | 28 | cycle management + reference/lookup + leftovers |

Each batch repeats Task 6 steps 1–7. A batch is accepted only with `PASS 28/28` EN+AR and 0 TS errors. Any tool that fails twice is quarantined into `scripts/r6/quarantine.txt` with the reason; it does not block the batch.

## Task 8: Close-out report

- [ ] Run `npx tsc --noEmit` → 0 errors.
- [ ] Run `npm run build` → success, record page count.
- [ ] Run `node scripts/r6/verify-routes.mjs scripts/r6/all.txt` → PASS for every published route.
- [ ] Produce a coverage table: route, boxes, tooltip, slider (yes/N-A), badge, locale, status.
- [ ] Commit docs only: `r6_bulk_closeout_NO_DB`.
- [ ] Do not merge, do not promote, do not mark R6.1 ACTIVE. Owner decides.

---

## Timeline (realistic, based on this repo)

| Phase | Work | Working days |
|---|---|---|
| Phase 0 | Tasks 0–5: manifest, shell, tooltip layer, badge, codemod, verifier | 2–3 |
| Pilot | Task 6: 28 tools + build + screenshots | 1 |
| Batches 02–09 | 224 tools, 28 per batch, ~0.5 day codegen + ~0.5 day build/verify | 8 |
| Buffer | Fixes for quarantine/edge tools | 2–3 |
| **Total** | **every published route shape-complete** | **13–15 working days (~3 weeks calendar)** |

The first commit and the first 5 preview links arrive at the end of Phase 0 + Pilot, not at the end of all 9 batches. No batch waits for the previous batch's manual review to start coding; only the build/verify gate is serial.

## Explicit Non-Goals

- No real AI vision for Tool 132. Checklist only, labelled honestly.
- No fabricated C4/C5/C8/C11 content. `NOT_AVAILABLE` until a real engine exists.
- No schema or DB migration, no Supabase write, no auth/session work.
- No design rewrite of tools that already pass R6.1 (the 5 samples stay frozen).
- No merge to main and no production promotion.

## Verification Commands (PowerShell)

```powershell
npx tsc --noEmit
npm run build
npx vitest run lib/tools/r6/manifest.test.ts components/tools/r6/R6ToolShell.test.tsx
node scripts/r6/verify-routes.mjs scripts/r6/batch-01.txt
git status --short
```
