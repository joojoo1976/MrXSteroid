# R5_FIRST_BATCH — TOOL SELECTION AND IMPLEMENTATION SCOPE

**Project:** MrXSteroid Genius Intelligence V4.0  
**Strategic objective:** Controlled development of the 255-tool SmartTools program  
**Baseline checkpoint:** MACRO V4 — BOUNDED PILOT — grouped closure completed with documented gaps (frozen for now; not re-opened)  
**Date:** 2026-11-05  
**Branch / HEAD:** `main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0` (`origin/main` = `a0af36bf`, ahead 1 / behind 1)  
**Nature of this document:** READ-ONLY tool selection and scope definition. **No application changes are authorized or made by this document. The owner authorizes or rejects this batch in one decision.**

---

## 1. Outcome at a glance

Three published, deterministic, free-tier tools are proposed as the first controlled R5 batch. They were selected against the repository's actual contents, not by number and not by assumption:

| # | toolId | Canonical name | Route (live) | Engine tests | Pilot tests | Risk tier (proposed) |
|---|---|---|---|---|---|---|
| 1 | `mrx.tool.bmi` | Body Mass Index (BMI) | `/smarttools/body-composition/bmi` | 12/12 | 3/3 | LOW |
| 2 | `mrx.tool.protein-needs` | Protein Needs Estimate | `/smarttools/nutrition/protein-needs` | 9/9 | 2/2 | MEDIUM |
| 3 | `mrx.tool.water-intake` | Daily Water Intake Estimate | `/smarttools/nutrition/water-intake` | 7/7 | 2/2 | LOW |

All three routes return HTTP 200 and serve their tool UIs (verified; §10.3). All three engines, schemas, components, pilots and tests exist on disk and pass. All three are already **published** (not `planned`) and load through the accepted `app/smarttools/[category]/[tool]` dynamic route. No registry, catalog, route, template, contract, runtime, or engine changes are required for this batch.

**Status line for this document:** `R5 FIRST BATCH — SELECTION AND SCOPE — AWAITING OWNER AUTHORIZATION (READ-ONLY)`

---

## 2. Verified inventory baseline (not re-audited, preserved)

| Area | Verified state | Evidence |
|---|---|---|
| 264 registry identities | 264 unique `toolId` / 264 unique `href` — **all preserved, none touched** | no edit to `lib/tools/registry.ts` this session |
| `lib/tools/registry.ts` | `stackStatus` per tool (`layered` for the three) | read, unmodified |
| `lib/tools/smartToolsCatalog.ts` (+ `smartToolsCatalog2..30`) | Catalog modules compose into the published set | read, unmodified |
| `lib/tools/smartToolsCatalog4.ts` | `getPublishedCatalogTools() = catalogAll().filter(t => t.status !== 'planned')` | read, unmodified |
| Published source of these tools | `SMART_TOOLS_CATALOG` (bodyfat) and `SMART_TOOLS_CATALOG_10` (bmi, protein-needs, water-intake, one-rep-max, bmr-tdee, strength-standards) — both included in `catalogAll()` | read, unmodified |
| Route generation | `app/smarttools/[category]/[tool]/page.tsx`, `generateStaticParams()` from `getPublishedCatalogTools()` via `getCategoryOfSlug` | read, unmodified |
| Categories | `bmi → body-composition`, `protein-needs → nutrition`, `water-intake → nutrition` | read, unmodified |
| Loader | webpack slug context `import('@/components/tools/${slug}')` with slug guard | read, unmodified |
| V4 protected surface | contracts, runtime, adapter Macro, Template V4, M4-IN-01 — hashes verified unchanged (§10.4) | SHA-256 checks |
| Pre-existing working-tree changes | `app/api/dashboard/metrics/route.ts`, `tests/integration/dashboardPersistence.test.ts`, `components/tools/macro-pilot.tsx`, `components/tools/macro-pilot.module.css`, dashboard security test — none of them read or approached this task | untouched |

**255 is a strategic horizon, not a target for this batch. No tool is deleted, renamed, renumbered or deduplicated. No catalog counter is adjusted.**

---

## 3. Selection methodology

Each candidate was scored against the owner's selection criteria using repository evidence only:

