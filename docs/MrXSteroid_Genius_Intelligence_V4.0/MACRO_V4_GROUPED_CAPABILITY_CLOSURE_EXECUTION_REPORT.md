# MACRO_V4_GROUPED_CAPABILITY_CLOSURE_EXECUTION_REPORT

**Project:** MrXSteroid Genius Intelligence V4.0  
**Tool:** Adaptive Macro Calculator (`mrx.tool.macro`, slug `macro`)  
**Date:** 2026-11-05  
**Baseline:** Approved Macro V4 Capability Closure Plan — Revision 2.2  
**Branch / HEAD:** `main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0` (`origin/main` = `a0af36bf`, ahead 1 / behind 1)  
**Mode:** Grouped implementation authorized by the owner; implemented, verified, and reported here. No Git stage/commit/merge, no database/Supabase, no AI/provider/model call, no fingerprint/hash, no deployment.  
**Current checkpoint:** M4-IN-01 (completed, preserved).  
**Final readiness decision:** Macro remains a bounded V4 pilot. It is **not fully V4-complete and must not be called so**. See §9 and §10.

---

## 1. Executive summary

The grouped Macro V4 capability-closure batches A–E were executed within the owner's authorization. Implementation is additive and isolated: new V4 profile modules and conformance tests plus minimal presentation-layer changes in the Macro pilot and its CSS. Macro V6, its schema, the accepted R1/R2 contracts/runtime, Template V4, the accepted adapter, and the completed M4-IN-01 profile are **unchanged and verified by SHA-256**.

Twelve verification suites and four pre-existing suites total **16 files / 328 tests pass**, and the remaining checks that this environment supports were run (see §7). Three accessibility checks could not be executed here and are recorded as `NOT RUN` rather than `PASS`. Full Macro V4 completion still requires the blocked/deferred safety-contract enforcement work, the unset accessibility executions, and an explicit owner acceptance decision under Revision 2.2 — none of which is claimed or granted by this report.

The first controlled SmartTools (toward the 255-tool strategic objective) recommendation is prepared in §11 as **a recommendation only**. No R5 batch was started, no registry/catalog/route was changed or deleted, and the 264 registered identities remain untouched.

---

## 2. Scope and constraints honored

| Constraint | Status |
|---|---|
| No edits to accepted R1/R2 contracts/runtime | **Held** — `contracts.v4.ts`, `runtime.v4.ts`, `index.ts` unchanged (verified §8) |
| No Macro V6 edit (formulas, constants, rounding, constraints, exports, version) | **Held** — `macro.v6.ts` and `schemas/macro.v6.ts` unchanged (verified §8) |
| No edits to the accepted adapter | **Held** — consumed read-only only |
| M4-IN-01 preserved | **Held** — production and test profiles unchanged (verified §8) |
| No persistence, Supabase, migration, write, or "saved/synced" claim | **Held** — none introduced or implied; `auditRef` asserted absent |
| No AI/provider/model/prompt/cost change | **Held** — `aiStatus=NOT_CONFIGURED` retained |
| No fingerprint/hash/HMAC/salt/secret; `calculationId` stays operation identity | **Held** — tested; no hashing introduced |
| No new dependencies | **Held** — `package.json` hash unchanged |
| No dashboard/auth/payment/billing work; no route change | **Held** — not touched |
| No registry/catalog/renumbering work; no tools deleted; 264 identities preserved | **Held** — not touched |
| No Git stage/commit/push/merge/deploy/release | **Held** — no Git action performed |
| No Revision 2.3; no R0 re-run; no audit repeat | **Held** |
| Deferred safety-profile files not created | **Held** — `macro-safety-profile.v4.ts` and `.test.ts` confirmed absent |
| Production build | **NOT RUN** — not separately authorized |

---

## 3. Batch A — Dynamic Input Completion

**Requirement IDs:** M4-IN-02, M4-IN-03, M4-IN-04, M4-IN-05, M4-IN-06, M4-IN-07, M4-IN-08, input-completeness/validation integration.

**Files created**

- `lib/engines/core/v4/profiles/macro-input-metadata.v4.ts`
- `lib/engines/core/v4/profiles/macro-input-metadata.v4.test.ts`

**Fields of work**

1. **M4-IN-02 — Unit metadata and conversion boundary.** New profile publishes canonical units (`kg`/`cm`), display units (`kg|lb`, `cm|in`), display precision, and the exact/round-trip boundary constants (`KG_PER_LB = 0.45359237`, `CM_PER_IN = 2.54`). Imperial→canonical conversion is mathematically exact at full precision; display values are rounded to one decimal exactly as the pilot already displayed. Metric (canonical) path is a no-op. The pilot now consumes `macroToDisplayValue`/`macroToCanonicalValue` from the profile instead of local helpers (behavior identical). Engine inputs are never converted twice.

