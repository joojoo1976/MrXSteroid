# GENIUS_TOOL_STANDARD_V3

## Scope
Phase 0 discovery + Macro v6 only. No template rollout, no 252-tool rollout, no Supabase writes.

## Standard Rules
1. Pure deterministic engine: no React, DOM, Supabase, network, IO, or hidden clock dependency.
2. Strong TypeScript types; no unjustified `any`/`@ts-ignore`.
3. Handle NaN, Infinity, zero, negative, missing, and incompatible units; never expose invalid numeric results.
4. Separate deterministic calculation from rules, statistical estimates, and model inference; do not label static fallback as AI/ML.
5. Validation, unit conversion, What-If, sensitivity, reasoning, warnings must be explicit and testable.
6. Every check status must be `PASS`, `FAIL`, `NOT RUN`, or `BLOCKED` with real evidence.

## Required Engine Capabilities (Macro v6)
- Input/output types with unit systems.
- Validation ranges and warnings.
- Deterministic macro calculation.
- Unit conversion.
- What-If scenarios.
- Sensitivity analysis.
- Reasoning trace + top-3 reasoning.
- Safety warnings (LOW/HIGH).
- No double conversion.

## Acceptance Evidence
- Macro verification is timestamped in [MACRO_V6_ENGINE_REPORT.md](MACRO_V6_ENGINE_REPORT.md); latest engine-only coverage checkpoint: 81 tests, statements 95.19%, branches 90.86%, functions 93.18%, and lines 95.93%. It includes TDEE slider-step round-trips and activity-sensitivity checks at both bounds. The installed Vitest 4.1.10 / `@vitest/coverage-v8` 4.0.18 mismatch and deprecated coverage import remain limitations of that measurement.
- Latest four-file Macro suite: 108 tests passed; `npx tsc --noEmit`, scoped ESLint, full `npm run lint`, `npm run validate-tools`, and `npm run build` passed. The latest build generated 502/502 pages; full lint reported 474 warnings and no errors.
- Latest full repository run `npx vitest run --reporter=json --outputFile=$reportPath --silent`: FAIL, exit 1; 510 files (502 passed, 7 failed, 1 skipped), 4,811 tests (4,790 passed, 16 failed, 5 pending). The failures remain in seven checkout/payment files outside Macro; the current gate remains NOT READY.
- `npm run validate-tools`: latest independently checked result is 5/5 tests, exit 0. The fresh catalog and registry-focused suites passed 28/28.

## Evidence Addendum — 2026-10-25

This addendum records a source audit of Tool 111 and the current Macro v6 checkpoint. It supplements the generic checklist above; it does not claim every listed capability is complete.

### Tool 111 feature audit