| Criterion | BMI | Protein Needs | Water Intake | Body Fat (runner-up) |
|---|---|---|---|---|
| Existing canonical toolId & route | ✅ | ✅ | ✅ | ✅ `/smarttools/body-composition/bodyfat` |
| Published (not planned) | ✅ `status: implemented` | ✅ `status: implemented` | ✅ `status: implemented` | ✅ no `status` ⇒ published |
| Deterministic engine on disk | ✅ `bmi.v6.ts` | ✅ `protein-needs.v6.ts` | ✅ `water-intake.v6.ts` | ✅ `bodyfat.v6.ts` (46/46) |
| Schema on disk | ✅ `bmi.ts` | ✅ `protein-needs.ts` | ✅ `water-intake.ts` | ✅ `bodyfat.ts` |
| Engine tests passing | ✅ 12/12 | ✅ 9/9 | ✅ 7/7 | ✅ 46/46 |
| Component + pilot + tests | ✅ pilot 3/3 | ✅ pilot 2/2 | ✅ pilot 2/2 | ✅ pilot 4/4 |
| Published component wiring | ✅ `components/tools/bmi.tsx` re-exports pilot | ✅ re-exports pilot | ✅ re-exports pilot | ❌ serves **legacy** `features/calculator/BodyFatCalculator` shell, not the pilot |
| Zero DB/migration | ✅ | ✅ | ✅ | ❌ FFMI cross-tool links read (no DB) but live page is legacy |
| No AI provider / no cost | ✅ | ✅ | ✅ | ✅ |
| Minimal shared-architecture change | ✅ none — published path unchanged | ✅ none | ✅ none | ❌ requires rerouting the live page (real-user visible) |
| User value | high (top body-composition lookup) | high (nutrition goal intake) | medium-high (daily guidance) | high |
| Safety sensitivity | screening number, not diagnosis | goal-linked intake estimate | hydration estimate | input (neck/waist/hip) is most sensitive of the four |
| Manageable risk | lowest | low | lowest | medium (live page replacement) |

**Selection rule applied:** choose the three published, deterministic, tested tools with the lowest implementation and user-impacting risk, and with **no visible change to any currently published experience until the owner accepts a new implementation**.

**Result:** BMI, Protein Needs, Water Intake.

**Deliberately excluded:** `mrx.tool.bodyfat` is the strongest evidence-backed candidate (46/46 engine tests; `bodyfat-pilot.tsx` passes) **but its published page serves the legacy calculator**. Changing what real users see on a live route is a separate, owner-only decision and would not satisfy "minimal changes with minimal blast radius". Body Fat is recommended as the first member of a follow-up batch after this one is accepted (§11).

---

## 4. Tool 1 — `mrx.tool.bmi` (Body Mass Index)

### 4.1 Identity and route

| Field | Value |
|---|---|
| toolId | `mrx.tool.bmi` |
| slug | `bmi` |
| Canonical name (EN / AR) | Body Mass Index (BMI) / مؤشر كتلة الجسم |
| Version | `1.0.0` |
| Category | `body-composition` (`app/smarttools/[category]/[tool]` via `getCategoryOfSlug('bmi') → 'body-composition'`) |
| Route | `/smarttools/body-composition/bmi` |
| Access tier | `free` |
| Registry order | 1340, `stackStatus: 'layered'` |
| Catalog order | 1700, `status: 'implemented'` (in `SMART_TOOLS_CATALOG_10`) |
| `componentPath` (published) | `@/components/tools/bmi` |
| `enginePath` (published) | `lib/tools/engines/bmi.v6` · `schemaPath` `lib/tools/schemas/bmi` |
| `icon` | `Scale` |
| `titleAr` | `مؤشر كتلة الجسم` |

### 4.2 Publication status and wiring

- Published route verified live: **HTTP 200**, page content contains BMI markers ("BMI"/"Body Mass Index"/Arabic مؤشر كتلة الجسم) — §10.3.
- The dynamic route loads the published component `components/tools/bmi.tsx`, which is a one-line re-export: `export { default } from './bmi-pilot';`
- Therefore the *published experience today is the pilot's V3-template UI*; the pilot satisfies the "sufficiently mature implementation" criterion.

### 4.3 Engine and schema (unchanged by this batch)

- Engine: `lib/tools/engines/bmi.v6.ts` — `BmiInput { weightKg, heightCm }`, `calculateBmi`, `BmiOutput { bmi, category }`, categories `<18.5 underweight`, `<25 normal`, `<30 overweight`, `≥30 obese`; throws on non-finite or non-positive input; `bmi` rounded to 1 decimal. **Pure module.**
- Schema: `lib/tools/schemas/bmi.ts` — zod `{ weightKg: finite().positive(), heightCm: finite().positive() }` — **no upper bounds** (see §9 risk R-1).
- Evidence the engine tests actually contain: 12/12 pass — `npx vitest run lib/tools/engines/bmi.v6.test.ts` → 12 passed (§10.2).

### 4.4 Components and pilot

- `components/tools/bmi.tsx` — published re-export (hash `07F863D0…`).
- `components/tools/bmi-pilot.tsx` — V3 `GeniusToolTemplate` UI, imperial conversion (`KG_PER_LB`/`CM_PER_IN` local duplication), AR/EN labels, `useToolDisplayPreferences` locale/unit/RTL, range-less numeric inputs (no min/max), no V4 envelope, no provenance, no medical-boundary statement beyond a generic one-line error.
- `components/tools/bmi-pilot.test.tsx` — 3/3 pass.

### 4.5 Actual test evidence