2. **M4-IN-03 — Per-field provenance.** `MACRO_PROVENANCE_POLICY` records `USER_ENTERED` as the only current source; `IMPORTED`/`CROSS_TOOL`/`ESTIMATED`/`SYSTEM_DERIVED` are forbidden; `missingFieldProvenance` is `null`. New conformance tests against the read-only adapter verify: all six provided fields emit `USER_ENTERED`; missing fields emit **no** provenance entry; no other source value appears.

3. **M4-IN-04 — Timestamp semantics.** `MACRO_TIMESTAMP_POLICY` defines `recordedAt` as envelope-creation time injected by the caller; `observedAt` as absent unless a real observation exists; no persistence or measurement implication. Adapter conformance tests verify `recordedAt === createdAt === inputSnapshot.recordedAt` and `inputSnapshot.observedAt === undefined`.

4. **M4-IN-05 — Sensitivity/consent/freshness metadata.** `MACRO_INPUT_GOVERNANCE` classifies all six fields `personal`; `consentScope: null`, `freshnessPolicyId: null`, `retention: 'NONE'`, no inferred sensitive traits. Classification is unchanged from M4-IN-01. No default consent is introduced. `PERSONAL` remains the envelope `privacyClass`.

5. **M4-IN-06 — Prompt-injection control statement.** Verified at the implementation surface: the pilot accepts only the six bounded inputs (numeric inputs with min/max/step and two constrained `<select>`s); no free-text path exists; values are validated by the accepted engine/schema before use; no AI/model consumes them; validation cannot be overridden. Documented verdict: **PASS (documentation/verification only, no code change)**.

6. **M4-IN-07 — Minimal-first progressive input.** Six required fields only; no optional field blocks a basic result; `recomp` remains deliberately excluded (no approved formula). Existing empty/partial path and the incremental `Recalculate` behavior are preserved.

7. **M4-IN-08 — Input fingerprint.** **Deferred by the owner**; not implemented, not proposed; no hashing/HMAC/salt/secret. `calculationId` remains the accepted operation identity.

8. **Input completeness and validation integration.** New profile integrates the accepted runtime validators (`assessInputCompleteness`, `validateFieldValue`) and the M4-IN-01 definitions, and is round-tripped against the empty/partial/full states with explicit, tested expectations (`INSUFFICIENT_FOR_SAFE_RESULT` / `INCOMPLETE` / `SUFFICIENT_FOR_BASIC_RESULT`).

**Result:** Batch A complete except the owner-deferred M4-IN-08. All 16 Batch A tests pass.

---

## 4. Batch B — Dynamic Output and Result Validity

**Requirement IDs:** M4-OUT-01 … M4-OUT-06, M4-OUT-07, M4-NC-01, M4-EV-04 (policy level).

**Files created**

- `lib/engines/core/v4/profiles/macro-output-policy.v4.ts`
- `lib/engines/core/v4/profiles/macro-output-policy.v4.test.ts`

**Fields of work**

1. **M4-OUT-01 — Engine and calculation identity.** `MACRO_ENGINE_IDENTITY_V4` records `toolId: mrx.tool.macro`, `canonicalSlug: macro`, `engineVersion: 6.0.0`, unchanged equation id `mifflin-st-jeor-macro-v1`, `contractVersion: 4.0`, `schemaVersion: 4.0.0`. Adapter conformance tests assert these exact values on a real calculated envelope.

2. **M4-OUT-02 / M4-EV-04 — Result validity and invalidation.** `resolveMacroResultValidity([])` returns the accepted `CURRENT` validity with triggers `['input_changed', 'engine_version_changed']`; any supplied cause (`input_changed` / `engine_version_changed`) returns `INVALIDATED`. The adapter already emits `CURRENT` for a valid result, `NOT_ASSESSED` for empty/partial, `INVALIDATED` for rejected input — this is verified in tests. No universal `validUntil` is set. Note honestly: the invalidation policy is an additive, tested declaration; there is **no runtime engine-version watcher** and none is claimed. Engine-version change would be an integration/registry-level decision (R5/R8), not a Macro-runtime decision.

3. **M4-OUT-03 — Compatibility strategy.** Compatibility pinned and tested across all three adapter states: `contractVersion === '4.0'`, `schemaVersion` matches semver; V4 remains additive to V3; route identity unchanged; Macro V6 numeric authority unchanged.