| Capability | Status | Evidence and finding |
|---|---|---|
| Legacy route behavior | PARTIAL | `app/smarttools/tool-111-smart-food-macro-substitution/page.tsx:1-6` redirects to the registered hierarchical URL; it does not render the tool itself. |
| Bilingual UI and RTL/LTR | COMPLETE | `components/tools/tool-111-smart-food-macro-substitution.tsx:100-101,218-220,426-433` selects language, direction, and language labels. Current dedicated DOM tests pass; the focused six-file Tool 111 suite passes 183/183. |
| Registered route and shared wrapper | COMPLETE (current local build) | The flat route redirects (`app/smarttools/tool-111-smart-food-macro-substitution/page.tsx:3-6`); the dynamic route resolves the published catalog entry and loader component, then renders shared safety/AI panels (`app/smarttools/[category]/[tool]/page.tsx:37-45,61-79`). Current local production requests return HTTP 200 for the canonical route and HTTP 308 to it for the flat legacy route. The test invokes the redirect directly; the HTTP smoke check verifies built routing. |
| Calculation controls, form state, reset, and error display | COMPLETE | Component state and calculation/error paths are at `components/tools/tool-111-smart-food-macro-substitution.tsx:103-108,130-183,185-192`. |
| Input validation | PARTIAL | UI requires all macro values (`components/tools/tool-111-smart-food-macro-substitution.tsx:75-96,136-145`); strict Zod schemas reject non-finite/negative macros and non-positive/out-of-bound quantity (`lib/tools/schemas/tool-111-smart-food-macro-substitution.ts:49-101`). The active calculation entry point now also rejects non-finite/out-of-range quantity, invalid macro profiles, invalid targets, and unsupported runtime units (`lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts:562,649-680`; `lib/tools/adapters/tool-111-smart-food-macro-substitution.test.ts:85-107`). Lower-level helper functions still sanitize malformed values to zero (`:163-178,184-198`), so the helper API does not preserve invalid-vs-zero distinctions. |
| Macro and unit calculations | PARTIAL | The active adapter calls the staging engine (`lib/tools/adapters/tool-111-smart-food-macro-substitution.ts:27-34,303-309`), which computes quantities, equivalence, deltas, and adherence (`lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts:561-642`). `safeDivide` can replace invalid division with zero (`:141-146`). More materially, canonicalization maps both g and ml to factor 1 and piece/slice to 1 (`lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts:88-92`), then the calculation treats the result as grams (`:566-586`); no food density or grams-per-piece field is required. Volume/count quantities therefore lack evidenced mass conversion. |
| Explanation, warnings, and limitations | PARTIAL | Engine generates warnings and limitations (`lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts:430-519,612-614`), and UI renders findings, warnings, limitations, and result values (`components/tools/tool-111-smart-food-macro-substitution.tsx:462-552`). A UI `className` string at `:470` contains interpolation text inside a quoted literal, so severity styling is not dynamically applied. |
| Data source and provenance | PARTIAL | User-entered source labels are validated (`lib/tools/schemas/tool-111-smart-food-macro-substitution.ts:30-31,69-71`) and displayed (`components/tools/tool-111-smart-food-macro-substitution.tsx:554-574`). Adapter assigns fixed confidence `0.9` or `0.8` from source type (`lib/tools/adapters/tool-111-smart-food-macro-substitution.ts:78-101`); this is not a measured/calibrated confidence. |
| Persistent result storage | MISSING | The Tool 111 component calls `tool111Adapter.execute` and keeps results in React state (`components/tools/tool-111-smart-food-macro-substitution.tsx:174-183`). No tool-specific save/commit call or browser storage is present in that component. The shared API logging contract is not exercised by this UI path. |
| Cross-tool data integration | MISSING | The inspected Tool 111 component has no cross-tool import, selection, or update subscription. Adapter SEO links are metadata, not data exchange (`lib/tools/adapters/tool-111-smart-food-macro-substitution.ts:250,297-298`). |
| AI explanation | UI_ONLY | The shared page includes `AIInsightPanel` (`app/smarttools/[category]/[tool]/page.tsx:77-79`), which posts a tool slug and optional findings to an explain endpoint (`components/smarttools/AIInsightPanel.tsx:29-45`). Tool 111's page does not pass findings, so this is not an explanation of its calculated result; endpoint may return deterministic text or a model response (`app/api/smarttools/ai/explain/route.ts:18-22,44-46`). |
| Determinism and runtime metadata | PARTIAL | Arithmetic operations are deterministic, but the staging engine measures runtime and emits a wall-clock timestamp (`lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts:562,616-619`); therefore the entire result object is not identical across calls. |
| Tests | COMPLETE (current targeted set only) | `npx vitest run` over the six current Tool 111 UI, route, engine, schema and adapter test files passes 183/183. The repository-wide suite remains failing outside Tool 111; see the baseline audit. |
| Engine path consistency | PARTIAL | The catalog declares `lib/tools/engines/tool-111-smart-food-macro-substitution` (`lib/tools/smartToolsCatalog9.ts:15`), and `lib/tools/validation.ts:78-87` only checks that declared path exists. The UI, schema, and adapter import `lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts`; the two files have different SHA-256 hashes. The actual UI adapter path is therefore evidenced, but registry metadata and runtime engine source disagree. Do not treat catalog validation as proof that the declared engine is the one executed. |

### Macro v6 checkpoint notes

