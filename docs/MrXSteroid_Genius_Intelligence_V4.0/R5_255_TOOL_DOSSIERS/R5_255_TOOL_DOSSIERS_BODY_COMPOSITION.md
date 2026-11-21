# R5 255-TOOL PER-TOOL DOSSIERS — BODY COMPOSITION

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 10 catalog entries in this category (10 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — FFMI & Body Fat Analyzer

- **Stable ID:** `mrx.tool.bodyfat`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/bodyfat` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** FFMI and body fat percentage calculator
- **Inputs:** sex:enum enum(male\|female); heightCm:number [100..250]; weightKg:number [30..300]; neckCm:number [20..60]; waistCm:number [40..200]; hipCm:number [50..200] optional; unitSystem:enum optional enum(metric\|imperial)
- **Outputs:** bodyFatPercentage, ffmi, normalizedFFMI, leanBodyMassKg, fatMassKg, category
- **Evidence:** component `components/tools/bodyfat.tsx`; engine `lib/tools/engines/bodyfat.ts`; schema `lib/tools/schemas/bodyfat.ts`; tests 3; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Progress Tracker (tool-011-progress-tracker); Water Retention Assessor (tool-014-water-retention); Fat Metabolism Calculator (tool-079-fat-metabolism-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/bodyfat with stable ID mrx.tool.bodyfat.
2. Typed BodyFatInputSchema exposes 7 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateBodyFat; no model-generated number overrides the engine.
4. 3 test file(s) matched; 18 numeric assertion(s) detected.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for FFMI & Body Fat Analyzer.** In: sex, heightCm | Out: versioned formula sheet + bodyFatPercentage | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sex.** In: sex:enum enum(male|female); heightCm:number [100..250]; weightKg:number [30..300]; neckCm:number [20..60]; +3 more | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for FFMI & Body Fat Analyzer.** In: bodyFatPercentage, ffmi | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for heightCm.** In: changed heightCm with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from bodyFatPercentage.** In: bodyFatPercentage + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for heightCm, weightKg, neckCm, waistCm, hipCm.** In: global metric/imperial preference + heightCm | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for FFMI & Body Fat Analyzer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for FFMI & Body Fat Analyzer.** In: bodyFatPercentage, ffmi | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of bodyFatPercentage.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Progress Tracker (tool-011-progress-tracker).** In: approved subset of bodyFatPercentage | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const logTerm = 1.0324 - 0.19077 * Math.log10(waistNeck) + 0.15456 * Math.log10(heightCm);` `return 495 / logTerm - 450;` `const logTerm = 1.29579 - 0.35004 * Math.log10(waistHipNeck) + 0.22100 * Math.log10(heightCm);` `const heightM = heightCm / 100;`

---

### 011 — Progress Tracker

- **Stable ID:** `mrx.tool.011-progress-tracker`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-011-progress-tracker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Track training and body progress
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-011-progress-tracker.tsx`; engine `lib/tools/engines/tool-011-progress-tracker.ts`; schema `lib/tools/schemas/tool-011-progress-tracker.ts`; tests 1; i18n `i18n/tool-011-progress-tracker.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Water Retention Assessor (tool-014-water-retention); FFMI & Body Fat Analyzer (bodyfat); Fat Metabolism Calculator (tool-079-fat-metabolism-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-011-progress-tracker with stable ID mrx.tool.011-progress-tracker.
2. Deterministic engine exports calculateProgress; no model-generated number overrides the engine.
3. 1 test file(s) matched; 1 numeric assertion(s) detected.
4. Tool-specific i18n file i18n/tool-011-progress-tracker.json exists (12 AR / 12 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Progress Tracker.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Progress Tracker.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Progress Tracker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Progress Tracker.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Water Retention Assessor (tool-014-water-retention).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);` `const weeks = Math.max(1, days / 7);` `const avgChangePerWeek = Math.round((delta / weeks) * 100) / 100;` `Math.abs(delta) < 0.5 ? 'stable' : delta > 0 ? 'up' : 'down';`

---

### 014 — Water Retention Assessor

- **Stable ID:** `mrx.tool.014-water-retention`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-014-water-retention` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Assess water retention drivers
- **Inputs:** status:other unbounded; reason:other unbounded
- **Outputs:** status, reason
- **Evidence:** component `components/tools/tool-014-water-retention.tsx`; engine `lib/tools/engines/tool-014-water-retention.ts`; schema `lib/tools/schemas/tool-014-water-retention.ts`; tests 1; i18n `i18n/tool-014-water-retention.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Progress Tracker (tool-011-progress-tracker); FFMI & Body Fat Analyzer (bodyfat); Fat Metabolism Calculator (tool-079-fat-metabolism-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-014-water-retention with stable ID mrx.tool.014-water-retention.
2. Typed WaterRetentionResultSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateWaterRetention; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-014-water-retention.json exists (3 AR / 3 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Water Retention Assessor.** In: status, reason | Out: versioned formula sheet + status | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for status.** In: status:other unbounded; reason:other unbounded | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Water Retention Assessor.** In: status, reason | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for status.** In: changed status with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for status.** In: global metric/imperial preference + status | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Water Retention Assessor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Water Retention Assessor.** In: status, reason | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Progress Tracker (tool-011-progress-tracker).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 079 — Fat Metabolism Calculator

- **Stable ID:** `mrx.tool.079-fat-metabolism-calculator`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-079-fat-metabolism-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Fat oxidation rate estimator
- **Inputs:** body_weight_kg:number [40..200]; body_fat_pct:number [5..50] optional; vo2max_ml_kg_min:number [20..85] optional; heart_rate_bpm:number [50..210]; resting_heart_rate_bpm:number [40..100]; fasted_state:other unbounded
- **Outputs:** estimated_fat_oxidation_g_hr, warnings
- **Evidence:** component `components/tools/tool-079-fat-metabolism-calculator.tsx`; engine `lib/tools/engines/tool-079-fat-metabolism-calculator.ts`; schema `lib/tools/schemas/tool-079-fat-metabolism-calculator.ts`; tests 1; i18n `i18n/tool-079-fat-metabolism-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** AI Body Composition Vision Engine (tool-108-ai-body-composition-vision-engine); Body Transformation Scenario Calculator (tool-131-transformation-forecast-trajectory-engine); Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-079-fat-metabolism-calculator with stable ID mrx.tool.079-fat-metabolism-calculator.
2. Typed FatMetabolismInputSchema exposes 6 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateFatMetabolism; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-079-fat-metabolism-calculator.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Fat Metabolism Calculator.** In: body_weight_kg, body_fat_pct | Out: versioned formula sheet + estimated_fat_oxidation_g_hr | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for body_weight_kg.** In: body_weight_kg:number [40..200]; body_fat_pct:number [5..50] optional; vo2max_ml_kg_min:number [20..85] optional; heart_rate_bpm:number [50..210]; +2 more | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Fat Metabolism Calculator.** In: estimated_fat_oxidation_g_hr, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for body_weight_kg.** In: changed body_weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from estimated_fat_oxidation_g_hr.** In: estimated_fat_oxidation_g_hr + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for body_weight_kg, vo2max_ml_kg_min.** In: global metric/imperial preference + body_weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Fat Metabolism Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Fat Metabolism Calculator.** In: estimated_fat_oxidation_g_hr, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of estimated_fat_oxidation_g_hr.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Body Composition Vision Engine (tool-108-ai-body-composition-vision-engine).** In: approved subset of estimated_fat_oxidation_g_hr | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const hrr = Math.max(0, Math.min(1, (heart_rate_bpm - resting_heart_rate_bpm) / (maxHr - resting_heart_rate_bpm)));` `rer = Math.min(1.0, 0.92 + (hrr - 0.6) * 0.2);` `baseFatRateGhr = Math.max(5, 30 - (hrr - 0.6) * 60);` `rer = Math.max(0.72, rer - 0.04);`

---

### 108 — AI Body Composition Vision Engine

- **Stable ID:** `mrx.tool.108-ai-body-composition-vision-engine`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-108-ai-body-composition-vision-engine` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Vision-based body composition analysis
- **Inputs:** weight_kg:number [30..250]; height_cm:number [120..230]; age_years:number [16..85] int; sex:enum enum(male\|female); neck_cm:number [20..60]; waist_cm:number [40..200]; hips_cm:number [50..250]; chest_cm:number [50..350]; photo_count:number [0..12] int; +1 more
- **Outputs:** bmi, body_fat_percent, ffmi, visual_confidence, visual_notes, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-108-ai-body-composition-vision-engine.tsx`; engine `lib/tools/engines/tool-108-ai-body-composition-vision-engine.ts`; schema `lib/tools/schemas/tool-108-ai-body-composition-vision-engine.ts`; tests 1; i18n `i18n/tool-108-ai-body-composition-vision-engine.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Body Transformation Scenario Calculator (tool-131-transformation-forecast-trajectory-engine); Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score); Fat Metabolism Calculator (tool-079-fat-metabolism-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-108-ai-body-composition-vision-engine with stable ID mrx.tool.108-ai-body-composition-vision-engine.
2. Typed VisionInputSchema exposes 10 field(s); 8 carry explicit bounds.
3. Deterministic engine exports calcDeurenbergBf, calcVision; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-108-ai-body-composition-vision-engine.json exists (30 AR / 30 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Body Composition Vision Engine.** In: weight_kg, height_cm | Out: versioned formula sheet + bmi | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weight_kg.** In: weight_kg:number [30..250]; height_cm:number [120..230]; age_years:number [16..85] int; sex:enum enum(male|female); +6 more | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Body Composition Vision Engine.** In: bmi, body_fat_percent | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weight_kg.** In: changed weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from bmi.** In: bmi + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weight_kg, height_cm, neck_cm, waist_cm, hips_cm, chest_cm.** In: global metric/imperial preference + weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Body Composition Vision Engine.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Body Composition Vision Engine.** In: bmi, body_fat_percent | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of bmi.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Body Transformation Scenario Calculator (tool-131-transformation-forecast-trajectory-engine).** In: approved subset of bmi | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.round((factor * bmi + AGE_COEFF * age - sexCoeff - BMI_INTERCEPT) * 100) / 100;` `const bmi = weight_kg / ((height_cm / 100) * (height_cm / 100));` `const leanMassKg = weight_kg * (1 - bodyFat / 100);` `const ffmi = Math.round((leanMassKg / ((height_cm / 100) * (height_cm / 100))) * 100) / 100;`

---

### 131 — Body Transformation Scenario Calculator

- **Stable ID:** `mrx.tool.131-transformation-forecast-trajectory-engine`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-131-transformation-forecast-trajectory-engine` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Lean-mass-constant arithmetic scenario, not a prediction
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** current_lean_mass_kg, scenario_target_weight_kg, estimated_scenario_weeks, scenario_weight_change_kg, direction, assumptions, disclaimer
- **Evidence:** component `components/tools/tool-131-transformation-forecast-trajectory-engine.tsx`; engine `lib/tools/engines/tool-131-transformation-forecast-trajectory-engine.v6.ts`; schema `lib/tools/schemas/tool-131-transformation-forecast-trajectory-engine.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **PASS** — constant-rate scenario arithmetic is deterministic and discloses the constant-lean-mass assumption; it is not an outcome prediction. Accuracy against a reference is NOT RUN.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score); Illustrative Measurement Index (tool-160-genetic-potential); Physique Trajectory Scenario Simulator (tool-149-physique-trajectory-simulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-131-transformation-forecast-trajectory-engine with stable ID mrx.tool.131-transformation-forecast-trajectory-engine.
2. Deterministic engine exports calculateTransformationScenario; no model-generated number overrides the engine.
3. 2 test file(s) matched; 3 numeric assertion(s) detected.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — constant-rate scenario arithmetic is deterministic and discloses the constant-lean-mass assumption; it is not an outcome prediction. Accuracy against a reference is NOT RUN.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No source/provenance text is encoded in the engine.
4. No chart/visual summary of the result.
5. No Zod/typed input schema was found; validation boundary is unclear.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Body Transformation Scenario Calculator.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + current_lean_mass_kg | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Body Transformation Scenario Calculator.** In: current_lean_mass_kg, scenario_target_weight_kg | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from current_lean_mass_kg.** In: current_lean_mass_kg + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Body Transformation Scenario Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Body Transformation Scenario Calculator.** In: current_lean_mass_kg, scenario_target_weight_kg | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of current_lean_mass_kg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score).** In: approved subset of current_lean_mass_kg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `estimated_scenario_weeks: Number((Math.abs(base.unrounded_scenario_target_weight_kg - parsed.current_weight_kg) / parsed.weekly_weight_change_kg).toFixed(1)),`

---

### 136 — Physique Circumference Ratio Comparison

- **Stable ID:** `mrx.tool.136-physique-golden-ratio-score`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-136-physique-golden-ratio-score` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Unvalidated aesthetic circumference-ratio heuristics
- **Inputs:** shoulder_cm:number [?..300] >0 optional; chest_cm:number [?..300] >0 optional; waist_cm:number [?..300] >0 optional; hips_cm:number [?..300] >0 optional; arm_cm:number [?..150] >0 optional; thigh_cm:number [?..200] >0 optional; calf_cm:number [?..120] >0 optional
- **Outputs:** status, proportionScore, ratios, strengths, weaknesses, disclaimer
- **Evidence:** component `components/tools/tool-136-physique-golden-ratio-score.tsx`; engine `lib/tools/engines/tool-136-physique-golden-ratio-score.v6.ts`; schema `lib/tools/schemas/tool-136-physique-golden-ratio-score.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Body Transformation Scenario Calculator (tool-131-transformation-forecast-trajectory-engine); Illustrative Measurement Index (tool-160-genetic-potential); Physique Trajectory Scenario Simulator (tool-149-physique-trajectory-simulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-136-physique-golden-ratio-score with stable ID mrx.tool.136-physique-golden-ratio-score.
2. Typed PhysiqueInputSchema exposes 7 field(s); 7 carry explicit bounds.
3. Deterministic engine exports calculatePhysiqueV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Physique Circumference Ratio Comparison.** In: shoulder_cm, chest_cm | Out: versioned formula sheet + status | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for shoulder_cm.** In: shoulder_cm:number [?..300] >0 optional; chest_cm:number [?..300] >0 optional; waist_cm:number [?..300] >0 optional; hips_cm:number [?..300] >0 optional; +3 more | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Physique Circumference Ratio Comparison.** In: status, proportionScore | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for shoulder_cm.** In: changed shoulder_cm with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for shoulder_cm, chest_cm, waist_cm, hips_cm, arm_cm, thigh_cm, calf_cm.** In: global metric/imperial preference + shoulder_cm | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Physique Circumference Ratio Comparison.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Physique Circumference Ratio Comparison.** In: status, proportionScore | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Body Transformation Scenario Calculator (tool-131-transformation-forecast-trajectory-engine).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const r = input.shoulder_cm / input.waist_cm;` `const score = Math.max(0, 100 - Math.abs(r - ideal.shoulder_waist)*100);` `const r = input.chest_cm / input.waist_cm;` `const score = Math.max(0, 100 - Math.abs(r - ideal.chest_waist)*100);`

---

### 160 — Illustrative Measurement Index

- **Stable ID:** `mrx.tool.160-genetic-potential`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-160-genetic-potential` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Illustrative user-measurement arithmetic, not a genetic-limit prediction.
- **Inputs:** height_cm:number [100..250] >0; wrist_cm:number [5..30] >0; ankle_cm:number [10..40] >0
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-160-genetic-potential.tsx`; engine `lib/tools/engines/tool-160-genetic-potential.v7.ts`; schema `lib/tools/schemas/tool-160-genetic-potential.v7.ts`; tests 0; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Physique Trajectory Scenario Simulator (tool-149-physique-trajectory-simulator); Body Mass Index Calculator (bmi); Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-160-genetic-potential with stable ID mrx.tool.160-genetic-potential.
2. Typed GeneticPotentialInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculatePotentialScenario; no model-generated number overrides the engine.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Illustrative Measurement Index.** In: height_cm, wrist_cm | Out: versioned formula sheet + the displayed result | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for height_cm.** In: height_cm:number [100..250] >0; wrist_cm:number [5..30] >0; ankle_cm:number [10..40] >0 | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Illustrative Measurement Index.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for height_cm.** In: changed height_cm with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for height_cm, wrist_cm, ankle_cm.** In: global metric/imperial preference + height_cm | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Illustrative Measurement Index.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Illustrative Measurement Index.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Physique Trajectory Scenario Simulator (tool-149-physique-trajectory-simulator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const INCHES_PER_CM = 1 / 2.54;` `const min = imperial ? Number((field.min * INCHES_PER_CM).toFixed(2)) : field.min;` `const max = imperial ? Number((field.max * INCHES_PER_CM).toFixed(2)) : field.max;`

---

### 149 — Physique Trajectory Scenario Simulator

- **Stable ID:** `mrx.tool.149-physique-trajectory-simulator`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/tool-149-physique-trajectory-simulator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** User-selected constant-rate arithmetic scenarios using a shared Tool 131 calculation kernel
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-149-physique-trajectory-simulator.tsx`; engine `lib/tools/engines/tool-149-physique-trajectory-simulator.v6.ts`; schema `lib/tools/schemas/tool-149-physique-trajectory-simulator.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **PASS** — deterministic scenario arithmetic with disclosed constant-lean-mass assumption; not a forecast. Reference accuracy NOT RUN.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Illustrative Measurement Index (tool-160-genetic-potential); Body Mass Index Calculator (bmi); Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/tool-149-physique-trajectory-simulator with stable ID mrx.tool.149-physique-trajectory-simulator.
2. Deterministic engine exports inspectPhysiqueTrajectoryDraft, calculatePhysiqueTrajectoryScenarios; no model-generated number overrides the engine.
3. 2 test file(s) matched; 2 numeric assertion(s) detected.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — deterministic scenario arithmetic with disclosed constant-lean-mass assumption; not a forecast. Reference accuracy NOT RUN.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No source/provenance text is encoded in the engine.
4. No chart/visual summary of the result.
5. No Zod/typed input schema was found; validation boundary is unclear.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Physique Trajectory Scenario Simulator.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Physique Trajectory Scenario Simulator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Physique Trajectory Scenario Simulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Physique Trajectory Scenario Simulator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Illustrative Measurement Index (tool-160-genetic-potential).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const rawWeeks = Math.abs(base.unrounded_scenario_target_weight_kg - parsed.current_weight_kg) / rate;` `const KG_PER_LB = 1 / 2.20462;` `return String(unit === 'imperial' ? value * KG_PER_LB : value);`

---

### NAMED — Body Mass Index Calculator

- **Stable ID:** `mrx.tool.bmi`
- **Category / route / status:** Body Composition · `/smarttools/body-composition/bmi` · **PASS** (R5 runtime + accessibility evidence; final owner acceptance pending)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Calculate BMI from weight and height
- **Inputs:** weightKg:number >0; heightCm:number >0
- **Outputs:** bmi, category
- **Evidence:** component `components/tools/bmi-pilot.tsx`; engine `lib/tools/engines/bmi.v6.ts`; schema `lib/tools/schemas/bmi.ts`; tests 8; i18n none; measurement yes; narrative yes; AI result context no; sliders 3.
- **Formula status:** **PASS** — deterministic BMI = kg/m²; CDC adult screening bands; R5 live case 70 kg / 1.75 m -> 22.9; owner acceptance pending.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Physique Trajectory Scenario Simulator (tool-149-physique-trajectory-simulator); Illustrative Measurement Index (tool-160-genetic-potential); Physique Circumference Ratio Comparison (tool-136-physique-golden-ratio-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/body-composition/bmi with stable ID mrx.tool.bmi.
2. Typed bmiInputSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateBmi; no model-generated number overrides the engine.
4. 8 test file(s) matched; 1 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — deterministic BMI = kg/m²; CDC adult screening bands; R5 live case 70 kg / 1.75 m -> 22.9; owner acceptance pending.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Body Mass Index Calculator.** In: weightKg, heightCm | Out: versioned formula sheet + bmi | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weightKg.** In: weightKg:number >0; heightCm:number >0 | Out: field-level validation messages + canonical value | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Body Mass Index Calculator.** In: bmi, category | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weightKg.** In: changed weightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from bmi.** In: bmi + declared goal if present | Out: status vs validated range/goal | Source: CDC/WHO anthropometry references and a validated body-composition method (not BMI alone) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weightKg, heightCm.** In: global metric/imperial preference + weightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Body Mass Index Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Body Mass Index Calculator.** In: bmi, category | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of bmi.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Physique Trajectory Scenario Simulator (tool-149-physique-trajectory-simulator).** In: approved subset of bmi | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const heightM = heightCm / 100;` `const bmi = weightKg / (heightM * heightM);` `return { bmi: Math.round(bmi * 10) / 10, category };` `const formatGap = (value: number) => (Math.round(value * 10) / 10).toFixed(1);`

---