4. **M4-OUT-04 — Conditional evidence, warnings and assumptions.** `macroEnvelopeExpectationsFor(status)` declares that only a calculated `VALID` result requires the Mifflin evidence, the engine assumptions, and the deterministic-calculation warning; `INVALID`, `NOT_AVAILABLE` and `DEGRADED` must not fabricate them. Tests assert the adapter behavior in all states, plus `validateToolResultEnvelope` acceptance for all three states, plus triggered-condition warning mechanics (engine warnings are passed through only when the engine emits them). `DETERMINISTIC_CALCULATION` remains common but is never falsely bound to unrelated states.

5. **M4-OUT-05 — `nextActions`.** Remains `[]` in every adapter state. `MACRO_NEXT_ACTIONS_POLICY = 'EMPTY_UNTIL_APPROVED'`. No navigation/recommendation graph is introduced and none may be claimed.

6. **M4-OUT-06 — `calculationId` operation identity.** Verified unique per calculation, not derived from any input value (no fingerprint), unaffected by identical inputs producing identical numeric results.

7. **M4-OUT-07 — `auditRef`.** R6-only. `MACRO_AUDIT_REF_POLICY = 'ABSENT_UNTIL_CONFIRMED_WRITE'`. Tests assert `auditRef === undefined` on every adapter state.

8. **M4-NC-01 — Uncertainty `NOT_ASSESSED`.** Valid envelope retains `NOT_ASSESSED` with the unchanged basis text; no numeric confidence, no accuracy score. (Invalid/unavailable states retain `HIGH` / `INSUFFICIENT_EVIDENCE` as produced by the accepted adapter; no claim about those states is altered.)

**Result:** Batch B complete except the explicitly persistence-gated M4-OUT-07. All 14 Batch B tests pass.

---

## 5. Batch C — Evidence, Explanation and Scenarios

**Requirement IDs:** M4-EV-01, M4-EV-02, M4-EV-03, M4-EV-05, scenario validation/limitations, What-If and sensitivity boundaries, explanation boundaries.

**Files created**

- `lib/engines/core/v4/profiles/macro-evidence-registry.v4.ts`
- `lib/engines/core/v4/profiles/macro-evidence-registry.v4.test.ts`

**Fields of work**

1. **M4-EV-01 — Mifflin registry entry.** `MACRO_MIFFLIN_EVIDENCE` records stable id `mifflin-st-jeor-1990`, source type `study`, exact source title and URL (`https://pubmed.ncbi.nlm.nih.gov/2305711/`), `version: '1990'`, units (`kg`/`cm`/`kcal`), population ("498 healthy adults aged 19-78"), Macro-range extrapolation ("19-100 with explicit extrapolation warning above 78"), exclusions, and equation id `mifflin-st-jeor-macro-v1`. The record is conformance-tested against the adapter's emitted evidence, field by field.

2. **M4-EV-02 — Assumption traceability.** `MACRO_ASSUMPTION_RULES` registers five governed rule ids (`M4-EV-02-BMR`, `M4-EV-02-PHASE`, `M4-EV-02-RECOMP-UNSUPPORTED`, `M4-EV-02-MACRO-GRAMS`, `M4-EV-02-ACTIVITY-USER`) whose descriptions exactly match the engine's core `assumptions[]`; plus `M4-EV-02-OPTIONAL-CONTEXT` matched by the optional-fields prefix. Every engine assumption is mapped to a rule id by the tests; an invented description returns `null`. `MACRO_EQUATION_TRACE` names the four engine steps (BMR → TDEE → phase multiplier → macro split) with non-empty formulas and units.

3. **M4-EV-03 — Source review/date state.** `reviewStatus = 'NOT_REVIEWED'` and `reviewedAt = null` — **no review date is invented**. Limitations cite the 19–78 population and the 19–100 extrapolation. The registry record is candidate governance; it is **not owner-approved** and may not be used to claim a governed/approved evidence base (see §10).

4. **M4-EV-05 — Honest qualitative uncertainty guidance.** `MACRO_UNCERTAINTY_POLICY` keeps `NOT_ASSESSED`; basis names the deterministic estimate and the user-selected activity factor; `whatWouldReduceIt` lists direct measurement and validated population calibration as options only; wording is tested to exclude prescribing/diagnostic language. `numericConfidence` is `null`, `causalClaim` is false.

5. **Scenario validation and limitations, What-If, sensitivity (no fabricated evidence/confidence/prediction).** `MACRO_SCENARIO_POLICY` fixes the deterministic scenario set (`switch-to-cut` / `switch-to-bulk` / `switch-to-maintenance` / `weight-minus-10kg` / `weight-plus-10kg`), `maxScenarios: 5`, ±10 kg with 40/290 bounds, phase multipliers `1.15 / 0.85 / 1.0`, `causalClaim: false`. Tests assert the engine emits exactly this set deterministically, with no time-course or causal claim and `confidence: null` on scenarios, sensitivity factors, what-if results, and `intelligence.confidence`. The sensitivity boundary ("local finite differences, not a causal estimate") is asserted unchanged.

