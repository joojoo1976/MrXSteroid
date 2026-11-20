# PHASE — MACRO V4 FULL CAPABILITY COMPLIANCE AUDIT

Project: MrXSteroid Genius Intelligence V4.0  
Tool audited: Macro Calculator (`mrx.tool.macro`, slug `macro`)  
Route audited: `/ar/smarttools/nutrition/macro` and `/en/smarttools/nutrition/macro`  
Date: 2026-11-05  
Mode: **REPORT ONLY — NO APPLICATION FILES MODIFIED**  
Audit question: Is Macro a fully integrated V4 capability, or only a bounded V4 pilot integration?

## Executive verdict

**Macro is not yet a fully V4-compliant SmartTool. It is a successful, bounded Macro V4 pilot integration.**

The calculation engine remains authoritative and materially improved by an additive V4 shell/adapter path. The Arabic localized route renders a V4 shell, the adapter is connected to Macro V6, and current regression/build gates pass. However, full V4 capability is not yet demonstrated: there is no signed AI Capability Profile instance, no `SafetyContract` instance, no persistence layer, no audit/observability, no full pipeline state machine, no effective cross-tool context UI, no progressive expert/beginner explanation system, and no complete manual accessibility evidence.

Overall status: **PARTIAL**

This is not a failure of the pilot. It is a boundary statement: Macro is pilot-ready for owner review, not V4-complete for broad rollout or production-grade persistence/AI/full compliance claims.

No source, engine, contract, template, route, registry, catalog, Supabase, or dependency file was modified during this audit.

---

## 1. Current-session evidence

### 1.1 Verification performed

| Check | Evidence | Result |
|---|---|---|
| Arabic route | `Invoke-WebRequest http://localhost:3100/ar/smarttools/nutrition/macro` → HTTP 200, `lang="ar"`, `dir="rtl"`; browser H1 `حاسبة الماكروز V6`, status `المدخلات غير مكتملة` | PASS |
| English route | HTTP 200, same public route; browser default LTR verified during R3.1/R4 | PASS |
| V3 shell absent | Browser: `.genius-tool-template` absent | PASS |
| V4 shell present | Browser: `.genius-tool-template-v4` present | PASS |
| Engine/regression | Macro V6 81/81, Body Fat 46/46 | PASS |
| Adapter/contracts | V4 contracts 12/12, runtime 50/50, adapter 21/21 | PASS |
| Pilot/UI | Macro pilot 15/15, integration 9/9, remediation 10/10 | PASS |
| Build | Production build exit 0; `502/502` static pages | PASS |
| Lighthouse | Accessibility `0.90`; pilot-specific R4 failures absent; site-wide failures remain | PARTIAL / SITE-WIDE |

### 1.2 Existing current test commands and results

```text
npx vitest run lib/tools/engines/macro.v6.test.ts           81 passed
npx vitest run lib/tools/engines/bodyfat.v6.test.ts         46 passed
npx vitest run lib/engines/core/v4/contracts.v4.test.ts     12 passed
npx vitest run lib/engines/core/v4/runtime.v4.test.ts       50 passed
npx vitest run lib/engines/core/v4/adapter.macro.v4.test.ts 21 passed
npx vitest run components/genius-tool-template.v4.test.tsx   13 passed
npx vitest run components/tools/macro-pilot.test.tsx         15 passed
npx vitest run components/tools/macro-pilot.v4.integration   9 passed
npx vitest run components/tools/macro-pilot.remediation      10 passed
npx tsc --noEmit                                             exit 0
npm run build                                                 exit 0, 502/502
```

---

## 2. Route proof: `/ar/smarttools/nutrition/macro`

### 2.1 HTTP/browser evidence

Current-session production-server probe:

```text
URL: http://localhost:3100/ar/smarttools/nutrition/macro
HTTP: 200
HTML: contains lang="ar"
HTML: contains dir="rtl"
```

Browser-rendered evidence:

```text
url: http://localhost:3100/ar/smarttools/nutrition/macro
lang: ar
dir: rtl
h1: حاسبة الماكروز V6
localized domain status: المدخلات غير مكتملة
role="status"
aria-live="polite"
V4 shell: true
V3 shell: false
V4 shell count: 1
```

### 2.2 Integration proof