| Suite | Result |
|---|---|
| `lib/tools/engines/bmi.v6.test.ts` | 12/12 pass (2026-11-05) |
| `components/tools/bmi-pilot.test.tsx` | 3/3 pass |
| Route smoke | 200 OK |

### 4.6 Missing functionality

1. No V4 envelope / provenance / completeness presentation; no `resultEnvelope`.
2. Input bounds not enforced at the UI layer (schema accepts weight `> 0` and height `> 0` without upper bound).
3. No VI unit boundary helper shared with other tools (each pilot duplicates constants).
4. No required-input progress, no explanation sections (what BMI does/does not mean), no medical-boundary copy.
5. No deterministic warning for extreme categories; no "not a diagnosis / screening only" boundary.
6. No evidence record (cut-off documentation) and no additive V4 profile/adapters.
7. No Arabic warning localization (not needed until warnings exist); no V4 empty/partial/degraded presentation.

### 4.7 Proposed V4 improvements (additive, Macro-pattern)

- Wrap — never modify — the engine in a Macro-style **read-only adapter** emitting `ToolResultEnvelopeV4` (`status`, `resultType: CALCULATED|NOT_AVAILABLE|INVALID`×`INSUFFICIENT_EVIDENCE`) and a `PERSONAL` `privacyClass` envelope with `contextUsed=[]`, `nextActions=[]`, `auditRef` absent.
- Add a BMI input profile (weightKg/heightCm, canonical kg/cm, imperial boundary, personal) and an additive output policy (identity, validity, conditional evidence/warning).
- Add a BMI category-cut-offs **documentation** evidence record (`sourceType: 'documentation'`, e.g. CDC "About Adult BMI" — URL to be verified during implementation; no `reviewedAt`).
- Rewrite `bmi-pilot.tsx` to Template V4 keeping the page's published re-export unchanged: localized AR/EN, required-input progress, empty/partial/invalid states, three disclosures, "what this means / what this does not mean" boundary copy ("screening, not a diagnosis; BMI does not distinguish fat from muscle"), Imperial/metric boundary via a shared additive units module, `aiStatus="NOT_CONFIGURED"`, `riskTier="LOW"` (proposed).
- Keep the existing engine, schema, route, catalog, registry, template V3/V4 untouched.

### 4.8 Exact files to create / modify

**Create**

- `lib/engines/core/v4/adapter.bmi.v4.ts`
- `lib/engines/core/v4/adapter.bmi.v4.test.ts`
- `lib/engines/core/v4/profiles/bmi-input-profile.v4.ts`
- `lib/engines/core/v4/profiles/bmi-input-profile.v4.test.ts`
- `lib/engines/core/v4/profiles/bmi-evidence-record.v4.ts` (+ `.test.ts`)
- `components/tools/tool-pilot-v4.module.css` (shared additive scoped styles used by all three pilots)
- `lib/engines/core/v4/profiles/tool-pilot-state.v4.ts` (shared additive; resolves envelope → pilot presentation state)
- `lib/engines/core/v4/profiles/tool-pilot-state.v4.test.ts`
- `components/tools/bmi-pilot.v4.test.tsx` (V4 integration tests; existing `bmi-pilot.test.tsx` retained as-is and left green)

**Modify**

- `components/tools/bmi-pilot.tsx` (V4 Template rewrite) only

**Protected (must remain unchanged)**

- `lib/tools/engines/bmi.v6.ts`, `lib/tools/schemas/bmi.ts`, `app/smarttools/[category]/[tool]/page.tsx`, `lib/tools/registry.ts`, `lib/tools/smartToolsCatalog*.ts`, `lib/tools/categories.ts`, `lib/tools/loaders.ts`, `lib/templates/genius-tool-template.tsx`, `lib/templates/genius-tool-template.v4.tsx`, `lib/engines/core/v4/contracts.v4.ts`, `lib/engines/core/v4/runtime.v4.ts`, `lib/engines/core/v4/adapter.macro.v4.ts`, `components/tools/macro-pilot*`, `package.json`.

### 4.9 Required tests and acceptance criteria

Required: adapter conformance tests (empty/invalid/full states; runtime validator accepts all emitted envelopes; `resultType` never `MODEL_PREDICTION`; deterministic warning only when produced); unit/round-trip and boundary tests (imperial↔metric; height rejected < 100 cm or > 250 cm; weight ≤ 0 rejected — **and upper-bound note R-1**); AR/EN RTL tests (identical structure, labels, `dir`); required-input progress; focus on `summary` elements; UI result ≡ engine result exact string; no NaN/Infinity anywhere; single `role="alert"` on invalid state; engine bytes unchanged (hash check); skeleton completes/empty state does not call engine with partial inputs; zero persistence/AI/fingerprint.

