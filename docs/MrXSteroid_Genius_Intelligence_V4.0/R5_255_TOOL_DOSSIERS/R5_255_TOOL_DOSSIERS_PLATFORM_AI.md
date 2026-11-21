# R5 255-TOOL PER-TOOL DOSSIERS — PLATFORM AI

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 7 catalog entries in this category (7 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### 100 — Comprehensive Report Generator

- **Stable ID:** `mrx.tool.100-comprehensive-report-generator`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-100-comprehensive-report-generator` · **FAIL** (confirmed formula/provenance defect (see formula status))
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Multi-tool unified report export
- **Inputs:** cardiovascular_risk_score:number [0..100]; hepatic_stress_score:number [0..100]; endocrine_suppression_score:number [0..100]; metabolic_vitality_score:number [0..100]; active_red_flag_symptoms_count:number [0..100] int
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-100-comprehensive-report-generator.tsx`; engine `lib/tools/engines/tool-100-comprehensive-report-generator.ts`; schema `lib/tools/schemas/tool-100-comprehensive-report-generator.ts`; tests 1; i18n `i18n/tool-100-comprehensive-report-generator.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **FAIL** — the "comprehensive report" echoes five input scores; no synthesis model, reference ranges or narrative engine.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; no ARIA; no <main>.
- **Related:** AI Health Data Fusion Hub & Timeline (tool-105-ai-health-data-fusion-hub); Weekly Habit Consistency Tracker (tool-145-habit-intelligence-consistency-coach); Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-100-comprehensive-report-generator with stable ID mrx.tool.100-comprehensive-report-generator.
2. Typed ComprehensiveReportGeneratorInputSchema exposes 5 field(s); 5 carry explicit bounds.
3. Deterministic engine exports generateComprehensiveReport; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-100-comprehensive-report-generator.json exists (7 AR / 7 EN keys).

**Five evidence-backed gaps**
1. Formula status FAIL: the "comprehensive report" echoes five input scores; no synthesis model, reference ranges or narrative engine.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Comprehensive Report Generator.** In: cardiovascular_risk_score, hepatic_stress_score | Out: versioned formula sheet + the displayed result | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for cardiovascular_risk_score.** In: cardiovascular_risk_score:number [0..100]; hepatic_stress_score:number [0..100]; endocrine_suppression_score:number [0..100]; metabolic_vitality_score:number [0..100]; +1 more | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Comprehensive Report Generator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cardiovascular_risk_score.** In: changed cardiovascular_risk_score with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for cardiovascular_risk_score.** In: global metric/imperial preference + cardiovascular_risk_score | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Comprehensive Report Generator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Comprehensive Report Generator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Health Data Fusion Hub & Timeline (tool-105-ai-health-data-fusion-hub).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 105 — AI Health Data Fusion Hub & Timeline

- **Stable ID:** `mrx.tool.105-ai-health-data-fusion-hub`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-105-ai-health-data-fusion-hub` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** FHIR-style health data fusion timeline
- **Inputs:** events:array [1..500]; consent_given:other unbounded; authenticated:other unbounded
- **Outputs:** timeline, event_count, category_counts, trends, persistence_mode
- **Evidence:** component `components/tools/tool-105-ai-health-data-fusion-hub.tsx`; engine `lib/tools/engines/tool-105-ai-health-data-fusion-hub.ts`; schema `lib/tools/schemas/tool-105-ai-health-data-fusion-hub.ts`; tests 1; i18n `i18n/tool-105-ai-health-data-fusion-hub.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Comprehensive Report Generator (tool-100-comprehensive-report-generator); Weekly Habit Consistency Tracker (tool-145-habit-intelligence-consistency-coach); Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-105-ai-health-data-fusion-hub with stable ID mrx.tool.105-ai-health-data-fusion-hub.
2. Typed HealthFusionInputSchema exposes 3 field(s); 1 carry explicit bounds.
3. Deterministic engine exports buildTimeline, detectTrends, fuseHealthData; no model-generated number overrides the engine.
4. 1 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-105-ai-health-data-fusion-hub.json exists (? AR / ? EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Health Data Fusion Hub & Timeline.** In: events, consent_given | Out: versioned formula sheet + timeline | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for events.** In: events:array [1..500]; consent_given:other unbounded; authenticated:other unbounded | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Health Data Fusion Hub & Timeline.** In: timeline, event_count | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for events.** In: changed events with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from timeline.** In: timeline + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for events.** In: global metric/imperial preference + events | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Health Data Fusion Hub & Timeline.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Health Data Fusion Hub & Timeline.** In: timeline, event_count | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of timeline.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Comprehensive Report Generator (tool-100-comprehensive-report-generator).** In: approved subset of timeline | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `if (a.date !== b.date) return a.date < b.date ? -1 : 1;` `if (a.category !== b.category) return a.category < b.category ? -1 : 1;` `return a.code < b.code ? -1 : 1;` `const change = fv !== 0 ? Math.round(((lv - fv) / Math.abs(fv)) * 1000) / 10 : null;`

---

### 145 — Weekly Habit Consistency Tracker

- **Stable ID:** `mrx.tool.145-habit-intelligence-consistency-coach`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-145-habit-intelligence-consistency-coach` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** User-entered weekly habit completion summary
- **Inputs:** habits:array [1..8]
- **Outputs:** totalCompleted, totalTracked, weeklyRate, habits, method
- **Evidence:** component `components/tools/tool-145-habit-intelligence-consistency-coach.tsx`; engine `lib/tools/engines/tool-145-habit-intelligence-consistency-coach.v6.ts`; schema `lib/tools/schemas/tool-145-habit-intelligence-consistency-coach.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol); Scientific Evidence Explorer & Citation Search (tool-147-scientific-evidence-explorer); Session-only Personal Fitness Context (tool-148-personal-fitness-memory-layer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-145-habit-intelligence-consistency-coach with stable ID mrx.tool.145-habit-intelligence-consistency-coach.
2. Typed HabitConsistencyInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateHabitConsistencyV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 1 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Weekly Habit Consistency Tracker.** In: habits, habits | Out: versioned formula sheet + totalCompleted | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for habits.** In: habits:array [1..8] | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Weekly Habit Consistency Tracker.** In: totalCompleted, totalTracked | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for habits.** In: changed habits with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from totalCompleted.** In: totalCompleted + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for habits.** In: global metric/imperial preference + habits | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Weekly Habit Consistency Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Weekly Habit Consistency Tracker.** In: totalCompleted, totalTracked | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of totalCompleted.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol).** In: approved subset of totalCompleted | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `longestStreak = Math.max(longestStreak, streak);` `return { name, completedDays, weeklyRate: Math.round((completedDays / 7) * 100), currentStreak, longestStreak };` `const totalTracked = habits.length * 7;` `return { totalCompleted, totalTracked, weeklyRate: Math.round((totalCompleted / totalTracked) * 100), habits, method: 'completed tracked days divided by 7 tracked days per habit' };`

---

### 146 — Emergency Warning Signs Checklist

- **Stable ID:** `mrx.tool.146-ai-safety-gate-emergency-protocol`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Fixed-rule emergency warning-sign checklist; no AI or diagnosis
- **Inputs:** ageGroup:enum enum(adult\|child); answers:array [1..?] enum(yes\|no\|unsure)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-146-emergency-warning-signs-checklist.tsx`; engine `lib/tools/engines/tool-146-emergency-warning-signs-checklist.v6.ts`; schema `lib/tools/schemas/tool-146-emergency-warning-signs-checklist.ts`; tests 3; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Weekly Habit Consistency Tracker (tool-145-habit-intelligence-consistency-coach); Scientific Evidence Explorer & Citation Search (tool-147-scientific-evidence-explorer); Session-only Personal Fitness Context (tool-148-personal-fitness-memory-layer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-146-ai-safety-gate-emergency-protocol with stable ID mrx.tool.146-ai-safety-gate-emergency-protocol.
2. Typed EmergencyChecklistDraftSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports validateEmergencyRulePack, resolveLocalEmergencyNumber, inspectEmergencyChecklistDraft; no model-generated number overrides the engine.
4. 3 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 3 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Emergency Warning Signs Checklist.** In: ageGroup, answers | Out: versioned formula sheet + the displayed result | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for ageGroup.** In: ageGroup:enum enum(adult|child); answers:array [1..?] enum(yes|no|unsure) | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Emergency Warning Signs Checklist.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for ageGroup.** In: changed ageGroup with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for ageGroup.** In: global metric/imperial preference + ageGroup | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Emergency Warning Signs Checklist.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Emergency Warning Signs Checklist.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Weekly Habit Consistency Tracker (tool-145-habit-intelligence-consistency-coach).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return { status: 'NOT_AVAILABLE', countryCode, reason: 'No country-specific number with a reviewed official source is configured; use your local emergency number.' };` `if (input.answers.length > 0) return { status: 'INVALID_INPUT', errors: ['Select an age group before entering warning-sign answers.'] };` `return { status: 'INVALID_INPUT', errors: ['Answers contain a duplicate or unknown warning-sign identifier.'] };`

---

### 147 — Scientific Evidence Explorer & Citation Search

- **Stable ID:** `mrx.tool.147-scientific-evidence-explorer`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-147-scientific-evidence-explorer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Search PubMed citation metadata returned by NCBI; no generated summaries, evidence grades, or recommendations
- **Inputs:** query:string [1..256]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-147-scientific-evidence-explorer.tsx`; engine `lib/tools/engines/tool-147-scientific-evidence-explorer.ts`; schema `lib/tools/schemas/tool-147-scientific-evidence-explorer.ts`; tests 2; i18n `i18n/tool-147-scientific-evidence-explorer.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol); Session-only Personal Fitness Context (tool-148-personal-fitness-memory-layer); Weekly Habit Consistency Tracker (tool-145-habit-intelligence-consistency-coach).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-147-scientific-evidence-explorer with stable ID mrx.tool.147-scientific-evidence-explorer.
2. Typed PubMedSearchInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports searchPubMedV7, searchPubMedWithIdentity; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-147-scientific-evidence-explorer.json exists (19 AR / 19 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Scientific Evidence Explorer & Citation Search.** In: query, query | Out: versioned formula sheet + the displayed result | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for query.** In: query:string [1..256] | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Scientific Evidence Explorer & Citation Search.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for query.** In: changed query with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for query.** In: global metric/imperial preference + query | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Scientific Evidence Explorer & Citation Search.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Scientific Evidence Explorer & Citation Search.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';` `const searchUrl = new URL(\`${NCBI_BASE_URL}/esearch.fcgi\`);` `const summaryUrl = new URL(\`${NCBI_BASE_URL}/esummary.fcgi\`);` `const response = await fetch('/api/smarttools/tool-147', {`

---

### 148 — Session-only Personal Fitness Context

- **Stable ID:** `mrx.tool.148-personal-fitness-memory-layer`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-148-personal-fitness-memory-layer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-controlled, in-memory fitness context with explicit per-tool sharing; cleared when the SmartTools session ends
- **Inputs:** id:string [1..80]; field:other unbounded; value:number unbounded; unit:string [1..24]; source:string [1..160]; recordedOn:string unbounded; shareWithTool149:other unbounded; shareGrantedAt:string optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-148-personal-fitness-memory-layer.tsx`; engine `lib/tools/engines/tool-148-personal-fitness-memory-layer.v6.ts`; schema `lib/tools/schemas/tool-148-personal-fitness-memory-layer.ts`; tests 2; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Scientific Evidence Explorer & Citation Search (tool-147-scientific-evidence-explorer); Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol); Manual Performance Results Organizer (tool-150-ai-performance-command-center).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-148-personal-fitness-memory-layer with stable ID mrx.tool.148-personal-fitness-memory-layer.
2. Typed PersonalFitnessContextItemSchema exposes 8 field(s); 3 carry explicit bounds.
3. Deterministic engine exports validatePersonalFitnessContextItem, validatePersonalFitnessContextList, selectPersonalContextForTool; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Session-only Personal Fitness Context.** In: id, field | Out: versioned formula sheet + the displayed result | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for id.** In: id:string [1..80]; field:other unbounded; value:number unbounded; unit:string [1..24]; +4 more | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Session-only Personal Fitness Context.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for id.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Session-only Personal Fitness Context.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Session-only Personal Fitness Context.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Scientific Evidence Explorer & Citation Search (tool-147-scientific-evidence-explorer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const kgPerLb = 1 / 2.20462;` `return \`session-fitness-${uuid ?? \`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}\`}\`;` `return isWeight && unitSystem === 'imperial' ? parsed * kgPerLb : parsed;`

---

### 150 — Manual Performance Results Organizer

- **Stable ID:** `mrx.tool.150-ai-performance-command-center`
- **Category / route / status:** Platform AI · `/smarttools/platform-ai/tool-150-ai-performance-command-center` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-selected results listed with source, unit, date and explicit data status
- **Inputs:** entries:array [?..20]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-150-ai-performance-command-center.tsx`; engine `lib/tools/engines/tool-150-ai-performance-command-center.v6.ts`; schema `lib/tools/schemas/tool-150-ai-performance-command-center.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Session-only Personal Fitness Context (tool-148-personal-fitness-memory-layer); Scientific Evidence Explorer & Citation Search (tool-147-scientific-evidence-explorer); Emergency Warning Signs Checklist (tool-146-ai-safety-gate-emergency-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/platform-ai/tool-150-ai-performance-command-center with stable ID mrx.tool.150-ai-performance-command-center.
2. Typed ManualAggregationInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports inspectManualAggregationDraft, assembleManualToolResults; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Manual Performance Results Organizer.** In: entries, entries | Out: versioned formula sheet + the displayed result | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..20] | Out: field-level validation messages + canonical value | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Manual Performance Results Organizer.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform contract plus validated tool outputs; no model may override an engine value | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Manual Performance Results Organizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Manual Performance Results Organizer.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Session-only Personal Fitness Context (tool-148-personal-fitness-memory-layer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return metric.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');` `return trimmed !== '' && Number.isFinite(numeric) ? String(numeric) : trimmed.normalize('NFKC').toLocaleLowerCase('en-US');` `return { status: 'NOT_AVAILABLE', reason: 'No user-selected entries were provided.' };`

---