- The checkout's actual files are `lib/tools/engines/macro.v6.ts` and its adjacent test. The SPEC's `lib/engines/macro.v6.ts` paths do not exist; files were not moved or renamed.
- Macro v6 engine changes are in its engine and test file; the directly integrated pilot UI and its test were also updated. The engine now uses the SPEC v3 BMR/TDEE and phase equations, explicit 2.2 g/kg protein and 0.9 g/kg fat, and carbohydrate as remaining calories. Unsupported `recomp` is rejected because SPEC v3 defines no formula for it. No generic template or other tool was changed as part of the Macro pilot update.
- Output assumptions no longer imply that unsupported recomposition still uses a 5% reduction; a regression test checks the unsupported-phase disclosure.
- `calculateMacrosV6` now returns explicit `empty`/`partial` dynamic states with missing-field names and no calculated output until the required inputs are complete; supplied invalid fields are rejected.
- Cross-tool confidence, runtime, weekly weight-change, adherence, and meal-timing claims are not fabricated; unavailable values are null/empty. What-If is labeled `CALCULATED`, includes maintenance/cut/bulk and bounded TDEE/activity/weight inputs, and rejects unsupported keys.
- Coverage report is per Macro v6 engine only; statements, lines, and branches exceed 80%. See `docs/MACRO_V6_ENGINE_REPORT.md` for exact metrics and unresolved limits.

### Current Tool 111 routing and verification reconciliation — 2026-10-26

The previous notes claiming stale Tool 111 route-test assumptions were superseded by the current test source and production-route check. `components/tools/tool-111-smart-food-macro-substitution.integration.test.tsx` calls the legacy page and asserts the canonical redirect; the six focused test files pass 183/183. On the current local production build, the canonical category route returns HTTP 200 with the registered title, while the flat legacy route returns HTTP 308 to the canonical path. This verifies route availability, not full interactive accessibility or every result behavior.

The engine-source mismatch is confirmed, not resolved: catalog metadata points at the non-staging engine path, while the active UI/schema/adapter import the staging copy. This audit does not rename files, change the catalog, or alter Tool 111 code.

### V3 capability applicability by approved v7 domain

This is a **planning applicability matrix**, not a claim that these capabilities exist in every tool. Domain names and ordering are taken from `lib/engines/core/v6/tools.registry.v7.252.ts:2-17`. The capability columns follow the ten architecture layers in `docs/GENIUS_INTELLIGENCE_V3/SPEC.md:80-95`. `CORE` means the layer is generally expected for this domain; `CONDITIONAL` means use it only when a specific tool's supported inputs and evidence justify it; `NOT_DEFAULT` means the layer should not be added merely because the domain name suggests it. These assignments are design inferences from domain names and must be refined per tool before implementation.

| Approved v7 domain | Calculation | Validation / rules | Context | Prediction | Decision | Explanation | Evidence | Safety | Personalization | Evaluation |
|---|---|---|---|---|---|---|---|---|---|---|
| Body Composition & Fat Analysis | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CONDITIONAL | CORE | CONDITIONAL | CORE |
| Calorie, Macro & Nutrition | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Training Volume, Recovery & ACWR | CORE | CORE | CONDITIONAL | CONDITIONAL | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Strength, Power & Performance | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Physique Aesthetics & Golden Ratio | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Hormone & Health Biomarkers | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Steroid Pharmacokinetics & Injection Safety | CORE | CORE | CONDITIONAL | CONDITIONAL | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| PCT, Fertility & Side Effect Protection | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Organ Protection, Detox & Anti-Aging | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Female Bodybuilding | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| AI Meal Vision & Smart Nutrition | CONDITIONAL | CORE | CONDITIONAL | CONDITIONAL | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Contest Prep & Peak Week | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CONDITIONAL | CORE |
| Homebrew Chemistry & Peptide Reconstitution | CORE | CORE | CONDITIONAL | NOT_DEFAULT | CONDITIONAL | CORE | CORE | CORE | CORE |
| AI Behavior, Habit & Command Center | CONDITIONAL | CORE | CORE | CONDITIONAL | CONDITIONAL | CORE | CONDITIONAL | CORE | CORE |

The approved v7 registry's category counts sum to 252, but its own distribution declares 14 categories with unequal counts (for example, Training 35 and Body Composition 25); it does not implement the SPEC's aspirational equal 18-per-category distribution. The app's current `SMART_TOOL_CATEGORIES` declares 11 categories (`lib/tools/categories.ts:6-20`), so no claim is made that the app currently implements this v7 taxonomy. Prediction and personalization are never implied by a category label: each tool must provide actual models, authorized context, validation, evaluation, and provenance before those layers can be marked implemented.

### Macro v6 pilot UI evidence update — 2026-10-25

