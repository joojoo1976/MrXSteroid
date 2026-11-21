# R5 255-TOOL PER-TOOL DOSSIERS — MEASUREMENT CONVERSION

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 2 catalog entries in this category (2 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### 144 — General Mass, Volume & Density Calculator

- **Stable ID:** `mrx.tool.144-homebrew-chemistry-calculator`
- **Category / route / status:** Measurement Conversion · `/smarttools/measurement-conversion/tool-144-homebrew-chemistry-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Educational calculation of one quantity from the other two using explicit units
- **Inputs:** density:other unbounded; densityUnit:other unbounded; densitySource:string [1..240]; densityTemperatureC:other unbounded
- **Outputs:** solveFor, value, unit, formula, temperatureC, densitySource
- **Evidence:** component `components/tools/tool-144-homebrew-chemistry-calculator.tsx`; engine `lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.ts`; schema `lib/tools/schemas/tool-144-homebrew-chemistry-calculator.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Generic Arithmetic (tool-219-female-dosage).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/measurement-conversion/tool-144-homebrew-chemistry-calculator with stable ID mrx.tool.144-homebrew-chemistry-calculator.
2. Typed DensityFields exposes 4 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateMassVolumeDensityV6; no model-generated number overrides the engine.
4. 2 test file(s) matched; 8 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for General Mass, Volume & Density Calculator.** In: density, densityUnit | Out: versioned formula sheet + solveFor | Source: SI/NIST conversion factors; exact factor table and precision must be versioned | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for density.** In: density:other unbounded; densityUnit:other unbounded; densitySource:string [1..240]; densityTemperatureC:other unbounded | Out: field-level validation messages + canonical value | Source: SI/NIST conversion factors; exact factor table and precision must be versioned | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for General Mass, Volume & Density Calculator.** In: solveFor, value | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for density.** In: changed density with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from solveFor.** In: solveFor + declared goal if present | Out: status vs validated range/goal | Source: SI/NIST conversion factors; exact factor table and precision must be versioned | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for densityTemperatureC.** In: global metric/imperial preference + density | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for General Mass, Volume & Density Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for General Mass, Volume & Density Calculator.** In: solveFor, value | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of solveFor.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Generic Arithmetic (tool-219-female-dosage).** In: approved subset of solveFor | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `export const DENSITY_UNITS = ['kg/m3', 'g/L', 'mg/mL', 'kg/L', 'g/mL', 'g/cm3', 'lb/ft3', 'lb/US gal', 'oz/US fl oz'] as const;` `const massG = data.density * DENSITY_TO_GRAMS_PER_MILLILITER[data.densityUnit] * data.volume * VOLUME_TO_MILLILITERS[data.volumeUnit];` `return { solveFor: data.solveFor, value: assertFinite(massG / MASS_TO_GRAMS[data.resultUnit]), unit: data.resultUnit, formula: 'm = ρ × V', temperatureC: data.densityTemperatureC, densitySource: data.densitySource };` `const volumeMl = (data.mass * MASS_TO_GRAMS[data.massUnit]) / (data.density * DENSITY_TO_GRAMS_PER_MILLILITER[data.densityUnit]);`

---

### 219 — Generic Arithmetic

- **Stable ID:** `mrx.tool.219-female-dosage`
- **Category / route / status:** Measurement Conversion · `/smarttools/measurement-conversion/tool-219-female-dosage` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-219-female-dosage.tsx`; engine `lib/tools/engines/tool-219-female-dosage.v7.ts`; schema `lib/tools/schemas/tool-219-female-dosage.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** General Mass, Volume & Density Calculator (tool-144-homebrew-chemistry-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/measurement-conversion/tool-219-female-dosage with stable ID mrx.tool.219-female-dosage.
2. Typed ArithmeticSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateFemaleArithmetic; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Arithmetic.** In: value, factor | Out: versioned formula sheet + the displayed result | Source: SI/NIST conversion factors; exact factor table and precision must be versioned | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [?..1000000] >=0; factor:number [?..1000] >=0; unit:string [1..30] | Out: field-level validation messages + canonical value | Source: SI/NIST conversion factors; exact factor table and precision must be versioned | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Arithmetic.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: SI/NIST conversion factors; exact factor table and precision must be versioned | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Arithmetic.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Arithmetic.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to General Mass, Volume & Density Calculator (tool-144-homebrew-chemistry-calculator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---
