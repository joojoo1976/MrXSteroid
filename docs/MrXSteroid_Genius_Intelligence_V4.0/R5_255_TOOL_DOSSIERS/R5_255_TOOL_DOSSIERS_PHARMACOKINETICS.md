# R5 255-TOOL PER-TOOL DOSSIERS — PHARMACOKINETICS

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 41 catalog entries in this category (41 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — Half-Life Simulator

- **Stable ID:** `mrx.tool.halflife`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/halflife` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Compound half-life visualization and accumulation
- **Inputs:** compounds:array [1..?]; simulationDays:number [1..365]; unitSystem:enum optional enum(metric\|imperial)
- **Outputs:** concentrationCurve, peakMg, troughMg, averageMg, steadyStateDay, accumulationRatio
- **Evidence:** component `components/tools/halflife.tsx`; engine `lib/tools/engines/halflife.ts`; schema `lib/tools/schemas/halflife.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Multi-Ester PK Simulator (multi-ester-pharmacokinetics); Half-Life Calculator (tool-016-half-life-calculator); Half-Life Stacker (tool-022-half-life-stacker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/halflife with stable ID mrx.tool.halflife.
2. Typed HalflifeInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateHalflife; no model-generated number overrides the engine.
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (13 lines); implementation can be inspected at components/tools/halflife.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Half-Life Simulator.** In: compounds, simulationDays | Out: versioned formula sheet + concentrationCurve | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..?]; simulationDays:number [1..365]; unitSystem:enum optional enum(metric|imperial) | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Half-Life Simulator.** In: concentrationCurve, peakMg | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for simulationDays.** In: changed simulationDays with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from concentrationCurve.** In: concentrationCurve + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + simulationDays | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Half-Life Simulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Half-Life Simulator.** In: concentrationCurve, peakMg | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of concentrationCurve.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Multi-Ester PK Simulator (multi-ester-pharmacokinetics).** In: approved subset of concentrationCurve | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const remaining = compound.doseMg * Math.pow(0.5, elapsed / compound.halfLifeDays);` `compoundsData.push({ compoundId: compound.id, mg: Math.round(mg * 100) / 100 });` `concentrationCurve.push({ day, totalMg: Math.round(dayTotal * 100) / 100, compounds: compoundsData });` `peakMg = Math.max(peakMg, dayTotal);`

---

### NAMED — Multi-Ester PK Simulator

- **Stable ID:** `mrx.tool.multi-ester-pharmacokinetics`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/multi-ester-pharmacokinetics` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Multi-ester serum accumulation simulator
- **Inputs:** bodyWeightKg:number [30..250]; simulationDays:number [7..180] int; injections:array [1..200]
- **Outputs:** timeline, peakConcentrationNgDl, troughConcentrationNgDl, averageConcentrationNgDl, peakToTroughRatio, estimatedSteadyStateDay, totalActiveHormoneDeliveredMg
- **Evidence:** component `components/tools/multi-ester-pharmacokinetics.tsx`; engine `lib/tools/engines/multi-ester-pharmacokinetics.ts`; schema `lib/tools/schemas/multi-ester-pharmacokinetics.ts`; tests 3; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** Half-Life Simulator (halflife); Half-Life Calculator (tool-016-half-life-calculator); Half-Life Stacker (tool-022-half-life-stacker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/multi-ester-pharmacokinetics with stable ID mrx.tool.multi-ester-pharmacokinetics.
2. Typed MultiEsterInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports batemanTerm, calculateMultiEsterPK; no model-generated number overrides the engine.
4. 3 test file(s) matched; 19 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Multi-Ester PK Simulator.** In: bodyWeightKg, simulationDays | Out: versioned formula sheet + timeline | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for bodyWeightKg.** In: bodyWeightKg:number [30..250]; simulationDays:number [7..180] int; injections:array [1..200] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Multi-Ester PK Simulator.** In: timeline, peakConcentrationNgDl | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for bodyWeightKg.** In: changed bodyWeightKg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from timeline.** In: timeline + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for bodyWeightKg.** In: global metric/imperial preference + bodyWeightKg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Multi-Ester PK Simulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Multi-Ester PK Simulator.** In: timeline, peakConcentrationNgDl | Out: one labelled chart/table with alt text | Source: engine values | State: PARTIAL — visual detected | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of timeline.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Half-Life Simulator (halflife).** In: approved subset of timeline | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const round2 = (value: number): number => Math.round(value * 100) / 100;` `if (Math.abs(ka - ke) < KA_KE_EPSILON) {` `return (netDoseMg / vdLiters) * ka * tDays * Math.exp(-ke * tDays);` `return ((netDoseMg * ka) / (vdLiters * (ka - ke))) * (Math.exp(-ke * tDays) - Math.exp(-ka * tDays));`

---

### 016 — Half-Life Calculator

- **Stable ID:** `mrx.tool.016-half-life`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-016-half-life-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Multi-compound clearance optimizer
- **Inputs:** compounds:array [1..12]; remaining_percent:number unbounded
- **Outputs:** status, model, compounds, assumptions
- **Evidence:** component `components/tools/tool-016-half-life-calculator.tsx`; engine `lib/tools/engines/tool-016-half-life-calculator.ts`; schema `lib/tools/schemas/tool-016-half-life-calculator.ts`; tests 3; i18n `i18n/tool-016-half-life-calculator.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **PASS** — t = t½·ln(remaining fraction)/ln(0.5) is algebraically correct; strict Zod bounds. Existing test recomputes the same expression, so it is not an independent golden case.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; no <main>.
- **Related:** Half-Life Stacker (tool-022-half-life-stacker); User-Provided Molar Mass Calculator (tool-027-ester-conversion); Multi-Ester PK Simulator (multi-ester-pharmacokinetics).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-016-half-life-calculator with stable ID mrx.tool.016-half-life.
2. Typed HalfLifeInputSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateHalfLife; no model-generated number overrides the engine.
4. 3 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-016-half-life-calculator.json exists (20 AR / 20 EN keys).

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — t = t½·ln(remaining fraction)/ln(0.5) is algebraically correct; strict Zod bounds. Existing test recomputes the same expression, so it is not an independent golden case.
2. No <main> landmark in the component.
3. No chart/visual summary of the result.
4. No safety/disclaimer text detected.
5. Input surface has 2 native number field(s), 0 text field(s), 0 slider(s) and 0 select(s): precise entry and measurement synchronization are not systematic.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Half-Life Calculator.** In: compounds, remaining_percent | Out: versioned formula sheet + status | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..12]; remaining_percent:number unbounded | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Half-Life Calculator.** In: status, model | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for remaining_percent.** In: changed remaining_percent with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + remaining_percent | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Half-Life Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Half-Life Calculator.** In: status, model | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Half-Life Stacker (tool-022-half-life-stacker).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const remainingFraction = input.remaining_percent / 100;` `const elapsedDays = compound.half_life_days * Math.log(remainingFraction) / Math.log(0.5);`

---

### 022 — Half-Life Stacker

- **Stable ID:** `mrx.tool.022-half-life-stacker`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-022-half-life-stacker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Multi-ester stack timing
- **Inputs:** compounds:array [1..6]; cycle_length_weeks:number [1..52]; injection_frequency:enum enum(daily\|every-other-day\|2x-week\|1x-week)
- **Outputs:** peak_platform_days, recommended_pct_start_days, washout_complete_days, ester_bottleneck, optimal_injection_schedule, compound_peak_times
- **Evidence:** component `components/tools/tool-022-half-life-stacker.tsx`; engine `lib/tools/engines/tool-022-half-life-stacker.ts`; schema `lib/tools/schemas/tool-022-half-life-stacker.ts`; tests 2; i18n `i18n/tool-022-half-life-stacker.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** User-Provided Molar Mass Calculator (tool-027-ester-conversion); Half-Life Calculator (tool-016-half-life-calculator); Single-dose Fractional Decay Scenario (tool-034-compound-clearance).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-022-half-life-stacker with stable ID mrx.tool.022-half-life-stacker.
2. Typed StackTimingInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateStackTiming; no model-generated number overrides the engine.
4. 2 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-022-half-life-stacker.json exists (20 AR / 20 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Does not read the global measurement preference; unit switching is absent or local.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Half-Life Stacker.** In: compounds, cycle_length_weeks | Out: versioned formula sheet + peak_platform_days | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..6]; cycle_length_weeks:number [1..52]; injection_frequency:enum enum(daily|every-other-day|2x-week|1x-week) | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Half-Life Stacker.** In: peak_platform_days, recommended_pct_start_days | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycle_length_weeks.** In: changed cycle_length_weeks with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from peak_platform_days.** In: peak_platform_days + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + cycle_length_weeks | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Half-Life Stacker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Half-Life Stacker.** In: peak_platform_days, recommended_pct_start_days | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of peak_platform_days.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to User-Provided Molar Mass Calculator (tool-027-ester-conversion).** In: approved subset of peak_platform_days | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const peakPlatformDays = Math.ceil(maxHalfLife * 2.5);` `const totalCycleHalfLives = totalHalfLifeSum / maxHalfLife;` `const pctStartDays = Math.ceil(maxHalfLife + (cycle_length_weeks * 7) * 0.1); // 10% of cycle as buffer` `const washoutCompleteDays = Math.ceil(maxHalfLife * 4.5);`

---

### 027 — User-Provided Molar Mass Calculator

- **Stable ID:** `mrx.tool.027-ester-conversion`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-027-ester-conversion` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Educational same-amount-of-substance mass calculation from user-entered molar masses and their sources; not dose equivalence
- **Inputs:** sourceSubstanceLabel:string [1..120]; sourceMass:number [?..1] >0; sourceMassUnit:other unbounded; sourceMolarMass:number [?..1] >0; sourceMolarMassSource:string [1..200]; targetSubstanceLabel:string [1..120]; targetMolarMass:number [?..1] >0; targetMolarMassSource:string [1..200]; targetMassUnit:other unbounded
- **Outputs:** resultOrigin, method, sourceAmountInGrams, amountInMoles, targetAmountInGrams, targetAmount, targetMassUnit, sourceSubstanceLabel, targetSubstanceLabel, +4 more
- **Evidence:** component `components/tools/tool-027-ester-conversion.tsx`; engine `lib/tools/engines/tool-027-ester-conversion.ts`; schema `lib/tools/schemas/tool-027-ester-conversion.ts`; tests 3; i18n `i18n/tool-027-ester-conversion.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Half-Life Stacker (tool-022-half-life-stacker); Single-dose Fractional Decay Scenario (tool-034-compound-clearance); Testosterone and Estradiol Unit Converter (tool-035-hormone-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-027-ester-conversion with stable ID mrx.tool.027-ester-conversion.
2. Typed MolarMassConversionInputSchema exposes 9 field(s); 7 carry explicit bounds.
3. Deterministic engine exports calculateMolarMassRelationshipV7; no model-generated number overrides the engine.
4. 3 test file(s) matched; 7 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-027-ester-conversion.json exists (21 AR / 21 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Does not read the global measurement preference; unit switching is absent or local.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for User-Provided Molar Mass Calculator.** In: sourceSubstanceLabel, sourceMass | Out: versioned formula sheet + resultOrigin | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sourceSubstanceLabel.** In: sourceSubstanceLabel:string [1..120]; sourceMass:number [?..1] >0; sourceMassUnit:other unbounded; sourceMolarMass:number [?..1] >0; +5 more | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for User-Provided Molar Mass Calculator.** In: resultOrigin, method | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sourceMass.** In: changed sourceMass with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultOrigin.** In: resultOrigin + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sourceSubstanceLabel.** In: global metric/imperial preference + sourceMass | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for User-Provided Molar Mass Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for User-Provided Molar Mass Calculator.** In: resultOrigin, method | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultOrigin.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Half-Life Stacker (tool-022-half-life-stacker).** In: approved subset of resultOrigin | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const sourceAmountInGrams = validated.sourceMass * GRAMS_PER_UNIT[validated.sourceMassUnit];` `const amountInMoles = sourceAmountInGrams / validated.sourceMolarMass;` `const targetAmountInGrams = amountInMoles * validated.targetMolarMass;` `const targetAmount = targetAmountInGrams / GRAMS_PER_UNIT[validated.targetMassUnit];`

---

### 034 — Single-dose Fractional Decay Scenario

- **Stable ID:** `mrx.tool.034-compound-clearance`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-034-compound-clearance` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-sourced half-life and selected-threshold arithmetic under a single-exponential assumption; no medical clearance or safety assessment
- **Inputs:** compound_name:string [1..80]; half_life_days:number [0.5..365]; half_life_source:string [3..500]; last_dose_date:other unbounded; as_of_date:other unbounded; threshold_fraction:number [0.001..0.2] optional
- **Outputs:** days_to_threshold, threshold_date, days_elapsed, modeled_remaining_percent, threshold_reached, threshold_fraction, curve, model_note
- **Evidence:** component `components/tools/tool-034-compound-clearance.tsx`; engine `lib/tools/engines/tool-034-compound-clearance.ts`; schema `lib/tools/schemas/tool-034-compound-clearance.ts`; tests 3; i18n `i18n/tool-034-compound-clearance.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; <main> present.
- **Related:** Testosterone and Estradiol Unit Converter (tool-035-hormone-conversion); User-Provided Molar Mass Calculator (tool-027-ester-conversion); Half-Life Stacker (tool-022-half-life-stacker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-034-compound-clearance with stable ID mrx.tool.034-compound-clearance.
2. Typed ClearanceInputSchema exposes 6 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateCompoundClearance; no model-generated number overrides the engine.
4. 3 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-034-compound-clearance.json exists (25 AR / 25 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No source/provenance text is encoded in the engine.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Single-dose Fractional Decay Scenario.** In: compound_name, half_life_days | Out: versioned formula sheet + days_to_threshold | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compound_name.** In: compound_name:string [1..80]; half_life_days:number [0.5..365]; half_life_source:string [3..500]; last_dose_date:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Single-dose Fractional Decay Scenario.** In: days_to_threshold, threshold_date | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for half_life_days.** In: changed half_life_days with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from days_to_threshold.** In: days_to_threshold + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for last_dose_date.** In: global metric/imperial preference + half_life_days | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Single-dose Fractional Decay Scenario.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Single-dose Fractional Decay Scenario.** In: days_to_threshold, threshold_date | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of days_to_threshold.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Testosterone and Estradiol Unit Converter (tool-035-hormone-conversion).** In: approved subset of days_to_threshold | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);` `return \`${String(year).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}\`;` `const daysToThreshold = Math.max(1, Math.ceil(half_life_days * (Math.log(1 / threshold_fraction) / Math.log(2))));` `const thresholdDate = formatUtcCalendarDate(base + daysToThreshold * DAY_MS, 'threshold_date');`

---

### 035 — Testosterone and Estradiol Unit Converter

- **Stable ID:** `mrx.tool.035-hormone-conversion`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-035-hormone-conversion` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Molar-mass-derived conversion between testosterone and estradiol concentration units; no hormone estimation or treatment advice
- **Inputs:** analyte:enum enum(testosterone\|estradiol); value:number [0..10]; unit:enum enum(ng/dL\|nmol/L\|pg/mL\|pmol/L); measurement_date:other unbounded; reading_source:string [3..200]
- **Outputs:** status, analyte, input_value, input_unit, result_value, result_unit, measurement_date, reading_source, conversion_factor, +1 more
- **Evidence:** component `components/tools/tool-035-hormone-conversion.tsx`; engine `lib/tools/engines/tool-035-hormone-conversion.ts`; schema `lib/tools/schemas/tool-035-hormone-conversion.ts`; tests 2; i18n `i18n/tool-035-hormone-conversion.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; <main> present.
- **Related:** Single-dose Fractional Decay Scenario (tool-034-compound-clearance); User-Provided Molar Mass Calculator (tool-027-ester-conversion); Half-Life Stacker (tool-022-half-life-stacker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-035-hormone-conversion with stable ID mrx.tool.035-hormone-conversion.
2. Typed ConversionInputSchema exposes 5 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateHormoneConversion; no model-generated number overrides the engine.
4. 2 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-035-hormone-conversion.json exists (22 AR / 22 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No source/provenance text is encoded in the engine.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Testosterone and Estradiol Unit Converter.** In: analyte, value | Out: versioned formula sheet + status | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for analyte.** In: analyte:enum enum(testosterone|estradiol); value:number [0..10]; unit:enum enum(ng/dL|nmol/L|pg/mL|pmol/L); measurement_date:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Testosterone and Estradiol Unit Converter.** In: status, analyte | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for analyte.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Testosterone and Estradiol Unit Converter.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Testosterone and Estradiol Unit Converter.** In: status, analyte | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Single-dose Fractional Decay Scenario (tool-034-compound-clearance).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const TESTOSTERONE_NG_DL_TO_NMOL_L = 10 / TESTOSTERONE_MOLAR_MASS_G_MOL;` `const ESTRADIOL_PG_ML_TO_PMOL_L = 1_000 / ESTRADIOL_MOLAR_MASS_G_MOL;` `return Math.round((value + Number.EPSILON) * 10_000) / 10_000;` `return Math.round((value + Number.EPSILON) * 100_000_000) / 100_000_000;`

---

### 060 — 5-Alpha Conversion Calculator

- **Stable ID:** `mrx.tool.060-5-alpha-conversion-calculator`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-060-5-alpha-conversion-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** 5-alpha reductase conversion estimator
- **Inputs:** testosterone_ng_dl:number [50..3000]; inhibitor:enum enum(none\|finasteride_1mg\|finasteride_5mg\|dutasteride_0.5mg)
- **Outputs:** dht_estimate_ng_dl, est_conversion_pct, warnings
- **Evidence:** component `components/tools/tool-060-5-alpha-conversion-calculator.tsx`; engine `lib/tools/engines/tool-060-5-alpha-conversion-calculator.ts`; schema `lib/tools/schemas/tool-060-5-alpha-conversion-calculator.ts`; tests 1; i18n `i18n/tool-060-5-alpha-conversion-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Aromatase Conversion Calculator (tool-065-aromatase-conversion-calculator); Testosterone and Estradiol Unit Converter (tool-035-hormone-conversion); Single-dose Fractional Decay Scenario (tool-034-compound-clearance).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-060-5-alpha-conversion-calculator with stable ID mrx.tool.060-5-alpha-conversion-calculator.
2. Typed DhtConversionInputSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports estimateDhtConversion; no model-generated number overrides the engine.
4. 1 test file(s) matched; 7 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-060-5-alpha-conversion-calculator.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for 5-Alpha Conversion Calculator.** In: testosterone_ng_dl, inhibitor | Out: versioned formula sheet + dht_estimate_ng_dl | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for testosterone_ng_dl.** In: testosterone_ng_dl:number [50..3000]; inhibitor:enum enum(none|finasteride_1mg|finasteride_5mg|dutasteride_0.5mg) | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for 5-Alpha Conversion Calculator.** In: dht_estimate_ng_dl, est_conversion_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for testosterone_ng_dl.** In: changed testosterone_ng_dl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from dht_estimate_ng_dl.** In: dht_estimate_ng_dl + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for testosterone_ng_dl.** In: global metric/imperial preference + testosterone_ng_dl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for 5-Alpha Conversion Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for 5-Alpha Conversion Calculator.** In: dht_estimate_ng_dl, est_conversion_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of dht_estimate_ng_dl.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Aromatase Conversion Calculator (tool-065-aromatase-conversion-calculator).** In: approved subset of dht_estimate_ng_dl | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const dht_estimate_ng_dl = Math.round(testosterone_ng_dl * factor);` `const suppression_pct = Math.round(((BASELINE_FACTOR - factor) / BASELINE_FACTOR) * 100);`

---

### 065 — Aromatase Conversion Calculator

- **Stable ID:** `mrx.tool.065-aromatase-conversion-calculator`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-065-aromatase-conversion-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Aromatization rate estimator
- **Inputs:** testosterone_mg_week:number [25..1000]; body_fat_pct:number [5..50]; aromatase_inhibitor:enum enum(none\|anastrozole_0.5mg\|anastrozole_1mg\|letrozole_2.5mg)
- **Outputs:** e2_estimate_pg_ml, band, warnings
- **Evidence:** component `components/tools/tool-065-aromatase-conversion-calculator.tsx`; engine `lib/tools/engines/tool-065-aromatase-conversion-calculator.ts`; schema `lib/tools/schemas/tool-065-aromatase-conversion-calculator.ts`; tests 1; i18n `i18n/tool-065-aromatase-conversion-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** 5-Alpha Conversion Calculator (tool-060-5-alpha-conversion-calculator); Testosterone and Estradiol Unit Converter (tool-035-hormone-conversion); Single-dose Fractional Decay Scenario (tool-034-compound-clearance).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-065-aromatase-conversion-calculator with stable ID mrx.tool.065-aromatase-conversion-calculator.
2. Typed AromatizationInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports estimateAromatization; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-065-aromatase-conversion-calculator.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Aromatase Conversion Calculator.** In: testosterone_mg_week, body_fat_pct | Out: versioned formula sheet + e2_estimate_pg_ml | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for testosterone_mg_week.** In: testosterone_mg_week:number [25..1000]; body_fat_pct:number [5..50]; aromatase_inhibitor:enum enum(none|anastrozole_0.5mg|anastrozole_1mg|letrozole_2.5mg) | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Aromatase Conversion Calculator.** In: e2_estimate_pg_ml, band | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for testosterone_mg_week.** In: changed testosterone_mg_week with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from e2_estimate_pg_ml.** In: e2_estimate_pg_ml + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for testosterone_mg_week.** In: global metric/imperial preference + testosterone_mg_week | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Aromatase Conversion Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Aromatase Conversion Calculator.** In: e2_estimate_pg_ml, band | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of e2_estimate_pg_ml.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to 5-Alpha Conversion Calculator (tool-060-5-alpha-conversion-calculator).** In: approved subset of e2_estimate_pg_ml | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const e2_estimate_pg_ml = Math.round(testosterone_mg_week * (0.15 + body_fat_pct / 200) * AI_FACTORS[aromatase_inhibitor] * 10) / 10;`

---

### 102 — Subcutaneous vs. Intramuscular PK Modeler

- **Stable ID:** `mrx.tool.102-subcutaneous-vs-intramuscular-pk-modeler`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-102-subcutaneous-vs-intramuscular-pk-modeler` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** SubQ vs IM pharmacokinetic comparison
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** volume_ml, concentration_mg_ml, subcutaneous, intramuscular, faster_peak_route, higher_peak_route, scope_notice
- **Evidence:** component `components/tools/tool-102-subcutaneous-vs-intramuscular-pk-modeler.tsx`; engine `lib/tools/engines/tool-102-subcutaneous-vs-intramuscular-pk-modeler.ts`; schema `lib/tools/schemas/tool-102-subcutaneous-vs-intramuscular-pk-modeler.ts`; tests 1; i18n `i18n/tool-102-subcutaneous-vs-intramuscular-pk-modeler.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Aromatase Conversion Calculator (tool-065-aromatase-conversion-calculator); Lab Result Unit Converter (tool-140-dosage-unit-conversion-engine); 5-Alpha Conversion Calculator (tool-060-5-alpha-conversion-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-102-subcutaneous-vs-intramuscular-pk-modeler with stable ID mrx.tool.102-subcutaneous-vs-intramuscular-pk-modeler.
2. Deterministic engine exports batemanConcentration, estimatePeakTime, calculateSubqVsIm; no model-generated number overrides the engine.
3. 1 test file(s) matched; 2 numeric assertion(s) detected.
4. Tool-specific i18n file i18n/tool-102-subcutaneous-vs-intramuscular-pk-modeler.json exists (? AR / ? EN keys).
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No source/provenance text is encoded in the engine.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Subcutaneous vs. Intramuscular PK Modeler.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + volume_ml | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Subcutaneous vs. Intramuscular PK Modeler.** In: volume_ml, concentration_mg_ml | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from volume_ml.** In: volume_ml + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Subcutaneous vs. Intramuscular PK Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Subcutaneous vs. Intramuscular PK Modeler.** In: volume_ml, concentration_mg_ml | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of volume_ml.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Aromatase Conversion Calculator (tool-065-aromatase-conversion-calculator).** In: approved subset of volume_ml | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const ke = kePerDay / 24;` `if (Math.abs(ka - ke) < 1e-9) return (doseMg * bioavailability / volumeOfDistribution) * ke * t * Math.exp(-ke * t);` `const coeff = (doseMg * bioavailability * ka) / (volumeOfDistribution * (ka - ke));` `return coeff * (Math.exp(-ke * t) - Math.exp(-ka * t));`

---

### 140 — Lab Result Unit Converter

- **Stable ID:** `mrx.tool.140-dosage-unit-conversion-engine`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-140-dosage-unit-conversion-engine` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Published analyte-specific conventional and SI result conversions
- **Inputs:** analyte:other unbounded; value:number [0..1]; fromUnit:string unbounded; toUnit:string unbounded
- **Outputs:** analyte, analyteLabel, inputValue, outputValue, fromUnit, toUnit, factor, operation, formula, +1 more
- **Evidence:** component `components/tools/tool-140-dosage-unit-conversion-engine.tsx`; engine `lib/tools/engines/tool-140-dosage-unit-conversion-engine.v6.ts`; schema `lib/tools/schemas/tool-140-dosage-unit-conversion-engine.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **PASS** — unit-factor table and Fahrenheit offset are correct in static review; runtime independent coverage is NOT RUN.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Accumulation Half-Life Simulator (tool-151-accumulation-half-life-simulator); Injection Site Observation Log (tool-153-injection-site-rotator); Compound Observation Record (tool-154-compound-stack-builder).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-140-dosage-unit-conversion-engine with stable ID mrx.tool.140-dosage-unit-conversion-engine.
2. Typed LabResultConversionInputSchema exposes 4 field(s); 1 carry explicit bounds.
3. Deterministic engine exports convertLabResultV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 2 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — unit-factor table and Fahrenheit offset are correct in static review; runtime independent coverage is NOT RUN.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Lab Result Unit Converter.** In: analyte, value | Out: versioned formula sheet + analyte | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for analyte.** In: analyte:other unbounded; value:number [0..1]; fromUnit:string unbounded; toUnit:string unbounded | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Lab Result Unit Converter.** In: analyte, analyteLabel | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from analyte.** In: analyte + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for analyte.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Lab Result Unit Converter.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Lab Result Unit Converter.** In: analyte, analyteLabel | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of analyte.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Accumulation Half-Life Simulator (tool-151-accumulation-half-life-simulator).** In: approved subset of analyte | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const raw = forward ? parsed.value * mapping.factor : parsed.value / mapping.factor;`

---

### 151 — Accumulation Half-Life Simulator

- **Stable ID:** `mrx.tool.151-accumulation-half-life-simulator`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-151-accumulation-half-life-simulator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Deterministic half-life arithmetic scenario; not a dose or treatment recommendation.
- **Inputs:** initial_amount:number [?..100000] >=0; half_life_days:number [?..365] >0; interval_days:number [?..365] >0; simulation_days:number [1..3650] int
- **Outputs:** status, resultType, peak_amount, terminal_amount, accumulation_factor, assumptions, disclaimer
- **Evidence:** component `components/tools/tool-151-accumulation-half-life-simulator.tsx`; engine `lib/tools/engines/tool-151-accumulation-half-life-simulator.v7.ts`; schema `lib/tools/schemas/tool-151-accumulation-half-life-simulator.v7.ts`; tests 3; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Injection Site Observation Log (tool-153-injection-site-rotator); Compound Observation Record (tool-154-compound-stack-builder); Water Weight Observation (tool-156-water-retention).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-151-accumulation-half-life-simulator with stable ID mrx.tool.151-accumulation-half-life-simulator.
2. Typed AccumulationInputSchema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateAccumulationScenario; no model-generated number overrides the engine.
4. 3 test file(s) matched; 1 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Accumulation Half-Life Simulator.** In: initial_amount, half_life_days | Out: versioned formula sheet + status | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for initial_amount.** In: initial_amount:number [?..100000] >=0; half_life_days:number [?..365] >0; interval_days:number [?..365] >0; simulation_days:number [1..3650] int | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Accumulation Half-Life Simulator.** In: status, resultType | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for initial_amount.** In: changed initial_amount with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for initial_amount.** In: global metric/imperial preference + initial_amount | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Accumulation Half-Life Simulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Accumulation Half-Life Simulator.** In: status, resultType | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Site Observation Log (tool-153-injection-site-rotator).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 153 — Injection Site Observation Log

- **Stable ID:** `mrx.tool.153-injection-site-rotator`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-153-injection-site-rotator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-entered site history only; no injection instructions or safety clearance.
- **Inputs:** entries:array [?..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-153-injection-site-rotator.tsx`; engine `lib/tools/engines/tool-153-injection-site-rotator.v7.ts`; schema `lib/tools/schemas/tool-153-injection-site-rotator.v7.ts`; tests 1; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Compound Observation Record (tool-154-compound-stack-builder); Accumulation Half-Life Simulator (tool-151-accumulation-half-life-simulator); Water Weight Observation (tool-156-water-retention).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-153-injection-site-rotator with stable ID mrx.tool.153-injection-site-rotator.
2. Typed InjectionSiteRotationInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSiteRotation; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Injection Site Observation Log.** In: entries, entries | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..100] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Injection Site Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Injection Site Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Injection Site Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Compound Observation Record (tool-154-compound-stack-builder).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 154 — Compound Observation Record

- **Stable ID:** `mrx.tool.154-compound-stack-builder`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-154-compound-stack-builder` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-provided compound record only; no stack design, dose, interaction, or safety conclusion.
- **Inputs:** entries:array [?..50]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-154-compound-stack-builder.tsx`; engine `lib/tools/engines/tool-154-compound-stack-builder.v7.ts`; schema `lib/tools/schemas/tool-154-compound-stack-builder.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Injection Site Observation Log (tool-153-injection-site-rotator); Water Weight Observation (tool-156-water-retention); Accumulation Half-Life Simulator (tool-151-accumulation-half-life-simulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-154-compound-stack-builder with stable ID mrx.tool.154-compound-stack-builder.
2. Typed StackInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordCompoundStack; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Compound Observation Record.** In: entries, entries | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..50] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Compound Observation Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Compound Observation Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Compound Observation Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Site Observation Log (tool-153-injection-site-rotator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 156 — Water Weight Observation

- **Stable ID:** `mrx.tool.156-water-retention`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-156-water-retention` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Compares user-provided weights as arithmetic only; no fluid-retention diagnosis.
- **Inputs:** water_weight_kg:number [?..500] >=0; reference_weight_kg:number [?..500] >0; note:string [?..200] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-156-water-retention.tsx`; engine `lib/tools/engines/tool-156-water-retention.v7.ts`; schema `lib/tools/schemas/tool-156-water-retention.v7.ts`; tests 2; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Multi-Compound Half-Life Calculator (tool-157-multi-compound-half-life); Compound Observation Record (tool-154-compound-stack-builder); Volume Measurement Ratio (tool-158-volume-measurement).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-156-water-retention with stable ID mrx.tool.156-water-retention.
2. Typed WaterRetentionInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports recordWaterObservation; no model-generated number overrides the engine.
4. 2 test file(s) matched; 1 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Water Weight Observation.** In: water_weight_kg, reference_weight_kg | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for water_weight_kg.** In: water_weight_kg:number [?..500] >=0; reference_weight_kg:number [?..500] >0; note:string [?..200] optional | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Water Weight Observation.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for water_weight_kg.** In: changed water_weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for water_weight_kg, reference_weight_kg.** In: global metric/imperial preference + water_weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Water Weight Observation.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Water Weight Observation.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Multi-Compound Half-Life Calculator (tool-157-multi-compound-half-life).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 157 — Multi-Compound Half-Life Calculator

- **Stable ID:** `mrx.tool.157-multi-compound-half-life`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-157-multi-compound-half-life` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Independent half-life arithmetic entries with no dose, timing, or cycle interpretation.
- **Inputs:** compounds:array [1..80] >0
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-157-multi-compound-half-life.tsx`; engine `lib/tools/engines/tool-157-multi-compound-half-life.v7.ts`; schema `lib/tools/schemas/tool-157-multi-compound-half-life.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Water Weight Observation (tool-156-water-retention); Volume Measurement Ratio (tool-158-volume-measurement); Half-Life Decay Scenario (tool-159-compound-half-life-stacker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-157-multi-compound-half-life with stable ID mrx.tool.157-multi-compound-half-life.
2. Typed MultiHalfLifeInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateMultiHalfLife; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Multi-Compound Half-Life Calculator.** In: compounds, compounds | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..80] >0 | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Multi-Compound Half-Life Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for compounds.** In: changed compounds with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + compounds | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Multi-Compound Half-Life Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Multi-Compound Half-Life Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Water Weight Observation (tool-156-water-retention).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 158 — Volume Measurement Ratio

- **Stable ID:** `mrx.tool.158-volume-measurement`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-158-volume-measurement` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Generic volume ratio arithmetic; no injection-volume safety or instructions.
- **Inputs:** amount_ml:number [?..1000] >=0; container_ml:number [?..1000] >0
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-158-volume-measurement.tsx`; engine `lib/tools/engines/tool-158-volume-measurement.v7.ts`; schema `lib/tools/schemas/tool-158-volume-measurement.v7.ts`; tests 0; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Multi-Compound Half-Life Calculator (tool-157-multi-compound-half-life); Half-Life Decay Scenario (tool-159-compound-half-life-stacker); Water Weight Observation (tool-156-water-retention).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-158-volume-measurement with stable ID mrx.tool.158-volume-measurement.
2. Typed VolumeInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateVolumeRatio; no model-generated number overrides the engine.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Volume Measurement Ratio.** In: amount_ml, container_ml | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for amount_ml.** In: amount_ml:number [?..1000] >=0; container_ml:number [?..1000] >0 | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Volume Measurement Ratio.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for amount_ml.** In: changed amount_ml with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for amount_ml, container_ml.** In: global metric/imperial preference + amount_ml | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Volume Measurement Ratio.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Volume Measurement Ratio.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Multi-Compound Half-Life Calculator (tool-157-multi-compound-half-life).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 159 — Half-Life Decay Scenario

- **Stable ID:** `mrx.tool.159-compound-half-life-stacker`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-159-compound-half-life-stacker` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Mathematical decay factors only; no injection schedule or clinical interpretation.
- **Inputs:** half_lives_days:array [1..365] >0; interval_days:number [?..365] >0
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-159-compound-half-life-stacker.tsx`; engine `lib/tools/engines/tool-159-half-life-stacker.v7.ts`; schema `lib/tools/schemas/tool-159-half-life-stacker.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Volume Measurement Ratio (tool-158-volume-measurement); Multi-Compound Half-Life Calculator (tool-157-multi-compound-half-life); Water Weight Observation (tool-156-water-retention).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-159-compound-half-life-stacker with stable ID mrx.tool.159-compound-half-life-stacker.
2. Typed HalfLifeStackInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateHalfLifeScenario; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Half-Life Decay Scenario.** In: half_lives_days, interval_days | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for half_lives_days.** In: half_lives_days:array [1..365] >0; interval_days:number [?..365] >0 | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Half-Life Decay Scenario.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for interval_days.** In: changed interval_days with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for half_lives_days.** In: global metric/imperial preference + interval_days | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Half-Life Decay Scenario.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Half-Life Decay Scenario.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Volume Measurement Ratio (tool-158-volume-measurement).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 161 — Peptide Note Record

- **Stable ID:** `mrx.tool.161-peptide-protocol-planner`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-161-peptide-protocol-planner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User note only; no peptide protocol, dose, timing, or treatment advice.
- **Inputs:** name:string [1..100]; note:string [?..300] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-161-peptide-protocol-planner.tsx`; engine `lib/tools/engines/tool-161-peptide-protocol-planner.v7.ts`; schema `lib/tools/schemas/tool-161-peptide-protocol-planner.v7.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Oral Cycle Note Record (tool-162-oral-cycle-planner); Value Comparison (tool-163-trt-optimization-engine); Half-Life Decay Scenario (tool-159-compound-half-life-stacker).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-161-peptide-protocol-planner with stable ID mrx.tool.161-peptide-protocol-planner.
2. Typed PeptidePlanInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordPeptidePlan; no model-generated number overrides the engine.
4. 2 test file(s) matched; 1 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Peptide Note Record.** In: name, note | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for name.** In: name:string [1..100]; note:string [?..300] optional | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Peptide Note Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for name.** In: changed name with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for name.** In: global metric/imperial preference + name | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Peptide Note Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Peptide Note Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Oral Cycle Note Record (tool-162-oral-cycle-planner).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 162 — Oral Cycle Note Record

- **Stable ID:** `mrx.tool.162-oral-cycle-planner`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-162-oral-cycle-planner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User note only; no cycle design, liver advice, dose, or treatment recommendation.
- **Inputs:** name:string [1..100]; note:string [?..300] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-162-oral-cycle-planner.tsx`; engine `lib/tools/engines/tool-162-oral-cycle-planner.v7.ts`; schema `lib/tools/schemas/tool-162-oral-cycle-planner.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Peptide Note Record (tool-161-peptide-protocol-planner); Value Comparison (tool-163-trt-optimization-engine); Lab Observation Record (tool-164-post-cycle-bloodwork-interpreter).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-162-oral-cycle-planner with stable ID mrx.tool.162-oral-cycle-planner.
2. Typed OralCycleInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordOralCycleNote; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Oral Cycle Note Record.** In: name, note | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for name.** In: name:string [1..100]; note:string [?..300] optional | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Oral Cycle Note Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for name.** In: changed name with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for name.** In: global metric/imperial preference + name | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Oral Cycle Note Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Oral Cycle Note Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Peptide Note Record (tool-161-peptide-protocol-planner).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 163 — Value Comparison

- **Stable ID:** `mrx.tool.163-trt-optimization-engine`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-163-trt-optimization-engine` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Arithmetic comparison of user-provided values; no TRT optimization or medical recommendation.
- **Inputs:** current_value:number [?..100000] >=0; target_value:number [?..100000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-163-trt-optimization-engine.tsx`; engine `lib/tools/engines/tool-163-trt-optimization.v7.ts`; schema `lib/tools/schemas/tool-163-trt-optimization.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Oral Cycle Note Record (tool-162-oral-cycle-planner); Lab Observation Record (tool-164-post-cycle-bloodwork-interpreter); Peptide Note Record (tool-161-peptide-protocol-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-163-trt-optimization-engine with stable ID mrx.tool.163-trt-optimization-engine.
2. Typed TrtInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports compareTrtValues; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Value Comparison.** In: current_value, target_value | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for current_value.** In: current_value:number [?..100000] >=0; target_value:number [?..100000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Value Comparison.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for current_value.** In: changed current_value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for current_value.** In: global metric/imperial preference + current_value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Value Comparison.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Value Comparison.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Oral Cycle Note Record (tool-162-oral-cycle-planner).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 164 — Lab Observation Record

- **Stable ID:** `mrx.tool.164-post-cycle-bloodwork-interpreter`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-164-post-cycle-bloodwork-interpreter` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User-provided lab record only; no interpretation or reference-range judgment.
- **Inputs:** marker:string [1..100]; value:number [?..1000000]; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-164-post-cycle-bloodwork-interpreter.tsx`; engine `lib/tools/engines/tool-164-post-cycle-bloodwork.v7.ts`; schema `lib/tools/schemas/tool-164-post-cycle-bloodwork.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Value Comparison (tool-163-trt-optimization-engine); Interaction Item Record (tool-165-drug-interaction-checker-pro); Oral Cycle Note Record (tool-162-oral-cycle-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-164-post-cycle-bloodwork-interpreter with stable ID mrx.tool.164-post-cycle-bloodwork-interpreter.
2. Typed LabObservationSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports recordLabObservation; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Lab Observation Record.** In: marker, value | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for marker.** In: marker:string [1..100]; value:number [?..1000000]; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Lab Observation Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for marker.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Lab Observation Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Lab Observation Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Value Comparison (tool-163-trt-optimization-engine).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 165 — Interaction Item Record

- **Stable ID:** `mrx.tool.165-drug-interaction-checker-pro`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-165-drug-interaction-checker-pro` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-provided item list only; no interaction conclusion or safety clearance.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-165-drug-interaction-checker-pro.tsx`; engine `lib/tools/engines/tool-165-drug-interaction.v7.ts`; schema `lib/tools/schemas/tool-165-drug-interaction.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Lab Observation Record (tool-164-post-cycle-bloodwork-interpreter); Value Comparison (tool-163-trt-optimization-engine); Oral Cycle Note Record (tool-162-oral-cycle-planner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-165-drug-interaction-checker-pro with stable ID mrx.tool.165-drug-interaction-checker-pro.
2. Typed InteractionInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordInteractionItems; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Interaction Item Record.** In: items, items | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..100] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Interaction Item Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for items.** In: changed items with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + items | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Interaction Item Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Interaction Item Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Lab Observation Record (tool-164-post-cycle-bloodwork-interpreter).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 166 — Pain Note Record

- **Stable ID:** `mrx.tool.166-injection-pain-minimizer`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-166-injection-pain-minimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User note only; no pain treatment or injection instruction.
- **Inputs:** note:string [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-166-injection-pain-minimizer.tsx`; engine `lib/tools/engines/tool-166-injection-pain.v7.ts`; schema `lib/tools/schemas/tool-166-injection-pain.v7.ts`; tests 2; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Generic Unit Conversion (tool-167-ester-conversion); Item List Record (tool-168-compound-stacking-synergy); User-Selected Signal Checklist (tool-169-side-effect-early-warning).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-166-injection-pain-minimizer with stable ID mrx.tool.166-injection-pain-minimizer.
2. Typed PainInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordPainNote; no model-generated number overrides the engine.
4. 2 test file(s) matched; 2 numeric assertion(s) detected.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Pain Note Record.** In: note, note | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for note.** In: note:string [1..300] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Pain Note Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for note.** In: changed note with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for note.** In: global metric/imperial preference + note | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Pain Note Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Pain Note Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Generic Unit Conversion (tool-167-ester-conversion).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 167 — Generic Unit Conversion

- **Stable ID:** `mrx.tool.167-ester-conversion`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-167-ester-conversion` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Generic factor arithmetic only; no hormone or dose recommendation.
- **Inputs:** value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-167-ester-conversion.tsx`; engine `lib/tools/engines/tool-167-ester-conversion.v7.ts`; schema `lib/tools/schemas/tool-167-ester-conversion.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Pain Note Record (tool-166-injection-pain-minimizer); Item List Record (tool-168-compound-stacking-synergy); User-Selected Signal Checklist (tool-169-side-effect-early-warning).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-167-ester-conversion with stable ID mrx.tool.167-ester-conversion.
2. Typed ConversionInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports convertMass; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Unit Conversion.** In: value, factor | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Unit Conversion.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Unit Conversion.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Unit Conversion.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Pain Note Record (tool-166-injection-pain-minimizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 168 — Item List Record

- **Stable ID:** `mrx.tool.168-compound-stacking-synergy`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-168-compound-stacking-synergy` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User list only; no synergy or compatibility conclusion.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-168-compound-stacking-synergy.tsx`; engine `lib/tools/engines/tool-168-stacking-synergy.v7.ts`; schema `lib/tools/schemas/tool-168-stacking-synergy.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Generic Unit Conversion (tool-167-ester-conversion); User-Selected Signal Checklist (tool-169-side-effect-early-warning); Pain Note Record (tool-166-injection-pain-minimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-168-compound-stacking-synergy with stable ID mrx.tool.168-compound-stacking-synergy.
2. Typed SynergyInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordStackItems; no model-generated number overrides the engine.
4. Renders a <main> landmark; the route shell does not have to supply it.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Item List Record.** In: items, items | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..100] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Item List Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for items.** In: changed items with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + items | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Item List Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Item List Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Generic Unit Conversion (tool-167-ester-conversion).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 169 — User-Selected Signal Checklist

- **Stable ID:** `mrx.tool.169-side-effect-early-warning`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-169-side-effect-early-warning` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Echoes only user-written labels explicitly selected by the user; no curated medical rules, prediction, diagnosis, or safety conclusion.
- **Inputs:** signals:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-169-side-effect-early-warning.tsx`; engine `lib/tools/engines/tool-169-early-warning.v7.ts`; schema `lib/tools/schemas/tool-169-early-warning.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Item List Record (tool-168-compound-stacking-synergy); Cost Sum Calculator (tool-170-cycle-cost); Generic Unit Conversion (tool-167-ester-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-169-side-effect-early-warning with stable ID mrx.tool.169-side-effect-early-warning.
2. Typed WarningInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports matchExplicitWarnings; no model-generated number overrides the engine.
4. Renders a <main> landmark; the route shell does not have to supply it.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for User-Selected Signal Checklist.** In: signals, signals | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for signals.** In: signals:array [1..100] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for User-Selected Signal Checklist.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for signals.** In: changed signals with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for signals.** In: global metric/imperial preference + signals | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for User-Selected Signal Checklist.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for User-Selected Signal Checklist.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Item List Record (tool-168-compound-stacking-synergy).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 170 — Cost Sum Calculator

- **Stable ID:** `mrx.tool.170-cycle-cost`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-170-cycle-cost` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Arithmetic cost sum only; no cycle or purchase recommendation.
- **Inputs:** items:array [1..100] >=0; currency:string [1..10]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-170-cycle-cost.tsx`; engine `lib/tools/engines/tool-170-cycle-cost.v7.ts`; schema `lib/tools/schemas/tool-170-cycle-cost.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** User-Selected Signal Checklist (tool-169-side-effect-early-warning); Item List Record (tool-168-compound-stacking-synergy); Generic Unit Conversion (tool-167-ester-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-170-cycle-cost with stable ID mrx.tool.170-cycle-cost.
2. Typed CostInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateCost; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cost Sum Calculator.** In: items, currency | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..100] >=0; currency:string [1..10] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cost Sum Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for items.** In: changed items with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + items | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cost Sum Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cost Sum Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to User-Selected Signal Checklist (tool-169-side-effect-early-warning).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 171 — Interval Record

- **Stable ID:** `mrx.tool.171-cycle-length-optimizer`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-171-cycle-length-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User date interval record only; no cycle optimization or recommendation.
- **Inputs:** start:string unbounded; end:string unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-171-cycle-length-optimizer.tsx`; engine `lib/tools/engines/tool-171-cycle-length.v7.ts`; schema `lib/tools/schemas/tool-171-cycle-length.v7.ts`; tests 1; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Value Delta (tool-172-bloodwork-trend-analyzer); Decay Scenario (tool-173-compound-clearance); Unit Conversion (tool-174-hormone-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-171-cycle-length-optimizer with stable ID mrx.tool.171-cycle-length-optimizer.
2. Typed CycleIntervalSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports recordCycleInterval; no model-generated number overrides the engine.
4. 1 test file(s) matched; 2 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Interval Record.** In: current start record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Interval Record.** In: start | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — CycleIntervalSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Interval Record.** In: recorded start | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Interval Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Interval Record.** In: start | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Interval Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Interval Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Interval Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Interval Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Value Delta (tool-172-bloodwork-trend-analyzer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 172 — Value Delta

- **Stable ID:** `mrx.tool.172-bloodwork-trend-analyzer`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-172-bloodwork-trend-analyzer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** Arithmetic first-to-last delta only; no laboratory interpretation.
- **Inputs:** values:array [1..1000000]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-172-bloodwork-trend-analyzer.tsx`; engine `lib/tools/engines/tool-172-bloodwork-trend.v7.ts`; schema `lib/tools/schemas/tool-172-bloodwork-trend.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Interval Record (tool-171-cycle-length-optimizer); Decay Scenario (tool-173-compound-clearance); Unit Conversion (tool-174-hormone-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-172-bloodwork-trend-analyzer with stable ID mrx.tool.172-bloodwork-trend-analyzer.
2. Typed TrendSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateTrendDelta; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 1000000 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Value Delta.** In: current values record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Value Delta.** In: values | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — TrendSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Value Delta.** In: recorded values | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Value Delta.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Value Delta.** In: values | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Value Delta.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Value Delta.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Value Delta.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Value Delta.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Interval Record (tool-171-cycle-length-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 173 — Decay Scenario

- **Stable ID:** `mrx.tool.173-compound-clearance`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-173-compound-clearance` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Mathematical half-life decay scenario without clearance guarantee.
- **Inputs:** half_life_days:number [?..365] >0; elapsed_days:number [?..3650] >=0
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-173-compound-clearance.tsx`; engine `lib/tools/engines/tool-173-compound-clearance.v7.ts`; schema `lib/tools/schemas/tool-173-compound-clearance.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Value Delta (tool-172-bloodwork-trend-analyzer); Unit Conversion (tool-174-hormone-conversion); Interval Record (tool-171-cycle-length-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-173-compound-clearance with stable ID mrx.tool.173-compound-clearance.
2. Typed ClearanceSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateDecay; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Contains a what-if/scenario/sensitivity surface.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Decay Scenario.** In: half_life_days, elapsed_days | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for half_life_days.** In: half_life_days:number [?..365] >0; elapsed_days:number [?..3650] >=0 | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Decay Scenario.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for half_life_days.** In: changed half_life_days with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for half_life_days.** In: global metric/imperial preference + half_life_days | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Decay Scenario.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Decay Scenario.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Value Delta (tool-172-bloodwork-trend-analyzer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 174 — Unit Conversion

- **Stable ID:** `mrx.tool.174-hormone-conversion`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-174-hormone-conversion` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Generic labeled-unit arithmetic only; no hormone dose recommendation.
- **Inputs:** value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-174-hormone-conversion.tsx`; engine `lib/tools/engines/tool-174-hormone-conversion.v7.ts`; schema `lib/tools/schemas/tool-174-hormone-conversion.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Decay Scenario (tool-173-compound-clearance); Date Record (tool-175-injection-schedule-planner); Value Delta (tool-172-bloodwork-trend-analyzer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-174-hormone-conversion with stable ID mrx.tool.174-hormone-conversion.
2. Typed HormoneUnitSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports convertLabeledUnit; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Unit Conversion.** In: value, factor | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Unit Conversion.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Unit Conversion.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Unit Conversion.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Decay Scenario (tool-173-compound-clearance).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 175 — Date Record

- **Stable ID:** `mrx.tool.175-injection-schedule-planner`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-175-injection-schedule-planner` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User-entered dates only; no generated injection schedule or timing advice.
- **Inputs:** dates:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-175-injection-schedule-planner.tsx`; engine `lib/tools/engines/tool-175-injection-schedule.v7.ts`; schema `lib/tools/schemas/tool-175-injection-schedule.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Unit Conversion (tool-174-hormone-conversion); Decay Scenario (tool-173-compound-clearance); Value Delta (tool-172-bloodwork-trend-analyzer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-175-injection-schedule-planner with stable ID mrx.tool.175-injection-schedule-planner.
2. Typed ScheduleRecordSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordScheduleDates; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 100 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Date Record.** In: current dates record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Date Record.** In: dates | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — ScheduleRecordSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Date Record.** In: recorded dates | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Date Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Date Record.** In: dates | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Date Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Date Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Date Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Date Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Unit Conversion (tool-174-hormone-conversion).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 176 — Symptom Note Record

- **Stable ID:** `mrx.tool.176-side-effect-probability`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-176-side-effect-probability` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note only; no probability estimate or prediction.
- **Inputs:** label:string [1..100]; note:string [?..200] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-176-side-effect-probability.tsx`; engine `lib/tools/engines/tool-176-side-effect-probability.v7.ts`; schema `lib/tools/schemas/tool-176-side-effect-probability.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Compatibility Item Record (tool-177-stack-compatibility-checker); Date Record (tool-175-injection-schedule-planner); Unit Conversion (tool-174-hormone-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-176-side-effect-probability with stable ID mrx.tool.176-side-effect-probability.
2. Typed ProbabilityRecordSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports recordProbabilityNote; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Captures up to 100 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Symptom Note Record.** In: current label record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Symptom Note Record.** In: label | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — ProbabilityRecordSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Symptom Note Record.** In: recorded label | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Symptom Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Symptom Note Record.** In: label | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Symptom Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Symptom Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Symptom Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Symptom Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Compatibility Item Record (tool-177-stack-compatibility-checker).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 177 — Compatibility Item Record

- **Stable ID:** `mrx.tool.177-stack-compatibility-checker`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-177-stack-compatibility-checker` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User list only; no compatibility or safety conclusion.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-177-stack-compatibility-checker.tsx`; engine `lib/tools/engines/tool-177-stack-compatibility.v7.ts`; schema `lib/tools/schemas/tool-177-stack-compatibility.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Symptom Note Record (tool-176-side-effect-probability); Date Record (tool-175-injection-schedule-planner); Unit Conversion (tool-174-hormone-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-177-stack-compatibility-checker with stable ID mrx.tool.177-stack-compatibility-checker.
2. Typed CompatibilityRecordSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordCompatibilityItems; no model-generated number overrides the engine.
4. Captures up to 100 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Compatibility Item Record.** In: current items record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Compatibility Item Record.** In: items | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — CompatibilityRecordSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Compatibility Item Record.** In: recorded items | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Compatibility Item Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Compatibility Item Record.** In: items | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Compatibility Item Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Compatibility Item Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Compatibility Item Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Compatibility Item Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Symptom Note Record (tool-176-side-effect-probability).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 185 — Generic Amount Arithmetic

- **Stable ID:** `mrx.tool.185-peptide-dosage`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-185-peptide-dosage` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Generic labeled amount arithmetic only; not a peptide dosage recommendation.
- **Inputs:** value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-185-peptide-dosage.tsx`; engine `lib/tools/engines/tool-185-peptide-dosage.v7.ts`; schema `lib/tools/schemas/tool-185-peptide-dosage.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Androgen Item Record (tool-189-androgenic-balance); Receptor Note Record (tool-190-androgen-receptor-optimizer); Generic Unit Arithmetic (tool-191-5-alpha-conversion).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-185-peptide-dosage with stable ID mrx.tool.185-peptide-dosage.
2. Typed DoseArithmeticSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateLabeledAmount; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Amount Arithmetic.** In: value, factor | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Amount Arithmetic.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Amount Arithmetic.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Amount Arithmetic.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Androgen Item Record (tool-189-androgenic-balance).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 189 — Androgen Item Record

- **Stable ID:** `mrx.tool.189-androgenic-balance`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-189-androgenic-balance` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User item record only; no balance score or recommendation.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-189-androgenic-balance.tsx`; engine `lib/tools/engines/tool-189-androgenic-balance.v7.ts`; schema `lib/tools/schemas/tool-189-androgenic-balance.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Receptor Note Record (tool-190-androgen-receptor-optimizer); Generic Unit Arithmetic (tool-191-5-alpha-conversion); Generic Amount Arithmetic (tool-185-peptide-dosage).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-189-androgenic-balance with stable ID mrx.tool.189-androgenic-balance.
2. Typed BalanceSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordAndrogenItems; no model-generated number overrides the engine.
4. Captures up to 100 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Androgen Item Record.** In: current items record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Androgen Item Record.** In: items | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — BalanceSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Androgen Item Record.** In: recorded items | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Androgen Item Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Androgen Item Record.** In: items | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Androgen Item Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Androgen Item Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Androgen Item Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Androgen Item Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Receptor Note Record (tool-190-androgen-receptor-optimizer).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 190 — Receptor Note Record

- **Stable ID:** `mrx.tool.190-androgen-receptor-optimizer`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-190-androgen-receptor-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User note record only; no receptor optimization or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-190-androgen-receptor-optimizer.tsx`; engine `lib/tools/engines/tool-190-receptor-optimizer.v7.ts`; schema `lib/tools/schemas/tool-190-receptor-optimizer.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Androgen Item Record (tool-189-androgenic-balance); Generic Unit Arithmetic (tool-191-5-alpha-conversion); Generic Amount Arithmetic (tool-185-peptide-dosage).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-190-androgen-receptor-optimizer with stable ID mrx.tool.190-androgen-receptor-optimizer.
2. Typed ReceptorNoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordReceptorNote; no model-generated number overrides the engine.
4. Contains a what-if/scenario/sensitivity surface.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Receptor Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Receptor Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — ReceptorNoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Receptor Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Receptor Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Receptor Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Receptor Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Receptor Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Receptor Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Receptor Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Androgen Item Record (tool-189-androgenic-balance).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 191 — Generic Unit Arithmetic

- **Stable ID:** `mrx.tool.191-5-alpha-conversion`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-191-5-alpha-conversion` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Labeled unit arithmetic only; no 5-alpha conversion advice.
- **Inputs:** value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-191-5-alpha-conversion.tsx`; engine `lib/tools/engines/tool-191-alpha-conversion.v7.ts`; schema `lib/tools/schemas/tool-191-alpha-conversion.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Receptor Note Record (tool-190-androgen-receptor-optimizer); Androgen Item Record (tool-189-androgenic-balance); Generic Amount Arithmetic (tool-185-peptide-dosage).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-191-5-alpha-conversion with stable ID mrx.tool.191-5-alpha-conversion.
2. Typed AlphaSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports convertAlpha; no model-generated number overrides the engine.
4. 1 test file(s) matched; 1 numeric assertion(s) detected.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Unit Arithmetic.** In: value, factor | Out: versioned formula sheet + the displayed result | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Unit Arithmetic.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Unit Arithmetic.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Unit Arithmetic.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Receptor Note Record (tool-190-androgen-receptor-optimizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 226 — Transition Note Record

- **Stable ID:** `mrx.tool.226-sarm-to-aas-transition-predictor`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-226-sarm-to-aas-transition-predictor` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-226-sarm-to-aas-transition-predictor.tsx`; engine `lib/tools/engines/tool-226-sarm-transition.v7.ts`; schema `lib/tools/schemas/tool-226-sarm-transition.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Route Note Record (tool-227-subq-vs-im-pk-modeler); Generic Unit Arithmetic (tool-191-5-alpha-conversion); Receptor Note Record (tool-190-androgen-receptor-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-226-sarm-to-aas-transition-predictor with stable ID mrx.tool.226-sarm-to-aas-transition-predictor.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordSarmTransition; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Transition Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Transition Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Transition Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Transition Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Transition Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Transition Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Transition Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Transition Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Transition Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Route Note Record (tool-227-subq-vs-im-pk-modeler).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 227 — Route Note Record

- **Stable ID:** `mrx.tool.227-subq-vs-im-pk-modeler`
- **Category / route / status:** Pharmacokinetics · `/smarttools/pharmacokinetics/tool-227-subq-vs-im-pk-modeler` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-227-subq-vs-im-pk-modeler.tsx`; engine `lib/tools/engines/tool-227-route-pk.v7.ts`; schema `lib/tools/schemas/tool-227-route-pk.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Transition Note Record (tool-226-sarm-to-aas-transition-predictor); Generic Unit Arithmetic (tool-191-5-alpha-conversion); Receptor Note Record (tool-190-androgen-receptor-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/pharmacokinetics/tool-227-subq-vs-im-pk-modeler with stable ID mrx.tool.227-subq-vs-im-pk-modeler.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordRouteNote; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 400 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Route Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Route Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Route Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Route Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Route Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Route Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: product label or peer-reviewed PK parameters; model form must be stated (one-compartment, first-order) | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Route Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Route Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Route Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Transition Note Record (tool-226-sarm-to-aas-transition-predictor).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---
