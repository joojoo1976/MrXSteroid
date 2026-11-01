# GENIUS_TOOL_STANDARD_V3.md

**Status:** `PARTIAL — LOCAL DIRTY WORKTREE REVIEWED; NOT RELEASE-VERIFIED`  
**Purpose:** Evidence-derived reference standard for Tool 111. This document is not a declaration that Tool 111 satisfies every V3 requirement, and it is not evidence of a local build or live runtime pass.

## 1. Evidence provenance and limitations

The historical sections below record an earlier GitHub snapshot review. They are superseded where they conflict with the local-checkout evidence in section 9. The current inspection was performed in `E:\MrXSteroid-main` on branch `main`, HEAD `254ce1299bff227c54809bb7027f9b587d69c143`. The worktree is heavily modified and untracked; these findings describe that current dirty worktree, not a clean checkout or deployed production.

## 2. Tool 111 verified layer map

| Layer | Evidence | Observed responsibility | Status |
|---|---|---|---|
| Route/page | [`app/smarttools/tool-111-smart-food-macro-substitution/page.tsx` lines 1–20](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/app/smarttools/tool-111-smart-food-macro-substitution/page.tsx#L1-L20) | A thin client page renders the Tool 111 component. Its own source comment explicitly says there is no Supabase/RLS or AI integration on this page. | `VERIFIED IN REMOTE SOURCE` |
| UI component | [`components/tools/tool-111-smart-food-macro-substitution.tsx` lines 99–183](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/components/tools/tool-111-smart-food-macro-substitution.tsx#L99-L183) | Owns form state, UI status (`idle`, `validating`, `error`, `success`), validation errors, calculation dispatch, result state, adapter failure state, and reset behavior. | `VERIFIED IN REMOTE SOURCE` |
| Input/schema boundary | [`lib/tools/schemas/tool-111-smart-food-macro-substitution.ts` lines 1–151](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/lib/tools/schemas/tool-111-smart-food-macro-substitution.ts#L1-L151) | Zod schema and parse helpers are the input validation boundary; the component calls `tryParseTool111Input` before executing the adapter. | `VERIFIED IN REMOTE SOURCE` |
| Pure calculation engine | [`lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts` lines 1–20, 122–153, 184–223, 430–505, 534–645](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts#L1-L20) | Defines food/macro/unit types, conversion and defensive math helpers, macro calculations, equivalence logic, warnings, limitations, and substitution calculation. Its header describes it as pure and without React, DOM, Supabase, Date, or I/O. | `VERIFIED IN REMOTE SOURCE; NOT EXECUTED HERE` |
| Output adapter | [`lib/tools/adapters/tool-111-smart-food-macro-substitution.ts` lines 215–309](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/lib/tools/adapters/tool-111-smart-food-macro-substitution.ts#L215-L309) | Uses Registry-derived identity, builds a `ToolOutput`, provenance, key findings, SEO links, schema boundary, and adapter contract. | `VERIFIED IN REMOTE SOURCE; PERSISTENCE NOT PROVEN BY THIS ADAPTER ALONE` |
| Unit tests | [`tests/unit/tool-111-smart-food-macro-substitution-engine.test.ts`](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/tests/unit/tool-111-smart-food-macro-substitution-engine.test.ts) | Source includes grouped cases for safety helpers, macro calculations, equivalence, deltas, adherence, units, and engine behavior. A prior in-repo report records 127/127 engine tests, but that historical result was not re-run in this pass. | `SOURCE PRESENT; CURRENT RUN NOT RUN` |
| DOM tests | [`components/tools/tool-111-smart-food-macro-substitution.dom.test.tsx`](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/components/tools/tool-111-smart-food-macro-substitution.dom.test.tsx) | Contains tests for English/LTR, Arabic/RTL, calculation/result display, validation, and provenance. Current run not performed. | `SOURCE PRESENT; CURRENT RUN NOT RUN` |

## 3. Features actually observed

| ID | Capability | Evidence | Assessment |
|---|---|---|---|
| T111-01 | Component boundary and route wiring | Page imports and renders the component at page lines 12–18. | Present |
| T111-02 | Form data state | Component lines 103–108. | Present; `output` is typed `any` at line 107 and is a typing-quality issue to track, not modify in this read-only pass. |
| T111-03 | Validation flow | Component lines 130–173; Zod parse helpers in schema lines 107–120. | Present in source |
| T111-04 | Explicit calculation and reset actions | Component lines 130–192 and 442–450. | Present in source |
| T111-05 | Unit-system toggle | `MeasurementToggle` imported/rendered in component lines 5 and 224. | Present in source; conversion correctness across the full UI not run here |
| T111-06 | Arabic/English direction | Component sets `dir` and `lang` at lines 219–224. | Present in source; no browser-based validation in this pass |
| T111-07 | Food/macro data input | Component form fields start around lines 229 onward and include food names, categories, source/quality, macro profiles, quantities and units. | Present in source |
| T111-08 | Unit conversion and defensive numeric helpers | Engine lines 122–153 and 184–200. | Present in source; mathematical correctness not re-tested here |
| T111-09 | Substitution/equivalence calculation | Engine lines 217 onward and `computeSubstitution` at line 561. | Present in source; mathematical correctness not re-tested here |
| T111-10 | Key findings | Component lines 460–478; adapter builder is at adapter lines 112 onward. | Present in source |
| T111-11 | Warnings and limitations | Component lines 510–552; engine helpers include `generateWarnings` and `generateLimitations`. | Present in source |
| T111-12 | Data provenance display | Component lines 554–575; adapter provenance builder starts at line 78. | Present in source |
| T111-13 | Localized copy | Uses `useToolI18n` and the Tool 111 JSON at component lines 3–4, 99–101. | Present in source; translation completeness not independently audited |
| T111-14 | Registry-driven identity and SEO links | Adapter lines 227–252 uses `requireTool` and `buildSeoLinks`. | Present in source |

## 4. Capabilities not established by the inspected Tool 111 implementation

The following must not be assumed based on labels or the existence of adjacent platform infrastructure:

- A real AI/ML prediction for Tool 111: **not established**. The page source explicitly documents no AI integration, and the component has no `AIInsightPanel` import or invocation in the inspected source.
- Tool-specific Supabase persistence or successful RLS behavior: **not established** by the Tool 111 page/component. The adapter creates a result envelope; that is not equivalent to proving a persisted write succeeded.
- `EMPTY | PARTIAL | FULL` macro-engine states: the inspected component UI state is `idle | validating | error | success`; the V3 Macro v6 contract is a separate requirement.
- What-If scenarios, sensitivity ranking, cross-tool freshness checks, voice, Vision, export/import, onboarding, interactive charts, or measured coverage above 80%: **not established** for this Tool 111 implementation from the inspected source.
- Production DB/RLS state: **not established**; only repository SQL files were reviewed.

## 5. Baseline risks to preserve for later review

1. The component's `output` state is `any` (`components/tools/tool-111-smart-food-macro-substitution.tsx:107`), despite the V3 preference for strong types.
2. The adapter file's header says timestamps are injected, but the generic `buildOutput` function uses `new Date().toISOString()` at lines 282–294. This is not a claim that the pure calculation engine is impure; it is a consistency item for adapter review.
3. The component maps empty macro strings to numeric zero in `toMacroProfile` (lines 90–96); the current UI checks completeness before calculation (lines 136–143), but direct adapter/schema entry points still warrant boundary tests.
4. This audit is a remote snapshot, not the owner's local checkout. Do not edit the corresponding files based solely on these notes.

## 6. Applicability matrix for the V3 architecture

The submitted V3 SPEC names several example domains but does not enumerate the complete 14 approved category names. The remote repository's current category registry contains 10 slugs, not 14; see [`lib/tools/categories.ts` lines 7–18](https://github.com/joojoo1976/MrXSteroid/blob/936e996a84b1a417f57946abb216eac57f2e4d85/lib/tools/categories.ts#L7-L18). To avoid inventing four category names, the remaining mappings are explicitly unresolved.

| Domain/area named in the V3 SPEC | Macro v6 applicability | Rule |
|---|---|---|
| Nutrition | Direct | Macro formulas, food amount scenarios, unit conversion and macro consistency belong here. |
| Body composition | Limited/indirect | May provide a separate input only if approved; do not silently substitute body-composition models for Macro v6 formulas. |
| Training | Contextual only | Activity factor may be an explicit input; do not infer training data. |
| Recovery | Not core to Macro v6 | Keep recovery calculations in a separate engine and contract. |
| Hormones | Not core to Macro v6 | No hormone or medication inference from macro calculations. |
| Bloodwork | Not core to Macro v6 | No interpretation of lab markers in Macro v6. |
| Pharmacokinetics | Not core to Macro v6 | Separate domain and safety requirements apply. |
| Approved domains 8–14 | `BLOCKED — NAME LIST NOT PROVIDED` | Do not invent official category names or slugs. Reconcile against the owner-approved taxonomy before rollout. |

## 7. V3 principles that every future implementation must enforce

- Deterministic pure calculations separated from UI, storage and network.
- Explicit source classification (`CALCULATED`, `RULE_BASED`, `STATISTICAL_ESTIMATE`, `MODEL_PREDICTION`, `USER_PROVIDED`, `CROSS_TOOL_DERIVED`, `NOT_AVAILABLE`) where applicable.
- No fabricated source, confidence, predictions, model, coverage, test results or successful save claims.
- Finite-number checks, missing/partial input states, dimensional unit validation and no double conversion.
- A documented negative/impossible macro policy; never render `NaN`/`Infinity` as a valid result.
- What-If and sensitivity outputs must expose assumptions and must not imply causality from a mathematical scenario.
- Accessible AR/EN, RTL/LTR behavior without creating duplicate shared header/footer or preference systems.
- Database and production remain read-only unless separately approved; schema files are not proof of live DB state.

## 8. Acceptance status

This standard is a **partial evidence-derived reference**, not a claim of full V3 compliance. See the local evidence and blockers below. It does not authorize the next phase.

## 9. Current local-checkout evidence — 2026-10-25

The following statements supersede the corresponding historical remote-snapshot notes above.

| Capability / surface | Current local evidence | Status |
|---|---|---|
| Legacy page route | `app/smarttools/tool-111-smart-food-macro-substitution/page.tsx:1-6` permanently redirects to `/smarttools/nutrition/tool-111-smart-food-macro-substitution`; it no longer renders the tool directly. | `COMPLETE` for redirect only |
| Canonical registry identity | `lib/tools/registry.ts:152`, `lib/tools/categories.ts:186`, and `lib/legacy-routes.ts:179` retain Tool 111 identity and the nutrition route. | `COMPLETE` for identity evidence |
| Form and calculation dispatch | `components/tools/tool-111-smart-food-macro-substitution.tsx:96-180` owns form/result/error state, parses before execution, calls `tool111Adapter.execute`, and handles success/error/reset. | `PARTIAL` |
| Input schema | `lib/tools/schemas/tool-111-smart-food-macro-substitution.ts:48-119` uses strict Zod objects, finite non-negative macro inputs, bounded positive quantity, enum units/locales, and parse/safeParse helpers. | `COMPLETE` for declared boundary; end-to-end coverage is partial |
| Calculation engine | `lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine.ts:561-680` validates inputs and computes unit conversion, macro equivalence/deltas, optional target adherence, warnings and limitations. | `PARTIAL`: calculation code is present, but the function also reads clock/performance values at lines 563, 617, and 620, so it is not strictly pure or fully deterministic as specified |
| Provenance/confidence | `lib/tools/adapters/tool-111-smart-food-macro-substitution.ts:90-100` assigns fixed `0.9`/`0.8` confidence and labels non-manual data as a “simulated model estimate”; no model execution or calibrated confidence source is established. | `UI_ONLY` — the value/label is surfaced, but its validity is unsupported |
| Persistence | The adapter header at `lib/tools/adapters/tool-111-smart-food-macro-substitution.ts:7-10` claims a shared commit path, but the inspected component calculation flow calls only `tool111Adapter.execute` (`components/tools/tool-111-smart-food-macro-substitution.tsx:171-179`). No save/commit/network invocation was found in that flow. | `MISSING` in the inspected Tool 111 execution path |
| Genuine AI/ML | No AI/model call is present in the inspected Tool 111 component, engine, or adapter execution path. The “simulated model estimate” string is not evidence of AI. | `MISSING` |
| Browser / accessibility | No manual browser or assistive-technology audit was performed in this review. | `NOT_VERIFIED` |

### Current focused verification

- `npx vitest run lib/tools/engines/macro.v6.test.ts components/tools/macro-pilot.test.tsx lib/tools/adapters/tool-111-smart-food-macro-substitution.test.ts components/tools/tool-111-smart-food-macro-substitution.dom.test.tsx components/tools/tool-111-smart-food-macro-substitution.integration.test.tsx` — `PASS`, 5 files / 132 tests.
- `npx vitest run lib/tools/adapters/tool-111-smart-food-macro-substitution.test.ts components/tools/tool-111-smart-food-macro-substitution.dom.test.tsx components/tools/tool-111-smart-food-macro-substitution.integration.test.tsx` — `PASS`, 3 files / 52 tests.
- Current working-tree-wide tests and quality gates are recorded in the baseline audit and Macro v6 report. Focused test success does not cancel their failures or establish production behavior.

### Tool 111 issues to carry forward

1. `components/tools/tool-111-smart-food-macro-substitution.tsx:104` types output state as `any`.
2. The engine includes wall-clock and performance metadata in its result (`...engine.ts:563,617,620`), contrary to the strict pure/deterministic engine requirement.
3. Fixed confidence values and “simulated model estimate” provenance are unsupported by a real model or a calibrated evidence source (`...adapter.ts:90-100`).
4. The adapter's documented snapshot commit path is not invoked by the inspected Tool 111 UI calculation path; a successful result is not evidence of persisted data.
5. Full project quality gates fail in unrelated current-tree payment/checkout suites, and browser/accessibility review remains unperformed.

The current V3 decision remains **`NOT READY`** for a subsequent rollout phase. All pre-existing local changes must be preserved; this audit did not stage, commit, push, deploy, or write to Supabase.