| Boundary | Current evidence | Status |
|---|---|---|
| Route renders MacroPilotTool | `app/smarttools/nutrition/macro/page.tsx` → `MacroPilotTool` | PASS |
| MacroPilotTool renders V4 shell | `components/tools/macro-pilot.tsx` imports `GeniusToolTemplateV4` (`lines 5, 369`) | PASS |
| Pilot calls Macro V6 | `calculateMacrosV6(input)` in effect (`macro-pilot.tsx:192,195`) | PASS |
| Pilot wraps output in V4 envelope | `adaptMacroV6ToV4(...)` / `adaptMacroV6UnavailableToV4(...)` / `adaptMacroV6InvalidToV4(...)` (`macro-pilot.tsx:204-229`) | PASS |
| V4 shell displays envelope metadata | `<GeniusToolTemplateV4 resultEnvelope={resultEnvelope}>` (`macro-pilot.tsx:379`) | PASS |
| Display/calculation equivalence | Integration test compares UI output directly against `calculateMacrosV6` | PASS |

### 2.3 Actual implementation boundary

The chain implemented and verified is:

```text
/ar/smarttools/nutrition/macro
→ app/smarttools/nutrition/macro/page.tsx
→ MacroPilotTool
→ calculateMacrosV6
→ Macro V4 Adapter
→ ToolResultEnvelopeV4
→ GeniusToolTemplateV4
```

This is an integration boundary, not a claim of full intelligence, personalization, persistence, or AI completion.

---

## 3. Ten Layered Intelligence Architecture audit

SPEC §2 defines ten architectural layers. Status values:

- `PASS`: implemented and evidenced to the relevant contract boundary.
- `PARTIAL`: meaningful implementation exists; material contract obligations remain.
- `FAIL`: obligation is absent.
- `NOT RUN`: not executed in this evaluation.
- `NOT APPLICABLE`: layer is explicitly unsuitable/disabled for this deterministic tool scope.

| # | Layer | Status | File/function evidence | Tests / behavioral proof | Gap and required action |
|---:|---|---|---|---|---|
| 1 | Calculation Engine | PASS | `lib/tools/engines/macro.v6.ts`: `MACRO_MATH_ENGINE` (`lines 270, 933`), `calculateMacrosV6` (`line 819`), `MACRO_MATH_ENGINE.calculate` (`line 869`) | Macro V6 81/81; adapter equivalence test; integration UI calculation matches direct engine output | None for current equation scope. Formula changes remain owner-approval-gated. |
| 2 | Validation & Rules Engine | PARTIAL | `getMissingRequiredFields` (`215`), `assessCompleteness` (`219`), `validateProvidedMacroInput` (`445`), `MACRO_MATH_ENGINE.validate` (`864`); adapter `assertValidMacroOutput` (`adapter.macro.v4.ts:279`); runtime `validateToolResultEnvelope` | Macro V6 invalid/NaN/Infinity/range tests; adapter boundary-guard tests; pilot invalid-input tests | Domain validation is strong. The generic V4 `FieldDefinition`/`FieldConstraints`/`consentScope` contract is not represented as a discrete Macro input profile; provenance/freshness/field sensitivity metadata are shallow. Add a versioned Macro field-definition profile and runtime completeness/provenance validation, only after owner approval. |
| 3 | Context Engine | PARTIAL | Engine accepts `userContext` and `linkedData` (`macro.v6.ts:801-842`); body-fat linked validation exists in the engine path; pilot does not pass context/linked data; envelope `contextUsed: []` (`adaptV6ToV4Envelope` call sites) | No pilot cross-tool integration test; adapter tests assert `contextUsed=[]` only | Implement a consented, ownership-checked minimal context handoff or explicitly declare context disabled; do not persist or pass cross-tool data until authorized. |
| 4 | Prediction Engine | NOT APPLICABLE | No ML artifact/model is invoked; outputs are deterministic `CALCULATED`; AI status is `NOT_CONFIGURED`; uncertainty is `NOT_ASSESSED` | Result type tests; Macro golden behavior; no model evaluation exists | Do not add prediction for this tool without separate model/evaluation approval. |
| 5 | Decision & Scenario Engine | PARTIAL | `generateWhatIfScenarios` (`485`), `buildWhatIfEngine` (`703`), `intelligence.scenarios`, `whatIf.adjustInput` in pilot (`macro-pilot.tsx:357-361`) | Integration what-if tests and body-fat infeasibility scenario tests | Deterministic bounded alternatives exist. There is no user preference/objective weighting, approval policy, or Decision-Engine output contract beyond macro calculations. Keep deterministic; add declared-constraint scenarios only with owner-approved scope. |
| 6 | Explanation Engine | PARTIAL | Macro output provides assumptions, PubMed citation in pilot UI/adapter; reasoning (`buildReasoningTrace`, `621`), sensitivity (`extractTop3ReasoningV6`, `684`); localized explanation text | Integration/RTL tests; Arabic warning tests; adapter preserves `assumptions` | No explanation-depth contract (`BEGINNER`/`STANDARD`/`EXPERT`) is implemented; reasoning trace is generated but not exposed as a complete answer/evidence explanation. Add a bounded explanation profile and tests. |
| 7 | Evidence Engine | PARTIAL | Adapter evidence reference `mifflin-st-jeor-1990` (`adapter.macro.v4.ts:337`), PubMed `https://pubmed.ncbi.nlm.nih.gov/2305711/`, assumptions mapped from engine, limitations included | Adapter evidence test; Macro V6 Mifflin tests; pilot PubMed link test | No Formula & Evidence Registry governance record with review status, source authority, review date, applicability registry, or approval workflow. Add a registry entry with owner-reviewed status/versions. |
| 8 | Safety & Policy Engine | PARTIAL | Deterministic warnings in `generateWarnings` (`macro.v6.ts:776`), `TARGET_BELOW_ESTIMATED_BMR`, `AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE`; adapter maps engine warnings to `SafetyWarningV4` and emits a deterministic-calculation warning; shell `riskTier="MEDIUM"` | Engine warning tests; integration age warning test; invalid input produces localized alert; no safety block regression | No persisted `SafetyContract`, effective policy engine, fail-closed action path, escalation workflow, or professional-handoff path. Add explicit intended-use/out-of-scope statement and contract implementation; human review required. |
| 9 | Personalization Engine | PARTIAL | `usePreferences()` in pilot (`macro-pilot.tsx:135`), language/unit/theme; canonical kg/cm with display conversion; Arabic/RTL localization | Metric/imperial round-trip tests; RTL/LTR tests; remediation RTL/status tests | Personalization is display/locale-level only. No consented user history/goal/constraint personalization, no preference correction/deletion policy, and no feasible context-derived rank. Keep non-diagnostic and user-controlled. |
| 10 | Evaluation & Monitoring Engine | PARTIAL / OFFLINE ONLY — no online monitoring | Offline tests only; no monitoring, drift detection, adversarial suite, audit sink, telemetry, or feedback pipeline is implemented by the pilot | Macro V6 81/81, V4 75 foundation tests, adapter 21/21, pilot/remediation tests, build/502, targeted ESLint | Implement/admit monitoring only with explicit privacy and owner approval; otherwise record no-production/online telemetry. Add adversarial safety regression and audit metadata if required. |

