# R6.1 Phase 2 — Full Set (Beyond Shape) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move from shape-complete (250→267/268 shell) to R6.1 full set per owner list, without fabricating unavailable content.

**Architecture:** Shared, route-level components (chart, what-if, capability contract, cross-tool graph, evidence chips) driven by a pure per-tool manifest + deterministic engines. No per-tool hand patching; engines stay pure. C4/C5/C8/C11 remain `NOT_AVAILABLE` unless a real engine supplies them.

**Tech Stack:** Next.js 15.5 / React 19 / TS 5.8, existing `R6ToolShell`, `ResultBoxes`, `lib/tools/r6/manifest`, `lib/tools/loaders`, Vitest, existing engines under `lib/tools/engines/`.

**Spec:** `docs/MRX Genius Cloud Unified R6.1/SPEC.md` (SPEC-R6.1-1..7) + `ACCEPTANCE_CRITERIA.md` (ACC-R6.1-1..5) + `R6.1-CLOSURE-LAYER.md` (E0-E5, CAN/CANNOT contract, Crosswalk). This plan implements the **owner's Phase 2 list below**, not the full W01-W24 cloud program.

## Global Constraints
- Progress `N/268` (catalog ordinal). Coverage baseline: 267/268 (macro last).
- Route shell + manifest + codemod only for shape; Phase 2 adds **shared** components only — no per-tool hand edits of `components/tools/tool-*.tsx` except codemod tags.
- C4/C5/C8/C11 = `NOT_AVAILABLE` unless a real deterministic/engine source exists. No fabricated confidence (94–98% banned without calibrated eval), no invented third option, no guessed warnings.
- Tool 132 stays checklist-only. No MediaPipe/video claim. No voice/vision without consent + capability contract.
- No DB writes, no migrations, no merge, no production deploy. R6.1 remains **NOT ACTIVE** until owner says so. No tool marked `R6.1 DONE` until its Phase 2 items in this plan exist and verify.

## Review Focus
- A tool with no 3-segment composition must NOT get a pie chart (show `NOT_APPLICABLE` with reason, not a decorative pie).
- What-If must re-run the tool's **real** engine with a perturbed input; it must never rescale the displayed result.
- C4/C5/C11 must stay `NOT_AVAILABLE` for tools without an engine/method — the verifier must fail if a box claims `engine` without provenance.
- Cross-tool links must resolve to published routes with freshness + `isStale` disclosure; a dead link is worse than no graph.
- Voice/vision input without explicit consent + sandbox + text equivalent must not ship.

---

## 1. Scope: owner Phase 2 list (normative for this plan)

1. Pie Chart (3 arrows) **where it applies** (SPEC §7.1/7.2).
2. Real What-If (C8), not `NOT_AVAILABLE`, **where engine supports re-evaluation** (SPEC Box 8).
3. Real C4 Predictions + C5 AI Coach + C11 Alternative Paths **where engine exists** (SPEC Box 4/5/11).
4. Cross-Tool Graph / Related Tools linking (SPEC §11).
5. SEO + Dynamic UI full (SPEC §5.1, ACCEPTANCE §13/14).
6. Evidence labels E0–E5 + CAN/CANNOT/SOURCES/WHY/COST/STOP (SPEC §4/§3.5, R6 contract).
7. Voice + Vision **where tool needs it** (SPEC §4 multimodal, R7 gates).

**Shape-complete ≠ R6.1 DONE.** A tool is `R6.1 DONE` only when every applicable item above is present or explicitly `NOT_APPLICABLE` with reason + E-level + verifier pass. Batches 01/02/03 shell boxes are **not** DONE.

## 2. Current baseline (measured, read-only)

| Fact | Value |
|---|---|
| Published routes | 268; shell coverage 267/268 (macro last) |
| Shape today | C1–C12 present; C4/C5/C8/C11 = `NOT_AVAILABLE` (honest); C6/C3 also `NOT_AVAILABLE`; sliders on tagged `min+max` fields |
| Pie/conic-gradient | 8 hits repo-wide (nutrition pilots) — no shared 3-arrow component |
| What-If | 91 `whatIf` hits, mostly unused data fields; no shared re-evaluation UI |
| Cross-tool | 21 hits; only prev/next links + C12 next-tool text; no graph, no freshness |
| SEO | 104 hits for `jsonLd/canonical/openGraph` in smarttools routes — base present, full audit missing |
| Voice | `components/smarttools/VoiceCommandButton.tsx` (nav intent only) + `v5-genius/engines/core/future/voice.ts` — no per-field voice, no capability contract |
| Vision | No MediaPipe/getUserMedia in shipped tools (Tool 132 checklist-only by owner rule) |
| Evidence | E0–E5 + CAN/CANNOT defined in docs; no UI chips, no `GeniusTooltip` source beyond engine/static/not_available |

## 3. File structure