6. **Formula/assumption traceability (stated).** The unchanged engine equation id, version, and formulas are named; tests verify the adapter's deterministic warning and evidence, and that nothing about the arithmetic changed.

**Result:** Batch C complete at the documentation/policy level. All 13 Batch C tests pass. No scientific validation is claimed; no source review is claimed.

---

## 6. Batch D — Pilot UX and Validation

**Requirement IDs:** progressive disclosure, input-completeness presentation, assumption/result explanations, empty/partial/invalid/degraded states, AR/EN and RTL/LTR equivalence, keyboard/responsive/accessibility verification.

**Files created**

- `lib/engines/core/v4/profiles/macro-pilot-state.v4.ts`
- `lib/engines/core/v4/profiles/macro-pilot-state.v4.test.ts`
- `components/tools/macro-pilot.progressive-disclosure.test.tsx`

**Files modified**

- `components/tools/macro-pilot.tsx`
- `components/tools/macro-pilot.module.css`

**Fields of work**

1. **Progressive disclosure.** Three native `<details>` disclosures with focusable `<summary>` elements: *Formula, evidence and assumptions*, *Comparison scenarios and sensitivity*, *What-if scenario*. The primary result (type, value, distribution, energy balance, and the medical-boundary explanation) remains visible outside the disclosures. Advanced content is present in the DOM but collapsed; keyboard focus order and visible-focus styling are provided by new CSS
   (`summary:focus-visible` uses the same `--ring` outline tokens as the rest of the pilot).

2. **Input-completeness presentation.** A `data-testid="macro-required-progress"` line renders "{provided} of 6 required inputs provided." (Arabic: "تم إدخال {provided} من أصل {required} حقول مطلوبة."). The missing-fields list is retained and derives from the same six-field inventory; it never invents values.

3. **Assumption and result explanations.** Two visible sections are rendered on every calculated result — *What this result means* ("an arithmetic estimate based on the values you entered; not a measurement, diagnosis, treatment plan, or guarantee…") and *What this result does not mean* ("does not diagnose, treat, prescribe, manage an eating disorder, or replace a qualified professional; **it does not save or share your inputs**") — fully localized in Arabic and English, rendered in both RTL and LTR.

4. **Empty / partial / invalid / degraded / unavailable states.** Existing EMPTY (NOT_AVAILABLE / INSUFFICIENT_FOR_SAFE_RESULT), PARTIAL (INCOMPLETE), FULL/INVALID paths are retained and still map exactly as the owner approved; the invalid path now additionally renders a localized corrective guidance line **without** introducing a second `role="alert"` (the single alert in an invalid state is asserted). A new pure helper `resolveMacroPilotPresentationStateV4` maps envelope status/completeness to IDLE / EMPTY / PARTIAL / FULL / INVALID / DEGRADED / UNAVAILABLE / ERROR and is unit-tested. `DEGRADED` is the controlled V4 mapping only: the Macro V6 engine never emits a degraded result; the pilot renders additional-caution guidance if a controlled degraded envelope were ever presented, and explicitly does not claim an engine-degraded computation. An unexpected `NOT_AVAILABLE` combination renders unavailable guidance.

5. **Arabic/English and RTL/LTR equivalence.** All new strings are localized in `ar` and `en`; both shells set `dir="rtl"|"ltr"` and are integration-tested. jsdom tests cover the Arabic RTL progression (progress string, result-meaning sections, and disclosure summaries) and preserve the existing warning localization and live-status requirements. The real-browser Arabic shell was not toggled this session (the switch controls site-wide language and was deliberately not flipped); Arabic is `jsdom`-verified and was not browser-verified.

6. **Keyboard, responsive, accessibility verification (honest status).** See §7.5. jsdom evidence: focus tests pass (previous remediation suite), every control and all three native disclosures are reachable/focusable in jsdom, warnings localized, live regions `role="status" aria-live="polite"`, single `role="alert"` on invalid input. The real-browser checks that this environment cannot perform are recorded `NOT RUN`.

**Result:** Batch D implemented and verified to the extent this environment supports; see §7.5. All 7 new disclosure/state tests pass; the two modified presentation files compile, lint clean, and keep all pre-existing suites green.

---

## 7. Batch E — Verification

### 7.1 Commands actually executed (actual results)