**Ten-layer result:** 1 PASS, 8 PARTIAL, 1 NOT APPLICABLE. No layer is approved as a complete AI/prediction layer. Macro is not an "intelligent oracle"; it is a bounded deterministic calculator with V4 presentation/envelope support.

---

## 4. AI Capability Profile audit

SPEC mandates that every tool invoke a reviewed AI Capability Profile, or explicitly declare AI disabled/not configured. Macro declares `aiStatus="NOT_CONFIGURED"` but does not construct or persist a complete `AICapabilityProfile` with permitted/prohibited capabilities, data classes, budgets, fallback, stop conditions, or audit policy.

| # | Capability | AI state | Deterministic/status evidence | Gap |
|---:|---|---|---|---|
| 1 | Input Understanding | NOT_CONFIGURED | User enters structured fields; no NLP/file parser; no model call | If wanted, add narrow draft-parser and user confirmation; not currently authorized or implemented. |
| 2 | Missing-Data Coach | NOT_CONFIGURED | Deterministic missing-field list and localized guidance are present (`macro-pilot.tsx` results EMPTY/PARTIAL); explainers are static | Capability remains deterministic, not AI. |
| 3 | Unit & Format Assistant | NOT_CONFIGURED | Deterministic metric/imperial conversion in pilot (`KG_PER_LB`, `CM_PER_IN`) and canonical kg/cm; no AI | No `UNIT_FORMAT_ASSIST` AI behavior implemented. |
| 4 | Context Resolution Assist | NOT_CONFIGURED | Engine accepts optional linked/context values but pilot does not supply/resolve them; envelope `contextUsed=[]` | No AI/context resolver; no ownership freshness UI. |
| 5 | Smart Validation Assist | NOT_CONFIGURED | `validateProvidedMacroInput` and engine validation provide deterministic warnings/errors; no model explainer | No AI validation assistant. |
| 6 | Scenario Generator | NOT_CONFIGURED | Deterministic switch-cut/bulk/maintenance and ±10kg scenarios; infeasible scenarios render defensively | No AI scenario generation or proposal layer. |
| 7 | Sensitivity Explanation | NOT_CONFIGURED | Deterministic finite-difference/local sensitivity top-3 display; explicitly described as non-causal | No AI explanation layer; local only. |
| 8 | Evidence-Aware Explanation | NOT_CONFIGURED | PubMed citation and explicit equation-population limitation; assumptions displayed; uncertainty `NOT_ASSESSED` | No AI explanation; evidence link is static and English-only. |
| 9 | Safety & Escalation Assist | NOT_CONFIGURED | Deterministic age/BMR-below warnings; no blocking action except engine invalid input rejection | No AI/professional escalation route; no dynamic risk assistant. |
| 10 | Next-Step Recommender | NOT_CONFIGURED | `nextActions: []` in adapter/runtime envelope; no next tool recommendation | No AI recommender and no approved cross-tool recommendation policy. |

