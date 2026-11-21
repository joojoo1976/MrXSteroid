# R5 255-TOOL PER-TOOL DOSSIERS — CYCLE MANAGEMENT

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 13 catalog entries in this category (13 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — Cycle Architect

- **Stable ID:** `mrx.tool.cycle`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/cycle` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Comprehensive cycle planning and optimization
- **Inputs:** compounds:array [1..6]; cycleLengthWeeks:number [4..20] int; userWeightKg:number [40..200] optional; userHeightCm:number [140..220] optional; experienceLevel:enum enum(beginner\|intermediate\|advanced); goal:enum enum(bulk\|cut\|recomp\|strength)
- **Outputs:** totalWeeklyMg, totalCycleMg, mgPerKgPerWeek, longestHalfLifeDays, averageHalfLifeWeightedDays, pctStartDayAfterLastPin, peakTroughRatio, compoundsSummary, warnings, +2 more
- **Evidence:** component `components/tools/cycle.tsx`; engine `lib/tools/engines/cycle.ts`; schema `lib/tools/schemas/cycle.ts`; tests 6; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** PCT Timing Engine (pct-timing); Compound Stack Builder (tool-010-compound-stack-builder); Peptide Protocol Planner (tool-021-peptide-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/cycle with stable ID mrx.tool.cycle.
2. Typed CycleInputSchema exposes 6 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateCycleArchitect; no model-generated number overrides the engine.
4. 6 test file(s) matched; 35 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cycle Architect.** In: compounds, cycleLengthWeeks | Out: versioned formula sheet + totalWeeklyMg | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..6]; cycleLengthWeeks:number [4..20] int; userWeightKg:number [40..200] optional; userHeightCm:number [140..220] optional; +2 more | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cycle Architect.** In: totalWeeklyMg, totalCycleMg | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycleLengthWeeks.** In: changed cycleLengthWeeks with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from totalWeeklyMg.** In: totalWeeklyMg + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for userWeightKg, userHeightCm.** In: global metric/imperial preference + cycleLengthWeeks | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cycle Architect.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cycle Architect.** In: totalWeeklyMg, totalCycleMg | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of totalWeeklyMg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to PCT Timing Engine (pct-timing).** In: approved subset of totalWeeklyMg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `totalWeeklyMg: Math.round(input.compounds.reduce((s, c) => s + c.doseMg * c.frequencyPerWeek, 0)),` `totalCycleMg: Math.round(input.compounds.reduce((s, c) => s + c.doseMg * c.frequencyPerWeek * c.weeks, 0)),`

---

### NAMED — PCT Timing Engine

- **Stable ID:** `mrx.tool.pct-timing`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/pct-timing` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Washout engine and PCT scheduling
- **Inputs:** compoundHalfLifeDays:number unbounded; weeksOnCycle:number [4..24] int; clearanceThresholdPct:number [1..20]; pctProtocol:other unbounded; bioModifiers:other optional; lastInjectionDateIso:string optional
- **Outputs:** timeline, dailyWashout, washoutWeeks, washoutDays, pctStartWeek, pctDurationWeeks, fullRecoveryWeek, totalTimelineWeeks, finalTestosteronePct, +9 more
- **Evidence:** component `components/tools/pct-timing.tsx`; engine `lib/tools/engines/pct-timing.ts`; schema `lib/tools/schemas/pct-timing.ts`; tests 2; i18n none; measurement yes; narrative no; AI result context no; sliders 3.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; no ARIA; no <main>.
- **Related:** Cycle Architect (cycle); Compound Stack Builder (tool-010-compound-stack-builder); Peptide Protocol Planner (tool-021-peptide-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/pct-timing with stable ID mrx.tool.pct-timing.
2. Typed PctTimingInputSchema exposes 6 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateEffectiveHalfLife, getOrganClearanceMultiplier, serumPctAfter; no model-generated number overrides the engine.
4. 2 test file(s) matched; 12 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No result narrative/interpretation was detected.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for PCT Timing Engine.** In: compoundHalfLifeDays, weeksOnCycle | Out: versioned formula sheet + timeline | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compoundHalfLifeDays.** In: compoundHalfLifeDays:number unbounded; weeksOnCycle:number [4..24] int; clearanceThresholdPct:number [1..20]; pctProtocol:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for PCT Timing Engine.** In: timeline, dailyWashout | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for compoundHalfLifeDays.** In: changed compoundHalfLifeDays with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from timeline.** In: timeline + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compoundHalfLifeDays.** In: global metric/imperial preference + compoundHalfLifeDays | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for PCT Timing Engine.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for PCT Timing Engine.** In: timeline, dailyWashout | Out: one labelled chart/table with alt text | Source: engine values | State: PARTIAL — visual detected | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of timeline.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cycle Architect (cycle).** In: approved subset of timeline | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const round2 = (value: number): number => Math.round(value * 100) / 100;` `Math.min(Math.max(value, min), max);` `const v = Number.isFinite(value) ? Math.round(value) : fallback;` `return clamp(Math.round(v), min, max);`

---

### 010 — Compound Stack Builder

- **Stable ID:** `mrx.tool.010-compound-stack-builder`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-010-compound-stack-builder` · **FAIL** (unsafe medical/AI recommendation string in shipped UI)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Build stacks with synergy scoring
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-010-compound-stack-builder.tsx`; engine `lib/tools/engines/tool-010-compound-stack-builder.ts`; schema `lib/tools/schemas/tool-010-compound-stack-builder.ts`; tests 5; i18n `i18n/tool-010-compound-stack-builder.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **FAIL** — engine file declares types only (no calculation function). The component computes inline with arbitrary aromatization weights, labels an estradiol equivalent in mg, and emits unsafe aromatase-inhibitor advice at line 105.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** PCT Timing Engine (pct-timing); Peptide Protocol Planner (tool-021-peptide-protocol); Cycle Architect (cycle).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-010-compound-stack-builder with stable ID mrx.tool.010-compound-stack-builder.
2. 5 test file(s) matched; 28 numeric assertion(s) detected.
3. Tool-specific i18n file i18n/tool-010-compound-stack-builder.json exists (16 AR / 16 EN keys).
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status FAIL: engine file declares types only (no calculation function). The component computes inline with arbitrary aromatization weights, labels an estradiol equivalent in mg, and emits unsafe aromatase-inhibitor advice at line 105.
2. Shipped UI contains an unsafe AI/aromatase-inhibitor recommendation; this is a release blocker.
3. UI claims an unavailable Supabase Edge AI service, so the AI capability description is false.
4. Engine file has no exported calculation function; logic is inline and not independently testable.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Compound Stack Builder.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Compound Stack Builder.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Compound Stack Builder.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Compound Stack Builder.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to PCT Timing Engine (pct-timing).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const avgAromatization = totalWeightedAromatization / Math.max(1, compounds.reduce((s, c) => s + c.weekly_dose_mg, 0));` `const estrogenEstimate = Math.round((totalWeightedAromatization / 100) * 10) / 10;` `setWeeklyDose(isMetric ? Math.round(safe) : Math.round(ozToMg(safe) * 10) / 10);`

---

### 021 — Peptide Protocol Planner

- **Stable ID:** `mrx.tool.021-peptide-protocol`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-021-peptide-protocol` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Peptide dosing and scheduling
- **Inputs:** user_weight_kg:number [40..300]; target_compounds:array [1..5]; goal:enum enum(recovery\|muscle_growth\|fat_loss\|anti_aging); protocol_duration_weeks:number [1..52]; injection_frequency:enum enum(daily\|every-other-day\|3x-week\|weekly)
- **Outputs:** daily_dose_mcg, total_cycle_dose_mg, injection_frequency_days, total_injections, protocol_weeks, timing_recommendations, storage_requirements, side_effect_warnings, post_protocol_therapy
- **Evidence:** component `components/tools/tool-021-peptide-protocol.tsx`; engine `lib/tools/engines/tool-021-peptide-protocol.ts`; schema `lib/tools/schemas/tool-021-peptide-protocol.ts`; tests 1; i18n `i18n/tool-021-peptide-protocol.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; no <main>.
- **Related:** Compound Scenario Comparison Worksheet (tool-028-stacking-synergy); Cycle Cost Calculator (tool-030-cycle-cost-calculator); Cycle Length Optimizer (tool-031-cycle-length-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-021-peptide-protocol with stable ID mrx.tool.021-peptide-protocol.
2. Typed PeptideProtocolInputSchema exposes 5 field(s); 3 carry explicit bounds.
3. Deterministic engine exports isValidPeptideWeightKg, calculatePeptideProtocol; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-021-peptide-protocol.json exists (31 AR / 31 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Peptide Protocol Planner.** In: user_weight_kg, target_compounds | Out: versioned formula sheet + daily_dose_mcg | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for user_weight_kg.** In: user_weight_kg:number [40..300]; target_compounds:array [1..5]; goal:enum enum(recovery|muscle_growth|fat_loss|anti_aging); protocol_duration_weeks:number [1..52]; +1 more | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Peptide Protocol Planner.** In: daily_dose_mcg, total_cycle_dose_mg | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for user_weight_kg.** In: changed user_weight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from daily_dose_mcg.** In: daily_dose_mcg + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for user_weight_kg.** In: global metric/imperial preference + user_weight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Peptide Protocol Planner.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Peptide Protocol Planner.** In: daily_dose_mcg, total_cycle_dose_mg | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of daily_dose_mcg.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Compound Scenario Comparison Worksheet (tool-028-stacking-synergy).** In: approved subset of daily_dose_mcg | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const totalInjections = Math.ceil(protocol_duration_weeks * 7 / daysBetween);` `const baseDose_mcg = compound.default_dose_mcg_kg * user_weight_kg;` `const adjustedDose_mcg = baseDose_mcg * goalMultiplier;` `dose_mcg: Math.round(adjustedDose_mcg * 10) / 10,`

---

### 028 — Compound Scenario Comparison Worksheet

- **Stable ID:** `mrx.tool.028-stacking-synergy`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-028-stacking-synergy` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Manual side-by-side display of two user-entered item lists; no synergy or compatibility assessment
- **Inputs:** scenarioA:other unbounded; scenarioB:other unbounded
- **Outputs:** resultOrigin, assessment, reason, scenarioA, scenarioB
- **Evidence:** component `components/tools/tool-028-stacking-synergy.tsx`; engine `lib/tools/engines/tool-028-stacking-synergy.ts`; schema `lib/tools/schemas/tool-028-stacking-synergy.ts`; tests 3; i18n `i18n/tool-028-stacking-synergy.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Cycle Cost Calculator (tool-030-cycle-cost-calculator); Cycle Length Optimizer (tool-031-cycle-length-optimizer); Peptide Protocol Planner (tool-021-peptide-protocol).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-028-stacking-synergy with stable ID mrx.tool.028-stacking-synergy.
2. Typed StackComparisonInputSchema exposes 2 field(s); 0 carry explicit bounds.
3. Deterministic engine exports buildStackComparisonWorksheetV7; no model-generated number overrides the engine.
4. 3 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-028-stacking-synergy.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 3 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Compound Scenario Comparison Worksheet.** In: scenarioA, scenarioB | Out: versioned formula sheet + resultOrigin | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for scenarioA.** In: scenarioA:other unbounded; scenarioB:other unbounded | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Compound Scenario Comparison Worksheet.** In: resultOrigin, assessment | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for scenarioA.** In: changed scenarioA with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultOrigin.** In: resultOrigin + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for scenarioA.** In: global metric/imperial preference + scenarioA | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Compound Scenario Comparison Worksheet.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Compound Scenario Comparison Worksheet.** In: resultOrigin, assessment | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultOrigin.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cycle Cost Calculator (tool-030-cycle-cost-calculator).** In: approved subset of resultOrigin | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);`

---

### 030 — Cycle Cost Calculator

- **Stable ID:** `mrx.tool.030-cycle-cost`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-030-cycle-cost-calculator` · **FAIL** (confirmed formula/provenance defect (see formula status))
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Financial planning for cycles
- **Inputs:** cycle_weeks:number [1..52]; compounds:array [1..6]; pct_duration_weeks:number [1..26]; ancillary_compounds:array [0..10]
- **Outputs:** total_compound_cost_usd, total_ancillary_cost_usd, total_pct_cost_usd, grand_total_usd, cost_breakdown, cost_per_week_usd, most_expensive_compound, budget_savings_tips
- **Evidence:** component `components/tools/tool-030-cycle-cost-calculator.tsx`; engine `lib/tools/engines/tool-030-cycle-cost-calculator.ts`; schema `lib/tools/schemas/tool-030-cycle-cost-calculator.ts`; tests 2; i18n `i18n/tool-030-cycle-cost-calculator.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **FAIL** — PCT cost is hardcoded at $50/$60 per week with no source; budget_savings_tips is empty; no provenance or scenario method.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Cycle Length Optimizer (tool-031-cycle-length-optimizer); Compound Scenario Comparison Worksheet (tool-028-stacking-synergy); Stack Compatibility Checker (tool-038-stack-compatibility).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-030-cycle-cost-calculator with stable ID mrx.tool.030-cycle-cost.
2. Typed CycleCostInputSchema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports calculateCycleCost; no model-generated number overrides the engine.
4. 2 test file(s) matched; 8 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-030-cycle-cost-calculator.json exists (23 AR / 23 EN keys).

**Five evidence-backed gaps**
1. Formula status FAIL: PCT cost is hardcoded at $50/$60 per week with no source; budget_savings_tips is empty; no provenance or scenario method.
2. Does not read the global measurement preference; unit switching is absent or local.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cycle Cost Calculator.** In: cycle_weeks, compounds | Out: versioned formula sheet + total_compound_cost_usd | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for cycle_weeks.** In: cycle_weeks:number [1..52]; compounds:array [1..6]; pct_duration_weeks:number [1..26]; ancillary_compounds:array [0..10] | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cycle Cost Calculator.** In: total_compound_cost_usd, total_ancillary_cost_usd | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycle_weeks.** In: changed cycle_weeks with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from total_compound_cost_usd.** In: total_compound_cost_usd + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for cycle_weeks.** In: global metric/imperial preference + cycle_weeks | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cycle Cost Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cycle Cost Calculator.** In: total_compound_cost_usd, total_ancillary_cost_usd | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of total_compound_cost_usd.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cycle Length Optimizer (tool-031-cycle-length-optimizer).** In: approved subset of total_compound_cost_usd | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const roundCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;` `const clomidCost = roundCurrency(pctWeeks * 50); // Assumed $50/week` `const nolvadexCost = roundCurrency(pctWeeks * 60); // Assumed $60/week` `const costPerWeek = roundCurrency(grandTotal / (cycle_weeks + pctWeeks));`

---

### 031 — Cycle Length Optimizer

- **Stable ID:** `mrx.tool.031-cycle-length-optimizer`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-031-cycle-length-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Optimal cycle duration calculator
- **Inputs:** goal:enum enum(bulk\|cut\|recomp\|strength); experience:enum enum(beginner\|intermediate\|advanced); previous_cycles:number [0..30] int; compounds:array [1..8]
- **Outputs:** min_weeks, optimal_weeks, max_weeks, suppression_load, ester_bottleneck_days, rationale
- **Evidence:** component `components/tools/tool-031-cycle-length-optimizer.tsx`; engine `lib/tools/engines/tool-031-cycle-length-optimizer.ts`; schema `lib/tools/schemas/tool-031-cycle-length-optimizer.ts`; tests 2; i18n `i18n/tool-031-cycle-length-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cycle Cost Calculator (tool-030-cycle-cost-calculator); Compound Scenario Comparison Worksheet (tool-028-stacking-synergy); Stack Compatibility Checker (tool-038-stack-compatibility).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-031-cycle-length-optimizer with stable ID mrx.tool.031-cycle-length-optimizer.
2. Typed CycleLengthInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateCycleLength; no model-generated number overrides the engine.
4. 2 test file(s) matched; 14 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-031-cycle-length-optimizer.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cycle Length Optimizer.** In: goal, experience | Out: versioned formula sheet + min_weeks | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for goal.** In: goal:enum enum(bulk|cut|recomp|strength); experience:enum enum(beginner|intermediate|advanced); previous_cycles:number [0..30] int; compounds:array [1..8] | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cycle Length Optimizer.** In: min_weeks, optimal_weeks | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for previous_cycles.** In: changed previous_cycles with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from min_weeks.** In: min_weeks + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for goal.** In: global metric/imperial preference + previous_cycles | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cycle Length Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cycle Length Optimizer.** In: min_weeks, optimal_weeks | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of min_weeks.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cycle Cost Calculator (tool-030-cycle-cost-calculator).** In: approved subset of min_weeks | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `suppressionLoad = Math.round(suppressionLoad * 100) / 100;` `maxWeeks = Math.min(maxWeeks, 10);` `optimal = Math.max(minWeeks, Math.min(maxWeeks, optimal));`

---

### 038 — Stack Compatibility Checker

- **Stable ID:** `mrx.tool.038-stack-compatibility`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-038-stack-compatibility` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Compound compatibility matrix
- **Inputs:** items:array [1..10]
- **Outputs:** score_0_100, verdict, flags, androgen_burden_mg_per_week
- **Evidence:** component `components/tools/tool-038-stack-compatibility.tsx`; engine `lib/tools/engines/tool-038-stack-compatibility.ts`; schema `lib/tools/schemas/tool-038-stack-compatibility.ts`; tests 1; i18n `i18n/tool-038-stack-compatibility.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cycle Length Optimizer (tool-031-cycle-length-optimizer); Cycle Break Planner (tool-045-cycle-break-planner); Cycle Cost Calculator (tool-030-cycle-cost-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-038-stack-compatibility with stable ID mrx.tool.038-stack-compatibility.
2. Typed StackCompatibilityInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports checkStackCompatibility; no model-generated number overrides the engine.
4. 1 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-038-stack-compatibility.json exists (7 AR / 7 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Stack Compatibility Checker.** In: items, items | Out: versioned formula sheet + score_0_100 | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..10] | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Stack Compatibility Checker.** In: score_0_100, verdict | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for items.** In: changed items with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from score_0_100.** In: score_0_100 + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + items | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Stack Compatibility Checker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Stack Compatibility Checker.** In: score_0_100, verdict | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of score_0_100.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cycle Length Optimizer (tool-031-cycle-length-optimizer).** In: approved subset of score_0_100 | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.max(0, Math.min(100, score));`

---

### 045 — Cycle Break Planner

- **Stable ID:** `mrx.tool.045-cycle-break-planner`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-045-cycle-break-planner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Off-cycle recovery planner
- **Inputs:** cycle_weeks_used:number [4..52] int; compounds:array [1..8]; wants_bloodwork:other unbounded
- **Outputs:** days_to_full_clear, total_weeks_to_baseline, warnings
- **Evidence:** component `components/tools/tool-045-cycle-break-planner.tsx`; engine `lib/tools/engines/tool-045-cycle-break-planner.ts`; schema `lib/tools/schemas/tool-045-cycle-break-planner.ts`; tests 1; i18n `i18n/tool-045-cycle-break-planner.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Stack Compatibility Checker (tool-038-stack-compatibility); Mini PCT Calculator (tool-056-mini-pct-calculator); Cycle Length Optimizer (tool-031-cycle-length-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-045-cycle-break-planner with stable ID mrx.tool.045-cycle-break-planner.
2. Typed CycleBreakInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports planCycleBreak; no model-generated number overrides the engine.
4. 1 test file(s) matched; 8 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-045-cycle-break-planner.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cycle Break Planner.** In: cycle_weeks_used, compounds | Out: versioned formula sheet + days_to_full_clear | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for cycle_weeks_used.** In: cycle_weeks_used:number [4..52] int; compounds:array [1..8]; wants_bloodwork:other unbounded | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cycle Break Planner.** In: days_to_full_clear, total_weeks_to_baseline | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycle_weeks_used.** In: changed cycle_weeks_used with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from days_to_full_clear.** In: days_to_full_clear + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for cycle_weeks_used.** In: global metric/imperial preference + cycle_weeks_used | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cycle Break Planner.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cycle Break Planner.** In: days_to_full_clear, total_weeks_to_baseline | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of days_to_full_clear.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Stack Compatibility Checker (tool-038-stack-compatibility).** In: approved subset of days_to_full_clear | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const maxHl = Math.max(...input.compounds.map((c) => c.half_life_days));` `const daysToClear = Math.ceil(maxHl * 5);` `const pctOpenWeek = Math.ceil(pctStartDay / 7);` `if (Math.max(...input.compounds.map((c) => c.suppression_factor)) >= 3) {`

---

### 056 — Mini PCT Calculator

- **Stable ID:** `mrx.tool.056-mini-pct-calculator`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-056-mini-pct-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Short PCT window estimator
- **Inputs:** compound_class:enum enum(19nor\|aromatizing\|oral); cycle_weeks:number [1..52] int; last_dose_days_ago:number [0..365] int
- **Outputs:** washout_days, start_in_days, warnings
- **Evidence:** component `components/tools/tool-056-mini-pct-calculator.tsx`; engine `lib/tools/engines/tool-056-mini-pct-calculator.ts`; schema `lib/tools/schemas/tool-056-mini-pct-calculator.ts`; tests 2; i18n `i18n/tool-056-mini-pct-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Cycle Break Planner (tool-045-cycle-break-planner); Stack Compatibility Checker (tool-038-stack-compatibility); Cycle Length Optimizer (tool-031-cycle-length-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-056-mini-pct-calculator with stable ID mrx.tool.056-mini-pct-calculator.
2. Typed MiniPctInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports planMiniPct; no model-generated number overrides the engine.
4. 2 test file(s) matched; 13 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-056-mini-pct-calculator.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Mini PCT Calculator.** In: compound_class, cycle_weeks | Out: versioned formula sheet + washout_days | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compound_class.** In: compound_class:enum enum(19nor|aromatizing|oral); cycle_weeks:number [1..52] int; last_dose_days_ago:number [0..365] int | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Mini PCT Calculator.** In: washout_days, start_in_days | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycle_weeks.** In: changed cycle_weeks with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from washout_days.** In: washout_days + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for last_dose_days_ago.** In: global metric/imperial preference + cycle_weeks | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Mini PCT Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Mini PCT Calculator.** In: washout_days, start_in_days | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of washout_days.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Cycle Break Planner (tool-045-cycle-break-planner).** In: approved subset of washout_days | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const start_in_days = Math.max(0, washout_days - last_dose_days_ago);`

---

### 101 — SARM-to-AAS Transition & Bridge Predictor

- **Stable ID:** `mrx.tool.101-sarm-to-aas-transition-bridge-predictor`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-101-sarm-to-aas-transition-bridge-predictor` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** SARM/AAS transition planning
- **Inputs:** sarm_compound:enum enum(ostarine_mk2866\|ligandrol_lgd4033\|rad140_testolone\|andarine_s4\|yk11\|cardarine_gw501516); sarm_use_weeks:number [1..104]; suppression_severity:enum enum(mild\|moderate\|severe); prior_aas_use:other unbounded; target_aas_ester:enum enum(testosterone_propionate\|masteron_propionate\|trenbolone_acetate\|testosterone_enanthate\|testosterone_cypionate\|sustanon_250\|nandrolone_decanoate\|testosterone_undecanoate); has_current_bloodwork:other unbounded
- **Outputs:** sarm_half_life_hours, aas_ester_half_life_days, sarm_washout_days, sarm_residual_percent_day_0, sarm_residual_percent_day_7, sarm_residual_percent_day_30, transition_timeline, expected_hpta_recovery_weeks, transition_risk_tier, +1 more
- **Evidence:** component `components/tools/tool-101-sarm-to-aas-transition-bridge-predictor.tsx`; engine `lib/tools/engines/tool-101-sarm-to-aas-transition-bridge-predictor.ts`; schema `lib/tools/schemas/tool-101-sarm-to-aas-transition-bridge-predictor.ts`; tests 3; i18n `i18n/tool-101-sarm-to-aas-transition-bridge-predictor.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Contest Prep Peak-Week Manipulator (tool-107-contest-prep-peak-week-manipulator); Competition Readiness & Stage Posing OS (tool-109-competition-readiness-posing-os); Mini PCT Calculator (tool-056-mini-pct-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-101-sarm-to-aas-transition-bridge-predictor with stable ID mrx.tool.101-sarm-to-aas-transition-bridge-predictor.
2. Typed SarmToAasTransitionInputSchema exposes 6 field(s); 1 carry explicit bounds.
3. Deterministic engine exports residualActivityFraction, sarmResidualPercent, daysToResidualBelow; no model-generated number overrides the engine.
4. 3 test file(s) matched; 17 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-101-sarm-to-aas-transition-bridge-predictor.json exists (? AR / ? EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No source/provenance text is encoded in the engine.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for SARM-to-AAS Transition & Bridge Predictor.** In: sarm_compound, sarm_use_weeks | Out: versioned formula sheet + sarm_half_life_hours | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sarm_compound.** In: sarm_compound:enum enum(ostarine_mk2866|ligandrol_lgd4033|rad140_testolone|andarine_s4|yk11|cardarine_gw501516); sarm_use_weeks:number [1..104]; suppression_severity:enum enum(mild|moderate|severe); prior_aas_use:other unbounded; +2 more | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for SARM-to-AAS Transition & Bridge Predictor.** In: sarm_half_life_hours, aas_ester_half_life_days | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sarm_use_weeks.** In: changed sarm_use_weeks with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from sarm_half_life_hours.** In: sarm_half_life_hours + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sarm_compound.** In: global metric/imperial preference + sarm_use_weeks | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for SARM-to-AAS Transition & Bridge Predictor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for SARM-to-AAS Transition & Bridge Predictor.** In: sarm_half_life_hours, aas_ester_half_life_days | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of sarm_half_life_hours.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Contest Prep Peak-Week Manipulator (tool-107-contest-prep-peak-week-manipulator).** In: approved subset of sarm_half_life_hours | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.pow(2, -halfLives);` `const tHalfDays = SARM_HALF_LIFE_HOURS[sarm] / 24;` `return Math.round(residualActivityFraction(days / tHalfDays) * 1000) / 10;` `const halfLives = Math.log(thresholdPercent / 100) / Math.log(0.5);`

---

### 107 — Contest Prep Peak-Week Manipulator

- **Stable ID:** `mrx.tool.107-contest-prep-peak-week-manipulator`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-107-contest-prep-peak-week-manipulator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Peak-week planning timeline
- **Inputs:** days_until_show:number [1..90] int; sex:enum enum(male\|female); weight_kg:number [40..200]; hydration_status:enum enum(normal\|mild\|severe); tan_stability:enum enum(low\|medium\|high); show_stage_format:enum enum(bodybuilding\|physique\|figure\|bikini)
- **Outputs:** phase_steps, dehydration_risk_tier, sodium_ref_mg_day, water_ref_liters, checklist_ref, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-107-contest-prep-peak-week-manipulator.tsx`; engine `lib/tools/engines/tool-107-contest-prep-peak-week-manipulator.ts`; schema `lib/tools/schemas/tool-107-contest-prep-peak-week-manipulator.ts`; tests 2; i18n `i18n/tool-107-contest-prep-peak-week-manipulator.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Competition Readiness & Stage Posing OS (tool-109-competition-readiness-posing-os); SARM-to-AAS Transition & Bridge Predictor (tool-101-sarm-to-aas-transition-bridge-predictor); Mini PCT Calculator (tool-056-mini-pct-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-107-contest-prep-peak-week-manipulator with stable ID mrx.tool.107-contest-prep-peak-week-manipulator.
2. Typed ContestPrepInputSchema exposes 6 field(s); 2 carry explicit bounds.
3. Deterministic engine exports buildPhaseTimeline; no model-generated number overrides the engine.
4. 2 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-107-contest-prep-peak-week-manipulator.json exists (35 AR / 35 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No result narrative/interpretation was detected.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Contest Prep Peak-Week Manipulator.** In: days_until_show, sex | Out: versioned formula sheet + phase_steps | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for days_until_show.** In: days_until_show:number [1..90] int; sex:enum enum(male|female); weight_kg:number [40..200]; hydration_status:enum enum(normal|mild|severe); +2 more | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Contest Prep Peak-Week Manipulator.** In: phase_steps, dehydration_risk_tier | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for days_until_show.** In: changed days_until_show with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from phase_steps.** In: phase_steps + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weight_kg.** In: global metric/imperial preference + days_until_show | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Contest Prep Peak-Week Manipulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Contest Prep Peak-Week Manipulator.** In: phase_steps, dehydration_risk_tier | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of phase_steps.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Competition Readiness & Stage Posing OS (tool-109-competition-readiness-posing-os).** In: approved subset of phase_steps | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const sodiumDays = Math.min(days_until_show, 21);` `sodiumRef.push(MIN_SODIUM_MG + Math.round((MAX_SODIUM_MG - MIN_SODIUM_MG) * (i / Math.max(1, sodiumDays - 1))));` `const waterRefL = [weight_kg * (0.03 + (sex === 'male' ? 0.005 : 0.002)), weight_kg * 0.04];`

---

### 109 — Competition Readiness & Stage Posing OS

- **Stable ID:** `mrx.tool.109-competition-readiness-posing-os`
- **Category / route / status:** Cycle Management · `/smarttools/cycle-management/tool-109-competition-readiness-posing-os` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Contest readiness checklist system
- **Inputs:** gender:enum enum(male\|female); show_type:enum enum(bodybuilding\|physique\|figure\|bikini); experience_years:number [0..50]; prep_phase:enum enum(early\|late\|peak_week); tan_maintenance:enum enum(none\|auto\|manual); has_stage_photo_session:other unbounded
- **Outputs:** checklist, readiness_tier, count_by_category, education_flags, scope_notice
- **Evidence:** component `components/tools/tool-109-competition-readiness-posing-os.tsx`; engine `lib/tools/engines/tool-109-competition-readiness-posing-os.ts`; schema `lib/tools/schemas/tool-109-competition-readiness-posing-os.ts`; tests 1; i18n `i18n/tool-109-competition-readiness-posing-os.json`; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Contest Prep Peak-Week Manipulator (tool-107-contest-prep-peak-week-manipulator); SARM-to-AAS Transition & Bridge Predictor (tool-101-sarm-to-aas-transition-bridge-predictor); Mini PCT Calculator (tool-056-mini-pct-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/cycle-management/tool-109-competition-readiness-posing-os with stable ID mrx.tool.109-competition-readiness-posing-os.
2. Typed ReadinessInputSchema exposes 6 field(s); 1 carry explicit bounds.
3. Deterministic engine exports buildReadinessChecklist; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-109-competition-readiness-posing-os.json exists (43 AR / 43 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Competition Readiness & Stage Posing OS.** In: gender, show_type | Out: versioned formula sheet + checklist | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for gender.** In: gender:enum enum(male|female); show_type:enum enum(bodybuilding|physique|figure|bikini); experience_years:number [0..50]; prep_phase:enum enum(early|late|peak_week); +2 more | Out: field-level validation messages + canonical value | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Competition Readiness & Stage Posing OS.** In: checklist, readiness_tier | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for experience_years.** In: changed experience_years with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from checklist.** In: checklist + declared goal if present | Out: status vs validated range/goal | Source: clinical/regulatory guidance; no cycle protocol is generated without expert approval | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for gender.** In: global metric/imperial preference + experience_years | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Competition Readiness & Stage Posing OS.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Competition Readiness & Stage Posing OS.** In: checklist, readiness_tier | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of checklist.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Contest Prep Peak-Week Manipulator (tool-107-contest-prep-peak-week-manipulator).** In: approved subset of checklist | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---
