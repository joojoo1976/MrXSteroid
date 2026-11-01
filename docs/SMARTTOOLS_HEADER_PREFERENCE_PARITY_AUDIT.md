# SmartTools Header Preference Parity Audit

**Audit date:** 2026-10-25  
**Scope:** Published catalog components and their shared page/provider/header path. This is a static source audit; it does not certify every field conversion or every rendered state.

## Evidence and method

- Parsed the ten checked-out `lib/tools/smartToolsCatalog*.ts` catalog files and followed component imports/exports, including TSX wrappers. The scan found **162 published entries**, **162 resolvable component entry points**, and no missing component paths. Planned catalog entries were excluded.
- Verified the shared runtime path: `app/layout.tsx` mounts `RootProviders`; `app/providers.tsx` mounts `PreferencesProvider`; `app/smarttools/layout.tsx` renders `SmartToolsHeader`; `components/layouts/SmartToolsHeader.tsx` renders `GlobalHeader`.
- `shared/ui/GlobalHeader.tsx` reads `language`, `setLanguage`, `unitSystem`, and `setUnitSystem` from `usePreferences`; it contains language switching and metric/imperial controls (including desktop/mobile controls).
- `components/tools/useToolDisplayPreferences.ts` reads the shared `PreferencesContext` and exposes its locale, unit system, and RTL direction. Its metric default is a fallback when used outside the provider; published SmartTools routes are under the root provider.
- Searched tool implementation files (excluding tests and the conversion-helper compatibility module) for local `setLanguage`, `setUnitSystem`, language switches, or metric/imperial toggle handlers. No matches were found. Tool-specific selectors (for example, selecting an item's unit or a scientific measurement unit) are not header preference toggles.
- `components/tools/MeasurementToggle.tsx` contains conversion helpers and no local control or preference storage.

## Result

| Requirement | Status | Evidence / limit |
|---|---|---|
| All published tools render beneath the shared preferences provider and SmartTools header | **STATICALLY VERIFIED** | 162 catalog entries resolve to components; shared wrapper chain above. Dynamic category/tool route and legacy flat routes inherit `app/smarttools/layout.tsx`. |
| Header is the source of language and measurement-system selection | **VERIFIED AT SHARED SHELL** | `GlobalHeader` uses `PreferencesContext`; desktop/mobile controls update the shared context. |
| No duplicate language or measurement-system toggle found inside tool implementation sources | **STATICALLY VERIFIED, SEARCH-BOUNDED** | Exact setter/toggle search produced no matches in tool components. This does not prove absence of every differently named custom control. |
| Every tool's labels, inputs, outputs, and calculations correctly follow both preferences | **NOT VERIFIED END-TO-END** | Dependency presence is not behavioral proof. Existing focused tests cover selected tools only; this audit did not render all 162 tools under both languages and unit systems or verify every conversion/calculation. |
| Browser/accessibility parity across all tool routes | **NOT RUN** | No exhaustive browser or assistive-technology review was performed. |

## Scan caveat

An initial dependency-closure heuristic marked nine legacy wrappers as possible local toggles because their shared `LegacyPageShell` dependency contains preference setters. Manual inspection showed those components are wrappers around `LegacyPageShell` and do not define local language/unit controls. The false-positive list was not treated as a defect.

The same broad dependency scan reported context/conversion symbols in every tool closure; this only proves dependency reachability, not that each tool consumes the selected unit system correctly. Do not interpret the 162/162 result as proof of complete conversion parity.

## Git and changes

- Branch: `main`
- HEAD: `254ce1299bff227c54809bb7027f9b587d69c143`
- At audit start, the worktree already contained extensive local modifications and untracked files; no files were staged. No pre-existing changes were reset, stashed, or overwritten.
- This audit added only this report. No application implementation, tests, registry, catalog, database, or environment file was modified for this audit. No commit, push, or deployment was performed.

## Next evidence needed

Run a component-level parity suite in small groups for tools with user-visible dimensional inputs/outputs. For each relevant field, verify that changing the global header unit preference changes displayed units and converts values to/from canonical calculation units without changing the underlying result. Exercise Arabic/English and RTL/LTR through the same provider. Record tools where units are not applicable separately from tools where behavior remains untested. Follow with browser and accessibility review before claiming complete parity.

## Follow-up batch: Tools 145–150

## Current-checkout catalog refresh — 2026-10-27

The opening evidence above is a historical snapshot from the 162-tool catalog. A read-only recount of the current checkout now finds **264 published catalog entries**, with 264 unique tool IDs, slugs, hrefs, and resolvable component paths. The shared-shell conclusion remains the same: published category/tool routes render beneath `app/smarttools/layout.tsx`, `SmartToolsHeader`, `GlobalHeader`, and the root `PreferencesProvider`.

This refresh does **not** promote the planned entries (132, 137–139), does not certify field-level unit conversion for every published tool, and does not replace the focused preference suites or the required browser/accessibility review. The current catalog counts and route/component evidence are recorded in `docs/SMARTTOOLS_FINAL_CATALOG_AUDIT.md`; the 162-tool figures above are retained as dated historical evidence rather than treated as current totals.

- Added a Tool 145 UI integration test that rerenders the tool with the global preference context changed from Arabic/RTL to English/LTR, verifies entered habit name and checked day persist, and confirms there are no local language or measurement preference buttons. Measurement units are not applicable to this habit checklist.
- Command: `npx vitest run components/tools/tool-145-habit-intelligence-consistency-coach.test.tsx components/tools/tool-146-emergency-warning-signs-checklist.test.tsx lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts components/tools/tool-148-personal-fitness-memory-layer.test.tsx lib/tools/engines/tool-148-personal-fitness-memory-layer.v6.test.ts tests/unit/components/tool-149-physique-trajectory-simulator.test.tsx lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts components/tools/tool-150-ai-performance-command-center.test.tsx lib/tools/engines/tool-150-ai-performance-command-center.v6.test.ts`
- Result: **PASS**, exit 0; 10 files / 62 tests. Vite emitted its existing dynamic-import warning from `lib/tools/loaders.ts`.
- `npx tsc --noEmit` — **PASS**, exit 0; `npx eslint --no-ignore components/tools/tool-145-habit-intelligence-consistency-coach.test.tsx` — **PASS**, exit 0.
- Scope limit: this batch tests Tools 145–150 implementations and preference behavior only where covered by those suites. It does not establish parity for all 162 published tools or perform browser/accessibility review.

### Focused current-checkout rerun — 2026-10-26

Re-ran the recorded Tools 145–150 suite against the current checkout:

`npx vitest run components/tools/tool-145-habit-intelligence-consistency-coach.test.tsx components/tools/tool-146-emergency-warning-signs-checklist.test.tsx lib/ncbi/eutils-rate-limit.test.ts lib/tools/engines/tool-147-scientific-evidence-explorer.test.ts components/tools/tool-148-personal-fitness-memory-layer.test.tsx lib/tools/engines/tool-148-personal-fitness-memory-layer.v6.test.ts tests/unit/components/tool-149-physique-trajectory-simulator.test.tsx lib/tools/engines/tool-149-physique-trajectory-simulator.v6.test.ts components/tools/tool-150-ai-performance-command-center.test.tsx lib/tools/engines/tool-150-ai-performance-command-center.v6.test.ts --reporter=dot`

**PASS**, exit 0; 10 files / 62 tests. Vitest emitted the existing `vite:dynamic-import-vars` warning from `lib/tools/loaders.ts`; the test run still completed successfully. This is a focused regression check for the named tools, not full catalog parity, upstream NCBI/Upstash availability, or browser/accessibility verification.

The 390×844 Macro screenshot review also found a category link extending beyond the viewport bounds within the shared horizontally scrollable category strip. The strip is intentionally `overflow-x-auto`; this is not a duplicate language/unit control or evidence of Macro form overflow. No shared-header source was changed during this audit.

## Follow-up batch: Tools 140–144

- Added a Tool 140 integration test that changes the shared language from Arabic to English and verifies RTL/LTR, preserved input, and absence of local language/unit controls. Its analyte-specific source/destination unit pair is explicitly selected by the tool and is not controlled by the global metric/imperial preference.
- Added a Tool 143 test that changes metric temperatures to imperial and then changes the global language to Arabic, verifying the entered canonical Celsius values display as 35.6°F, 46.4°F, 37.4°F, and 44.6°F while the UI follows RTL. This exercises retained values through preference updates.
- Added a Tool 144 integration test that changes the shared language while retaining entered values and confirms its unit selectors are measurement inputs rather than header preference buttons.
- Command: `npx vitest run components/tools/tool-140-dosage-unit-conversion-engine.test.tsx components/tools/tool-141-carrier-oil-viscosity-syringe-pressure.test.tsx components/tools/tool-142-compound-purity-active-yield-estimator.test.tsx components/tools/tool-143-storage-stability-thermal-degradation-estimator.test.tsx components/tools/tool-144-homebrew-chemistry-calculator.test.tsx` — **PASS**, exit 0; 5 files / 19 tests.
- The first invocation had one failed assertion because the new Tool 144 test expected a shortened title. The expectation was corrected to the title rendered by the existing component and the complete five-file batch was rerun successfully.
- `npx tsc --noEmit` — **PASS**, exit 0. `npx eslint --no-ignore components/tools/tool-140-dosage-unit-conversion-engine.test.tsx components/tools/tool-143-storage-stability-thermal-degradation-estimator.test.tsx components/tools/tool-144-homebrew-chemistry-calculator.test.tsx` — **PASS**, exit 0.
- This batch does not prove parity for other tools or verify provider interactions in a browser.

## Follow-up batch: Tools 131–136

- Added a Tool 134 integration test that changes Arabic/RTL to English/LTR through the shared preference provider, verifies both entered side measurements persist, and confirms no local header preference controls appear. Its inputs are degrees or seconds, so global metric/imperial conversion is not applicable.
- Existing Tool 131 and Tool 136 UI tests verify global kg/lb and cm/in display conversion. Existing Tool 133–135 cases exercise their available language/context surfaces; their respective exercise loads, velocity, degrees/seconds, and option lists do not use the global mass/length system unless a dimensional field is shown.
- Command: `npx vitest run components/tools/tool-131-136-batch.dom.test.tsx components/tools/tool-133-rep-tempo-velocity-loss-analyzer-pilot.test.tsx components/tools/tool-136-physique-golden-ratio-score-pilot.test.tsx lib/tools/engines/tool-131-136-batch.test.ts` — **PASS**, exit 0; 4 files / 18 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. `npx eslint --no-ignore components/tools/tool-131-136-batch.dom.test.tsx` — **PASS**, exit 0.
- This batch does not establish parity outside Tools 131–136 or verify browser behavior.

## Follow-up batch: Tools 120–130

- Reviewed the available preference/UI tests for Tools 120, 122, and 126–130 plus shared engine batches 122–125 and 126–130. Existing tests cover the kg/lb transitions for Tool 120, mass/length conversions for Tool 126, language/RTL updates for Tool 126, and Tool 130's mass-unit rendering path. Tools 127–129 and 122–125 use unitless or explicitly consistent user-entered scales in the exercised UI cases; their results are not converted as if those scales were standardized units.
- Command: `npx vitest run components/tools/tool-120-progressive-overload-predictor.dom.test.tsx components/tools/tool-122-rpe-rir-1rm-velocity-modeler.dom.test.tsx components/tools/tool-126-neuromuscular-explosiveness-modeler-pilot.test.tsx components/tools/tool-126-130-batch.dom.test.tsx components/tools/tool-128-training-load-acute-chronic-ratio-pilot.test.tsx lib/tools/engines/tool-122-125-batch.test.ts lib/tools/engines/tool-126-130-batch.test.ts` — **PASS**, exit 0; 7 files / 22 tests.
- Tool 121, 123–125 and some other entries in this range have engine/batch coverage but no individually discovered UI preference test in this command. This is not evidence of a UI defect; their display behavior remains unverified here.
- This batch does not establish parity outside the tested tools or verify browser behavior.

## Follow-up batch: Tools 112–121

- Added `components/tools/tool-117-119-header-preferences.test.tsx` with Tool 117 tests for ml/h ↔ fl oz/h canonical fluid conversions and Arabic/RTL localization, and Tool 119 tests for kg ↔ lb training-load conversion and Arabic/RTL localization. Both checks confirm no local language/unit preference buttons.
- Added a Tool 118 test verifying metric body temperature converts to Fahrenheit through the shared header setting, and Arabic/RTL labels follow the global language. It also confirms no local preference controls.
- Existing Tool 112 tests already cover global locale and metric/imperial changes. Tools 113–116 use food/item units or nutrients that do not necessarily map to the global mass system and need field-level review before claiming parity.
- Command: `npx vitest run components/tools/tool-112-food-quality-micronutrient-diversity-score.dom.test.tsx components/tools/tool-117-119-header-preferences.test.tsx components/tools/tool-120-progressive-overload-predictor.dom.test.tsx components/tools/tool-122-rpe-rir-1rm-velocity-modeler.dom.test.tsx lib/tools/engines/tool-112-117-batch.test.ts lib/tools/engines/tool-118-121-batch.test.ts` — **PASS**, exit 0; 6 files / 21 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. `npx eslint --no-ignore components/tools/tool-117-119-header-preferences.test.tsx` — **PASS**, exit 0.
- Initial test assertions for wrapper roles/titles did not match the rendered DOM; these were corrected to the actual headings and direction-bearing wrapper, then the new tests and full six-file batch passed.
- This batch does not verify all tools in 112–121 in a browser; Tools 115 and any additional unit-bearing fields outside the tested input paths still require field-level review.

### Tool 113 follow-up

- Source review confirmed `unit_size_g` is an actual package mass input, unlike macro nutrient values expressed per 100 g. Tool 113 previously used the global language but hard-coded metric draft metadata and displayed package mass in grams regardless of the header.
- Updated the component to read the shared `unitSystem`, display package mass as g or oz, convert edits into canonical grams, preserve the canonical value when preferences change, and pass the selected unit system into draft metadata and result output construction. Macro targets and per-100 g composition remain in their standard nutrition units.
- Added `components/tools/tool-113-header-preferences.test.tsx` to verify 1000 g ↔ 35.27 oz, an imperial 16 oz entry returning to 453.592 g, Arabic localization/RTL, retained value, and no local preference buttons.
- Command: `npx vitest run components/tools/tool-113-header-preferences.test.tsx lib/tools/engines/tool-112-117-batch.test.ts` — **PASS**, exit 0; 2 files / 8 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. Scoped ESLint — **exit 0**, with one existing `react-hooks/set-state-in-effect` warning at the draft-loading effect (line 79); this warning concerns pre-existing draft hydration and is outside the unit-display change.

### Tools 114 and 116 follow-up

- Added `components/tools/tool-114-116-header-preferences.test.tsx`. Tool 114 now has a UI assertion for ingredient weight 100 g → 3.5 oz → 113 g after changing the shared unit preference, plus Arabic/RTL behavior. Tool 116 has the equivalent food amount transition and confirms nutrient-specific fields remain present while their standard units are kept intact.
- Command: `npx vitest run components/tools/tool-114-116-header-preferences.test.tsx lib/tools/engines/tool-112-117-batch.test.ts` — **PASS**, exit 0; 2 files / 9 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. `npx eslint --no-ignore components/tools/tool-114-116-header-preferences.test.tsx` — **PASS**, exit 0.
- These assertions cover the entered ingredient/food amount paths; they do not exhaustively validate every result card or browser rendering.

## Follow-up batch: Tools 104, 106 and 108

- Tool 104 now follows the global measurement preference for body weight (kg/lb) and height (cm/in). Values are converted to canonical kg/cm before the existing Mifflin-St Jeor engine; TSH/T3/T4 and all clinical lab units remain unchanged. Draft metadata records the selected unit system.
- Tool 106 now converts body and lean mass between kg/lb and its water-reference output between L/fl oz. Glycogen, carbohydrate totals, and g/kg/day nutrition values remain in their domain-specific standard units. Calculations still receive canonical kg inputs. Draft metadata records the selected unit system.
- Tool 108 now converts weight (kg/lb), height and circumference fields (cm/in), while retaining canonical kg/cm engine inputs. BMI, body-fat percentage, FFMI, photo metadata, and estimator logic are unchanged. Draft metadata records the selected unit system.
- Added `components/tools/tool-104-106-108-header-preferences.test.tsx` to check unit changes preserve canonical outputs, reverse conversions after imperial edits, and Arabic/RTL labels.
- `npx vitest run components/tools/tool-104-106-108-header-preferences.test.tsx` — **PASS**, exit 0; 1 file / 3 tests.
- Initial follow-up command named a nonexistent aggregate test path `lib/tools/engines/tool-101-110-batch.test.tsx`; Vitest matched only the two existing UI files (4 tests). The nonexistent engine path was not executed. Full engine test coverage for 101–110 is recorded in the later explicit command below.
- `npx tsc --noEmit` — **PASS**, exit 0.
- Scoped ESLint — **exit 0**, 0 errors. It reported the test file as ignored and three existing `react-hooks/set-state-in-effect` warnings at the synchronous draft-load effects in Tools 104, 106 and 108 (lines 46, 46 and 54). Those draft hydration patterns predate this change.
- `git diff --check` — **exit 0**; Git emitted only line-ending normalization warnings for the three modified components.
- Browser/accessibility review remains NOT RUN; this unit-preference batch alone does not establish full tool readiness.

### Tool 107 follow-up

- Tool 107 now follows the global measurement preference for body weight (kg/lb) and water-reference range (L/fl oz), while the engine continues to receive canonical kilograms and returns canonical liters. Sodium (mg/day) and the underlying reference formula remain unchanged. Draft metadata records the selected unit system.
- Added `components/tools/tool-107-header-preferences.test.tsx` covering metric-to-imperial rendering, reverse conversion after an imperial edit, stable sodium reference, Arabic/RTL, and absence of local preference buttons.
- `npx vitest run components/tools/tool-107-header-preferences.test.tsx --reporter=dot` — **PASS**, exit 0; 1 file / 1 test.
- `npx vitest run lib/tools/engines/tool-107-contest-prep-peak-week-manipulator.test.ts lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.test.ts lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler.test.ts lib/tools/engines/tool-105-ai-health-data-fusion-hub.test.ts lib/tools/engines/tool-109-competition-readiness-posing-os.test.ts lib/tools/engines/tool-110-ai-meal-vision-scanner.test.ts --reporter=dot` — **PASS**, exit 0; 6 files / 40 tests.
- The reviewed neighboring tools do not expose general physical measurements to convert: Tool 101 uses durations/categories; Tool 102 uses medication modeling units (mg, mg/ml and ml), which remain stable for domain meaning; Tool 105 accepts user-defined measurement units; Tool 109 has no mass/length/volume fields; Tool 110 reports nutrition quantities in standard nutrient units. These should not be mechanically converted based on the global display preference.
- Local preview route `/smarttools/platform-ai/tool-147-scientific-evidence-explorer` returned HTTP 200 from `http://localhost:3000`; this verifies page rendering only, not NCBI/Upstash live availability or full Genius V3 completion.

### Follow-up audit: Tools 101–110 preference parity and engines

- Added `components/tools/tool-101-102-105-109-110-header-preferences.test.tsx`; it checks global English/Arabic updates, LTR/RTL direction and absence of local language/unit controls for the listed tools. These tools do not expose standardized body mass/length/volume values for general conversion: Tool 101 uses compound/duration categories; Tool 102 uses medication-modeling mg, mg/ml and ml units; Tool 105 accepts user-entered measurement units; Tool 109 has no physical measurement input; Tool 110 reports nutrition quantities in standard g/kcal units. Those domain units remain unchanged when the visitor selects imperial display.
- Tool 107 preference conversion and safety of canonical units are covered in its preceding follow-up entry. Tools 103, 104, 106 and 108 have their own conversion tests in the preceding entries.
- Command: `npx vitest run lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.test.ts lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler.test.ts lib/tools/engines/tool-103-renal-function-hydration-index.test.ts lib/tools/engines/tool-104-thyroid-metabolic-rate-dynamics.test.ts lib/tools/engines/tool-105-ai-health-data-fusion-hub.test.ts lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.test.ts lib/tools/engines/tool-107-contest-prep-peak-week-manipulator.test.ts lib/tools/engines/tool-108-ai-body-composition-vision-engine.test.ts lib/tools/engines/tool-109-competition-readiness-posing-os.test.ts lib/tools/engines/tool-110-ai-meal-vision-scanner.test.ts components/tools/tool-103-header-preferences.test.tsx components/tools/tool-104-106-108-header-preferences.test.tsx components/tools/tool-107-header-preferences.test.tsx components/tools/tool-101-102-105-109-110-header-preferences.test.tsx --reporter=dot` — **PASS**, exit 0; 14 files / 75 tests.
- `npx tsc --noEmit` — **PASS**, exit 0.
- An earlier logged command named a nonexistent aggregate test path `lib/tools/engines/tool-101-110-batch.test.tsx`; Vitest skipped that unmatched path. That entry is corrected to avoid implying its tests ran. The exact explicit command above ran the ten existing engine test files.
- This verifies the exercised unit-preference paths and deterministic engine tests only. It does not establish full Genius V3 compliance, real AI integration, clinical correctness, browser accessibility, or readiness of the complete 252-tool catalog.

### Static implementation findings surfaced during the next catalog scan

- Tool 023 is published in `lib/tools/smartToolsCatalog5.ts:7`. The prior source scan found a body-weight UI field and an engine parameter that was explicitly discarded. Follow-up cleanup removed the unused field and engine parameter; no weight-based dosing relationship was inferred or added. This does not validate the engine's clinical logic, which remains outside this parity change.
- Tool 030 is published in `lib/tools/smartToolsCatalog5.ts:14`. The prior source scan found a fabricated `user_weight_kg: 85` passed by the UI and ignored by the cost engine. Follow-up cleanup removed the fabricated value and the unused engine/schema field. No cost formula or medication-related content was changed.
- Tool 021 already reads the shared `unitSystem` and converts the peptide calculation's body-weight entry to canonical kg (`components/tools/tool-021-peptide-protocol.tsx:20,71-75`); peptide dose remains mcg/kg as a domain-specific unit.
- These findings are not an endorsement or clinical validation of Tool 023's dosing output or Tool 021's dosing model. Tool 021 was not changed.

### Follow-up: remove unused weight inputs in Tools 023 and 030

- Removed Tool 023's body-weight state, visible field, and ignored engine property, and removed the `as any` call cast. The engine calculations were not changed.
- Removed Tool 030's hard-coded `user_weight_kg: 85` and unused schema/interface property. Removed its goal selector because the engine did not use it; goal-specific pricing is not implemented. PCT cost now scales by the supplied PCT duration using the existing assumed rates ($50/week and $60/week); these assumptions are not sourced market prices or medical guidance.
- Removed Tool 023's unused age-decline intermediate, which had no effect on its result.
- Added pure input-contract and PCT-duration tests for the engines/schema; these do not render components or invoke persistence hooks.
- Follow-up UI completion: Tool 030 now exposes PCT duration as a bilingual numeric field, validates the full input against the existing Zod schema before calculating, and reports invalid values accessibly. The schema range is 1–26 weeks.
- Verification after this follow-up:
  - \`npx vitest run lib/tools/engines/tool-023-trt-optimization.test.ts lib/tools/engines/tool-030-cycle-cost-calculator.test.ts --reporter=dot\` — PASS, exit 0; 2 files / 4 tests.
  - \`npx tsc --noEmit\` — PASS, exit 0.
  - Scoped \`npx eslint ...\` on the two components, engines, and Tool 030 schema — exit 0, 0 errors / 30 warnings before the subsequent Tool 030 cost-input UI/model change; rerun it after that change. Warnings remain in these legacy components/engine (unused imports/state and \`any\` types).
  - Scoped \`git diff --check\` — PASS, exit 0; Git reports the existing CRLF→LF normalization notice for the touched i18n JSON file.
  - No production build or full suite was run for this focused cleanup.
- Separate readiness risks observed during the bounded source review, not resolved by this parity cleanup:
  - Tool 023 computes and labels an individualized weekly TRT dose using a fixed baseline, a simplified total-test adjustment, and symptom increments (\`lib/tools/engines/tool-023-trt-optimization.ts:59-75,123\`). The UI exposes only age as an editable clinical input; the other values remain defaults (\`components/tools/tool-023-trt-optimization.tsx:15-22,40\`). This does not establish a clinically supported decision model and requires a dedicated safety/source review before the tool is represented as a functioning TRT optimizer.
  - Tool 030 previously used an assumed flat $5/mg price, auto-added default ancillary compounds, and suggested sharing cycle costs with a partner. The cost model and suggestions have since been corrected below; the legacy PCT pricing assumption remains and is disclosed.
- Tool 030 cost-input correction: replaced the fabricated $5/mg price with direct summation of user-entered item costs; removed automatic ancillary items and compound dose/concentration fields from the cost contract; removed unsupported use/cost-saving suggestions; and calculates average weekly cost over the cycle plus PCT weeks. The engine now enforces its Zod input schema at runtime. PCT remains an illustrative $50/$60 per-week assumption with a bilingual notice.
- Tool 030 UI regression coverage checks English/Arabic labels, RTL container, user-entered line items, PCT-duration effects, invalid-row blocking, removal of default medicines, and that only valid calculations request the mocked save hook.
- Final verification after the Tool 030 cost-input correction:
  - \`npx vitest run lib/tools/engines/tool-023-trt-optimization.test.ts lib/tools/engines/tool-030-cycle-cost-calculator.test.ts components/tools/tool-030-cycle-cost-calculator.test.tsx --reporter=dot\` — PASS, exit 0; 3 files / 10 tests. The initial UI-test attempt failed because test selectors used different capitalization/Arabic wording than the rendered button labels; selectors were corrected and the same suite passed.
  - \`npm run validate-tools\` — PASS, exit 0; 1 file / 5 tests.
  - \`npx tsc --noEmit\` — PASS, exit 0.
  - \`npx eslint components/tools/tool-023-trt-optimization.tsx components/tools/tool-030-cycle-cost-calculator.tsx lib/tools/engines/tool-023-trt-optimization.ts lib/tools/engines/tool-030-cycle-cost-calculator.ts lib/tools/schemas/tool-030-cycle-cost-calculator.ts\` — exit 0, 0 errors / 21 warnings.
  - Tool 030 i18n JSON parse check — PASS, exit 0.
  - Scoped \`git diff --check\` — PASS, exit 0, with a CRLF→LF normalization notice for the i18n JSON.
  - Local preview HEAD checks — HTTP 200 for \`/smarttools/cycle-management/tool-030-cycle-cost-calculator\`, the legacy \`/smarttools/tool-030-cycle-cost-calculator\`, and Tool 147's existing route.
  - Production build, browser interaction/accessibility review, and full test suite — NOT RUN.
- No database writes, migrations, commits, pushes, or deployment actions were performed. These edits do not establish clinical validity or full Genius V3 completion.

## Current-checkout preference-suite sweep — 2026-10-26

Discovered and ran every existing component test matching `components/tools/*header-preferences*.test.tsx`:

```powershell
$tests = @(Get-ChildItem components/tools -File -Filter '*header-preferences*.test.tsx' | ForEach-Object { $_.FullName })
npx vitest run @tests --reporter=dot
```

**PASS**, exit 0; 13 files / 64 tests. This confirms the assertions in the existing preference suites still pass together in the current checkout. It does not establish coverage of every published tool/component: the suite set is authored and selective, and static route resolution is not a rendered test. It also does not verify every unit conversion, every authenticated/guest path, mobile browser behavior, keyboard/screen-reader accessibility, or deployed-domain behavior. No implementation or test source was changed for this sweep; no database action, migration, commit, push, or deployment occurred.

## Follow-up batch: Tools 069 and 079

- Tool 069 now converts its daily water input between L and US fl oz while keeping canonical liters for validation/calculation. Draft and ToolOutput metadata now follow the global unit preference. No liver-support score logic or recommendation text was changed.
- Tool 079 now converts body weight between kg/lb while keeping canonical kg for its engine. Draft and ToolOutput metadata now follow the global unit preference; g/hr nutrient oxidation output remains a domain standard.
- Added `components/tools/tool-069-079-header-preferences.test.tsx`, verifying round-trip unit changes, stable calculation outputs, and Arabic/RTL labels.
- `npx vitest run lib/tools/engines/tool-069-detoxification-optimizer.test.ts lib/tools/engines/tool-079-fat-metabolism-calculator.test.ts components/tools/tool-069-079-header-preferences.test.tsx --reporter=dot` — **PASS**, exit 0; 3 files / 7 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. Scoped ESLint for the two changed components — **PASS**, exit 0 with no reported warnings. `git diff --check` — **PASS**, exit 0.

### Tool 052 review finding

- Tool 052 exposes and validates `bodyweight_kg` in the UI/schema (`components/tools/tool-052-growth-hormone-protocol-planner.tsx:15,78-79`), while the engine calculation uses weekly IU, schedule pattern, duration, and price but not bodyweight (`lib/tools/engines/tool-052-growth-hormone-protocol-planner.ts:31-37`). Its context, draft, and dashboard metadata also hard-code `unitSystem: 'metric'` (`components/tools/tool-052-growth-hormone-protocol-planner.tsx:42,52,61`), and the component reads only locale from shared preferences (`:22`). I did not add an imperial conversion for a bodyweight field that the growth-hormone dose model ignores; doing so risks implying a weight-based calculation that does not exist. Resolve the unused field and intended clinical model behavior in a dedicated scope review before changing it.

### Group 061–080 scan

- Source scan found dimensional inputs in Tools 069 and 079 with no unit conversion; both are corrected above. Tool 052 is separately recorded as a non-converting mismatch because its mass field is disconnected from the engine. The scan did not find other physical mass/length/volume input fields in Tools 061–080 that lack the shared preference hook. This was a source-pattern scan, not browser validation.

## Follow-up batch: Tools 090, 093 and 097

- Tool 097 now displays body weight in kg/lb and recommended daily fluid plus sweat-loss volumes in L/fl oz. Inputs remain canonical kg in the engine; outputs are converted for display only. Draft and output metadata now carry the selected global unit preference.
- Tools 090 and 093 use cycle-duration/day fields, which remain days. Their draft and ToolOutput metadata now accurately carry the selected global unit preference instead of always reporting metric; no artificial unit conversion was added.
- Added `components/tools/tool-097-header-preferences.test.tsx` for weight/fluid conversions, canonical result stability, reverse entry conversion, and Arabic/RTL. Added `components/tools/tool-090-093-header-preferences.test.tsx` for language/RTL behavior and unchanged day values.
- Command: `npx vitest run components/tools/tool-090-093-header-preferences.test.tsx components/tools/tool-097-header-preferences.test.tsx lib/tools/engines/tool-090-female-hormone-balance-calculator.test.ts lib/tools/engines/tool-093-menstrual-cycle-manager.test.ts lib/tools/engines/tool-097-hydration-balance-calculator.test.ts --reporter=dot` — **PASS**, exit 0; 5 files / 9 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. Scoped ESLint for the three changed components — **PASS**, exit 0 with no reported warnings. `git diff --check` — **PASS**, exit 0.
- Static scan of Tools 081–100 found Tools 090/093 day values and Tool 097 physical measurement values. No other published component in this scanned range matched the dimensional field patterns used for this pass. This is a bounded source scan, not exhaustive UI/browser evidence.

## Follow-up batch: Tools 061–080 metadata and locale parity

- A broader dimensional/domain term scan found hard-coded `unitSystem: 'metric'` values in Tools 061–068, 070–078 and 080. These components consume the shared locale preference; their displayed measurement fields in this scan are laboratory/domain units (or non-dimensional scores), not generic body mass/length/volume inputs to convert. The earlier Tool 069 and 079 batch had already corrected real water and body-weight conversions.
- Updated all 18 affected components in this range to carry the selected global `unitSystem` into generated ToolOutput metadata and autosaved draft metadata, including preference-sensitive memo/effect keys. No engine formulas or domain-specific lab units were changed.
- Added `components/tools/tool-061-080-header-preferences.test.tsx`, with one parameterized case per affected tool to verify English/LTR → Arabic/RTL updates and no local language/unit controls.
- Command: dynamically discovered all existing engine test files matching `tool-061` through `tool-080`, then ran them with `components/tools/tool-061-080-header-preferences.test.tsx` — **PASS**, exit 0; 21 files / 75 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. Scoped ESLint across all 20 preference consumers in Tools 061–080 — **PASS**, exit 0, no output. `git diff --check` — **PASS**, exit 0 with line-ending normalization warnings only.
- Static re-scan found no `unitSystem: 'metric'` literals in the 20 scanned consumers. This closes only the inspected metadata mismatch and tested preference locale paths; browser/accessibility and full Genius V3 behavior remain unverified.

## Follow-up batch: Tools 041–060 metadata and locale parity

- Replaced hard-coded `unitSystem: 'metric'` with the selected shared preference in all 20 components, including ToolOutput draft/dashboard metadata, autosaved draft metadata, and preference-sensitive memo/effect keys. The visible fields in this batch are principally clinical/lab-domain units (hematocrit %, hormone concentration units, glucose/insulin units, bone-density measures, dose units, and days); they remain domain-fixed and are not automatically converted to lb/fl oz.
- Added `components/tools/tool-041-060-header-preferences.test.tsx`, one rendered locale/RTL case for each of 20 tools, also checking that components do not add duplicate language/unit controls.
- Command: dynamically discovered engine test files matching `tool-041` through `tool-060`, then ran them with the new preference test — **PASS**, exit 0; 21 files / 80 tests.
- `npx tsc --noEmit` — **PASS**, exit 0. Scoped ESLint across all 20 updated consumers — exit 0, 0 errors, 8 pre-existing unused-import/unused-helper warnings: Tool 051 (2), 052 (1), 053 (1), 058 (1), 059 (1), and 060 (2). `git diff --check` — **PASS**, exit 0 with line-ending normalization warnings only.
- Static scan found no `unitSystem: 'metric'` literals remaining in these 20 files.
- Tool 052 remains a documented exception: its displayed `bodyweight_kg` is not used by the engine, and the UI still labels/accepts it in kg when Imperial is selected. Metadata now correctly records the header choice, but that field was intentionally not converted because it is disconnected from the calculation and a conversion could imply that the dosage model uses body weight. Resolve the model/input contract in a separate safety and scope review.
- No engine formulas, database writes, migrations, commits, pushes, or deployment actions were performed. This batch does not establish clinical validity or full Genius V3 completion.