**Acceptance gates (per tool):** G1 engine/schema/route/registry/catalog hashes unchanged; G2 new adapter validates under `validateToolResultEnvelope` for all three states; G3 pilot passes all existing + new tests (3/3 baseline + ~12 new); G4 accessibility evidence per the Macro-closure pattern (jsdom pass; real 375px/screen-reader if the owner requires them); G5 AR/EN + RTL equivalence verified; G6 rollback re-verification green.

### 4.10 Rollback plan

`git checkout -- components/tools/bmi-pilot.tsx` restores the published body-composition tool to today's V3 pilot (route is a re-export — no registry/navigation change ever needed). Delete the nine created files (adapter + profiles + CSS + state) and the new test. Rerun `npx vitest run components/tools/bmi-pilot.test.tsx` — expect 3/3 and the page on port 3000 to render exactly as before. Rollback is **route-consistent at every step** because nothing outside the pilot changes.

---

## 5. Tool 2 — `mrx.tool.protein-needs` (Protein Needs Estimate)

### 5.1 Identity and route

| Field | Value |
|---|---|
| toolId | `mrx.tool.protein-needs` |
| slug | `protein-needs` |
| Canonical name (EN / AR) | Protein Needs Estimate / تقدير احتياج البروتين |
| Version | `1.0.0` |
| Category | `nutrition` (`getCategoryOfSlug('protein-needs') → 'nutrition'`) |
| Route | `/smarttools/nutrition/protein-needs` |
| Access tier | `free` |
| Registry order | 1680, `stackStatus: 'layered'` |
| Catalog order | 1680, `status: 'implemented'` |
| `componentPath` | `@/components/tools/protein-needs` (re-exports `./protein-needs-pilot`) |
| `enginePath`/`schemaPath` | `lib/tools/engines/protein-needs.v6` / `lib/tools/schemas/protein-needs` |
| `icon` | `Flame` |
| `titleAr` | `تقدير احتياج البروتين` |

### 5.2 Publication status and wiring

- Published route verified live: **HTTP 200**, page contains Protein/البروتين markers — §10.3.
- Published component `components/tools/protein-needs.tsx` = one-line re-export of the pilot.

### 5.3 Engine and schema (unchanged)

- Engine: `lib/tools/engines/protein-needs.v6.ts` — `ProteinNeedsInput { weightKg, goal, activityLevel }`, `calculateProteinNeedsV6`, output `{ dailyProteinGrams }`; throws on non-finite input, `weightKg ≤ 0`, `activityLevel ∉ [1, 1.4]`, unknown `goal`; `dailyProteinGrams = round(weightKg × (goal === 'bulk' ? 2.0 : goal === 'cut' ? 2.2 : 1.6) × (1 + (activityLevel − 1) × 0.05))`; rejects non-finite/≤0 result. **Pure module.**
- Schema: `lib/tools/schemas/protein-needs.ts` — zod `{ weightKg positive finite, goal enum[maintain,bulk,cut], activityLevel 1..1.4 }` — no upper bound on weight (R-1).
- Evidence tests: 9/9 pass — `npx vitest run lib/tools/engines/protein-needs.v6.test.ts` (§10.2).

### 5.4 Components and pilot

- `components/tools/protein-needs-pilot.tsx` — V3 Template; scale-select `activityLevel ∈ {1, 1.1, 1.2, 1.3, 1.4}` mapped to Baseline/Light/Moderate/Active/Very active; goal select; AR/EN labels with disclaimers **already present** ("General estimate; it may not fit every health condition or individual need."). Inputs have no min/max; empty weight ⇒ `NaN` handled as invalid.
- `components/tools/protein-needs-pilot.test.tsx` — 2/2 pass.

### 5.5 Actual test evidence

| Suite | Result |
|---|---|
| `lib/tools/engines/protein-needs.v6.test.ts` | 9/9 pass (2026-11-05) |
| `components/tools/protein-needs-pilot.test.tsx` | 2/2 pass |
| Route smoke | 200 OK |

### 5.6 Missing functionality

1. No V4 envelope, provenance, completeness presentation.
2. No input upper bounds (weight) — engine accepts e.g. `weightKg = 900`.
3. Activity list fixed to five discrete values — acceptable but must be enforced by the profile/adapter, not by contract edits.
4. No deterministic warning, no explanation sections beyond the one-line formula blurb, no "what this does not mean" boundary section (current single-sentence disclaimer is honest but incomplete).
5. No evidence record — the 1.6/2.0/2.2 g/kg per-goal heuristics are application-designed, **not** externally validated; any record must say so.
6. No AR/EN parity section tests; no required-input progress; no disclosure of formula/assumptions.

### 5.7 Proposed V4 improvements

