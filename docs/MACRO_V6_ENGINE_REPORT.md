# Macro v6 Engine Report — 2026-10-25

## Gate summary

**Current decision: NOT READY FOR PHASE 2.** The scoped Macro v6 suite, TypeScript, tool validation, scoped ESLint, and engine coverage pass. Project-wide Vitest has failures in the current dirty worktree; this run does not establish that they are pre-existing. Stage 0 review has surfaces explicitly left unverified. Do not start a template or tool rollout from this report.

## Checkpoint and scope

- Branch `main`; HEAD `254ce1299bff227c54809bb7027f9b587d69c143`.
- Worktree was dirty before edits. Phase 1 application-code changes are in `lib/tools/engines/macro.v6.ts`, its adjacent test, and the directly integrated Macro pilot `components/tools/macro-pilot.tsx` plus its test. The pilot already existed as untracked worktree content; this follow-up amended that same file and did not touch the generic template. Audit updates are in this report, `docs/GENIUS_TOOL_STANDARD_V3.md`, `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md`, `SMARTTOOLS_252_MASTER_INVENTORY.md`, and `docs/SMARTTOOLS_252_REGISTRY_IDENTITY_RECONCILIATION_AUDIT.md`. No staging/commit/reset/stash/cleanup was performed.
- The SPEC names `lib/engines/macro.v6.ts` and `lib/engines/macro.v6.test.ts`, but those paths are absent. The actual files inspected/updated are `lib/tools/engines/macro.v6.ts` and `lib/tools/engines/macro.v6.test.ts`. No file was moved or renamed.
- Inspected references: `lib/tools/engines/bodyfat.v6.ts`, `lib/engines/core/v6/future/ml-models.ts`, and `lib/engines/core/v6/future/vision.ts`; these files were not changed.

### SmartTools route integration — canonical route verified

- `app/smarttools/nutrition/macro/page.tsx` now renders `MacroPilotTool` at the existing `mrx.tool.macro` catalog href `/smarttools/nutrition/macro` (`lib/tools/smartToolsCatalog.ts:41`). The tool ID, slug, catalog href, and route were preserved. The prior page's body-fat carry-forward widget was not retained because it only displayed “linked data applied” and did not feed Macro v6; the validated explicit opt-in adapter remains a separate integration contract.
- The established `/macro` redirect in `next.config.ts:16-19` remains unchanged and still leads to legacy Tool 013. The catalog's canonical Macro SmartTool route is now the v6 route.
- After the production build, a local Next server returned HTTP 200 for `/smarttools/nutrition/macro`; its HTML contained `Macro Calculator v6` and contained no local `Language` or `Display units` selectors. No deployed route was accessed.
- The route component test checks that the canonical page mounts the pilot and responds to global language/unit preferences. It passed as part of the 124-test focused batch.

### Reference modules outside the edit scope

- `bodyfat.v6.ts` implements US Navy circumference formulas and FFMI/BMR/TDEE calculations (`:171-186,207-234`), but currently uses `performance.now()` and `logAudit` inside `calculate` (`:208,299-310`), defaults omitted age to 25 (`:257`), and clamps calculated body-fat percentage to 0–50 (`:227`). Validation contains `any` casts and string-to-error conversion (`:187-205`); alternative formula outputs and confidence values are hard-coded (`:480-581`). These are findings only; Body Fat was not modified.
- `future/ml-models.ts` contains stub inference and random probability/sequence output (`:251-269,296-334,406-435,489-493`); registered model performance values appear as static metadata (`:638-803`). No evidence here establishes trained model weights or calibrated inference.
- `future/vision.ts` can attempt browser MediaPipe loading (`:65-113`) but falls back to stubs (`:135-165`); jump, bar-path, and pose values use `Math.random()` (`:269-370`). The module must not be treated as reliable vision inference where the stub path can run.

## Implemented changes in Macro v6

1. Validation runs before calculation and checks finite numeric values, supported ranges, sex/phase/unit enums, optional body-fat/lean-mass inputs, target weight positivity/logical consistency, and positive finite BMR. Invalid computations throw instead of returning numeric fallbacks.
2. Formula is aligned to SPEC v3: Mifflin–St Jeor BMR, `TDEE = BMR × activity`, cut `0.85`, bulk `1.15`, maintenance `1.0`; protein `2.2 g/kg`, fat `0.9 g/kg`, and carbohydrate from remaining calories using 4/4/9 kcal per gram.
3. `recomp` is rejected because SPEC v3 has no approved recomposition equation. The previous `0.95` assumption is not silently preserved as an available calculation.
4. Output assumptions now say recomposition is unsupported because no approved equation exists; they no longer imply the rejected 5% reduction is still used.
5. `calculateMacrosV6` supports `empty`, `partial`, and `full` completeness states. Empty/partial responses list missing required fields and contain no calculated values, What-If scenarios, or Golden Rule results. Recalculation can move an incomplete response to full after all required inputs are supplied. Supplied invalid fields are rejected even when other required fields remain missing.
6. Calculated values are checked for finiteness and infeasible negative carbohydrate allocation is rejected. Assumptions are returned with the output.
7. Weight change, adherence, meal timing, statistical confidence, and runtime/freshness timestamps are not fabricated. Unavailable output fields are null/empty. What-If scenarios use `resultType: CALCULATED`, compare maintenance/cut/bulk, support bounded weight and TDEE/activity changes, and reject unsupported input keys/non-finite values.
8. Sensitivity is deterministic finite difference over weight, height, age, and activity for BMR/TDEE/target calories/protein. Top factors are ranked by absolute local elasticity; `Top3ReasoningV6.localElasticity` carries the numeric local elasticity into the UI, while `contribution` and statistical `confidence` remain null. Text explicitly states this is not causal. `MACRO_MATH_ENGINE` now uses the local `MacroSensitivityReportV6` contract without a confidence field, so it no longer inserts `confidence: 1` to satisfy the shared interface. The shared `MathEngine` contract remains unchanged and still types sensitivity confidence as numeric for other engines.
9. Seven Golden Rule entries are emitted from input/output consistency checks. These are arithmetic checks, not an independent safety or medical review.
10. The core output now carries `resultType: 'CALCULATED'`, and the Macro pilot displays this type in English and Arabic beside the base result. The marker is explicitly non-predictive; What-If outputs retain the same classification.

## Equations, assumptions, and known equation limits

| Item | Current rule |
|---|---|
| Mifflin–St Jeor estimate (API field `bmr`) | Male: `10W + 6.25H − 5A + 5`; female: `10W + 6.25H − 5A − 161`. The original paper describes this as resting energy expenditure (REE), a predictive estimate rather than a direct measurement. |
| Input bounds | Age 19–100 years; height 100–250 cm; weight 30–300 kg; activity factor 1.2–1.9. Ages 19–78 match the original derivation sample; ages 79–100 are accepted with an explicit extrapolation warning. |
| TDEE | Rounded BMR multiplied by user-provided activity factor, rounded to integer kcal/day |
| Phase target | Bulk +15%; cut −15%; maintenance unchanged |
| Protein / fat | `round(weightKg × 2.2)` g / `round(weightKg × 0.9)` g |
| Carbohydrate | Rounded residual calories divided by 4 after protein and fat calories |
| Recomposition | Unsupported; validation rejects `recomp` pending a defined/approved equation |

