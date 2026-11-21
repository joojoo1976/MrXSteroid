# R5 255-TOOL PER-TOOL DOSSIERS — MEDICAL MONITORING

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 73 catalog entries in this category (73 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — Smart Lab Reference

- **Stable ID:** `mrx.tool.lab`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/lab` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Bloodwork reference ranges with contextual interpretation
- **Inputs:** glucose:number [0..500]; totalCholesterol:number [0..500]; hdl:number [0..200]; ldl:number [0..300]; triglycerides:number [0..500]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/lab.tsx`; engine `lib/tools/engines/lab.ts`; schema `lib/tools/schemas/lab.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Bloodwork Record Log (tool-007-bloodwork-analyzer); Side Effect Tracker (tool-008-side-effect-tracker); Drug Interaction Checker (tool-017-drug-interaction).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/lab with stable ID mrx.tool.lab.
2. Typed LabInputSchema exposes 5 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateLab; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Engine text contains a source/reference signal.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Smart Lab Reference.** In: glucose, totalCholesterol | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for glucose.** In: glucose:number [0..500]; totalCholesterol:number [0..500]; hdl:number [0..200]; ldl:number [0..300]; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Smart Lab Reference.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for glucose.** In: changed glucose with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for glucose.** In: global metric/imperial preference + glucose | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Smart Lab Reference.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Smart Lab Reference.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Bloodwork Record Log (tool-007-bloodwork-analyzer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 007 — Bloodwork Record Log

- **Stable ID:** `mrx.tool.007-bloodwork-analyzer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-007-bloodwork-analyzer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Session-only transcription of user-provided lab values; no clinical interpretation
- **Inputs:** id:string unbounded; markerName:string [1..120]; value:number unbounded; unit:string [1..24]; sourceLabel:string [1..160]; referenceInterval:string [?..120] optional; sampleDate:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-007-bloodwork-analyzer.tsx`; engine `lib/tools/engines/tool-007-bloodwork-analyzer.ts`; schema `lib/tools/schemas/tool-007-bloodwork-analyzer.ts`; tests 2; i18n `i18n/tool-007-bloodwork-analyzer.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Side Effect Tracker (tool-008-side-effect-tracker); Drug Interaction Checker (tool-017-drug-interaction); Cardio Monitor (tool-019-cardio-monitor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-007-bloodwork-analyzer with stable ID mrx.tool.007-bloodwork-analyzer.
2. Typed BloodworkRecordSchema exposes 7 field(s); 4 carry explicit bounds.
3. Deterministic engine exports buildBloodworkSessionV7; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-007-bloodwork-analyzer.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Bloodwork Record Log.** In: id, markerName | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for id.** In: id:string unbounded; markerName:string [1..120]; value:number unbounded; unit:string [1..24]; +3 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Bloodwork Record Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for id.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Bloodwork Record Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Bloodwork Record Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Side Effect Tracker (tool-008-side-effect-tracker).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 008 — Side Effect Tracker

- **Stable ID:** `mrx.tool.008-side-effect-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-008-side-effect-tracker` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Track cycle side effects
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-008-side-effect-tracker.tsx`; engine `lib/tools/engines/tool-008-side-effect-tracker.ts`; schema `lib/tools/schemas/tool-008-side-effect-tracker.ts`; tests 1; i18n `i18n/tool-008-side-effect-tracker.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Bloodwork Record Log (tool-007-bloodwork-analyzer); Drug Interaction Checker (tool-017-drug-interaction); Cardio Monitor (tool-019-cardio-monitor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-008-side-effect-tracker with stable ID mrx.tool.008-side-effect-tracker.
2. 1 test file(s) matched; 0 numeric assertion(s) detected.
3. Tool-specific i18n file i18n/tool-008-side-effect-tracker.json exists (20 AR / 20 EN keys).
4. Uses ARIA/role/sr-only attributes in the component.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Side Effect Tracker.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Side Effect Tracker.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Side Effect Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Side Effect Tracker.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Bloodwork Record Log (tool-007-bloodwork-analyzer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 017 — Drug Interaction Checker

- **Stable ID:** `mrx.tool.017-drug-interaction`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-017-drug-interaction` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Compound and medication screening
- **Inputs:** status:other unbounded; reason:other unbounded
- **Outputs:** status, reason
- **Evidence:** component `components/tools/tool-017-drug-interaction.tsx`; engine `lib/tools/engines/tool-017-drug-interaction.ts`; schema `lib/tools/schemas/tool-017-drug-interaction.ts`; tests 2; i18n `i18n/tool-017-drug-interaction.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Cardio Monitor (tool-019-cardio-monitor); Lab Reference Interval Comparison (tool-024-bloodwork-interpreter); Medication & Compound Session List (tool-025-drug-interaction-pro).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-017-drug-interaction with stable ID mrx.tool.017-drug-interaction.
2. Typed DrugInteractionResultSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports checkDrugInteractions; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-017-drug-interaction.json exists (6 AR / 6 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Drug Interaction Checker.** In: status, reason | Out: versioned formula sheet + status | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for status.** In: status:other unbounded; reason:other unbounded | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Drug Interaction Checker.** In: status, reason | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for status.** In: changed status with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for status.** In: global metric/imperial preference + status | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Drug Interaction Checker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Drug Interaction Checker.** In: status, reason | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cardio Monitor (tool-019-cardio-monitor).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 019 — Cardio Monitor

- **Stable ID:** `mrx.tool.019-cardio-monitor`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-019-cardio-monitor` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** BP and lipid risk monitor
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-019-cardio-monitor.tsx`; engine `lib/tools/engines/tool-019-cardio-monitor.ts`; schema `lib/tools/schemas/tool-019-cardio-monitor.ts`; tests 0; i18n `i18n/tool-019-cardio-monitor.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; no ARIA; no <main>.
- **Related:** Drug Interaction Checker (tool-017-drug-interaction); Lab Reference Interval Comparison (tool-024-bloodwork-interpreter); Medication & Compound Session List (tool-025-drug-interaction-pro).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-019-cardio-monitor with stable ID mrx.tool.019-cardio-monitor.
2. Deterministic engine exports calculateCardioRisk; no model-generated number overrides the engine.
3. Tool-specific i18n file i18n/tool-019-cardio-monitor.json exists (7 AR / 7 EN keys).
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cardio Monitor.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cardio Monitor.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cardio Monitor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cardio Monitor.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Drug Interaction Checker (tool-017-drug-interaction).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const calculatedLDL = ldl_cholesterol || Math.max(0, cholesterol_total - hdl_cholesterol - (triglycerides || 0) / 5);` `const cholesterolRatio = cholesterol_total / hdl_cholesterol;` `cholesterol_ratio: Math.round(cholesterolRatio * 10) / 10,`

---

### 024 — Lab Reference Interval Comparison

- **Stable ID:** `mrx.tool.024-bloodwork-interpreter`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-024-bloodwork-interpreter` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Session-only arithmetic comparison with intervals and sources entered by the user; no clinical interpretation
- **Inputs:** records:array [1..30]
- **Outputs:** resultOrigin, comparisons
- **Evidence:** component `components/tools/tool-024-bloodwork-interpreter.tsx`; engine `lib/tools/engines/tool-024-bloodwork-interpreter.ts`; schema `lib/tools/schemas/tool-024-bloodwork-interpreter.ts`; tests 3; i18n `i18n/tool-024-bloodwork-interpreter.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Medication & Compound Session List (tool-025-drug-interaction-pro); Cardio Monitor (tool-019-cardio-monitor); Personal Measurement Summary (tool-029-side-effect-early-warning).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-024-bloodwork-interpreter with stable ID mrx.tool.024-bloodwork-interpreter.
2. Typed BloodworkComparisonInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports compareBloodworkToEnteredIntervalsV7; no model-generated number overrides the engine.
4. 3 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-024-bloodwork-interpreter.json exists (22 AR / 22 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 3 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Lab Reference Interval Comparison.** In: records, records | Out: versioned formula sheet + resultOrigin | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for records.** In: records:array [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Lab Reference Interval Comparison.** In: resultOrigin, comparisons | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for records.** In: changed records with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultOrigin.** In: resultOrigin + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for records.** In: global metric/imperial preference + records | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Lab Reference Interval Comparison.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Lab Reference Interval Comparison.** In: resultOrigin, comparisons | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultOrigin.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Medication & Compound Session List (tool-025-drug-interaction-pro).** In: approved subset of resultOrigin | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 025 — Medication & Compound Session List

- **Stable ID:** `mrx.tool.025-drug-interaction-pro`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-025-drug-interaction-pro` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** A session-only user-provided list; interaction screening is not available
- **Inputs:** entries:array [?..50]
- **Outputs:** resultOrigin, interactionAssessment, reason, entries
- **Evidence:** component `components/tools/tool-025-drug-interaction-pro.tsx`; engine `lib/tools/engines/tool-025-drug-interaction-pro.ts`; schema `lib/tools/schemas/tool-025-drug-interaction-pro.ts`; tests 3; i18n `i18n/tool-025-drug-interaction-pro.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Lab Reference Interval Comparison (tool-024-bloodwork-interpreter); Personal Measurement Summary (tool-029-side-effect-early-warning); Cardio Monitor (tool-019-cardio-monitor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-025-drug-interaction-pro with stable ID mrx.tool.025-drug-interaction-pro.
2. Typed MedicationSessionInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports buildMedicationSessionV7; no model-generated number overrides the engine.
4. 3 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-025-drug-interaction-pro.json exists (20 AR / 20 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 3 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Medication & Compound Session List.** In: entries, entries | Out: versioned formula sheet + resultOrigin | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..50] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Medication & Compound Session List.** In: resultOrigin, interactionAssessment | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultOrigin.** In: resultOrigin + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Medication & Compound Session List.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Medication & Compound Session List.** In: resultOrigin, interactionAssessment | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultOrigin.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Lab Reference Interval Comparison (tool-024-bloodwork-interpreter).** In: approved subset of resultOrigin | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 029 — Personal Measurement Summary

- **Stable ID:** `mrx.tool.029-side-effect-warning`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-029-side-effect-early-warning` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Session-only descriptive summaries of user-entered blood-pressure and pulse readings; no clinical assessment
- **Inputs:** readings:array [1..200]
- **Outputs:** resultOrigin, method, clinicalAssessment, readings, summaries
- **Evidence:** component `components/tools/tool-029-side-effect-early-warning.tsx`; engine `lib/tools/engines/tool-029-side-effect-early-warning.ts`; schema `lib/tools/schemas/tool-029-side-effect-early-warning.ts`; tests 3; i18n `i18n/tool-029-side-effect-early-warning.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Medication & Compound Session List (tool-025-drug-interaction-pro); Lab Reading Trend Summary (tool-033-bloodwork-trend-analyzer); Lab Reference Interval Comparison (tool-024-bloodwork-interpreter).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-029-side-effect-early-warning with stable ID mrx.tool.029-side-effect-warning.
2. Typed MeasurementSummaryInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports summarizeMeasurementReadingsV7; no model-generated number overrides the engine.
4. 3 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-029-side-effect-early-warning.json exists (28 AR / 28 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 3 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Personal Measurement Summary.** In: readings, readings | Out: versioned formula sheet + resultOrigin | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for readings.** In: readings:array [1..200] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Personal Measurement Summary.** In: resultOrigin, method | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for readings.** In: changed readings with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultOrigin.** In: resultOrigin + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for readings.** In: global metric/imperial preference + readings | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Personal Measurement Summary.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Personal Measurement Summary.** In: resultOrigin, method | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultOrigin.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Medication & Compound Session List (tool-025-drug-interaction-pro).** In: approved subset of resultOrigin | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `minimum: Math.min(...values),` `maximum: Math.max(...values),`

---

### 033 — Lab Reading Trend Summary

- **Stable ID:** `mrx.tool.033-bloodwork-trend-analyzer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-033-bloodwork-trend-analyzer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Descriptive linear summaries of user-entered dated readings; no reference ranges, health interpretation, or recommendations
- **Inputs:** readings:array [?..200]
- **Outputs:** markers
- **Evidence:** component `components/tools/tool-033-bloodwork-trend-analyzer.tsx`; engine `lib/tools/engines/tool-033-bloodwork-trend-analyzer.ts`; schema `lib/tools/schemas/tool-033-bloodwork-trend-analyzer.ts`; tests 2; i18n `i18n/tool-033-bloodwork-trend-analyzer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; <main> present.
- **Related:** Personal Measurement Summary (tool-029-side-effect-early-warning); Side Effect Probability Calculator (tool-037-side-effect-probability); Liver Enzyme Tracker (tool-039-liver-enzyme-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-033-bloodwork-trend-analyzer with stable ID mrx.tool.033-bloodwork-trend-analyzer.
2. Typed TrendAnalyzerInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports analyzeBloodworkTrends; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-033-bloodwork-trend-analyzer.json exists (29 AR / 29 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 2 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Lab Reading Trend Summary.** In: readings, readings | Out: versioned formula sheet + markers | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for readings.** In: readings:array [?..200] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Lab Reading Trend Summary.** In: markers, the full result contract | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for readings.** In: changed readings with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from markers.** In: markers + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for readings.** In: global metric/imperial preference + readings | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Lab Reading Trend Summary.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Lab Reading Trend Summary.** In: markers, the full result contract | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of markers.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Personal Measurement Summary (tool-029-side-effect-early-warning).** In: approved subset of markers | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return denominator > 0 ? numerator / denominator : null;` `return left < right ? -1 : left > right ? 1 : 0;` `: Math.round(rawSlopePerDay * 30 * 100) / 100;`

---

### 037 — Side Effect Probability Calculator

- **Stable ID:** `mrx.tool.037-side-effect-probability`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-037-side-effect-probability` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Risk quantification for side effects
- **Inputs:** compounds:array [1..8]; age:number [18..90] int; body_fat_pct:number [5..60]; cycle_weeks:number [1..52] int; uses_ai:other unbounded; uses_liver_support:other unbounded
- **Outputs:** risks, overall_burden_pct, mitigations
- **Evidence:** component `components/tools/tool-037-side-effect-probability.tsx`; engine `lib/tools/engines/tool-037-side-effect-probability.ts`; schema `lib/tools/schemas/tool-037-side-effect-probability.ts`; tests 1; i18n `i18n/tool-037-side-effect-probability.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Liver Enzyme Tracker (tool-039-liver-enzyme-tracker); Lipid Profile Optimizer (tool-040-lipid-profile-optimizer); Lab Reading Trend Summary (tool-033-bloodwork-trend-analyzer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-037-side-effect-probability with stable ID mrx.tool.037-side-effect-probability.
2. Typed SideEffectRiskInputSchema exposes 6 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateSideEffectProbability; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-037-side-effect-probability.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Side Effect Probability Calculator.** In: compounds, age | Out: versioned formula sheet + risks | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..8]; age:number [18..90] int; body_fat_pct:number [5..60]; cycle_weeks:number [1..52] int; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Side Effect Probability Calculator.** In: risks, overall_burden_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from risks.** In: risks + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Side Effect Probability Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Side Effect Probability Calculator.** In: risks, overall_burden_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of risks.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Liver Enzyme Tracker (tool-039-liver-enzyme-tracker).** In: approved subset of risks | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const clamp01 = (x: number) => Math.max(0, Math.min(1, x));` `const ratio = c.weekly_dose_mg / Math.max(1, c.reference_dose_mg);` `const p = clamp01(base[k] * ratio);` `const durationFactor = 1 + Math.max(0, cycle_weeks - 8) * 0.03;`

---

### 039 — Liver Enzyme Tracker

- **Stable ID:** `mrx.tool.039-liver-enzyme-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-039-liver-enzyme-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** ALT/AST/GGT trend monitoring
- **Inputs:** readings:array [1..100]; oral_steroids:other unbounded; alcohol_drinks_per_week:number [0..100] int; uses_tudca:other unbounded
- **Outputs:** markers, overall_status, stop_orals, recommendations
- **Evidence:** component `components/tools/tool-039-liver-enzyme-tracker.tsx`; engine `lib/tools/engines/tool-039-liver-enzyme-tracker.ts`; schema `lib/tools/schemas/tool-039-liver-enzyme-tracker.ts`; tests 1; i18n `i18n/tool-039-liver-enzyme-tracker.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Lipid Profile Optimizer (tool-040-lipid-profile-optimizer); Side Effect Probability Calculator (tool-037-side-effect-probability); Hematocrit Monitor (tool-041-hematocrit-monitor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-039-liver-enzyme-tracker with stable ID mrx.tool.039-liver-enzyme-tracker.
2. Typed LiverTrackerInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports trackLiverEnzymes; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-039-liver-enzyme-tracker.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Liver Enzyme Tracker.** In: readings, oral_steroids | Out: versioned formula sheet + markers | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for readings.** In: readings:array [1..100]; oral_steroids:other unbounded; alcohol_drinks_per_week:number [0..100] int; uses_tudca:other unbounded | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Liver Enzyme Tracker.** In: markers, overall_status | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for alcohol_drinks_per_week.** In: changed alcohol_drinks_per_week with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from markers.** In: markers + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for readings.** In: global metric/imperial preference + alcohol_drinks_per_week | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Liver Enzyme Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Liver Enzyme Tracker.** In: markers, overall_status | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of markers.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Lipid Profile Optimizer (tool-040-lipid-profile-optimizer).** In: approved subset of markers | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const multiple = Math.round((latest.value / ref.uln) * 100) / 100;` `const days = Math.max(1, (Date.parse(sorted[sorted.length - 1].date) - Date.parse(sorted[0].date)) / 86400000);` `trend = Math.round(((sorted[sorted.length - 1].value - sorted[0].value) / days) * 30 * 100) / 100;`

---

### 040 — Lipid Profile Optimizer

- **Stable ID:** `mrx.tool.040-lipid-profile-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Lipid panel optimization guide
- **Inputs:** panel:other unbounded; age:number [18..90] int; smoker:other unbounded; systolic_bp:number [80..260] int; on_cycle:other unbounded; weeks_remaining:number [0..52] int
- **Outputs:** ldl_status, hdl_status, tg_status, non_hdl, overall_band, interventions
- **Evidence:** component `components/tools/tool-040-lipid-profile-optimizer.tsx`; engine `lib/tools/engines/tool-040-lipid-profile-optimizer.ts`; schema `lib/tools/schemas/tool-040-lipid-profile-optimizer.ts`; tests 1; i18n `i18n/tool-040-lipid-profile-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Liver Enzyme Tracker (tool-039-liver-enzyme-tracker); Hematocrit Monitor (tool-041-hematocrit-monitor); Side Effect Probability Calculator (tool-037-side-effect-probability).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-040-lipid-profile-optimizer with stable ID mrx.tool.040-lipid-profile-optimizer.
2. Typed LipidOptimizerInputSchema exposes 6 field(s); 3 carry explicit bounds.
3. Deterministic engine exports optimizeLipidProfile; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-040-lipid-profile-optimizer.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Lipid Profile Optimizer.** In: panel, age | Out: versioned formula sheet + ldl_status | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for panel.** In: panel:other unbounded; age:number [18..90] int; smoker:other unbounded; systolic_bp:number [80..260] int; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Lipid Profile Optimizer.** In: ldl_status, hdl_status | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from ldl_status.** In: ldl_status + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for panel.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Lipid Profile Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Lipid Profile Optimizer.** In: ldl_status, hdl_status | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of ldl_status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Liver Enzyme Tracker (tool-039-liver-enzyme-tracker).** In: approved subset of ldl_status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const total = panel.total_cholesterol_mg_dl ?? panel.ldl_mg_dl + panel.hdl_mg_dl + panel.triglycerides_mg_dl / 5;` `const nonHdl = Math.round((total - panel.hdl_mg_dl) * 10) / 10;`

---

### 041 — Hematocrit Monitor

- **Stable ID:** `mrx.tool.041-hematocrit-monitor`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-041-hematocrit-monitor` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** RBC and hematocrit tracking
- **Inputs:** readings:array [2..24]; sex:enum enum(male\|female); on_cycle:other unbounded; weeks_remaining:number [0..52] int
- **Outputs:** latest_hct_pct, baseline_hct_pct, slope_per_30d, projected_threshold_date, warnings
- **Evidence:** component `components/tools/tool-041-hematocrit-monitor.tsx`; engine `lib/tools/engines/tool-041-hematocrit-monitor.ts`; schema `lib/tools/schemas/tool-041-hematocrit-monitor.ts`; tests 3; i18n `i18n/tool-041-hematocrit-monitor.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Lipid Profile Optimizer (tool-040-lipid-profile-optimizer); Liver Enzyme Tracker (tool-039-liver-enzyme-tracker); DHT Side Effect Predictor (tool-044-dht-side-effects).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-041-hematocrit-monitor with stable ID mrx.tool.041-hematocrit-monitor.
2. Typed HematocritInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports monitorHematocrit; no model-generated number overrides the engine.
4. 3 test file(s) matched; 10 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-041-hematocrit-monitor.json exists (15 AR / 15 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Hematocrit Monitor.** In: readings, sex | Out: versioned formula sheet + latest_hct_pct | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for readings.** In: readings:array [2..24]; sex:enum enum(male|female); on_cycle:other unbounded; weeks_remaining:number [0..52] int | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Hematocrit Monitor.** In: latest_hct_pct, baseline_hct_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weeks_remaining.** In: changed weeks_remaining with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from latest_hct_pct.** In: latest_hct_pct + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for readings.** In: global metric/imperial preference + weeks_remaining | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Hematocrit Monitor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Hematocrit Monitor.** In: latest_hct_pct, baseline_hct_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of latest_hct_pct.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Lipid Profile Optimizer (tool-040-lipid-profile-optimizer).** In: approved subset of latest_hct_pct | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const MS_PER_30D = 30 * 24 * 3600 * 1000;` `const ms = ((intervene - latest) / slope) * MS_PER_30D;` `slope_per_30d: Math.round(slope * 100) / 100,`

---

### 044 — DHT Side Effect Predictor

- **Stable ID:** `mrx.tool.044-dht-side-effects`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-044-dht-side-effects` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** DHT-related risk assessment
- **Inputs:** dht_ng_dl:number [5..300]; uses_dht_derivative:other unbounded; five_ari:enum enum(none\|finasteride\|dutasteride); family_history_hairloss:other unbounded; age:number [18..90] int
- **Outputs:** hair_loss_risk_pct, prostate_symptom_risk_pct, overall_burden_pct, band, mitigations
- **Evidence:** component `components/tools/tool-044-dht-side-effects.tsx`; engine `lib/tools/engines/tool-044-dht-side-effects.ts`; schema `lib/tools/schemas/tool-044-dht-side-effects.ts`; tests 1; i18n `i18n/tool-044-dht-side-effects.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Hematocrit Monitor (tool-041-hematocrit-monitor); Lipid Profile Optimizer (tool-040-lipid-profile-optimizer); Cardiovascular Risk Assessor (tool-048-cardiovascular-risk).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-044-dht-side-effects with stable ID mrx.tool.044-dht-side-effects.
2. Typed DhtInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports predictDhtEffects; no model-generated number overrides the engine.
4. 1 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-044-dht-side-effects.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for DHT Side Effect Predictor.** In: dht_ng_dl, uses_dht_derivative | Out: versioned formula sheet + hair_loss_risk_pct | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for dht_ng_dl.** In: dht_ng_dl:number [5..300]; uses_dht_derivative:other unbounded; five_ari:enum enum(none|finasteride|dutasteride); family_history_hairloss:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for DHT Side Effect Predictor.** In: hair_loss_risk_pct, prostate_symptom_risk_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for dht_ng_dl.** In: changed dht_ng_dl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from hair_loss_risk_pct.** In: hair_loss_risk_pct + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for dht_ng_dl.** In: global metric/imperial preference + dht_ng_dl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for DHT Side Effect Predictor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for DHT Side Effect Predictor.** In: hair_loss_risk_pct, prostate_symptom_risk_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of hair_loss_risk_pct.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Hematocrit Monitor (tool-041-hematocrit-monitor).** In: approved subset of hair_loss_risk_pct | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.max(0, Math.min(1, v));` `const dhtFactor = clamp01(dht_ng_dl / ANCHOR); // saturates at anchor for risk weighting` `const overall = (hair + prostate) / 2;` `hair_loss_risk_pct: Math.round(hair * 1000) / 10,`

---

### 048 — Cardiovascular Risk Assessor

- **Stable ID:** `mrx.tool.048-cardiovascular-risk`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-048-cardiovascular-risk` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** ASCVD and lipid risk scoring
- **Inputs:** age:number [18..90]; sex:enum enum(male\|female); smoker:other unbounded; systolic_bp:number [80..220]; total_cholesterol:number [100..400]; hdl:number [20..110]; on_cycle:other unbounded
- **Outputs:** risk_pct_10yr, drivers, mitigations, warnings
- **Evidence:** component `components/tools/tool-048-cardiovascular-risk.tsx`; engine `lib/tools/engines/tool-048-cardiovascular-risk.ts`; schema `lib/tools/schemas/tool-048-cardiovascular-risk.ts`; tests 1; i18n `i18n/tool-048-cardiovascular-risk.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Bone Density Optimizer (tool-049-bone-density); Mental Health Monitor (tool-050-mental-health); DHT Side Effect Predictor (tool-044-dht-side-effects).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-048-cardiovascular-risk with stable ID mrx.tool.048-cardiovascular-risk.
2. Typed CardioRiskInputSchema exposes 7 field(s); 4 carry explicit bounds.
3. Deterministic engine exports assessCardiovascularRisk; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-048-cardiovascular-risk.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cardiovascular Risk Assessor.** In: age, sex | Out: versioned formula sheet + risk_pct_10yr | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [18..90]; sex:enum enum(male|female); smoker:other unbounded; systolic_bp:number [80..220]; +3 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cardiovascular Risk Assessor.** In: risk_pct_10yr, drivers | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from risk_pct_10yr.** In: risk_pct_10yr + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for age.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cardiovascular Risk Assessor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cardiovascular Risk Assessor.** In: risk_pct_10yr, drivers | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of risk_pct_10yr.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Bone Density Optimizer (tool-049-bone-density).** In: approved subset of risk_pct_10yr | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `Math.max(0, systolic_bp - 120) * 0.08 +` `Math.max(0, total_cholesterol - 180) * 0.04 +` `Math.max(0, 45 - hdl) * 0.1 +` `const risk_pct_10yr = Math.min(60, Math.max(0, Math.round(raw)));`

---

### 049 — Bone Density Optimizer

- **Stable ID:** `mrx.tool.049-bone-density`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-049-bone-density` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Bone health during cycles
- **Inputs:** age:number [18..90]; sex:enum enum(male\|female); uses_ai_years:number [0..30]; weekly_resistance_sessions:number [0..14]; calcium_mg_daily:number [0..3000]; vitamin_d_iu_daily:number [0..10000]; smoker:other unbounded
- **Outputs:** bone_health_score, risk_factors, interventions, warnings
- **Evidence:** component `components/tools/tool-049-bone-density.tsx`; engine `lib/tools/engines/tool-049-bone-density.ts`; schema `lib/tools/schemas/tool-049-bone-density.ts`; tests 1; i18n `i18n/tool-049-bone-density.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cardiovascular Risk Assessor (tool-048-cardiovascular-risk); Mental Health Monitor (tool-050-mental-health); DHT Side Effect Predictor (tool-044-dht-side-effects).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-049-bone-density with stable ID mrx.tool.049-bone-density.
2. Typed BoneDensityInputSchema exposes 7 field(s); 5 carry explicit bounds.
3. Deterministic engine exports assessBoneDensity; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-049-bone-density.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Bone Density Optimizer.** In: age, sex | Out: versioned formula sheet + bone_health_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [18..90]; sex:enum enum(male|female); uses_ai_years:number [0..30]; weekly_resistance_sessions:number [0..14]; +3 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Bone Density Optimizer.** In: bone_health_score, risk_factors | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from bone_health_score.** In: bone_health_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for calcium_mg_daily.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Bone Density Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Bone Density Optimizer.** In: bone_health_score, risk_factors | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of bone_health_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cardiovascular Risk Assessor (tool-048-cardiovascular-risk).** In: approved subset of bone_health_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const clamp100 = (v: number) => Math.min(100, Math.max(0, v));` `Math.min(20, weekly_resistance_sessions * 3) +` `Math.min(15, calcium_mg_daily / 100) +` `Math.min(15, vitamin_d_iu_daily / 400) -`

---

### 050 — Mental Health Monitor

- **Stable ID:** `mrx.tool.050-mental-health`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-050-mental-health` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Mood and cognitive tracking
- **Inputs:** mood_scores:array [3..30]; sleep_hours_avg:number [0..14]; irritability_episodes:number [0..28] int; aggression_episodes:number [0..28] int; uses_19_nor:other unbounded; red_flags:array [?..3] enum(self_harm_thoughts\|rage_episodes\|hopelessness)
- **Outputs:** avg_mood, trend, band, escalation, sleep_flag, irritability_flag, warnings
- **Evidence:** component `components/tools/tool-050-mental-health.tsx`; engine `lib/tools/engines/tool-050-mental-health.ts`; schema `lib/tools/schemas/tool-050-mental-health.ts`; tests 1; i18n `i18n/tool-050-mental-health.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Bone Density Optimizer (tool-049-bone-density); Cardiovascular Risk Assessor (tool-048-cardiovascular-risk); Glucose Tracker (tool-054-glucose-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-050-mental-health with stable ID mrx.tool.050-mental-health.
2. Typed MentalHealthInputSchema exposes 6 field(s); 5 carry explicit bounds.
3. Deterministic engine exports assessMentalHealth; no model-generated number overrides the engine.
4. 1 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-050-mental-health.json exists (19 AR / 19 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Mental Health Monitor.** In: mood_scores, sleep_hours_avg | Out: versioned formula sheet + avg_mood | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for mood_scores.** In: mood_scores:array [3..30]; sleep_hours_avg:number [0..14]; irritability_episodes:number [0..28] int; aggression_episodes:number [0..28] int; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Mental Health Monitor.** In: avg_mood, trend | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sleep_hours_avg.** In: changed sleep_hours_avg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from avg_mood.** In: avg_mood + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for mood_scores.** In: global metric/imperial preference + sleep_hours_avg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Mental Health Monitor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Mental Health Monitor.** In: avg_mood, trend | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of avg_mood.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Bone Density Optimizer (tool-049-bone-density).** In: approved subset of avg_mood | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const avg_mood = Math.round((pts.reduce((s, p) => s + p.v, 0) / Math.max(1, pts.length)) * 10) / 10;` `const half = Math.floor(pts.length / 2);`

---

### 054 — Glucose Tracker

- **Stable ID:** `mrx.tool.054-glucose-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-054-glucose-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Blood-glucose log with in-range analytics
- **Inputs:** readings:array [3..60]
- **Outputs:** avg, fasting_avg, in_range_pct, warnings
- **Evidence:** component `components/tools/tool-054-glucose-tracker.tsx`; engine `lib/tools/engines/tool-054-glucose-tracker.ts`; schema `lib/tools/schemas/tool-054-glucose-tracker.ts`; tests 1; i18n `i18n/tool-054-glucose-tracker.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Insulin Sensitivity Optimizer (tool-055-insulin-sensitivity-optimizer); Mental Health Monitor (tool-050-mental-health); Bone Density Optimizer (tool-049-bone-density).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-054-glucose-tracker with stable ID mrx.tool.054-glucose-tracker.
2. Typed GlucoseInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports analyzeGlucose; no model-generated number overrides the engine.
4. 1 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-054-glucose-tracker.json exists (13 AR / 14 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Glucose Tracker.** In: readings, readings | Out: versioned formula sheet + avg | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for readings.** In: readings:array [3..60] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Glucose Tracker.** In: avg, fasting_avg | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for readings.** In: changed readings with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from avg.** In: avg + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for readings.** In: global metric/imperial preference + readings | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Glucose Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Glucose Tracker.** In: avg, fasting_avg | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of avg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Insulin Sensitivity Optimizer (tool-055-insulin-sensitivity-optimizer).** In: approved subset of avg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const round1 = (v: number) => Math.round(v * 10) / 10;` `const in_range_pct = Math.round((in_range / readings.length) * 100);` `avg: Math.round(avg * 10) / 10,` `fasting_avg: Math.round(fasting_avg * 10) / 10,`

---

### 055 — Insulin Sensitivity Optimizer

- **Stable ID:** `mrx.tool.055-insulin-sensitivity-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-055-insulin-sensitivity-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** HOMA-IR insulin sensitivity screen
- **Inputs:** fasting_glucose:number [40..400]; fasting_insulin:number [0.5..100]; weekly_training_sessions:number [0..14]; sleep_hours:number [0..14]
- **Outputs:** homa_ir, band, interventions, warnings
- **Evidence:** component `components/tools/tool-055-insulin-sensitivity-optimizer.tsx`; engine `lib/tools/engines/tool-055-insulin-sensitivity-optimizer.ts`; schema `lib/tools/schemas/tool-055-insulin-sensitivity-optimizer.ts`; tests 1; i18n `i18n/tool-055-insulin-sensitivity-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Glucose Tracker (tool-054-glucose-tracker); Mental Health Monitor (tool-050-mental-health); Bone Density Optimizer (tool-049-bone-density).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-055-insulin-sensitivity-optimizer with stable ID mrx.tool.055-insulin-sensitivity-optimizer.
2. Typed InsulinSensitivityInputSchema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports assessInsulinSensitivity; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-055-insulin-sensitivity-optimizer.json exists (10 AR / 10 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Insulin Sensitivity Optimizer.** In: fasting_glucose, fasting_insulin | Out: versioned formula sheet + homa_ir | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for fasting_glucose.** In: fasting_glucose:number [40..400]; fasting_insulin:number [0.5..100]; weekly_training_sessions:number [0..14]; sleep_hours:number [0..14] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Insulin Sensitivity Optimizer.** In: homa_ir, band | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for fasting_glucose.** In: changed fasting_glucose with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from homa_ir.** In: homa_ir + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for fasting_insulin.** In: global metric/imperial preference + fasting_glucose | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Insulin Sensitivity Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Insulin Sensitivity Optimizer.** In: homa_ir, band | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of homa_ir.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Glucose Tracker (tool-054-glucose-tracker).** In: approved subset of homa_ir | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const homa_ir = Math.round(((fasting_glucose * fasting_insulin) / 405) * 100) / 100;`

---

### 061 — Hair Loss Tracker

- **Stable ID:** `mrx.tool.061-hair-loss-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-061-hair-loss-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** DHT-linked hair-loss trend tracking
- **Inputs:** norwood_stage:number [1..7] int; weekly_shed_counts:array [0..500]; on_5ari:other unbounded; weeks_since_start:number [0..260] int
- **Outputs:** avg_weekly_shed, trend_band, stage_band, warnings
- **Evidence:** component `components/tools/tool-061-hair-loss-tracker.tsx`; engine `lib/tools/engines/tool-061-hair-loss-tracker.ts`; schema `lib/tools/schemas/tool-061-hair-loss-tracker.ts`; tests 3; i18n `i18n/tool-061-hair-loss-tracker.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Prostate Health Manager (tool-062-prostate-health-manager); Insulin Sensitivity Optimizer (tool-055-insulin-sensitivity-optimizer); Glucose Tracker (tool-054-glucose-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-061-hair-loss-tracker with stable ID mrx.tool.061-hair-loss-tracker.
2. Typed HairLossInputSchema exposes 4 field(s); 3 carry explicit bounds.
3. Deterministic engine exports trackHairLoss; no model-generated number overrides the engine.
4. 3 test file(s) matched; 8 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-061-hair-loss-tracker.json exists (10 AR / 10 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Hair Loss Tracker.** In: norwood_stage, weekly_shed_counts | Out: versioned formula sheet + avg_weekly_shed | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for norwood_stage.** In: norwood_stage:number [1..7] int; weekly_shed_counts:array [0..500]; on_5ari:other unbounded; weeks_since_start:number [0..260] int | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Hair Loss Tracker.** In: avg_weekly_shed, trend_band | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for norwood_stage.** In: changed norwood_stage with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from avg_weekly_shed.** In: avg_weekly_shed + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for norwood_stage.** In: global metric/imperial preference + norwood_stage | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Hair Loss Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Hair Loss Tracker.** In: avg_weekly_shed, trend_band | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of avg_weekly_shed.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Prostate Health Manager (tool-062-prostate-health-manager).** In: approved subset of avg_weekly_shed | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const avg_weekly_shed = Math.round((weekly_shed_counts.reduce((a, b) => a + b, 0) / weekly_shed_counts.length) * 10) / 10;`

---

### 062 — Prostate Health Manager

- **Stable ID:** `mrx.tool.062-prostate-health-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-062-prostate-health-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** PSA trend and prostate screening guide
- **Inputs:** age:number [30..90] int; psa_ng_ml:number [0..50]; psa_prev_1y_ng_ml:number [0..50] optional
- **Outputs:** psa_ceiling, psa_delta_1y, band, warnings
- **Evidence:** component `components/tools/tool-062-prostate-health-manager.tsx`; engine `lib/tools/engines/tool-062-prostate-health-manager.ts`; schema `lib/tools/schemas/tool-062-prostate-health-manager.ts`; tests 1; i18n `i18n/tool-062-prostate-health-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Hair Loss Tracker (tool-061-hair-loss-tracker); Gynecomastia Tracker (tool-068-gynecomastia-tracker); Insulin Sensitivity Optimizer (tool-055-insulin-sensitivity-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-062-prostate-health-manager with stable ID mrx.tool.062-prostate-health-manager.
2. Typed ProstateHealthInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports assessProstateHealth; no model-generated number overrides the engine.
4. 1 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-062-prostate-health-manager.json exists (9 AR / 9 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Prostate Health Manager.** In: age, psa_ng_ml | Out: versioned formula sheet + psa_ceiling | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [30..90] int; psa_ng_ml:number [0..50]; psa_prev_1y_ng_ml:number [0..50] optional | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Prostate Health Manager.** In: psa_ceiling, psa_delta_1y | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from psa_ceiling.** In: psa_ceiling + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for psa_ng_ml, psa_prev_1y_ng_ml.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Prostate Health Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Prostate Health Manager.** In: psa_ceiling, psa_delta_1y | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of psa_ceiling.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Hair Loss Tracker (tool-061-hair-loss-tracker).** In: approved subset of psa_ceiling | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const delta = typeof psa_prev_1y_ng_ml === 'number' ? Math.round((psa_ng_ml - psa_prev_1y_ng_ml) * 100) / 100 : null;`

---

### 068 — Gynecomastia Tracker

- **Stable ID:** `mrx.tool.068-gynecomastia-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-068-gynecomastia-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Gyno symptom progression tracking
- **Inputs:** has_tenderness_or_itching:other unbounded; has_palpable_lump:other unbounded; lump_size_cm:number [0..10] optional; duration_weeks:number [0..52] int; prolactin_involved:other unbounded
- **Outputs:** progression_stage, fibrosis_risk, escalation_needed, warnings
- **Evidence:** component `components/tools/tool-068-gynecomastia-tracker.tsx`; engine `lib/tools/engines/tool-068-gynecomastia-tracker.ts`; schema `lib/tools/schemas/tool-068-gynecomastia-tracker.ts`; tests 1; i18n `i18n/tool-068-gynecomastia-tracker.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Detoxification Optimizer (tool-069-detoxification-optimizer); Oxidative Stress Calculator (tool-070-oxidative-stress-calculator); Antioxidant Manager (tool-071-antioxidant-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-068-gynecomastia-tracker with stable ID mrx.tool.068-gynecomastia-tracker.
2. Typed GynecomastiaInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports trackGynecomastia; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-068-gynecomastia-tracker.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Gynecomastia Tracker.** In: has_tenderness_or_itching, has_palpable_lump | Out: versioned formula sheet + progression_stage | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for has_tenderness_or_itching.** In: has_tenderness_or_itching:other unbounded; has_palpable_lump:other unbounded; lump_size_cm:number [0..10] optional; duration_weeks:number [0..52] int; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Gynecomastia Tracker.** In: progression_stage, fibrosis_risk | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for lump_size_cm.** In: changed lump_size_cm with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from progression_stage.** In: progression_stage + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for lump_size_cm.** In: global metric/imperial preference + lump_size_cm | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Gynecomastia Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Gynecomastia Tracker.** In: progression_stage, fibrosis_risk | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of progression_stage.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Detoxification Optimizer (tool-069-detoxification-optimizer).** In: approved subset of progression_stage | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 069 — Detoxification Optimizer

- **Stable ID:** `mrx.tool.069-detoxification-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-069-detoxification-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Hepatic detox support planner
- **Inputs:** daily_water_liters:number [0.5..6]; daily_fiber_grams:number [5..60]; cruciferous_servings_week:number [0..21] int; alcohol_drinks_week:number [0..50] int; takes_nac_or_glutathione_support:other unbounded; oral_compounds_present:other unbounded
- **Outputs:** hepatic_support_score, key_recommendations, warnings
- **Evidence:** component `components/tools/tool-069-detoxification-optimizer.tsx`; engine `lib/tools/engines/tool-069-detoxification-optimizer.ts`; schema `lib/tools/schemas/tool-069-detoxification-optimizer.ts`; tests 2; i18n `i18n/tool-069-detoxification-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Gynecomastia Tracker (tool-068-gynecomastia-tracker); Oxidative Stress Calculator (tool-070-oxidative-stress-calculator); Antioxidant Manager (tool-071-antioxidant-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-069-detoxification-optimizer with stable ID mrx.tool.069-detoxification-optimizer.
2. Typed DetoxificationInputSchema exposes 6 field(s); 4 carry explicit bounds.
3. Deterministic engine exports optimizeDetoxification; no model-generated number overrides the engine.
4. 2 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-069-detoxification-optimizer.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Detoxification Optimizer.** In: daily_water_liters, daily_fiber_grams | Out: versioned formula sheet + hepatic_support_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_water_liters.** In: daily_water_liters:number [0.5..6]; daily_fiber_grams:number [5..60]; cruciferous_servings_week:number [0..21] int; alcohol_drinks_week:number [0..50] int; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Detoxification Optimizer.** In: hepatic_support_score, key_recommendations | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_water_liters.** In: changed daily_water_liters with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from hepatic_support_score.** In: hepatic_support_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for daily_water_liters.** In: global metric/imperial preference + daily_water_liters | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Detoxification Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Detoxification Optimizer.** In: hepatic_support_score, key_recommendations | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of hepatic_support_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Gynecomastia Tracker (tool-068-gynecomastia-tracker).** In: approved subset of hepatic_support_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.max(0, Math.min(100, score));`

---

### 070 — Oxidative Stress Calculator

- **Stable ID:** `mrx.tool.070-oxidative-stress-calculator`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-070-oxidative-stress-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Oxidative burden scoring
- **Inputs:** sleep_hours_per_night:number [3..12]; hard_training_hours_week:number [0..25]; smoker_or_vaper:other unbounded; high_sugar_ultraprocessed_diet:other unbounded; androgen_dose_weekly_mg:number [0..3000]; antioxidant_support_adequate:other unbounded
- **Outputs:** oxidative_burden_score, mitigating_priorities, warnings
- **Evidence:** component `components/tools/tool-070-oxidative-stress-calculator.tsx`; engine `lib/tools/engines/tool-070-oxidative-stress-calculator.ts`; schema `lib/tools/schemas/tool-070-oxidative-stress-calculator.ts`; tests 1; i18n `i18n/tool-070-oxidative-stress-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Detoxification Optimizer (tool-069-detoxification-optimizer); Antioxidant Manager (tool-071-antioxidant-manager); Gynecomastia Tracker (tool-068-gynecomastia-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-070-oxidative-stress-calculator with stable ID mrx.tool.070-oxidative-stress-calculator.
2. Typed OxidativeStressInputSchema exposes 6 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateOxidativeStress; no model-generated number overrides the engine.
4. 1 test file(s) matched; 4 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-070-oxidative-stress-calculator.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Oxidative Stress Calculator.** In: sleep_hours_per_night, hard_training_hours_week | Out: versioned formula sheet + oxidative_burden_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sleep_hours_per_night.** In: sleep_hours_per_night:number [3..12]; hard_training_hours_week:number [0..25]; smoker_or_vaper:other unbounded; high_sugar_ultraprocessed_diet:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Oxidative Stress Calculator.** In: oxidative_burden_score, mitigating_priorities | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sleep_hours_per_night.** In: changed sleep_hours_per_night with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from oxidative_burden_score.** In: oxidative_burden_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for androgen_dose_weekly_mg.** In: global metric/imperial preference + sleep_hours_per_night | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Oxidative Stress Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Oxidative Stress Calculator.** In: oxidative_burden_score, mitigating_priorities | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of oxidative_burden_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Detoxification Optimizer (tool-069-detoxification-optimizer).** In: approved subset of oxidative_burden_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `burden = Math.max(0, Math.min(100, burden));`

---

### 071 — Antioxidant Manager

- **Stable ID:** `mrx.tool.071-antioxidant-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-071-antioxidant-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Antioxidant intake optimization
- **Inputs:** daily_fruit_veg_servings:number [0..15]; takes_coq10:other unbounded; takes_vitamin_c_e:other unbounded; takes_zinc_selenium:other unbounded; high_oxidative_lifestyle:other unbounded
- **Outputs:** antioxidant_defense_score, key_recommendations, warnings
- **Evidence:** component `components/tools/tool-071-antioxidant-manager.tsx`; engine `lib/tools/engines/tool-071-antioxidant-manager.ts`; schema `lib/tools/schemas/tool-071-antioxidant-manager.ts`; tests 2; i18n `i18n/tool-071-antioxidant-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Oxidative Stress Calculator (tool-070-oxidative-stress-calculator); Systemic Inflammation Calculator (tool-072-systemic-inflammation-calculator); Detoxification Optimizer (tool-069-detoxification-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-071-antioxidant-manager with stable ID mrx.tool.071-antioxidant-manager.
2. Typed AntioxidantInputSchema exposes 5 field(s); 1 carry explicit bounds.
3. Deterministic engine exports manageAntioxidants; no model-generated number overrides the engine.
4. 2 test file(s) matched; 9 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-071-antioxidant-manager.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Antioxidant Manager.** In: daily_fruit_veg_servings, takes_coq10 | Out: versioned formula sheet + antioxidant_defense_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_fruit_veg_servings.** In: daily_fruit_veg_servings:number [0..15]; takes_coq10:other unbounded; takes_vitamin_c_e:other unbounded; takes_zinc_selenium:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Antioxidant Manager.** In: antioxidant_defense_score, key_recommendations | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_fruit_veg_servings.** In: changed daily_fruit_veg_servings with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from antioxidant_defense_score.** In: antioxidant_defense_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for daily_fruit_veg_servings.** In: global metric/imperial preference + daily_fruit_veg_servings | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Antioxidant Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Antioxidant Manager.** In: antioxidant_defense_score, key_recommendations | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of antioxidant_defense_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Oxidative Stress Calculator (tool-070-oxidative-stress-calculator).** In: approved subset of antioxidant_defense_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.max(0, Math.min(100, score));`

---

### 072 — Systemic Inflammation Calculator

- **Stable ID:** `mrx.tool.072-systemic-inflammation-calculator`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-072-systemic-inflammation-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** CRP/IL-6 inflammation scoring
- **Inputs:** hs_crp_mg_l:number [0.1..30] optional; waist_circumference_cm:number [60..150]; sleep_hours_per_night:number [3..12]; smoker_or_heavy_alcohol:other unbounded; chronic_joint_pain:other unbounded
- **Outputs:** inflammation_risk_score, crp_context, warnings
- **Evidence:** component `components/tools/tool-072-systemic-inflammation-calculator.tsx`; engine `lib/tools/engines/tool-072-systemic-inflammation-calculator.ts`; schema `lib/tools/schemas/tool-072-systemic-inflammation-calculator.ts`; tests 1; i18n `i18n/tool-072-systemic-inflammation-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Antioxidant Manager (tool-071-antioxidant-manager); Immune System Optimizer (tool-073-immune-system-optimizer); Oxidative Stress Calculator (tool-070-oxidative-stress-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-072-systemic-inflammation-calculator with stable ID mrx.tool.072-systemic-inflammation-calculator.
2. Typed SystemicInflammationInputSchema exposes 5 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateSystemicInflammation; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-072-systemic-inflammation-calculator.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Systemic Inflammation Calculator.** In: hs_crp_mg_l, waist_circumference_cm | Out: versioned formula sheet + inflammation_risk_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for hs_crp_mg_l.** In: hs_crp_mg_l:number [0.1..30] optional; waist_circumference_cm:number [60..150]; sleep_hours_per_night:number [3..12]; smoker_or_heavy_alcohol:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Systemic Inflammation Calculator.** In: inflammation_risk_score, crp_context | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for hs_crp_mg_l.** In: changed hs_crp_mg_l with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from inflammation_risk_score.** In: inflammation_risk_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for hs_crp_mg_l, waist_circumference_cm, chronic_joint_pain.** In: global metric/imperial preference + hs_crp_mg_l | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Systemic Inflammation Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Systemic Inflammation Calculator.** In: inflammation_risk_score, crp_context | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of inflammation_risk_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Antioxidant Manager (tool-071-antioxidant-manager).** In: approved subset of inflammation_risk_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.max(0, Math.min(100, score));`

---

### 073 — Immune System Optimizer

- **Stable ID:** `mrx.tool.073-immune-system-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-073-immune-system-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Immune support planning
- **Inputs:** vitamin_d_ng_ml:number [10..120] optional; sleep_hours_average:number [3..12]; training_strain_level:enum enum(light-moderate\|hard\|extreme-overreaching); recurrent_upper_respiratory_infections:other unbounded; takes_zinc_vitamin_c:other unbounded
- **Outputs:** immune_resilience_score, targeted_priorities, warnings
- **Evidence:** component `components/tools/tool-073-immune-system-optimizer.tsx`; engine `lib/tools/engines/tool-073-immune-system-optimizer.ts`; schema `lib/tools/schemas/tool-073-immune-system-optimizer.ts`; tests 1; i18n `i18n/tool-073-immune-system-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Systemic Inflammation Calculator (tool-072-systemic-inflammation-calculator); Blood Pressure Tracker (tool-074-blood-pressure-tracker); Antioxidant Manager (tool-071-antioxidant-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-073-immune-system-optimizer with stable ID mrx.tool.073-immune-system-optimizer.
2. Typed ImmuneSystemInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports optimizeImmuneSystem; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-073-immune-system-optimizer.json exists (14 AR / 14 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Immune System Optimizer.** In: vitamin_d_ng_ml, sleep_hours_average | Out: versioned formula sheet + immune_resilience_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for vitamin_d_ng_ml.** In: vitamin_d_ng_ml:number [10..120] optional; sleep_hours_average:number [3..12]; training_strain_level:enum enum(light-moderate|hard|extreme-overreaching); recurrent_upper_respiratory_infections:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Immune System Optimizer.** In: immune_resilience_score, targeted_priorities | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for vitamin_d_ng_ml.** In: changed vitamin_d_ng_ml with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from immune_resilience_score.** In: immune_resilience_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for vitamin_d_ng_ml.** In: global metric/imperial preference + vitamin_d_ng_ml | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Immune System Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Immune System Optimizer.** In: immune_resilience_score, targeted_priorities | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of immune_resilience_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Systemic Inflammation Calculator (tool-072-systemic-inflammation-calculator).** In: approved subset of immune_resilience_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.max(0, Math.min(100, score));`

---

### 074 — Blood Pressure Tracker

- **Stable ID:** `mrx.tool.074-blood-pressure-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-074-blood-pressure-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** BP trend with threshold projection
- **Inputs:** systolic_mmhg:number [70..240]; diastolic_mmhg:number [40..150]; heart_rate_bpm:number [40..200] optional
- **Outputs:** category, mean_arterial_pressure, pulse_pressure, follow_up_needed, warnings
- **Evidence:** component `components/tools/tool-074-blood-pressure-tracker.tsx`; engine `lib/tools/engines/tool-074-blood-pressure-tracker.ts`; schema `lib/tools/schemas/tool-074-blood-pressure-tracker.ts`; tests 2; i18n `i18n/tool-074-blood-pressure-tracker.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Immune System Optimizer (tool-073-immune-system-optimizer); Arterial Health Manager (tool-075-arterial-health-manager); Systemic Inflammation Calculator (tool-072-systemic-inflammation-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-074-blood-pressure-tracker with stable ID mrx.tool.074-blood-pressure-tracker.
2. Typed BloodPressureInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports trackBloodPressure; no model-generated number overrides the engine.
4. 2 test file(s) matched; 4 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-074-blood-pressure-tracker.json exists (19 AR / 19 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Blood Pressure Tracker.** In: systolic_mmhg, diastolic_mmhg | Out: versioned formula sheet + category | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for systolic_mmhg.** In: systolic_mmhg:number [70..240]; diastolic_mmhg:number [40..150]; heart_rate_bpm:number [40..200] optional | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Blood Pressure Tracker.** In: category, mean_arterial_pressure | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for systolic_mmhg.** In: changed systolic_mmhg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from category.** In: category + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for systolic_mmhg.** In: global metric/imperial preference + systolic_mmhg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Blood Pressure Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Blood Pressure Tracker.** In: category, mean_arterial_pressure | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of category.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Immune System Optimizer (tool-073-immune-system-optimizer).** In: approved subset of category | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const pulse_pressure = Math.round(systolic_mmhg - diastolic_mmhg);` `const mean_arterial_pressure = Math.round((diastolic_mmhg + (systolic_mmhg - diastolic_mmhg) / 3) * 10) / 10;`

---

### 075 — Arterial Health Manager

- **Stable ID:** `mrx.tool.075-arterial-health-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-075-arterial-health-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Arterial stiffness and lipid screen
- **Inputs:** age:number [20..90] int; systolic_mmhg:number [70..240]; diastolic_mmhg:number [40..150]; total_cholesterol_mg_dl:number [100..500] optional; hdl_mg_dl:number [10..150] optional; triglycerides_mg_dl:number [30..1000] optional; smoker:other unbounded
- **Outputs:** arterial_risk_score, tg_to_hdl_ratio, tc_to_hdl_ratio, warnings
- **Evidence:** component `components/tools/tool-075-arterial-health-manager.tsx`; engine `lib/tools/engines/tool-075-arterial-health-manager.ts`; schema `lib/tools/schemas/tool-075-arterial-health-manager.ts`; tests 1; i18n `i18n/tool-075-arterial-health-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Blood Pressure Tracker (tool-074-blood-pressure-tracker); Blood Viscosity Calculator (tool-076-blood-viscosity-calculator); Immune System Optimizer (tool-073-immune-system-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-075-arterial-health-manager with stable ID mrx.tool.075-arterial-health-manager.
2. Typed ArterialHealthInputSchema exposes 7 field(s); 6 carry explicit bounds.
3. Deterministic engine exports manageArterialHealth; no model-generated number overrides the engine.
4. 1 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-075-arterial-health-manager.json exists (14 AR / 14 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Arterial Health Manager.** In: age, systolic_mmhg | Out: versioned formula sheet + arterial_risk_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [20..90] int; systolic_mmhg:number [70..240]; diastolic_mmhg:number [40..150]; total_cholesterol_mg_dl:number [100..500] optional; +3 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Arterial Health Manager.** In: arterial_risk_score, tg_to_hdl_ratio | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from arterial_risk_score.** In: arterial_risk_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for total_cholesterol_mg_dl, hdl_mg_dl, triglycerides_mg_dl.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Arterial Health Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Arterial Health Manager.** In: arterial_risk_score, tg_to_hdl_ratio | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of arterial_risk_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Blood Pressure Tracker (tool-074-blood-pressure-tracker).** In: approved subset of arterial_risk_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `tc_to_hdl_ratio = Math.round((total_cholesterol_mg_dl / hdl_mg_dl) * 10) / 10;` `tg_to_hdl_ratio = Math.round((triglycerides_mg_dl / hdl_mg_dl) * 10) / 10;` `score = Math.max(0, Math.min(100, score));`

---

### 076 — Blood Viscosity Calculator

- **Stable ID:** `mrx.tool.076-blood-viscosity-calculator`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-076-blood-viscosity-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Viscosity risk from HCT/proteins
- **Inputs:** hematocrit_pct:number [30..65]; total_protein_g_dl:number [4.5..10] optional; hydration_status:enum enum(dehydrated\|adequate\|well_hydrated); androgen_use:other unbounded
- **Outputs:** relative_viscosity_score, estimated_viscosity_cp
- **Evidence:** component `components/tools/tool-076-blood-viscosity-calculator.tsx`; engine `lib/tools/engines/tool-076-blood-viscosity-calculator.ts`; schema `lib/tools/schemas/tool-076-blood-viscosity-calculator.ts`; tests 2; i18n `i18n/tool-076-blood-viscosity-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Arterial Health Manager (tool-075-arterial-health-manager); Nitric Oxide Optimizer (tool-077-nitric-oxide-optimizer); Blood Pressure Tracker (tool-074-blood-pressure-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-076-blood-viscosity-calculator with stable ID mrx.tool.076-blood-viscosity-calculator.
2. Typed BloodViscosityInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateBloodViscosity; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-076-blood-viscosity-calculator.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 2 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Blood Viscosity Calculator.** In: hematocrit_pct, total_protein_g_dl | Out: versioned formula sheet + relative_viscosity_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for hematocrit_pct.** In: hematocrit_pct:number [30..65]; total_protein_g_dl:number [4.5..10] optional; hydration_status:enum enum(dehydrated|adequate|well_hydrated); androgen_use:other unbounded | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Blood Viscosity Calculator.** In: relative_viscosity_score, estimated_viscosity_cp | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for hematocrit_pct.** In: changed hematocrit_pct with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from relative_viscosity_score.** In: relative_viscosity_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for hematocrit_pct.** In: global metric/imperial preference + hematocrit_pct | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Blood Viscosity Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Blood Viscosity Calculator.** In: relative_viscosity_score, estimated_viscosity_cp | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of relative_viscosity_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Arterial Health Manager (tool-075-arterial-health-manager).** In: approved subset of relative_viscosity_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `let baseCp = 1.45 * Math.exp(0.0225 * hematocrit_pct);` `baseCp = Math.max(3.0, baseCp - 0.2);` `let score = Math.round(((estimated_viscosity_cp - 2.8) / (7.0 - 2.8)) * 100);` `score = Math.max(5, Math.min(100, score));`

---

### 077 — Nitric Oxide Optimizer

- **Stable ID:** `mrx.tool.077-nitric-oxide-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-077-nitric-oxide-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** NO support planning
- **Inputs:** dietary_nitrate_frequency:enum enum(rarely\|occasional\|daily\|high_daily); aerobic_exercise_days_per_week:number [0..7] int; uses_antiseptic_mouthwash:other unbounded; citrulline_supplementation:other unbounded; high_sunlight_or_uva_exposure:other unbounded
- **Outputs:** no_optimization_score, warnings
- **Evidence:** component `components/tools/tool-077-nitric-oxide-optimizer.tsx`; engine `lib/tools/engines/tool-077-nitric-oxide-optimizer.ts`; schema `lib/tools/schemas/tool-077-nitric-oxide-optimizer.ts`; tests 1; i18n `i18n/tool-077-nitric-oxide-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Blood Viscosity Calculator (tool-076-blood-viscosity-calculator); Endothelial Health Manager (tool-078-endothelial-health-manager); Arterial Health Manager (tool-075-arterial-health-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-077-nitric-oxide-optimizer with stable ID mrx.tool.077-nitric-oxide-optimizer.
2. Typed NitricOxideInputSchema exposes 5 field(s); 1 carry explicit bounds.
3. Deterministic engine exports optimizeNitricOxide; no model-generated number overrides the engine.
4. 1 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-077-nitric-oxide-optimizer.json exists (14 AR / 14 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Nitric Oxide Optimizer.** In: dietary_nitrate_frequency, aerobic_exercise_days_per_week | Out: versioned formula sheet + no_optimization_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for dietary_nitrate_frequency.** In: dietary_nitrate_frequency:enum enum(rarely|occasional|daily|high_daily); aerobic_exercise_days_per_week:number [0..7] int; uses_antiseptic_mouthwash:other unbounded; citrulline_supplementation:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Nitric Oxide Optimizer.** In: no_optimization_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for aerobic_exercise_days_per_week.** In: changed aerobic_exercise_days_per_week with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from no_optimization_score.** In: no_optimization_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for dietary_nitrate_frequency.** In: global metric/imperial preference + aerobic_exercise_days_per_week | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Nitric Oxide Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Nitric Oxide Optimizer.** In: no_optimization_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of no_optimization_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Blood Viscosity Calculator (tool-076-blood-viscosity-calculator).** In: approved subset of no_optimization_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const normalizedScore = Math.max(0, Math.min(100, score));`

---

### 078 — Endothelial Health Manager

- **Stable ID:** `mrx.tool.078-endothelial-health-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-078-endothelial-health-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Endothelial function screen
- **Inputs:** systolic_bp:number [80..220]; fasting_glucose_mg_dl:number [50..300] optional; high_sensitivity_crp_mg_l:number [0.1..20] optional; smoker_or_vaper:other unbounded; androgen_therapy_active:other unbounded; daily_aerobic_movement_mins:number [0..180]
- **Outputs:** endothelial_dysfunction_risk_score, warnings
- **Evidence:** component `components/tools/tool-078-endothelial-health-manager.tsx`; engine `lib/tools/engines/tool-078-endothelial-health-manager.ts`; schema `lib/tools/schemas/tool-078-endothelial-health-manager.ts`; tests 1; i18n `i18n/tool-078-endothelial-health-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Nitric Oxide Optimizer (tool-077-nitric-oxide-optimizer); Blood Viscosity Calculator (tool-076-blood-viscosity-calculator); Mitochondrial Optimizer (tool-080-mitochondrial-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-078-endothelial-health-manager with stable ID mrx.tool.078-endothelial-health-manager.
2. Typed EndothelialHealthInputSchema exposes 6 field(s); 4 carry explicit bounds.
3. Deterministic engine exports manageEndothelialHealth; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-078-endothelial-health-manager.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Endothelial Health Manager.** In: systolic_bp, fasting_glucose_mg_dl | Out: versioned formula sheet + endothelial_dysfunction_risk_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for systolic_bp.** In: systolic_bp:number [80..220]; fasting_glucose_mg_dl:number [50..300] optional; high_sensitivity_crp_mg_l:number [0.1..20] optional; smoker_or_vaper:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Endothelial Health Manager.** In: endothelial_dysfunction_risk_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for systolic_bp.** In: changed systolic_bp with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from endothelial_dysfunction_risk_score.** In: endothelial_dysfunction_risk_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for fasting_glucose_mg_dl, high_sensitivity_crp_mg_l.** In: global metric/imperial preference + systolic_bp | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Endothelial Health Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Endothelial Health Manager.** In: endothelial_dysfunction_risk_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of endothelial_dysfunction_risk_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Nitric Oxide Optimizer (tool-077-nitric-oxide-optimizer).** In: approved subset of endothelial_dysfunction_risk_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `riskScore = Math.max(5, riskScore - 15);` `riskScore = Math.max(5, riskScore - 8);` `const finalScore = Math.max(0, Math.min(100, riskScore));`

---

### 080 — Mitochondrial Optimizer

- **Stable ID:** `mrx.tool.080-mitochondrial-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-080-mitochondrial-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Mitochondrial support planner
- **Inputs:** zone2_weekly_hours:number [0..20]; hiit_sessions_per_week:number [0..7] int; coq10_or_nad_support:other unbounded; cold_heat_exposure:other unbounded; sleep_quality_score:number [1..10]; statin_use:other unbounded
- **Outputs:** mitochondrial_efficiency_score, warnings
- **Evidence:** component `components/tools/tool-080-mitochondrial-optimizer.tsx`; engine `lib/tools/engines/tool-080-mitochondrial-optimizer.ts`; schema `lib/tools/schemas/tool-080-mitochondrial-optimizer.ts`; tests 1; i18n `i18n/tool-080-mitochondrial-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cellular Aging Calculator (tool-081-cellular-aging-calculator); Endothelial Health Manager (tool-078-endothelial-health-manager); Telomere Manager (tool-082-telomere-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-080-mitochondrial-optimizer with stable ID mrx.tool.080-mitochondrial-optimizer.
2. Typed MitochondrialInputSchema exposes 6 field(s); 3 carry explicit bounds.
3. Deterministic engine exports optimizeMitochondria; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-080-mitochondrial-optimizer.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Mitochondrial Optimizer.** In: zone2_weekly_hours, hiit_sessions_per_week | Out: versioned formula sheet + mitochondrial_efficiency_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for zone2_weekly_hours.** In: zone2_weekly_hours:number [0..20]; hiit_sessions_per_week:number [0..7] int; coq10_or_nad_support:other unbounded; cold_heat_exposure:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Mitochondrial Optimizer.** In: mitochondrial_efficiency_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for zone2_weekly_hours.** In: changed zone2_weekly_hours with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from mitochondrial_efficiency_score.** In: mitochondrial_efficiency_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for zone2_weekly_hours.** In: global metric/imperial preference + zone2_weekly_hours | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Mitochondrial Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Mitochondrial Optimizer.** In: mitochondrial_efficiency_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of mitochondrial_efficiency_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cellular Aging Calculator (tool-081-cellular-aging-calculator).** In: approved subset of mitochondrial_efficiency_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const finalScore = Math.max(0, Math.min(100, score));`

---

### 081 — Cellular Aging Calculator

- **Stable ID:** `mrx.tool.081-cellular-aging-calculator`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-081-cellular-aging-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Cellular aging factor screen
- **Inputs:** chronological_age:number [18..90] int; smoking_history:enum enum(never\|former\|current); weekly_sun_protection_frequency:enum enum(never\|sometimes\|always); average_sleep_hours:number [3..12]; ultra_processed_food_frequency:enum enum(rare\|moderate\|high); regular_strength_training:other unbounded
- **Outputs:** biological_age_delta_estimate, warnings
- **Evidence:** component `components/tools/tool-081-cellular-aging-calculator.tsx`; engine `lib/tools/engines/tool-081-cellular-aging-calculator.ts`; schema `lib/tools/schemas/tool-081-cellular-aging-calculator.ts`; tests 2; i18n `i18n/tool-081-cellular-aging-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Mitochondrial Optimizer (tool-080-mitochondrial-optimizer); Telomere Manager (tool-082-telomere-manager); Anti-Aging Inflammation Calculator (tool-083-anti-aging-inflammation-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-081-cellular-aging-calculator with stable ID mrx.tool.081-cellular-aging-calculator.
2. Typed CellularAgingInputSchema exposes 6 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateCellularAging; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-081-cellular-aging-calculator.json exists (21 AR / 21 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 2 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cellular Aging Calculator.** In: chronological_age, smoking_history | Out: versioned formula sheet + biological_age_delta_estimate | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for chronological_age.** In: chronological_age:number [18..90] int; smoking_history:enum enum(never|former|current); weekly_sun_protection_frequency:enum enum(never|sometimes|always); average_sleep_hours:number [3..12]; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cellular Aging Calculator.** In: biological_age_delta_estimate, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for chronological_age.** In: changed chronological_age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from biological_age_delta_estimate.** In: biological_age_delta_estimate + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for chronological_age.** In: global metric/imperial preference + chronological_age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cellular Aging Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cellular Aging Calculator.** In: biological_age_delta_estimate, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of biological_age_delta_estimate.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Mitochondrial Optimizer (tool-080-mitochondrial-optimizer).** In: approved subset of biological_age_delta_estimate | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const normalizedDelta = Number(Math.max(-6, Math.min(12, delta)).toFixed(1));` `const estimated_phenotypic_age = Number(Math.max(18, chronological_age + normalizedDelta).toFixed(1));`

---

### 082 — Telomere Manager

- **Stable ID:** `mrx.tool.082-telomere-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-082-telomere-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Telomere-aware lifestyle planning
- **Inputs:** perceived_chronic_stress_level:enum enum(low\|moderate\|high\|severe); aerobic_exercise_hours_weekly:number [0..20]; mediterranean_diet_adherence:enum enum(low\|moderate\|high); omega3_supplementation_or_fatty_fish:other unbounded; bmi:number [15..50]
- **Outputs:** telomere_protection_score, warnings
- **Evidence:** component `components/tools/tool-082-telomere-manager.tsx`; engine `lib/tools/engines/tool-082-telomere-manager.ts`; schema `lib/tools/schemas/tool-082-telomere-manager.ts`; tests 1; i18n `i18n/tool-082-telomere-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cellular Aging Calculator (tool-081-cellular-aging-calculator); Anti-Aging Inflammation Calculator (tool-083-anti-aging-inflammation-calculator); Mitochondrial Optimizer (tool-080-mitochondrial-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-082-telomere-manager with stable ID mrx.tool.082-telomere-manager.
2. Typed TelomereInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports manageTelomeres; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-082-telomere-manager.json exists (17 AR / 17 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Telomere Manager.** In: perceived_chronic_stress_level, aerobic_exercise_hours_weekly | Out: versioned formula sheet + telomere_protection_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for perceived_chronic_stress_level.** In: perceived_chronic_stress_level:enum enum(low|moderate|high|severe); aerobic_exercise_hours_weekly:number [0..20]; mediterranean_diet_adherence:enum enum(low|moderate|high); omega3_supplementation_or_fatty_fish:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Telomere Manager.** In: telomere_protection_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for aerobic_exercise_hours_weekly.** In: changed aerobic_exercise_hours_weekly with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from telomere_protection_score.** In: telomere_protection_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for perceived_chronic_stress_level.** In: global metric/imperial preference + aerobic_exercise_hours_weekly | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Telomere Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Telomere Manager.** In: telomere_protection_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of telomere_protection_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cellular Aging Calculator (tool-081-cellular-aging-calculator).** In: approved subset of telomere_protection_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const finalScore = Math.max(0, Math.min(100, score));`

---

### 083 — Anti-Aging Inflammation Calculator

- **Stable ID:** `mrx.tool.083-anti-aging-inflammation-calculator`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-083-anti-aging-inflammation-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Longevity inflammation index
- **Inputs:** hs_crp_mg_l:number [0.1..20] optional; visceral_adiposity_rating:enum enum(low\|moderate\|high); periodontal_disease_present:other unbounded; daily_joint_stiffness_morning_mins:number [0..120]; anti_inflammatory_polyphenols_daily:other unbounded
- **Outputs:** inflammaging_index_score, warnings
- **Evidence:** component `components/tools/tool-083-anti-aging-inflammation-calculator.tsx`; engine `lib/tools/engines/tool-083-anti-aging-inflammation-calculator.ts`; schema `lib/tools/schemas/tool-083-anti-aging-inflammation-calculator.ts`; tests 1; i18n `i18n/tool-083-anti-aging-inflammation-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Telomere Manager (tool-082-telomere-manager); Cognitive Enhancer (tool-084-cognitive-enhancer); Cellular Aging Calculator (tool-081-cellular-aging-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-083-anti-aging-inflammation-calculator with stable ID mrx.tool.083-anti-aging-inflammation-calculator.
2. Typed AntiAgingInflammationInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateAntiAgingInflammation; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-083-anti-aging-inflammation-calculator.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Anti-Aging Inflammation Calculator.** In: hs_crp_mg_l, visceral_adiposity_rating | Out: versioned formula sheet + inflammaging_index_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for hs_crp_mg_l.** In: hs_crp_mg_l:number [0.1..20] optional; visceral_adiposity_rating:enum enum(low|moderate|high); periodontal_disease_present:other unbounded; daily_joint_stiffness_morning_mins:number [0..120]; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Anti-Aging Inflammation Calculator.** In: inflammaging_index_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for hs_crp_mg_l.** In: changed hs_crp_mg_l with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from inflammaging_index_score.** In: inflammaging_index_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for hs_crp_mg_l.** In: global metric/imperial preference + hs_crp_mg_l | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Anti-Aging Inflammation Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Anti-Aging Inflammation Calculator.** In: inflammaging_index_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of inflammaging_index_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Telomere Manager (tool-082-telomere-manager).** In: approved subset of inflammaging_index_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `burden = Math.max(5, burden - 15);` `const finalScore = Math.max(0, Math.min(100, burden));`

---

### 084 — Cognitive Enhancer

- **Stable ID:** `mrx.tool.084-cognitive-enhancer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-084-cognitive-enhancer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Cognitive performance screen
- **Inputs:** daily_focused_deep_work_hours:number [0..12]; regular_aerobic_exercise:other unbounded; caffeine_daily_mg:number [0..800]; choline_rich_foods_or_alpha_gpc:other unbounded; frequent_brain_fog_complaints:other unbounded; sleep_hours:number [3..12]
- **Outputs:** cognitive_readiness_score, warnings
- **Evidence:** component `components/tools/tool-084-cognitive-enhancer.tsx`; engine `lib/tools/engines/tool-084-cognitive-enhancer.ts`; schema `lib/tools/schemas/tool-084-cognitive-enhancer.ts`; tests 1; i18n `i18n/tool-084-cognitive-enhancer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Anti-Aging Inflammation Calculator (tool-083-anti-aging-inflammation-calculator); Sleep Quality Manager (tool-085-sleep-quality-manager); Telomere Manager (tool-082-telomere-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-084-cognitive-enhancer with stable ID mrx.tool.084-cognitive-enhancer.
2. Typed CognitiveEnhancerInputSchema exposes 6 field(s); 3 carry explicit bounds.
3. Deterministic engine exports evaluateCognitiveEnhancement; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-084-cognitive-enhancer.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cognitive Enhancer.** In: daily_focused_deep_work_hours, regular_aerobic_exercise | Out: versioned formula sheet + cognitive_readiness_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_focused_deep_work_hours.** In: daily_focused_deep_work_hours:number [0..12]; regular_aerobic_exercise:other unbounded; caffeine_daily_mg:number [0..800]; choline_rich_foods_or_alpha_gpc:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cognitive Enhancer.** In: cognitive_readiness_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_focused_deep_work_hours.** In: changed daily_focused_deep_work_hours with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from cognitive_readiness_score.** In: cognitive_readiness_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for caffeine_daily_mg.** In: global metric/imperial preference + daily_focused_deep_work_hours | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cognitive Enhancer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cognitive Enhancer.** In: cognitive_readiness_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of cognitive_readiness_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Anti-Aging Inflammation Calculator (tool-083-anti-aging-inflammation-calculator).** In: approved subset of cognitive_readiness_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const finalScore = Math.max(0, Math.min(100, score));`

---

### 085 — Sleep Quality Manager

- **Stable ID:** `mrx.tool.085-sleep-quality-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-085-sleep-quality-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Sleep quality analytics
- **Inputs:** sleep_duration_hours:number [3..14]; sleep_latency_minutes:number [0..120]; night_awakenings_count:number [0..10] int; caffeine_within_6h_of_bedtime:other unbounded; dark_cool_room_optimized:other unbounded; morning_rested_feeling_score:number [1..10]
- **Outputs:** sleep_quality_index, estimated_sleep_efficiency_pct
- **Evidence:** component `components/tools/tool-085-sleep-quality-manager.tsx`; engine `lib/tools/engines/tool-085-sleep-quality-manager.ts`; schema `lib/tools/schemas/tool-085-sleep-quality-manager.ts`; tests 1; i18n `i18n/tool-085-sleep-quality-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cognitive Enhancer (tool-084-cognitive-enhancer); Anti-Aging Inflammation Calculator (tool-083-anti-aging-inflammation-calculator); Mood Optimizer (tool-087-mood-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-085-sleep-quality-manager with stable ID mrx.tool.085-sleep-quality-manager.
2. Typed SleepQualityInputSchema exposes 6 field(s); 4 carry explicit bounds.
3. Deterministic engine exports manageSleepQuality; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-085-sleep-quality-manager.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Sleep Quality Manager.** In: sleep_duration_hours, sleep_latency_minutes | Out: versioned formula sheet + sleep_quality_index | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sleep_duration_hours.** In: sleep_duration_hours:number [3..14]; sleep_latency_minutes:number [0..120]; night_awakenings_count:number [0..10] int; caffeine_within_6h_of_bedtime:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Sleep Quality Manager.** In: sleep_quality_index, estimated_sleep_efficiency_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sleep_duration_hours.** In: changed sleep_duration_hours with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from sleep_quality_index.** In: sleep_quality_index + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sleep_duration_hours.** In: global metric/imperial preference + sleep_duration_hours | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Sleep Quality Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Sleep Quality Manager.** In: sleep_quality_index, estimated_sleep_efficiency_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of sleep_quality_index.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cognitive Enhancer (tool-084-cognitive-enhancer).** In: approved subset of sleep_quality_index | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const estimated_waso_mins = night_awakenings_count * 15;` `const time_in_bed_mins = sleep_duration_hours * 60 + sleep_latency_minutes + estimated_waso_mins;` `const efficiency = Math.round(( (sleep_duration_hours * 60) / Math.max(1, time_in_bed_mins) ) * 100);` `score += Math.round((morning_rested_feeling_score / 10) * 15);`

---

### 087 — Mood Optimizer

- **Stable ID:** `mrx.tool.087-mood-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-087-mood-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Mood pattern support planning
- **Inputs:** sunlight_outdoor_minutes_daily:number [0..300]; social_connection_satisfaction:enum enum(isolated\|moderate\|strong); physical_activity_days_weekly:number [0..7]; omega3_and_micronutrient_sufficiency:other unbounded; chronic_work_overload_burnout:other unbounded; subjective_anhedonia_present:other unbounded
- **Outputs:** affective_resilience_score, warnings
- **Evidence:** component `components/tools/tool-087-mood-optimizer.tsx`; engine `lib/tools/engines/tool-087-mood-optimizer.ts`; schema `lib/tools/schemas/tool-087-mood-optimizer.ts`; tests 1; i18n `i18n/tool-087-mood-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Dopamine Tracker (tool-088-dopamine-tracker); Sleep Quality Manager (tool-085-sleep-quality-manager); Serotonin Manager (tool-089-serotonin-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-087-mood-optimizer with stable ID mrx.tool.087-mood-optimizer.
2. Typed MoodOptimizerInputSchema exposes 6 field(s); 2 carry explicit bounds.
3. Deterministic engine exports optimizeMood; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-087-mood-optimizer.json exists (14 AR / 14 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Mood Optimizer.** In: sunlight_outdoor_minutes_daily, social_connection_satisfaction | Out: versioned formula sheet + affective_resilience_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sunlight_outdoor_minutes_daily.** In: sunlight_outdoor_minutes_daily:number [0..300]; social_connection_satisfaction:enum enum(isolated|moderate|strong); physical_activity_days_weekly:number [0..7]; omega3_and_micronutrient_sufficiency:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Mood Optimizer.** In: affective_resilience_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sunlight_outdoor_minutes_daily.** In: changed sunlight_outdoor_minutes_daily with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from affective_resilience_score.** In: affective_resilience_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sunlight_outdoor_minutes_daily.** In: global metric/imperial preference + sunlight_outdoor_minutes_daily | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Mood Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Mood Optimizer.** In: affective_resilience_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of affective_resilience_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Dopamine Tracker (tool-088-dopamine-tracker).** In: approved subset of affective_resilience_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const finalScore = Math.max(0, Math.min(100, score));`

---

### 088 — Dopamine Tracker

- **Stable ID:** `mrx.tool.088-dopamine-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-088-dopamine-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Dopamine-linked habit tracking
- **Inputs:** daily_short_form_screen_time_hours:number [0..12]; tyrosine_rich_protein_intake:enum enum(suboptimal\|adequate\|optimal); habitual_cold_exposure_or_hard_effort:other unbounded; frequent_compulsive_dopamine_seeking:other unbounded; sleep_consistency_score:number [1..10]; stimulant_usage_frequency:enum enum(none\|moderate_caffeine\|high_caffeine_or_preworkout\|prescription_or_illicit)
- **Outputs:** dopamine_baseline_health_score, warnings
- **Evidence:** component `components/tools/tool-088-dopamine-tracker.tsx`; engine `lib/tools/engines/tool-088-dopamine-tracker.ts`; schema `lib/tools/schemas/tool-088-dopamine-tracker.ts`; tests 1; i18n `i18n/tool-088-dopamine-tracker.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Mood Optimizer (tool-087-mood-optimizer); Serotonin Manager (tool-089-serotonin-manager); Sleep Quality Manager (tool-085-sleep-quality-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-088-dopamine-tracker with stable ID mrx.tool.088-dopamine-tracker.
2. Typed DopamineTrackerInputSchema exposes 6 field(s); 2 carry explicit bounds.
3. Deterministic engine exports trackDopamine; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-088-dopamine-tracker.json exists (18 AR / 18 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Dopamine Tracker.** In: daily_short_form_screen_time_hours, tyrosine_rich_protein_intake | Out: versioned formula sheet + dopamine_baseline_health_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_short_form_screen_time_hours.** In: daily_short_form_screen_time_hours:number [0..12]; tyrosine_rich_protein_intake:enum enum(suboptimal|adequate|optimal); habitual_cold_exposure_or_hard_effort:other unbounded; frequent_compulsive_dopamine_seeking:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Dopamine Tracker.** In: dopamine_baseline_health_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_short_form_screen_time_hours.** In: changed daily_short_form_screen_time_hours with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from dopamine_baseline_health_score.** In: dopamine_baseline_health_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for daily_short_form_screen_time_hours.** In: global metric/imperial preference + daily_short_form_screen_time_hours | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Dopamine Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Dopamine Tracker.** In: dopamine_baseline_health_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of dopamine_baseline_health_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Mood Optimizer (tool-087-mood-optimizer).** In: approved subset of dopamine_baseline_health_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score += Math.round((sleep_consistency_score / 10) * 15);` `const finalScore = Math.max(0, Math.min(100, score));`

---

### 089 — Serotonin Manager

- **Stable ID:** `mrx.tool.089-serotonin-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-089-serotonin-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Serotonin support planning
- **Inputs:** tryptophan_rich_food_intake:enum enum(low\|moderate\|optimal); gut_health_status:enum enum(frequent_gi_distress\|occasional_bloating\|healthy_regular); daily_sunlight_lux_exposure_mins:number [0..180]; nighttime_melatonin_transition_calm:other unbounded; chronic_irritability_or_carb_craving:other unbounded
- **Outputs:** serotonin_somatic_score, warnings
- **Evidence:** component `components/tools/tool-089-serotonin-manager.tsx`; engine `lib/tools/engines/tool-089-serotonin-manager.ts`; schema `lib/tools/schemas/tool-089-serotonin-manager.ts`; tests 1; i18n `i18n/tool-089-serotonin-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Dopamine Tracker (tool-088-dopamine-tracker); Mood Optimizer (tool-087-mood-optimizer); Sleep Quality Manager (tool-085-sleep-quality-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-089-serotonin-manager with stable ID mrx.tool.089-serotonin-manager.
2. Typed SerotoninManagerInputSchema exposes 5 field(s); 1 carry explicit bounds.
3. Deterministic engine exports manageSerotonin; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-089-serotonin-manager.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Serotonin Manager.** In: tryptophan_rich_food_intake, gut_health_status | Out: versioned formula sheet + serotonin_somatic_score | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for tryptophan_rich_food_intake.** In: tryptophan_rich_food_intake:enum enum(low|moderate|optimal); gut_health_status:enum enum(frequent_gi_distress|occasional_bloating|healthy_regular); daily_sunlight_lux_exposure_mins:number [0..180]; nighttime_melatonin_transition_calm:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Serotonin Manager.** In: serotonin_somatic_score, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_sunlight_lux_exposure_mins.** In: changed daily_sunlight_lux_exposure_mins with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from serotonin_somatic_score.** In: serotonin_somatic_score + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for tryptophan_rich_food_intake.** In: global metric/imperial preference + daily_sunlight_lux_exposure_mins | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Serotonin Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Serotonin Manager.** In: serotonin_somatic_score, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of serotonin_somatic_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Dopamine Tracker (tool-088-dopamine-tracker).** In: approved subset of serotonin_somatic_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const finalScore = Math.max(0, Math.min(100, score));`

---

### 095 — Skin Observation Log

- **Stable ID:** `mrx.tool.095-skin-health-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-095-skin-health-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Record skin observations without health-state inference
- **Inputs:** sebum_production_level:enum enum(normal_balanced\|moderately_oily\|excessive_hyperseborrhea); acne_lesion_distribution:enum enum(none_or_mild_comedones\|papules_and_pustules_face_or_back\|deep_cystic_nodular_lesions); barrier_dryness_or_flaking:other unbounded; sweat_hygiene_post_workout:enum enum(immediate_shower\|delayed_over_1hr); using_topical_dht_blockers_or_salicylic:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-095-skin-health-optimizer.tsx`; engine `lib/tools/engines/tool-095-skin-health-optimizer.ts`; schema `lib/tools/schemas/tool-095-skin-health-optimizer.ts`; tests 1; i18n `i18n/tool-095-skin-health-optimizer.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; <main> present.
- **Related:** Hair & Nail Observation Log (tool-096-hair-nail-tracker); Serotonin Manager (tool-089-serotonin-manager); Dopamine Tracker (tool-088-dopamine-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-095-skin-health-optimizer with stable ID mrx.tool.095-skin-health-optimizer.
2. Typed SkinHealthOptimizerInputSchema exposes 5 field(s); 0 carry explicit bounds.
3. Deterministic engine exports optimizeSkinHealth; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-095-skin-health-optimizer.json exists (25 AR / 25 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Skin Observation Log.** In: sebum_production_level, acne_lesion_distribution | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sebum_production_level.** In: sebum_production_level:enum enum(normal_balanced|moderately_oily|excessive_hyperseborrhea); acne_lesion_distribution:enum enum(none_or_mild_comedones|papules_and_pustules_face_or_back|deep_cystic_nodular_lesions); barrier_dryness_or_flaking:other unbounded; sweat_hygiene_post_workout:enum enum(immediate_shower|delayed_over_1hr); +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Skin Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sebum_production_level.** In: changed sebum_production_level with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sebum_production_level.** In: global metric/imperial preference + sebum_production_level | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Skin Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Skin Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Hair & Nail Observation Log (tool-096-hair-nail-tracker).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 096 — Hair & Nail Observation Log

- **Stable ID:** `mrx.tool.096-hair-nail-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-096-hair-nail-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Record hair, scalp, and nail observations without health-state inference
- **Inputs:** daily_shedding_rate:enum enum(normal_under_50\|moderate_50_to_100\|excessive_over_100); temporal_vertex_thinning:other unbounded; scalp_sebum_inflammation:enum enum(none\|mild_pruritus\|severe_seborrheic_dermatitis); nail_brittleness_or_ridging:other unbounded; using_5ar_inhibitor_or_minoxidil:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-096-hair-nail-tracker.tsx`; engine `lib/tools/engines/tool-096-hair-nail-tracker.ts`; schema `lib/tools/schemas/tool-096-hair-nail-tracker.ts`; tests 2; i18n `i18n/tool-096-hair-nail-tracker.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; <main> present.
- **Related:** Skin Observation Log (tool-095-skin-health-optimizer); Serotonin Manager (tool-089-serotonin-manager); Renal Function & Hydration Index (tool-103-renal-function-hydration-index).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-096-hair-nail-tracker with stable ID mrx.tool.096-hair-nail-tracker.
2. Typed HairNailTrackerInputSchema exposes 5 field(s); 0 carry explicit bounds.
3. Deterministic engine exports trackHairNailStatus; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-096-hair-nail-tracker.json exists (23 AR / 23 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Hair & Nail Observation Log.** In: daily_shedding_rate, temporal_vertex_thinning | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_shedding_rate.** In: daily_shedding_rate:enum enum(normal_under_50|moderate_50_to_100|excessive_over_100); temporal_vertex_thinning:other unbounded; scalp_sebum_inflammation:enum enum(none|mild_pruritus|severe_seborrheic_dermatitis); nail_brittleness_or_ridging:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Hair & Nail Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_shedding_rate.** In: changed daily_shedding_rate with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for temporal_vertex_thinning.** In: global metric/imperial preference + daily_shedding_rate | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Hair & Nail Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Hair & Nail Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Skin Observation Log (tool-095-skin-health-optimizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 103 — Renal Function & Hydration Index

- **Stable ID:** `mrx.tool.103-renal-function-hydration-index`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-103-renal-function-hydration-index` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** eGFR/creatinine hydration-aware index
- **Inputs:** serum_creatinine_mg_dl:number [0.1..20]; age_years:number [18..120] int; sex:enum enum(male\|female); body_weight_kg:number [30..250]; fluid_intake_liters:number [0..15]; climate:enum enum(temperate\|hot_humid); training_sweat_liters:number [0..10]
- **Outputs:** egfr_ml_min_1_73, egfr_valid, egfr_category, hydration_index, hydration_status, target_fluid_liters, monitoring_flags, scope_notice
- **Evidence:** component `components/tools/tool-103-renal-function-hydration-index.tsx`; engine `lib/tools/engines/tool-103-renal-function-hydration-index.ts`; schema `lib/tools/schemas/tool-103-renal-function-hydration-index.ts`; tests 2; i18n `i18n/tool-103-renal-function-hydration-index.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Hair & Nail Observation Log (tool-096-hair-nail-tracker); Skin Observation Log (tool-095-skin-health-optimizer); Serotonin Manager (tool-089-serotonin-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-103-renal-function-hydration-index with stable ID mrx.tool.103-renal-function-hydration-index.
2. Typed RenalFunctionInputSchema exposes 7 field(s); 5 carry explicit bounds.
3. Deterministic engine exports kappaForSex, alphaForSex, calculateEgfrCkdEpi2021; no model-generated number overrides the engine.
4. 2 test file(s) matched; 10 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-103-renal-function-hydration-index.json exists (32 AR / 32 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No source/provenance text is encoded in the engine.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Renal Function & Hydration Index.** In: serum_creatinine_mg_dl, age_years | Out: versioned formula sheet + egfr_ml_min_1_73 | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for serum_creatinine_mg_dl.** In: serum_creatinine_mg_dl:number [0.1..20]; age_years:number [18..120] int; sex:enum enum(male|female); body_weight_kg:number [30..250]; +3 more | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Renal Function & Hydration Index.** In: egfr_ml_min_1_73, egfr_valid | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for serum_creatinine_mg_dl.** In: changed serum_creatinine_mg_dl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from egfr_ml_min_1_73.** In: egfr_ml_min_1_73 + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for serum_creatinine_mg_dl, body_weight_kg, fluid_intake_liters, training_sweat_liters.** In: global metric/imperial preference + serum_creatinine_mg_dl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Renal Function & Hydration Index.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Renal Function & Hydration Index.** In: egfr_ml_min_1_73, egfr_valid | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of egfr_ml_min_1_73.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Hair & Nail Observation Log (tool-096-hair-nail-tracker).** In: approved subset of egfr_ml_min_1_73 | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return sex === 'female' ? -0.241 : -0.302;` `const ratio = scrMgDl / kappa;` `Math.pow(Math.min(ratio, 1), alpha) *` `Math.pow(Math.max(ratio, 1), -1.2) *`

---

### 182 — Cardiovascular Note Record

- **Stable ID:** `mrx.tool.182-cardiovascular-risk-assessor`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-182-cardiovascular-risk-assessor` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note only; no cardiovascular risk assessment.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-182-cardiovascular-risk-assessor.tsx`; engine `lib/tools/engines/tool-182-cardiovascular.v7.ts`; schema `lib/tools/schemas/tool-182-cardiovascular.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Bone Note Record (tool-183-bone-density-optimizer); Mood Note Record (tool-184-mental-health-monitor); GH Note Record (tool-186-growth-hormone-protocol-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-182-cardiovascular-risk-assessor with stable ID mrx.tool.182-cardiovascular-risk-assessor.
2. Typed CardioNoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordCardioNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Cardiovascular Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Cardiovascular Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — CardioNoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Cardiovascular Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Cardiovascular Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Cardiovascular Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Cardiovascular Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Cardiovascular Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Cardiovascular Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Cardiovascular Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Bone Note Record (tool-183-bone-density-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 183 — Bone Note Record

- **Stable ID:** `mrx.tool.183-bone-density-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-183-bone-density-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note only; no bone-density optimization or diagnosis.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-183-bone-density-optimizer.tsx`; engine `lib/tools/engines/tool-183-bone-density.v7.ts`; schema `lib/tools/schemas/tool-183-bone-density.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Cardiovascular Note Record (tool-182-cardiovascular-risk-assessor); Mood Note Record (tool-184-mental-health-monitor); GH Note Record (tool-186-growth-hormone-protocol-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-183-bone-density-optimizer with stable ID mrx.tool.183-bone-density-optimizer.
2. Typed BoneNoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordBoneNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Bone Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Bone Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — BoneNoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Bone Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Bone Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Bone Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Bone Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Bone Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Bone Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Bone Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Cardiovascular Note Record (tool-182-cardiovascular-risk-assessor).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 184 — Mood Note Record

- **Stable ID:** `mrx.tool.184-mental-health-monitor`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-184-mental-health-monitor` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** Mood log only; no mental-health diagnosis or risk assessment.
- **Inputs:** mood:string [1..100]; note:string [?..300] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-184-mental-health-monitor.tsx`; engine `lib/tools/engines/tool-184-mental-health.v7.ts`; schema `lib/tools/schemas/tool-184-mental-health.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** GH Note Record (tool-186-growth-hormone-protocol-planner); Bone Note Record (tool-183-bone-density-optimizer); Generic Unit Arithmetic (tool-187-insulin-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-184-mental-health-monitor with stable ID mrx.tool.184-mental-health-monitor.
2. Typed MoodNoteSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordMoodNote; no model-generated number overrides the engine.
4. Captures up to 100 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Mood Note Record.** In: current mood record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Mood Note Record.** In: mood | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — MoodNoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Mood Note Record.** In: recorded mood | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Mood Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Mood Note Record.** In: mood | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Mood Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Mood Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Mood Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Mood Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to GH Note Record (tool-186-growth-hormone-protocol-planner).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 186 — GH Note Record

- **Stable ID:** `mrx.tool.186-growth-hormone-protocol-planner`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-186-growth-hormone-protocol-planner` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** Educational note record only; no growth-hormone protocol or dosing.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-186-growth-hormone-protocol-planner.tsx`; engine `lib/tools/engines/tool-186-growth-hormone.v7.ts`; schema `lib/tools/schemas/tool-186-growth-hormone.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Generic Unit Arithmetic (tool-187-insulin-conversion); Mood Note Record (tool-184-mental-health-monitor); Glucose Observation Log (tool-188-glucose-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-186-growth-hormone-protocol-planner with stable ID mrx.tool.186-growth-hormone-protocol-planner.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordGhNote; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for GH Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for GH Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for GH Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for GH Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for GH Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for GH Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for GH Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for GH Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for GH Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Generic Unit Arithmetic (tool-187-insulin-conversion).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 187 — Generic Unit Arithmetic

- **Stable ID:** `mrx.tool.187-insulin-conversion`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-187-insulin-conversion` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Labeled unit arithmetic only; no insulin dosing advice.
- **Inputs:** value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-187-insulin-conversion.tsx`; engine `lib/tools/engines/tool-187-insulin-conversion.v7.ts`; schema `lib/tools/schemas/tool-187-insulin-conversion.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** GH Note Record (tool-186-growth-hormone-protocol-planner); Glucose Observation Log (tool-188-glucose-tracker); Mood Note Record (tool-184-mental-health-monitor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-187-insulin-conversion with stable ID mrx.tool.187-insulin-conversion.
2. Typed ConversionSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports convertInsulinLabel; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Unit Arithmetic.** In: value, factor | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Unit Arithmetic.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Unit Arithmetic.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Unit Arithmetic.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to GH Note Record (tool-186-growth-hormone-protocol-planner).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 188 — Glucose Observation Log

- **Stable ID:** `mrx.tool.188-glucose-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-188-glucose-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User observation log only; no diagnosis or treatment target.
- **Inputs:** value:number [?..2000] >=0; unit:string [1..20]; observedAt:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-188-glucose-tracker.tsx`; engine `lib/tools/engines/tool-188-glucose-tracker.v7.ts`; schema `lib/tools/schemas/tool-188-glucose-tracker.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Generic Unit Arithmetic (tool-187-insulin-conversion); GH Note Record (tool-186-growth-hormone-protocol-planner); Mood Note Record (tool-184-mental-health-monitor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-188-glucose-tracker with stable ID mrx.tool.188-glucose-tracker.
2. Typed GlucoseSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordGlucose; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Glucose Observation Log.** In: value, unit | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..2000] >=0; unit:string [1..20]; observedAt:string unbounded | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Glucose Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Glucose Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Glucose Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Generic Unit Arithmetic (tool-187-insulin-conversion).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 193 — Prostate Data Record

- **Stable ID:** `mrx.tool.193-prostate-health-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-193-prostate-health-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User marker record only; no prostate diagnosis or management.
- **Inputs:** marker:string [1..100]; value:number [?..1000000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-193-prostate-health-manager.tsx`; engine `lib/tools/engines/tool-193-prostate.v7.ts`; schema `lib/tools/schemas/tool-193-prostate.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Note Record (tool-198-detoxification-optimizer); Glucose Observation Log (tool-188-glucose-tracker); Value Record (tool-199-oxidative-stress).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-193-prostate-health-manager with stable ID mrx.tool.193-prostate-health-manager.
2. Typed ProstateSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports recordProstate; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Prostate Data Record.** In: marker, value | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for marker.** In: marker:string [1..100]; value:number [?..1000000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Prostate Data Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for marker.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Prostate Data Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Prostate Data Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Note Record (tool-198-detoxification-optimizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 198 — Note Record

- **Stable ID:** `mrx.tool.198-detoxification-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-198-detoxification-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no detoxification optimization or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-198-detoxification-optimizer.tsx`; engine `lib/tools/engines/tool-198-detoxification.v7.ts`; schema `lib/tools/schemas/tool-198-detoxification.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Value Record (tool-199-oxidative-stress); Item Record (tool-200-antioxidant-manager); Inflammation Note Record (tool-201-systemic-inflammation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-198-detoxification-optimizer with stable ID mrx.tool.198-detoxification-optimizer.
2. Typed DetoxSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordDetoxNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — DetoxSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Value Record (tool-199-oxidative-stress).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 199 — Value Record

- **Stable ID:** `mrx.tool.199-oxidative-stress`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-199-oxidative-stress` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User value record only; no oxidative-stress estimate or diagnosis.
- **Inputs:** value:number [?..1000000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-199-oxidative-stress.tsx`; engine `lib/tools/engines/tool-199-oxidative-stress.v7.ts`; schema `lib/tools/schemas/tool-199-oxidative-stress.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Note Record (tool-198-detoxification-optimizer); Item Record (tool-200-antioxidant-manager); Inflammation Note Record (tool-201-systemic-inflammation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-199-oxidative-stress with stable ID mrx.tool.199-oxidative-stress.
2. Typed OxSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordOxidativeValue; no model-generated number overrides the engine.
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (2 lines); implementation can be inspected at components/tools/tool-199-oxidative-stress.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Value Record.** In: value, unit | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Value Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Value Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Value Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Note Record (tool-198-detoxification-optimizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 200 — Item Record

- **Stable ID:** `mrx.tool.200-antioxidant-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-200-antioxidant-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User item record only; no antioxidant regimen or recommendation.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-200-antioxidant-manager.tsx`; engine `lib/tools/engines/tool-200-antioxidant.v7.ts`; schema `lib/tools/schemas/tool-200-antioxidant.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Value Record (tool-199-oxidative-stress); Note Record (tool-198-detoxification-optimizer); Inflammation Note Record (tool-201-systemic-inflammation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-200-antioxidant-manager with stable ID mrx.tool.200-antioxidant-manager.
2. Typed AntioxSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordAntioxidants; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 100 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Item Record.** In: current items record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Item Record.** In: items | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — AntioxSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Item Record.** In: recorded items | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Item Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Item Record.** In: items | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Item Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Item Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Item Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Item Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Value Record (tool-199-oxidative-stress).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 201 — Inflammation Note Record

- **Stable ID:** `mrx.tool.201-systemic-inflammation`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-201-systemic-inflammation` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no inflammation estimate or diagnosis.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-201-systemic-inflammation.tsx`; engine `lib/tools/engines/tool-201-systemic-inflammation.v7.ts`; schema `lib/tools/schemas/tool-201-systemic-inflammation.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Immune Note Record (tool-202-immune-system-optimizer); Item Record (tool-200-antioxidant-manager); Arterial Note Record (tool-203-arterial-health-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-201-systemic-inflammation with stable ID mrx.tool.201-systemic-inflammation.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordInflammation; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Inflammation Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Inflammation Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Inflammation Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Inflammation Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Inflammation Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Inflammation Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Inflammation Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Inflammation Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Inflammation Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Immune Note Record (tool-202-immune-system-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 202 — Immune Note Record

- **Stable ID:** `mrx.tool.202-immune-system-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-202-immune-system-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no immune optimization or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-202-immune-system-optimizer.tsx`; engine `lib/tools/engines/tool-202-immune-system.v7.ts`; schema `lib/tools/schemas/tool-202-immune-system.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Inflammation Note Record (tool-201-systemic-inflammation); Arterial Note Record (tool-203-arterial-health-manager); Viscosity Value Record (tool-204-blood-viscosity).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-202-immune-system-optimizer with stable ID mrx.tool.202-immune-system-optimizer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordImmune; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Immune Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Immune Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Immune Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Immune Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Immune Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Immune Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Immune Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Immune Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Immune Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Inflammation Note Record (tool-201-systemic-inflammation).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 203 — Arterial Note Record

- **Stable ID:** `mrx.tool.203-arterial-health-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-203-arterial-health-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no arterial diagnosis or management.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-203-arterial-health-manager.tsx`; engine `lib/tools/engines/tool-203-arterial-health.v7.ts`; schema `lib/tools/schemas/tool-203-arterial-health.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Immune Note Record (tool-202-immune-system-optimizer); Viscosity Value Record (tool-204-blood-viscosity); Inflammation Note Record (tool-201-systemic-inflammation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-203-arterial-health-manager with stable ID mrx.tool.203-arterial-health-manager.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordArterial; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Arterial Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Arterial Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Arterial Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Arterial Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Arterial Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Arterial Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Arterial Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Arterial Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Arterial Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Immune Note Record (tool-202-immune-system-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 204 — Viscosity Value Record

- **Stable ID:** `mrx.tool.204-blood-viscosity`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-204-blood-viscosity` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User value record only; no viscosity interpretation or diagnosis.
- **Inputs:** value:number [?..1000000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-204-blood-viscosity.tsx`; engine `lib/tools/engines/tool-204-blood-viscosity.v7.ts`; schema `lib/tools/schemas/tool-204-blood-viscosity.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Arterial Note Record (tool-203-arterial-health-manager); Nitric Oxide Note Record (tool-205-nitric-oxide-optimizer); Immune Note Record (tool-202-immune-system-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-204-blood-viscosity with stable ID mrx.tool.204-blood-viscosity.
2. Typed ValueSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordViscosity; no model-generated number overrides the engine.
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (2 lines); implementation can be inspected at components/tools/tool-204-blood-viscosity.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Viscosity Value Record.** In: value, unit | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Viscosity Value Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Viscosity Value Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Viscosity Value Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Arterial Note Record (tool-203-arterial-health-manager).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 205 — Nitric Oxide Note Record

- **Stable ID:** `mrx.tool.205-nitric-oxide-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-205-nitric-oxide-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no nitric-oxide optimization or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-205-nitric-oxide-optimizer.tsx`; engine `lib/tools/engines/tool-205-nitric-oxide.v7.ts`; schema `lib/tools/schemas/tool-205-nitric-oxide.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Viscosity Value Record (tool-204-blood-viscosity); Endothelial Note Record (tool-206-endothelial-health-manager); Arterial Note Record (tool-203-arterial-health-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-205-nitric-oxide-optimizer with stable ID mrx.tool.205-nitric-oxide-optimizer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordNitricOxide; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Nitric Oxide Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Nitric Oxide Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Nitric Oxide Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Nitric Oxide Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Nitric Oxide Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Nitric Oxide Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Nitric Oxide Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Nitric Oxide Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Nitric Oxide Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Viscosity Value Record (tool-204-blood-viscosity).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 206 — Endothelial Note Record

- **Stable ID:** `mrx.tool.206-endothelial-health-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-206-endothelial-health-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-206-endothelial-health-manager.tsx`; engine `lib/tools/engines/tool-206-endothelial.v7.ts`; schema `lib/tools/schemas/tool-206-endothelial.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Nitric Oxide Note Record (tool-205-nitric-oxide-optimizer); Metabolism Value Record (tool-207-fat-metabolism); Viscosity Value Record (tool-204-blood-viscosity).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-206-endothelial-health-manager with stable ID mrx.tool.206-endothelial-health-manager.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordEndothelial; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Endothelial Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Endothelial Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Endothelial Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Endothelial Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Endothelial Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Endothelial Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Endothelial Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Endothelial Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Endothelial Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Nitric Oxide Note Record (tool-205-nitric-oxide-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 207 — Metabolism Value Record

- **Stable ID:** `mrx.tool.207-fat-metabolism`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-207-fat-metabolism` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** value:number [?..1000000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-207-fat-metabolism.tsx`; engine `lib/tools/engines/tool-207-fat-metabolism.v7.ts`; schema `lib/tools/schemas/tool-207-fat-metabolism.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Endothelial Note Record (tool-206-endothelial-health-manager); Mitochondrial Note Record (tool-208-mitochondrial-optimizer); Nitric Oxide Note Record (tool-205-nitric-oxide-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-207-fat-metabolism with stable ID mrx.tool.207-fat-metabolism.
2. Typed ValueSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordFatValue; no model-generated number overrides the engine.
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (2 lines); implementation can be inspected at components/tools/tool-207-fat-metabolism.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Metabolism Value Record.** In: value, unit | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Metabolism Value Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Metabolism Value Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Metabolism Value Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Endothelial Note Record (tool-206-endothelial-health-manager).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 208 — Mitochondrial Note Record

- **Stable ID:** `mrx.tool.208-mitochondrial-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-208-mitochondrial-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-208-mitochondrial-optimizer.tsx`; engine `lib/tools/engines/tool-208-mitochondrial.v7.ts`; schema `lib/tools/schemas/tool-208-mitochondrial.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Metabolism Value Record (tool-207-fat-metabolism); Cellular Value Record (tool-209-cellular-aging); Endothelial Note Record (tool-206-endothelial-health-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-208-mitochondrial-optimizer with stable ID mrx.tool.208-mitochondrial-optimizer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordMitoNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Mitochondrial Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Mitochondrial Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Mitochondrial Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Mitochondrial Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Mitochondrial Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Mitochondrial Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Mitochondrial Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Mitochondrial Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Mitochondrial Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Metabolism Value Record (tool-207-fat-metabolism).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 209 — Cellular Value Record

- **Stable ID:** `mrx.tool.209-cellular-aging`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-209-cellular-aging` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** value:number [?..1000000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-209-cellular-aging.tsx`; engine `lib/tools/engines/tool-209-cellular-aging.v7.ts`; schema `lib/tools/schemas/tool-209-cellular-aging.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Mitochondrial Note Record (tool-208-mitochondrial-optimizer); Metabolism Value Record (tool-207-fat-metabolism); Telomere Note Record (tool-210-telomere-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-209-cellular-aging with stable ID mrx.tool.209-cellular-aging.
2. Typed AgingSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordAgingValue; no model-generated number overrides the engine.
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (2 lines); implementation can be inspected at components/tools/tool-209-cellular-aging.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cellular Value Record.** In: value, unit | Out: versioned formula sheet + the displayed result | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cellular Value Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cellular Value Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cellular Value Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Mitochondrial Note Record (tool-208-mitochondrial-optimizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 210 — Telomere Note Record

- **Stable ID:** `mrx.tool.210-telomere-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-210-telomere-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-210-telomere-manager.tsx`; engine `lib/tools/engines/tool-210-telomere.v7.ts`; schema `lib/tools/schemas/tool-210-telomere.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Cellular Value Record (tool-209-cellular-aging); Mitochondrial Note Record (tool-208-mitochondrial-optimizer); Metabolism Value Record (tool-207-fat-metabolism).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-210-telomere-manager with stable ID mrx.tool.210-telomere-manager.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordTelomereNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Telomere Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Telomere Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Telomere Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Telomere Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Telomere Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Telomere Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Telomere Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Telomere Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Telomere Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Cellular Value Record (tool-209-cellular-aging).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 211 — Anti-Aging Note Record

- **Stable ID:** `mrx.tool.211-anti-aging-inflammation`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-211-anti-aging-inflammation` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-211-anti-aging-inflammation.tsx`; engine `lib/tools/engines/tool-211-anti-aging.v7.ts`; schema `lib/tools/schemas/tool-211-anti-aging.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Cognitive Note Record (tool-212-cognitive-enhancer); Stress Note Record (tool-213-cortisol-stress); Mood Record (tool-214-mood-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-211-anti-aging-inflammation with stable ID mrx.tool.211-anti-aging-inflammation.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordAntiAging; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Anti-Aging Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Anti-Aging Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Anti-Aging Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Anti-Aging Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Anti-Aging Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Anti-Aging Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Anti-Aging Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Anti-Aging Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Anti-Aging Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Cognitive Note Record (tool-212-cognitive-enhancer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 212 — Cognitive Note Record

- **Stable ID:** `mrx.tool.212-cognitive-enhancer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-212-cognitive-enhancer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-212-cognitive-enhancer.tsx`; engine `lib/tools/engines/tool-212-cognitive.v7.ts`; schema `lib/tools/schemas/tool-212-cognitive.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Anti-Aging Note Record (tool-211-anti-aging-inflammation); Stress Note Record (tool-213-cortisol-stress); Mood Record (tool-214-mood-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-212-cognitive-enhancer with stable ID mrx.tool.212-cognitive-enhancer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordCognitive; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Cognitive Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Cognitive Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Cognitive Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Cognitive Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Cognitive Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Cognitive Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Cognitive Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Cognitive Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Cognitive Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Anti-Aging Note Record (tool-211-anti-aging-inflammation).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 213 — Stress Note Record

- **Stable ID:** `mrx.tool.213-cortisol-stress`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-213-cortisol-stress` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-213-cortisol-stress.tsx`; engine `lib/tools/engines/tool-213-cortisol.v7.ts`; schema `lib/tools/schemas/tool-213-cortisol.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Cognitive Note Record (tool-212-cognitive-enhancer); Mood Record (tool-214-mood-optimizer); Anti-Aging Note Record (tool-211-anti-aging-inflammation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-213-cortisol-stress with stable ID mrx.tool.213-cortisol-stress.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordCortisol; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Stress Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Stress Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Stress Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Stress Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Stress Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Stress Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Stress Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Stress Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Stress Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Cognitive Note Record (tool-212-cognitive-enhancer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 214 — Mood Record

- **Stable ID:** `mrx.tool.214-mood-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-214-mood-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** mood:string [1..100]; note:string [?..300] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-214-mood-optimizer.tsx`; engine `lib/tools/engines/tool-214-mood.v7.ts`; schema `lib/tools/schemas/tool-214-mood.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Stress Note Record (tool-213-cortisol-stress); Dopamine Note Record (tool-215-dopamine-tracker); Cognitive Note Record (tool-212-cognitive-enhancer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-214-mood-optimizer with stable ID mrx.tool.214-mood-optimizer.
2. Typed MoodSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordMood; no model-generated number overrides the engine.
4. Captures up to 100 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Mood Record.** In: current mood record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Mood Record.** In: mood | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — MoodSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Mood Record.** In: recorded mood | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Mood Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Mood Record.** In: mood | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Mood Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Mood Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Mood Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Mood Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Stress Note Record (tool-213-cortisol-stress).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 215 — Dopamine Note Record

- **Stable ID:** `mrx.tool.215-dopamine-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-215-dopamine-tracker` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..300]; observedAt:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-215-dopamine-tracker.tsx`; engine `lib/tools/engines/tool-215-dopamine.v7.ts`; schema `lib/tools/schemas/tool-215-dopamine.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Mood Record (tool-214-mood-optimizer); Serotonin Note Record (tool-216-serotonin-manager); Stress Note Record (tool-213-cortisol-stress).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-215-dopamine-tracker with stable ID mrx.tool.215-dopamine-tracker.
2. Typed DopamineSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordDopamine; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 300 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Dopamine Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Dopamine Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — DopamineSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Dopamine Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Dopamine Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Dopamine Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Dopamine Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Dopamine Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Dopamine Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Dopamine Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Mood Record (tool-214-mood-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 216 — Serotonin Note Record

- **Stable ID:** `mrx.tool.216-serotonin-manager`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-216-serotonin-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-216-serotonin-manager.tsx`; engine `lib/tools/engines/tool-216-serotonin.v7.ts`; schema `lib/tools/schemas/tool-216-serotonin.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Dopamine Note Record (tool-215-dopamine-tracker); Mood Record (tool-214-mood-optimizer); Stress Note Record (tool-213-cortisol-stress).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-216-serotonin-manager with stable ID mrx.tool.216-serotonin-manager.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSerotonin; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Serotonin Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Serotonin Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Serotonin Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Serotonin Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Serotonin Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Serotonin Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Serotonin Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Serotonin Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Serotonin Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Dopamine Note Record (tool-215-dopamine-tracker).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 222 — Skin Note Record

- **Stable ID:** `mrx.tool.222-skin-health-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-222-skin-health-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record or entry aggregation only; no diagnosis or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-222-skin-health-optimizer.tsx`; engine `lib/tools/engines/tool-222-skin-health.v7.ts`; schema `lib/tools/schemas/tool-222-skin-health.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Hair and Nail Log (tool-223-hair-nail-tracker); Digestive Note Record (tool-224-digestive-health-optimizer); Serotonin Note Record (tool-216-serotonin-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-222-skin-health-optimizer with stable ID mrx.tool.222-skin-health-optimizer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSkinNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Skin Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Skin Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Skin Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Skin Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Skin Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Skin Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Skin Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Skin Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Skin Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Hair and Nail Log (tool-223-hair-nail-tracker).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 223 — Hair and Nail Log

- **Stable ID:** `mrx.tool.223-hair-nail-tracker`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-223-hair-nail-tracker` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record or entry aggregation only; no diagnosis or medical advice.
- **Inputs:** observation:string [1..300]; observedAt:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-223-hair-nail-tracker.tsx`; engine `lib/tools/engines/tool-223-hair-nail.v7.ts`; schema `lib/tools/schemas/tool-223-hair-nail.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Skin Note Record (tool-222-skin-health-optimizer); Digestive Note Record (tool-224-digestive-health-optimizer); Serotonin Note Record (tool-216-serotonin-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-223-hair-nail-tracker with stable ID mrx.tool.223-hair-nail-tracker.
2. Typed HairNailSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordHairNail; no model-generated number overrides the engine.
4. Captures up to 300 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Hair and Nail Log.** In: current observation record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Hair and Nail Log.** In: observation | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — HairNailSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Hair and Nail Log.** In: recorded observation | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Hair and Nail Log.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Hair and Nail Log.** In: observation | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Hair and Nail Log.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Hair and Nail Log.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Hair and Nail Log.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Hair and Nail Log.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Skin Note Record (tool-222-skin-health-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 224 — Digestive Note Record

- **Stable ID:** `mrx.tool.224-digestive-health-optimizer`
- **Category / route / status:** Medical Monitoring · `/smarttools/medical-monitoring/tool-224-digestive-health-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record or entry aggregation only; no diagnosis or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-224-digestive-health-optimizer.tsx`; engine `lib/tools/engines/tool-224-digestive.v7.ts`; schema `lib/tools/schemas/tool-224-digestive.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Hair and Nail Log (tool-223-hair-nail-tracker); Skin Note Record (tool-222-skin-health-optimizer); Serotonin Note Record (tool-216-serotonin-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/medical-monitoring/tool-224-digestive-health-optimizer with stable ID mrx.tool.224-digestive-health-optimizer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordDigestive; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Digestive Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Digestive Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical reference range with laboratory method, units, population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Digestive Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Digestive Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Digestive Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Digestive Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical reference range with laboratory method, units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Digestive Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Digestive Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Digestive Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Hair and Nail Log (tool-223-hair-nail-tracker).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---
