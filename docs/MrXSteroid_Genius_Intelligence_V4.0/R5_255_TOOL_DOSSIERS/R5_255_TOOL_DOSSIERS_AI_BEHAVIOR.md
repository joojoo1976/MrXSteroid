# R5 255-TOOL PER-TOOL DOSSIERS — AI BEHAVIOR

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 6 catalog entries in this category (6 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### 247 — Habit Check-in Log

- **Stable ID:** `mrx.tool.247-habit-intelligence-coach`
- **Category / route / status:** AI Behavior · `/smarttools/ai-behavior/tool-247-habit-intelligence-coach` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Records a habit and a user-selected completion state; no adherence score, prediction, or coaching recommendation.
- **Inputs:** habit:string [1..120]; completed:other unbounded; recordedOn:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-247-habit-intelligence-coach.tsx`; engine `lib/tools/engines/tool-247-habit-coach.v7.ts`; schema `lib/tools/schemas/tool-247-habit-intelligence-coach.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Emergency Warning Checklist (tool-248-safety-gate-emergency-protocol); Scientific Evidence Explorer (tool-249-scientific-evidence-explorer); Session-Only Fitness Notes (tool-250-personal-fitness-memory-layer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-behavior/tool-247-habit-intelligence-coach with stable ID mrx.tool.247-habit-intelligence-coach.
2. Typed HabitRecordInputV7Schema exposes 3 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordHabit; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Habit Check-in Log.** In: habit, completed | Out: versioned formula sheet + the displayed result | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for habit.** In: habit:string [1..120]; completed:other unbounded; recordedOn:other unbounded | Out: field-level validation messages + canonical value | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Habit Check-in Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for habit.** In: changed habit with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for habit.** In: global metric/imperial preference + habit | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Habit Check-in Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Habit Check-in Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Emergency Warning Checklist (tool-248-safety-gate-emergency-protocol).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 248 — Emergency Warning Checklist

- **Stable ID:** `mrx.tool.248-safety-gate-emergency-protocol`
- **Category / route / status:** AI Behavior · `/smarttools/ai-behavior/tool-248-safety-gate-emergency-protocol` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Fixed ACEP/MedlinePlus warning-sign checklist with explicit age and answer selection; no diagnosis or safety clearance.
- **Inputs:** signals:array [1..120]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-248-safety-gate-emergency-protocol.tsx`; engine `lib/tools/engines/tool-248-safety-gate.v7.ts`; schema `lib/tools/schemas/tool-248-safety-gate.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Habit Check-in Log (tool-247-habit-intelligence-coach); Scientific Evidence Explorer (tool-249-scientific-evidence-explorer); Session-Only Fitness Notes (tool-250-personal-fitness-memory-layer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-behavior/tool-248-safety-gate-emergency-protocol with stable ID mrx.tool.248-safety-gate-emergency-protocol.
2. Typed parsed exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports evaluateSafetyGateV7, matchSafetySignals; no model-generated number overrides the engine.
4. Uses ARIA/role/sr-only attributes in the component.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Emergency Warning Checklist.** In: signals, signals | Out: versioned formula sheet + the displayed result | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for signals.** In: signals:array [1..120] | Out: field-level validation messages + canonical value | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Emergency Warning Checklist.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for signals.** In: changed signals with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for signals.** In: global metric/imperial preference + signals | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Emergency Warning Checklist.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Emergency Warning Checklist.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Habit Check-in Log (tool-247-habit-intelligence-coach).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 249 — Scientific Evidence Explorer

- **Stable ID:** `mrx.tool.249-scientific-evidence-explorer`
- **Category / route / status:** AI Behavior · `/smarttools/ai-behavior/tool-249-scientific-evidence-explorer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Queries PubMed through a separately identified NCBI contract and displays returned citation fields only; no quality score or recommendation.
- **Inputs:** query:string [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-249-scientific-evidence-explorer.tsx`; engine `lib/tools/engines/tool-249-evidence-explorer.v7.ts`; schema `lib/tools/schemas/tool-249-evidence-explorer.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Emergency Warning Checklist (tool-248-safety-gate-emergency-protocol); Session-Only Fitness Notes (tool-250-personal-fitness-memory-layer); Habit Check-in Log (tool-247-habit-intelligence-coach).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-behavior/tool-249-scientific-evidence-explorer with stable ID mrx.tool.249-scientific-evidence-explorer.
2. Typed EvidenceExplorerV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordEvidenceQuery, searchEvidenceV7; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Scientific Evidence Explorer.** In: query, query | Out: versioned formula sheet + the displayed result | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for query.** In: query:string [1..300] | Out: field-level validation messages + canonical value | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Scientific Evidence Explorer.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for query.** In: changed query with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for query.** In: global metric/imperial preference + query | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Scientific Evidence Explorer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Scientific Evidence Explorer.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Emergency Warning Checklist (tool-248-safety-gate-emergency-protocol).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 250 — Session-Only Fitness Notes

- **Stable ID:** `mrx.tool.250-personal-fitness-memory-layer`
- **Category / route / status:** AI Behavior · `/smarttools/ai-behavior/tool-250-personal-fitness-memory-layer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-selected notes held only in the current page session; no persistence, synchronization, or cross-tool import.
- **Inputs:** entry:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-250-personal-fitness-memory-layer.tsx`; engine `lib/tools/engines/tool-250-memory-layer.v7.ts`; schema `lib/tools/schemas/tool-250-personal-fitness-memory-layer.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Scientific Evidence Explorer (tool-249-scientific-evidence-explorer); Physique Scenario Simulator (tool-251-physique-trajectory-simulator); Emergency Warning Checklist (tool-248-safety-gate-emergency-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-behavior/tool-250-personal-fitness-memory-layer with stable ID mrx.tool.250-personal-fitness-memory-layer.
2. Typed SessionMemoryInputV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSessionMemory; no model-generated number overrides the engine.
4. Uses ARIA/role/sr-only attributes in the component.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Session-Only Fitness Notes.** In: entry, entry | Out: versioned formula sheet + the displayed result | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entry.** In: entry:string [1..400] | Out: field-level validation messages + canonical value | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Session-Only Fitness Notes.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entry.** In: changed entry with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entry.** In: global metric/imperial preference + entry | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Session-Only Fitness Notes.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Session-Only Fitness Notes.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Scientific Evidence Explorer (tool-249-scientific-evidence-explorer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 251 — Physique Scenario Simulator

- **Stable ID:** `mrx.tool.251-physique-trajectory-simulator`
- **Category / route / status:** AI Behavior · `/smarttools/ai-behavior/tool-251-physique-trajectory-simulator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Calculates up to three user-selected constant-rate arithmetic scenarios; not a prediction or recommendation.
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-251-physique-trajectory-simulator.tsx`; engine `lib/tools/engines/tool-251-physique-trajectory.v7.ts`; schema `lib/tools/schemas/tool-251-physique-trajectory.v7.ts`; tests 1; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **PASS** — deterministic scenario arithmetic with disclosed constant-lean-mass assumption; not a forecast. Reference accuracy NOT RUN.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** Session-Only Fitness Notes (tool-250-personal-fitness-memory-layer); Manual Context Board (tool-252-command-center); Scientific Evidence Explorer (tool-249-scientific-evidence-explorer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-behavior/tool-251-physique-trajectory-simulator with stable ID mrx.tool.251-physique-trajectory-simulator.
2. Deterministic engine exports inspectPhysiqueTrajectoryV7, calculatePhysiqueTrajectoryV7; no model-generated number overrides the engine.
3. 1 test file(s) matched; 0 numeric assertion(s) detected.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — deterministic scenario arithmetic with disclosed constant-lean-mass assumption; not a forecast. Reference accuracy NOT RUN.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Physique Scenario Simulator.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: platform consent/safety contract and deterministic fallback rules | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: platform consent/safety contract and deterministic fallback rules | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Physique Scenario Simulator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Physique Scenario Simulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Physique Scenario Simulator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Session-Only Fitness Notes (tool-250-personal-fitness-memory-layer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Number.isFinite(number) ? String(Number((number * factor).toPrecision(8))) : value;` `return Number.isFinite(number) ? String(Number((number * factor).toPrecision(8))) : token;` `return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);` `return Number.isFinite(parsed) ? parsed * displayToKg : Number.NaN;`

---

### 252 — Manual Context Board

- **Stable ID:** `mrx.tool.252-command-center`
- **Category / route / status:** AI Behavior · `/smarttools/ai-behavior/tool-252-command-center` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Displays only entries explicitly selected and entered by the user, including their supplied source, unit, date, and status.
- **Inputs:** entries:array [?..20]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-252-command-center.tsx`; engine `lib/tools/engines/tool-252-command-center.v7.ts`; schema `lib/tools/schemas/tool-252-command-center.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Physique Scenario Simulator (tool-251-physique-trajectory-simulator); Session-Only Fitness Notes (tool-250-personal-fitness-memory-layer); Scientific Evidence Explorer (tool-249-scientific-evidence-explorer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-behavior/tool-252-command-center with stable ID mrx.tool.252-command-center.
2. Typed ManualCommandInputV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports assembleCommandEntries; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Manual Context Board.** In: entries, entries | Out: versioned formula sheet + the displayed result | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..20] | Out: field-level validation messages + canonical value | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Manual Context Board.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: platform consent/safety contract and deterministic fallback rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Manual Context Board.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Manual Context Board.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Physique Scenario Simulator (tool-251-physique-trajectory-simulator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---