| Command | Result |
|---|---|
| `npx vitest run <10 pre-existing Macro/BodyFat/V4/page/pilot suites>` | PASS (see 7.2) |
| `npx vitest run <6 closure suites + progressive-disclosure suite>` | PASS (see 7.2) |
| Combined run: 16 files | **328 tests passed** |
| `npx vitest run` (full new closure suite set) | 328/328 across selected suites; full-repo suite **not** claimed |
| `npm run validate-tools` | **5/5 pass** |
| `npx tsc --noEmit` | **exit 0** |
| `npx eslint` on the new/changed production files | **0 errors, 0 warnings** (test files are ignored by project ignore pattern — same as M4-IN-01) |
| Production `npm run build` | **NOT RUN** — not authorized |

### 7.2 Test counts by suite

- Pre-existing: Macro V6 81/81, Body Fat V6 46/46, contracts.v4, runtime.v4, adapter.macro.v4, `genius-tool-template.v4.test.tsx`, `macro-pilot.test.tsx`, `macro-pilot.v4.integration.test.tsx`, `macro-pilot.remediation.test.tsx`, `app/smarttools/nutrition/macro/page.test.tsx`, plus M4-IN-01 `macro-input-profile.v4.test.ts` (13/13).
- New this execution: `macro-input-metadata.v4.test.ts` 16/16, `macro-output-policy.v4.test.ts` 14/14, `macro-evidence-registry.v4.test.ts` 13/13, `macro-pilot-state.v4.test.ts` 7/7, `macro-pilot.progressive-disclosure.test.tsx` 7/7.
- Combined selected suites: **16 files / 328 tests**.

### 7.3 Protected-file verification (SHA-256)

| File | Result |
|---|---|
| `lib/engines/core/v4/contracts.v4.ts` | unchanged (`D09F37E5…2441B`) |
| `lib/engines/core/v4/runtime.v4.ts` | unchanged (`2630FA37…06A92`) |
| `lib/engines/core/v4/index.ts` | unchanged (`79E0354F…46BBA`) |
| `lib/engines/core/v4/adapter.macro.v4.ts` | unchanged (`9DF49FE5…E45F`) |
| `lib/tools/engines/macro.v6.ts` | unchanged (`42977760…0921`) |
| `lib/tools/schemas/macro.v6.ts` | unchanged (`7E23A66A…0731`) |
| `lib/templates/genius-tool-template.v4.tsx` | unchanged (`0251A2FD…82F5C8`) |
| `lib/engines/core/v4/profiles/macro-input-profile.v4.ts` (+`.test.ts`) | unchanged (`2EA76D6E…` / `C5F757EF…`) |
| `app/smarttools/nutrition/macro/page.tsx` | unchanged (`B3003317…`) |
| `package.json` | unchanged (`7D306EFE…`) |

`package-lock.json`/`pnpm-lock.yaml` (if any) were not edited; no dependency was added or removed.

### 7.4 New-file hashes (evidence of the additive surface)

`macro-input-metadata.v4.ts` `BD4537EC…`, `.test.ts` `8DB60FD6…`; `macro-output-policy.v4.ts` `CBFD0CB9…`, `.test.ts` `0A9E8ECD…`; `macro-evidence-registry.v4.ts` `F52773C2…`, `.test.ts` `ED1F0B87…`; `macro-pilot-state.v4.ts` `42E2EA6F…`, `.test.ts` `803620C6…`; `macro-pilot.progressive-disclosure.test.tsx` `7579CB6E…`; modified `macro-pilot.tsx` `A8445457…`, `macro-pilot.module.css` `44BD936E…` (new versions; pre-existing session changes included).

### 7.5 Accessibility evidence — what was actually established vs NOT RUN

| Evidence | Status | Detail |
|---|---|---|
| jsdom: status region `role="status" aria-live="polite"`; single `role="alert"` on invalid state; labelled controls; focus tests; three disclosure summaries focusable | **PASS** | `macro-pilot.progressive-disclosure.test.tsx`, `macro-pilot.v4.integration.test.tsx`, `macro-pilot.remediation.test.tsx` |
| Arabic RTL / English LTR jsdom rendering, localized status/warnings, no duplicate landmarks | **PASS** | existing + new AR strings covered |
| Real browser (Chromium, `next dev`): page loads; Macro section renders; six inputs visible; Imperial-unit page fill→calculation; `VALID` envelope; "6 of 6 required inputs provided." | **PASS (functional smoke)** | performed this session; console shows one external `noise.svg` 402 (site asset, unrelated) |
| Lighthouse accessibility audit on the macro route | **PASS with findings** | score **0.94**; 3 failures: `color-contrast`, `heading-order` (`VERIFIED PAYMENT GATEWAYS…` site footer), `landmark-one-main` (`html.dark`) |

All three flagged items are **site-wide** header/footer/document-shell defects (M4-A11Y-05 territory, optional/R8). None is inside the Macro pilot tree; they were **not** silently fixed here (out of authorized scope) and must not be reported as PASS.