**AI conclusion:** every AI capability is `NOT_CONFIGURED`. There is no evidence of model calls, provider configuration, paid API use, prompt files, agent routing, or audit data. The macro tool is deterministic; AI is not required for the current scope.

**Profile status:** PARTIAL / INCOMPLETE AS AN OBJECT. `aiStatus="NOT_CONFIGURED"` is accurate, but SPEC's full `AICapabilityProfile` record is not materialized.

---

## 5. Safety Contract review

SPEC §9 requires every tool to define a `SafetyContract`, even if simple. Macro has partial safety behavior but no registered contract instance.

| Safety element | Status | Evidence/file/function | Test | Required action |
|---|---|---|---|---|
| Domain and intended use | PARTIAL | UI says "deterministic calculation, not a prediction or medical assessment"; assumptions describe limits | Integration text assertions | Write explicit product intended-use/out-of-scope: not diagnosis/treatment/eating-disorder management. |
| Risk assignment per operation | PARTIAL | V4 shell `riskTier="MEDIUM"`; engine warnings are `caution`; cut-below-BMR and age warnings | Integration tests; adapter test mapping | Replace shell-only declaration with an approved `SafetyContract` and operation-level ratings. |
| Sensitive inputs | PASS / PARTIAL | Weight/height/age/sex classified by adapter as `privacyClass="PERSONAL"`; no Supabase storage | Adapter test privacy check | Document allowed collection, retention, deletion, and export limits. |
| Prohibited outputs/actions | PASS | No diagnosis/dosing/treatment recommendation; rejected recomp phase; no action execution | Engine tests; UI non-prediction text | Contract text needed; maintain no unsupported medical claims. |
| Input guards | PASS / PARTIAL | Engine ranges, non-finite rejection, infeasible carbs block; adapter output guards | V6/NaN/Infinity/adapter tests | Formalize guards in `SafetyContract`; add warning audit IDs. |
| Output guards | PARTIAL | `validateToolResultEnvelope` and adapter output guards; model output absent | Runtime tests; adapter validation tests | Output guard should include safety-warning presence and non-diagnostic phrasing rules. |
| Permission model | FAIL | No permissions or tool calls exist; no execution side-effects, but no contract/allowlist | N/A | If any action/persistence is added, require separate approval, side-effect class, and allowlist. |
| Human escalation | PARTIAL | Warnings display; no route to a qualified professional; unknown risk default not codified | N/A — no action exists to approve | Add an explicit escalation message for concerning questions; do not provide clinical guidance. |
| Fail-closed rules | PARTIAL | Engine throws before calculate on invalid input; unavailable display not numeric-fabricated | Macro invalid/infeasible tests; adapter invalid path | Persist fail-closed policy per operation and persistence/update action. |
| Medical boundary | PASS | Non-diagnostic labels; no dosing; PubMed/equation limitations; no eating-disorder screening | Integration Arabic/English warning tests | Add explicit escalation/out-of-scope statement in a separately approved contract revision. |
| Audit requirements | FAIL | No audit/logging/policy/action record is emitted | None | Add pseudonymous audit metadata or explicit no-persistence/no-action decision. |

**Safety verdict:** the current deterministic behavior correctly avoids diagnosis and unsupported medical actions, but macro is not yet governed by a persisted, complete Safety Contract. The red line is not a formula bug; it is governance.

---

## 6. Evidence, assumptions, uncertainty, and result validity review