Same additive pattern as BMI: read-only adapter → `ToolResultEnvelopeV4`, input profile (`weightKg`, `goal`, `activityLevel`), output policy, **documentation-typed evidence record with `reviewStatus: 'NOT_REVIEWED'`** explicitly labelling the formula as an application-designed heuristic without clinical validation (`sourceType: 'documentation'`, version `'SPEC v3'`, no `reviewedAt`), Template V4 pilot with three disclosures, medical-boundary sections ("general estimate; not medical advice; not a nutrition prescription; consult a professional for medical conditions"), required-input progress, AR/EN strings, Imperial/metric boundary via the shared additive units module, `riskTier="MEDIUM"` (proposed — goal-linked intake framing), `aiStatus="NOT_CONFIGURED"`.

### 5.8 Exact files to create / modify

**Create**

- `lib/engines/core/v4/adapter.protein-needs.v4.ts`
- `lib/engines/core/v4/adapter.protein-needs.v4.test.ts`
- `lib/engines/core/v4/profiles/protein-needs-input-profile.v4.ts`
- `lib/engines/core/v4/profiles/protein-needs-input-profile.v4.test.ts`
- `lib/engines/core/v4/profiles/protein-needs-evidence-record.v4.ts` (+ `.test.ts`)
- `components/tools/protein-needs-pilot.v4.test.tsx`

(Shared additive files listed in §4.8 — `tool-pilot-state.v4`, `tool-pilot-v4.module.css` — are created once and counted once.)

**Modify**

- `components/tools/protein-needs-pilot.tsx` only

**Protected**

- `lib/tools/engines/protein-needs.v6.ts`, `lib/tools/schemas/protein-needs.ts`, route/catalog/registry/template/contracts/runtime/Macro — unchanged.

### 5.9 Required tests and acceptance criteria

Same test discipline as §4.9 plus: goal enum enforced (`maintain|bulk|cut`), activity bounds enforced (`1–1.4`), NaN/empty rejected, result never negative/non-finite, Imperial round-trip weight, exact engine↔UI equality.

**Acceptance:** G1–G6 same as BMI.

### 5.10 Rollback plan

Identical to BMI: `git checkout -- components/tools/protein-needs-pilot.tsx`, delete created files, rerun `components/tools/protein-needs-pilot.test.tsx` (expect 2/2 + page 200).

---

## 6. Tool 3 — `mrx.tool.water-intake` (Daily Water Intake Estimate)

### 6.1 Identity and route

| Field | Value |
|---|---|
| toolId | `mrx.tool.water-intake` |
| slug | `water-intake` |
| Canonical name (EN / AR) | Daily Water Intake Estimate / تقدير احتياج الماء اليومي |
| Version | `1.0.0` |
| Category | `nutrition` |
| Route | `/smarttools/nutrition/water-intake` |
| Access tier | `free` |
| Registry order | 1690, `stackStatus: 'layered'` |
| Catalog order | 1690, `status: 'implemented'` |
| `componentPath` | `@/components/tools/water-intake` (re-exports `./water-intake-pilot`) |
| `enginePath`/`schemaPath` | `lib/tools/engines/water-intake.v6` / `lib/tools/schemas/water-intake` |
| `icon` | `Beaker` |
| `titleAr` | `تقدير احتياج الماء اليومي` |

### 6.2 Publication status and wiring

- Published route verified live: **HTTP 200**, page contains Water/الماء markers — §10.3.

### 6.3 Engine and schema (unchanged)

- Engine: `lib/tools/engines/water-intake.v6.ts` — `WaterIntakeInput { weightKg, activityLevel }`, `calculateWaterIntakeV6`, output `{ dailyWaterLiters }`; `dailyWaterLiters = round(weightKg × 35 × (1 + (activityLevel − 1) × 0.1) / 1000 × 100) / 100`; throws on non-finite, `weightKg ≤ 0`, `activityLevel ∉ [1, 1.4]`, non-finite/≤0 result. **Pure module.**
- Schema: `lib/tools/schemas/water-intake.ts` — zod positive-weight, activity `1..1.4`, no upper bound on weight (R-1).
- Evidence tests: 7/7 pass — `npx vitest run lib/tools/engines/water-intake.v6.test.ts` (§10.2).

### 6.4 Components and pilot

- `components/tools/water-intake-pilot.tsx` — same V3 pattern as protein-needs; activities same five-value scale; honest one-line disclaimer ("does not account for climate, health conditions or fluids from food; it is not medical advice.").
- `components/tools/water-intake-pilot.test.tsx` — 2/2 pass.

### 6.5 Actual test evidence

| Suite | Result |
|---|---|
| `lib/tools/engines/water-intake.v6.test.ts` | 7/7 pass (2026-11-05) |
| `components/tools/water-intake-pilot.test.tsx` | 2/2 pass |
| Route smoke | 200 OK |

### 6.6 Missing functionality / 6.7 Proposed V4 improvements

Same shape as protein-needs: no envelope; weight has no upper bound; formula (`35 mL/kg` + activity adjustment) is an application heuristic with **no external validation** — the evidence record must say so (`documentation`, `NOT_REVIEWED`, limitations: "does not account for climate, diet, conditions, pregnancy or medications"); no V4 presentation, disclosures, progress, or localized boundary sections.