| Evidence | Status | Detail |
|---|---|---|
| Full screen-reader pass (NVDA/VoiceOver/Narrator/JAWS) | **NOT RUN** | no screen-reader available/run this session; cannot be converted to PASS |
| Full keyboard traversal (real browser Tab sequence through all six inputs, status region, Recalculate, links) | **NOT RUN** | the in-app browser did not dispatch Tab-focus movement in this environment (ActiveElement stayed on the first field) |
| Actual 375px execution (`scrollWidth <= innerWidth`) | **NOT RUN** | no viewport/emulation tool available; CSS media rules (`@media (max-width: 40rem)`, `overflow-x: clip`) verified only via CSS-content tests; **PARTIAL** |
| Full axe / deque-axe audit | **NOT RUN** | Lighthouse used instead (above); not equivalent to an axe pass |
| Real-browser Arabic RTL toggle | **NOT RUN** | site-wide language switch not toggled this session |
| Reduced-motion / 200% zoom / Windows High Contrast | **NOT RUN** | |

### 7.6 Browser review note

During the smoke session the page loaded with the site's default **Imperial** unit system (`Height (in)`, `Weight (lb)`; route shows real calculated output: `Target calories: 2633 kcal · Protein: 165 g · Carbohydrates: 343 g · Fat: 67 g`). The `noise.svg` 402 and `favicon.ico` 500 messages are site-level, pre-existing, and unrelated; no pilot action is taken on them in this scope.

---

## 8. Macro readiness decision

**Decision: Macro V4 = bounded pilot; NOT fully V4-complete; NOT production-ready; NOT released.**

- All additive closure code in this execution is present and its focused tests pass.
- Macro V6 remains byte-unchanged; the route, template, and R1/R2 acceptances are unchanged; no persistence/AI/cross-tool capability exists.
- The pilot can be called **Macro V4 Functionally Complete (Deterministic Scope)** only for the *implemented deterministic surface*, and only after the owner accepts the remaining R4 gate items (see §10). This report does **not** make that acceptance.
- No claim of production readiness, persistence, AI augmentation, cross-tool integration, or release is made.

---

## 9. Safety, compliance and remaining gaps (mandatory)

| Gap / requirement | Status | Why |
|---|---|---|
| M4-SAF-01 … M4-SAF-10 (full `SafetyContract`, operation risk registry, guards, permissions, escalation, fail-closed, audit policy, user-facing copy) | **BLOCKED / UNMET** | The owner deferred the two proposed safety-profile files; a full accepted `SafetyContract` instance (15 required fields) does not exist. Enforcement work remains deliberately undone. Existing deterministic protections and medical-boundary copy are preserved, not weakened |
| M4-SAF-04/05 guard wiring as a *policy-enforcing* runtime | **PARTIAL** | engine bounds exist and are tested; no new guard registry was added |
| M4-AI-01/02/03 `AICapabilityProfile` document (NOT_CONFIGURED, all ten prohibited, zero budget, `continue_deterministic` fallback, stop conditions) | **NOT IMPLEMENTED** | outside this session's execution; `prohibitedCapabilities`/full AI profile not created |
| M4-XT-01 context default (`contextUsed=[]`) | **COMPLETE** (verified in envelopes) | cross-tool enforcement absent, as intended |
| M4-XT-02 … M4-XT-08 | **BLOCKED** (R6 unauthorized) | |
| M4-PER-01 explicit `LOCAL_ONLY`/`NOT_SAVED` copy | **PARTIAL** | statement is truthful in the pilot; explicit status copy exists via default behavior; no storage exists |
| M4-PER-02 … M4-PER-07 | **BLOCKED** (R6 unauthorized) | |
| M4-A11Y-01 real keyboard traversal | **NOT RUN** | environment limitation |
| M4-A11Y-02 actual 375px execution | **NOT RUN** (CSS **PARTIAL**) | environment limitation |
| M4-A11Y-03 screen-reader pass | **NOT RUN** | |
| M4-A11Y-04 full axe | **NOT RUN** | Lighthouse ≠ axe |
| M4-A11Y-06 Arabic RTL equivalence — this execution's new strings | **PARTIAL→jsdom PASS; real browser NOT RUN** | |
| M4-GOV-01 formula/evidence registry — Mifflin record | **COMPLETE (candidate, vendor-unapproved)** | owner/governance review required before any "governed" claim |
| M4-GOV-02 formula-ledger protection | **PASS** | `macro.v6.ts` unchanged; 81/81 tests pass |
| M4-GOV-03/04 change record / traceability / release docs | **DEFERRED (R5/R8)** | |
| M4-GOV-05 V3→V4 compatibility register | **PARTIAL** | additive-only posture preserved; no register claimed approved |
| M4-EV-02 "governed rule ids" enforcement beyond textual conformance | **PARTIAL** | conformance-tested; no runtime registry enforcement |
| M4-EV-04 runtime engine-version invalidation | **PARTIAL** | policy function tested; no runtime watcher; cannot claim automatic invalidation |
| Input fingerprint | **DEFERRED** (owner) | not implemented; no hashing |
| Full V4 envelope completeness for non-applicable requirement classes | **n/a** | |