`components/tools/macro-pilot.tsx` now begins without prefilled values and presents the six required calculation inputs, updates the incomplete/full view through `calculateMacrosV6`, and displays assumptions, comparison scenarios, a bounded weight What-If control, warnings, and top sensitivity explanations. The engine exposes numeric local elasticity separately in `Top3ReasoningV6.localElasticity`, without inventing a causal contribution or confidence; the UI localizes those values. Metric/imperial inputs and What-If ranges convert at the UI boundary while the engine stays canonical kg/cm, with a test confirming unit toggles alone do not change calculated output. The component tests cover transitions, conversion, validation, Arabic RTL, and localized sensitivities. UI-language status is **PARTIAL** because generic template status tokens, `CALCULATED` markers, and unknown warning messages remain English. This is a single Macro pilot integration only; it does not constitute template rollout or tool generalization. See the updated Macro v6 report and baseline audit for exact command evidence.

### Macro distribution UI verification — 2026-10-25

The authorized Macro pilot now lists each macro's grams, calculated calories, rounded calorie percentage, summed macro energy, target, and signed difference in Arabic and English. The UI states that independently rounded percentages may not total exactly 100%; this is a text alternative and does not imply chart rendering. The distribution checkpoint passed 74/74 tests before the subsequent cross-tool follow-up; the current adapter/engine/pilot suite passes 85/85. The production build generates 385/385 pages. No macro equation or shared template changed.

### Macro cross-tool validation follow-up — 2026-10-25

`lib/tools/adapters/bodyfat-to-macro.ts` now rejects a wrong source tool, missing/mismatched unit, invalid/future timestamp, out-of-range numeric confidence, and missing/non-finite/out-of-range measurements. Only weight is imported; current body-fat percentage is not mislabeled as a target, and explicitly entered Macro inputs take precedence over linked data. Macro v6 exposes no static outbound `crossToolLinks` because the previous entries described unimplemented feeds and included a self-link. The cross-tool adapter, engine, and pilot test set passes 85/85; TypeScript, scoped ESLint, catalog validation, and the production build pass. The full suite remains blocked by 16 payment test failures. No formula or generic shared validator was changed.

### Macro scenario wording follow-up — 2026-10-25

The cut scenario description now says it calculates a target using a 15% TDEE reduction and is an arithmetic scenario only; it no longer implies a fat-loss outcome. A regression assertion checks the description. Focused tests (3 files / 85 tests), TypeScript, targeted ESLint, `validate-tools` (5 tests), and production build (385/385 pages) passed after this copy change. The repository-wide suite was not rerun afterward; its latest recorded run has 16 payment-related failures.

The primary Macro output now carries `resultType: 'CALCULATED'`, and the pilot displays a localized classification label in English and Arabic. Tests verify the marker and both labels. This is a deterministic equation result, not a prediction. Focused tests, TypeScript, targeted ESLint, `validate-tools`, and a 385/385-page production build passed after the change; the full suite was not rerun after this additive output/UI update and remains last recorded at 16 checkout/payment failures.

### Registered Macro route and shared header controls — 2026-10-25

The existing catalog route `/smarttools/nutrition/macro` now mounts the V6 pilot without changing the tool ID, slug, or URL. Local production-build HTTP verification returned 200 and found the V6 title; the page no longer contains tool-local language or measurement selectors. The pilot and tools 140, 143–146, and 149 now read language/measurement preferences through `useToolDisplayPreferences`, which consumes the global Preferences context. Tool 149 preserves canonical inputs across a header-unit change and clears only a result generated under the previous display settings. This is an initial migration batch, **not** completion of the all-tools directive: the source scan still finds 112 tool components with local language controls and 23 with local global-unit controls. Domain-specific input/output unit selectors (for example, choosing g versus mL in Tool 144) remain because they define the calculation's dimensions, rather than duplicate the global metric/imperial preference. See the baseline audit for the scan and current gate evidence.

### Header preference migration continuation — 2026-10-25