| Item | Status | Evidence | Test | Gap |
|---|---|---|---|---|
| Assumptions preserved | PASS | Adapter maps `MacroOutputV6.assumptions` into `AssumptionRecord[]`; engine carries explicit Mifflin/bulk/cut/protein/fat assumptions and equation limits | Adapter envelope inspection; integration assumptions display | No registry IDs/status are assigned to individual rules/formulas. |
| Evidence reference | PARTIAL | Adapter includes Mifflin-St Jeor original study and PubMed ID `2305711`; limitations explicit | Adapter test `evidence[0].evidenceId == mifflin-st-jeor-1990` | Static reference, not a governed Formula & Evidence Registry entry with review date/status. |
| Numeric confidence | PASS | None emitted; `uncertainty.level=NOT_ASSESSED`, `basis` states no calibrated confidence model; engine `confidence: null` | Adapter test asserts `NOT_ASSESSED`; Macro tests preserve null confidence | Correct behavior—do not add percentages. |
| Qualitative uncertainty | PARTIAL | Record includes basis, affected outputs, limitations, remediation hints (`adapter.macro.v4.ts` uncertainty builders) | Adapter test asserts `NOT_ASSESSED` or `INSUFFICIENT_EVIDENCE` | Not dynamically computed from input risk; estimates are always flat. |
| Input completeness | PASS / PARTIAL | `DynamicResultV6.completeness`; adapter mapping `EMPTY/PARTIAL/FULL` according to owner-approved table | Adapter mapping test; integration EMPTY/PARTIAL/FULL tests | Missing-field `FieldDefinition` metadata and freshness/consent/sensitivity details absent; completeness is not factual-accuracy confidence. |
| Result validity | PARTIAL | `CURRENT` for valid, `NOT_ASSESSED` for unavailable, `INVALIDATED` for rejected input; invalidation triggers declared | Adapter tests | No freshness policy, `observedAt`, conflict detection, stale record handling, or tool-specific expiry. |
| Freshness | FAIL/PARTIAL | No universal stale timer; engine does not display input timestamp | None | Add observed/recorded times only with an approved persistence or intake flow. |
| Calculation fingerprint | FAIL | Adapter builds random `calculationId` via runtime adapter (`adaptV6ToV4Envelope`, `calc-Date.now/Math.random`) | N/A | Add a deterministic fingerprint excluding secrets if an actual audit/history layer is approved. |
| Privacy classification | PASS | `privacyClass="PERSONAL"`; no storage | Adapter test | Document retention/deletion policy. |

### 6.1 Evidence claim quality

The evidence shown is authentic and narrow: the Mifflin–St Jeor source is cited, and the page/adapter state that the source population was 498 healthy adults aged 19–78 while Macro renders ages 19–100. This avoids fabricated citations and is aligned with the no-false-precision rule.

It is **not** a claim that Macro outcomes are medically validated, nor that the equation is a measurement.

---

## 7. Input provenance, completeness, and validation review

### 7.1 Provenance

| Element | Current status |
|---|---|
| Source | `USER_ENTERED` for every required field; one joined `user_input` provenance record for valid outputs |
| Imported/cross-tool | Not used in pilot; engine can accept linked Body Fat data but pilot does not pass it |
| Estimated values | None; no defaults fill required values |
| Invalid supplied values | Engine rejects before calculation; adapter emits `INVALID` / `INCOMPLETE`; localized alert |
| Missing values | No calculation; guidance and field list displayed |
| Consent/freshness/sensitivity | Not represented in a first-class persisted macro input profile |

### 7.2 Completeness mapping

The owner-approved mapping is implemented and should remain the bounded reference:

| Macro state | V4 status | V4 completeness |
|---|---|---|
| EMPTY | `NOT_AVAILABLE` | `INSUFFICIENT_FOR_SAFE_RESULT` |
| PARTIAL | `NOT_AVAILABLE` | `INCOMPLETE` |
| FULL valid | `VALID` | `SUFFICIENT_FOR_BASIC_RESULT` |
| FULL invalid | `INVALID` | `INCOMPLETE` |
| FULL degraded | `DEGRADED` | `INSUFFICIENT_FOR_SAFE_RESULT` |

Evidence: `MACRO_STATE_MAP` and `mapMacroStateToV4` in the adapter; adapter state-mapping tests; integration EMPTY/PARTIAL/FULL/invalid tests; R4 controlled degraded probe.

### 7.3 Validation behavior