**Explicit conclusion:** any mandatory acceptance criterion that is `PARTIAL`, `NOT RUN` or `BLOCKED` above prevents an unqualified "V4 complete" claim.

---

## 10. Exact remaining requirements before the pilot can pass its acceptance gate

These are the items standing between the current state and an owner acceptance of the Macro V4 pilot under Revision 2.2 and the R4 scope:

1. **M4-SAF full safety closure** — owner decision and implementation of the full `SafetyContract` (or explicit, documented reason for deferral): M4-SAF-01 intended-use copy (visible, localized), M4-SAF-02 operation risk registry (LOW/MEDIUM/HIGH/CRITICAL rows, unknown→deny), M4-SAF-04/05 guard semantics wired as far as policy demands, M4-SAF-06 permission model (`none` beyond local deterministic calculation), M4-SAF-07 human-escalation boundary copy, M4-SAF-08 fail-closed rules, M4-SAF-09 audit policy (R6), M4-SAF-10 medical-boundary copy. The two previously proposed files remain **deferred, not authorized**; closing SAF means producing an owner-approved mechanism, not silently recreating them.
2. **M4-AI documented profile** — if the owner wants the accepted V4 AI profile shape produced (`NOT_CONFIGURED`, ten prohibited capabilities, zero budget, `continue_deterministic`, stop conditions), that is a separate explicit authorization; until then the pilot stays `NOT_CONFIGURED` with no AI profile claim.
3. **M4-A11Y execution evidence** — real keyboard traversal, actual 375px viewport (`scrollWidth <= innerWidth`), screen-reader pass, and a full axe audit (or owner-signed exceptions), including the Arabic shell in a real browser.
4. **M4-GOV owner review** — register the Mifflin/assumption-rule evidence record as governed, by owner approval of the registry record and its limitations (no invented review date).
5. **M4-OUT-07/M4-PER (gate before any persistence)** — R6 only, with consent, RLS, storage-state machine, audit policy; never before; `auditRef` stays absent.
6. **Owner's acceptance decision under Revision 2.2 §8** — the owner alone decides whether the final evidence set satisfies the pilot acceptance gate; this document does not self-accept anything.
7. **Safety contingency preserved** — existing deterministic protections (warnings, range validation, medical boundaries, permission-none posture) remain intact; nothing in this execution weakened them.

---

## 11. Compatibility and rollback

### 11.1 Compatibility

- All Batch A–E changes are **additive** (new profile/helper modules + presentation strings/styles) and consume accepted interfaces only.
- Route identity (`/smarttools/nutrition/macro`), registry, catalog, template, V3/V4 acceptances, and Macro V6 behavior are unchanged.
- Engine output is unchanged; a valid envelope still reports `CALCULATED`; a rejected input still produces no number; an empty input still produces no number.
- `calculationId` remains the operation identity; no fingerprint exists anywhere; units and imperial conversion are display-boundary only.
- No persistence or export path; the "does not save or share your inputs" copy is accurate for the current build behavior.

### 11.2 Rollback

**Batch A–C (profiles):** delete the six new files under `lib/engines/core/v4/profiles/` (`macro-input-metadata.v4.{ts,test.ts}`, `macro-output-policy.v4.{ts,test.ts}`, `macro-evidence-registry.v4.{ts,test.ts}`, `macro-pilot-state.v4.{ts,test.ts}`). They are not imported by runtime/adapter/template/engine; deletion has no runtime effect.

**Batch D (pilot presentation):** revert `components/tools/macro-pilot.tsx` and `components/tools/macro-pilot.module.css` to the pre-execution working-tree state, then delete `macro-pilot.progressive-disclosure.test.tsx`. Note both files were already modified by earlier authorized work (R3/R3.1); a `git checkout` would destroy that prior work and is **not** a safe rollback. Rollback is therefore **manual and block-scoped**: remove the profile imports, `requiredProgressText`/`presentationState` computation, the progress line, the `details` wrappers and their inner contents re-inline, the two meaning sections, the error-guidance line, the Arabic/English new strings, and the four new CSS blocks (`details`/`summary`/`:focus-visible`/mobile detail override).