The shared header preference context is now consumed by the Macro pilot and the audited V6 tool components. The follow-up migration removed duplicated language/global metric-imperial controls from the legacy 001–030 tool components and Tool 111, and completed the remaining pilot/legacy components identified in the previous scan (BMR/TDEE, water/protein estimates, Aromatization Risk, HCG/SERM, multi-ester PK, PCT timing, HPTA recovery). Tools 006 and 010 now use the header unit system in their calculations/display; Tool 111 passes the header locale/unit system to its engine and no longer offers local locale/unit-system selectors. Legacy `useToolI18n` components continue to read language from the shared preference context. Actual dimension inputs (such as Tool 144's mass/volume/density choices and Tool 111's food quantity unit) remain.

The current source scan covered 144 non-test tool component files: 113 call `useToolDisplayPreferences`, and 28 use the shared `useToolI18n` bridge. It found zero tool-local language setters, zero local general metric/imperial selectors, and zero rendered `<MeasurementToggle>`/`<UnitSystemToggle>` controls in `components/tools` or `app/smarttools`. The legacy `components/tools/MeasurementToggle.tsx` path now exports conversion helpers only; it has no local control or preference-storage UI. This is source-level evidence, not a browser audit of every tool route or profile/guest session. Focused validation passed 18 files / 158 tests; `npx tsc --noEmit`, `npm run validate-tools` (5 tests), and `npm run build` passed; build generated 385/385 pages. Scoped ESLint exited 0 with existing warnings. `git diff --check` still reports the pre-existing trailing whitespace at `app/smarttools/page.tsx:57`. The complete repository test suite and route-by-route browser/accessibility verification remain outstanding; the all-tools rollout is therefore still **IN PROGRESS / NOT READY**.

### Header controls follow-up — active pilot routes — 2026-10-25

The active pilot routes for body-fat, body-composition vision (Tool 108), BMI, one-rep max, strength standards, and rest timer now consume `useToolDisplayPreferences`. Their labels and direction follow the header language; where the global measurement setting applies, inputs and outputs convert at the UI boundary and the canonical calculation values are preserved. The AI Insight panel also now reads the same global locale, has no embedded Arabic/English buttons, and re-requests a completed explanation after the header language changes (`components/smarttools/AIInsightPanel.tsx`). Its action button remains because it runs the panel's function; it is not a locale or measurement selector.

Verification after these changes: the six pilot UI test files passed 31/31; `npx tsc --noEmit` exited 0; scoped ESLint for the changed pilot and AI panel files exited 0. `npm run build` is running and its final page count is recorded in the baseline audit. A fresh source count finds 180 non-test TSX files under `components/tools`, 127 directly importing `useToolDisplayPreferences`, and 28 using the `useToolI18n` bridge (these sets can overlap). The local-control scan across `components/tools`, `components/smarttools`, and `app/smarttools` found no tool-local language setters/toggles or general metric/imperial selectors. The shared `components/shared/MeasurementToggle.tsx` is the site header control. Unit selectors that define a calculation's dimensions and action controls remain distinct.

This is source and focused-test evidence, not verification of all 252 canonical routes, all guest/authenticated profile states, or browser accessibility. Four old pilot files (Tools 126, 128, 133, and 136) remain hard-coded in test-only/stale implementations; their active routes use separate components that already consume shared preferences. The all-tools header integration is still **IN PROGRESS / NOT READY** pending route-by-route review and unresolved component inventory.

Build completion evidence for the header follow-up: `npm run build` reached Next.js final route summary and generated 385/385 static pages; `.next/BUILD_ID` was produced. The build logged the existing stale Browserslist database warning and missing `metadataBase` warning. `npm run validate-tools` passed 1 file / 5 tests. `git diff --check` remains FAIL (exit 2) only at the previously recorded `app/smarttools/page.tsx:57` whitespace. The index is unchanged (`git diff --cached --quiet` exit 0); no staging, database operation, migration, commit, push, or deployment occurred.

### Legacy feature tool header control cleanup — 2026-10-25

A second source review traced active legacy routes through `components/legacy/LegacyPageShell.tsx` into `features/calculator`, exposing duplicate metric/imperial buttons outside `components/tools`. Removed the local selectors from `features/calculator/HalfLifeVisualizer.tsx` and `TransformationTimeline.tsx`; both now display according to `usePreferences().unitSystem` from the global header. Removed the duplicate selectors from `features/calculator/SmartLabReference.tsx`; its SI/US result view now highlights the header-selected system. `features/calculator/hooks/useSmartLabReference.ts` derives its system directly from PreferencesContext and converts an entered lab value when the header preference changes. The test `features/calculator/hooks/useSmartLabReference.test.ts` verifies a testosterone value converts from 5 SI to 144.09 US on a header change.