**Create:**
- `lib/tools/r6/phase2-manifest.ts` — pure: per-tool applicability (chart kind, what-if field, C4/C5/C11 method, cross-tool edges, evidence level, voice/vision need).
- `components/tools/r6/R6PieChart.tsx` — shared 3-segment donut + SVG arrows + legend + text equivalent.
- `components/tools/r6/R6WhatIf.tsx` — shared What-If control (current/scenario/delta) that re-invokes the engine.
- `components/tools/r6/R6CapabilityContract.tsx` — CAN/CANNOT/SOURCES/WHY/COST/STOP/RESTORE + E0–E5 chip.
- `components/tools/r6/R6CrossToolGraph.tsx` — related-tools graph with freshness/stale.
- `lib/tools/r6/phase2-manifest.test.ts`, `components/tools/r6/R6*.test.tsx` — unit/DOM tests.
- `scripts/r6/verify-phase2.mjs` — asserts Phase 2 markers per tool (EN+AR).
- `docs/MRX Genius Cloud Unified R6.1/phase2-evidence.md` — per-tool matrix (tool, items 1–7, E-level, verdict).

**Modify:**
- `lib/tools/r6/boxes.ts` — consume phase2-manifest to emit real C4/C5/C8/C11 content **only** when method exists; else keep `NOT_AVAILABLE`.
- `components/tools/r6/R6ToolShell.tsx` — mount chart/what-if/capability/graph where manifest says applicable.
- `app/smarttools/[category]/[tool]/page.tsx` — extend JSON-LD/FAQ SEO only; no new per-tool markup.
- `lib/tools/loaders.ts` — macro override (see §5).

**Do not modify:** `lib/tools/engines/**`, `shared/ui/**`, Header/Footer, Supabase, migrations, frozen 5 tool UIs.

## 4. Dates

Assuming 1 implementer, owner review gates between phases, weekday cadence (owner already approved Phase 0/Pilot + Phase 1):

| Window | Work | Exit gate |
|---|---|---|
| **12–13 Nov 2026** | Batch 03 (next 28 + bespoke-8 sliders) + macro ruling implementation | tsc 0, build 506/506, verifiers PASS, screenshots |
| **14–16 Nov 2026** | Task P2-A applicability matrix + capability contract component (item 6) | unit tests PASS, 5 sample tools show E-chip + 7-part contract |
| **17–19 Nov 2026** | Task P2-B pie chart + What-If (items 1–2) on nutrition/body-composition subset | chart data = engine values, What-If re-evaluates, AR/EN |
| **20–22 Nov 2026** | Task P2-C real C4/C5/C11 where engine exists (item 3) + cross-tool graph (item 4) | no fabricated confidence, links resolve + freshness shown |
| **23–25 Nov 2026** | Task P2-D SEO/dynamic full audit (item 5) + evidence matrix close-out (item 6) | Lighthouse/a11y pass on samples, matrix published |
| **26 Nov 2026** | Task P2-E voice/vision contracts only (item 7) — design + capability-gated stubs, **no new inference** | contract + consent tests; 132 still checklist-only |
| **27–30 Nov 2026** | Phase 2 close-out + batches 04–05 shape (28 each) interleaved | full 268 verifier, owner review, R6.1 still NOT ACTIVE |

Batch 03 alone: **2 working days** (codemod + build/verify + screenshots). Full Phase 2 set: **~4 weeks** to reach `R6.1 DONE` for the first full crossing (nutrition + body-composition + training), remaining categories continue in same pattern. No date is a DONE claim — each exit gate is owner-accepted.

## 5. Macro (19th shadow) ruling — DO NOT DELETE, DO NOT SWITCH ENGINE

**Ruling: loader-override (same pattern as tool-108), then delete bespoke.**

- Bespoke `app/smarttools/nutrition/macro/page.tsx` renders `macro-pilot` (catalog `componentPath: @/components/tools/macro-pilot`).
- Dynamic route currently resolves slug `macro` → `components/tools/macro.tsx` (legacy `MacroCalculator`), which is a **different engine**.
- Wrapper approach (keep bespoke + add shell inside it) was rejected: it forks route chrome (breadcrumb/safety/prev-next/progress) into a second code path and invites drift.
- Loader-override keeps **macro-pilot** as the rendered component while gaining the shared chrome + shell + progress (`N/268`) — identical to the tool-108 Phase 1 ruling, with a RED→GREEN test (`getToolComponent('macro').name` contains `Pilot`) before deleting the bespoke file.
- **Guard:** if `macro-pilot` cannot render inside the dynamic `max-w-6xl` wrapper (build/verify fail), fall back to wrapping bespoke **without** deleting it — never switch to legacy `macro.tsx`.
- Cost if wrong: macro gains breadcrumb/prev-next/progress it previously lacked (desired consistency); engine output unchanged (pilot preserved). If pilot is incompatible, we keep bespoke and report BLOCKED, not NOT DONE.