**Verification after rollback:** re-run the 328-test closure set minus the deleted suites; expected = pre-execution baseline (258 pre-existing + 13 M4-IN-01 = 271 tests across 11 suites), `validate-tools` 5/5, protected-hashes green.

**Baseline reference:** `HEAD = 108d3063` remains untouched; checkpoints before/after are recoverable from the hashes in §8 and §7.4.

---

## 12. Toward the 255-tool program

**No R5 rollout was started. There is no 255-tool implementation in this change set.**

Verified baseline carried forward (not re-audited this session): **264 unique `toolId`s / 264 unique `href`s**, `SMART_TOOLS_CATALOG` 11 primary entries, 253 registry-only rows, 15 href-derived categories; `tools.registry.v7.252.ts` reports 266 rows / 265 unique ids and is out of scope. The 255 vs 264 vs 252 vs 268 counts are **not interchangeable**; 264 remains authoritative and **no tool is deleted, renamed, renumbered, or de-duplicated to force a target count.**

Recommendation for the first controlled SmartTools batch (for owner authorization only — not executed):

1. **Do not start until the Macro pilot acceptance gate is actually accepted** by the owner under §10.
2. **Batch size: no more than 3 tools**, selected from registry-verified, fully-tested engines in the same category as Macro (nutrition), i.e. tools with: an existing tested engine (e.g. a body-fat-class tool that carries engine tests), a registered identity, a working route pattern, no persistence/AI dependency, and a deterministic equation. Three is bounded, reviewable, and gives a genuine pattern test without opening a mass rollout.
3. Each batch member must ship with: exact tool ids/registry path, exact files (engine, schema, contract profile, route, pilot, template wiring, tests), a full pilot-style verification (identical gate evidence as Macro, including accessibility), explicit rollback (route-scoped removal + registry restore), and stop-conditions identical to this report.
4. A full 264-identity audit- and duplication-check is mandatory before any batch membership list is adopted, and no more than one batch is authorized per decision cycle.
5. Selection requires the owner's explicit sign-off on the exact member ids; "255" is a strategic horizon, not a license to bulk-generate tools.

---

## 13. Change inventory (exact paths)

**Created**

- `lib/engines/core/v4/profiles/macro-input-metadata.v4.ts`, `.../macro-input-metadata.v4.test.ts`
- `lib/engines/core/v4/profiles/macro-output-policy.v4.ts`, `.../macro-output-policy.v4.test.ts`
- `lib/engines/core/v4/profiles/macro-evidence-registry.v4.ts`, `.../macro-evidence-registry.v4.test.ts`
- `lib/engines/core/v4/profiles/macro-pilot-state.v4.ts`, `.../macro-pilot-state.v4.test.ts`
- `components/tools/macro-pilot.progressive-disclosure.test.tsx`
- `docs/MrXSteroid_Genius_Intelligence_V4.0/MACRO_V4_GROUPED_CAPABILITY_CLOSURE_EXECUTION_REPORT.md`

**Modified**

- `components/tools/macro-pilot.tsx` (unit-conversion source of truth moved to the additive profile; required-input progress; meaning/boundary explanations; AR/EN strings; three progressive-disclosure `<details>`; error-guidance line; degraded/unavailable state copy; controlled state resolution through the new helper)
- `components/tools/macro-pilot.module.css` (`details`/`summary` V4-scoped cards, `summary:focus-visible` outline, mobile padding override)

**Deliberately absent**

- `lib/engines/core/v4/profiles/macro-safety-profile.v4.ts` / `.test.ts` (owner-deferred)
- Any fingerprint/hash/secret/salt/HMAC; any `auditRef`; any persistence, export, or cross-tool wiring; any AI profile instantiation; any registry/catalog/route/template change.

**Not run / not changed**

- Production build; Git operations; Supabase/migrations; dependencies; dashboards/auth/payments; revision 2.3.

---

## 14. Final statement

Macro V4 grouped capability closure (Batches A–E) has been implemented, executed, and honestly verified to the limits of this environment. The work is additive: the accepted contracts, runtime, adapter, Macro V6, Template V4, and the M4-IN-01 checkpoint are all preserved and hash-verified. No persistence, AI, fingerprint, or cross-tool capability exists or is implied. The pilot remains a bounded, deterministic, non-persisted tool that displays estimates, explicitly disclaims medical advice, and does not store user data.

It is **not** fully V4-complete. The remaining gate items in §10 — most importantly the safety-contract decision, the executed accessibility evidence, and the owner's explicit acceptance — decide whether Macro passes its pilot acceptance gate. The first SmartTools batch toward the 255-tool objective is **recommended, not started**, and demands a separate explicit owner authorization against the verified 264-identity inventory.