- Required-field check occurs before formula evaluation.
- Provided invalid values produce structured validation errors; no fallback numeric result is fabricated.
- Non-finite or malformed engine output is rejected by `assertValidMacroOutput`; no `NaN`/`Infinity` envelope is emitted.
- Unit conversion remains display-boundary only (`KG_PER_LB`, `CM_PER_IN`), with canonical kg/cm in the engine.

### 7.4 Gaps

1. **Canonical `FieldDefinition` profile:** not present for macro. Units/constraints exist in engine prose and TypeScript checks, but not as runtime-governed field metadata with `canonicalUnit`, `acceptedUnits`, `normalizationVersion`, `sensitivityClass`, and `consentScope`.
2. **Provenance granularity:** `USER_ENTERED` is accurate but coarse; there is no `observedAt`, record timestamp, per-field method, conflict rule, or freshness rule in the pilot.
3. **Contradiction detection:** engine detects infeasible outputs but does not ask users to resolve semantically contradictory declared preferences (e.g. aggressive cut versus high activity under a goal of gaining) as a general contradiction policy.
4. **Prompt-injection handling:** no untrusted free-text/domain output path exists; therefore no injection tests apply to the current tool boundary. This is a control that should be stated, not silently assumed.

---

## 8. What-If and sensitivity analysis review

| Item | Status | Evidence | Tests | Gap |
|---|---|---|---|---|
| Deterministic What-If | PASS | `intelligence.whatIf.adjustInput`, `WhatIfScenarioV6`; pilot slider for weight/activity/TDEE | Integration what-if slider tests; macro engine tests | Bounded to defined dimensions; no arbitrary scenario claim. |
| Scenario comparison | PASS / PARTIAL | Switch cut/bulk/maintenance and ±10kg scenarios; scenario output uses deterministic engine | Integration scenario text and infeasible scenario tests | No user objective weighting/decision contract. |
| Infeasible scenario | PASS | Non-negative distribution/carb boundary explanations; `NOT_AVAILABLE` for infeasible scenario result | Integration infeasible scenario test | Fine for arithmetic scope only. |
| Sensitivity factor | PASS | Finite-difference/local sensitivity, presented as local and non-causal | Integration sensitivity localization tests; Macro sensitivity tests | Does not show causality or recommend action. |
| AI scenario generation | NOT APPLICABLE/NOT CONFIGURED | No AI capability enabled; no model | N/A | Do not add without owner approval. |
| Future extrapolation/promise | PASS | UI labels calculations as estimates; equation age range outside study yields warning | Age 79 and age 18 tests | Good bounded behavior. |

What-If is a **bounded deterministic scenario system**, not a prediction system and not an AI planner.

---

## 9. Context Resolution and cross-tool readiness review

| Element | Status | Evidence | Current conclusion |
|---|---|---|---|
| UserContext input to engine | PARTIAL | `calculateMacrosV6(input, userContext?, linkedData?)` exists (`macro.v6.ts:819`) | Signature exists but pilot does not pass userContext. |
| Body Fat → Macro adapter | PARTIAL | Engine imports `validateBodyFatForMacro` only when `linkedData` is supplied (`macro.v6.ts:828-842`) | Code boundary exists; no UI/data source passes linkedData in pilot. |
| Outbound links | PASS (honest absence) | `CROSS_TOOL_LINKS: CrossToolLinkV6[] = []` (`macro.v6.ts:615`) with explicit comment preventing self-referential/speculative graph edges | No fake graph claim. |
| Context in envelope | PASS/current | `contextUsed: []` | Correctly reports no context used. |
| Freshness/ownership/consent | FAIL / NOT IMPLEMENTED | No consent UI, ownership check, or stale context policy is exercised by the pilot | Required before cross-tool use. |
| Cross-tool calculation | NOT APPLICABLE at present | `CROSS_TOOL_LINKS=[]`, pilot does not pass linked data | No claim of cross-tool macro result is valid today. |
| Cross-tool UI/knowledge graph | NOT IMPLEMENTED | No linked-result picker or knowledge graph surface in pilot | Separate scope and consent design required. |

**Current rule:** Body Fat data is eligible-to-import code support, not an active user feature. A macro result today must not depend on another tool's data.

---

## 10. Arabic/English, RTL/LTR, and accessibility review