### 6.8 Exact files to create / modify

**Create**

- `lib/engines/core/v4/adapter.water-intake.v4.ts`
- `lib/engines/core/v4/adapter.water-intake.v4.test.ts`
- `lib/engines/core/v4/profiles/water-intake-input-profile.v4.ts`
- `lib/engines/core/v4/profiles/water-intake-input-profile.v4.test.ts`
- `lib/engines/core/v4/profiles/water-intake-evidence-record.v4.ts` (+ `.test.ts`)
- `components/tools/water-intake-pilot.v4.test.tsx`

**Modify**

- `components/tools/water-intake-pilot.tsx` only

**Protected**

- `lib/tools/engines/water-intake.v6.ts`, `lib/tools/schemas/water-intake.ts`, route/catalog/registry/template/contracts/runtime/Macro — unchanged.

### 6.9 Required tests and acceptance criteria / 6.10 Rollback plan

Identical to §4.9/§4.10 adapted to this tool's single goal-free input surface. `riskTier="LOW"` (proposed); `aiStatus="NOT_CONFIGURED"`.

---

## 7. Consolidated implementation scope (one coherent plan)

### 7.1 Shared additive files (created once in this batch)

- `components/tools/tool-pilot-v4.module.css` — scoped V4-card styles for the three pilots (`details`/`summary`, `:focus-visible`, progress spacing). Imports nothing new; no global CSS touched.
- `lib/engines/core/v4/profiles/tool-pilot-state.v4.ts` — resolves `{status, completeness, hasResult, hasError}` → pilot presentation id; reused by all three pilots.

### 7.2 Per-tool deliverable shape (identical structure to Macro)

For each of the three tools: `adapter.<slug>.v4.ts` (+test), three additive `profiles/<slug>-*.v4.ts` (+test), V4 pilot rewrite (+new V4 test file), retained existing pilot test file. One shared CSS module + one shared state helper.

**No engine, schema, route, page, loaders, categories, catalog, registry, template, contract or runtime file changes.**

### 7.3 File count

- Created: 3 tools × (1 adapter + 1 adapter test + 3 profiles + 3 profile tests + 1 evidence record + 1 evidence test + 1 pilot V4 test) + 2 shared = **24 created files**.
- Modified: **3 pilot files** (`bmi-pilot.tsx`, `protein-needs-pilot.tsx`, `water-intake-pilot.tsx`).
- Deleted/renumbered/renamed: **0**.

### 7.4 Verification plan (before any preview sign-off)

1. Protected-file hash sweep before/after (engine, schema, registry, catalog, template, contracts, runtime, Macro hashes).
2. `npx vitest run` over: all Macro suites (328/328 must stay green), **3 × 7 new tool suites**, bodyfat 46/46 as an independent control; expected ≈ 328 + 21 = **~349 tests**.
3. `npx tsc --noEmit`, `npx eslint` on changed files — 0 errors.
4. `npm run validate-tools` — 5/5.
5. Dev-server smoke of the three routes (EN/AR, desktop + 375px CSS rule present) — evidence collected; no screenshot claim beyond what is actually captured.
6. Production build: **not authorized**, will not run unless separately authorized.

### 7.5 Order and dependencies

Shared CSS/state first → BMI (reference) → Protein Needs → Water Intake → full regression (all three + Macro) → preview URLs for the owner → fix loop → final report. Each tool compiles and passes independently; **no tool depends on another**.

### 7.6 Sensitive inputs and privacy

All numeric inputs (`weightKg`, `heightCm`) are classified `personal`; BMI/Protein/Water do not take age. `privacyClass='PERSONAL'` on envelopes; nothing is persisted, logged or transmitted; unit display conversion never changes canonical math; `recomp`-style unsupported-category behavior is absent (none of these engines supports invented enums).

### 7.7 Evidence honesty rule for this batch

- BMI: the category cut-offs may carry a **sourceType `documentation`** record citing a public health guideline (candidate: CDC "About Adult BMI / BMI Categories"; URL to be verified in-session, not asserted here). `reviewedAt` stays absent.
- Protein Needs & Water Intake: `documentation` records explicitly labelled application-designed SPEC v3 heuristics with `reviewStatus: 'NOT_REVIEWED'`; limitations state: not clinically validated, general estimate, not medical advice, varies with condition/climate/diet. **No fabricated study, citation, confidence or validation of any kind will be introduced.**

### 7.8 Risk register for the batch

