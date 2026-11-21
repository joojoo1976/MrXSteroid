# R5 255-TOOL PER-TOOL DOSSIERS — NUTRITION

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 19 catalog entries in this category (19 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — Adaptive Macro Calculator

- **Stable ID:** `mrx.tool.macro`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/macro` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Deterministic Macro v6 calculation using documented adult equations and explicit assumptions
- **Inputs:** age:other unbounded; sex:other unbounded; heightCm:other unbounded; weightKg:other unbounded; activityLevel:other unbounded; phase:other unbounded; goal:other unbounded; targetBodyFatPct:other unbounded; leanMassKg:other unbounded; +3 more
- **Outputs:** completeness, missingRequiredFields, minimumViableOutput, fullOutput, whatIfScenarios, goldenRulesApplied, recalculate
- **Evidence:** component `components/tools/macro-pilot.tsx`; engine `lib/tools/engines/macro.v6.ts`; schema `lib/tools/schemas/macro.v6.ts`; tests 21; i18n none; measurement yes; narrative yes; AI result context no; sliders 1.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** Master Calculator (master-calculator); Calorie Adjuster (tool-012-calorie-adjuster); Macro Optimizer (tool-013-macro-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/macro with stable ID mrx.tool.macro.
2. Typed MacroInputV6PartialSchema exposes 12 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateMacrosV6, calculateMacrosV6, calculateMacrosV6; no model-generated number overrides the engine.
4. 21 test file(s) matched; 154 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No <main> landmark in the component.
5. No chart/visual summary of the result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Adaptive Macro Calculator.** In: age, sex | Out: versioned formula sheet + completeness | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:other unbounded; sex:other unbounded; heightCm:other unbounded; weightKg:other unbounded; +8 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Adaptive Macro Calculator.** In: completeness, missingRequiredFields | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from completeness.** In: completeness + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for heightCm, weightKg, leanMassKg, targetWeightKg.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Adaptive Macro Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Adaptive Macro Calculator.** In: completeness, missingRequiredFields | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of completeness.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Master Calculator (master-calculator).** In: approved subset of completeness | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `bmr = Math.round(bmr);` `const tdee = Math.round(bmr * activityLevel);` `const targetCalories = Math.round(tdee * phaseMultiplier);` `const proteinGrams = Math.round(weightKg * 2.2);`

---

### NAMED — Master Calculator

- **Stable ID:** `mrx.tool.master-calculator`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/master-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** All-in-one nutrition and cycle calculator
- **Inputs:** age:number [13..100]; sex:enum enum(male\|female); heightCm:number [100..250]; weightKg:number [30..300]; activityLevel:number [1.2..1.9]; phase:enum enum(bulk\|cut\|maintenance\|recomp); bodyFatPercentage:number [0..50] optional; compounds:array optional; unitSystem:enum optional enum(metric\|imperial)
- **Outputs:** tdee, targetCalories, proteinGrams, carbsGrams, fatGrams, leanMassKg, estimatedPeakMg, bmiCategory
- **Evidence:** component `components/tools/master-calculator.tsx`; engine `lib/tools/engines/master-calculator.ts`; schema `lib/tools/schemas/master-calculator.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Adaptive Macro Calculator (macro); Calorie Adjuster (tool-012-calorie-adjuster); Macro Optimizer (tool-013-macro-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/master-calculator with stable ID mrx.tool.master-calculator.
2. Typed MasterCalculatorInputSchema exposes 9 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateMaster; no model-generated number overrides the engine.
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (13 lines); implementation can be inspected at components/tools/master-calculator.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Master Calculator.** In: age, sex | Out: versioned formula sheet + tdee | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [13..100]; sex:enum enum(male|female); heightCm:number [100..250]; weightKg:number [30..300]; +5 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Master Calculator.** In: tdee, targetCalories | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from tdee.** In: tdee + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for heightCm, weightKg.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Master Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Master Calculator.** In: tdee, targetCalories | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of tdee.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Adaptive Macro Calculator (macro).** In: approved subset of tdee | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;` `return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;` `case 'bulk': return Math.round(tdee * 1.1);` `case 'cut': return Math.round(tdee * 0.85);`

---

### 012 — Calorie Adjuster

- **Stable ID:** `mrx.tool.012-calorie-adjuster`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-012-calorie-adjuster` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Adjust calories by phase
- **Inputs:** age:number [19..78] int; gender:enum enum(male\|female); height_cm:number [100..250]; current_weight_kg:number [30..200]; activity_level:enum enum(sedentary\|light\|moderate\|active\|very_active); goal:enum enum(bulk\|cut\|maintain); weeks_per_phase:number [1..52] int
- **Outputs:** tdee, tdee_range, maintenance_calories, target_calories, weekly_adjustment, phase_duration_weeks, recommendations
- **Evidence:** component `components/tools/tool-012-calorie-adjuster.tsx`; engine `lib/tools/engines/tool-012-calorie-adjuster.ts`; schema `lib/tools/schemas/tool-012-calorie-adjuster.ts`; tests 1; i18n `i18n/tool-012-calorie-adjuster.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; no <main>.
- **Related:** Macro Optimizer (tool-013-macro-optimizer); Master Calculator (master-calculator); Adaptive Macro Calculator (macro).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-012-calorie-adjuster with stable ID mrx.tool.012-calorie-adjuster.
2. Typed CalorieInputSchema exposes 7 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateTDEE; no model-generated number overrides the engine.
4. 1 test file(s) matched; 9 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-012-calorie-adjuster.json exists (27 AR / 27 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. No source/provenance text is encoded in the engine.
4. No <main> landmark in the component.
5. No chart/visual summary of the result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Calorie Adjuster.** In: age, gender | Out: versioned formula sheet + tdee | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [19..78] int; gender:enum enum(male|female); height_cm:number [100..250]; current_weight_kg:number [30..200]; +3 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Calorie Adjuster.** In: tdee, tdee_range | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from tdee.** In: tdee + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for height_cm, current_weight_kg.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Calorie Adjuster.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Calorie Adjuster.** In: tdee, tdee_range | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of tdee.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Macro Optimizer (tool-013-macro-optimizer).** In: approved subset of tdee | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const tdee = Math.round(bmr * multiplier);` `recommendations.push(\`Target: ${Math.abs(targetCalories - maintenanceCalories)}cal daily deficit for fat loss\`);`

---

### 013 — Macro Optimizer

- **Stable ID:** `mrx.tool.013-macro-optimizer`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-013-macro-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Optimize protein/carbs/fats
- **Inputs:** weight_kg:number [30..200]; goal:enum enum(bulk\|cut\|maintain); protein_per_kg:number [1..5]; fats_per_kg:number [0.5..2]; meals_per_day:number [1..8] int
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-013-macro-optimizer.tsx`; engine `lib/tools/engines/tool-013-macro-optimizer.ts`; schema `lib/tools/schemas/tool-013-macro-optimizer.ts`; tests 2; i18n `i18n/tool-013-macro-optimizer.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; no <main>.
- **Related:** Calorie Adjuster (tool-012-calorie-adjuster); Master Calculator (master-calculator); Adaptive Macro Calculator (macro).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-013-macro-optimizer with stable ID mrx.tool.013-macro-optimizer.
2. Typed MacroInputSchema exposes 5 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateMacros; no model-generated number overrides the engine.
4. 2 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-013-macro-optimizer.json exists (26 AR / 26 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No source/provenance text is encoded in the engine.
3. No <main> landmark in the component.
4. No chart/visual summary of the result.
5. No safety/disclaimer text detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Macro Optimizer.** In: weight_kg, goal | Out: versioned formula sheet + the displayed result | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weight_kg.** In: weight_kg:number [30..200]; goal:enum enum(bulk|cut|maintain); protein_per_kg:number [1..5]; fats_per_kg:number [0.5..2]; +1 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Macro Optimizer.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weight_kg.** In: changed weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weight_kg, protein_per_kg, fats_per_kg.** In: global metric/imperial preference + weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Macro Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Macro Optimizer.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Calorie Adjuster (tool-012-calorie-adjuster).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const protein_g = Math.round(weight_kg * protein_per_kg);` `const fats_g = Math.round(weight_kg * fats_per_kg);` `const proteinCalories = protein_g * 4;` `const fatsCalories = fats_g * 9;`

---

### 097 — Exercise Sweat-Rate Measurement

- **Stable ID:** `mrx.tool.097-hydration-balance-calculator`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-097-hydration-balance-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Calculate measured sweat loss and rate from user-entered pre/post exercise mass, fluid, urine, and duration; does not prescribe intake or assess hydration
- **Inputs:** pre_exercise_body_weight_kg:number [1..500]; post_exercise_body_weight_kg:number [1..500]; fluid_consumed_liters:number [0..100]; urine_output_liters:number [0..100]; exercise_duration_minutes:number [1..1440] int
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-097-hydration-balance-calculator.tsx`; engine `lib/tools/engines/tool-097-hydration-balance-calculator.ts`; schema `lib/tools/schemas/tool-097-hydration-balance-calculator.ts`; tests 3; i18n `i18n/tool-097-hydration-balance-calculator.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; <main> present.
- **Related:** Sodium-to-Potassium Ratio Calculator (tool-098-sodium-potassium-manager); Digestive Observation Log (tool-099-digestive-health-optimizer); Glycogen Supercompensation & Water Retention Modeler (tool-106-glycogen-supercompensation-water-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-097-hydration-balance-calculator with stable ID mrx.tool.097-hydration-balance-calculator.
2. Typed HydrationBalanceCalculatorInputSchema exposes 5 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calculateHydrationBalance; no model-generated number overrides the engine.
4. 3 test file(s) matched; 1 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-097-hydration-balance-calculator.json exists (34 AR / 34 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Exercise Sweat-Rate Measurement.** In: pre_exercise_body_weight_kg, post_exercise_body_weight_kg | Out: versioned formula sheet + the displayed result | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for pre_exercise_body_weight_kg.** In: pre_exercise_body_weight_kg:number [1..500]; post_exercise_body_weight_kg:number [1..500]; fluid_consumed_liters:number [0..100]; urine_output_liters:number [0..100]; +1 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Exercise Sweat-Rate Measurement.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for pre_exercise_body_weight_kg.** In: changed pre_exercise_body_weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for pre_exercise_body_weight_kg, post_exercise_body_weight_kg, fluid_consumed_liters, urine_output_liters.** In: global metric/imperial preference + pre_exercise_body_weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Exercise Sweat-Rate Measurement.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Exercise Sweat-Rate Measurement.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Sodium-to-Potassium Ratio Calculator (tool-098-sodium-potassium-manager).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const factor = 10 ** digits;` `return Math.round((value + Number.EPSILON) * factor) / factor;` `const nonNegativeSweatLossLiters = Math.max(0, sweatLossLiters);` `const exerciseDurationHours = measurement.exercise_duration_minutes / 60;`

---

### 098 — Sodium-to-Potassium Ratio Calculator

- **Stable ID:** `mrx.tool.098-sodium-potassium-manager`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-098-sodium-potassium-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Calculate a direct ratio from user-entered dietary amounts; no cardiovascular or electrolyte status inference
- **Inputs:** daily_sodium_mg:number [0..15000]; daily_potassium_mg:number [?..10000] >0
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-098-sodium-potassium-manager.tsx`; engine `lib/tools/engines/tool-098-sodium-potassium-manager.ts`; schema `lib/tools/schemas/tool-098-sodium-potassium-manager.ts`; tests 1; i18n `i18n/tool-098-sodium-potassium-manager.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; <main> present.
- **Related:** Exercise Sweat-Rate Measurement (tool-097-hydration-balance-calculator); Digestive Observation Log (tool-099-digestive-health-optimizer); Glycogen Supercompensation & Water Retention Modeler (tool-106-glycogen-supercompensation-water-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-098-sodium-potassium-manager with stable ID mrx.tool.098-sodium-potassium-manager.
2. Typed SodiumPotassiumManagerInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports manageSodiumPotassium; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-098-sodium-potassium-manager.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Sodium-to-Potassium Ratio Calculator.** In: daily_sodium_mg, daily_potassium_mg | Out: versioned formula sheet + the displayed result | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_sodium_mg.** In: daily_sodium_mg:number [0..15000]; daily_potassium_mg:number [?..10000] >0 | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Sodium-to-Potassium Ratio Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_sodium_mg.** In: changed daily_sodium_mg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for daily_sodium_mg, daily_potassium_mg.** In: global metric/imperial preference + daily_sodium_mg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Sodium-to-Potassium Ratio Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Sodium-to-Potassium Ratio Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Exercise Sweat-Rate Measurement (tool-097-hydration-balance-calculator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `sodium_to_potassium_ratio: Math.round((values.daily_sodium_mg / values.daily_potassium_mg) * 100) / 100,`

---

### 099 — Digestive Observation Log

- **Stable ID:** `mrx.tool.099-digestive-health-optimizer`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-099-digestive-health-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Record user-entered dietary and digestive observations without health-state inference
- **Inputs:** daily_protein_intake_grams:number [0..500]; bloating_or_reflux_frequency:enum enum(rare\|occasional\|severe_daily); bowel_regularity_bristol_score:number [1..7] int; using_oral_17aa_or_nsaids:other unbounded; fermented_food_or_probiotic_intake:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-099-digestive-health-optimizer.tsx`; engine `lib/tools/engines/tool-099-digestive-health-optimizer.ts`; schema `lib/tools/schemas/tool-099-digestive-health-optimizer.ts`; tests 1; i18n `i18n/tool-099-digestive-health-optimizer.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; <main> present.
- **Related:** Sodium-to-Potassium Ratio Calculator (tool-098-sodium-potassium-manager); Exercise Sweat-Rate Measurement (tool-097-hydration-balance-calculator); Glycogen Supercompensation & Water Retention Modeler (tool-106-glycogen-supercompensation-water-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-099-digestive-health-optimizer with stable ID mrx.tool.099-digestive-health-optimizer.
2. Typed DigestiveHealthOptimizerInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports optimizeDigestiveHealth; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-099-digestive-health-optimizer.json exists (26 AR / 26 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Digestive Observation Log.** In: daily_protein_intake_grams, bloating_or_reflux_frequency | Out: versioned formula sheet + the displayed result | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for daily_protein_intake_grams.** In: daily_protein_intake_grams:number [0..500]; bloating_or_reflux_frequency:enum enum(rare|occasional|severe_daily); bowel_regularity_bristol_score:number [1..7] int; using_oral_17aa_or_nsaids:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Digestive Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_protein_intake_grams.** In: changed daily_protein_intake_grams with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for daily_protein_intake_grams.** In: global metric/imperial preference + daily_protein_intake_grams | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Digestive Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Digestive Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Sodium-to-Potassium Ratio Calculator (tool-098-sodium-potassium-manager).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 106 — Glycogen Supercompensation & Water Retention Modeler

- **Stable ID:** `mrx.tool.106-glycogen-supercompensation-water-modeler`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-106-glycogen-supercompensation-water-modeler` · **FAIL** (confirmed formula/provenance defect (see formula status))
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Glycogen/water loading modeler
- **Inputs:** body_weight_kg:number [35..220]; lean_mass_kg:number [18..160]; training_load:enum enum(low\|medium\|high); target_carbs_g_per_kg:number [4..16]; days:number [1..7] int; baseline_glycogen_g:number [0..200]
- **Outputs:** predicted_max_glycogen_g, muscle_glycogen_g, liver_glycogen_g, total_glycogen_g, water_retention_liters, total_water_retention_liters, carb_budget_per_day_g, total_carb_g, gi_risk, +3 more
- **Evidence:** component `components/tools/tool-106-glycogen-supercompensation-water-modeler.tsx`; engine `lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.ts`; schema `lib/tools/schemas/tool-106-glycogen-supercompensation-water-modeler.ts`; tests 2; i18n `i18n/tool-106-glycogen-supercompensation-water-modeler.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **FAIL** — arbitrary 600 g cap; muscle/liver glycogen accounting is internally inconsistent; water_retention_liters duplicates total_water_retention_liters; training_load is unused; no source provenance.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** AI Meal Vision Scanner & Portion Estimator (tool-110-ai-meal-vision-scanner); Smart Food & Macro Substitution Engine (tool-111-smart-food-macro-substitution); Food Quality & Micronutrient Diversity Score (tool-112-food-quality-micronutrient-diversity-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-106-glycogen-supercompensation-water-modeler with stable ID mrx.tool.106-glycogen-supercompensation-water-modeler.
2. Typed GlycogenInputSchema exposes 6 field(s); 5 carry explicit bounds.
3. Deterministic engine exports calcMaxMuscleGlycogen, calcGlycogenModel; no model-generated number overrides the engine.
4. 2 test file(s) matched; 10 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-106-glycogen-supercompensation-water-modeler.json exists (26 AR / 26 EN keys).

**Five evidence-backed gaps**
1. Formula status FAIL: arbitrary 600 g cap; muscle/liver glycogen accounting is internally inconsistent; water_retention_liters duplicates total_water_retention_liters; training_load is unused; no source provenance.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Glycogen Supercompensation & Water Retention Modeler.** In: body_weight_kg, lean_mass_kg | Out: versioned formula sheet + predicted_max_glycogen_g | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for body_weight_kg.** In: body_weight_kg:number [35..220]; lean_mass_kg:number [18..160]; training_load:enum enum(low|medium|high); target_carbs_g_per_kg:number [4..16]; +2 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Glycogen Supercompensation & Water Retention Modeler.** In: predicted_max_glycogen_g, muscle_glycogen_g | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for body_weight_kg.** In: changed body_weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from predicted_max_glycogen_g.** In: predicted_max_glycogen_g + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for body_weight_kg, lean_mass_kg, target_carbs_g_per_kg.** In: global metric/imperial preference + body_weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Glycogen Supercompensation & Water Retention Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Glycogen Supercompensation & Water Retention Modeler.** In: predicted_max_glycogen_g, muscle_glycogen_g | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of predicted_max_glycogen_g.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Meal Vision Scanner & Portion Estimator (tool-110-ai-meal-vision-scanner).** In: approved subset of predicted_max_glycogen_g | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.round((leanKg * 15 + 150) * 10) / 10;` `const carbBudgetTotal = target_carbs_g_per_kg * 1000 * days;` `const predicted = Math.max(baseline_glycogen_g, Math.min(maxMuscle * 0.92, Math.min(carbBudgetTotal, 600)));` `const water = Math.min(predicted * WATER_PER_GLYCOGEN_g / 1000, lean_mass_kg * 0.25 + 1);`

---

### 110 — AI Meal Vision Scanner & Portion Estimator

- **Stable ID:** `mrx.tool.110-ai-meal-vision-scanner`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-110-ai-meal-vision-scanner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Vision-based meal/portion estimator
- **Inputs:** meal_type:enum enum(breakfast\|lunch\|dinner\|snack\|shake); plate_size:enum enum(small\|medium\|standard\|large); food_items:array [1..60]; photo_attached:other unbounded; photo_quality:enum enum(poor\|medium\|high); photo_consent:enum enum(given\|not_given\|declined)
- **Outputs:** meal_type, plate_class, portion_estimates, total_energy_kcal, energy_range_kcal, protein_g, carbs_g, fat_g, uncertainty_label, +3 more
- **Evidence:** component `components/tools/tool-110-ai-meal-vision-scanner.tsx`; engine `lib/tools/engines/tool-110-ai-meal-vision-scanner.ts`; schema `lib/tools/schemas/tool-110-ai-meal-vision-scanner.ts`; tests 1; i18n `i18n/tool-110-ai-meal-vision-scanner.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Smart Food & Macro Substitution Engine (tool-111-smart-food-macro-substitution); Food Quality & Micronutrient Diversity Score (tool-112-food-quality-micronutrient-diversity-score); AI Grocery Basket & Meal Cost Optimizer (tool-113-ai-grocery-basket-meal-cost-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-110-ai-meal-vision-scanner with stable ID mrx.tool.110-ai-meal-vision-scanner.
2. Typed MealInputSchema exposes 6 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calcMealEstimate; no model-generated number overrides the engine.
4. 1 test file(s) matched; 4 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-110-ai-meal-vision-scanner.json exists (39 AR / 39 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Meal Vision Scanner & Portion Estimator.** In: meal_type, plate_size | Out: versioned formula sheet + meal_type | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for meal_type.** In: meal_type:enum enum(breakfast|lunch|dinner|snack|shake); plate_size:enum enum(small|medium|standard|large); food_items:array [1..60]; photo_attached:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Meal Vision Scanner & Portion Estimator.** In: meal_type, plate_class | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for meal_type.** In: changed meal_type with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from meal_type.** In: meal_type + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for meal_type.** In: global metric/imperial preference + meal_type | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Meal Vision Scanner & Portion Estimator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Meal Vision Scanner & Portion Estimator.** In: meal_type, plate_class | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of meal_type.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Smart Food & Macro Substitution Engine (tool-111-smart-food-macro-substitution).** In: approved subset of meal_type | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.round((protein * 4 + carbs * 4 + fat * 9) * 10) / 10;` `estimate_g: Math.round((base / (count + 1)) * 10) / 10,` `low_g: Math.round((base / (count + 1)) * 0.7 * 10) / 10,` `high_g: Math.round((base / (count + 1)) * 1.4 * 10) / 10,`

---

### 111 — Smart Food & Macro Substitution Engine

- **Stable ID:** `mrx.tool.111-smart-food-macro-substitution`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-111-smart-food-macro-substitution` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Macro-equivalent food substitution
- **Inputs:** originalFood:other unbounded; substituteFood:other unbounded; originalQuantity:number [?..10000] >0; originalUnit:other unbounded; targetMacros:other unbounded; unitSystem:other optional; locale:other optional
- **Outputs:** calculationTimestamp, engineVersion, dataSources, calculationTimeMs, unitSystem, locale
- **Evidence:** component `components/tools/tool-111-smart-food-macro-substitution.tsx`; engine `lib/tools/engines/tool-111-smart-food-macro-substitution.ts`; schema `lib/tools/schemas/tool-111-smart-food-macro-substitution.ts`; tests 6; i18n `i18n/tool-111-smart-food-macro-substitution.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** AI Meal Vision Scanner & Portion Estimator (tool-110-ai-meal-vision-scanner); Food Quality & Micronutrient Diversity Score (tool-112-food-quality-micronutrient-diversity-score); AI Grocery Basket & Meal Cost Optimizer (tool-113-ai-grocery-basket-meal-cost-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-111-smart-food-macro-substitution with stable ID mrx.tool.111-smart-food-macro-substitution.
2. Typed Tool111InputSchema exposes 7 field(s); 1 carry explicit bounds.
3. Deterministic engine exports convertUnit, formatDisplay, safeDivide; no model-generated number overrides the engine.
4. 6 test file(s) matched; 110 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-111-smart-food-macro-substitution.json exists (74 AR / 74 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Smart Food & Macro Substitution Engine.** In: originalFood, substituteFood | Out: versioned formula sheet + calculationTimestamp | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for originalFood.** In: originalFood:other unbounded; substituteFood:other unbounded; originalQuantity:number [?..10000] >0; originalUnit:other unbounded; +3 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Smart Food & Macro Substitution Engine.** In: calculationTimestamp, engineVersion | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for originalQuantity.** In: changed originalQuantity with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from calculationTimestamp.** In: calculationTimestamp + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for originalFood.** In: global metric/imperial preference + originalQuantity | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Smart Food & Macro Substitution Engine.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Smart Food & Macro Substitution Engine.** In: calculationTimestamp, engineVersion | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of calculationTimestamp.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Meal Vision Scanner & Portion Estimator (tool-110-ai-meal-vision-scanner).** In: approved subset of calculationTimestamp | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return value * factor;` `return canonicalValue / factor;` `const formatted = precision > 0 ? value.toFixed(precision) : Math.round(value).toString();` `if (Math.abs(denominator) < EPSILON) return fallback;`

---

### 112 — Food Quality & Micronutrient Diversity Score

- **Stable ID:** `mrx.tool.112-food-quality-micronutrient-diversity-score`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-112-food-quality-micronutrient-diversity-score` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Food quality diversity index
- **Inputs:** foods:array [1..100]; days_tracked:number [1..30] int
- **Outputs:** food_quality_score, food_group_coverage, total_micronutrient_instances, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-112-food-quality-micronutrient-diversity-score.tsx`; engine `lib/tools/engines/tool-112-food-quality-micronutrient-diversity-score.ts`; schema `lib/tools/schemas/tool-112-food-quality-micronutrient-diversity-score.ts`; tests 2; i18n `i18n/tool-112-food-quality-micronutrient-diversity-score.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Smart Food & Macro Substitution Engine (tool-111-smart-food-macro-substitution); AI Grocery Basket & Meal Cost Optimizer (tool-113-ai-grocery-basket-meal-cost-optimizer); AI Meal Vision Scanner & Portion Estimator (tool-110-ai-meal-vision-scanner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-112-food-quality-micronutrient-diversity-score with stable ID mrx.tool.112-food-quality-micronutrient-diversity-score.
2. Typed FoodQualityInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calcFoodQualityScore; no model-generated number overrides the engine.
4. 2 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-112-food-quality-micronutrient-diversity-score.json exists (49 AR / 49 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. Schema is not strict; unexpected keys are not rejected.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Food Quality & Micronutrient Diversity Score.** In: foods, days_tracked | Out: versioned formula sheet + food_quality_score | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for foods.** In: foods:array [1..100]; days_tracked:number [1..30] int | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Food Quality & Micronutrient Diversity Score.** In: food_quality_score, food_group_coverage | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for days_tracked.** In: changed days_tracked with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from food_quality_score.** In: food_quality_score + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for foods.** In: global metric/imperial preference + days_tracked | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Food Quality & Micronutrient Diversity Score.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Food Quality & Micronutrient Diversity Score.** In: food_quality_score, food_group_coverage | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of food_quality_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Smart Food & Macro Substitution Engine (tool-111-smart-food-macro-substitution).** In: approved subset of food_quality_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const foodGroupCoverage = groupsPresent.size / CORE_FOOD_GROUPS.length;` `const micronutrientDiversityScore = Math.min(100, Math.round((uniqueMicronutrients / MICRONUTRIENT_LIST.length) * 100));` `const foodQualityScore = Math.round(` `food_quality_score: Math.max(0, Math.min(100, foodQualityScore)),`

---

### 113 — AI Grocery Basket & Meal Cost Optimizer

- **Stable ID:** `mrx.tool.113-ai-grocery-basket-meal-cost-optimizer`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-113-ai-grocery-basket-meal-cost-optimizer` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Grocery cost/macro optimizer
- **Inputs:** items:array [1..50]; daily_targets:number [500..10000]; budget_usd:number [?..100000] >0; days:number [1..30]
- **Outputs:** selected_items, total_cost_usd, total_macros, target_achievement, budget_utilization_pct, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-113-ai-grocery-basket-meal-cost-optimizer.tsx`; engine `lib/tools/engines/tool-113-ai-grocery-basket-meal-cost-optimizer.ts`; schema `lib/tools/schemas/tool-113-ai-grocery-basket-meal-cost-optimizer.ts`; tests 1; i18n `i18n/tool-113-ai-grocery-basket-meal-cost-optimizer.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Food Quality & Micronutrient Diversity Score (tool-112-food-quality-micronutrient-diversity-score); Restaurant Macro Navigator & Fast-Food Estimator (tool-114-restaurant-macro-navigator); Smart Food & Macro Substitution Engine (tool-111-smart-food-macro-substitution).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-113-ai-grocery-basket-meal-cost-optimizer with stable ID mrx.tool.113-ai-grocery-basket-meal-cost-optimizer.
2. Typed GroceryInputSchema exposes 4 field(s); 4 carry explicit bounds.
3. 1 test file(s) matched; 0 numeric assertion(s) detected.
4. Tool-specific i18n file i18n/tool-113-ai-grocery-basket-meal-cost-optimizer.json exists (63 AR / 63 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for AI Grocery Basket & Meal Cost Optimizer.** In: items, daily_targets | Out: versioned formula sheet + selected_items | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..50]; daily_targets:number [500..10000]; budget_usd:number [?..100000] >0; days:number [1..30] | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for AI Grocery Basket & Meal Cost Optimizer.** In: selected_items, total_cost_usd | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for daily_targets.** In: changed daily_targets with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from selected_items.** In: selected_items + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + daily_targets | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for AI Grocery Basket & Meal Cost Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for AI Grocery Basket & Meal Cost Optimizer.** In: selected_items, total_cost_usd | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of selected_items.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Food Quality & Micronutrient Diversity Score (tool-112-food-quality-micronutrient-diversity-score).** In: approved subset of selected_items | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const proteinPerDollar = macrosPerUnit.protein / item.price_per_unit;` `const maxAffordable = Math.floor(remainingBudget / item.price_per_unit);` `let quantity = Math.min(maxAffordable, maxByBounds);` `const proteinScore = Math.min(1, testMacros.protein_g / totalTargets.protein_g);`

---

### 114 — Restaurant Macro Navigator & Fast-Food Estimator

- **Stable ID:** `mrx.tool.114-restaurant-macro-navigator`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-114-restaurant-macro-navigator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Restaurant meal macro estimation
- **Inputs:** items:array [1..20]; date:string optional
- **Outputs:** items, daily_totals, daily_uncertainty, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-114-restaurant-macro-navigator.tsx`; engine `lib/tools/engines/tool-114-restaurant-macro-navigator.ts`; schema `lib/tools/schemas/tool-114-restaurant-macro-navigator.ts`; tests 1; i18n `i18n/tool-114-restaurant-macro-navigator.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** AI Grocery Basket & Meal Cost Optimizer (tool-113-ai-grocery-basket-meal-cost-optimizer); Supplement Evidence & Bio-Stack Navigator (tool-115-supplement-evidence-bio-stack-navigator); Food Quality & Micronutrient Diversity Score (tool-112-food-quality-micronutrient-diversity-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-114-restaurant-macro-navigator with stable ID mrx.tool.114-restaurant-macro-navigator.
2. Typed RestaurantInputSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calcRestaurantMacros; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-114-restaurant-macro-navigator.json exists (67 AR / 67 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No what-if or scenario surface.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Restaurant Macro Navigator & Fast-Food Estimator.** In: items, date | Out: versioned formula sheet + items | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..20]; date:string optional | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Restaurant Macro Navigator & Fast-Food Estimator.** In: items, daily_totals | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for items.** In: changed items with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from items.** In: items + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + items | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Restaurant Macro Navigator & Fast-Food Estimator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Restaurant Macro Navigator & Fast-Food Estimator.** In: items, daily_totals | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of items.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to AI Grocery Basket & Meal Cost Optimizer (tool-113-ai-grocery-basket-meal-cost-optimizer).** In: approved subset of items | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const factor = (ing.estimated_weight_g / 100) * PORTION_MULTIPLIERS[portionSize];` `Math.round(estimated.calories * (1 - uncertaintyMultiplier)),` `Math.round(estimated.calories * (1 + uncertaintyMultiplier)),` `Math.round(estimated.protein * (1 - uncertaintyMultiplier)),`

---

### 115 — Supplement Evidence & Bio-Stack Navigator

- **Stable ID:** `mrx.tool.115-supplement-evidence-bio-stack-navigator`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-115-supplement-evidence-bio-stack-navigator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Evidence-graded supplement navigator
- **Inputs:** supplements:array [1..20]; goals:array [1..50]
- **Outputs:** supplements, stack_analysis, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-115-supplement-evidence-bio-stack-navigator.tsx`; engine `lib/tools/engines/tool-115-supplement-evidence-bio-stack-navigator.ts`; schema `lib/tools/schemas/tool-115-supplement-evidence-bio-stack-navigator.ts`; tests 0; i18n `i18n/tool-115-supplement-evidence-bio-stack-navigator.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Restaurant Macro Navigator & Fast-Food Estimator (tool-114-restaurant-macro-navigator); Nutrition Gap & Fasting Window Optimizer (tool-116-nutrition-gap-fasting-window-optimizer); AI Grocery Basket & Meal Cost Optimizer (tool-113-ai-grocery-basket-meal-cost-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-115-supplement-evidence-bio-stack-navigator with stable ID mrx.tool.115-supplement-evidence-bio-stack-navigator.
2. Typed SupplementInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calcSupplementStack; no model-generated number overrides the engine.
4. Tool-specific i18n file i18n/tool-115-supplement-evidence-bio-stack-navigator.json exists (81 AR / 81 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No what-if or scenario surface.
4. Schema is not strict; unexpected keys are not rejected.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Supplement Evidence & Bio-Stack Navigator.** In: supplements, goals | Out: versioned formula sheet + supplements | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for supplements.** In: supplements:array [1..20]; goals:array [1..50] | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Supplement Evidence & Bio-Stack Navigator.** In: supplements, stack_analysis | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for supplements.** In: changed supplements with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from supplements.** In: supplements + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for supplements.** In: global metric/imperial preference + supplements | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Supplement Evidence & Bio-Stack Navigator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Supplement Evidence & Bio-Stack Navigator.** In: supplements, stack_analysis | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of supplements.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Restaurant Macro Navigator & Fast-Food Estimator (tool-114-restaurant-macro-navigator).** In: approved subset of supplements | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `Math.max(1, studies.filter((s) => s.quality_score !== undefined).length);` `return { grade, summary, avgQuality: avgQuality === null ? null : Math.round(avgQuality * 10) / 10 };` `const keyA = suppA.toLowerCase().replace(/[^a-z0-9]/g, '_');` `const keyB = suppB.toLowerCase().replace(/[^a-z0-9]/g, '_');`

---

### 116 — Nutrition Gap & Fasting Window Optimizer

- **Stable ID:** `mrx.tool.116-nutrition-gap-fasting-window-optimizer`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-116-nutrition-gap-fasting-window-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Micronutrient gaps + fasting windows
- **Inputs:** food_log:array [1..200]; days_tracked:number [1..30]; sex:enum enum(male\|female); fasting_goal:enum optional enum(weight_loss\|metabolic_health\|longevity\|muscle_retention\|general_wellness); chronotype:enum optional enum(early\|intermediate\|late); typical_wake_time:string optional; typical_sleep_time:string optional; current_fasting_window:number [8..23] optional
- **Outputs:** nutrient_analysis, identified_gaps, fasting_recommendation, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-116-nutrition-gap-fasting-window-optimizer.tsx`; engine `lib/tools/engines/tool-116-nutrition-gap-fasting-window-optimizer.ts`; schema `lib/tools/schemas/tool-116-nutrition-gap-fasting-window-optimizer.ts`; tests 0; i18n `i18n/tool-116-nutrition-gap-fasting-window-optimizer.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Supplement Evidence & Bio-Stack Navigator (tool-115-supplement-evidence-bio-stack-navigator); Intra-Workout Nutrient Volumizer & Transport Engine (tool-117-intra-workout-nutrient-volumizer); Restaurant Macro Navigator & Fast-Food Estimator (tool-114-restaurant-macro-navigator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-116-nutrition-gap-fasting-window-optimizer with stable ID mrx.tool.116-nutrition-gap-fasting-window-optimizer.
2. Typed NutritionGapInputSchema exposes 8 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calcNutritionGap; no model-generated number overrides the engine.
4. Tool-specific i18n file i18n/tool-116-nutrition-gap-fasting-window-optimizer.json exists (82 AR / 82 EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No what-if or scenario surface.
4. Schema is not strict; unexpected keys are not rejected.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Nutrition Gap & Fasting Window Optimizer.** In: food_log, days_tracked | Out: versioned formula sheet + nutrient_analysis | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for food_log.** In: food_log:array [1..200]; days_tracked:number [1..30]; sex:enum enum(male|female); fasting_goal:enum optional enum(weight_loss|metabolic_health|longevity|muscle_retention|general_wellness); +4 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Nutrition Gap & Fasting Window Optimizer.** In: nutrient_analysis, identified_gaps | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for days_tracked.** In: changed days_tracked with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from nutrient_analysis.** In: nutrient_analysis + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for food_log.** In: global metric/imperial preference + days_tracked | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Nutrition Gap & Fasting Window Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Nutrition Gap & Fasting Window Optimizer.** In: nutrient_analysis, identified_gaps | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of nutrient_analysis.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Supplement Evidence & Bio-Stack Navigator (tool-115-supplement-evidence-bio-stack-navigator).** In: approved subset of nutrient_analysis | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);` `return parsed ? parsed.hours * 60 + parsed.minutes : 7 * 60; // default 7:00` `const pctRDA = rda > 0 ? Math.round((intake / rda) * 100) : 0;` `const gapAmount = status === 'low' || status === 'very_low' ? Math.max(0, rda - intake) : undefined;`

---

### 117 — Intra-Workout Nutrient Volumizer & Transport Engine

- **Stable ID:** `mrx.tool.117-intra-workout-nutrient-volumizer`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/tool-117-intra-workout-nutrient-volumizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Intra-workout nutrient planning
- **Inputs:** training_type:enum enum(resistance\|endurance\|mixed\|hiit\|skill); duration_min:number [15..480]; intensity:enum enum(low\|moderate\|high\|very_high); climate:enum enum(cool\|moderate\|hot\|humid); sweat_rate_ml_per_h:number [?..3000] >0 optional; goal:enum enum(performance\|hydration\|recovery\|muscle_protein_synthesis); current_intake:number [0..120] optional
- **Outputs:** recommendations, session_totals, flags, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-117-intra-workout-nutrient-volumizer.tsx`; engine `lib/tools/engines/tool-117-intra-workout-nutrient-volumizer.ts`; schema `lib/tools/schemas/tool-117-intra-workout-nutrient-volumizer.ts`; tests 1; i18n `i18n/tool-117-intra-workout-nutrient-volumizer.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Nutrition Gap & Fasting Window Optimizer (tool-116-nutrition-gap-fasting-window-optimizer); Supplement Evidence & Bio-Stack Navigator (tool-115-supplement-evidence-bio-stack-navigator); Restaurant Macro Navigator & Fast-Food Estimator (tool-114-restaurant-macro-navigator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/tool-117-intra-workout-nutrient-volumizer with stable ID mrx.tool.117-intra-workout-nutrient-volumizer.
2. Typed IntraWorkoutInputSchema exposes 7 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calcIntraWorkout; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-117-intra-workout-nutrient-volumizer.json exists (71 AR / 71 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No what-if or scenario surface.
4. Schema is not strict; unexpected keys are not rejected.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Intra-Workout Nutrient Volumizer & Transport Engine.** In: training_type, duration_min | Out: versioned formula sheet + recommendations | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for training_type.** In: training_type:enum enum(resistance|endurance|mixed|hiit|skill); duration_min:number [15..480]; intensity:enum enum(low|moderate|high|very_high); climate:enum enum(cool|moderate|hot|humid); +3 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Intra-Workout Nutrient Volumizer & Transport Engine.** In: recommendations, session_totals | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for duration_min.** In: changed duration_min with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from recommendations.** In: recommendations + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for duration_min, sweat_rate_ml_per_h.** In: global metric/imperial preference + duration_min | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Intra-Workout Nutrient Volumizer & Transport Engine.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Intra-Workout Nutrient Volumizer & Transport Engine.** In: recommendations, session_totals | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of recommendations.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Nutrition Gap & Fasting Window Optimizer (tool-116-nutrition-gap-fasting-window-optimizer).** In: approved subset of recommendations | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const duration_h = duration_min / 60;` `let targetSodiumPerH = Math.round(ELECTROLYTE_BASE.sodium_mg_per_h * intensityMult.electrolyte * climateMult.electrolyte);` `const targetPotassiumPerH = Math.round(ELECTROLYTE_BASE.potassium_mg_per_h * intensityMult.electrolyte * climateMult.electrolyte);` `const targetMagnesiumPerH = Math.round(ELECTROLYTE_BASE.magnesium_mg_per_h * intensityMult.electrolyte);`

---

### NAMED — BMR / TDEE Calculator

- **Stable ID:** `mrx.tool.bmr-tdee`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/bmr-tdee` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Estimate basal metabolic rate and daily energy expenditure
- **Inputs:** weightKg:number >0; heightCm:number >0; age:number >0; sex:enum enum(male\|female); activityLevel:number [1.2..1.9]
- **Outputs:** bmrKcal, tdeeKcal
- **Evidence:** component `components/tools/bmr-tdee-pilot.tsx`; engine `lib/tools/engines/bmr-tdee.v6.ts`; schema `lib/tools/schemas/bmr-tdee.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** Protein Needs Estimate (protein-needs); Daily Water Intake Estimate (water-intake); Intra-Workout Nutrient Volumizer & Transport Engine (tool-117-intra-workout-nutrient-volumizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/bmr-tdee with stable ID mrx.tool.bmr-tdee.
2. Typed bmrTdeeInputSchema exposes 5 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateBmrTdeeV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 3 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for BMR / TDEE Calculator.** In: weightKg, heightCm | Out: versioned formula sheet + bmrKcal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weightKg.** In: weightKg:number >0; heightCm:number >0; age:number >0; sex:enum enum(male|female); +1 more | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for BMR / TDEE Calculator.** In: bmrKcal, tdeeKcal | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weightKg.** In: changed weightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from bmrKcal.** In: bmrKcal + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weightKg, heightCm.** In: global metric/imperial preference + weightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for BMR / TDEE Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for BMR / TDEE Calculator.** In: bmrKcal, tdeeKcal | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of bmrKcal.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Protein Needs Estimate (protein-needs).** In: approved subset of bmrKcal | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const base = 10 * weightKg + 6.25 * heightCm - 5 * age;` `const tdee = bmr * activityLevel;` `return { bmrKcal: Math.round(bmr), tdeeKcal: Math.round(tdee) };`

---

### NAMED — Protein Needs Estimate

- **Stable ID:** `mrx.tool.protein-needs`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/protein-needs` · **PASS** (R5 runtime + accessibility evidence; final owner acceptance pending)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Estimate daily protein from body weight, goal and activity
- **Inputs:** weightKg:number >0; goal:enum enum(maintain\|bulk\|cut); activityLevel:number [1..1.4]
- **Outputs:** dailyProteinGrams
- **Evidence:** component `components/tools/protein-needs-pilot.tsx`; engine `lib/tools/engines/protein-needs.v6.ts`; schema `lib/tools/schemas/protein-needs.ts`; tests 7; i18n none; measurement yes; narrative yes; AI result context no; sliders 2.
- **Formula status:** **PASS** — g/kg body-weight bands with activity multipliers; R5 live values recorded in R5_FIRST_BATCH_EVIDENCE_REPORT.md; owner acceptance pending.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** BMR / TDEE Calculator (bmr-tdee); Daily Water Intake Estimate (water-intake); Intra-Workout Nutrient Volumizer & Transport Engine (tool-117-intra-workout-nutrient-volumizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/protein-needs with stable ID mrx.tool.protein-needs.
2. Typed proteinNeedsInputSchema exposes 3 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateProteinNeedsV6; no model-generated number overrides the engine.
4. 7 test file(s) matched; 2 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — g/kg body-weight bands with activity multipliers; R5 live values recorded in R5_FIRST_BATCH_EVIDENCE_REPORT.md; owner acceptance pending.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Protein Needs Estimate.** In: weightKg, goal | Out: versioned formula sheet + dailyProteinGrams | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weightKg.** In: weightKg:number >0; goal:enum enum(maintain|bulk|cut); activityLevel:number [1..1.4] | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Protein Needs Estimate.** In: dailyProteinGrams, the full result contract | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weightKg.** In: changed weightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from dailyProteinGrams.** In: dailyProteinGrams + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weightKg.** In: global metric/imperial preference + weightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Protein Needs Estimate.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Protein Needs Estimate.** In: dailyProteinGrams, the full result contract | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of dailyProteinGrams.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to BMR / TDEE Calculator (bmr-tdee).** In: approved subset of dailyProteinGrams | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const factor = 1 + (activityLevel - 1) * 0.05;` `const dailyProteinGrams = Math.round(weightKg * base * factor);` `const localized = /weight must be positive/i.test(message) ? text.invalid : text.errorGuidance;`

---

### NAMED — Daily Water Intake Estimate

- **Stable ID:** `mrx.tool.water-intake`
- **Category / route / status:** Nutrition · `/smarttools/nutrition/water-intake` · **PASS** (R5 runtime + accessibility evidence; final owner acceptance pending)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Estimate a starting daily water intake from weight and activity
- **Inputs:** weightKg:number >0; activityLevel:number [1..1.4]
- **Outputs:** dailyWaterLiters
- **Evidence:** component `components/tools/water-intake-pilot.tsx`; engine `lib/tools/engines/water-intake.v6.ts`; schema `lib/tools/schemas/water-intake.ts`; tests 7; i18n none; measurement yes; narrative yes; AI result context no; sliders 2.
- **Formula status:** **PASS** — mL/kg baseline plus activity adjustment; R5 live case 70 kg / activity 1.2 -> 2.5 L and 85 US fl oz; owner acceptance pending.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Protein Needs Estimate (protein-needs); BMR / TDEE Calculator (bmr-tdee); Intra-Workout Nutrient Volumizer & Transport Engine (tool-117-intra-workout-nutrient-volumizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/nutrition/water-intake with stable ID mrx.tool.water-intake.
2. Typed waterIntakeInputSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateWaterIntakeV6; no model-generated number overrides the engine.
4. 7 test file(s) matched; 2 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — mL/kg baseline plus activity adjustment; R5 live case 70 kg / activity 1.2 -> 2.5 L and 85 US fl oz; owner acceptance pending.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Daily Water Intake Estimate.** In: weightKg, activityLevel | Out: versioned formula sheet + dailyWaterLiters | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weightKg.** In: weightKg:number >0; activityLevel:number [1..1.4] | Out: field-level validation messages + canonical value | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Daily Water Intake Estimate.** In: dailyWaterLiters, the full result contract | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weightKg.** In: changed weightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from dailyWaterLiters.** In: dailyWaterLiters + declared goal if present | Out: status vs validated range/goal | Source: USDA FoodData Central and DRI/WHO nutrition references (exact citation/version to be owner-approved) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weightKg.** In: global metric/imperial preference + weightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Daily Water Intake Estimate.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Daily Water Intake Estimate.** In: dailyWaterLiters, the full result contract | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of dailyWaterLiters.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Protein Needs Estimate (protein-needs).** In: approved subset of dailyWaterLiters | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const baseMl = weightKg * 35;` `const adjusted = baseMl * (1 + (activityLevel - 1) * 0.1);` `const dailyWaterLiters = Math.round((adjusted / 1000) * 100) / 100;` `const localized = /weight must be positive/i.test(message) ? text.invalid : text.errorGuidance;`

---
