# R5 255-TOOL PER-TOOL DOSSIERS — REPRODUCTIVE WELLBEING

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 19 catalog entries in this category (19 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — HCG & SERM Protocol

- **Stable ID:** `mrx.tool.hcg-serm-protocol`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/hcg-serm-protocol` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Receptor recovery protocol generator
- **Inputs:** compounds:array unbounded; cycleWeeks:number [4..52] int; testicularStatus:other unbounded; preferredSerm:other unbounded; sideEffects:other unbounded; bodyWeightKg:number [30..300] optional; washoutEndDateIso:string optional
- **Outputs:** sScore, severity, severityLabelEn, severityLabelAr, totalDurationWeeks, selectedSermId, selectedSermNameEn, selectedSermNameAr, isAutoSwitched, +9 more
- **Evidence:** component `components/tools/hcg-serm-protocol.tsx`; engine `lib/tools/engines/hcg-serm-protocol.ts`; schema `lib/tools/schemas/hcg-serm-protocol.ts`; tests 2; i18n `i18n/hcg-serm-protocol.json`; measurement yes; narrative yes; AI result context no; sliders 2.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Sperm Production Optimizer (tool-064-sperm-production-optimizer); Menstrual Cycle Calendar Log (tool-093-menstrual-cycle-manager); Pregnancy Exposure Information (tool-094-pregnancy-risk-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/hcg-serm-protocol with stable ID mrx.tool.hcg-serm-protocol.
2. Typed HcgSermEngineInputSchema exposes 7 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateSuppressionScore, resolveSermSelection, calculateHcgSermProtocol; no model-generated number overrides the engine.
4. 2 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/hcg-serm-protocol.json exists (34 AR / 34 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
3. No explicit assumptions array/contract.
4. No ARIA/role/sr-only affordance detected in the component.
5. No <main> landmark in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for HCG & SERM Protocol.** In: compounds, cycleWeeks | Out: versioned formula sheet + sScore | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array unbounded; cycleWeeks:number [4..52] int; testicularStatus:other unbounded; preferredSerm:other unbounded; +3 more | Out: field-level validation messages + canonical value | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for HCG & SERM Protocol.** In: sScore, severity | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycleWeeks.** In: changed cycleWeeks with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from sScore.** In: sScore + declared goal if present | Out: status vs validated range/goal | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for bodyWeightKg.** In: global metric/imperial preference + cycleWeeks | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for HCG & SERM Protocol.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for HCG & SERM Protocol.** In: sScore, severity | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of sScore.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Sperm Production Optimizer (tool-064-sperm-production-optimizer).** In: approved subset of sScore | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const doseFraction = Math.max(10, c.weeklyDoseMg) / 100; // normalized to 100mg TRT reference` `const durationFactor = Math.log(Math.max(4, cycleWeeks) + 1);` `const rawScore = (baseScore / 3) * durationFactor;` `const sScore = Math.round(rawScore * 10) / 10;`

---

### 064 — Sperm Production Optimizer

- **Stable ID:** `mrx.tool.064-sperm-production-optimizer`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-064-sperm-production-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Spermatogenesis recovery support
- **Inputs:** months_since_last_cycle:number [0..36]; age:number [18..70] int; hcg_used:other unbounded; weekly_training_hours:number [0..30]; sleep_hours:number [0..14]
- **Outputs:** recovery_score, recommendations
- **Evidence:** component `components/tools/tool-064-sperm-production-optimizer.tsx`; engine `lib/tools/engines/tool-064-sperm-production-optimizer.ts`; schema `lib/tools/schemas/tool-064-sperm-production-optimizer.ts`; tests 1; i18n `i18n/tool-064-sperm-production-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Menstrual Cycle Calendar Log (tool-093-menstrual-cycle-manager); Pregnancy Exposure Information (tool-094-pregnancy-risk-calculator); HCG & SERM Protocol (hcg-serm-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-064-sperm-production-optimizer with stable ID mrx.tool.064-sperm-production-optimizer.
2. Typed SpermProductionInputSchema exposes 5 field(s); 4 carry explicit bounds.
3. Deterministic engine exports optimizeSpermProduction; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-064-sperm-production-optimizer.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Sperm Production Optimizer.** In: months_since_last_cycle, age | Out: versioned formula sheet + recovery_score | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for months_since_last_cycle.** In: months_since_last_cycle:number [0..36]; age:number [18..70] int; hcg_used:other unbounded; weekly_training_hours:number [0..30]; +1 more | Out: field-level validation messages + canonical value | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Sperm Production Optimizer.** In: recovery_score, recommendations | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for months_since_last_cycle.** In: changed months_since_last_cycle with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from recovery_score.** In: recovery_score + declared goal if present | Out: status vs validated range/goal | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for months_since_last_cycle.** In: global metric/imperial preference + months_since_last_cycle | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Sperm Production Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Sperm Production Optimizer.** In: recovery_score, recommendations | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of recovery_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Menstrual Cycle Calendar Log (tool-093-menstrual-cycle-manager).** In: approved subset of recovery_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.min(100, Math.max(0, score));`

---

### 093 — Menstrual Cycle Calendar Log

- **Stable ID:** `mrx.tool.093-menstrual-cycle-manager`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-093-menstrual-cycle-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Record cycle-calendar inputs without ovulation or fertility inference
- **Inputs:** cycle_length_days:number [21..45]; current_cycle_day:number [1..45]; oral_contraceptive_active:other unbounded; high_intensity_training_focus:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-093-menstrual-cycle-manager.tsx`; engine `lib/tools/engines/tool-093-menstrual-cycle-manager.ts`; schema `lib/tools/schemas/tool-093-menstrual-cycle-manager.ts`; tests 1; i18n `i18n/tool-093-menstrual-cycle-manager.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; <main> present.
- **Related:** Pregnancy Exposure Information (tool-094-pregnancy-risk-calculator); Sperm Production Optimizer (tool-064-sperm-production-optimizer); Side-Effect Observation Log (tool-152-side-effect-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-093-menstrual-cycle-manager with stable ID mrx.tool.093-menstrual-cycle-manager.
2. Typed MenstrualCycleManagerInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports manageMenstrualCycle; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-093-menstrual-cycle-manager.json exists (26 AR / 26 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Menstrual Cycle Calendar Log.** In: cycle_length_days, current_cycle_day | Out: versioned formula sheet + the displayed result | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for cycle_length_days.** In: cycle_length_days:number [21..45]; current_cycle_day:number [1..45]; oral_contraceptive_active:other unbounded; high_intensity_training_focus:other unbounded | Out: field-level validation messages + canonical value | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Menstrual Cycle Calendar Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycle_length_days.** In: changed cycle_length_days with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for cycle_length_days.** In: global metric/imperial preference + cycle_length_days | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Menstrual Cycle Calendar Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Menstrual Cycle Calendar Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Pregnancy Exposure Information (tool-094-pregnancy-risk-calculator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 094 — Pregnancy Exposure Information

- **Stable ID:** `mrx.tool.094-pregnancy-risk-calculator`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-094-pregnancy-risk-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Explains why pregnancy risk and timing require product-specific individualized review; does not calculate clearance or safety
- **Inputs:** compound_class:enum enum(anabolic_androgenic_steroid\|sarm\|aromatase_inhibitor_or_serm\|retinoid_isotretinoin\|thermogenic_adrenergic); weeks_since_last_exposure:number [0..104]; currently_pregnant_or_attempting_conception:other unbounded; unprotected_intercourse_during_exposure:other unbounded
- **Outputs:** status, reason, resultOrigin, message
- **Evidence:** component `components/tools/tool-094-pregnancy-risk-calculator.tsx`; engine `lib/tools/engines/tool-094-pregnancy-risk-calculator.ts`; schema `lib/tools/schemas/tool-094-pregnancy-risk-calculator.ts`; tests 2; i18n `i18n/tool-094-pregnancy-risk-calculator.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; <main> present.
- **Related:** Menstrual Cycle Calendar Log (tool-093-menstrual-cycle-manager); Sperm Production Optimizer (tool-064-sperm-production-optimizer); Side-Effect Observation Log (tool-152-side-effect-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-094-pregnancy-risk-calculator with stable ID mrx.tool.094-pregnancy-risk-calculator.
2. Typed PregnancyRiskCalculatorInputSchema exposes 4 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculatePregnancyRisk; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-094-pregnancy-risk-calculator.json exists (1 AR / 1 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Pregnancy Exposure Information.** In: compound_class, weeks_since_last_exposure | Out: versioned formula sheet + status | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compound_class.** In: compound_class:enum enum(anabolic_androgenic_steroid|sarm|aromatase_inhibitor_or_serm|retinoid_isotretinoin|thermogenic_adrenergic); weeks_since_last_exposure:number [0..104]; currently_pregnant_or_attempting_conception:other unbounded; unprotected_intercourse_during_exposure:other unbounded | Out: field-level validation messages + canonical value | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Pregnancy Exposure Information.** In: status, reason | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weeks_since_last_exposure.** In: changed weeks_since_last_exposure with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for currently_pregnant_or_attempting_conception.** In: global metric/imperial preference + weeks_since_last_exposure | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Pregnancy Exposure Information.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Pregnancy Exposure Information.** In: status, reason | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Menstrual Cycle Calendar Log (tool-093-menstrual-cycle-manager).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 152 — Side-Effect Observation Log

- **Stable ID:** `mrx.tool.152-side-effect-tracker`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-152-side-effect-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-entered symptom observations only; no diagnosis or treatment advice.
- **Inputs:** entries:array [?..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-152-side-effect-tracker.tsx`; engine `lib/tools/engines/tool-152-side-effect-tracker.v7.ts`; schema `lib/tools/schemas/tool-152-side-effect-tracker.v7.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Progress Observation Log (tool-155-progress-tracker); DHT Observation Record (tool-178-dht-side-effect-predictor); Break Date Record (tool-179-cycle-break-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-152-side-effect-tracker with stable ID mrx.tool.152-side-effect-tracker.
2. Typed SideEffectLogInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSideEffects; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Side-Effect Observation Log.** In: entries, entries | Out: versioned formula sheet + the displayed result | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..100] | Out: field-level validation messages + canonical value | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Side-Effect Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Side-Effect Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Side-Effect Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Progress Observation Log (tool-155-progress-tracker).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 155 — Progress Observation Log

- **Stable ID:** `mrx.tool.155-progress-tracker`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-155-progress-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User-provided progress entries only; no health judgment or prediction.
- **Inputs:** entries:array [?..200]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-155-progress-tracker.tsx`; engine `lib/tools/engines/tool-155-progress-tracker.v7.ts`; schema `lib/tools/schemas/tool-155-progress-tracker.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Side-Effect Observation Log (tool-152-side-effect-tracker); DHT Observation Record (tool-178-dht-side-effect-predictor); Break Date Record (tool-179-cycle-break-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-155-progress-tracker with stable ID mrx.tool.155-progress-tracker.
2. Typed ProgressInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordProgress; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Progress Observation Log.** In: entries, entries | Out: versioned formula sheet + the displayed result | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..200] | Out: field-level validation messages + canonical value | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Progress Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Progress Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Progress Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Side-Effect Observation Log (tool-152-side-effect-tracker).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 178 — DHT Observation Record

- **Stable ID:** `mrx.tool.178-dht-side-effect-predictor`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-178-dht-side-effect-predictor` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User observation only; no prediction or diagnosis.
- **Inputs:** observation:string [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-178-dht-side-effect-predictor.tsx`; engine `lib/tools/engines/tool-178-dht-observation.v7.ts`; schema `lib/tools/schemas/tool-178-dht-observation.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Break Date Record (tool-179-cycle-break-planner); TRT Note Record (tool-180-trt-lifetime); Fertility Note Record (tool-181-fertility-preservation-guide).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-178-dht-side-effect-predictor with stable ID mrx.tool.178-dht-side-effect-predictor.
2. Typed DhtRecordSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordDhtObservation; no model-generated number overrides the engine.
4. Captures up to 300 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for DHT Observation Record.** In: current observation record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for DHT Observation Record.** In: observation | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — DhtRecordSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for DHT Observation Record.** In: recorded observation | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for DHT Observation Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for DHT Observation Record.** In: observation | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for DHT Observation Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for DHT Observation Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for DHT Observation Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for DHT Observation Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Break Date Record (tool-179-cycle-break-planner).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 179 — Break Date Record

- **Stable ID:** `mrx.tool.179-cycle-break-planner`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-179-cycle-break-planner` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** Date record only; no recovery or cycle recommendation.
- **Inputs:** start:string unbounded; end:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-179-cycle-break-planner.tsx`; engine `lib/tools/engines/tool-179-cycle-break.v7.ts`; schema `lib/tools/schemas/tool-179-cycle-break.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** DHT Observation Record (tool-178-dht-side-effect-predictor); TRT Note Record (tool-180-trt-lifetime); Fertility Note Record (tool-181-fertility-preservation-guide).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-179-cycle-break-planner with stable ID mrx.tool.179-cycle-break-planner.
2. Typed BreakSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports recordBreakDates; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to a bounded number of bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Break Date Record.** In: current start record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Break Date Record.** In: start | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — BreakSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Break Date Record.** In: recorded start | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Break Date Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Break Date Record.** In: start | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Break Date Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Break Date Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Break Date Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Break Date Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to DHT Observation Record (tool-178-dht-side-effect-predictor).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 180 — TRT Note Record

- **Stable ID:** `mrx.tool.180-trt-lifetime`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-180-trt-lifetime` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** Date/note record only; no treatment planning or medical recommendation.
- **Inputs:** start:string unbounded; note:string [?..300] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-180-trt-lifetime.tsx`; engine `lib/tools/engines/tool-180-trt-lifetime.v7.ts`; schema `lib/tools/schemas/tool-180-trt-lifetime.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Break Date Record (tool-179-cycle-break-planner); Fertility Note Record (tool-181-fertility-preservation-guide); DHT Observation Record (tool-178-dht-side-effect-predictor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-180-trt-lifetime with stable ID mrx.tool.180-trt-lifetime.
2. Typed LifetimeSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordLifetimeNote; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to a bounded number of bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for TRT Note Record.** In: current start record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for TRT Note Record.** In: start | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — LifetimeSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for TRT Note Record.** In: recorded start | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for TRT Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for TRT Note Record.** In: start | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for TRT Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for TRT Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for TRT Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for TRT Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Break Date Record (tool-179-cycle-break-planner).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 181 — Fertility Note Record

- **Stable ID:** `mrx.tool.181-fertility-preservation-guide`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-181-fertility-preservation-guide` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** Educational note record only; no fertility protocol or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-181-fertility-preservation-guide.tsx`; engine `lib/tools/engines/tool-181-fertility-guide.v7.ts`; schema `lib/tools/schemas/tool-181-fertility-guide.v7.ts`; tests 1; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** TRT Note Record (tool-180-trt-lifetime); Break Date Record (tool-179-cycle-break-planner); DHT Observation Record (tool-178-dht-side-effect-predictor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-181-fertility-preservation-guide with stable ID mrx.tool.181-fertility-preservation-guide.
2. Typed FertilityNoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordFertilityNote; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Fertility Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Fertility Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — FertilityNoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Fertility Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Fertility Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Fertility Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Fertility Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Fertility Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Fertility Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Fertility Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to TRT Note Record (tool-180-trt-lifetime).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 192 — Hair Observation Log

- **Stable ID:** `mrx.tool.192-hair-loss-tracker`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-192-hair-loss-tracker` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User observation log only; no diagnosis or treatment recommendation.
- **Inputs:** observation:string [1..300]; observedAt:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-192-hair-loss-tracker.tsx`; engine `lib/tools/engines/tool-192-hair-loss.v7.ts`; schema `lib/tools/schemas/tool-192-hair-loss.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Suppression Note Record (tool-194-testicular-suppression); Fertility Note Record (tool-195-sperm-production-optimizer); Estrogen Note Record (tool-196-estrogen-sensitivity-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-192-hair-loss-tracker with stable ID mrx.tool.192-hair-loss-tracker.
2. Typed HairSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordHair; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 300 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Hair Observation Log.** In: current observation record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Hair Observation Log.** In: observation | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — HairSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Hair Observation Log.** In: recorded observation | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Hair Observation Log.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Hair Observation Log.** In: observation | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Hair Observation Log.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Hair Observation Log.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Hair Observation Log.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Hair Observation Log.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Suppression Note Record (tool-194-testicular-suppression).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 194 — Suppression Note Record

- **Stable ID:** `mrx.tool.194-testicular-suppression`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-194-testicular-suppression` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no suppression estimate or treatment advice.
- **Inputs:** note:string [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-194-testicular-suppression.tsx`; engine `lib/tools/engines/tool-194-testicular-suppression.v7.ts`; schema `lib/tools/schemas/tool-194-testicular-suppression.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Fertility Note Record (tool-195-sperm-production-optimizer); Hair Observation Log (tool-192-hair-loss-tracker); Estrogen Note Record (tool-196-estrogen-sensitivity-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-194-testicular-suppression with stable ID mrx.tool.194-testicular-suppression.
2. Typed SuppressionSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSuppression; no model-generated number overrides the engine.
4. Captures up to 300 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Suppression Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Suppression Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — SuppressionSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Suppression Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Suppression Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Suppression Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Suppression Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Suppression Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Suppression Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Suppression Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Fertility Note Record (tool-195-sperm-production-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 195 — Fertility Note Record

- **Stable ID:** `mrx.tool.195-sperm-production-optimizer`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-195-sperm-production-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no sperm-production optimization or medical advice.
- **Inputs:** note:string [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-195-sperm-production-optimizer.tsx`; engine `lib/tools/engines/tool-195-sperm-production.v7.ts`; schema `lib/tools/schemas/tool-195-sperm-production.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Suppression Note Record (tool-194-testicular-suppression); Estrogen Note Record (tool-196-estrogen-sensitivity-manager); Observation Log (tool-197-gynecomastia-tracker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-195-sperm-production-optimizer with stable ID mrx.tool.195-sperm-production-optimizer.
2. Typed SpermSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSperm; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 300 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Fertility Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Fertility Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — SpermSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Fertility Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Fertility Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Fertility Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Fertility Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Fertility Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Fertility Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Fertility Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Suppression Note Record (tool-194-testicular-suppression).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 196 — Estrogen Note Record

- **Stable ID:** `mrx.tool.196-estrogen-sensitivity-manager`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-196-estrogen-sensitivity-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no sensitivity assessment or treatment advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-196-estrogen-sensitivity-manager.tsx`; engine `lib/tools/engines/tool-196-estrogen-sensitivity.v7.ts`; schema `lib/tools/schemas/tool-196-estrogen-sensitivity.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Fertility Note Record (tool-195-sperm-production-optimizer); Observation Log (tool-197-gynecomastia-tracker); Suppression Note Record (tool-194-testicular-suppression).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-196-estrogen-sensitivity-manager with stable ID mrx.tool.196-estrogen-sensitivity-manager.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordEstrogenNote; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains a what-if/scenario/sensitivity surface.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Estrogen Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Estrogen Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Estrogen Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Estrogen Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Estrogen Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Estrogen Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Estrogen Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Estrogen Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Estrogen Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Fertility Note Record (tool-195-sperm-production-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 197 — Observation Log

- **Stable ID:** `mrx.tool.197-gynecomastia-tracker`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-197-gynecomastia-tracker` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User observation log only; no diagnosis or treatment recommendation.
- **Inputs:** observation:string [1..300]; observedAt:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-197-gynecomastia-tracker.tsx`; engine `lib/tools/engines/tool-197-gynecomastia.v7.ts`; schema `lib/tools/schemas/tool-197-gynecomastia.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Estrogen Note Record (tool-196-estrogen-sensitivity-manager); Fertility Note Record (tool-195-sperm-production-optimizer); Suppression Note Record (tool-194-testicular-suppression).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-197-gynecomastia-tracker with stable ID mrx.tool.197-gynecomastia-tracker.
2. Typed GynoSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordGyno; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 300 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Observation Log.** In: current observation record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Observation Log.** In: observation | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — GynoSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Observation Log.** In: recorded observation | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Observation Log.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Observation Log.** In: observation | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Observation Log.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Observation Log.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Observation Log.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Observation Log.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Estrogen Note Record (tool-196-estrogen-sensitivity-manager).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 217 — Hormone Note Record

- **Stable ID:** `mrx.tool.217-female-hormone-balance`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-217-female-hormone-balance` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-217-female-hormone-balance.tsx`; engine `lib/tools/engines/tool-217-female-balance.v7.ts`; schema `lib/tools/schemas/tool-217-female-balance.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Health Note Record (tool-218-female-health-optimizer); Date Record (tool-220-menstrual-cycle-manager); Pregnancy Note Record (tool-221-pregnancy-risk).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-217-female-hormone-balance with stable ID mrx.tool.217-female-hormone-balance.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordFemaleBalance; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Hormone Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Hormone Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Hormone Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Hormone Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Hormone Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Hormone Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Hormone Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Hormone Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Hormone Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Health Note Record (tool-218-female-health-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 218 — Health Note Record

- **Stable ID:** `mrx.tool.218-female-health-optimizer`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-218-female-health-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-218-female-health-optimizer.tsx`; engine `lib/tools/engines/tool-218-female-health.v7.ts`; schema `lib/tools/schemas/tool-218-female-health.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Hormone Note Record (tool-217-female-hormone-balance); Date Record (tool-220-menstrual-cycle-manager); Pregnancy Note Record (tool-221-pregnancy-risk).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-218-female-health-optimizer with stable ID mrx.tool.218-female-health-optimizer.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordFemaleHealth; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Health Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Health Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Health Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Health Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Health Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Health Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Health Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Health Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Health Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Hormone Note Record (tool-217-female-hormone-balance).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 220 — Date Record

- **Stable ID:** `mrx.tool.220-menstrual-cycle-manager`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-220-menstrual-cycle-manager` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** start:string unbounded; note:string [?..300] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-220-menstrual-cycle-manager.tsx`; engine `lib/tools/engines/tool-220-menstrual-cycle.v7.ts`; schema `lib/tools/schemas/tool-220-menstrual-cycle.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Pregnancy Note Record (tool-221-pregnancy-risk); Health Note Record (tool-218-female-health-optimizer); Hormone Note Record (tool-217-female-hormone-balance).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-220-menstrual-cycle-manager with stable ID mrx.tool.220-menstrual-cycle-manager.
2. Typed CycleSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordMenstrual; no model-generated number overrides the engine.
4. Captures up to a bounded number of bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Date Record.** In: current start record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Date Record.** In: start | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — CycleSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Date Record.** In: recorded start | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Date Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Date Record.** In: start | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Date Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Date Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Date Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Date Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Pregnancy Note Record (tool-221-pregnancy-risk).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 221 — Pregnancy Note Record

- **Stable ID:** `mrx.tool.221-pregnancy-risk`
- **Category / route / status:** Reproductive Wellbeing · `/smarttools/reproductive-wellbeing/tool-221-pregnancy-risk` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record or entry aggregation only; no diagnosis or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-221-pregnancy-risk.tsx`; engine `lib/tools/engines/tool-221-pregnancy-risk.v7.ts`; schema `lib/tools/schemas/tool-221-pregnancy-risk.v7.ts`; tests 1; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Date Record (tool-220-menstrual-cycle-manager); Health Note Record (tool-218-female-health-optimizer); Hormone Note Record (tool-217-female-hormone-balance).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/reproductive-wellbeing/tool-221-pregnancy-risk with stable ID mrx.tool.221-pregnancy-risk.
2. Typed PregnancySchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordPregnancyNote; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Pregnancy Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Pregnancy Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: clinical fertility/reproductive guideline with population and date | State: PARTIAL — PregnancySchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Pregnancy Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Pregnancy Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Pregnancy Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Pregnancy Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: clinical fertility/reproductive guideline with population and date | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Pregnancy Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Pregnancy Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Pregnancy Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Date Record (tool-220-menstrual-cycle-manager).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---
