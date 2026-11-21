# R5 255-TOOL PER-TOOL DOSSIERS — INJECTION & FORMULATION

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 11 catalog entries in this category (8 implemented, 3 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — Interactive Injection Map

- **Stable ID:** `mrx.tool.injection`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/injection` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Visual injection site guide with rotation planner
- **Inputs:** sites:array [1..?]; lastUsedSites:array optional; preferredSides:array optional enum(left\|right); unitSystem:enum optional enum(metric\|imperial)
- **Outputs:** recommendedSites, rotationSchedule, volumeLimits, warnings
- **Evidence:** component `components/tools/injection.tsx`; engine `lib/tools/engines/injection.ts`; schema `lib/tools/schemas/injection.ts`; tests 7; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Injection Site History Log (tool-009-injection-site-rotator); Injection Experience Log (tool-026-injection-pain); Injection Schedule Planner (tool-036-injection-schedule).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/injection with stable ID mrx.tool.injection.
2. Typed InjectionInputSchema exposes 4 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateInjectionPlan; no model-generated number overrides the engine.
4. 7 test file(s) matched; 8 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Interactive Injection Map.** In: sites, lastUsedSites | Out: versioned formula sheet + recommendedSites | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sites.** In: sites:array [1..?]; lastUsedSites:array optional; preferredSides:array optional enum(left|right); unitSystem:enum optional enum(metric|imperial) | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Interactive Injection Map.** In: recommendedSites, rotationSchedule | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sites.** In: changed sites with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from recommendedSites.** In: recommendedSites + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sites.** In: global metric/imperial preference + sites | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Interactive Injection Map.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Interactive Injection Map.** In: recommendedSites, rotationSchedule | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of recommendedSites.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Site History Log (tool-009-injection-site-rotator).** In: approved subset of recommendedSites | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `if (aIndex === -1) return -1;` `return aIndex - bIndex;`

---

### 009 — Injection Site History Log

- **Stable ID:** `mrx.tool.009-injection-site-rotator`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-009-injection-site-rotator` · **PARTIAL** (engine file exposes no calculation function; logic is inline or absent)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-entered history log; no rotation interval or safety determination
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-009-injection-site-rotator.tsx`; engine `lib/tools/engines/tool-009-injection-site-rotator.ts`; schema `lib/tools/schemas/tool-009-injection-site-rotator.ts`; tests 1; i18n `i18n/tool-009-injection-site-rotator.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Injection Experience Log (tool-026-injection-pain); Interactive Injection Map (injection); Injection Schedule Planner (tool-036-injection-schedule).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-009-injection-site-rotator with stable ID mrx.tool.009-injection-site-rotator.
2. 1 test file(s) matched; 0 numeric assertion(s) detected.
3. Tool-specific i18n file i18n/tool-009-injection-site-rotator.json exists (20 AR / 20 EN keys).
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: engine file exposes no calculation function; any logic is inline in the component and cannot be isolated for reference testing.
2. Engine file has no exported calculation function; logic is inline and not independently testable.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Injection Site History Log.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Injection Site History Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Injection Site History Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Injection Site History Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Experience Log (tool-026-injection-pain).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 026 — Injection Experience Log

- **Stable ID:** `mrx.tool.026-injection-pain`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-026-injection-pain` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Session-only log of user-authored injection experience notes; no assessment or procedural guidance
- **Inputs:** entries:array [?..100]
- **Outputs:** resultOrigin, assessment, reason, entries
- **Evidence:** component `components/tools/tool-026-injection-pain.tsx`; engine `lib/tools/engines/tool-026-injection-pain.ts`; schema `lib/tools/schemas/tool-026-injection-pain.ts`; tests 3; i18n `i18n/tool-026-injection-pain.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Injection Schedule Planner (tool-036-injection-schedule); Injection Site History Log (tool-009-injection-site-rotator); Peptide Dosage Calculator (tool-051-peptide-dosage-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-026-injection-pain with stable ID mrx.tool.026-injection-pain.
2. Typed InjectionExperienceInputSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports buildInjectionExperienceSessionV7; no model-generated number overrides the engine.
4. 3 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-026-injection-pain.json exists (13 AR / 13 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 3 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Injection Experience Log.** In: entries, entries | Out: versioned formula sheet + resultOrigin | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for entries.** In: entries:array [?..100] | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Injection Experience Log.** In: resultOrigin, assessment | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for entries.** In: changed entries with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultOrigin.** In: resultOrigin + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for entries.** In: global metric/imperial preference + entries | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Injection Experience Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Injection Experience Log.** In: resultOrigin, assessment | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultOrigin.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Schedule Planner (tool-036-injection-schedule).** In: approved subset of resultOrigin | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 036 — Injection Schedule Planner

- **Stable ID:** `mrx.tool.036-injection-schedule`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-036-injection-schedule` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Automated injection calendar
- **Inputs:** compounds:array [1..80] int optional; rotation_sites:array [1..40]; startDateISO:string [4..40] optional
- **Outputs:** shots, total_volume_ml_per_week, busiest_day, warnings
- **Evidence:** component `components/tools/tool-036-injection-schedule.tsx`; engine `lib/tools/engines/tool-036-injection-schedule.ts`; schema `lib/tools/schemas/tool-036-injection-schedule.ts`; tests 5; i18n `i18n/tool-036-injection-schedule.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Injection Experience Log (tool-026-injection-pain); Peptide Dosage Calculator (tool-051-peptide-dosage-calculator); Injection Site History Log (tool-009-injection-site-rotator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-036-injection-schedule with stable ID mrx.tool.036-injection-schedule.
2. Typed ChronoPlanInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports planInjectionSchedule, siteCeilingMl, classifyVolumeZone; no model-generated number overrides the engine.
4. 5 test file(s) matched; 14 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-036-injection-schedule.json exists (8 AR / 8 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Does not read the global measurement preference; unit switching is absent or local.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Injection Schedule Planner.** In: compounds, rotation_sites | Out: versioned formula sheet + shots | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..80] int optional; rotation_sites:array [1..40]; startDateISO:string [4..40] optional | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Injection Schedule Planner.** In: shots, total_volume_ml_per_week | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for compounds.** In: changed compounds with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from shots.** In: shots + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + compounds | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Injection Schedule Planner.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Injection Schedule Planner.** In: shots, total_volume_ml_per_week | Out: one labelled chart/table with alt text | Source: engine values | State: PARTIAL — visual detected | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of shots.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Experience Log (tool-026-injection-pain).** In: approved subset of shots | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const n = Math.max(1, Math.min(7, Math.round(c.injections_per_week)));` `const dosePerShot = c.weekly_dose_mg / n;` `const volumePerShot = dosePerShot / Math.max(1, c.concentration_mg_ml);` `const day = Math.round((k * 7) / n) % 7;`

---

### 051 — Peptide Dosage Calculator

- **Stable ID:** `mrx.tool.051-peptide-dosage-calculator`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Peptide reconstitution and dosing math
- **Inputs:** vial_mg:number [0.1..100]; bac_water_ml:number [0.1..10]; desired_dose_mg:number [0.01..10]
- **Outputs:** concentration_mg_per_ml, dose_volume_ml, draw_units_u100
- **Evidence:** component `components/tools/tool-051-peptide-dosage-calculator.tsx`; engine `lib/tools/engines/tool-051-peptide-dosage-calculator.ts`; schema `lib/tools/schemas/tool-051-peptide-dosage-calculator.ts`; tests 2; i18n `i18n/tool-051-peptide-dosage-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Injection Schedule Planner (tool-036-injection-schedule); Injection Experience Log (tool-026-injection-pain); Injection Site History Log (tool-009-injection-site-rotator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-051-peptide-dosage-calculator with stable ID mrx.tool.051-peptide-dosage-calculator.
2. Typed PeptideDoseInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports computePeptideDose; no model-generated number overrides the engine.
4. 2 test file(s) matched; 15 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-051-peptide-dosage-calculator.json exists (11 AR / 11 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Peptide Dosage Calculator.** In: vial_mg, bac_water_ml | Out: versioned formula sheet + concentration_mg_per_ml | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for vial_mg.** In: vial_mg:number [0.1..100]; bac_water_ml:number [0.1..10]; desired_dose_mg:number [0.01..10] | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Peptide Dosage Calculator.** In: concentration_mg_per_ml, dose_volume_ml | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for vial_mg.** In: changed vial_mg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from concentration_mg_per_ml.** In: concentration_mg_per_ml + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for vial_mg, bac_water_ml, desired_dose_mg.** In: global metric/imperial preference + vial_mg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Peptide Dosage Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Peptide Dosage Calculator.** In: concentration_mg_per_ml, dose_volume_ml | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of concentration_mg_per_ml.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Injection Schedule Planner (tool-036-injection-schedule).** In: approved subset of concentration_mg_per_ml | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const concentration_mg_per_ml = vial_mg / bac_water_ml;` `const dose_volume_ml = desired_dose_mg / concentration_mg_per_ml;` `const raw_units = dose_volume_ml * 100; // U-100 scale` `const draw_units_u100 = clamped ? MIN_UNITS : Math.round(raw_units * 10) / 10;`

---

### 137 — Peptide & Hormone Reconstitution Calculator

- **Stable ID:** `mrx.tool.137-peptide-hormone-reconstitution-calculator`
- **Category / route / status:** Injection & Formulation · `/smarttools/tool-137-peptide-hormone-reconstitution-calculator` · **BLOCKED** (planned catalog entry; no component, engine or schema)
- **Publication / depth:** planned / planned
- **Purpose (catalog):** Reconstitution concentration math
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `—`; engine `—`; schema `—`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **BLOCKED** — no implementation exists; no formula can be audited.
- **Language / measurement:** not applicable — no implementation exists, so there is no i18n, measurement, ARIA or landmark surface to audit.
- **Related:** Ideal Circular-Tube Pressure Drop Calculator (tool-141-carrier-oil-viscosity-syringe-pressure); Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator); Product Storage Label & Temperature Record Checker (tool-143-storage-stability-thermal-degradation-estimator).

**Five evidence-backed strengths**
1. Catalog marks this entry as **planned**, so it is not counted as a launched tool (264 implemented + 4 planned).
2. Stable ID mrx.tool.137-peptide-hormone-reconstitution-calculator and slug tool-137-peptide-hormone-reconstitution-calculator are reserved in the catalog, so implementation can start without renaming or renumbering.
3. An Arabic title and English title are recorded, so the bilingual label exists before implementation.
4. No other catalog entry shares this slug or toolId (the analyzer reports 0 duplicate catalog keys), so the planned capability is not a silent duplicate.
5. The blocker is recorded explicitly (no component, engine or schema; href lacks the category segment), which is more honest than a placeholder implementation.

**Five evidence-backed gaps**
1. Formula status BLOCKED: no implementation exists, so no formula can be audited or verified.
2. No component, engine or schema exists; the catalog href also lacks the required category segment, so the route is not routable.
3. No input/output contract, validation boundary or golden case is defined for the formulation estimate.
4. No tool-specific i18n, measurement metadata, accessibility or narrative design exists yet.
5. No owner build authorization and no approved domain source exist; building it without them would create an unsupported medical/capability claim.

**Ten customized AI development proposals**
**P1. Build authorization and scope contract for Peptide & Hormone Reconstitution Calculator.** In: none today | Out: approved scope + non-goals | Source: owner directive | State: BLOCKED (planned catalog entry) | Cost: S | Consent: none | Risk: building an unapproved medical capability | Fallback: keep route unpublished | Test: scope review checklist | Accept: owner signs scope and route is generated only after implementation.
**P2. Typed input schema for Peptide & Hormone Reconstitution Calculator.** In: proposed fields | Out: strict schema + bounds | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary bounds | Fallback: reject invalid input | Test: boundary unit tests | Accept: every numeric field is finite, bounded and reject-tested.
**P3. Deterministic core for Peptide & Hormone Reconstitution Calculator.** In: schema-validated input | Out: versioned result contract | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: unsourced formula | Fallback: no result | Test: 3 golden cases + boundaries | Accept: engine output matches an approved reference.
**P4. Result narrative for Peptide & Hormone Reconstitution Calculator.** In: engine result | Out: primary result, why, limitation | Source: engine values only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: invented interpretation | Fallback: numeric-only result | Test: snapshot + value traceability | Accept: every sentence maps to a result field.
**P5. Bilingual UI contract for Peptide & Hormone Reconstitution Calculator.** In: locale | Out: AR/EN labels, RTL, errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English leakage | Fallback: show explicit unsupported notice | Test: locale matrix | Accept: no English fragment in AR mode and no reload.
**P6. Accessibility gate for Peptide & Hormone Reconstitution Calculator.** In: keyboard/screen-reader use | Out: landmarks, labels, focus | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unusable control | Fallback: native input | Test: axe + keyboard | Accept: zero critical axe findings.
**P7. Visual summary for Peptide & Hormone Reconstitution Calculator.** In: result fields | Out: one labelled chart/table | Source: engine output | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: chart implies prediction | Fallback: table | Test: rendering + alt text | Accept: chart values equal engine values.
**P8. Exportable record for Peptide & Hormone Reconstitution Calculator.** In: result + provenance | Out: JSON/PDF with version | Source: result contract | State: NOT IMPLEMENTED | Cost: S | Consent: user-initiated | Risk: leaking sensitive data | Fallback: no export | Test: schema snapshot | Accept: export round-trips and contains no hidden fields.
**P9. Consent-gated AI explanation for Peptide & Hormone Reconstitution Calculator.** In: result findings + locale | Out: grounded explanation | Source: engine result only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit per-call | Risk: model invents advice | Fallback: deterministic template | Test: fallback + prompt injection | Accept: no number differs from the engine.
**P10. Post-build cross-tool handoff for Peptide & Hormone Reconstitution Calculator.** In: approved result subset | Out: deep link with context | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking context | Fallback: plain route link | Test: route contract | Accept: only approved fields cross the boundary.

**Static formula signals (evidence, not validation):** none extracted.

---

### 138 — Raw Powder Density & Oil Formulation Engine

- **Stable ID:** `mrx.tool.138-raw-powder-density-oil-formulation-engine`
- **Category / route / status:** Injection & Formulation · `/smarttools/tool-138-raw-powder-density-oil-formulation-engine` · **BLOCKED** (planned catalog entry; no component, engine or schema)
- **Publication / depth:** planned / planned
- **Purpose (catalog):** Oil formulation density math
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `—`; engine `—`; schema `—`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **BLOCKED** — no implementation exists; no formula can be audited.
- **Language / measurement:** not applicable — no implementation exists, so there is no i18n, measurement, ARIA or landmark surface to audit.
- **Related:** Ideal Circular-Tube Pressure Drop Calculator (tool-141-carrier-oil-viscosity-syringe-pressure); Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator); Product Storage Label & Temperature Record Checker (tool-143-storage-stability-thermal-degradation-estimator).

**Five evidence-backed strengths**
1. Catalog marks this entry as **planned**, so it is not counted as a launched tool (264 implemented + 4 planned).
2. Stable ID mrx.tool.138-raw-powder-density-oil-formulation-engine and slug tool-138-raw-powder-density-oil-formulation-engine are reserved in the catalog, so implementation can start without renaming or renumbering.
3. An Arabic title and English title are recorded, so the bilingual label exists before implementation.
4. No other catalog entry shares this slug or toolId (the analyzer reports 0 duplicate catalog keys), so the planned capability is not a silent duplicate.
5. The blocker is recorded explicitly (no component, engine or schema; href lacks the category segment), which is more honest than a placeholder implementation.

**Five evidence-backed gaps**
1. Formula status BLOCKED: no implementation exists, so no formula can be audited or verified.
2. No component, engine or schema exists; the catalog href also lacks the required category segment, so the route is not routable.
3. No input/output contract, validation boundary or golden case is defined for the formulation estimate.
4. No tool-specific i18n, measurement metadata, accessibility or narrative design exists yet.
5. No owner build authorization and no approved domain source exist; building it without them would create an unsupported medical/capability claim.

**Ten customized AI development proposals**
**P1. Build authorization and scope contract for Raw Powder Density & Oil Formulation Engine.** In: none today | Out: approved scope + non-goals | Source: owner directive | State: BLOCKED (planned catalog entry) | Cost: S | Consent: none | Risk: building an unapproved medical capability | Fallback: keep route unpublished | Test: scope review checklist | Accept: owner signs scope and route is generated only after implementation.
**P2. Typed input schema for Raw Powder Density & Oil Formulation Engine.** In: proposed fields | Out: strict schema + bounds | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary bounds | Fallback: reject invalid input | Test: boundary unit tests | Accept: every numeric field is finite, bounded and reject-tested.
**P3. Deterministic core for Raw Powder Density & Oil Formulation Engine.** In: schema-validated input | Out: versioned result contract | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: unsourced formula | Fallback: no result | Test: 3 golden cases + boundaries | Accept: engine output matches an approved reference.
**P4. Result narrative for Raw Powder Density & Oil Formulation Engine.** In: engine result | Out: primary result, why, limitation | Source: engine values only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: invented interpretation | Fallback: numeric-only result | Test: snapshot + value traceability | Accept: every sentence maps to a result field.
**P5. Bilingual UI contract for Raw Powder Density & Oil Formulation Engine.** In: locale | Out: AR/EN labels, RTL, errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English leakage | Fallback: show explicit unsupported notice | Test: locale matrix | Accept: no English fragment in AR mode and no reload.
**P6. Accessibility gate for Raw Powder Density & Oil Formulation Engine.** In: keyboard/screen-reader use | Out: landmarks, labels, focus | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unusable control | Fallback: native input | Test: axe + keyboard | Accept: zero critical axe findings.
**P7. Visual summary for Raw Powder Density & Oil Formulation Engine.** In: result fields | Out: one labelled chart/table | Source: engine output | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: chart implies prediction | Fallback: table | Test: rendering + alt text | Accept: chart values equal engine values.
**P8. Exportable record for Raw Powder Density & Oil Formulation Engine.** In: result + provenance | Out: JSON/PDF with version | Source: result contract | State: NOT IMPLEMENTED | Cost: S | Consent: user-initiated | Risk: leaking sensitive data | Fallback: no export | Test: schema snapshot | Accept: export round-trips and contains no hidden fields.
**P9. Consent-gated AI explanation for Raw Powder Density & Oil Formulation Engine.** In: result findings + locale | Out: grounded explanation | Source: engine result only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit per-call | Risk: model invents advice | Fallback: deterministic template | Test: fallback + prompt injection | Accept: no number differs from the engine.
**P10. Post-build cross-tool handoff for Raw Powder Density & Oil Formulation Engine.** In: approved result subset | Out: deep link with context | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking context | Fallback: plain route link | Test: route contract | Accept: only approved fields cross the boundary.

**Static formula signals (evidence, not validation):** none extracted.

---

### 139 — Solvent & Emulsifier Ratio Calculator (BA/BB)

- **Stable ID:** `mrx.tool.139-solvent-emulsifier-ratio-calculator`
- **Category / route / status:** Injection & Formulation · `/smarttools/tool-139-solvent-emulsifier-ratio-calculator` · **BLOCKED** (planned catalog entry; no component, engine or schema)
- **Publication / depth:** planned / planned
- **Purpose (catalog):** BA/BB solvent ratio math
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `—`; engine `—`; schema `—`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **BLOCKED** — no implementation exists; no formula can be audited.
- **Language / measurement:** not applicable — no implementation exists, so there is no i18n, measurement, ARIA or landmark surface to audit.
- **Related:** Ideal Circular-Tube Pressure Drop Calculator (tool-141-carrier-oil-viscosity-syringe-pressure); Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator); Product Storage Label & Temperature Record Checker (tool-143-storage-stability-thermal-degradation-estimator).

**Five evidence-backed strengths**
1. Catalog marks this entry as **planned**, so it is not counted as a launched tool (264 implemented + 4 planned).
2. Stable ID mrx.tool.139-solvent-emulsifier-ratio-calculator and slug tool-139-solvent-emulsifier-ratio-calculator are reserved in the catalog, so implementation can start without renaming or renumbering.
3. An Arabic title and English title are recorded, so the bilingual label exists before implementation.
4. No other catalog entry shares this slug or toolId (the analyzer reports 0 duplicate catalog keys), so the planned capability is not a silent duplicate.
5. The blocker is recorded explicitly (no component, engine or schema; href lacks the category segment), which is more honest than a placeholder implementation.

**Five evidence-backed gaps**
1. Formula status BLOCKED: no implementation exists, so no formula can be audited or verified.
2. No component, engine or schema exists; the catalog href also lacks the required category segment, so the route is not routable.
3. No input/output contract, validation boundary or golden case is defined for the formulation estimate.
4. No tool-specific i18n, measurement metadata, accessibility or narrative design exists yet.
5. No owner build authorization and no approved domain source exist; building it without them would create an unsupported medical/capability claim.

**Ten customized AI development proposals**
**P1. Build authorization and scope contract for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: none today | Out: approved scope + non-goals | Source: owner directive | State: BLOCKED (planned catalog entry) | Cost: S | Consent: none | Risk: building an unapproved medical capability | Fallback: keep route unpublished | Test: scope review checklist | Accept: owner signs scope and route is generated only after implementation.
**P2. Typed input schema for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: proposed fields | Out: strict schema + bounds | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary bounds | Fallback: reject invalid input | Test: boundary unit tests | Accept: every numeric field is finite, bounded and reject-tested.
**P3. Deterministic core for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: schema-validated input | Out: versioned result contract | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: unsourced formula | Fallback: no result | Test: 3 golden cases + boundaries | Accept: engine output matches an approved reference.
**P4. Result narrative for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: engine result | Out: primary result, why, limitation | Source: engine values only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: invented interpretation | Fallback: numeric-only result | Test: snapshot + value traceability | Accept: every sentence maps to a result field.
**P5. Bilingual UI contract for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: locale | Out: AR/EN labels, RTL, errors | Source: approved glossary | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: English leakage | Fallback: show explicit unsupported notice | Test: locale matrix | Accept: no English fragment in AR mode and no reload.
**P6. Accessibility gate for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: keyboard/screen-reader use | Out: landmarks, labels, focus | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unusable control | Fallback: native input | Test: axe + keyboard | Accept: zero critical axe findings.
**P7. Visual summary for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: result fields | Out: one labelled chart/table | Source: engine output | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: chart implies prediction | Fallback: table | Test: rendering + alt text | Accept: chart values equal engine values.
**P8. Exportable record for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: result + provenance | Out: JSON/PDF with version | Source: result contract | State: NOT IMPLEMENTED | Cost: S | Consent: user-initiated | Risk: leaking sensitive data | Fallback: no export | Test: schema snapshot | Accept: export round-trips and contains no hidden fields.
**P9. Consent-gated AI explanation for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: result findings + locale | Out: grounded explanation | Source: engine result only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit per-call | Risk: model invents advice | Fallback: deterministic template | Test: fallback + prompt injection | Accept: no number differs from the engine.
**P10. Post-build cross-tool handoff for Solvent & Emulsifier Ratio Calculator (BA/BB).** In: approved result subset | Out: deep link with context | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking context | Fallback: plain route link | Test: route contract | Accept: only approved fields cross the boundary.

**Static formula signals (evidence, not validation):** none extracted.

---

### 141 — Ideal Circular-Tube Pressure Drop Calculator

- **Stable ID:** `mrx.tool.141-carrier-oil-viscosity-syringe-pressure`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-141-carrier-oil-viscosity-syringe-pressure` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** User-sourced fluid-property inputs for an ideal laminar circular-tube model; not actual syringe force or injection advice
- **Inputs:** dynamicViscosityPaS:number [?..1] >0; densityKgM3:number [?..100] >0; innerDiameterM:number [?..0.05] >0; tubeLengthM:number [?..10] >0; volumetricFlowM3S:number [?..0.1] >0; measurementTemperatureC:number [-273.15..1]; viscositySource:string [1..400]; densitySource:string [1..400]; assumptionsAcknowledged:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-141-carrier-oil-viscosity-syringe-pressure.tsx`; engine `lib/tools/engines/tool-141-carrier-oil-viscosity-syringe-pressure.v6.ts`; schema `lib/tools/schemas/tool-141-carrier-oil-viscosity-syringe-pressure.ts`; tests 2; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator); Product Storage Label & Temperature Record Checker (tool-143-storage-stability-thermal-degradation-estimator); Peptide Dosage Calculator (tool-051-peptide-dosage-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-141-carrier-oil-viscosity-syringe-pressure with stable ID mrx.tool.141-carrier-oil-viscosity-syringe-pressure.
2. Typed NewtonianTubeFlowInputSchema exposes 9 field(s); 8 carry explicit bounds.
3. Deterministic engine exports calculateNewtonianTubePressureV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 5 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No result narrative/interpretation was detected.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Ideal Circular-Tube Pressure Drop Calculator.** In: dynamicViscosityPaS, densityKgM3 | Out: versioned formula sheet + the displayed result | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for dynamicViscosityPaS.** In: dynamicViscosityPaS:number [?..1] >0; densityKgM3:number [?..100] >0; innerDiameterM:number [?..0.05] >0; tubeLengthM:number [?..10] >0; +5 more | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Ideal Circular-Tube Pressure Drop Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for dynamicViscosityPaS.** In: changed dynamicViscosityPaS with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for densityKgM3, volumetricFlowM3S, measurementTemperatureC.** In: global metric/imperial preference + dynamicViscosityPaS | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Ideal Circular-Tube Pressure Drop Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Ideal Circular-Tube Pressure Drop Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const areaM2 = Math.PI * (data.innerDiameterM / 2) ** 2;` `const meanVelocityMPerS = data.volumetricFlowM3S / areaM2;` `const reynoldsNumber = finiteRounded(data.densityKgM3 * meanVelocityMPerS * data.innerDiameterM / data.dynamicViscosityPaS);` `/ (Math.PI * data.innerDiameterM ** 4),`

---

### 142 — Mass Arithmetic from a User-Provided Assay

- **Stable ID:** `mrx.tool.142-compound-purity-active-yield-estimator`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-142-compound-purity-active-yield-estimator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Arithmetic from a user-transcribed assay result and its stated uncertainty; does not certify purity or calculate a dose
- **Inputs:** sampleMass:number [?..1] >0; massUnit:other unbounded; assayPercent:number [0..100]; statedUncertaintyPercentPoints:number [0..100]; uncertaintyDescription:other unbounded; sourceReference:other unbounded; methodDescription:other unbounded; reportDate:string unbounded
- **Outputs:** resultType, unit, centralMass, lowerArithmeticBound, upperArithmeticBound, formula, assayPercent, statedUncertaintyPercentPoints, uncertaintyDescription, +4 more
- **Evidence:** component `components/tools/tool-142-compound-purity-active-yield-estimator.tsx`; engine `lib/tools/engines/tool-142-compound-purity-active-yield-estimator.v6.ts`; schema `lib/tools/schemas/tool-142-compound-purity-active-yield-estimator.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Ideal Circular-Tube Pressure Drop Calculator (tool-141-carrier-oil-viscosity-syringe-pressure); Product Storage Label & Temperature Record Checker (tool-143-storage-stability-thermal-degradation-estimator); Peptide Dosage Calculator (tool-051-peptide-dosage-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-142-compound-purity-active-yield-estimator with stable ID mrx.tool.142-compound-purity-active-yield-estimator.
2. Typed UserAssayMassInputSchema exposes 8 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateUserAssayMassV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 3 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Mass Arithmetic from a User-Provided Assay.** In: sampleMass, massUnit | Out: versioned formula sheet + resultType | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for sampleMass.** In: sampleMass:number [?..1] >0; massUnit:other unbounded; assayPercent:number [0..100]; statedUncertaintyPercentPoints:number [0..100]; +4 more | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Mass Arithmetic from a User-Provided Assay.** In: resultType, unit | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for sampleMass.** In: changed sampleMass with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from resultType.** In: resultType + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for sampleMass.** In: global metric/imperial preference + sampleMass | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Mass Arithmetic from a User-Provided Assay.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Mass Arithmetic from a User-Provided Assay.** In: resultType, unit | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of resultType.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Ideal Circular-Tube Pressure Drop Calculator (tool-141-carrier-oil-viscosity-syringe-pressure).** In: approved subset of resultType | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const sampleMassGrams = data.sampleMass * gramsPerUnit;` `const grams = Number.isFinite(enteredMass) ? String(enteredMass * ASSAY_MASS_TO_GRAMS[massUnit]) : '';`

---

### 143 — Product Storage Label & Temperature Record Checker

- **Stable ID:** `mrx.tool.143-storage-stability-thermal-degradation-estimator`
- **Category / route / status:** Injection & Formulation · `/smarttools/injection-formulation/tool-143-storage-stability-thermal-degradation-estimator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Educational comparison of recorded temperatures with a referenced DailyMed label range
- **Inputs:** productName:string [?..160] optional; productState:enum optional enum(unopened\|in_use\|reconstituted); queriedAt:string optional; labelReference:string [?..1000] optional; labelRangeMinC:other unbounded; labelRangeMaxC:other unbounded; observedMinC:other unbounded; observedMaxC:other unbounded
- **Outputs:** status, productName, productState, queriedAt, labelReference, labelRangeC, observedRangeC, evaluation, reviewInstruction, +1 more
- **Evidence:** component `components/tools/tool-143-storage-stability-thermal-degradation-estimator.tsx`; engine `lib/tools/engines/tool-143-storage-stability-thermal-degradation-estimator.v6.ts`; schema `lib/tools/schemas/tool-143-storage-stability-thermal-degradation-estimator.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **PASS** — range-comparison rule is correct and refuses to evaluate without label/observed ranges; it does not claim stability. DailyMed URL normalization is validated.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator); Ideal Circular-Tube Pressure Drop Calculator (tool-141-carrier-oil-viscosity-syringe-pressure); Peptide Dosage Calculator (tool-051-peptide-dosage-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/injection-formulation/tool-143-storage-stability-thermal-degradation-estimator with stable ID mrx.tool.143-storage-stability-thermal-degradation-estimator.
2. Typed StorageExcursionInputSchema exposes 8 field(s); 2 carry explicit bounds.
3. Deterministic engine exports normalizeDailyMedReference, assessStorageExcursionV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — range-comparison rule is correct and refuses to evaluate without label/observed ranges; it does not claim stability. DailyMed URL normalization is validated.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No what-if or scenario surface.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Product Storage Label & Temperature Record Checker.** In: productName, productState | Out: versioned formula sheet + status | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for productName.** In: productName:string [?..160] optional; productState:enum optional enum(unopened|in_use|reconstituted); queriedAt:string optional; labelReference:string [?..1000] optional; +4 more | Out: field-level validation messages + canonical value | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Product Storage Label & Temperature Record Checker.** In: status, productName | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for productName.** In: changed productName with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: pharmacopoeial/label concentration reference and explicit sterility boundary | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for productName.** In: global metric/imperial preference + productName | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Product Storage Label & Temperature Record Checker.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Product Storage Label & Temperature Record Checker.** In: status, productName | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Mass Arithmetic from a User-Provided Assay (tool-142-compound-purity-active-yield-estimator).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const DAILYMED_BASE = 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=';` `const SET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;` `const searchUrl = draft.productName.trim() ? \`https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(draft.productName.trim())}\` : '';`

---