| ID | Risk | Severity | Control / mitigation |
|---|---|---|---|
| R-1 | Schema allows unbounded `weightKg`/`heightCm` | Low | UI input `min/max/step` enforced; adapter rejects out-of-bound/implausible values (e.g. weight ≥ 350 kg or height ≥ 250 cm) as INVALID with a warning; schema **is not edited** |
| R-2 | Imperial rounding (`toFixed(1)`) drifts by ≤ 0.1 | Negligible | identical pattern to Macro; round-trip bounded by half display precision; tested |
| R-3 | Nutrition/health misread as advice | Low | localized boundary sections on every result ("not medical advice; consult a professional"); BMI "screening, not diagnosis" |
| R-4 | Live-route visible change | Low | `.tsx` re-export unchanged; pilot is the swap target; rollback is one command per tool |
| R-5 | Arabic strings drift from English | Low | AR strings reviewed in-session; jsdom tests assert parity structure |
| R-6 | Shared CSS module affects other pages | Negligible | imports restricted to the three pilots; no global selector edits |
| R-7 | Evidence record misread as validation | Low | `NOT_REVIEWED` + `documentation` + explicit limitations; asserted in tests |
| R-8 | Scope creep into Body Fat/registry/route changes | Low | allowlist enforced; registry/catalog/route/loader/category files are hard-closed |

---

## 8. Preview & owner acceptance gate (post-implementation definition)

Per the standing preview directive, once the batch is authorized and implemented:

1. Local preview URLs: `http://localhost:3000/smarttools/body-composition/bmi`, `http://localhost:3000/smarttools/nutrition/protein-needs`, `http://localhost:3000/smarttools/nutrition/water-intake` + `npm run dev` startup instructions (already verified working this session).
2. Each tool testable in isolation; no production dependency; no database access; no sign-in required; independent rollback per tool.
3. Desktop (≥ 64rem), tablet, 375px rule paths; AR RTL + EN LTR per tool.
4. Test accounts: none required (no accounts exist on these routes); sample inputs provided in this document family; no real user data is collected.
5. Test guide per tool: inputs, expected results (engine-equivalent), warnings, edge cases (empty/partial/invalid/zero/extreme/Imperial/metric).
6. Issues logged verbatim; approved fixes applied with the relevant suite re-run green; signature lines for RTL/375px/screen-reader remain owner-owned.
7. **Hard stop after this batch for full second-batch authorization — the owner reviews all three first:** `FIRST BATCH — IMPLEMENTED — AWAITING OWNER PREVIEW` → only after explicit acceptance: `FIRST BATCH — OWNER ACCEPTED`, and only then may a second batch be authorized. No production deployment is authorized; any externally hosted preview requires separate authorization.

---

## 9. Why other tools were not selected (candidates evaluated)

| Tool | Why not this batch |
|---|---|
| `mrx.tool.bodyfat` | Published page serves **legacy** calculator; pilot (46/46 tests) exists but is not the published path. Wiring it is the highest-value change but alters a live experience — owner's next decision, not this one |
| `mrx.tool.bmr-tdee` | Mature (9/9), published, **but is the nearest arithmetic sibling of Macro**; selecting it now duplicates proof, while BMI/Protein/Water broaden V4 evidence across body-composition + nutrition with distinct input shapes |
| `mrx.tool.one-rep-max` | Mature (3/3) and published; **lowest user-value per test in the candidate set for a first batch**; recommended for the second batch together with Body Fat |
| `mrx.tool.strength-standards` | Only 2 engine tests; insufficient evidence for a first controlled batch |
| `mrx.tool.bmi` vs all | see above |

## 10. Evidence index (all executed 2026-11-05)

### 10.1 Files read (read-only)

Registry, catalog modules (`smartToolsCatalog.ts`, `smartToolsCatalog4/10.ts`), categories, loaders, dynamic route `[category]/[tool]/page.tsx`, engines + schemas for all candidates, `bodyfat` published component, re-export components, pilots, V4 contracts/runtime/docs (Macro references).

### 10.2 Engine/pilot test results (actual)

| Suite | Result |
|---|---|
| `bmi.v6.test.ts` | **12/12 pass** |
| `bodyfat.v6.test.ts` | **46/46 pass** |
| `protein-needs.v6.test.ts` | **9/9 pass** |
| `water-intake.v6.test.ts` | **7/7 pass** |
| `one-rep-max.v6.test.ts` | 3/3 pass |
| `bmr-tdee.v6.test.ts` | 9/9 pass |
| `strength-standards.v6.test.ts` | 2/2 pass |
| `bmi-pilot.test.tsx` | **3/3 pass** |
| `protein-needs-pilot.test.tsx` | **2/2 pass** |
| `water-intake-pilot.test.tsx` | **2/2 pass** |
| `bodyfat-pilot.test.tsx` | 4/4 pass |
| Macro V4 closure (reference) | **328/328 pass across 16 suites** — unchanged this session |

### 10.3 Route smoke (actual)

- `GET /smarttools/body-composition/bmi` → **200** (78,975 b) — body contains BMI markers
- `GET /smarttools/nutrition/protein-needs` → **200** (79,806 b) — body contains Protein/البروتين markers
- `GET /smarttools/nutrition/water-intake` → **200** (79,612 b) — body contains Water/الماء markers