The original Mifflin–St Jeor study derived its equation from 498 healthy adults aged 19–78 and measured REE using indirect calorimetry; it reported R²=0.71. Macro v6 rejects ages below 19 and accepts ages 19–100; ages 79–100 produce an explicit extrapolation warning. The warning does not imply the result is valid or clinically validated. See [the original study record on PubMed](https://pubmed.ncbi.nlm.nih.gov/2305711/). The study does not validate this tool's activity factors, phase multipliers, protein/fat ratios, or carbohydrate distribution; those remain project SPEC assumptions.

The engine uses rounded REE/BMR, TDEE, and macro grams, then derives macro percentages from the rounded values. Consequently, displayed rounded percentages may not sum to exactly 100. The macro v1 engine remains outside scope and still has its own +10% bulk and legacy recomp behavior; no shared legacy formula was changed here.

## Capability and limitation audit

| Capability | Status | Evidence / limitation |
|---|---|---|
| Deterministic core math | PARTIAL | Core equations are deterministic, but `calculateMacrosV6` is async and can optionally merge linked body-fat input (`lib/tools/engines/macro.v6.ts:675-705`). |
| Required input validation | PARTIAL | Main fields and supplied optional `targetBodyFatPct`, `leanMassKg`, and `dietPreference` now have validation; the optional fields are not used by the equations. |
| Units | PARTIAL | Core fields remain canonical kg/cm; engine conversion helpers preserve those values. Macro pilot now converts metric/imperial weight and height only at the UI boundary, formats What-If ranges in the selected display units, and has round-trip/no-double-conversion coverage. Formula calculations remain canonical metric; other output quantities (including protein/fat assumptions per kg) remain metric. |
| Macro distribution display | PARTIAL | Pilot shows grams, macro calories, rounded calorie percentages, summed macro energy, and the difference from target in an accessible bilingual text list, plus a note that independently rounded percentages may not total 100%. It does not render a chart. |
| Empty / partial / full | PARTIAL (engine COMPLETE) | The engine returns EMPTY/PARTIAL without calculation and names missing required fields. Macro pilot now starts with no numeric defaults, exposes all six required inputs, and displays missing fields until complete. It renders the complete output after validation. UI state remains a small single-screen integration, not a generalized dynamic-form framework. |
| What-If | PARTIAL | Supports bounded numeric changes and TDEE through implied activity-factor changes (`lib/tools/engines/macro.v6.ts`); direct engine calls enforce the UI bounds. Scenario values are named `calculatedOutput`, categorical phase/goal changes are explicit in `inputChanges`, and no prediction/timeframe/difficulty claim is emitted. TDEE is rounded, so not every requested integer necessarily round-trips exactly. |
| Sensitivity | PARTIAL | Local finite differences cover four inputs and four outputs. At upper bounds the engine uses a backward difference; interior/lower values use a forward difference. Activity uses a 0.05 factor step, matching its UI slider and reducing integer-TDEE rounding noise. It is a local arithmetic response, not statistical analysis or causal attribution. Macro v6 uses `MacroSensitivityReportV6` without confidence; the unrelated shared MathEngine contract remains unchanged. |
| Reasoning | PARTIAL | Four arithmetic steps with formula identifiers; not AI reasoning. Alternative formula paths are empty rather than fabricated. |
| Safety | PARTIAL | Emits only an arithmetic warning when cut target is below estimated BMR; this is expressly not a safety judgment. No clinical threshold or dietary recommendation is provided. |
| Cross-tool | PARTIAL | Only explicit inbound Body Fat data is implemented. The adapter validates source identity, required kg units, timestamp, normalized confidence, and finite supported measurements. It imports weight only when the user has not supplied one; current body-fat percentage is not mislabeled as a target and current formulas do not use body-fat or lean-mass values. No outbound data flow is implemented, so `crossToolLinks` is empty. No automatic lookup or storage occurs. |
| User context / history | MISSING | Macro engine accepts `userContext`, but the inspected computation does not use user ID, history, or preferences. No persistence was added. |
| Sources/evidence | PARTIAL | The original Mifflin–St Jeor paper is linked in the pilot, and age extrapolation beyond its 19–78 derivation sample is warned. Project activity factors, phase multipliers, protein/fat assumptions, and derived macro allocation remain SPEC assumptions without independent population calibration or clinical validation. |
| Result classification | COMPLETE | `MacroOutputV6.resultType` is the literal `CALCULATED`; the UI renders localized English/Arabic wording next to the base result. Engine and DOM tests verify the classification. This labels deterministic equation output only; it does not mean the result is a prediction. |
| Registered SmartTools integration | COMPLETE for canonical route | The existing catalog route `/smarttools/nutrition/macro` now mounts the V6 pilot; the catalog identity and category-first URL are preserved. This does not certify all Macro aliases, every preference state, or deployment. |

## Macro pilot UI integration follow-up — 2026-10-25

- Source audit found that the previous pilot exposed only age, weight, and height while silently supplying sex, height/weight defaults, activity factor, and maintenance phase (`components/tools/macro-pilot.tsx` at the prior checkpoint). This obscured required assumptions from users.
- Updated only the Macro pilot component and its dedicated test: it starts with an empty `Partial<MacroInputV6>`, presents all six required values (age, sex, height, weight, activity factor, phase), runs the engine as fields change, surfaces missing fields without a result, and only renders the full output after engine validation. It also displays the source assumptions, calculated phase/weight comparison scenarios, local sensitivity explanations, the existing warning, and a bounded weight What-If slider.
- The pilot interface now has English/Arabic labels, RTL direction, localized numeric sensitivity lines using structured `localElasticity`, and a metric/imperial selector. The boundary converts displayed lb/in to canonical kg/cm and converts the bounded What-If slider and ±10kg scenario labels to display units; changing display systems alone leaves the canonical result unchanged. The generic template's `idle/partial/ready/error` status text, `CALCULATED` scenario markers, and unknown future warning messages remain English.
- The generic `GeniusToolTemplate` was not modified or rolled out to other tools. This change does not resolve the separate template rollout gate.
- A follow-up adds a bilingual macro-distribution list showing grams, macro calories, and rounded percentages, with a note that independently rounded shares may not total exactly 100%. It is a textual accessible alternative, not a chart, and changes no calculation equation.
- The same list now shows summed macro calories, the target, and the signed arithmetic difference so users can see gram-rounding effects; this is display-only and uses the existing calculated output.
- Focused command after the cross-tool validation and energy-balance display follow-ups: `npx vitest run lib/tools/adapters/bodyfat-to-macro.test.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx` — PASS, 3 files / 85 tests. Coverage includes linked-source/unit/timestamp/confidence/value validation, user-input precedence, no speculative outbound links, UI no-default flow, distribution shares/energy difference/rounding notice, metric/imperial round-trip, canonical What-If result, Arabic RTL, sensitivity localization, and invalid input rejection.
- `npx tsc --noEmit` — PASS, exit 0. Scoped ESLint for the Macro engine, adapter, their tests, and pilot UI/tests — PASS, exit 0. `npm run validate-tools` — PASS, 1 file / 5 tests. Latest Macro engine V8 coverage: 66 engine tests, 95.58% statements, 96.27% lines, 91.89% functions, 89.75% branches. Current `npm run build` passed on Next.js 15.5.23 with type checking and static generation 385/385 (exit 0); stale Browserslist and missing `metadataBase` warnings remain.
- UI limits remain: generic template status tokens and `CALCULATED` markers are English; user history, personalization, persistence, and cross-tool imports remain absent. Browser keyboard/focus/screen-reader review was not performed.

## Test and quality results

The final focused Macro test command after scoped changes:

| Exact command | Result |
|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts` | PASS — 66 tests in 1 file |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | PASS — 66 tests; 95.58% statements, 96.27% lines, 91.89% functions, 89.75% branches |
| `npx tsc --noEmit` | PASS — exit 0, no output after final engine edits |
| `npx eslint lib/tools/engines/macro.v6.ts --no-warn-ignored` | PASS — exit 0, no output. ESLint ignores the `.test.ts` file under repository configuration. |
| `npm run validate-tools` | PASS — 5/5 tests, exit 0 |
| `npm run lint` | PASS with warnings on the most recent full-project run before the Macro cross-tool validation edit: exit 0, 0 errors, 742 warnings. After the cross-tool edit, scoped ESLint for the adapter, engine, tests and pilot passed with exit 0 and no output; full-project lint was not rerun afterward. |
| `git diff --check` | FAIL — exit 2 due to trailing whitespace at `app/smarttools/page.tsx:57` in a pre-existing modified file outside this task. Untracked files are not covered by this command. No cleanup was made. |
| `npx vitest run` | FAIL — latest run after the Macro scenario-wording change: 7 failed files, 379 passed, 1 skipped; 16 failed tests, 4222 passed, 5 skipped (4243 total). Failures are outside Macro in checkout-country routing, Kashier delegation, checkout-session service, payment-receipt admin, order-producer status contract, merchant resolution, and InstaPay lock tests. The run reports missing Fourthwall digital product mappings plus gateway mock and receipt/status contract failures. Macro focused tests pass separately at 85/85. |
| `npm run build` | PASS — latest production build exited 0; Next.js 15.5.23 compiled, type-check passed, and static generation completed 385/385. Existing warnings: stale Browserslist data and missing `metadataBase`. Build logging that a Supabase URL is configured does not verify live connectivity. |

Coverage statements, lines, and branches exceed 80%. The test run emits a mixed-version warning: Vitest `4.1.10` with `@vitest/coverage-v8@4.0.18`; no dependency changes were made to address it.

The latest full-suite run recorded 16 failures outside the Macro v6 engine/pilot tests. All remaining failures are in checkout/payment fixtures, payment contracts, or payment administration tests. Stale SmartTools count, Tool 111 route, three redirect-page tests, invalid Tool 111 input expectations, and valid activity/zero-load engine test cases now match the checked-out behavior and pass. The full run had 4222 passing and 5 skipped tests; the 85 focused Macro adapter/engine/pilot tests passed separately. Do not interpret focused suites as a clean repository test gate.

## Supabase and side effects

- Local Supabase schema, migrations/archive, client, and adapters exist. No Supabase CLI, live database query, write, migration, or RLS verification was run.
- The build may log that a Supabase URL is configured; that does not establish live reachability or policy correctness.
- No commit, push, or deployment was performed.
- Latest Git snapshot (2026-10-25 continuation): branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 32 tracked dirty paths and 429 untracked paths, no staged changes. `git diff --stat` reports 32 tracked files, 494 insertions and 1568 deletions and excludes untracked files; most worktree changes predate this continuation. The latest `git status --short` count is 461 rows. No Git mutation was performed.

## Remaining blockers and owner decisions

1. Resolve or formally accept the 16 project-wide test failures in their own scoped work. The latest run attributes them to checkout/payment fixtures, payment contracts, and payment administration; they are outside this engine's scope.
2. The shared `MathEngine` still defines numeric confidence for generic sensitivity reports. Macro v6 no longer uses that report contract or fabricates confidence; review a shared contract migration separately before other engines adopt confidence-free sensitivity reports.
3. Keep the internal/display boundary: kg/cm remain canonical in the engine; imperial conversions are display/input-boundary transformations in the pilot, not changes to calculation equations.
4. Confirm whether optional recomp is intentionally unsupported, or approve a specific evidenced equation before reintroducing it.
5. Assess branch coverage if the 80% target applies to branch coverage rather than line/statement coverage.
6. Complete the outstanding Phase 0 review of all unit-conversion consumers, live/deployed Supabase schema/RLS, browser accessibility and SEO behavior, and future ML/Vision modules' production import paths/consumers.

**Phase gate:** `NOT READY`; no template, rollout, additional tool implementation, migration, commit, push, or deployment follows from this report.

## Current-state verification refresh — 2026-10-25

This section supersedes older test totals and the earlier route-table row in this report. It records commands rerun against the current checkout.

| Exact command / observation | Current result |
|---|---|
| `npx vitest run lib/tools/adapters/bodyfat-to-macro.test.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx` | PASS, 3 files / 88 tests, exit 0. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | PASS, 68 engine tests; statements 95.21%, branches 87.85%, functions 92.10%, lines 96.26%, exit 0. Tooling warns Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mixed versions and unsupported together; retain that measurement limitation. |
| `npx tsc --noEmit` | PASS, exit 0, no output. |
| `npm run validate-tools` | PASS, 1 file / 5 tests, exit 0. |
| Scoped ESLint for Macro engine, adapter, and their UI | PASS, exit 0, 0 errors; 3 test files were ignored by repository ESLint patterns (three warnings). |
| `npm run lint` | PASS, exit 0; 647 warnings, 0 errors. |
| `npx vitest run` | FAIL, exit 1; 410 files: 402 passed, 7 failed, 1 skipped; 4,278 tests passed, 16 failed, 5 skipped (4,299 total). Failures remain in payment/checkout suites: `checkoutCountryRouting` (8), `createInvoiceKashierDelegation` (1), `checkoutSessionService` (1), `instapayPreservationLock` (1), `merchantResolver` (1), `orderProducersStatusContract` (1), and `paymentReceiptsAdmin` (3). Logs show missing Fourthwall digital product mapping, absent mocked `resolveProductMapping`, and receipt/order settlement contract mismatches. These are outside Macro v6 files; this run does not establish they predated every unrelated local change. |

Current verification also re-ran `npm run build`: **PASS**, exit 0, Next.js 15.5.23 generated 385/385 static pages. Existing warnings remain for stale Browserslist data and missing `metadataBase`; build output saying Supabase is configured does not verify connectivity. The local built route `http://localhost:3004/smarttools/nutrition/macro` returned HTTP 200 and contained `Macro Calculator v6`; the app-paths manifest contains `/smarttools/nutrition/macro/page`. Macro browser accessibility review remains NOT RUN. Current Git snapshot: branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 659 status rows (189 tracked dirty, 470 untracked), 0 staged. `git diff --check` returned exit 0. No database operation, migration, commit, push, or deployment was performed. The current gate remains **NOT READY** because the full test suite fails and Stage 0 audits remain incomplete.

## Owner-directed audit/remediation checkpoint — current checkout, 2026-10-25

This entry supersedes previous full-suite totals in this report for this checkout. Scope follows the owner's explicit decision: Phase 0 review/remediation and Macro v6 verification only. No new tool batch, shared template, database/schema change, migration, commit, push, or deployment was started.

### Current Git and implementation paths

- Branch `main`; HEAD `254ce1299bff227c54809bb7027f9b587d69c143`; `git status --short` returned **686 rows**, and `git diff --cached --name-only` returned **0 paths**. The numerous pre-existing modified and untracked files were left untouched. `git diff --check` exited **0**.
- The actual Macro engine and test files are `lib/tools/engines/macro.v6.ts` and `lib/tools/engines/macro.v6.test.ts`; SPEC's `lib/engines/macro.v6.ts` paths do not exist. Current engine/test files and the Macro pilot files are untracked/locally present, not tracked diffs against HEAD. No clean worktree/baseline execution was made.
- `package.json` exposes `lint`, `test`, `test:unit`, `test:perf`, `validate-tools`, and `build`; it has no coverage script. `vitest.config.ts` has no coverage threshold/block. Coverage was measured using the explicit CLI command below.

### Current exact verification

| Command | Result | Evidence / limitation |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts lib/tools/engines/bodyfat.v6.test.ts components/tools/macro-pilot.test.tsx` | `PASS`, exit 0 | 3 files / 126 tests. |
| `npx vitest run lib/tools/adapters/bodyfat-to-macro.test.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx app/smarttools/nutrition/macro/page.test.tsx` | `PASS`, exit 0 | 4 files / 92 tests; completed after the full run. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | `PASS`, exit 0 | 70 tests; statements 94.91%, branches 87.61%, functions 93.33%, lines 95.90%. The installed Vitest `4.1.10` and `@vitest/coverage-v8` `4.0.18` mismatch emitted a warning that mixed versions are unsupported; treat coverage as provisional until versions are aligned. |
| `npx tsc --noEmit` | `PASS`, exit 0 | No output. |
| `npm run lint` | `PASS`, exit 0 | 0 errors, 631 warnings. Existing repository-wide warnings were not auto-fixed. |
| `npm run validate-tools` | `PASS`, exit 0 | 1 file / 5 tests. |
| `npm run build` | `PASS`, exit 0 | Next.js 15.5.23; compiled successfully, checked types, generated **387/387** pages. Warnings include missing `metadataBase` and configured Supabase URL log; neither proves live Supabase connectivity. |
| `npx vitest run --reporter=json --outputFile=$auditFile` | `FAIL`, exit 1 | JSON captured outside the repository at `%TEMP%\macro-v6-full-suite-current.json`; 416 test result files, 16 failed tests, 4,316 passed, 5 skipped (4,337 total). Seven failing test files are enumerated below. |
| `npx vitest run` restricted to the seven payment failure files, JSON output | `FAIL`, exit 1 | 90 passed / 16 failed / 0 skipped; repeats the current payment failures and records per-test evidence at `%TEMP%\macro-v6-current-failures.json`. |
| `npx vitest run components/tools/tool-140-dosage-unit-conversion-engine.test.tsx` | `PASS`, exit 0 | 1 file / 2 tests. A single timeout for this file appeared under the parallel full-suite run but was not reproduced in isolation. |
| `git diff --check` | `PASS`, exit 0 | Git emitted CRLF-to-LF normalization warnings for dirty worktree files; no whitespace error. |

The full-suite's 16 current failures are confined to seven unchanged tracked payment/checkout files: eight HTTP-500 expectations in `tests/integration/checkoutCountryRouting.test.ts`; one HTTP-500 in `tests/integration/createInvoiceKashierDelegation.test.ts`; one `fourthwallGateway.resolveProductMapping is not a function` in `tests/unit/checkoutSessionService.test.ts`; one obsolete source-string assertion in `tests/unit/instapayPreservationLock.test.ts`; one exactly-three-products expectation where current canonical data has five in `tests/unit/merchantResolver.test.ts`; one obsolete source-string assertion in `tests/unit/orderProducersStatusContract.test.ts`; and three legacy receipt status/view/RPC fixture mismatches in `tests/unit/paymentReceiptsAdmin.test.ts`. All seven failing test files and implicated tracked payment implementation files were clean relative to HEAD (`git status --short -- <paths>` empty and `git diff --quiet HEAD -- <paths>` exit 0). This demonstrates failures against current committed source and that they are not caused by the current untracked Macro files; no isolated clean worktree run establishes when they entered history. Root-cause details and impact/next action are in the preceding “Full-suite failure provenance” section.

One intermittent timeout was observed for the Tool 140 UI test in the first full run with 18 failures; it passed 2/2 on isolated rerun and did not fail in the subsequent JSON full-suite run. This is recorded as a load-sensitive test limitation, not a stable functional failure.

### Macro behavior review and outstanding gaps

- Source review confirms deterministic Mifflin–St Jeor, TDEE, phase multipliers and macro split; validation bounds/range/enums and non-finite protection; explicit rejection of negative-carbohydrate infeasibility; and no time/network/React/Supabase dependency in the pure `MACRO_MATH_ENGINE.calculate` path. Focused tests and coverage support the arithmetic contract; the full repository gate still fails.
- `calculateMacrosV6` remains async because the explicit optional Body Fat link is validated through a dynamic import; it does not fetch data automatically. Core engine inputs/outputs use canonical kg/cm, and conversion helpers are intentional no-ops; the pilot handles display conversion. Optional target body-fat, lean-mass and diet-preference fields are validated but do not alter formulas. Recomposition remains rejected pending an approved formula.
- The user's updated architecture description confirms Registry order, related-tool links, book/guide integration and the assistant are currently navigation/recommendation context; it does **not** establish a cross-tool data/decision graph. Macro only accepts a user-supplied validated Body Fat payload; it does not autonomously discover sibling outputs or persist shared context. A shared context/exchange layer is a future architecture gap and is outside this authorization.
- Phase 0 is not fully closed: manual browser keyboard/screen-reader/contrast/mobile accessibility is `NOT RUN`; live Supabase schema/RLS/profile round-trip is `NOT VERIFIED` and repository SQL has a documented `profiles.unit_system` contract gap; full clean-baseline test provenance was not run; and remaining repository-wide platform audit gaps recorded in the baseline report require review. No Supabase operation was performed. `Get-Command supabase` returned no CLI command, and no live query was attempted.

**Current exit decision: `NOT READY`.** Macro-focused checks pass, but the full Vitest suite has 16 reproduced out-of-scope payment failures, coverage tooling versions mismatch, and material Phase 0 checks remain unverified. No source changes were made in this checkpoint. Stop here for owner review; no scope expansion is implied.

## Result classification update — 2026-10-25

- Added the literal `resultType: 'CALCULATED'` to `MacroOutputV6` and populated it only on computed complete outputs; incomplete EMPTY/PARTIAL responses still have no result object.
- The Macro pilot displays a bilingual classification label beside the primary result: “Result type: CALCULATED” / “نوع النتيجة: محسوبة حتميًا (CALCULATED)”. Existing explanation continues to state that this is not a prediction or medical assessment.
- Added English and Arabic UI assertions. Post-change verification: focused adapter/engine/pilot suite PASS, 3 files / 85 tests; `npx tsc --noEmit` PASS (exit 0); `npm run validate-tools` PASS (5/5); scoped ESLint PASS (exit 0); `npm run build` PASS (exit 0), Next.js 15.5.23, 385/385 generated pages. The full project suite was last run immediately before this additive type/UI change: 7 files failed, 379 passed, 1 skipped; 16 failed tests, 4222 passed, 5 skipped (4243 total), all in checkout/payment tests. It was not rerun after this additive change.
- No shared template, other tool, registry, database, or migration was modified. Gate remains **NOT READY**.

## Verification refresh — 2026-10-25

- Re-run on the current checkout: focused Macro adapter/engine/pilot command — **PASS**, exit 0, 3 files / 85 tests; `npx tsc --noEmit` — **PASS**, exit 0; `npm run validate-tools` — **PASS**, exit 0, 5 tests; scoped ESLint for the engine, adapter, tests and pilot — **PASS**, exit 0 with no output.
- A subsequent Macro-only copy change replaced the cut scenario's outcome claim (“for fat loss”) with a neutral arithmetic-only description and added a regression assertion. The focused suite, TypeScript, validation, and scoped ESLint were rerun after that change and passed. `npm run build` also passed afterward, generating 385/385 pages. The full Vitest suite was then rerun (exit 1, 74.67s): 7 files failed, 379 passed, 1 skipped; 16 tests failed, 4222 passed, 5 skipped (4243 total). All failures are in payment/checkout code, outside Macro's scope.
- Current gate remains **NOT READY**. Outstanding full-suite failures and Phase 0 reviews continue to prevent phase advancement.

## Historical local route and header smoke test — 2026-10-25 (before Macro v6 route integration)

- At the time of this earlier browser pass, the V6 pilot was not mounted on the Macro SmartTools route. This observation is superseded by the current route evidence below; the `/macro` alias still points to legacy Tool 013.
- The header language control changed the route to the Arabic prefix and updated document `lang`/`dir` to `ar`/`rtl`. The measurement toggle changed `measurementSystem` and `mrx_unit_system` from metric to imperial in an isolated temporary browser profile. This did not test live persistence, user accounts, profile synchronization, or V6 form conversions because the V6 pilot was not mounted.
- The English header initially displayed the literal `MACHINE TRANSLATION UNAVAILABLE`; it was absent after selecting Arabic. The Tool 013 desktop DOM had no `<main>` or `<h1>` element. This is a smoke test, not a WCAG audit; screen-reader, keyboard-only, contrast, mobile, authenticated/guest, and deployed-domain checks remain NOT RUN.
- No production database or user profile was accessed in that earlier pass. The stale route observation is retained as history, not as the current route status.

## What-If TDEE rounded-boundary regression — 2026-10-25

- Reproduced a boundary defect using a valid input whose rounded BMR is 1841 kcal/day. The TDEE slider's displayed lower endpoint is `round(1841 × 1.2) = 2209`, but converting 2209 back to an activity multiplier yields a value slightly below 1.2. The upper endpoint has the corresponding over-1.9 rounding case. Both valid displayed endpoints were rejected by the engine's approved activity-factor validation.
- Updated only `lib/tools/engines/macro.v6.ts` and its adjacent test. TDEE What-If now clamps the implied activity factor to the validated `[1.2, 1.9]` range; normal in-range requested TDEE values continue to be represented by the implied factor and rounded TDEE equation. Added a regression test covering both slider endpoints for the fractional-BMR case.
- Regression proof: before the engine fix, `npx vitest run lib/tools/engines/macro.v6.test.ts -t "rounded TDEE slider endpoints"` failed with `RangeError: activityLevel must be between 1.2 and 1.9`; after the fix, the full Macro engine file passed **69/69**.
- Focused verification: adapter + engine + pilot tests **89/89 PASS**; `npx tsc --noEmit` **PASS**; `npm run validate-tools` **5/5 PASS**; scoped ESLint for engine, adapter, and pilot plus their tests **PASS**. Engine-only coverage passed with **69 tests**, statements **95.21%**, branches **87.85%**, functions **92.10%**, lines **96.26%**. The coverage run warns that Vitest 4.1.10 and coverage-v8 4.0.18 are mixed/unsupported versions; this was not changed.
- Current project-wide verification after the fix: `npx vitest run` **FAIL**, exit 1; **410 files**: 402 passed, 7 failed, 1 skipped; **4,279 passed, 16 failed, 5 skipped** (4,300 total). Failures remain in checkout/payment tests; these are outside Macro files and this run does not establish they predate every unrelated worktree change. `npm run build` **PASS**, exit 0; Next.js 15.5.23 generated **385/385** pages. Existing stale Browserslist and missing `metadataBase` warnings remain.
- No formula, tool identity, route, dashboard, Supabase file/data, migration, or other tool was changed. No stage, commit, push, or deployment occurred. Macro v6 meets its scoped engine checks, but the Phase 2 gate remains **NOT READY** due to the project-wide failures and outstanding Phase 0 review gates.

## Infeasible comparison scenario handling — 2026-10-25

- A second edge case showed that a valid maintenance calculation could be discarded when its optional cut comparison produced negative residual carbohydrates. Reproduction used allowed inputs: age 20, male, 250 cm, 300 kg, activity 1.2, maintenance. The base result was feasible, but `generateWhatIfScenarios` threw while calculating the cut alternative.
- Scenario results now use a discriminated outcome: feasible alternatives remain `CALCULATED` with their output; only the known infeasible non-negative-macro-distribution condition becomes `NOT_AVAILABLE` with a reason code and explanation. Other unexpected calculation/validation errors continue to throw. The base calculation and other feasible scenarios remain available. The Macro pilot displays a localized reason in English and Arabic; it does not render a fabricated output for the unavailable scenario.
- Added engine coverage proving the base result and bulk scenario remain available while cut is `NOT_AVAILABLE`, plus a UI integration check confirming the explanation is shown without suppressing the main result.
- The same UI case switches the global language preference to Arabic and asserts that the unavailable reason is localized; the focused case passed **1/1** after adding this assertion.
- Verification after this change: focused Macro adapter/engine/pilot command **PASS**, 3 files / **91 tests**; `npx tsc --noEmit` **PASS**; `npm run validate-tools` **PASS**, 5/5; scoped ESLint **PASS**. Engine-only coverage: **70 tests**, statements **94.91%**, branches **87.61%**, functions **93.33%**, lines **95.90%**. The mixed-version Vitest/coverage-v8 warning persists.
- Full `npx vitest run`: **FAIL**, exit 1; 410 files (402 passed, 7 failed, 1 skipped), **4,281 passed, 16 failed, 5 skipped** (4,302 total). The same checkout/payment suites fail; logs include missing Fourthwall digital product mappings, missing test mock `resolveProductMapping`, and stale payment-receipt status assertions. Failures are outside the Macro files, but this run cannot establish that they predate every unrelated worktree change. `npm run build`: **PASS**, exit 0; Next.js 15.5.23 generated **385/385** pages with the existing stale Browserslist and missing `metadataBase` warnings.
- No formula, non-Macro tool, database, migration, route, identity, staging, commit, push, or deployment was changed. The phase gate remains **NOT READY** pending the project-wide failures and outstanding Phase 0 reviews.

## Prompt-aligned verification refresh — 2026-10-25

This section supersedes earlier test totals where they differ. No Macro or application source was changed in this refresh; only the evidence reports were updated.

- `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/tool-111-smart-food-macro-substitution.test.ts components/tools/tool-111-smart-food-macro-substitution.dom.test.tsx components/tools/tool-111-smart-food-macro-substitution.integration.test.tsx`: **PASS**, 5 files / 132 tests.
- `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text`: **PASS**, 70 tests; statements 94.91%, branches 87.61%, functions 93.33%, lines 95.90%. Coverage tooling warns that Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mismatched and unsupported together; the measured coverage is reported with that limitation.
- `npx tsc --noEmit`: **PASS**, exit 0. `npm run validate-tools`: **PASS**, 1 file / 5 tests. `npm run lint`: **PASS**, exit 0, 0 errors / 631 warnings.
- Latest `npx vitest run`: **FAIL**, exit 1; 413 files: 405 passed, 7 failed, 1 skipped; 4,298 tests passed, 16 failed, 5 skipped (4,319 total). Failures remain in the seven checkout/payment suites listed in the baseline report. This run is against the dirty worktree and does not establish that they predated every local change.
- Latest source-changing production build remains the successful Tool 074 verification: `npm run build` **PASS**, Next.js 15.5.23 generated 385/385 pages. Only report files changed afterward. Existing Browserslist and missing `metadataBase` warnings remain.
- Phase 0 remains incomplete: all 252 tools have not received a complete code/evidence audit, browser/accessibility review is `NOT RUN`, and live Supabase state is `NOT RUN`. Current gate remains **NOT READY**; no template or tool rollout is authorized by this report.

## Current Macro route verification — 2026-10-25

- Current source `app/smarttools/nutrition/macro/page.tsx` renders `MacroPilotTool`; `app/smarttools/nutrition/macro/page.test.tsx` verifies the registered page mounts the V6 pilot and follows global language/unit preferences.
- `npx vitest run app/smarttools/nutrition/macro/page.test.tsx components/tools/macro-pilot.test.tsx` — **PASS**, 2 files / 11 tests, exit 0.
- Local HTTP smoke check against the built server on port 3100: `GET /smarttools/nutrition/macro` returned **200** and contained “Macro Calculator v6”. `GET /macro` returned **200** but did not contain the V6 title; that legacy alias continues to resolve to Tool 013. Do not use `/macro` as the V6 preview link.
- This confirms route rendering only. Manual keyboard/screen-reader/contrast/mobile review, authenticated/guest behavior, and deployed-domain behavior remain `NOT RUN`; the overall gate remains **NOT READY**.

## Latest verification refresh — 2026-10-25 — authoritative current run

This section supersedes earlier Macro and project-wide test totals in this report.

| Exact command / check | Result |
|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, 4 files / 92 tests, exit 0. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, 70 tests; statements 94.91%, branches 87.61%, functions 93.33%, lines 95.90%, exit 0. Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mismatched; the tool warns that mixed versions are unsupported. No dependency was changed. |
| `npx tsc --noEmit` | **PASS**, exit 0, no output. |
| `npm run validate-tools` | **PASS**, 1 file / 5 tests, exit 0. |
| Scoped ESLint on the Macro v6 engine, pilot, adapter, route and related test files with `--no-warn-ignored` | **PASS**, exit 0, no output. |
| `npx vitest run` | **FAIL**, exit 1; 413 files: 405 passed, 7 failed, 1 skipped; 4,298 tests passed, 16 failed, 5 skipped (4,319 total). Failed files: `checkoutCountryRouting` (8), `createInvoiceKashierDelegation` (1), `checkoutSessionService` (1), `instapayPreservationLock` (1), `merchantResolver` (1), `orderProducersStatusContract` (1), and `paymentReceiptsAdmin` (3). Observed causes include missing Fourthwall digital product mapping and payment/order receipt contract mismatches. This run is against a dirty worktree and does **not** establish clean-baseline provenance. |
| `npm run build` | **PASS**, exit 0; Next.js 15.5.23 compiled and generated **385/385 pages**. Existing warnings: missing `metadataBase` and stale Browserslist data. Build output saying Supabase is configured does not establish a live database connection. |
| `git diff --check`; `git diff --cached --quiet` | **PASS**, exit 0; no whitespace errors in tracked diffs and no staged changes. |

Current Git snapshot: branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 676 status rows, no staged changes. This verification refresh changed no application source. No Supabase query/write, migration, commit, push or deployment occurred. Phase 0 remains incomplete; decision remains **NOT READY FOR PHASE 2**.

## Reference-module verification refresh — 2026-10-25

Read-only findings for the three adjacent modules required by the V3 prompt:

- `lib/engines/core/v6/future/ml-models.ts` calls itself “ML Models Stubs” at line 4. Class prediction paths explicitly call stub inference (`:251-260,296-314,406-435,472-493`); several classification/sequence paths use `Math.random()`. The registry entries at `:638-803` contain static performance metadata. Repository search found no production imports of this module, no dedicated `ml-models.test.ts`, and `package.json` has no declared ONNX/TensorFlow runtime dependency. The declarations and metadata do not establish trained models, validated model performance, or live inference. **Assessment: NOT_VERIFIED as a production ML capability; implementation evidence indicates stub only.**
- `lib/engines/core/v6/future/vision.ts` dynamically attempts `@mediapipe/pose` loading from a CDN (`:66-113`), catches initialization failures, and falls back to stub results (`:112-165`). Equipment detection explicitly remains stubbed (`:287-332`); pose/jump/bar-path outputs include random synthetic values (`:269-372`). No MediaPipe/TensorFlow package is declared in `package.json`; repository search found no importing application module (the apparent import at `:443` is inside an example string), and no dedicated `vision.test.ts` exists. **Assessment: PARTIAL optional browser integration plus synthetic fallback; no verified app integration or reliable production vision output.**
- `lib/tools/engines/bodyfat.v6.ts` is the actual imported body-fat engine (`components/tools/bodyfat-pilot.tsx:5-6`) and has `lib/tools/engines/bodyfat.v6.test.ts`. The file header claims a pure module without `Date` at `:7-13`, but `calculateBodyFatV6` reads `performance.now()` at `:684,727` and `Date.now()` at `:731`; it also emits fixed confidence (`:710`) rather than a calibrated estimate. **Assessment: PARTIAL against the claimed purity/uncertainty contract; this remains outside Macro v6 repair scope.**

Exact checks:

| Command | Result |
|---|---|
| `rg -n 'future/ml-models|future/vision|bodyfat\\.v6' app components lib features` | Exit 0; matches are module self-description/example text, body-fat pilot import, tests, and inventory; no application imports for ML or Vision were found. |
| `rg -n 'mediapipe|tensorflow|onnxruntime' package.json` | No matches (no such runtime dependency declared). |
| `Test-Path lib/engines/core/v6/future/ml-models.test.ts; Test-Path lib/engines/core/v6/future/vision.test.ts; Test-Path lib/tools/engines/bodyfat.v6.test.ts` | `False; False; True`. |
| `npx vitest run lib/tools/engines/bodyfat.v6.test.ts` | **PASS**, 1 file / 46 tests, exit 0. |
| `npx eslint lib/tools/engines/bodyfat.v6.ts lib/engines/core/v6/future/ml-models.ts lib/engines/core/v6/future/vision.ts --no-warn-ignored` | Exit 0; 0 errors, 42 warnings (unused identifiers and explicit `any`); warnings are recorded, not suppressed. |

No adjacent module was modified. These findings do not expand the authorized Macro v6 implementation scope.

## Macro v6 acceptance mapping — current rerun

| Acceptance area | Current status | Evidence / boundary |
|---|---|---|
| Reference equations and assumptions | `PASS` | Source uses the specified sex-specific Mifflin-St Jeor equation, 1.2–1.9 activity multiplier, phase factors 0.85/1.00/1.15 and 2.2/0.9 g/kg macro assumptions. Rounding is explicitly documented; no equation coefficients were changed in this checkpoint. |
| Input validation and non-finite defense | `PASS` | Engine rejects missing required fields at calculation time, NaN/Infinity, out-of-range values, enum errors, inconsistent goal/phase and impossible negative-carbohydrate distributions; focused engine tests cover these classes. |
| `EMPTY` / `PARTIAL` / `FULL` | `PASS` | Engine and pilot tests verify missing-field reporting, no calculated output while incomplete, and transition to full after valid input. |
| Macro calorie consistency / seven Golden Rules | `PASS` with rounding tolerance | Checks include finite outputs, non-negative macros, assumptions, valid units and macro-energy consistency; tests cover passing and deliberately failing rule applications. |
| Determinism and purity | `PASS` for core math; `PARTIAL` for public orchestration | `MACRO_MATH_ENGINE.calculate` has no clock, I/O, React, DOM, storage, or network dependency. The public orchestration is async because it can optionally validate explicit cross-tool data. Runtime/freshness values remain unavailable rather than fabricated. |
| Unit dimensionality and double conversion | `PASS` for the currently supported fields | Engine fields are canonical kg/cm; pilot translates lb/in at the UI boundary and focused tests verify round trips and invariant canonical outputs. It does not convert macro gram outputs to imperial mass units. |
| What-If weight/TDEE/activity and phase comparisons | `PASS` within stated bounds | Engine tests cover ±10 kg bounds, bounded TDEE through implied activity, invalid keys/values, each phase, and unavailable infeasible scenarios. These are arithmetic scenarios, not predictions. |
| Food amount change of ±50 g | `NOT APPLICABLE` | Macro v6 has no food/ingredient quantity input; no food-specific scenario was invented. |
| Sensitivity and ranked factors | `PASS` as local finite-difference arithmetic | Tests cover input/output dimensions and upper-bound backward differences. It is not statistical inference or causal attribution. |
| Explanation, result class, safety text | `PASS` for arithmetic disclosure; `PARTIAL` for source-backed nutrition evidence | Output is `CALCULATED`, includes formulas/assumptions and no clinical safety judgment. The only formula basis is the project SPEC; external nutrition citations or population validation are not established. |
| AR/EN and global display preferences | `PASS` in component tests; browser accessibility `NOT RUN` | Tests cover localized labels/direction and header language/unit context. No manual browser keyboard, screen-reader, contrast or mobile audit has been performed. |
| Persistence, user-history personalization, live Supabase | `MISSING` / `NOT RUN` | Macro does not persist results or apply user history/preferences in its math. No live database query or RLS verification was performed; neither is claimed. |
| Focused verification | `PASS` | Current `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx`: 4 files / 92 tests, exit 0. Current `npx tsc --noEmit`: exit 0. Latest measured engine coverage remains the recorded 70 tests, 94.91% statements, 87.61% branches, 93.33% functions and 95.90% lines. |
| Full repository tests | `FAIL` (latest recorded run; not rerun in this checkpoint) | The latest recorded full run had 16 payment/checkout failures in the dirty worktree. The current focused rerun does not resolve or establish the provenance of those failures. |

This mapping classifies applicable Macro requirements; it does not authorize the template or rollout. Overall SmartTools/V3 phase remains `NOT READY` pending owner review and outstanding platform checks.

## Full-suite failure provenance and root-cause review — 2026-10-25

The latest full repository test run was `npx vitest run --reporter=dot`: **FAIL**, exit 1, 413 files (405 passed, 7 failed, 1 skipped), 4,298 passed, 16 failed, 5 skipped (4,319 total). Per-test details were captured with this PowerShell command (exit 1; 16 failed / 88 passed): `$auditReport='C:\Users\foryo\AppData\Local\Temp\smarttools-vitest-failure-details.json'; npx vitest run tests/integration/checkoutCountryRouting.test.ts tests/integration/createInvoiceKashierDelegation.test.ts tests/unit/checkoutSessionService.test.ts tests/unit/instapayPreservationLock.test.ts tests/unit/merchantResolver.test.ts tests/unit/orderProducersStatusContract.test.ts tests/unit/paymentReceiptsAdmin.test.ts --reporter=json --outputFile=$auditReport`. The JSON remains under the OS temp directory, not a project artifact.

### Provenance boundary

The seven failing test files and the directly implicated checkout/payment implementation files were checked with `git status --short -- <paths>` and `git diff --quiet HEAD -- <paths>`; they were clean and byte-equivalent to checked-out `HEAD` at this checkpoint. Therefore the failures are reproducible against the current committed source/test baseline and are **not attributable to the Macro v6 changes in this worktree**. A separate clean worktree/baseline run was not performed, so this does not prove when the failures first entered project history.

### Failure-by-failure evidence

| Failing suite / tests | Exact evidence and root cause | Impact / classification | Remediation status / next action |
|---|---|---|---|
| `tests/integration/checkoutCountryRouting.test.ts` (8) and `tests/integration/createInvoiceKashierDelegation.test.ts` (1) | All nine assertions expected HTTP 200 but received 500. Runtime log: `[CheckoutSession] No Fourthwall product mapping for tier: digital`. GLOBAL checkout deliberately enters Fourthwall (`server/payments/checkout/checkoutSessionService.ts:384-416`); `server/payments/merchantResolver.ts:383-394` obtains product IDs from `FOURTHWALL_PRODUCT_*_ID`. The integration fixtures configure Kashier variables (`tests/integration/checkoutCountryRouting.test.ts:145-147`, `createInvoiceKashierDelegation.test.ts:114-116`) but no Fourthwall product ID for the digital tier. | Current-HEAD test/config fixture gap for GLOBAL digital checkout; if equivalent production env is absent, real GLOBAL DIGITAL checkout returns 500. The test run alone does not establish deployed environment configuration. | No payment/config edits made (outside authorized scope). Owner should decide whether these tests should exercise Fourthwall and supply isolated mapping fixtures, or explicitly request an implementation/configuration remediation. Verify production secret presence separately without exposing values. |
| `tests/unit/checkoutSessionService.test.ts` (1) | GLOBAL digital unit test throws `TypeError: fourthwallGateway.resolveProductMapping is not a function` at `server/payments/checkout/checkoutSessionService.ts:412:77`; test fixture's gateway does not implement the method used by the production branch (`tests/unit/checkoutSessionService.test.ts:224`). | Stale mock contract against current-HEAD gateway API; unit test cannot reach intended assertions. | Not changed. Update fixture only within a separately authorized payment-test scope, then rerun suite. |
| `tests/unit/instapayPreservationLock.test.ts` (1) | Static assertion at test line 87 requires literal `orderStatus = status === 'verified'...`; route source uses the newer explicit state machine and has no such expression. Current insert writes include `pending` payment status and `pending_manual_review` order status (`app/api/checkout/instapay/route.ts:412-413,489-496,554`). The test's prescribed expression also uses legacy `verified` while the current admin flow uses `approved`. | Stale source-string lock test; it does not evaluate runtime semantics and now conflicts with the current contract. Potentially material contract drift should be checked by behavior tests, not string matching. | Not changed. Replace/update the lock assertion only after owner review of the payment state-machine contract; verify with behavioral tests. |
| `tests/unit/merchantResolver.test.ts` (1) | Test at line 146 expects exactly three canonical product keys. Current `CANONICAL_PRODUCTS` contains five definitions, including coaching add-on and consultation (`server/payments/merchantResolver.ts:107` and resolver mappings at `:388-392`). | Stale expected catalog assertion relative to checked-in current product catalog. | Not changed. Confirm the intended canonical product set, then align the assertion or implementation under authorized payment scope. |
| `tests/unit/orderProducersStatusContract.test.ts` (1) | Test lines 61-64 requires old local variables and exact `orderPatch[...]` source strings. Current admin route has a separate transition machine (`app/api/admin/payment-receipts/[id]/route.ts:12-19`), approves via `approve_instapay_receipt` RPC (`:163-190`), and rejection explicitly updates `orders.status='cancelled'` with `payment_status='failed'` (`:232-261`). | Static test is coupled to an obsolete implementation shape; the expected text is absent despite corresponding current logic being expressed differently. The actual RPC/migration contract still needs database-side verification. | Not changed. Convert to semantic/runtime contract tests in a separately authorized payment scope; do not claim live RPC correctness based on source inspection. |
| `tests/unit/paymentReceiptsAdmin.test.ts` (3) | Test fixtures send `status='verified'` and use legacy `pending_review` (`:146-221`), but route schema accepts `under_review / approved / rejected` (`app/api/admin/payment-receipts/[id]/route.ts:12-37`); approval also requires a reference/transaction ID and uses an RPC (`:42-58,163-190`). Thus approval returns 400, rejection from legacy pending state returns 409 under current transitions. The list test filters `pending_review` although list route only accepts `awaiting_payment / submitted_for_review / under_review / approved / rejected / expired` (`app/api/admin/payment-receipts/route.ts:13-28`), and queries `admin_instapay_review_detail` (`:61-64`) while its mock configures only `payment_receipts`; route returns 500 on the invalid filter/mock path. | Test fixtures and assumptions predate the current receipt state machine/view/RPC contract. This is a test-contract mismatch; it also signals that current DB view/function availability cannot be proven by these unit tests. | Not changed. Align fixtures with current status transitions, reference requirements, view, and RPC; verify against a local disposable schema or contract mocks, then separately verify deployed schema only with explicit authorization. |

### Aggregate classification

- Payment checkout and admin failures are outside Macro v6 scope. No failure above is demonstrated to be introduced by the Macro implementation; implicated source/tests were unchanged from `HEAD`.
- Some failures are fixture/configuration gaps with a real runtime risk if the required Fourthwall mapping is absent; others are stale static/unit-test contracts. They are not all safely reducible to “tests only” without reviewing the live deployment configuration and DB migration state.
- No payment code, tests, environment values, Supabase schema/data, or migrations were changed or queried during this review. No attempt was made to fix out-of-scope failures.
- Scoped Macro tests remain **PASS** (4 files / 92 tests); `npx tsc --noEmit` remains **PASS**. The full repository suite remains **FAIL**. Phase 0 and the overall phase gate remain **NOT READY**. Do not start the template, another tool batch, rollout, database work, commit, push, or deployment without the required separate owner authorization.
- `npm run lint` — **PASS**, exit 0, 0 errors / 631 warnings. This is the repository-wide ESLint baseline; warnings remain (including unused variables, explicit `any`, and hook dependency warnings) and were not auto-fixed because they are broad and outside the authorized Macro repair scope.

## Current continuation verification — 2026-10-25

This is the newest verification snapshot and supersedes earlier full-suite counts above.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run` | **FAIL**, exit 1 | 417 files: 409 passed, 7 failed, 1 skipped; 4,319 tests passed, 16 failed, 5 skipped (4,340 total). Failures remain in seven payment/checkout suites: 8 country-routing checkout responses, 1 Kashier delegation response, 1 stale `resolveProductMapping` mock, 1 stale InstaPay source-string assertion, 1 stale merchant product-count expectation, 1 stale order-producer source-string assertion, and 3 payment-receipt fixture/status/view expectations. Runtime stderr again reports missing Fourthwall digital product mapping. |
| Focused Macro v6, pilot, adapter, route tests with engine coverage | **PASS**, exit 0 | 4 files / 92 tests; statements 94.91%, branches 87.61%, functions 93.33%, lines 95.90%. Coverage runner warns that Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mismatched. |
| `git status --short -- <seven failing test files and implicated payment source files>`; `git diff --quiet HEAD -- <same paths>` | **PASS**, exit 0 | No status rows and no diff from HEAD for those files. This shows the failures reproduce against the checked-out committed payment paths; without a separate clean worktree it does not prove their historical introduction time. |
| `git diff --check` | **PASS**, exit 0 | No whitespace errors; Git emitted line-ending normalization warnings for existing worktree files. |

Current repository state: `main` at `254ce1299bff227c54809bb7027f9b587d69c143`, 695 status rows (202 tracked dirty, 493 untracked), 0 staged. No payment code/tests, database schema/data, or migrations were changed. No Supabase query, commit, push, or deployment occurred. Macro v6 remains `NOT READY FOR PHASE 2`: its scoped checks pass, while the full suite and Phase 0 review gates remain unresolved. The existing PROMPT approval gate still prohibits template/tool rollout until explicit owner approval.

## Owner-authorized continuation verification — 2026-10-25

This addendum supersedes the earlier test totals above for the current checkout. Scope remains Phase 0 review/remediation plus Macro v6 only; Tool #147 was separately authorized and completed in this worktree. No template or additional tool rollout is authorized.

### Current Macro and catalog checks

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | `PASS`, exit 0 | 1 file / 70 tests; statements 94.91%, branches 87.61%, functions 93.33%, lines 95.90%. Toolchain warns Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mismatched; no dependency change was made. |
| `npx tsc --noEmit` | `PASS`, exit 0 | No diagnostics. |
| `npm run validate-tools` | `PASS`, exit 0 | 1 file / 5 tests. |
| `npx vitest run tests/unit/smartToolsCatalog.test.ts tests/security/securityHardeningPosture.test.ts --testTimeout=15000` | `PASS`, exit 0 | 2 files / 19 tests. The two security-posture tests that timed out at the default 5s under full-suite concurrency pass in isolation at the diagnostic timeout. |
| `npm run lint` | `PASS`, exit 0 | 0 errors / 515 warnings. Warnings span the pre-existing large worktree; no broad cleanup was attempted. |
| `npm run build` | `PASS`, exit 0 | Next.js 15.5.23, 391/391 pages. Existing Browserslist and `metadataBase` warnings remain. |
| Production route smoke check | `PASS`, HTTP 200 | Local production server returned 200 for `/smarttools/platform-ai/tool-147-scientific-evidence-explorer`; no PubMed search was submitted. The server was stopped after the check. |
| `git diff --check` | `PASS`, exit 0 | No whitespace errors. Existing CRLF normalization warnings were emitted. |

### Current full-suite result and failure provenance

`npx vitest run` — **FAIL**, exit 1, 443 files (435 passed, 7 failed, 1 skipped), 4,420 passed, 16 failed, 5 skipped (4,441 tests total). Failures are confined to the seven current-HEAD checkout/payment suites:

- `tests/integration/checkoutCountryRouting.test.ts` — 8; GLOBAL digital requests receive 500 because the test setup lacks a Fourthwall digital product mapping.
- `tests/integration/createInvoiceKashierDelegation.test.ts` — 1; same missing mapping.
- `tests/unit/checkoutSessionService.test.ts` — 1; test gateway mock omits `resolveProductMapping`.
- `tests/unit/instapayPreservationLock.test.ts` — 1; static assertion expects an obsolete `verified` status expression.
- `tests/unit/merchantResolver.test.ts` — 1; expects three canonical products while current code contains five.
- `tests/unit/orderProducersStatusContract.test.ts` — 1; static assertion expects an obsolete implementation expression.
- `tests/unit/paymentReceiptsAdmin.test.ts` — 3; fixtures use obsolete statuses, view and RPC assumptions.

The seven failing test paths and implicated payment implementation paths were checked after this run: `git status --short -- <paths>` produced no rows and `git diff --quiet HEAD -- <paths>` exited 0. Thus the failure code and fixture paths match committed HEAD and were not introduced by the current Macro/Tool147 worktree changes. No separate clean worktree was run, so historical first-introduction dates remain unknown. The missing Fourthwall mapping remains a possible live checkout configuration risk; deployed secrets were not inspected. Payment code, tests, and configuration were not changed because they are outside the authorized scope.

The first post-Tool147 full-suite run had 9 failing files / 20 failures: the two additional catalog count assertions were caused by publishing Tool147 (catalog shifted from 159 implemented + 7 planned to 160 + 6). They were corrected only in `tests/unit/smartToolsCatalog.test.ts`, preserving the existing local route-test changes; the catalog test now asserts 160 published + 6 planned = 166 total and passes. The security test timeouts from that first run also passed in isolation with `--testTimeout=15000`; they did not recur in the final default full-suite run.

### Phase 0 and authorization state

- Current catalog: 166 identities = 160 published/implemented + 6 planned. This count is not evidence that all 252 behaviors are audited.
- Supabase was inspected from repository SQL/migrations and adapter sources only. No Supabase CLI is installed, no live database query or RLS verification was performed, and no database operation occurred. The reported `profiles.unit_system` account round-trip gap remains unverified against production.
- Tool 111's evidence-derived reference audit remains in `docs/GENIUS_INTELLIGENCE_V3/GENIUS_TOOL_STANDARD_V3.md`; it separates present source/UI features from unverified runtime, persistence, AI and accessibility claims.
- Manual browser, keyboard, screen-reader, contrast and mobile accessibility review remains `NOT RUN`.
- Branch is `main`, HEAD is `254ce1299bff227c54809bb7027f9b587d69c143`. Current worktree has 887 status rows (232 tracked paths changed, 655 untracked; 0 staged). Changes outside Macro/Tool147 remain untouched.

**Decision remains `NOT READY`.** Macro's focused mathematical, validation, unit and coverage gates pass, but the full repository suite has 16 unresolved checkout/payment failures and Phase 0 still has live Supabase/profile and manual accessibility gaps. Do not proceed to a new tool batch, template, migration, database operation, commit, push or deployment without separate owner authorization.

## Browser smoke check — 2026-10-25

- `npm run start -- --hostname 127.0.0.1 --port 3100`: **PASS**, local Next production server reported ready; server was stopped after the check.
- `Invoke-WebRequest http://127.0.0.1:3100/smarttools/nutrition/macro`: **PASS**, HTTP 200, `text/html; charset=utf-8` (55973 bytes).
- Chrome and Edge headless `--dump-dom` attempts: **BLOCKED / NOT VERIFIED**. Both commands returned no DOM output and PowerShell exposed no usable process exit code in this session; no browser assertions are claimed from those attempts.
- `playwright`, `@playwright/test`, `puppeteer`, `@axe-core/playwright`, and `axe-core` are not installed locally. No dependencies were added.
- Source review confirms the Macro component consumes global `language`, `unitSystem`, and `isRTL` preferences (`components/tools/macro-pilot.tsx:103-117`), labels form controls (`:180-198`), and delegates common presentation to `GeniusToolTemplate` (`:261-268`). This is source evidence, not a browser test. Keyboard-only, screen-reader, contrast, mobile layout, and live preference switching remain **NOT RUN**.
- No application source was changed in this check. Phase 0 and Macro v6 remain **NOT READY** because the full suite has blocking failures and browser/database/profile audit gaps remain.

## Latest verification follow-up — 2026-10-25

This snapshot supersedes older command totals in this report for the current checkout. The working tree remains broadly dirty; no unrelated files were staged or altered by this verification.

| Exact command | Result | Evidence / classification |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 92 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 1 file / 70 tests; statements 94.91%, branches 87.61%, functions 93.33%, lines 95.90%. Tool warns Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mismatched; no dependency update was made. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npx eslint lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.ts lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.tsx app/smarttools/nutrition/macro/page.test.tsx --no-warn-ignored` | **PASS**, exit 0 | No diagnostics on the selected Macro/pilot/adapter source and test files. |
| `npm run lint` | **PASS**, exit 0 | Full-project ESLint: 0 errors / 486 warnings. Warnings remain across the dirty project; no broad cleanup was attempted. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23 compiled and generated 395/395 pages. Existing stale Browserslist data and missing `metadataBase` warnings remain. Build output logged “Supabase configured”; no database-write action was initiated and no live database state was verified. |
| `npx tsc --noEmit` (first invocation concurrent with `next build`) | **FAIL — INVALIDATED BY CHECK RACE** | TypeScript reported missing `.next/types/**/*.ts` files while the concurrent build was regenerating `.next`. This is not treated as a source diagnostic. |
| `npx tsc --noEmit` (rerun after build completed) | **PASS**, exit 0 | No diagnostics. |
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 467 files: 458 passed, 8 failed, 1 skipped; 4,551 passed, 18 failed, 5 skipped tests. |
| `$macroAuditPath = Join-Path $env:TEMP 'mrx-full-suite-failures-20261025.json'; npx vitest run tests/integration/checkoutCountryRouting.test.ts tests/integration/createInvoiceKashierDelegation.test.ts tests/unit/checkoutSessionService.test.ts tests/unit/instapayPreservationLock.test.ts tests/unit/merchantResolver.test.ts tests/unit/orderProducersStatusContract.test.ts tests/unit/paymentReceiptsAdmin.test.ts components/tools/tool-034-compound-clearance.dom.test.tsx --reporter=json --outputFile=$macroAuditPath *> $null` | **FAIL**, exit 1 | 18 failures reproduced. Sixteen checkout/payment failures are in seven test suites and implicated source files that show no worktree changes and `git diff --quiet HEAD` exits 0. Their previously documented causes remain: missing Fourthwall digital mapping in fixtures, stale gateway mock, obsolete payment statuses/source-string assertions, stale product-count expectation, and outdated receipt view/RPC assumptions. No payment files were modified. |

The two additional failures are in `components/tools/tool-034-compound-clearance.dom.test.tsx`; its new assertions expect old Arabic/English headings, while the current local i18n strings are “محاكاة رياضية لاضمحلال نسبة جرعة مفردة” and “Single-dose Fractional Decay Scenario.” Tool 034's component and engine are locally modified and its DOM test is untracked, so these failures belong to that separate dirty Tool 034 change set, not Macro v6. Tool 034 was not changed during this Macro verification because it is outside the authorized scope.

The concurrent TypeScript/build check caused no application source change; the sequential TypeScript rerun passed. No database write, migration, commit, push, or deployment was performed. Macro v6's focused functional and coverage checks pass, but the overall gate remains **NOT READY** due to the full-suite failures and outstanding Phase 0/live-database/browser review limitations. Human approval remains required before template or tool-rollout work.

## Macro equation age-evidence follow-up — 2026-10-25

The Mifflin–St Jeor coefficients and existing accepted input bounds were not changed. The engine now emits `AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE` when age is below 19 or above 78, matching the age range of the original derivation sample. The bilingual Macro pilot explains that its field named `bmr` is an estimate of resting energy expenditure (REE), links the original study record, and describes the limitation in both languages. The warning does not label the result invalid or clinically unsafe. It identifies extrapolation beyond the paper's studied age range.

The PubMed record for the original study reports 498 healthy adults aged 19–78, REE measured by indirect calorimetry, and R²=0.71: <https://pubmed.ncbi.nlm.nih.gov/2305711/>. This evidence supports the equation's original derivation context only. It does not independently validate this project's activity factors, phase multipliers, macro allocation, or use in populations outside that study.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 97 tests, including age-boundary warnings at 18 and 79 and no warning at 19 and 78. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 1 file / 74 tests; 94.95% statements, 87.83% branches, 93.33% functions, 95.94% lines. Existing Vitest/coverage-v8 version mismatch warning remains. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| Scoped `npx eslint` on the Macro engine, engine tests, Macro pilot, and pilot tests | **PASS**, exit 0 | No diagnostics. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23, 395/395 pages. Existing Browserslist and missing `metadataBase` warnings remain. |
| Full `npx vitest run` after this narrow evidence change | **NOT RUN** | Most recent full run remains the preceding recorded failure: 18 failures across 8 files (16 unchanged payment/checkout failures and 2 local Tool 034 DOM expectation failures). This change does not establish that those failures were resolved. |

No Supabase query/write, migration, commit, push, or deployment occurred. The repository-wide suite, Phase 0 live Supabase/profile verification, and manual browser/accessibility checks still block readiness. **Decision remains `NOT READY`.**

## What-If optional target-weight consistency follow-up — 2026-10-25

Review of phase and ±10 kg comparisons found that an optional `targetWeightKg` could make an otherwise valid comparison fail phase-specific validation even though this field does not participate in the Macro equations. The engine now omits that optional field only when it conflicts with a comparison's phase/adjusted weight, and records the omission in the scenario description and `inputChanges`. The original user input is preserved, and the calculated base result and formula are unchanged. The scenario remains a deterministic arithmetic comparison, not a prediction.

The first regression-test run after the phase-only change failed: `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` — **FAIL**, exit 1, 1 failing test. The trace showed the +10 kg scenario still carried a bulk target weight that became incompatible with the adjusted weight. The fix applied the same explicit omission rule to weight-change scenarios. This was a test-discovered gap in the in-progress remediation, not a failure left in the current implementation.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 98 tests. Includes both phase-conflict directions and ±10 kg conflicting-target cases. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | Engine 75 tests; statements 95.08%, branches 91.92%, functions 93.33%, lines 96.05%. Vitest 4.1.10 / coverage-v8 4.0.18 mismatch and deprecated-import warning remain. |
| Scoped ESLint on `macro.v6.ts`, its tests, `macro-pilot.tsx`, and pilot tests | **PASS**, exit 0 | No diagnostics. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23; 395/395 pages. Existing Browserslist and `metadataBase` warnings remain. Build logged that Supabase env is configured; no query or write was performed. |
| Full repository `npx vitest run` after this change | **NOT RUN** | Latest known full run remains **FAIL**: 18 failures in 8 files (16 current-HEAD payment/checkout failures and 2 local Tool 034 DOM expectation failures). |

No database operation, migration, commit, push or deployment occurred. The phase gate remains **NOT READY** until the full suite and outstanding Phase 0 owner-review checks are resolved.

## Full repository suite refresh after What-If fix — 2026-10-25

The required current-state full-suite rerun was performed after the What-If correction:

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 467 files: 458 passed, 8 failed, 1 skipped; 4,557 tests passed, 18 failed, 5 skipped (4,580 total). |
| `$auditPath = Join-Path $env:TEMP 'mrx-current-failing-suites-20261025.json'; npx vitest run tests/integration/checkoutCountryRouting.test.ts tests/integration/createInvoiceKashierDelegation.test.ts tests/unit/checkoutSessionService.test.ts tests/unit/instapayPreservationLock.test.ts tests/unit/merchantResolver.test.ts tests/unit/orderProducersStatusContract.test.ts tests/unit/paymentReceiptsAdmin.test.ts components/tools/tool-034-compound-clearance.dom.test.tsx --reporter=json --outputFile=$auditPath *> $null` | **FAIL**, Vitest exit 1 | 8 files: 88 passed / 18 failed. Machine-readable failure report was written to the process temp directory and summarized without adding a repository artifact. |

Failure breakdown: 16 failures in seven payment/checkout suites, plus two Tool 034 DOM assertions. The payment test and implicated source paths still match `HEAD` (`git diff --quiet HEAD -- <paths>` exit 0; `git status --short -- <paths>` empty), so these failures reproduce against checked-in current source and were not introduced by the Macro change. Roots remain: nine GLOBAL digital checkout tests lack a Fourthwall digital product mapping; one checkout unit mock lacks `resolveProductMapping`; one InstaPay source-string assertion expects an obsolete status expression; one merchant test expects three products while current source defines five; one order-producer source-string assertion is obsolete; and three payment-receipt tests assume legacy status/view/RPC contracts. Deployed product IDs and database objects were not inspected.

The two Tool 034 DOM failures expect Arabic/English headings that do not match the current rendered copy. The assertion file is untracked and `i18n/tool-034-compound-clearance.json` is modified in this worktree; neither belongs to Macro v6 scope, and neither was changed here. This establishes a separate local test/content mismatch, not a Macro regression. No payment, Tool 034, database, or migration files were edited.

Macro-focused tests remain **PASS** (4 files / 98 tests), and Macro engine coverage remains **PASS** (75 tests; 95.08% statements, 91.92% branches, 93.33% functions, 96.05% lines). The full-suite failure is therefore still a blocking repository-wide gate. **Overall Phase 0/Macro status remains `NOT READY`.**

## Global theme preference integration — 2026-10-26

The Macro pilot previously passed a hard-coded `theme="light"` to the shared presentation template despite reading language and units from the global preferences provider. It now consumes the provider's light/dark/system setting, reports the resolved system theme from the existing document root, and subscribes to the application's existing `mrx_theme_change` event. No in-tool theme control was added and the generic template or other tools were not changed.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run components/tools/macro-pilot.test.tsx lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 99 tests, including global light → dark/system resolution changes. |
| `npx eslint components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts --no-warn-ignored` | **PASS**, exit 0 | No diagnostics. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23; 395/395 pages. Existing stale Browserslist and missing `metadataBase` warnings remain. |
| Full repository `npx vitest run` after this UI change | **NOT RUN** | Latest full run on 2026-10-25 remains **FAIL** with 18 failures across 8 files (16 payment/checkout and 2 local Tool 034 DOM expectation failures). |

The DOM test checks preference propagation and resolved-theme synchronization; it is not a visual browser, contrast, or accessibility review. Those checks remain **NOT RUN**. No database query/write, migration, commit, push, or deployment occurred. Overall Phase 0/Macro remains **NOT READY**.

## Full-suite verification after theme integration — 2026-10-26

`npx vitest run --reporter=dot` — **FAIL**, exit 1; 467 files: 458 passed, 8 failed, 1 skipped; 4,558 tests passed, 18 failed, 5 skipped (4,581 total). The same eight non-Macro test files remain failing as documented in the current-state rerun above: seven payment/checkout suites (16 assertions) and the local Tool 034 DOM suite (2 assertions). No Macro focused test failure was observed. The focused Macro suite remains **PASS** (4 files / 99 tests), but this full-suite failure still blocks readiness. No payment or Tool 034 files were changed, and no database operation, migration, commit, push, or deployment occurred.

## Macro validation-message localization follow-up — 2026-10-26

The Macro pilot now maps known engine validation and calculation errors to bilingual field-specific messages, while retaining a generic localized fallback for unrecognized failures. The input values and engine rules are unchanged. Regression coverage verifies the invalid-weight message in English and Arabic.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 99 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 75 engine tests; 95.08% statements, 91.92% branches, 93.33% functions, 96.05% lines. Existing Vitest/coverage-v8 version mismatch and deprecated import warnings remain. |
| `npx eslint components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.ts lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.tsx app/smarttools/nutrition/macro/page.test.tsx --no-warn-ignored` | **PASS**, exit 0 | No diagnostics. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npm run build` after this localized message change | **NOT RUN** | A Next.js development server was active in the same checkout. The previously recorded production build passed before this narrow UI change; it does not verify this latest source state. |
| Full repository `npx vitest run` after this localized message change | **NOT RUN** | Latest full run remains the 2026-10-26 failure above: 18 tests failed across 8 files, all in the recorded payment/checkout and Tool 034 suites. |

The local preview server on `127.0.0.1:3101` returned HTTP 200 for `/en/smarttools/nutrition/macro` and `/smarttools/nutrition/macro`; this is a local route check, not a deployment or visual/accessibility review. The current generic page title was `Smart Tools | Mr. X-Steroid`. No database operation, migration, commit, push, or deployment occurred. Overall Phase 0/Macro status remains **NOT READY** pending the full-suite failures and remaining owner-review, live Supabase/profile, and browser/accessibility checks.

## Production build and route refresh — 2026-10-26

After stopping the local development server, the current Macro localization source was verified with a fresh production build. The production server is running locally on `127.0.0.1:3101` for review.

| Exact command/check | Result | Evidence |
|---|---|---|
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23; compiled successfully and generated 395/395 pages. Existing `metadataBase` warnings remain. The “Supabase configured” build log indicates environment configuration only; no live query or write was performed. |
| `Invoke-WebRequest` to `/en/smarttools/nutrition/macro`, `/ar/smarttools/nutrition/macro`, `/smarttools/nutrition/macro` on `127.0.0.1:3101` | **PASS**, all HTTP 200 | English root `lang=en, dir=ltr`; Arabic root `lang=ar, dir=rtl`; unprefixed path resolves to English. All show generic title `Smart Tools | Mr. X-Steroid`. |
| `& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --disable-gpu --no-first-run --dump-dom 'http://127.0.0.1:3101/en/smarttools/nutrition/macro'` | **NOT VERIFIED**, exit 0 with empty stdout | Chrome produced no DOM output, so this does not count as browser interaction, visual, or accessibility verification. Browser automation and axe packages are absent; none were installed. |
| Full repository `npx vitest run` after the latest localized error-message change | **NOT RUN** | Most recent full run remains **FAIL** with 18 failures across 8 files (16 payment/checkout and 2 local Tool 034 DOM assertions). |

The build and route checks do not establish visual layout, keyboard flow, contrast, assistive-technology behavior, interactive calculation behavior in a real browser, or live Supabase/profile persistence. Overall Phase 0/Macro remains **NOT READY**. No database operation, migration, commit, push, or deployment occurred.

## Latest repository gates and failure stability — 2026-10-26

| Exact command | Result | Evidence |
|---|---|---|
| `npm run lint` | **PASS**, exit 0 | Full-project ESLint: 0 errors, 486 warnings. Warnings remain across the large dirty project; no broad cleanup was made. |
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 467 test files: 457 passed, 9 failed, 1 skipped; 4,556 passed, 20 failed, 5 skipped (4,581 total). This first run included a `securityHardeningPosture.test.ts` 5-second timeout. |
| `$audit = Join-Path $env:TEMP 'mrx-full-suite-20261026-final.json'; npx vitest run --reporter=json --outputFile=$audit *> $null` | **FAIL**, exit 1 | Follow-up full run: 467 unique files, 459 passed and 8 failed; 4,558 passed, 18 failed, 5 skipped. The 18 reproducible assertions are 16 payment/checkout failures and 2 Tool 034 DOM copy expectations. The security posture test passed in the targeted reproduction; the initial timeout and two extra failure counts did not reproduce. JSON evidence was kept outside the repository. |
| Targeted rerun of the 9 observed failure files, JSON output | **FAIL**, exit 1 | 8 unique failing file paths / 18 failing assertions; same 16 payment/checkout assertions and 2 Tool 034 heading assertions. The security suite did not fail in this rerun. |

All seven payment/checkout failing test files are clean relative to `HEAD` in this checkout; their failures reproduce from current committed sources, but no clean historical worktree comparison establishes when they originated. The Tool 034 DOM test is untracked and has stale expected headings against the current locally changed copy. The first full run's timeout variance is recorded as load-sensitive, not as a Macro regression. No payment or Tool 034 files were changed under this Macro-only work. Macro focused tests remain **PASS** (4 files / 99 tests); overall remains **NOT READY** because the project suite still has 18 reproducible failures and Phase 0 review is incomplete.

Git snapshot after verification: branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, `git status --short` = 826 rows (250 tracked dirty, 576 untracked), staged paths = 0. The large dirty worktree was not cleaned, staged, or reset. The preview server remains local at `127.0.0.1:3101`; no deployed site was accessed.

## Current Macro gate refresh and payment failure triage — 2026-10-26

The earlier note saying the full suite had not been rerun after the latest Macro localization is superseded by the full-suite reruns in the baseline audit report. This section records the current focused Macro evidence and the concrete reproduced blocker. No Macro source was changed during this refresh.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 99 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 75 tests; 95.08% statements, 91.92% branches, 93.33% functions, 96.05% lines. Vitest 4.1.10 with coverage-v8 4.0.18 emits a mixed-version warning and deprecated-import warning. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npx eslint components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.ts lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.tsx app/smarttools/nutrition/macro/page.test.tsx --no-warn-ignored` | **PASS**, exit 0 | No diagnostics. |
| `npx vitest run tests/integration/checkoutCountryRouting.test.ts -t "country=US does NOT resolve to egypt" --reporter=verbose` | **FAIL**, exit 1 | Reproduced route response 500. Server log: `[CheckoutSession] No Fourthwall product mapping for tier: digital`; path reaches `checkoutSessionService.ts:410-415`. See the baseline audit's full triage for affected contract groups and remediation status. |
| `npm run build` | **PASS**, latest production build recorded above | Next.js 15.5.23 generated 395/395 pages; existing metadataBase warning. Local English/Arabic Macro route requests returned HTTP 200. |
| Full repository `npx vitest run` | **FAIL**, latest full rerun recorded in baseline audit | 18 reproducible assertions across 8 files: 16 payment/checkout, 2 local Tool 034 DOM. No clean historical worktree comparison was run. |

**Decision remains `NOT READY`.** Macro-specific checks pass, but the repository-wide suite includes an exercised checkout-path failure and additional stale payment contract tests. Phase 0 still lacks owner review, live Supabase/profile verification, and manual browser/accessibility checks. No payment or Tool 034 code was changed; no database operation, migration, commit, push, deployment, template, or tool rollout occurred. The human decision still withholds scope expansion.

## Adult-sample age guard — 2026-10-26

The original Mifflin–St Jeor derivation used 498 healthy adults aged 19–78 (PubMed PMID 2305711: https://pubmed.ncbi.nlm.nih.gov/2305711/). The prior engine accepted age 13 and generated adult calorie/macro targets for minors, showing only an extrapolation warning. Macro v6 now rejects ages below 19 in engine validation and sets the UI input minimum to 19; ages 79–100 remain available with the existing explicit out-of-sample warning. No equation or output for supported ages changed.

- Changed only the Macro v6 engine, pilot UI, and their two adjacent test files. The UI error is localized in English and Arabic; the regression verifies age 18 produces no result and age 19 is accepted.
- First verification exposed two obsolete test assumptions that treated age 18 as a calculable extrapolation. The warning tests now use age 79, while separate engine/UI tests assert rejection of age 18. Final focused suite passes.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx` | **PASS**, exit 0 | 4 files / 100 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 75 tests; 95.08% statements, 91.92% branches, 93.33% functions, 96.05% lines. The Vitest/coverage-v8 version mismatch remains. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 5/5 tests. |
| Scoped `npx eslint` over Macro engine/UI/adapter and adjacent tests | **PASS**, exit 0 | No diagnostics. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23 generated 395/395 pages; existing Browserslist and `metadataBase` warnings remain. |
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 467 files: 458 passed, 8 failed, 1 skipped; 4,559 passed, 18 failed, 5 skipped (4,582 total). The 18 failures remain the known 16 payment/checkout assertions and 2 local Tool 034 DOM expectations; no Macro failures appeared. |
| Local production route smoke check | **PASS** | `/en/smarttools/nutrition/macro` and `/ar/smarttools/nutrition/macro` both returned HTTP 200 after the rebuild. This is not visual/accessibility verification. |

The age guard addresses the unsupported-minor calculation risk in Macro v6. It does not establish full clinical suitability of the underlying calorie assumptions. No non-Macro code, database, migration, registry, or route identity was changed. Overall Phase 0/Macro remains **NOT READY** because the repository-wide suite and Phase 0 review gaps remain; no template or 252-tool rollout is authorized.

## Macro UI styling and focused verification refresh — 2026-10-26

The Macro pilot now uses the isolated `components/tools/macro-pilot.module.css` module, imported by `components/tools/macro-pilot.tsx` around the existing shared template. This styles the Macro-specific panels, fields, result states, alerts, focus treatment, and responsive layout without changing the shared Genius template or other tool pages. The user-visible local preview remains available at `/en/smarttools/nutrition/macro` and `/ar/smarttools/nutrition/macro`.

Latest checks in this refresh:

| Exact command/check | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx` | **PASS**, exit 0 | 2 files / 88 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 75 tests; 95.08% statements, 91.92% branches, 93.33% functions, 96.05% lines. Vitest 4.1.10 and coverage-v8 4.0.18 are mismatched; the runner warns this mixed version is unsupported. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npx eslint lib/tools/engines/macro.v6.ts components/tools/macro-pilot.tsx` | **PASS**, exit 0 | No diagnostics for implementation files. |
| `npx eslint lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx` | **NOT A VALID TEST-FILE LINT RESULT**, exit 0 | ESLint ignored both test files by project ignore rules and emitted warnings; implementation files were linted separately with the passing command above. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `Invoke-WebRequest` to `http://127.0.0.1:3101/en/smarttools/nutrition/macro` and `/ar/smarttools/nutrition/macro` | **PASS**, HTTP 200 for both | Local route availability only. |
| Production build after this styling refresh | **PASS**, exit 0 | The immediately preceding production build generated 395/395 pages after the scoped stylesheet and responsive CSS edits. No new build was run during this verification refresh. |
| Full repository `npx vitest run --reporter=dot` during this refresh | **NOT RUN** | The latest full-suite evidence remains the preceding run recorded above: 18 failures in payment/checkout and local Tool 034 suites. |

The existing desktop screenshot spot-check showed the Macro panel and fields styled and contained. A standards-based visual/accessibility review and a verified 390 CSS-pixel mobile screenshot remain **NOT VERIFIED**; earlier Edge window sizing did not reliably emulate that viewport. These checks, live Supabase/profile behavior, full-suite failures, and Phase 0 owner review keep the overall decision **NOT READY**. No other tool, shared template, database, migration, commit, push, or deployment was changed or performed.

### Follow-up: verified narrow viewport — 2026-10-26

The prior `NOT VERIFIED` statement is superseded for basic narrow-viewport rendering only. Chromium DevTools Protocol emulation was explicitly set to 390×844 CSS pixels (`mobile: true`); `innerWidth` and `documentElement.clientWidth` both reported 390, and a screenshot was visually inspected at `%TEMP%\mrx-macro-mobile-verified.png`. The Macro card and its form controls fit within the viewport and remain visible. The page reports `documentElement.scrollWidth=390`, but `body.scrollWidth=433`; overflowing elements identified in the snapshot are global navigation/header controls, not the Macro form. This is recorded as an existing shared-shell responsive issue and was left unchanged because the current work is Macro-only. This spot-check does not establish full-device/browser coverage, keyboard accessibility, contrast, or assistive-technology behavior; those remain **NOT VERIFIED**.

## Full-suite current-checkout rerun — 2026-10-26

Re-ran the full suite after the focused Macro and preference checks:

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 467 files: 458 passed, 8 failed, 1 skipped; 4,559 tests passed, 18 failed, 5 skipped (4,582 total); 182.30 seconds. |
| Targeted JSON rerun of the eight failure paths | **FAIL**, exit 1 | 8 unique paths; 18 failed assertions and 88 passed assertions. JSON evidence is in `%TEMP%\mrx-full-suite-targeted-20261026.json`, outside the repository. |

The reproduced 18 failures are unchanged from the previously documented set: eight global checkout routing expectations fail because the current GLOBAL digital flow requires a missing Fourthwall product mapping; one Fourthwall delegation expectation fails for the same mapping; one checkout unit test uses a gateway mock without `resolveProductMapping`; three payment-receipt tests use legacy status/view/RPC assumptions; two static payment-contract tests expect obsolete source text; one merchant resolver test expects three products although current code declares five; and two local Tool 034 DOM assertions expect outdated headings. The exact failure paths are in the baseline report. The targeted failure rerun produced no failure in Macro or the header-preference suites. Payment fixes remain outside the approved Macro scope; the Tool 034 mismatch is a separate dirty local change. No payment or Tool 034 files were edited.

**Gate remains `NOT READY`.** Focused Macro/preference checks pass, but the full suite remains red and Phase 0 still has live Supabase/profile, browser/accessibility, and owner-review gaps. No database write, migration, commit, push, deployment, or additional tool rollout occurred.

## Macro What-If age-boundary correction — 2026-10-26

Source review found that engine validation rejected ages below 19, but the age What-If slider still advertised a minimum of 13. The user could therefore select an unsupported scenario that the calculation engine would reject. The slider minimum now matches validation (`max(19, currentAge - 10)`), with a regression at age 19 verifying a 19–29 range, a valid 19-year scenario, and rejection of 18. No equation or supported base result changed. The input-bounds table and derivation note above are corrected to the current 19–100 range; 79–100 remain extrapolation cases.

| Exact command/check | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS**, exit 0 | 4 files / 101 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 76 tests; 95.08% statements, 92.30% branches, 93.33% functions, 96.05% lines. Vitest 4.1.10 / coverage-v8 4.0.18 mismatch and deprecated-import warning remain. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npx eslint lib/tools/engines/macro.v6.ts components/tools/macro-pilot.tsx` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23; generated 395/395 pages. Existing Browserslist and `metadataBase` warnings remain. |
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 469 files: 460 passed, 8 failed, 1 skipped; 4,566 passed, 18 failed, 5 skipped (4,589 total). Same known 16 payment/checkout and 2 local Tool 034 assertions; no Macro failures appeared. This run verifies current-worktree recurrence but cannot establish historical introduction. |
| Production preview `GET http://127.0.0.1:3101/en/smarttools/nutrition/macro` | **PASS** | HTTP 200; English root locale and `Macro Calculator v6` present. Local preview only. |

The build log's “Supabase configured” line reflects environment configuration only; no database query or write was made. Current Git snapshot: `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 957 status rows with all untracked files expanded, 0 staged paths. The overall Phase 0/Macro gate remains **NOT READY** because the full suite fails and owner-review, live Supabase/profile, and accessibility gates remain unresolved. No unrelated source, database, migration, commit, push, or deployment was changed or performed.

## Macro age-sensitivity boundary and current verification — 2026-10-26

The sensitivity finite-difference specification still used the old minimum age after the main validator and What-If age control had been raised to 19. It now uses the supported age interval 19–100 (`lib/tools/engines/macro.v6.ts:412-416`). A regression at the minimum age verifies all four age sensitivities are finite and that the BMR partial derivative remains −5 (`lib/tools/engines/macro.v6.test.ts:243-250`). This changes only the boundary used to select a valid perturbation; it does not change the equation or baseline result.

| Exact command/check | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS**, exit 0 | 4 files / 102 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 77 tests; 95.08% statements, 92.30% branches, 93.33% functions, 96.05% lines. Tool warns Vitest 4.1.10 and coverage-v8 4.0.18 are mismatched and reports a deprecated coverage import. |
| `npx tsc --noEmit` | **PASS**, exit 0 | Exit 0; no diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npm run lint` (`eslint .`) | **PASS**, exit 0 | 0 errors, 486 warnings across the repository. Scoped Macro implementation lint is also clean. |
| `npx eslint lib/tools/engines/macro.v6.ts components/tools/macro-pilot.tsx` | **PASS**, exit 0 | No diagnostics. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23 compiled and generated 395/395 pages; existing Browserslist and `metadataBase` warnings remain. |
| Local production `GET` for `/en/smarttools/nutrition/macro` and `/ar/smarttools/nutrition/macro` | **PASS**, HTTP 200 each | English HTML contains `Macro Calculator v6`; Arabic page returned 200 and contains its localized title. Local build only, not deployment. |
| PowerShell trailing-whitespace scan over the five listed Macro/audit files | **PASS WITH NOTES** | No trailing whitespace in the Macro engine, its tests, or Macro report. The baseline audit has two intentional Markdown hard-break spaces at lines 3–4; these are outside the new section and were preserved. Git `diff --check` does not inspect these files because they are untracked in this worktree. |
| Full repository Vitest run (captured JSON at `%TEMP%\mrx-full-suite-20261026-macro-sensitivity.json`) | **FAIL**, exit 1 | 1,538 suites discovered: 1,520 passed, 18 failed; 4,590 tests: 4,567 passed, 18 failed, 5 skipped. Eight paths fail: seven payment/checkout suites (16 assertions) plus locally modified Tool 034 DOM (2 assertions). Checkout routes return 500 due to missing GLOBAL Fourthwall mapping; unit gateway mock lacks `resolveProductMapping`; other payment failures assert legacy receipt/product/source-text contracts. The local Tool 034 DOM test expects prior headings. Compared with the immediately preceding full run, the same 18 assertions in the same eight paths fail; one new age-sensitivity regression test passes, increasing passed tests from 4,566 to 4,567. This rules out a newly observed suite regression in this interval, but not historical introduction of the unrelated failures. |

The full-suite failures remain outside the authorized Macro-only repair scope. Their current evidence does not justify changing checkout/payment contracts or Tool 034 copy/tests in this phase. Macro-specific checks pass, but the project gate remains **NOT READY**. Current Git evidence is branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 957 status rows (all untracked expanded), and 0 staged paths. No database operation, migration, commit, push, deployment, or change outside the authorized Macro engine, pilot UI/CSS, adjacent tests, and audit documents was made in this checkpoint.

## Macro bilingual status-state correction — 2026-10-26

The shared template displays its status token (`idle`, `partial`, `ready`, `error`) in English. To close that visible localization gap without changing shared-template behavior for other tools, Macro now hides that token only inside its scoped `.shell` and renders its own `role="status"` text from the active global language preference. Status labels are localized for waiting, incomplete inputs, completed calculation, and unavailable calculation. The template's `data-status` attribute remains unchanged for machine-readable state. Existing result content, header language/unit controls, and arithmetic are unchanged.

| Exact command/check | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS**, exit 0 | 4 files / 102 tests. The UI tests assert translated incomplete, success, and error states in Arabic/English. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npx eslint components/tools/macro-pilot.tsx lib/tools/engines/macro.v6.ts` | **PASS**, exit 0 | No diagnostics. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23 generated 395/395 pages; existing Browserslist and `metadataBase` warnings remain. |
| Local production GET `/en/smarttools/nutrition/macro`, `/ar/smarttools/nutrition/macro` | **PASS**, HTTP 200 each | Server HTML includes the localized initial status (`Waiting for inputs` / `بانتظار المدخلات`) and `data-testid="macro-status"`. The generated CSS hides the generic template's visible status only beneath `.macro-pilot_shell`. |
| Full repository Vitest | **SUPERSEDED — rerun below** | At the time this table was written, the post-change full run had not yet been run. The later rerun and its current result are recorded in “Full-suite confirmation after localization change” below. |

The earlier report statement that the visible template status remained English is superseded for Macro. Other generic-template messages and raw scenario classification tokens remain possible localization gaps; no shared template code was changed. Keyboard/screen-reader review and live profile/Supabase checks remain unverified.

## Full-suite confirmation after localization change — 2026-10-26

The post-change full suite was rerun with `npx vitest run --reporter=json --outputFile=$report` (`$report` = `%TEMP%\mrx-full-suite-20261026-recheck.json`). It exited 1: 1,538 suites (1,520 passed, 18 failed) and 4,590 tests (4,567 passed, 18 failed, 5 skipped). The same eight payment/checkout and local Tool 034 paths fail as in the preceding baseline; no Macro test failed. A targeted run of the seven payment/checkout files reproduced 16 failures; the seven test files and relevant tracked payment implementation files are unchanged from `HEAD`, establishing these failures against the tracked baseline in the current environment. The integration failures report a missing GLOBAL Fourthwall digital product mapping; other payment assertions are out of alignment with current merchant, gateway-mock, and receipt contracts. Two Tool 034 DOM failures concern an untracked local test and a locally modified component expecting older copy; their origin cannot be determined, and neither file was changed. One additional static security assertion appeared in an initial run but passed both its isolated rerun and the latest full rerun, so it is recorded as non-reproduced rather than a confirmed regression. The recurring full-suite failures still prevent a repository-wide PASS and keep the gate **NOT READY**. No out-of-scope payment, Tool 034, database, migration, commit, push, or deployment change was made.

After adding Tool 147 API boundary tests, the full suite was run again: `npx vitest run --reporter=json --outputFile=$report` with `$report` set to `%TEMP%\mrx-full-suite-20261026-after-tool147-api-tests.json` — **FAIL**, exit 1; 1,542 suites (1,524 passed, 18 failed), 4,599 tests (4,576 passed, 18 failed, 5 skipped). The same 18 assertions in the same eight files fail; the 9 additional Tool 147 tests pass and no Macro or Tool 147 test failed. This is the latest full-suite evidence for the current test set. Repository status remains **NOT READY**.

## Current verification refresh — 2026-10-27

This refresh re-ran the authorized Phase 1 checks against the current checkout. No Macro source or equation was changed during this verification pass.

| Exact command/check | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS**, exit 0 | 4 files / 102 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 77 engine tests; statements 95.08%, branches 92.30%, functions 93.33%, lines 96.05%. Tooling warns that Vitest 4.1.10 and `@vitest/coverage-v8` 4.0.18 are mismatched and that `vitest/coverage` is deprecated. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npx eslint lib/tools/engines/macro.v6.ts components/tools/macro-pilot.tsx --no-warn-ignored` | **PASS**, exit 0 | No diagnostics on the scoped implementation files. |
| `npm run lint` | **PASS**, exit 0 | 0 errors, 487 warnings across the repository. Warnings were not broadly changed because they are outside this phase. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23 generated 395/395 pages. Existing stale Browserslist and missing `metadataBase` warnings remain. Build output saying Supabase is configured reflects environment configuration only; no live query was made. |
| `npx vitest run --reporter=json --outputFile="$report"` (`$report` = `%TEMP%\mrx-full-suite-20261027.json`) | **FAIL**, exit 1 | 1,596 files: 1,578 passed, 18 failed; 4,737 tests: 4,714 passed, 18 failed, 5 skipped. Sixteen failures are in seven checkout/payment suites outside Macro. Two static security assertions also failed in this full run, then the isolated `npx vitest run tests/security/securityHardeningPosture.test.ts --reporter=verbose` passed all 13 tests; those failures are non-reproduced and their cause is undetermined. No Macro test failed. |
| `git diff --check` | **FAIL**, exit 2 | Existing dirty tracked files contain trailing whitespace / blank lines at EOF (14 reported paths). No cleanup was made; these files are outside this Macro report update. Untracked files are not checked by this command. |

The 16 checkout/payment failures comprise nine integration requests returning HTTP 500 while the test scenarios require a configured GLOBAL Fourthwall product mapping; a checkout unit mock without `resolveProductMapping`; static source assertions for old InstaPay/payment-status code; a merchant test expecting three products while the current catalog contains five; and three payment-receipt assertions against older settlement/list contracts. The failing payment tests and tracked implementation paths have no local diff from `HEAD`, so these are not attributable to the Macro changes in this checkout. They remain unresolved and outside the authorized Phase 1 repair scope.

The full-suite failures, the SPEC/checkout path mismatch (`lib/engines/macro.v6.ts` is absent while the active project implementation is `lib/tools/engines/macro.v6.ts`), and the unverified browser/accessibility and live Supabase/profile checks keep the combined Phase 0/1 decision **NOT READY**. Preserve the established project path pending owner review; no compatibility alias or file move was added. No database operation, migration, commit, push, or deployment occurred.

## Verification refresh — 2026-10-27 (current checkout)

This refresh was run after reading the authoritative V3 prompt, specification, and acceptance criteria from `E:\GENIUS_INTELLIGENCE_V3_bundle\docs\GENIUS_INTELLIGENCE_V3`. No database write, migration, commit, push, deployment, or cleanup was performed.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS**, exit 0 | 4 files / 102 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS**, exit 0 | 77 tests; statements 95.08%, branches 92.30%, functions 93.33%, lines 96.05%. Vitest/coverage-v8 versions are mismatched and the runner emits a deprecation warning. |
| `npx tsc --noEmit` | **PASS**, exit 0 | No diagnostics. |
| `npx eslint lib/tools/engines/macro.v6.ts components/tools/macro-pilot.tsx --no-warn-ignored` | **PASS**, exit 0 | No scoped diagnostics. |
| `npm run lint` | **PASS**, exit 0 | 0 errors, 487 warnings. |
| `npm run validate-tools` | **PASS**, exit 0 | 1 file / 5 tests. |
| `npm run build` | **PASS**, exit 0 | Next.js 15.5.23; 413/413 pages generated. Existing Browserslist and metadataBase warnings remain. Supabase configured output is environment detection only; no live query was made. |
| `npx vitest run --reporter=dot` | **FAIL**, exit 1 | 501 files; 491 passed, 9 failed, 1 skipped; 4,748 passed, 19 failed, 5 skipped (4,772 total). Failures are checkout/payment contracts plus SmartTools catalog/search expectations using the older 162-tool count; no Macro test failed. |

### Scope and decision

The active implementation path is `lib/tools/engines/macro.v6.ts`; the SPEC's literal `lib/engines/macro.v6.ts` path is absent. The current focused Macro evidence is healthy, but repository-wide failures, unresolved Phase 0 live Supabase/profile verification, and outstanding browser/accessibility review keep the combined gate **NOT READY**. The V3 prompt still prohibits template rollout and the 252-tool rollout until owner approval. Existing local changes remain untouched.

## Current checkout recheck — 2026-10-27 (supersedes prior full-suite counts)

The full suite was rerun with `npx vitest run --reporter=json --outputFile="$report" --silent`, where `$report` was `%TEMP%\mrx-full-vitest-20261027-0953.json`. Result: **FAIL**, exit 1; 1,621 suites (1,605 passed / 16 failed), 4,804 tests (4,783 passed / 16 failed / 5 pending). The failures are in seven checkout/payment files listed in the failure triage above.

A full run during this continuation had two additional failures caused by prior out-of-scope Tool 002 changes: one registry title expectation and one shared engine-safety assertion. Both assertions were updated for the current unassessed result; a focused rerun passed 51/51 across four files, and neither fails in the current full run.

Current supporting checks: `npx tsc --noEmit` **PASS / 0**; `npm run lint` **PASS / 0**, 475 warnings; focused Tool 002/006 tests **PASS / 0**, 74 tests; `npm run validate-tools` **PASS / 0**, 5 tests; `npm run build` **PASS / 0**, Next.js generated 502/502 pages. Existing Browserslist and `metadataBase` warnings remain. No live Supabase query was attempted.

Git at this recheck: branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`; `git status --short` counted 1,389 rows and full porcelain status counted 1,518 paths; index empty. **Scope correction:** prior continuation turns left Tool 002 and Tool 006 implementation/report changes in the dirty worktree, outside the current V3 prompt's Phase 0/Macro v6 implementation boundary. They were not reverted because the checkout contains extensive pre-existing user changes and no safe clean snapshot for whole-file restoration. The two test expectation updates in this continuation are also scope deviations needed to remove regressions from those changes. No Macro engine source changed in this recheck. Owner review is required; the gate remains **NOT READY**. No database write, migration, commit, push, or deployment was performed.

Macro-only regression and coverage were rerun after this checkout update: the four-file engine/adapter/pilot/route suite passed **102/102**, and the engine-only coverage command passed **77/77** with 95.08% statements, 92.30% branches, 93.33% functions, and 96.05% lines. The runner warns that Vitest 4.1.10 and coverage-v8 4.0.18 are mismatched and that the coverage import is deprecated. The 16 full-suite failures remain a repository-wide **FAIL**; passing Macro coverage does not clear that gate.

## Macro v6 schema/catalog contract correction and current verification — 2026-10-27

This update supersedes the earlier Tool 1 audit statement that the catalog/schema mismatch remained unresolved. The existing Macro catalog row now declares the active V6 pilot, engine, and schema at `lib/tools/smartToolsCatalog.ts:41`. A dedicated strict Zod contract exists at `lib/tools/schemas/macro.v6.ts:1-87`; it validates canonical kg/cm inputs and the V6 ranges, rejects unsupported recomposition, enforces relevant cross-field constraints, and has a partial form-state contract. `lib/tools/engines/macro.v6.ts:16,226-250` uses these schemas before computation and maps schema issues into the engine validation contract. The legacy `lib/tools/schemas/macro.ts` remains unchanged for legacy consumers. This corrects metadata/schema alignment without changing the tool ID, slug, route, or equation.

The adjacent engine suite now tests complete and partial schema behavior, rejection of underage/recomposition/unknown-field inputs, and agreement between schema parsing and engine validation (`lib/tools/engines/macro.v6.test.ts:45-53`). This is a V6 contract test, not evidence that every consumer of the legacy schema has migrated.

| Exact command/check | Current result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS / exit 0** | 4 files, 103 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS / exit 0** | 78 tests; statements 95.19%, branches 90.86%, functions 93.18%, lines 95.93%. Tooling warns Vitest 4.1.10 and coverage-v8 4.0.18 differ and that the coverage import is deprecated. |
| `npx tsc --noEmit` | **PASS / exit 0** | No diagnostics. |
| `npx eslint lib/tools/schemas/macro.v6.ts lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts lib/tools/smartToolsCatalog.ts --no-warn-ignored` | **PASS / exit 0** | No diagnostics. |
| `npm run validate-tools` | **PASS / exit 0** | 1 file, 5 tests. |
| `npm run lint` | **PASS / exit 0** | 0 errors, 475 repository warnings. |
| `npm run build` | **PASS / exit 0** | Next.js 15.5.23 compiled and generated 502/502 pages. Existing stale Browserslist and missing `metadataBase` warnings remain. Supabase environment detection in build output is not a live connectivity check. |
| `npx vitest run --reporter=json --outputFile="$report" --silent` (`$report` = `%TEMP%\mrx-full-vitest-20261027-current-macro-schema.json`) | **FAIL / exit 1** | 1,622 suites: 1,606 passed / 16 failed; 4,805 tests: 4,784 passed / 16 failed / 5 pending. No Macro test failed. Failures remain outside the Macro paths in seven checkout/payment suites: checkout country routing (8 HTTP 500 assertions), Kashier delegation (1 HTTP 500), checkout-service mock missing `resolveProductMapping`, InstaPay and payment-status static expectations against different source contracts, merchant resolver expecting 3 products while the local catalog has 5, and three receipt API contract assertions (400/409/500 instead of 200). Exact JSON evidence is in the stated temp report. All seven failing test files and `server/payments/checkout/checkoutSessionService.ts` match `HEAD` (`git diff --quiet HEAD -- <paths>` exit 0). This shows the failures are present against the tracked implementation at this checkout; it does not establish when they were introduced historically. |

The generated `.next/server/app-paths-manifest.json` contains both `/macro/page` and `/smarttools/nutrition/macro/page`; this verifies the existing legacy and canonical Macro page entries in this local build only.

### Full-suite failure triage and next action

- `tests/integration/checkoutCountryRouting.test.ts` (8 failures) and `tests/integration/createInvoiceKashierDelegation.test.ts` (1 failure): the assertions expect successful GLOBAL requests with only Kashier variables configured. Current `checkoutSessionService.ts:384-414` routes GLOBAL checkout to Fourthwall and requires a real product mapping; `FourthwallGateway` also requires its credentials and deliberately fails closed without a verified product mapping. The fixtures do not provide those `FOURTHWALL_*` values/mappings. These tests therefore do not currently exercise a configured GLOBAL checkout; deployed configuration was not inspected. Impact: global checkout availability is not demonstrated by the suite. Status: existing integration-contract/configuration mismatch against tracked source; no payment changes are authorized in this phase.
- `tests/unit/checkoutSessionService.test.ts` (1 failure): its injected Fourthwall test double omits `resolveProductMapping`, which the current GLOBAL branch calls at `checkoutSessionService.ts:412`; the test throws `TypeError` before it reaches its intended assertions. Impact: that mocked service path is unverified. Status: test-double defect relative to tracked implementation.
- `tests/unit/instapayPreservationLock.test.ts` and `tests/unit/orderProducersStatusContract.test.ts` (2 failures): both assert that specific status assignments appear inline in route source text. The current test output proves those string assertions fail, not that the endpoint behavior is incorrect; this static-test evidence is insufficient to certify runtime status preservation. Impact: behavior needs a runtime contract test or an explicitly maintained source contract. Status: unresolved static-test/source-contract mismatch; owner approval is required before payment-scope remediation.
- `tests/unit/merchantResolver.test.ts` (1 failure): the test expects exactly three canonical products while the checked-out `server/payments/merchantResolver.ts` declares five. Impact: the test and current catalog disagree about supported products; no product was removed. Status: expectation/requirements discrepancy requiring product-owner review.
- `tests/unit/paymentReceiptsAdmin.test.ts` (3 failures): verification/rejection/list fixtures receive 400, 409, and 500 where they expect 200. The JSON failures alone do not establish whether the API contract, authorization/state-transition preconditions, or mocks are wrong; no endpoint was changed or run against a database. Impact: those admin receipt flows are not verified by the current suite. Status: unresolved; inspect the current endpoint contract and fixture setup under a separately authorized payment scope.

No failing file was repaired because all are outside the authorized Phase 0/Macro v6 scope. Next action for the overall gate is owner review of these payment test/contract discrepancies and the remaining live Supabase/profile/accessibility evidence; no rollout should begin until the V3 gate is explicitly approved.

Current Git snapshot after these checks: branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`, 1,520 full porcelain paths and 0 staged paths. The checkout remains extensively dirty; no unrelated working-tree paths were changed by this update. No database query/write, migration, commit, push, or deployment occurred. The phase decision remains **NOT READY**: the repository-wide suite still fails, live Supabase/profile behavior and browser accessibility remain unverified, and the SPEC's literal engine path `lib/engines/macro.v6.ts` differs from the active project path `lib/tools/engines/macro.v6.ts` pending owner review.

## Macro What-If UI coverage follow-up — 2026-10-27

Review of the V3 acceptance criteria against the current Macro UI found that the engine already enforced bounded What-If changes for weight, activity factor, and TDEE, while the pilot rendered only the weight slider. The pilot now provides a localized dimension selector and a bounded slider for all three engine-supported dimensions. Weight continues to convert through the global metric/imperial preference; activity factor remains dimensionless and is bounded to 1.2–1.9; TDEE remains bounded by the selected BMR × 1.2–1.9 range. These are deterministic arithmetic scenarios and do not change the base inputs or equation. No food/grams scenario was added because this Macro calculator accepts no food or serving-size input; such a scenario would not describe its calculation.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/bodyfat-to-macro.test.ts app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS / exit 0** | 4 files / 105 tests. Includes bounded weight UI regression, activity-factor bounds and arithmetic result, TDEE range/result, Arabic labels/RTL integration, existing unit conversion and engine tests. |
| `npx tsc --noEmit` | **PASS / exit 0** — no diagnostics. |
| `npx eslint components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx --no-warn-ignored` | **PASS / exit 0** — no diagnostics. |
| `npm run build` | **PASS / exit 0** | Next.js 15.5.23 compiled and generated 502/502 pages. Existing stale Browserslist and missing `metadataBase` warnings remain; build reported Supabase environment configuration but did not query a live database. |

This follow-up changes only `components/tools/macro-pilot.tsx`, `components/tools/macro-pilot.test.tsx`, and this report. The full repository suite, coverage, browser accessibility, live Supabase/profile behavior, and human phase approval were not repeated by this UI-only follow-up; the latest applicable results and outstanding limitations are listed above. Phase decision remains **NOT READY**.

### Full repository regression refresh after What-If selector — 2026-10-27

The full suite was rerun after the Macro UI change with `npx vitest run --reporter=dot`: **FAIL / exit 1**; 510 files (502 passed, 7 failed, 1 skipped), 4,808 tests (4,787 passed, 16 failed, 5 skipped). All 16 failures are in the same seven checkout/payment files documented in the Phase 0 audit; no Macro or SmartTools catalog test failed. Each failing test file and `server/payments/checkout/checkoutSessionService.ts` was checked with `git diff --quiet HEAD -- <path>` and returned exit 0, confirming those paths match current HEAD. This does not establish their historical introduction date. No payment file was changed.

The Macro focused 4-file/105-test suite, TypeScript check, scoped ESLint, and production build/502-page generation remain PASS as recorded in the preceding section. Coverage was not rerun because the What-If change affects only the pilot UI and its DOM tests, not the engine file included in the coverage command. The full repository gate remains **NOT READY** due to these 16 failures; live Supabase/profile verification, manual browser/accessibility review, and owner approval also remain outstanding. No tool rollout, database operation, migration, commit, push, or deployment occurred.

### TDEE slider-step round-trip follow-up — 2026-10-27

The earlier regression covered the rounded TDEE slider endpoints. This follow-up adds an engine test that exercises each 10 kcal/day increment produced by the TDEE slider for the fractional-BMR case (rounded BMR 1,841 kcal/day), and asserts that both the calculated TDEE and the reported What-If input change equal the displayed requested value. The existing endpoint checks remain separate because the upper bound can fall off the 10 kcal step grid. This verifies the control's configured increments and endpoints; it does not claim round-trip identity for every arbitrary integer passed directly to the engine.

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.test.ts components/tools/macro-pilot.test.tsx app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS / exit 0** | 4 files / 106 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS / exit 0** | 79 engine tests; 95.19% statements, 90.86% branches, 93.18% functions, 95.93% lines. Vitest 4.1.10 with coverage-v8 4.0.18 emits a version mismatch warning and the coverage import is deprecated. |
| `npx tsc --noEmit` | **PASS / exit 0** | No diagnostics. |
| `npx eslint lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx --no-warn-ignored` | **PASS / exit 0** | No diagnostics. |
| `git diff --check -- lib/tools/engines/macro.v6.test.ts docs/MACRO_V6_ENGINE_REPORT.md docs/GENIUS_TOOL_STANDARD_V3.md docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md` | **PASS / exit 0** | No whitespace errors in these paths. |

This follow-up changes only the Macro engine test and evidence reports; the calculation engine and UI source are unchanged. Production build was not rerun in this test-only follow-up. The full repository result has since been refreshed below. Overall phase decision remains **NOT READY**; no Supabase operation, migration, commit, push, deployment, template, or tool rollout occurred.

### Current full-suite rerun after Macro TDEE grid regression — 2026-10-27

`npx vitest run --reporter=dot` — **FAIL / exit 1**; 510 test files: 502 passed, 7 failed, 1 skipped; 4,809 tests: 4,788 passed, 16 failed, 5 skipped. The focused rerun of the seven failing files also **FAIL / exit 1**, with 16 failures and 88 passes among 104 tests. The failures remain in checkout/payment contracts; no Macro test failed. The added Macro regression explains the one-test increase from the preceding full-suite result.

All seven failing test files and `server/payments/checkout/checkoutSessionService.ts` returned exit 0 for `git diff --quiet HEAD -- <path>`, meaning these paths match tracked HEAD at this checkout. This supports that the observed failures are not caused by tracked local edits to those files; it does not establish their historical introduction date or verify production payment configuration. Existing triage remains: GLOBAL checkout tests lack Fourthwall product mappings; one service test double omits `resolveProductMapping`; payment-preservation/static source assertions mismatch current code; merchant resolver test expects three products while source declares five; receipt API fixtures/contracts return 400/409/500 instead of expected 200. Payment remediation remains outside the authorized Phase 0/Macro scope. Overall decision remains **NOT READY**.

### Macro activity sensitivity quantization correction — 2026-10-27

The activity sensitivity finite difference previously used Δactivity = 0.01 while TDEE is rounded to an integer. A read-only probe measured a TDEE derivative of 1,800 versus BMR 1,840 for the typical male fixture, and 800 versus BMR 835 at the lower-bound fixture. Changing the finite-difference step to 0.05—the same increment exposed by the activity What-If slider—reduced those errors to 0 and 5 kcal/day per factor unit, respectively. This adjusts only the numerical sensitivity probe, not the BMR/TDEE equations or their input ranges. The report remains PARTIAL because the result is still a local finite difference over rounded outputs, not a statistical or causal estimate.

The regression checks activity sensitivity at both configured bounds and expects the TDEE derivative to match the BMR for the representative fixture. Reverified results:

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.test.ts components/tools/macro-pilot.test.tsx app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS / exit 0** | 4 files / 108 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS / exit 0** | 81 tests; 95.19% statements, 90.86% branches, 93.18% functions, 95.93% lines. Vitest 4.1.10 and coverage-v8 4.0.18 are mismatched; the coverage import is deprecated. |
| `npx tsc --noEmit` | **PASS / exit 0** | No diagnostics. |
| `npx eslint lib/tools/engines/macro.v6.ts lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.tsx components/tools/macro-pilot.test.tsx --no-warn-ignored` | **PASS / exit 0** | No diagnostics. |
| `npm run validate-tools` | **PASS / exit 0** | 1 file / 5 tests. |
| `npm run lint` | **PASS / exit 0** | 0 errors / 474 warnings across the repository. |
| `npm run build` | **PASS / exit 0** | Next.js 15.5.23 compiled and generated 502/502 pages. Existing Browserslist and `metadataBase` warnings remain; Supabase environment messages do not prove a live query. |
| `npx vitest run --reporter=json --outputFile=$reportPath --silent` (`$reportPath` = `%TEMP%\mrx-full-vitest-20261027-macro-sensitivity.json`, PowerShell) | **FAIL / exit 1** | 510 files: 502 passed, 7 failed, 1 skipped; 4,811 tests: 4,790 passed, 16 failed, 5 pending. All 16 failures remain in the seven checkout/payment files above; no Macro test failed. The JSON also reports 1,622 nested suite nodes; that is not the test-file count. |

The full-suite file-status count was reconciled from `testResults` rows in the JSON artifact: 510 result rows, with seven failed files, one skipped-only file, and 502 passing files. All seven failed files and `server/payments/checkout/checkoutSessionService.ts` match `HEAD` (`git diff --quiet HEAD -- <path>` exit 0). This does not establish historical introduction or deployed payment configuration. Overall status remains **NOT READY**. No payment code, database, migration, commit, push, deployment, or tool rollout was changed.

### Current Macro v6 focused recheck — 2026-10-27

Re-ran checks against the current worktree after the latest audit continuation:

| Exact command | Result | Evidence |
|---|---|---|
| `npx vitest run lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.test.ts components/tools/macro-pilot.test.tsx app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` | **PASS / exit 0** | 4 files / 108 tests. |
| `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` | **PASS / exit 0** | 81 tests; 95.19% statements, 90.86% branches, 93.18% functions, 95.93% lines. Vitest 4.1.10 and coverage-v8 4.0.18 are mismatched; the coverage import is deprecated. |
| `npx tsc --noEmit` | **PASS / exit 0** | No diagnostics. |

No Macro source changed during this recheck, so the production build was not repeated. The most recent full-suite run remains **FAIL** with 16 checkout/payment failures in seven files; this focused pass does not change the overall **NOT READY** decision. No database operation, migration, commit, push, or deployment occurred.
### Current Phase 0 / Macro verification continuation — 2026-10-27

- Current Macro-focused rerun: `npx vitest run lib/tools/engines/macro.v6.test.ts lib/tools/adapters/bodyfat-to-macro.test.ts components/tools/macro-pilot.test.tsx app/smarttools/nutrition/macro/page.test.tsx --reporter=dot` — **PASS / exit 0**, 4 files / 108 tests. No Macro source changed in this continuation.
- The local Supabase profile preference contract was rechecked read-only. The client selects and updates `profiles.unit_system`, but a repository-wide search of `supabase/migrations`, `supabase/migrations_prebaseline`, and `supabase/schema.sql` finds `unit_system` only in the unrelated `user_tool_logs` table. Supabase CLI and connection environment variables are absent, so live schema/RLS behavior remains **NOT VERIFIED**. Details and exact commands are recorded in the latest addendum of `docs/GENIUS_TOOL_V3_BASELINE_AUDIT.md`.
- No database query/write, migration, code/schema modification, commit, push, or deployment occurred. Overall Phase 0/Macro decision remains **NOT READY** because the repository-wide test gate, live profile/RLS verification, manual browser accessibility, and owner gate review remain open.
### Macro checkpoint revalidation — current checkout gate update (2026-10-27)

Focused Macro verification remains **PASS**: the four-file engine/adapter/pilot/canonical-route suite passed 108/108; `npm run validate-tools` passed 5/5; and scoped ESLint over the Macro engine, adapter, pilot and route files exited 0 with no diagnostics. `npx tsc --noEmit` currently **FAILS / exit 1** outside Macro at `lib/legacy-routes.ts:8`: the `Record<Page, string>` map lacks `bmr-tdee`, `protein-needs`, and `water-intake`, which are present in the dirty `Page` enum. The route/types edits are outside the currently authorized Macro-only implementation boundary; they were left unchanged. `npm run build` was **NOT RUN** after the TypeScript failure. The existing full-suite result remains FAIL with 16 payment/checkout failures in seven files; it was not rerun in this checkpoint. This failure provenance and required separate route-scope decision are recorded in the baseline audit. Macro remains **NOT READY** for the next phase; no database, migration, commit, push, or deployment occurred.
Macro engine coverage was also rerun on the current checkout: `npx vitest run lib/tools/engines/macro.v6.test.ts --coverage.enabled --coverage.provider=v8 --coverage.include=lib/tools/engines/macro.v6.ts --coverage.reporter=text` — **PASS / exit 0**, 81 tests; statements 95.19%, branches 90.86%, functions 93.18%, lines 95.93%. The runner reports the existing Vitest 4.1.10 / coverage-v8 4.0.18 mismatch and deprecated coverage import. This coverage result does not clear the current TypeScript or full-suite failures.
Full-project lint was rerun after the current Phase 0 checkpoint: `npm run lint` — **PASS / exit 0**, 0 errors and 474 warnings. No autofix was used; warnings span existing application, archived, and temporary files and are not treated as resolved by this pass.
`npm run build` was subsequently run against this checkout — **FAIL / exit 1**. Next.js compilation succeeded, but its TypeScript validation failed at `lib/legacy-routes.ts:8` for the same missing three `Page` keys; static generation did not complete. This prevents claiming a fresh production build for Macro even though the focused Macro tests, coverage, and scoped lint pass. Existing Browserslist data warning was emitted. No code change was made in response because the failing route/type files are outside this phase's authorized edit scope.

### Latest quality-gate recheck — 2026-10-27

Current results are summarized in the final “Latest full quality-gate recheck” table of `GENIUS_TOOL_V3_BASELINE_AUDIT.md`. Specifically, Macro focused tests pass 108/108, engine coverage passes 81/81 at 95.19% statements and 90.86% branches, `validate-tools` passes 5/5, scoped ESLint passes without diagnostics, and full `npm run lint` passes with 0 errors / 474 warnings. `npx tsc --noEmit` and `npm run build` both fail on the same three missing `Page` keys in `lib/legacy-routes.ts`; full Vitest remains FAIL based on the last saved run (16 payment/checkout failures in seven files; not rerun in this checkpoint). Live Supabase profile/RLS and browser accessibility remain unverified. The Macro / Phase 0 exit status is **NOT READY**. No application source, database, migration, commit, push, or deployment change was made.
