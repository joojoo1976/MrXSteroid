# R5 255-TOOL PER-TOOL DOSSIERS — TRAINING & RECOVERY

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 23 catalog entries in this category (22 implemented, 1 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — Genetic Potential Calculator

- **Stable ID:** `mrx.tool.genetic`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/genetic` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Muscle-building genetic potential estimator
- **Inputs:** heightCm:number [100..250]; wristCm:number [10..30]; ankleCm:number [15..40]; bodyFatPct:number [1..60] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/genetic.tsx`; engine `lib/tools/engines/genetic.ts`; schema `lib/tools/schemas/genetic.ts`; tests 4; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Transformation Timeline (timeline); Genetic Potential Calculator (tool-020-genetic-potential); CNS Recovery Score (tool-118-cns-recovery-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/genetic with stable ID mrx.tool.genetic.
2. Typed GeneticInputSchema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateGeneticPotential; no model-generated number overrides the engine.
4. 4 test file(s) matched; 1 numeric assertion(s) detected.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Genetic Potential Calculator.** In: heightCm, wristCm | Out: versioned formula sheet + the displayed result | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for heightCm.** In: heightCm:number [100..250]; wristCm:number [10..30]; ankleCm:number [15..40]; bodyFatPct:number [1..60] optional | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Genetic Potential Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for heightCm.** In: changed heightCm with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for heightCm, wristCm, ankleCm.** In: global metric/imperial preference + heightCm | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Genetic Potential Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Genetic Potential Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Transformation Timeline (timeline).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const hM = heightCm / 100;` `const maxLBMkg = hM * hM * (COEFF_WRIST * wristCm + COEFF_ANKLE * ankleCm + CONSTANT);` `const maxFFMI = maxLBMkg / (hM * hM);`

---

### NAMED — Transformation Timeline

- **Stable ID:** `mrx.tool.timeline`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/timeline` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Visual transformation journey planner
- **Inputs:** startingWeightKg:number [30..300]; startingBodyFatPct:number [3..60]; goal:other unbounded; biologicalStatus:other unbounded; experienceLevel:other unbounded; caloricDeltaKcal:number [-1500..1500]; timelineWeeks:number [4..52] int
- **Outputs:** timeline, totalWeeksNeeded, targetReached, muscleGainedKg, fatLostKg
- **Evidence:** component `components/tools/timeline.tsx`; engine `lib/tools/engines/timeline.ts`; schema `lib/tools/schemas/timeline.ts`; tests 2; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Genetic Potential Calculator (genetic); Genetic Potential Calculator (tool-020-genetic-potential); CNS Recovery Score (tool-118-cns-recovery-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/timeline with stable ID mrx.tool.timeline.
2. Typed TimelineInputSchema exposes 7 field(s); 4 carry explicit bounds.
3. Deterministic engine exports waterRetentionPct, hypertrophyCap, adaptationFactor; no model-generated number overrides the engine.
4. 2 test file(s) matched; 15 numeric assertion(s) detected.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Transformation Timeline.** In: startingWeightKg, startingBodyFatPct | Out: versioned formula sheet + timeline | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for startingWeightKg.** In: startingWeightKg:number [30..300]; startingBodyFatPct:number [3..60]; goal:other unbounded; biologicalStatus:other unbounded; +3 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Transformation Timeline.** In: timeline, totalWeeksNeeded | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for startingWeightKg.** In: changed startingWeightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from timeline.** In: timeline + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for startingWeightKg.** In: global metric/imperial preference + startingWeightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Transformation Timeline.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Transformation Timeline.** In: timeline, totalWeeksNeeded | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of timeline.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Genetic Potential Calculator (genetic).** In: approved subset of timeline | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const round2 = (value: number): number => Math.round(value * 100) / 100;` `Math.min(Math.max(value, min), max);` `const v = Number.isFinite(value) ? Math.round(value) : fallback;` `return clamp(Math.round(v), min, max);`

---

### 020 — Genetic Potential Calculator

- **Stable ID:** `mrx.tool.020-genetic-potential`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-020-genetic-potential` · **FAIL** (confirmed formula/provenance defect (see formula status))
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Training potential estimator
- **Inputs:** age:number [14..80]; trainingYears:number [0..50]; priorCycles:number [0..20]; familyHistory:enum enum(baldness\|heart_disease\|liver_disease\|none\|other); bodyType:enum enum(ectomorph\|mesomorph\|endomorph\|mixed); goal:enum enum(bulk\|cut\|recomp\|strength); currentWeight:number [30..200]; height:number [100..250]
- **Outputs:** potential_score, body_type_assessment, risk_factors
- **Evidence:** component `components/tools/tool-020-genetic-potential.tsx`; engine `lib/tools/engines/tool-020-genetic-potential.ts`; schema `lib/tools/schemas/tool-020-genetic-potential.ts`; tests 2; i18n `i18n/tool-020-genetic-potential.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **FAIL** — the "genetic potential" score is an unsourced heuristic; no validated reference, population or uncertainty; false precision risk.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Transformation Timeline (timeline); Genetic Potential Calculator (genetic); CNS Recovery Score (tool-118-cns-recovery-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-020-genetic-potential with stable ID mrx.tool.020-genetic-potential.
2. Typed GeneticPotentialInputSchema exposes 8 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateGeneticPotential; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-020-genetic-potential.json exists (31 AR / 31 EN keys).

**Five evidence-backed gaps**
1. Formula status FAIL: the "genetic potential" score is an unsourced heuristic; no validated reference, population or uncertainty; false precision risk.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Genetic Potential Calculator.** In: age, trainingYears | Out: versioned formula sheet + potential_score | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [14..80]; trainingYears:number [0..50]; priorCycles:number [0..20]; familyHistory:enum enum(baldness|heart_disease|liver_disease|none|other); +4 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Genetic Potential Calculator.** In: potential_score, body_type_assessment | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from potential_score.** In: potential_score + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for currentWeight, height.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Genetic Potential Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Genetic Potential Calculator.** In: potential_score, body_type_assessment | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of potential_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Transformation Timeline (timeline).** In: approved subset of potential_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const bmi = currentWeight / Math.pow(height / 100, 2);` `score += Math.min(15, trainingYears * 2);` `score -= Math.min(10, priorCycles * 2);` `potential_score: Math.max(0, Math.min(100, Math.round(score))),`

---

### 118 — CNS Recovery Score

- **Stable ID:** `mrx.tool.118-cns-recovery-score`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-118-cns-recovery-score` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** CNS fatigue scoring
- **Inputs:** hrv_ms:number [?..300] >0 optional; hrv_baseline_ms:number [?..300] >0 optional; resting_hr_bpm:number [30..150] optional; resting_hr_baseline_bpm:number [30..150] optional; sleep_hours:number [0..24] optional; sleep_quality:other optional; body_temp_c:number [34..42] optional; body_temp_baseline_c:number [34..42] optional; mood:other optional; +9 more
- **Outputs:** cns_recovery_score, readiness_level, factor_scores, risk_flags, recommendations, interpretation, scope_notice
- **Evidence:** component `components/tools/tool-118-cns-recovery-score.tsx`; engine `lib/tools/engines/tool-118-cns-recovery-score.ts`; schema `lib/tools/schemas/tool-118-cns-recovery-score.ts`; tests 1; i18n `i18n/tool-118-cns-recovery-score.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Training Volume Load & Hypertrophy Index (tool-119-training-volume-hypertrophy-index); Progressive Overload & Adaptive Reserve Capacity Predictor (tool-120-progressive-overload-predictor); Muscle Group Recovery Time-Course Modeler (tool-121-muscle-group-recovery-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-118-cns-recovery-score with stable ID mrx.tool.118-cns-recovery-score.
2. Typed CNSRecoveryInputSchema exposes 18 field(s); 9 carry explicit bounds.
3. Deterministic engine exports calcCNSRecovery; no model-generated number overrides the engine.
4. 1 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-118-cns-recovery-score.json exists (59 AR / 59 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. No explicit assumptions array/contract.
4. No ARIA/role/sr-only affordance detected in the component.
5. No <main> landmark in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for CNS Recovery Score.** In: hrv_ms, hrv_baseline_ms | Out: versioned formula sheet + cns_recovery_score | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for hrv_ms.** In: hrv_ms:number [?..300] >0 optional; hrv_baseline_ms:number [?..300] >0 optional; resting_hr_bpm:number [30..150] optional; resting_hr_baseline_bpm:number [30..150] optional; +14 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for CNS Recovery Score.** In: cns_recovery_score, readiness_level | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for hrv_ms.** In: changed hrv_ms with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from cns_recovery_score.** In: cns_recovery_score + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for body_temp_c, body_temp_baseline_c, joint_pain.** In: global metric/imperial preference + hrv_ms | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for CNS Recovery Score.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for CNS Recovery Score.** In: cns_recovery_score, readiness_level | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of cns_recovery_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Training Volume Load & Hypertrophy Index (tool-119-training-volume-hypertrophy-index).** In: approved subset of cns_recovery_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.max(min, Math.min(max, value));` `const ratio = input.hrv_ms / input.hrv_baseline_ms;` `return clamp((avg - 1) * 25, 0, 100); // 1-5 -> 0-100` `const hrRatio = input.resting_hr_bpm / input.resting_hr_baseline_bpm;`

---

### 119 — Training Volume Load & Hypertrophy Index

- **Stable ID:** `mrx.tool.119-training-volume-hypertrophy-index`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-119-training-volume-hypertrophy-index` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Volume-load hypertrophy index
- **Inputs:** exercises:array [1..30]
- **Outputs:** total_volume_load_kg, volume_by_muscle, hypertrophy_index, frequency_analysis, intensity_distribution, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-119-training-volume-hypertrophy-index.tsx`; engine `lib/tools/engines/tool-119-training-volume-hypertrophy-index.ts`; schema `lib/tools/schemas/tool-119-training-volume-hypertrophy-index.ts`; tests 0; i18n `i18n/tool-119-training-volume-hypertrophy-index.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** CNS Recovery Score (tool-118-cns-recovery-score); Progressive Overload & Adaptive Reserve Capacity Predictor (tool-120-progressive-overload-predictor); Muscle Group Recovery Time-Course Modeler (tool-121-muscle-group-recovery-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-119-training-volume-hypertrophy-index with stable ID mrx.tool.119-training-volume-hypertrophy-index.
2. Typed VolumeInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calcVolumeHypertrophy; no model-generated number overrides the engine.
4. Tool-specific i18n file i18n/tool-119-training-volume-hypertrophy-index.json exists (56 AR / 57 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No what-if or scenario surface.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Training Volume Load & Hypertrophy Index.** In: exercises, exercises | Out: versioned formula sheet + total_volume_load_kg | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for exercises.** In: exercises:array [1..30] | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Training Volume Load & Hypertrophy Index.** In: total_volume_load_kg, volume_by_muscle | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for exercises.** In: changed exercises with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from total_volume_load_kg.** In: total_volume_load_kg + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for exercises.** In: global metric/imperial preference + exercises | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Training Volume Load & Hypertrophy Index.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Training Volume Load & Hypertrophy Index.** In: total_volume_load_kg, volume_by_muscle | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of total_volume_load_kg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to CNS Recovery Score (tool-118-cns-recovery-score).** In: approved subset of total_volume_load_kg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return clamp(pct / 100, 0.3, 1.0);` `return Math.max(min, Math.min(max, value));` `const volumeLoad = ex.sets * ex.reps * ex.weight_kg;` `const hypertrophyScore = volumeLoad * intFactor * freqFactor;`

---

### 120 — Progressive Overload & Adaptive Reserve Capacity Predictor

- **Stable ID:** `mrx.tool.120-progressive-overload-predictor`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-120-progressive-overload-predictor` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Overload progression predictor
- **Inputs:** exercise:string [1..100]; current_1rm_kg:number [?..500] >0; current_volume_load_kg:number [0..100000]; current_frequency:number [?..7] int >0; baseline_1rm_kg:number [?..500] >0; baseline_volume_load_kg:number [0..100000]; body_weight_kg:number [30..300]; height_cm:number [100..250]; age:number [13..100]; +9 more
- **Outputs:** adaptive_reserve_pct, weeks_to_plateau, projected_1rm_4weeks, projected_1rm_12weeks, recommended_weekly_increase_pct, overload_trajectory, risk_factors, flags, education_flags, +1 more
- **Evidence:** component `components/tools/tool-120-progressive-overload-predictor.tsx`; engine `lib/tools/engines/tool-120-progressive-overload-predictor.ts`; schema `lib/tools/schemas/tool-120-progressive-overload-predictor.ts`; tests 1; i18n `i18n/tool-120-progressive-overload-predictor.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Training Volume Load & Hypertrophy Index (tool-119-training-volume-hypertrophy-index); Muscle Group Recovery Time-Course Modeler (tool-121-muscle-group-recovery-modeler); CNS Recovery Score (tool-118-cns-recovery-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-120-progressive-overload-predictor with stable ID mrx.tool.120-progressive-overload-predictor.
2. Typed OverloadInputSchema exposes 18 field(s); 17 carry explicit bounds.
3. 1 test file(s) matched; 0 numeric assertion(s) detected.
4. Tool-specific i18n file i18n/tool-120-progressive-overload-predictor.json exists (47 AR / 47 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Progressive Overload & Adaptive Reserve Capacity Predictor.** In: exercise, current_1rm_kg | Out: versioned formula sheet + adaptive_reserve_pct | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for exercise.** In: exercise:string [1..100]; current_1rm_kg:number [?..500] >0; current_volume_load_kg:number [0..100000]; current_frequency:number [?..7] int >0; +14 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Progressive Overload & Adaptive Reserve Capacity Predictor.** In: adaptive_reserve_pct, weeks_to_plateau | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for current_1rm_kg.** In: changed current_1rm_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from adaptive_reserve_pct.** In: adaptive_reserve_pct + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for current_1rm_kg, current_volume_load_kg, baseline_1rm_kg, baseline_volume_load_kg, body_weight_kg, height_cm, protein_g_per_kg, wrist_cm, ankle_cm.** In: global metric/imperial preference + current_1rm_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Progressive Overload & Adaptive Reserve Capacity Predictor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Progressive Overload & Adaptive Reserve Capacity Predictor.** In: adaptive_reserve_pct, weeks_to_plateau | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of adaptive_reserve_pct.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Training Volume Load & Hypertrophy Index (tool-119-training-volume-hypertrophy-index).** In: approved subset of adaptive_reserve_pct | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const frameIndex = (wrist_cm + ankle_cm) / 2;` `potential *= 1 - Math.min(training_age_years * 0.03, 0.3);` `return Math.round(potential);` `const adaptiveReserve = Math.max(0, Math.min(1, (strengthReserve * 0.7 + volumeReserve * 0.3))) * 100;`

---

### 121 — Muscle Group Recovery Time-Course Modeler

- **Stable ID:** `mrx.tool.121-muscle-group-recovery-modeler`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-121-muscle-group-recovery-modeler` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Per-group recovery time-course
- **Inputs:** muscle_group:enum enum(chest\|back\|quads\|hamstrings\|glutes\|shoulders\|biceps\|triceps\|forearms\|calves\|abs\|lower_back); sets:number [?..20] int >0; rpe:number [1..10] optional; frequency_per_week:number [?..7] int >0; age:number [13..100]; sleep_hours:number [4..12]; protein_g_per_kg:number [0..5]; stress_level:other unbounded; training_age_years:number [0..30]
- **Outputs:** muscle_group, estimated_recovery_hours, estimated_recovery_days, readiness_timeline, volume_factor, intensity_factor, individual_factor, next_session_readiness_pct, education_flags, +1 more
- **Evidence:** component `components/tools/tool-121-muscle-group-recovery-modeler.tsx`; engine `lib/tools/engines/tool-121-muscle-group-recovery-modeler.ts`; schema `lib/tools/schemas/tool-121-muscle-group-recovery-modeler.ts`; tests 0; i18n `i18n/tool-121-muscle-group-recovery-modeler.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Progressive Overload & Adaptive Reserve Capacity Predictor (tool-120-progressive-overload-predictor); RPE / RIR to 1RM Dynamic Velocity Modeler (tool-122-rpe-rir-1rm-velocity-modeler); Training Volume Load & Hypertrophy Index (tool-119-training-volume-hypertrophy-index).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-121-muscle-group-recovery-modeler with stable ID mrx.tool.121-muscle-group-recovery-modeler.
2. Typed RecoveryInputSchema exposes 9 field(s); 7 carry explicit bounds.
3. Tool-specific i18n file i18n/tool-121-muscle-group-recovery-modeler.json exists (47 AR / 47 EN keys).
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. No test file covers this tool.
4. No what-if or scenario surface.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Muscle Group Recovery Time-Course Modeler.** In: muscle_group, sets | Out: versioned formula sheet + muscle_group | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for muscle_group.** In: muscle_group:enum enum(chest|back|quads|hamstrings|glutes|shoulders|biceps|triceps|forearms|calves|abs|lower_back); sets:number [?..20] int >0; rpe:number [1..10] optional; frequency_per_week:number [?..7] int >0; +5 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Muscle Group Recovery Time-Course Modeler.** In: muscle_group, estimated_recovery_hours | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sets.** In: changed sets with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from muscle_group.** In: muscle_group + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for protein_g_per_kg.** In: global metric/imperial preference + sets | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Muscle Group Recovery Time-Course Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Muscle Group Recovery Time-Course Modeler.** In: muscle_group, estimated_recovery_hours | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of muscle_group.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Progressive Overload & Adaptive Reserve Capacity Predictor (tool-120-progressive-overload-predictor).** In: approved subset of muscle_group | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const volumeFactor = 1 + Math.max(0, (sets - 3)) * 0.15;` `const intensityFactor = 1 + Math.max(0, (rpe ?? 7) - 7) * 0.2;` `const estimatedHours = Math.round(baseHours * volumeFactor * intensityFactor * individualFactor);` `const estimatedDays = Math.round(estimatedHours / 24 * 10) / 10;`

---

### 122 — RPE / RIR to 1RM Dynamic Velocity Modeler

- **Stable ID:** `mrx.tool.122-rpe-rir-1rm-velocity-modeler`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-122-rpe-rir-1rm-velocity-modeler` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** RPE/RIR-based 1RM velocity model
- **Inputs:** velocity_profile:array [2..10]; target_weight_kg:number [?..500] >0; target_velocity_m_s:number [?..3] >0 optional; target_rpe:number [1..10] optional; target_rir:number [0..10] optional
- **Outputs:** estimated_1rm_kg, estimation_method, confidence, velocity_based_1rm, rpe_based_1rm, rir_based_1rm, load_velocity_profile, lvp_equation, mv_threshold_m_s, +2 more
- **Evidence:** component `components/tools/tool-122-rpe-rir-1rm-velocity-modeler.tsx`; engine `lib/tools/engines/tool-122-rpe-rir-1rm-velocity-modeler.ts`; schema `lib/tools/schemas/tool-122-rpe-rir-1rm-velocity-modeler.ts`; tests 2; i18n `i18n/tool-122-rpe-rir-1rm-velocity-modeler.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Muscle Group Recovery Time-Course Modeler (tool-121-muscle-group-recovery-modeler); Joint Stress & Connective Tissue Load Risk Index (tool-123-joint-stress-connective-tissue-index); Progressive Overload & Adaptive Reserve Capacity Predictor (tool-120-progressive-overload-predictor).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-122-rpe-rir-1rm-velocity-modeler with stable ID mrx.tool.122-rpe-rir-1rm-velocity-modeler.
2. Typed VelocityInputSchema exposes 5 field(s); 5 carry explicit bounds.
3. 2 test file(s) matched; 0 numeric assertion(s) detected.
4. Tool-specific i18n file i18n/tool-122-rpe-rir-1rm-velocity-modeler.json exists (43 AR / 43 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. 2 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for RPE / RIR to 1RM Dynamic Velocity Modeler.** In: velocity_profile, target_weight_kg | Out: versioned formula sheet + estimated_1rm_kg | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for velocity_profile.** In: velocity_profile:array [2..10]; target_weight_kg:number [?..500] >0; target_velocity_m_s:number [?..3] >0 optional; target_rpe:number [1..10] optional; +1 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for RPE / RIR to 1RM Dynamic Velocity Modeler.** In: estimated_1rm_kg, estimation_method | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for target_weight_kg.** In: changed target_weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from estimated_1rm_kg.** In: estimated_1rm_kg + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for target_weight_kg.** In: global metric/imperial preference + target_weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for RPE / RIR to 1RM Dynamic Velocity Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for RPE / RIR to 1RM Dynamic Velocity Modeler.** In: estimated_1rm_kg, estimation_method | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of estimated_1rm_kg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Muscle Group Recovery Time-Course Modeler (tool-121-muscle-group-recovery-modeler).** In: approved subset of estimated_1rm_kg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);` `const intercept = (sumY - slope * sumX) / n;` `const yMean = sumY / n;` `return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };`

---

### 123 — Joint Stress & Connective Tissue Load Risk Index

- **Stable ID:** `mrx.tool.123-joint-stress-connective-tissue-index`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-123-joint-stress-connective-tissue-index` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Joint/connective-tissue load index
- **Inputs:** name:string [1..100]; joint:enum enum(shoulder\|elbow\|wrist\|hip\|knee\|ankle\|spine); sets:number [?..20] int >0; reps:number [?..50] int >0; weight_kg:number [?..500] >0; rpe:number [1..10] optional; range_of_motion:enum enum(partial\|full\|extended)
- **Outputs:** overall_stress_index, joint_breakdown, connective_tissue_risk, protective_factors, recommendations, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-123-joint-stress-connective-tissue-index.tsx`; engine `lib/tools/engines/tool-123-joint-stress-connective-tissue-index.ts`; schema `lib/tools/schemas/tool-123-joint-stress-connective-tissue-index.ts`; tests 0; i18n `i18n/tool-123-joint-stress-connective-tissue-index.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** RPE / RIR to 1RM Dynamic Velocity Modeler (tool-122-rpe-rir-1rm-velocity-modeler); Deload Frequency & Fatigue Accumulation Modeler (tool-124-deload-frequency-fatigue-modeler); Muscle Group Recovery Time-Course Modeler (tool-121-muscle-group-recovery-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-123-joint-stress-connective-tissue-index with stable ID mrx.tool.123-joint-stress-connective-tissue-index.
2. Typed ExerciseInputSchema exposes 7 field(s); 5 carry explicit bounds.
3. Tool-specific i18n file i18n/tool-123-joint-stress-connective-tissue-index.json exists (74 AR / 74 EN keys).
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. No test file covers this tool.
4. No what-if or scenario surface.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Joint Stress & Connective Tissue Load Risk Index.** In: name, joint | Out: versioned formula sheet + overall_stress_index | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for name.** In: name:string [1..100]; joint:enum enum(shoulder|elbow|wrist|hip|knee|ankle|spine); sets:number [?..20] int >0; reps:number [?..50] int >0; +3 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Joint Stress & Connective Tissue Load Risk Index.** In: overall_stress_index, joint_breakdown | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sets.** In: changed sets with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from overall_stress_index.** In: overall_stress_index + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weight_kg.** In: global metric/imperial preference + sets | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Joint Stress & Connective Tissue Load Risk Index.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Joint Stress & Connective Tissue Load Risk Index.** In: overall_stress_index, joint_breakdown | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of overall_stress_index.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to RPE / RIR to 1RM Dynamic Velocity Modeler (tool-122-rpe-rir-1rm-velocity-modeler).** In: approved subset of overall_stress_index | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const volumeLoad = ex.sets * ex.reps * ex.weight_kg;` `const intensityFactor = 1 + Math.max(0, (ex.rpe ?? 7) - 7) * 0.15;` `const stressScore = Math.min(100, volumeLoad * bioFactor * intensityFactor * romFactor * 0.001);` `jointBreakdown[joint].stress_score = Math.max(jointBreakdown[joint].stress_score, stressScore);`

---

### 124 — Deload Frequency & Fatigue Accumulation Modeler

- **Stable ID:** `mrx.tool.124-deload-frequency-fatigue-modeler`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-124-deload-frequency-fatigue-modeler` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Deload timing from fatigue accrual
- **Inputs:** training_age_years:number [0..30]; weekly_volume_sets:number [0..300] int; avg_weekly_rpe:number [1..10]; frequency_per_week:number [?..7] int >0; age:number [13..100]; sleep_hours:number [4..12]; stress_level:other unbounded; hrv_trend:enum enum(improving\|stable\|declining); rhr_trend:enum enum(improving\|stable\|declining); +7 more
- **Outputs:** recommended_deload_interval_weeks, current_fatigue_index, weeks_until_deload, deload_type, deload_duration_days, risk_of_overreaching, marker_analysis, flags, education_flags, +1 more
- **Evidence:** component `components/tools/tool-124-deload-frequency-fatigue-modeler.tsx`; engine `lib/tools/engines/tool-124-deload-frequency-fatigue-modeler.ts`; schema `lib/tools/schemas/tool-124-deload-frequency-fatigue-modeler.ts`; tests 0; i18n `i18n/tool-124-deload-frequency-fatigue-modeler.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Joint Stress & Connective Tissue Load Risk Index (tool-123-joint-stress-connective-tissue-index); Fiber Type Adaptation & Mechanical Tension Score (tool-125-fiber-type-mechanical-tension-score); RPE / RIR to 1RM Dynamic Velocity Modeler (tool-122-rpe-rir-1rm-velocity-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-124-deload-frequency-fatigue-modeler with stable ID mrx.tool.124-deload-frequency-fatigue-modeler.
2. Typed DeloadInputSchema exposes 16 field(s); 8 carry explicit bounds.
3. Tool-specific i18n file i18n/tool-124-deload-frequency-fatigue-modeler.json exists (64 AR / 64 EN keys).
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. No test file covers this tool.
4. No what-if or scenario surface.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Deload Frequency & Fatigue Accumulation Modeler.** In: training_age_years, weekly_volume_sets | Out: versioned formula sheet + recommended_deload_interval_weeks | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for training_age_years.** In: training_age_years:number [0..30]; weekly_volume_sets:number [0..300] int; avg_weekly_rpe:number [1..10]; frequency_per_week:number [?..7] int >0; +12 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Deload Frequency & Fatigue Accumulation Modeler.** In: recommended_deload_interval_weeks, current_fatigue_index | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for training_age_years.** In: changed training_age_years with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from recommended_deload_interval_weeks.** In: recommended_deload_interval_weeks + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weekly_volume_sets, joint_pain.** In: global metric/imperial preference + training_age_years | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Deload Frequency & Fatigue Accumulation Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Deload Frequency & Fatigue Accumulation Modeler.** In: recommended_deload_interval_weeks, current_fatigue_index | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of recommended_deload_interval_weeks.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Joint Stress & Connective Tissue Load Risk Index (tool-123-joint-stress-connective-tissue-index).** In: approved subset of recommended_deload_interval_weeks | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const recommendedInterval = Math.max(3, Math.min(12, Math.round(baseInterval * individualFactor * stressFactor)));` `fatigueIndex += Math.max(0, weekly_volume_sets - 80) * 0.2;` `fatigueIndex += Math.max(0, frequency_per_week - 4) * 3;` `fatigueIndex += Math.max(0, age - 30) * 0.5;`

---

### 125 — Fiber Type Adaptation & Mechanical Tension Score

- **Stable ID:** `mrx.tool.125-fiber-type-mechanical-tension-score`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-125-fiber-type-mechanical-tension-score` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Fiber-type targeting score
- **Inputs:** age:number [13..100]; sex:enum enum(male\|female); height_cm:number [100..250]; body_weight_kg:number [30..300]; max_reps_225_bench:number [0..100] int optional; max_reps_135_squat:number [0..100] int optional; vertical_jump_cm:number [?..100] >0 optional; broad_jump_cm:number [?..400] >0 optional; sprint_30m_time:number [?..10] >0 optional; +10 more
- **Outputs:** estimated_fiber_distribution, fiber_type_dominance, mechanical_tension_score, fiber_type_shift_potential, recommended_rep_range, recommended_tempo, training_recommendations, flags, education_flags, +1 more
- **Evidence:** component `components/tools/tool-125-fiber-type-mechanical-tension-score.tsx`; engine `lib/tools/engines/tool-125-fiber-type-mechanical-tension-score.ts`; schema `lib/tools/schemas/tool-125-fiber-type-mechanical-tension-score.ts`; tests 0; i18n `i18n/tool-125-fiber-type-mechanical-tension-score.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Deload Frequency & Fatigue Accumulation Modeler (tool-124-deload-frequency-fatigue-modeler); Neuromuscular Performance & Explosiveness Modeler (tool-126-neuromuscular-explosiveness-modeler); Joint Stress & Connective Tissue Load Risk Index (tool-123-joint-stress-connective-tissue-index).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-125-fiber-type-mechanical-tension-score with stable ID mrx.tool.125-fiber-type-mechanical-tension-score.
2. Typed FiberInputSchema exposes 19 field(s); 11 carry explicit bounds.
3. Tool-specific i18n file i18n/tool-125-fiber-type-mechanical-tension-score.json exists (76 AR / 76 EN keys).
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. No test file covers this tool.
4. No what-if or scenario surface.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Fiber Type Adaptation & Mechanical Tension Score.** In: age, sex | Out: versioned formula sheet + estimated_fiber_distribution | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [13..100]; sex:enum enum(male|female); height_cm:number [100..250]; body_weight_kg:number [30..300]; +15 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Fiber Type Adaptation & Mechanical Tension Score.** In: estimated_fiber_distribution, fiber_type_dominance | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from estimated_fiber_distribution.** In: estimated_fiber_distribution + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for height_cm, body_weight_kg, vertical_jump_cm, broad_jump_cm, avg_weekly_volume_sets, current_tempo.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Fiber Type Adaptation & Mechanical Tension Score.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Fiber Type Adaptation & Mechanical Tension Score.** In: estimated_fiber_distribution, fiber_type_dominance | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of estimated_fiber_distribution.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Deload Frequency & Fatigue Accumulation Modeler (tool-124-deload-frequency-fatigue-modeler).** In: approved subset of estimated_fiber_distribution | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `typeI = Math.max(0, Math.round(typeI / total * 100));` `typeIIa = Math.max(0, Math.round(typeIIa / total * 100));` `typeIIx = Math.max(0, Math.round(typeIIx / total * 100));` `tensionScore += Math.min(30, (input.current_intent === 'tension' ? 20 : input.current_intent === 'speed' ? 10 : 5));`

---

### 126 — Neuromuscular Performance & Explosiveness Modeler

- **Stable ID:** `mrx.tool.126-neuromuscular-explosiveness-modeler`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-126-neuromuscular-explosiveness-modeler` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Explosive-power output modeler
- **Inputs:** vertical_jump_cm:number [0..?] optional; broad_jump_cm:number [0..?] optional; sprint_10m_s:number >0 optional; sprint_20m_s:number >0 optional; one_rm_kg:number >0 optional; body_weight_kg:number >0
- **Outputs:** explosivenessScore, testsReported, strengths, weaknesses, disclaimer
- **Evidence:** component `components/tools/tool-126-neuromuscular-explosiveness-modeler.tsx`; engine `lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6.ts`; schema `lib/tools/schemas/tool-126-neuromuscular-explosiveness-modeler.ts`; tests 4; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Fiber Type Adaptation & Mechanical Tension Score (tool-125-fiber-type-mechanical-tension-score); AI Daily Readiness & Cause Explainer Engine (tool-127-ai-daily-readiness-explainer); Deload Frequency & Fatigue Accumulation Modeler (tool-124-deload-frequency-fatigue-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-126-neuromuscular-explosiveness-modeler with stable ID mrx.tool.126-neuromuscular-explosiveness-modeler.
2. Typed NeuromuscularInputSchema exposes 6 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateNeuromuscularV6; no model-generated number overrides the engine.
4. 4 test file(s) matched; 3 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. No explicit assumptions array/contract.
5. No chart/visual summary of the result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Neuromuscular Performance & Explosiveness Modeler.** In: vertical_jump_cm, broad_jump_cm | Out: versioned formula sheet + explosivenessScore | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for vertical_jump_cm.** In: vertical_jump_cm:number [0..?] optional; broad_jump_cm:number [0..?] optional; sprint_10m_s:number >0 optional; sprint_20m_s:number >0 optional; +2 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Neuromuscular Performance & Explosiveness Modeler.** In: explosivenessScore, testsReported | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for vertical_jump_cm.** In: changed vertical_jump_cm with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from explosivenessScore.** In: explosivenessScore + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for vertical_jump_cm, broad_jump_cm, one_rm_kg, body_weight_kg.** In: global metric/imperial preference + vertical_jump_cm | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Neuromuscular Performance & Explosiveness Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Neuromuscular Performance & Explosiveness Modeler.** In: explosivenessScore, testsReported | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of explosivenessScore.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Fiber Type Adaptation & Mechanical Tension Score (tool-125-fiber-type-mechanical-tension-score).** In: approved subset of explosivenessScore | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const s = Math.max(0, Math.min(100, (vertical_jump_cm / 70) * 100));` `const s = Math.max(0, Math.min(100, (broad_jump_cm / 250) * 100));` `const s = Math.max(0, Math.min(100, ((2.0 - sprint_10m_s) / 0.8) * 100));` `const s = Math.max(0, Math.min(100, ((3.5 - sprint_20m_s) / 1.2) * 100));`

---

### 127 — AI Daily Readiness & Cause Explainer Engine

- **Stable ID:** `mrx.tool.127-ai-daily-readiness-explainer`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-127-ai-daily-readiness-explainer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Readiness scoring with cause attribution
- **Inputs:** sleep_hours:number [0..24]; stress_level:number [1..10]; soreness_level:number [1..10]; previous_load:number [0..?] optional; hydration:number [0..100] optional
- **Outputs:** readinessScore, band, factors, dataCoveragePct, assumptions, disclaimer
- **Evidence:** component `components/tools/tool-127-ai-daily-readiness-explainer.tsx`; engine `lib/tools/engines/tool-127-ai-daily-readiness-explainer.v6.ts`; schema `lib/tools/schemas/tool-127-ai-daily-readiness-explainer.ts`; tests 1; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Neuromuscular Performance & Explosiveness Modeler (tool-126-neuromuscular-explosiveness-modeler); Training Load Balance & Acute-to-Chronic Ratio (tool-128-training-load-acute-chronic-ratio); Fiber Type Adaptation & Mechanical Tension Score (tool-125-fiber-type-mechanical-tension-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-127-ai-daily-readiness-explainer with stable ID mrx.tool.127-ai-daily-readiness-explainer.
2. Typed DailyReadinessInputSchema exposes 5 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateDailyReadinessV6; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Daily Readiness & Cause Explainer Engine.** In: sleep_hours, stress_level | Out: versioned formula sheet + readinessScore | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sleep_hours.** In: sleep_hours:number [0..24]; stress_level:number [1..10]; soreness_level:number [1..10]; previous_load:number [0..?] optional; +1 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Daily Readiness & Cause Explainer Engine.** In: readinessScore, band | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sleep_hours.** In: changed sleep_hours with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from readinessScore.** In: readinessScore + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sleep_hours.** In: global metric/imperial preference + sleep_hours | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Daily Readiness & Cause Explainer Engine.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Daily Readiness & Cause Explainer Engine.** In: readinessScore, band | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of readinessScore.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Neuromuscular Performance & Explosiveness Modeler (tool-126-neuromuscular-explosiveness-modeler).** In: approved subset of readinessScore | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const sleepScore = Math.min(30, (sleep_hours / 8) * 30);` `const stressPenalty = stress_level * 2;` `const sorenessPenalty = soreness_level * 2;` `const loadPenalty = Math.min(10, (previous_load / 100) * 10);`

---

### 128 — Training Load Balance & Acute-to-Chronic Ratio

- **Stable ID:** `mrx.tool.128-training-load-acute-chronic-ratio`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-128-training-load-acute-chronic-ratio` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** ACWR training-load balance
- **Inputs:** sessions:array [?..500]
- **Outputs:** acuteLoad, chronicLoad, acwr, band, sufficientData, recordedDays, disclaimer
- **Evidence:** component `components/tools/tool-128-training-load-acute-chronic-ratio.tsx`; engine `lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6.ts`; schema `lib/tools/schemas/tool-128-training-load-acute-chronic-ratio.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** AI Daily Readiness & Cause Explainer Engine (tool-127-ai-daily-readiness-explainer); AI Adaptive Training Program Planner (tool-129-ai-adaptive-training-planner); Neuromuscular Performance & Explosiveness Modeler (tool-126-neuromuscular-explosiveness-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-128-training-load-acute-chronic-ratio with stable ID mrx.tool.128-training-load-acute-chronic-ratio.
2. Typed AcwrInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateTrainingLoadAcwrV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 1 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Training Load Balance & Acute-to-Chronic Ratio.** In: sessions, sessions | Out: versioned formula sheet + acuteLoad | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sessions.** In: sessions:array [?..500] | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Training Load Balance & Acute-to-Chronic Ratio.** In: acuteLoad, chronicLoad | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sessions.** In: changed sessions with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from acuteLoad.** In: acuteLoad + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sessions.** In: global metric/imperial preference + sessions | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Training Load Balance & Acute-to-Chronic Ratio.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Training Load Balance & Acute-to-Chronic Ratio.** In: acuteLoad, chronicLoad | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of acuteLoad.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Daily Readiness & Cause Explainer Engine (tool-127-ai-daily-readiness-explainer).** In: approved subset of acuteLoad | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const DAY_MS = 24 * 60 * 60 * 1000;` `const maxDay = Math.max(...dayStamps);` `const minDay = Math.min(...dayStamps);` `const sevenDayStart = maxDay - 6 * DAY_MS;`

---

### 129 — AI Adaptive Training Program Planner

- **Stable ID:** `mrx.tool.129-ai-adaptive-training-planner`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-129-ai-adaptive-training-planner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Adaptive program generator
- **Inputs:** goal:enum enum(strength\|hypertrophy\|endurance\|general); experience_level:enum enum(beginner\|intermediate\|advanced); sessions_per_week:number [1..7] int; session_duration:number [15..180]; available_equipment:array [1..?]; readiness:enum optional enum(low\|moderate\|high); limitations:array optional
- **Outputs:** weeklyPlan, disclaimer
- **Evidence:** component `components/tools/tool-129-ai-adaptive-training-planner.tsx`; engine `lib/tools/engines/tool-129-ai-adaptive-training-planner.v6.ts`; schema `lib/tools/schemas/tool-129-ai-adaptive-training-planner.ts`; tests 1; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Training Load Balance & Acute-to-Chronic Ratio (tool-128-training-load-acute-chronic-ratio); AI Plateau Detective & Stagnation Analyzer (tool-130-ai-plateau-detective); AI Daily Readiness & Cause Explainer Engine (tool-127-ai-daily-readiness-explainer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-129-ai-adaptive-training-planner with stable ID mrx.tool.129-ai-adaptive-training-planner.
2. Typed AdaptivePlannerInputSchema exposes 7 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateAdaptivePlannerV6; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Adaptive Training Program Planner.** In: goal, experience_level | Out: versioned formula sheet + weeklyPlan | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for goal.** In: goal:enum enum(strength|hypertrophy|endurance|general); experience_level:enum enum(beginner|intermediate|advanced); sessions_per_week:number [1..7] int; session_duration:number [15..180]; +3 more | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Adaptive Training Program Planner.** In: weeklyPlan, disclaimer | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sessions_per_week.** In: changed sessions_per_week with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from weeklyPlan.** In: weeklyPlan + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for goal.** In: global metric/imperial preference + sessions_per_week | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Adaptive Training Program Planner.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Adaptive Training Program Planner.** In: weeklyPlan, disclaimer | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of weeklyPlan.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Training Load Balance & Acute-to-Chronic Ratio (tool-128-training-load-acute-chronic-ratio).** In: approved subset of weeklyPlan | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `volume: Math.round(session_duration * volumeFactor),`

---

### 130 — AI Plateau Detective & Stagnation Analyzer

- **Stable ID:** `mrx.tool.130-ai-plateau-detective`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-130-ai-plateau-detective` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Plateau cause detection
- **Inputs:** points:array [1..200]
- **Outputs:** isPlateau, ruleSignalStrength, affectedMetrics, possibleCauses, recommendations, disclaimer
- **Evidence:** component `components/tools/tool-130-ai-plateau-detective.tsx`; engine `lib/tools/engines/tool-130-ai-plateau-detective.v6.ts`; schema `lib/tools/schemas/tool-130-ai-plateau-detective.ts`; tests 1; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** AI Adaptive Training Program Planner (tool-129-ai-adaptive-training-planner); Training Load Balance & Acute-to-Chronic Ratio (tool-128-training-load-acute-chronic-ratio); AI Daily Readiness & Cause Explainer Engine (tool-127-ai-daily-readiness-explainer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-130-ai-plateau-detective with stable ID mrx.tool.130-ai-plateau-detective.
2. Typed PlateauInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculatePlateauDetectiveV6; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No what-if or scenario surface.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Plateau Detective & Stagnation Analyzer.** In: points, points | Out: versioned formula sheet + isPlateau | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for points.** In: points:array [1..200] | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Plateau Detective & Stagnation Analyzer.** In: isPlateau, ruleSignalStrength | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for points.** In: changed points with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from isPlateau.** In: isPlateau + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for points.** In: global metric/imperial preference + points | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Plateau Detective & Stagnation Analyzer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Plateau Detective & Stagnation Analyzer.** In: isPlateau, ruleSignalStrength | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of isPlateau.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Adaptive Training Program Planner (tool-129-ai-adaptive-training-planner).** In: approved subset of isPlateau | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return num/den;` `const spanWeeks = (Math.max(...xsByMetric[m]) - Math.min(...xsByMetric[m])) / (7*86400000);` `if (Math.abs(sl) < threshold) { affected.push(m); plateauCount++; }`

---

### 132 — AI Pose & Exercise Form Coach

- **Stable ID:** `mrx.tool.132-ai-pose-form-coach`
- **Category / route / status:** Training & Recovery · `/smarttools/tool-132-ai-pose-form-coach` · **BLOCKED** (planned catalog entry; no component, engine or schema)
- **Publication / depth:** planned / planned
- **Purpose (catalog):** Vision-based exercise form feedback
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `—`; engine `—`; schema `—`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **BLOCKED** — no implementation exists; no formula can be audited.
- **Language / measurement:** not applicable — no implementation exists, so there is no i18n, measurement, ARIA or landmark surface to audit.
- **Related:** Rep Tempo & Velocity Loss Analyzer (tool-133-rep-tempo-velocity-loss-analyzer); AI Plateau Detective & Stagnation Analyzer (tool-130-ai-plateau-detective); Side-to-side Movement Screening Comparison (tool-134-mobility-movement-symmetry-screen).

**Five evidence-backed strengths**
1. Catalog marks this entry as **planned**, so it is not counted as a launched tool (264 implemented + 4 planned).
2. Stable ID mrx.tool.132-ai-pose-form-coach and slug tool-132-ai-pose-form-coach are reserved in the catalog, so implementation can start without renaming or renumbering.
3. An Arabic title and English title are recorded, so the bilingual label exists before implementation.
4. No other catalog entry shares this slug or toolId (the analyzer reports 0 duplicate catalog keys), so the planned capability is not a silent duplicate.
5. The blocker is recorded explicitly (no component, engine or schema; href lacks the category segment), which is more honest than a placeholder implementation.

**Five evidence-backed gaps**
1. Formula status BLOCKED: no implementation exists, so no formula can be audited or verified.
2. No component, engine or schema exists; the catalog href also lacks the required category segment, so the route is not routable.
3. No input/output contract, validation boundary or golden case is defined for the training estimate.
4. No tool-specific i18n, measurement metadata, accessibility or narrative design exists yet.
5. No owner build authorization and no approved domain source exist; building it without them would create an unsupported medical/capability claim.

**Ten customized AI development proposals**
**P1. Build authorization and scope contract for AI Pose & Exercise Form Coach.** In: none today | Out: approved scope + non-goals | Source: owner directive | State: BLOCKED (planned catalog entry) | Cost: S | Consent: none | Risk: building an unapproved medical capability | Fallback: keep route unpublished | Test: scope review checklist | Accept: owner signs scope and route is generated only after implementation.
**P2. Typed input schema for AI Pose & Exercise Form Coach.** In: proposed fields | Out: strict schema + bounds | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary bounds | Fallback: reject invalid input | Test: boundary unit tests | Accept: every numeric field is finite, bounded and reject-tested.
**P3. Deterministic core for AI Pose & Exercise Form Coach.** In: schema-validated input | Out: versioned result contract | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: unsourced formula | Fallback: no result | Test: 3 golden cases + boundaries | Accept: engine output matches an approved reference.
**P4. Result narrative for AI Pose & Exercise Form Coach.** In: engine result | Out: primary result, why, limitation | Source: engine values only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: invented interpretation | Fallback: numeric-only result | Test: snapshot + value traceability | Accept: every sentence maps to a result field.
**P5. Bilingual UI contract for AI Pose & Exercise Form Coach.** In: locale | Out: AR/EN labels, RTL, errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English leakage | Fallback: show explicit unsupported notice | Test: locale matrix | Accept: no English fragment in AR mode and no reload.
**P6. Accessibility gate for AI Pose & Exercise Form Coach.** In: keyboard/screen-reader use | Out: landmarks, labels, focus | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unusable control | Fallback: native input | Test: axe + keyboard | Accept: zero critical axe findings.
**P7. Visual summary for AI Pose & Exercise Form Coach.** In: result fields | Out: one labelled chart/table | Source: engine output | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: chart implies prediction | Fallback: table | Test: rendering + alt text | Accept: chart values equal engine values.
**P8. Exportable record for AI Pose & Exercise Form Coach.** In: result + provenance | Out: JSON/PDF with version | Source: result contract | State: NOT IMPLEMENTED | Cost: S | Consent: user-initiated | Risk: leaking sensitive data | Fallback: no export | Test: schema snapshot | Accept: export round-trips and contains no hidden fields.
**P9. Consent-gated AI explanation for AI Pose & Exercise Form Coach.** In: result findings + locale | Out: grounded explanation | Source: engine result only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit per-call | Risk: model invents advice | Fallback: deterministic template | Test: fallback + prompt injection | Accept: no number differs from the engine.
**P10. Post-build cross-tool handoff for AI Pose & Exercise Form Coach.** In: approved result subset | Out: deep link with context | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking context | Fallback: plain route link | Test: route contract | Accept: only approved fields cross the boundary.

**Static formula signals (evidence, not validation):** none extracted.

---

### 133 — Rep Tempo & Velocity Loss Analyzer

- **Stable ID:** `mrx.tool.133-rep-tempo-velocity-loss-analyzer`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-133-rep-tempo-velocity-loss-analyzer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Tempo and velocity-loss analysis
- **Inputs:** sets:array [0..1000] int >0 optional
- **Outputs:** velocityLossPercent, tempoConsistency, fatigueIndicator, velocityReadings, tempoReadings, dataCoveragePct, recommendations, disclaimer
- **Evidence:** component `components/tools/tool-133-rep-tempo-velocity-loss-analyzer.tsx`; engine `lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6.ts`; schema `lib/tools/schemas/tool-133-rep-tempo-velocity-loss-analyzer.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Side-to-side Movement Screening Comparison (tool-134-mobility-movement-symmetry-screen); Rule-based Exercise Substitution Options (tool-135-exercise-substitution-ai); AI Plateau Detective & Stagnation Analyzer (tool-130-ai-plateau-detective).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-133-rep-tempo-velocity-loss-analyzer with stable ID mrx.tool.133-rep-tempo-velocity-loss-analyzer.
2. Typed VelocityInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateVelocityV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 1 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. No source/provenance text is encoded in the engine.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Rep Tempo & Velocity Loss Analyzer.** In: sets, sets | Out: versioned formula sheet + velocityLossPercent | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sets.** In: sets:array [0..1000] int >0 optional | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Rep Tempo & Velocity Loss Analyzer.** In: velocityLossPercent, tempoConsistency | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sets.** In: changed sets with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from velocityLossPercent.** In: velocityLossPercent + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sets.** In: global metric/imperial preference + sets | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Rep Tempo & Velocity Loss Analyzer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Rep Tempo & Velocity Loss Analyzer.** In: velocityLossPercent, tempoConsistency | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of velocityLossPercent.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Side-to-side Movement Screening Comparison (tool-134-mobility-movement-symmetry-screen).** In: approved subset of velocityLossPercent | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `tempoStd = Math.sqrt(variance);` `dataCoveragePct: Math.round(((velocities.length + tempos.length) / (sets.length * 2)) * 100),`

---

### 134 — Side-to-side Movement Screening Comparison

- **Stable ID:** `mrx.tool.134-mobility-movement-symmetry-screen`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-134-mobility-movement-symmetry-screen` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** User-entered side-to-side movement values with simple thresholds
- **Inputs:** movement:enum enum(ankle_dorsiflexion\|shoulder_flexion\|hip_rotation\|single_leg_balance); left_value:number [0..200]; right_value:number [0..200]; unit:enum enum(degrees\|seconds)
- **Outputs:** absolute_difference, side_with_higher_value, rule_flag, threshold, disclaimer
- **Evidence:** component `components/tools/tool-134-mobility-movement-symmetry-screen.tsx`; engine `lib/tools/engines/tool-134-mobility-movement-symmetry-screen.v6.ts`; schema `lib/tools/schemas/tool-134-mobility-movement-symmetry-screen.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Rep Tempo & Velocity Loss Analyzer (tool-133-rep-tempo-velocity-loss-analyzer); Rule-based Exercise Substitution Options (tool-135-exercise-substitution-ai); AI Plateau Detective & Stagnation Analyzer (tool-130-ai-plateau-detective).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-134-mobility-movement-symmetry-screen with stable ID mrx.tool.134-mobility-movement-symmetry-screen.
2. Typed MobilityScreenSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateMobilityScreen; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Side-to-side Movement Screening Comparison.** In: movement, left_value | Out: versioned formula sheet + absolute_difference | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for movement.** In: movement:enum enum(ankle_dorsiflexion|shoulder_flexion|hip_rotation|single_leg_balance); left_value:number [0..200]; right_value:number [0..200]; unit:enum enum(degrees|seconds) | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Side-to-side Movement Screening Comparison.** In: absolute_difference, side_with_higher_value | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for left_value.** In: changed left_value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from absolute_difference.** In: absolute_difference + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for movement.** In: global metric/imperial preference + left_value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Side-to-side Movement Screening Comparison.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Side-to-side Movement Screening Comparison.** In: absolute_difference, side_with_higher_value | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of absolute_difference.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Rep Tempo & Velocity Loss Analyzer (tool-133-rep-tempo-velocity-loss-analyzer).** In: approved subset of absolute_difference | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const difference = Math.abs(left_value - right_value);`

---

### 135 — Rule-based Exercise Substitution Options

- **Stable ID:** `mrx.tool.135-exercise-substitution-ai`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/tool-135-exercise-substitution-ai` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Static movement and equipment matching; no injury assessment
- **Inputs:** movement_pattern:enum enum(squat\|hinge\|push\|pull\|carry); available_equipment:array [1..?] enum(bodyweight\|dumbbell\|cable\|machine\|band); avoid_movements:array enum(squat\|hinge\|push\|pull\|carry\|overhead\|impact); pain_reported:other unbounded
- **Outputs:** alternatives, status, message, disclaimer
- **Evidence:** component `components/tools/tool-135-exercise-substitution-ai.tsx`; engine `lib/tools/engines/tool-135-exercise-substitution-ai.v6.ts`; schema `lib/tools/schemas/tool-135-exercise-substitution-ai.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Side-to-side Movement Screening Comparison (tool-134-mobility-movement-symmetry-screen); Rep Tempo & Velocity Loss Analyzer (tool-133-rep-tempo-velocity-loss-analyzer); AI Plateau Detective & Stagnation Analyzer (tool-130-ai-plateau-detective).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/tool-135-exercise-substitution-ai with stable ID mrx.tool.135-exercise-substitution-ai.
2. Typed ExerciseSubstitutionSchema exposes 4 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateExerciseSubstitutions; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Rule-based Exercise Substitution Options.** In: movement_pattern, available_equipment | Out: versioned formula sheet + alternatives | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for movement_pattern.** In: movement_pattern:enum enum(squat|hinge|push|pull|carry); available_equipment:array [1..?] enum(bodyweight|dumbbell|cable|machine|band); avoid_movements:array enum(squat|hinge|push|pull|carry|overhead|impact); pain_reported:other unbounded | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Rule-based Exercise Substitution Options.** In: alternatives, status | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for movement_pattern.** In: changed movement_pattern with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from alternatives.** In: alternatives + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for movement_pattern.** In: global metric/imperial preference + movement_pattern | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Rule-based Exercise Substitution Options.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Rule-based Exercise Substitution Options.** In: alternatives, status | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of alternatives.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Side-to-side Movement Screening Comparison (tool-134-mobility-movement-symmetry-screen).** In: approved subset of alternatives | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### NAMED — One-Rep Max Estimator

- **Stable ID:** `mrx.tool.one-rep-max`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/one-rep-max` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Estimate one-repetition maximum using the Epley equation
- **Inputs:** weightKg:number >0; reps:number int >0
- **Outputs:** oneRepMaxKg
- **Evidence:** component `components/tools/one-rep-max-pilot.tsx`; engine `lib/tools/engines/one-rep-max.v6.ts`; schema `lib/tools/schemas/one-rep-max.ts`; tests 3; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; no ARIA; no <main>.
- **Related:** Strength Standards (strength-standards); Training Rest Timer (rest-timer); Rule-based Exercise Substitution Options (tool-135-exercise-substitution-ai).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/one-rep-max with stable ID mrx.tool.one-rep-max.
2. Typed oneRepMaxInputSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateOneRepMax; no model-generated number overrides the engine.
4. 3 test file(s) matched; 1 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for One-Rep Max Estimator.** In: weightKg, reps | Out: versioned formula sheet + oneRepMaxKg | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weightKg.** In: weightKg:number >0; reps:number int >0 | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for One-Rep Max Estimator.** In: oneRepMaxKg, the full result contract | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weightKg.** In: changed weightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from oneRepMaxKg.** In: oneRepMaxKg + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weightKg.** In: global metric/imperial preference + weightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for One-Rep Max Estimator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for One-Rep Max Estimator.** In: oneRepMaxKg, the full result contract | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of oneRepMaxKg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Strength Standards (strength-standards).** In: approved subset of oneRepMaxKg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `if (reps === 1) return { oneRepMaxKg: Math.round(weightKg) };` `const orm = weightKg * (1 + reps / 30);` `return { oneRepMaxKg: Math.round(orm * 10) / 10 };`

---

### NAMED — Strength Standards

- **Stable ID:** `mrx.tool.strength-standards`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/strength-standards` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Compare a lift with general bodyweight ratios
- **Inputs:** liftKg:number >0; bodyWeightKg:number >0; sex:enum enum(male\|female)
- **Outputs:** ratio, level
- **Evidence:** component `components/tools/strength-standards-pilot.tsx`; engine `lib/tools/engines/strength-standards.v6.ts`; schema `lib/tools/schemas/strength-standards.ts`; tests 3; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; no ARIA; no <main>.
- **Related:** One-Rep Max Estimator (one-rep-max); Training Rest Timer (rest-timer); Rule-based Exercise Substitution Options (tool-135-exercise-substitution-ai).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/strength-standards with stable ID mrx.tool.strength-standards.
2. Typed strengthStandardsInputSchema exposes 3 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateStrengthStandards; no model-generated number overrides the engine.
4. 3 test file(s) matched; 1 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Strength Standards.** In: liftKg, bodyWeightKg | Out: versioned formula sheet + ratio | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for liftKg.** In: liftKg:number >0; bodyWeightKg:number >0; sex:enum enum(male|female) | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Strength Standards.** In: ratio, level | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for liftKg.** In: changed liftKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from ratio.** In: ratio + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for liftKg, bodyWeightKg.** In: global metric/imperial preference + liftKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Strength Standards.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Strength Standards.** In: ratio, level | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of ratio.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to One-Rep Max Estimator (one-rep-max).** In: approved subset of ratio | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const ratio = liftKg / bodyWeightKg;` `return { ratio: Math.round(ratio * 100) / 100, level };`

---

### NAMED — Training Rest Timer

- **Stable ID:** `mrx.tool.rest-timer`
- **Category / route / status:** Training & Recovery · `/smarttools/training-recovery/rest-timer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Set a simple rest interval from training intensity
- **Inputs:** sets:number int >0; intensity:enum enum(low\|moderate\|high)
- **Outputs:** restSeconds
- **Evidence:** component `components/tools/rest-timer-pilot.tsx`; engine `lib/tools/engines/rest-timer.v6.ts`; schema `lib/tools/schemas/rest-timer.ts`; tests 3; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; no ARIA; no <main>.
- **Related:** Strength Standards (strength-standards); One-Rep Max Estimator (one-rep-max); Rule-based Exercise Substitution Options (tool-135-exercise-substitution-ai).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/training-recovery/rest-timer with stable ID mrx.tool.rest-timer.
2. Typed restTimerInputSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateRestTimer; no model-generated number overrides the engine.
4. 3 test file(s) matched; 1 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Training Rest Timer.** In: sets, intensity | Out: versioned formula sheet + restSeconds | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sets.** In: sets:number int >0; intensity:enum enum(low|moderate|high) | Out: field-level validation messages + canonical value | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Training Rest Timer.** In: restSeconds, the full result contract | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sets.** In: changed sets with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from restSeconds.** In: restSeconds + declared goal if present | Out: status vs validated range/goal | Source: ACSM/NSCA or peer-reviewed training reference with population and method | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sets.** In: global metric/imperial preference + sets | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Training Rest Timer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Training Rest Timer.** In: restSeconds, the full result contract | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of restSeconds.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Strength Standards (strength-standards).** In: approved subset of restSeconds | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return prev - 1;`

---