A fresh scan across `app`, `components`, and `features` for local `setUnitSystem`, language setters, language toggles, and general metric/imperial controls found no tool-local selectors; the remaining setter is in the site-wide PreferencesModal, and the shared MeasurementToggle is the header control. This source search does not prove every one of the 252 catalog routes renders the correct global state. Focused lab-hook test: 1/1 passed; `npx tsc --noEmit` passed; scoped ESLint with `--no-ignore` exited 0 with three existing warnings in TransformationTimeline (unused `isRTL`, unused `KineticGraphicExplanationBox`, unnecessary memo dependencies). `npm run validate-tools` passed 5/5. The production build is running for this change set; record its result before treating this batch as verified.

The broader preference rollout remains **IN PROGRESS / NOT READY** until the published catalog and all route/component bindings are reconciled and verified. No database operation, staging, commit, push, or deployment occurred.

Build completion for the legacy feature header-control cleanup: `npm run build` completed its final Next.js route summary after compiling, type-checking, and generating **385/385** static pages; `.next/BUILD_ID` is present. Existing warnings remain for stale Browserslist data and absent `metadataBase`. The final source scan for local language/global-unit selectors returned no matches (the site-wide PreferencesModal and global header control were excluded intentionally). `git diff --check` still returns exit 2 for the pre-existing trailing whitespace at `app/smarttools/page.tsx:57`. The Git index remains unchanged. No database read/write, migration, stage, commit, push, or deployment occurred.

Scan precision note: the broader wording scan also matched a static explanatory sentence at `features/calculator/InjectionMap.tsx:200`; it is not a rendered selector or control. The control-specific scan `rg -n 'setUnitSystem\(|setLanguage\(|setLocale\(|<MeasurementToggle|<UnitSystemToggle|UnitToggleButton|ModalUnitToggle' app components features --glob '*.tsx' --glob '!*.test.tsx' --glob '!PreferencesModal.tsx' --glob '!**/LegacyHeader.tsx' --glob '!**/Header.tsx' --glob '!**/MeasurementToggle.tsx'` exited 1 (no matches). Thus the evidence supports absence of those code patterns, while not replacing rendered-route verification.

Final focused regression run after the header cleanup: 7 test files / **32 tests passed**, covering the SmartLab header conversion test and the six migrated active pilot interfaces. The index is still unchanged; the working tree retains the existing broad local changes and the current task's unstaged edits.

### Catalog identity checkpoint — 2026-10-25

The checked-out local catalog has 166 unique slugs (157 published, 9 planned); TOOL_REGISTRY has 154 unique slugs; the approved V7 registry has 252 unique IDs and numbers. Current exact set comparison: 154 intersection, 12 catalog-only, 0 registry-only. These counts do not imply tool identity equivalence. See [the separate 252-row reconciliation report](SMARTTOOLS_252_IDENTITY_RECONCILIATION_AUDIT.md) for per-row source lines, routes, classifications, unresolved identities, and the #147–150 mapping candidates. No conceptual match is labeled a verified alias.

### Current worktree catalog count correction — 2026-10-27

The 2026-10-25 figures above are historical and must not be read as current. A new read-only recount of the present worktree found 268 catalog records (268 unique slugs/IDs; 264 published, 4 planned), 261 `TOOL_REGISTRY` records (261 unique slugs), and 252 unique V7 records. Catalog/registry sets intersect at 261; catalog-only=7; registry-only=0. Only five V7 IDs match a catalog slug exactly. `HEAD` has 150 catalog records across 10 shards, 121 registry records, and no V7 registry file; the current worktree's expanded catalogs, registry, and V7 file are local/uncommitted. A separate draft repairs the existing crosswalk's source line and route evidence, but preserves earlier candidate discovery and classifications; a full conceptual rescan against all current entries and owner review remain necessary. Full count and snapshot details are in the latest addendum of [the baseline audit](GENIUS_TOOL_V3_BASELINE_AUDIT.md).

### Macro v6 current verification refresh — 2026-10-25