### 10.4 Protected-file hashes (pre-task reference; all verified unchanged after data collection)

| File | SHA-256 |
|---|---|
| `lib/tools/engines/bmi.v6.ts` | `89382AB19DBE3AACD18A639DC4090948EDC75367AEBD201AEDC3CA26CA1A06EF` |
| `lib/tools/engines/protein-needs.v6.ts` | `3794FC3DB920B73100D9A1D6A41D4B0A6D4F34A0F738D4DFF84F064F053DD363` |
| `lib/tools/engines/water-intake.v6.ts` | `D884F8B1DA328E3C92AE35177D6D49824B1EA25DD31B6ACDF4FCF724871D1A4C` |
| `lib/tools/engines/bodyfat.v6.ts` (runner-up) | `0134892A938D2EED476C2ECCD869124FA731EE9C746FE0CE6CE346CB9E9C21A0` |
| `lib/tools/schemas/bmi.ts` / `…protein-needs.ts` / `…water-intake.ts` | `59F34373…` / `A43E701C…` / `63654ABB…` |
| `components/tools/bmi.tsx` / `protein-needs.tsx` / `water-intake.tsx` | `07F863D0…` / `BAA0C721…` / `58376D23…` |
| `components/tools/bmi-pilot.tsx` / `protein-needs-pilot.tsx` / `water-intake-pilot.tsx` / `bodyfat-pilot.tsx` | `3B6E6647…` / `3AD633CB…` / `5C9EA7B0…` / `F5743012…` |
| `lib/tools/registry.ts` | `400BE85257CA4797FEA4AA38D255F2627E14807064DC44D212FB2B0FD37A2EC1` |
| `lib/tools/smartToolsCatalog.ts` / `smartToolsCatalog10.ts` | `3B0D172E…` / `FC1CC503…` |
| `lib/tools/categories.ts` | `E2CC7F4086904107FE35731706B9711FC4F4E1DC63B84C7292BCE87233F0C705` |
| `app/smarttools/[category]/[tool]/page.tsx` | `EFCCEEDF…` |
| `components/tools/bodyfat.tsx` (published legacy) | `F70BF0FC…` |
| `lib/templates/genius-tool-template.tsx` | `A5659738…` |
| `loaders.ts` / `V4 template` / `contracts`/`runtime` (Macro-invariants) | unchanged and re-verified during Macro closure |

### 10.5 Test environment note

`next dev` boot logs "Supabase configured" — **no database read, write, migration or migration check was performed**; no Supabase credentials were used by this task; nothing was persisted anywhere. The dev server was stopped; the working tree is exactly as it was plus this report. Pre-existing unrelated modifications (`app/api/dashboard/metrics/route.ts`, `tests/integration/dashboardPersistence.test.ts`, `tests/security/dashboardMetricsRouteAuth.test.ts`, Macro pilot files) were not read, modified or verified by this selection.

---

## 11. Prerequisites and owner authorization decision

**This document authorizes nothing.** The owner decision required, one decision for the whole batch:

1. Approve or reject the three-tool selection (BMI / Protein Needs / Water Intake).
2. Approve or reject the §4.8/§5.8/§6.8 file allowlists and the two shared additive files (§7.1).
3. Approve proposed risk tiers (`BMI LOW`, `Protein Needs MEDIUM`, `Water Intake LOW`) — or assign different ones with rationale.
4. Approve the acceptance gate shape (§8): preview URLs verified after implementation, AR/RTL + 375px evidence, owner sign-off before a second batch.
5. Approve that a second batch (recommended first members: **Body Fat** — after a separate owner decision on retiring the legacy page to its pilot — and **One Rep Max**) is out of scope until this batch is `OWNER ACCEPTED`.
6. Confirm that "255" changes nothing about this batch; registry stays 264 identities, untouched.

**If the owner wants Body Fat included instead of Water Intake,** say so explicitly; it can be substituted into this same allowlist-shaped scope with the published-route re-export as the single visible-change point; it is not a silent substitution.

**If the owner rejects this batch,** nothing is implemented and rollback is not needed (nothing was modified).

---

## 12. Rollback for the whole batch (if authorized then rejected)

Per tool: `git checkout -- components/tools/<tool>-pilot.tsx` (restores the published live tool), delete created files listed in §4/5/6, rerun the existing pilot suite — expect the §10.2 counts and HTTP 200 on the three routes. Shared module reverts by deleting it; nothing imports it unless the pilots do. Final verification: protected hashes from §10.4 re-confirmed equal.

---

## 13. Final status

`R5 FIRST BATCH — TOOL SELECTION AND IMPLEMENTATION SCOPE — AWAITING OWNER AUTHORIZATION`

The owner must issue one explicit decision before any file in §4.8/§5.8/§6.8/§7.1 is created or modified. Until then this document is read-only; no application change has been made.