| Requirement | Status | Evidence / test | Gap |
|---|---|---|---|
| Arabic route renders | PASS | `/ar/smarttools/nutrition/macro`: HTTP 200; `lang="ar"`, `dir="rtl"`; H1 and six Arabic labels; localized status | Site chrome Arabic consistency is site-wide. |
| English LTR | PASS | `/en/...` HTTP 200; default browser/integration LTR; labels and status localized | Full browser pass only on default locale. |
| Arabic RTL integration | PASS | Integration + remediation tests; browser switching shows `html lang="ar"`, `dir="rtl"`, H1 and status Arabic | Manual Arabic screen-reader pass pending. |
| Unit conversion and meaning preservation | PASS | Existing pilot imperial/metric tests; canonical kg/cm | More end-to-end conversion coverage optional after owner approval. |
| Labels | PASS | Every control has an accessible label verified by tests and browser input order | Contrast is okay after R3.1. |
| Error announcements | PASS | Localized engine error list; single active `role="alert"`; invalid input test passes | No dedicated audit of alert verbosity. |
| Live status | PASS / PARTIAL (DOM remains raw hidden) | Localized `role="status" aria-live="polite"`; raw V4 token region hidden in pilot CSS | Raw V4 status remains DOM-hidden because protected template cannot be edited; manual AT check pending. |
| Focus visibility | PASS (automated) / PARTIAL (manual) | `:focus-visible` CSS for V4 controls; button focus test | Full keyboard traversal NOT RUN. |
| Actual 375px phone | NOT RUN | Browser width was limited to ~474px; CSS media rules verified for V4 | Actual mobile viewport emulation NOT RUN. |
| Screen-reader review | NOT RUN | No assistive technology in environment | Required before full accessibility certification. |
| Axe scan | NOT RUN | `axe-core` absent; no dependency installation authorized | Lighthouse used instead; not full axe. |
| Site-wide accessibility | FAIL / OUTSIDE PILOT | Lighthouse: header contrast `4.04`, Home target-size, footer heading-order, no `main` landmark | Not pilot cause; requires separate scope/authorization. |

**Accessibility conclusion:** the pilot is materially improved and likely AA-compliant for pilot-specific controls, but audit completeness is NOT achieved without screen-reader and full keyboard checks.

---

## 11. Persistence, failure, and degraded states review

| Area | Status | Evidence / file / function | Test | Gap |
|---|---|---|---|---|
| Local UI state | PASS | React `input`, `result`, `resultEnvelope` local state; no server storage | Integration refresh/initial empty tests | Local state is not durable persistence. |
| Supabase write | NOT APPLICABLE / NOT AUTHORIZED | No Supabase write/mapping; no migration | N/A | Do not add without R6 authorization. |
| Storage states | FAIL / NOT IMPLEMENTED | No `LOCAL_ONLY/PENDING_SYNC/SYNCED_CONFIRMED/SYNC_FAILED/NOT_SAVED` surface | N/A | Define exact persistence policy or explicitly keep as ephemeral pilot. |
| Persistence confirmation | NOT APPLICABLE (current scope) | No provider call; no optimistic "saved" state exists | N/A | Do not display saved/synced text. |
| Failure state | PASS / PARTIAL | Engine throws on invalid input; pilot catch maps localized error; adapter invalid envelope | Invalid age/weight tests; integration invalid path | No persistence failure path because persistence absent. |
| Degraded state | PARTIAL / controlled only | Adapter mapping supports `FULL_DEGRADED → DEGRADED/INSUFFICIENT_FOR_SAFE_RESULT`; engine cannot produce degraded output | Controlled R4 probe only | No real degraded trigger; should not be presented as implemented production degradation. |
| Audit/log observability | FAIL | No audit record; no calculation ID persistence; no policy/data logging | None | Add only under separately approved persistence/audit scope. |
| Retry/idempotency | NOT APPLICABLE | No network/side-effect action | N/A | Required if persistence/actions are added. |
| Engine failure | PASS | `throw new Error` before calculation; no fabricated fallback number | Macro invalid/infeasible tests | Failure text is localized and non-numeric. |

---

## 12. Pipeline-state and contract-level review

SPEC §3 defines a logical V4 pipeline and many explicit states. Macro implements a useful subset through React status, not the full pipeline.