Current checkout verification: the Macro adapter/engine/pilot suite passes 88/88 tests; engine-only coverage is 95.21% statements, 87.85% branches, 92.10% functions, and 96.26% lines. TypeScript, `validate-tools` (5/5), scoped ESLint (0 errors; test files are ignored by config), and production build (385/385 pages) pass. Full `npm run lint` passes with 647 warnings and 0 errors. The full Vitest suite is **FAIL** with 16 payment/checkout test failures across 7 files (402 files passed, one skipped). The Macro route `/smarttools/nutrition/macro` is present in the build manifest and local HTTP smoke test returns 200 with the V6 title. Details and exact command output are in [the canonical Macro v6 report](MACRO_V6_ENGINE_REPORT.md). This does not clear the Phase 0 gate.

### SmartTools legacy-wrapper chrome audit — 2026-10-26

The rendered category-first route `/smarttools/body-composition/bodyfat` returns HTTP 200 but its server-rendered HTML contains **2 `<header>` and 2 `<footer>` elements**. This was reproduced with `Invoke-WebRequest` against the local production preview at `http://127.0.0.1:3101/smarttools/body-composition/bodyfat`.

The duplicate is explained by current source composition: `app/smarttools/layout.tsx:35,41` renders `SmartToolsHeader` and `GlobalFooterWrapper`; the dynamic route renders the loader-resolved tool component (`app/smarttools/[category]/[tool]/page.tsx:60-77`); the generic loader maps ordinary slugs to `components/tools/${slug}` (`lib/tools/loaders.ts:24-29`); and the legacy wrappers for `bodyfat`, `injection`, `halflife`, `lab`, `genetic`, `cycle`, `timeline`, and `master-calculator` each render `LegacyPageShell` (`components/tools/{bodyfat,injection,halflife,lab,genetic,cycle,timeline,master-calculator}.tsx`). That shell independently renders `LegacyHeader` and `GlobalFooterWrapper` (`components/legacy/LegacyPageShell.tsx:28-34`). Thus all eight catalog tools use the duplicate-chrome path unless a route-specific page bypasses their wrapper. Macro's category route is a route-specific exception: `app/smarttools/nutrition/macro/page.tsx:1-4` renders `MacroPilotTool` directly.

Related route/source divergence: catalog #2 `bodyfat` declares `components/tools/bodyfat`, `lib/tools/engines/bodyfat`, and `lib/tools/schemas/bodyfat` (`lib/tools/smartToolsCatalog.ts:42`), while the V6 pilot is wired to `/bodyfat` (`app/bodyfat/page.tsx:3`) rather than the category-first SmartTools route. The category route therefore resolves the legacy wrapper through `getToolComponent`; catalog file-presence validation alone does not show that the V6 pilot is active there. Likewise, Macro's catalog metadata names the old wrapper/engine/schema (`lib/tools/smartToolsCatalog.ts:41`) while the canonical page renders the V6 pilot. These are identity-preserving but material route/runtime metadata mismatches.

**Classification:** duplicate shared chrome is **COMPLETE / runtime-confirmed** as a finding; behavior differs for route-specific pilots. No source change was made because the current execution gate restricts application edits to Macro and the explicitly approved Tool 147 work. The prior scan proving there were no tool-local language or unit setters did not test for duplicate global header/footer rendering and must not be taken as evidence of a single shared header/footer per tool. Fix requires a separately scoped SmartTools shell integration change plus route-level regression checks for legacy wrappers and pilot routes.

### Current SmartTools preference source scan — 2026-10-27

The earlier 144-component / 113-display-hook count above is a historical scan and should not be read as the current 252-tool inventory. A fresh source-only scan of 253 `components/tools/tool-*.tsx` runtime files (excluding test files) found 228 using `useToolDisplayPreferences`, 17 using the language-only `useToolI18n`, and 8 using neither. This is a component-file count, not 252 unique active tool routes; helper/stale-pilot files are included and still need route tracing. No production local language/unit selector setter was found by the scoped source search. `lib/shared/unit-system.ts` currently has no production consumers in `app`, `components`, `context`, `lib`, or `features`, so unit conversions are implemented at tool boundaries or through other helpers rather than via this shared service. Treat global unit compliance as **PARTIAL / NOT VERIFIED per active route**, not complete. Full counts, scan scope, and limitations are in the current addendum of `GENIUS_TOOL_V3_BASELINE_AUDIT.md`.