## 6. Batch 03 (next 28)

Batch 03 = next 28 codemod targets in same bounded-`min+max` ranking, **plus** the 8 bespoke tools with tagged-eligible fields deferred from Phase 1, merged and capped at 28, in this order:

**Bespoke-8 (sliders once shell exists):** tool-149, tool-131, tool-129, tool-134, tool-136, tool-140, tool-143, tool-144 (tool-108 canonical excluded — route serves pilot with 0 bounded fields; tool-126/127/128/130/133/135/145/146/148 have 0 bounded fields and are tooltip-only).

**Fresh next-20 (rank order):** tool-080, tool-084, tool-086, tool-112, tool-251, tool-010, tool-016, tool-021, tool-034, tool-039, tool-041, tool-043, tool-044, tool-047, tool-056, tool-061, tool-063, tool-065, tool-067, tool-068.

`scripts/r6/batch-03.txt` is generated from this list; codemod dry-run counts, `tsc --noEmit`, `npm run build`, and `verify-routes` (EN+AR) are the batch gate. Tools failing twice go to `scripts/r6/quarantine.txt`, not blocking the batch.

## 7. Task outline (bite-sized)

### Task P2-0: Macro + Batch 03 (12–13 Nov)
- [ ] Add `macro` loader-override test (RED) → implement (GREEN) → delete bespoke → `verify-routes` macro EN+AR PASS.
- [ ] Generate `batch-03.txt`, codemod dry-run → `--write`, `tsc`, build, verifiers, screenshots (pie not yet), commit `r6_phase2_macro_batch03_NO_DB`.

### Task P2-A: Applicability matrix + capability contract (14–16 Nov)
- [ ] **Test:** `phase2-manifest` returns applicable/NA for 5 probe tools (nutrition, body-comp, training, reference, checklist) — RED.
- [ ] **Implement:** matrix + `R6CapabilityContract` (7 parts + E-chip) — GREEN; wire into shell as `NOT_APPLICABLE` with reason where inapplicable.
- [ ] Commit `r6_phase2_capability_NO_DB`.

### Task P2-B: Pie chart + What-If (17–19 Nov)
- [ ] **Test:** `R6PieChart` data = engine values; `R6WhatIf` re-invokes engine (mock engine called with perturbed value) — RED→GREEN.
- [ ] **Implement:** shared components; mount only where matrix says applicable; AR/EN + text equivalent + keyboard — GREEN.
- [ ] Commit `r6_phase2_chart_whatif_NO_DB`.

### Task P2-C: Real C4/C5/C11 + cross-tool graph (20–22 Nov)
- [ ] **Test:** C4/C5/C11 stay `NOT_AVAILABLE` without engine; with engine they carry `source: engine` + provenance — RED→GREEN.
- [ ] **Implement:** engine-backed C4/C5/C11 (rule-based/statistical, no LLM calls) + `R6CrossToolGraph` (freshness + stale) — GREEN.
- [ ] Commit `r6_phase2_c4c5c11_crosstool_NO_DB`.

### Task P2-D: SEO + Dynamic full + evidence matrix (23–25 Nov)
- [ ] **Test:** JSON-LD/canonical/FAQ/Breadcrumb/PrevNext resolve for 5 samples in EN+AR — RED→GREEN.
- [ ] **Implement:** SEO completion (sitemap, FAQ schema, canonical) + `phase2-evidence.md` matrix with E-levels — GREEN.
- [ ] Commit `r6_phase2_seo_evidence_NO_DB`.

### Task P2-E: Voice/Vision contracts (26 Nov)
- [ ] **Test:** voice/vision without consent + sandbox + text equivalent fails; Tool 132 has no MediaPipe — RED→GREEN.
- [ ] **Implement:** capability-gated stubs + consent UI only; **no new inference, no cloud upload, no prod spend** — GREEN.
- [ ] Commit `r6_phase2_voice_vision_contracts_NO_DB`.

### Task P2-F: Close-out (27–30 Nov)
- [ ] `tsc`, build, `verify-routes` all 268, `verify-phase2` spot-check, screenshots, coverage table (shell vs R6.1 DONE columns distinct), owner review. R6.1 stays NOT ACTIVE.

## 8. Verification commands (PowerShell)
```
npx tsc --noEmit
npm run build
node scripts/r6/verify-routes.mjs scripts/r6/batch-03.txt
node scripts/r6/verify-phase2.mjs
npx vitest run lib/tools/r6 components/tools/r6
```

## 9. Risks
- Engine absence: most tools have no prediction/alternative method — honest `NOT_AVAILABLE` remains the majority outcome; that is correct, not incomplete.
- Chart mismatch: reuse of nutrition pie for non-composition tools would be fabrication — applicability matrix gates it.
- Cross-tool freshness values (7d/1d/90d) are SPEC examples, not validated policy — ship as documented examples with review, not as clinical rules.