| Pipeline stage/state family | Status | Evidence | Gap |
|---|---|---|---|
| Input Collection | PASS | Six required fields, Arabic/English, minimal-first collection | No dynamic FieldDefinition runtime. |
| Input Provenance & Trust | PARTIAL | `USER_ENTERED` in adapter; no extracted/untrusted content path | No trust classification beyond user-entered. |
| Normalization | PASS | Canonical kg/cm; imperial display-only; imperial boundary tests | No normalization version/registry. |
| Validation & Safety Precheck | PASS / PARTIAL | Engine validates before calculation; invalid values blocked | No SafetyContract object or fail-closed policy registry. |
| Context Resolution | PARTIAL | Adapter emits `contextUsed: []`; linked data not passed | No consent/ownership/freshness flow. |
| Capability Selection | PARTIAL | V4 shell `aiStatus=NOT_CONFIGURED`; no AI selection | No explicit engine capability registry entry for Macro. |
| Calculation | PASS | Macro V6 | None for scope. |
| Cross-Tool Validation | FAIL/PARTIAL | Engine supports optional linked data, pilot does not | No active linked source; not a safe default assumption. |
| Evidence & Uncertainty | PARTIAL | Mifflin evidence + qualitative uncertainty | No registry, no dynamic uncertainty. |
| Explanation | PARTIAL | Assumptions/warnings/sensitivity in localized UI | No beginner/expert levels, no reasoning-trace UI. |
| Output Contract Validation | PASS / PARTIAL | `validateToolResultEnvelope` called for current envelope in tests; template validates envelopes to display/refuse | Runtime validation happens; production storage validation absent because no persistence. |
| Persistence / Export | FAIL / NOT IMPLEMENTED | None | Separate R6 scope. |
| Pipeline state machine | PARTIAL | UI exposes idle/partial/ready/error; adapter exposes V4 result status/completeness | SPEC has 20+ typed states; no explicit machine/transitions test. |

---

## 13. Overall status by protected acceptance/gate state

| Area | Status |
|---|---|
| Macro route rendering V4 pilot | PASS — current/browser verified |
| Macro V6 numerical authority | PASS — unchanged/81 tests |
| V4 output envelope/adapter | PARTIAL — works; incomplete governance/metadata |
| Contract validation | PASS / PARTIAL — envelope validates; input profile shallow |
| AI Capability Contract | PARTIAL — AI off/not configured; no full profile object/policy |
| Safety Contract | PARTIAL — safe deterministic behavior; no registered contract |
| Context / cross-tool | PARTIAL — disabled in pilot; engine boundary exists but unused |
| Accessibility / bilingual | PARTIAL — pilot usable/LTR/RTL; manual AT and 375 run pending; site-wide issues remain |
| Persistence / audit | FAIL / NOT IMPLEMENTED |
| Full V4 capability | **NOT ACHIEVED** |

---

## 14. Gap closure path (proposal only, NOT authorized for implementation)

No changes may be implemented under this task. If the owner wants Macro to become a full V4-grade pilot, future scope must be explicitly approved and should include:

1. **Contract hardening** — versioned Macro input `FieldDefinition` profile, consent/freshness/sensitivity metadata, field-state runtime validation, and deterministic input fingerprint.
2. **Governance registration** — Formula & Evidence Registry entry for Mifflin-St Jeor/macro rules and a persisted Macro `SafetyContract` and NOT_CONFIGURED `AICapabilityProfile`.
3. **Auditability** — pseudonymous calculation audit record: calculation ID, engine/contract/policy version, validation outcome, warnings, and result fingerprint—without unnecessary raw health data.
4. **Progressive disclosure** — primary result → why/assumptions/evidence → advanced what-if/sensitivity → safety/history details, with beginner/standard/expert explanation only if approved.
5. **Cross-tool context** — only after consent/ownership/freshness validation and explicit allowlist; current default `contextUsed=[]` must remain until then.
6. **Persistence** — only in an R6 scope with Supabase schema reconciliation, RLS/authority review, storage states, and retry/conflict semantics.
7. **Accessibility certification** — screen-reader review, full keyboard traversal, actual 375px device/viewport check, and remediation of site-wide header/footer/main landmark defects if in scope.
8. **Audit evidence** — a fresh acceptance suite with explicit adversarial tests and owner sign-off before any mass rollout.

## 15. Final answer to the owner

**Was Macro developed to the full V4.0 / PROMPT / SPEC / ACCEPTANCE architecture?**

No. Macro was delivered as a **bounded Macro V4 pilot integration**:

```text
/ar route → MacroPilotTool → Macro V6 → V4 Adapter → V4 Shell
```

It is architecturally important and mechanically validated, but it is not yet a complete V4 capability. The biggest missing pieces are governance/execution layers: explicit SafetyContract, complete AICapabilityProfile object (even as NOT_CONFIGURED), audit/observability, persistence, full pipeline states, active cross-tool context, and complete manual accessibility evidence.

**Decision:** Macro remains a **PARTIAL** V4 implementation. It is **not** approved for R5 expansion by this audit alone.

**STOP — owner review required before any further scope. No application files were changed.**
