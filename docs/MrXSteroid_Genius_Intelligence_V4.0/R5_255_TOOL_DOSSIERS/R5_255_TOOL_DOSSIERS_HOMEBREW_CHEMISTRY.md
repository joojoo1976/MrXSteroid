# R5 255-TOOL PER-TOOL DOSSIERS — HOMEBREW CHEMISTRY

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 8 catalog entries in this category (8 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### 239 — Peptide Product Label Reference Record

- **Stable ID:** `mrx.tool.239-peptide-reconstitution`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-239-peptide-reconstitution` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Records a user-provided product and label reference; preparation calculations and instructions are unavailable.
- **Inputs:** productName:string [1..120]; manufacturer:string [?..120] optional; sourceReference:string [1..500]; note:string [?..400] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-239-peptide-reconstitution.tsx`; engine `lib/tools/engines/tool-239-peptide-reconstitution.v7.ts`; schema `lib/tools/schemas/tool-239-peptide-reconstitution.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Measured Sample Density Calculator (tool-240-raw-powder-density-engine); Generic Mathematical Ratio Calculator (tool-241-solvent-ratio); General Measurement Unit Converter (tool-242-dosage-unit-conversion-engine).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-239-peptide-reconstitution with stable ID mrx.tool.239-peptide-reconstitution.
2. Typed PeptideLabelReferenceInputV7Schema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports recordPeptideLabelReference; no model-generated number overrides the engine.
4. Renders a <main> landmark; the route shell does not have to supply it.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Peptide Product Label Reference Record.** In: productName, manufacturer | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for productName.** In: productName:string [1..120]; manufacturer:string [?..120] optional; sourceReference:string [1..500]; note:string [?..400] optional | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Peptide Product Label Reference Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for productName.** In: changed productName with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for productName.** In: global metric/imperial preference + productName | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Peptide Product Label Reference Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Peptide Product Label Reference Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Measured Sample Density Calculator (tool-240-raw-powder-density-engine).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 240 — Measured Sample Density Calculator

- **Stable ID:** `mrx.tool.240-raw-powder-density-engine`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-240-raw-powder-density-engine` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Calculates density from a user-measured sample mass and volume; no material database or preparation guidance.
- **Inputs:** massGrams:number [0.001..1]; measuredVolumeMl:number [0.001..1]; measurementMethod:enum enum(recorded_measurement\|other); sourceReference:string [1..500]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-240-raw-powder-density-engine.tsx`; engine `lib/tools/engines/tool-240-density.v7.ts`; schema `lib/tools/schemas/tool-240-raw-powder-density-engine.v7.ts`; tests 0; i18n none; measurement yes; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Peptide Product Label Reference Record (tool-239-peptide-reconstitution); Generic Mathematical Ratio Calculator (tool-241-solvent-ratio); General Measurement Unit Converter (tool-242-dosage-unit-conversion-engine).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-240-raw-powder-density-engine with stable ID mrx.tool.240-raw-powder-density-engine.
2. Typed DensityMeasurementInputV7Schema exposes 4 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateMeasuredDensity; no model-generated number overrides the engine.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Measured Sample Density Calculator.** In: massGrams, measuredVolumeMl | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for massGrams.** In: massGrams:number [0.001..1]; measuredVolumeMl:number [0.001..1]; measurementMethod:enum enum(recorded_measurement|other); sourceReference:string [1..500] | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Measured Sample Density Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for massGrams.** In: changed massGrams with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for measuredVolumeMl.** In: global metric/imperial preference + massGrams | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Measured Sample Density Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Measured Sample Density Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Peptide Product Label Reference Record (tool-239-peptide-reconstitution).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const densityGPerMl = Number((input.massGrams / input.measuredVolumeMl).toPrecision(10));`

---

### 241 — Generic Mathematical Ratio Calculator

- **Stable ID:** `mrx.tool.241-solvent-ratio`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-241-solvent-ratio` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Divides two abstract user-provided numbers; no solvent, mixing, concentration, or preparation guidance.
- **Inputs:** a:number [0..1]; b:number [?..1]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-241-solvent-ratio.tsx`; engine `lib/tools/engines/tool-241-solvent-ratio.v7.ts`; schema `lib/tools/schemas/tool-241-solvent-ratio.v7.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Measured Sample Density Calculator (tool-240-raw-powder-density-engine); General Measurement Unit Converter (tool-242-dosage-unit-conversion-engine); Peptide Product Label Reference Record (tool-239-peptide-reconstitution).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-241-solvent-ratio with stable ID mrx.tool.241-solvent-ratio.
2. Typed GenericRatioInputV7Schema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateGenericRatio; no model-generated number overrides the engine.
4. 2 test file(s) matched; 11 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Mathematical Ratio Calculator.** In: a, b | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for a.** In: a:number [0..1]; b:number [?..1] | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Mathematical Ratio Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for a.** In: changed a with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for a.** In: global metric/imperial preference + a | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Mathematical Ratio Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Mathematical Ratio Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Measured Sample Density Calculator (tool-240-raw-powder-density-engine).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const ratio = input.a / input.b;`

---

### 242 — General Measurement Unit Converter

- **Stable ID:** `mrx.tool.242-dosage-unit-conversion-engine`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-242-dosage-unit-conversion-engine` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Converts a finite whitelist of compatible mass, volume, length, pressure, and temperature units.
- **Inputs:** value:number [-1..1]; fromUnit:other unbounded; toUnit:other unbounded
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-242-dosage-unit-conversion-engine.tsx`; engine `lib/tools/engines/tool-242-unit-conversion.v7.ts`; schema `lib/tools/schemas/tool-242-dosage-unit-conversion-engine.v7.ts`; tests 0; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **PASS** — unit-factor table and Fahrenheit offset are correct in static review; runtime independent coverage is NOT RUN.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** Generic Mathematical Ratio Calculator (tool-241-solvent-ratio); Carrier Oil Observation Log (tool-243-carrier-oil-viscosity-estimator); Measured Sample Density Calculator (tool-240-raw-powder-density-engine).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-242-dosage-unit-conversion-engine with stable ID mrx.tool.242-dosage-unit-conversion-engine.
2. Typed AnalysisUnitConversionInputV7Schema exposes 3 field(s); 1 carry explicit bounds.
3. Deterministic engine exports convertAnalysisUnit; no model-generated number overrides the engine.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — unit-factor table and Fahrenheit offset are correct in static review; runtime independent coverage is NOT RUN.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for General Measurement Unit Converter.** In: value, fromUnit | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for value.** In: value:number [-1..1]; fromUnit:other unbounded; toUnit:other unbounded | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for General Measurement Unit Converter.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for value.** In: changed value with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for value.** In: global metric/imperial preference + value | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for General Measurement Unit Converter.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for General Measurement Unit Converter.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Generic Mathematical Ratio Calculator (tool-241-solvent-ratio).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const canonical = input.value * from.factor + (from.offset ?? 0);` `const value = (canonical - (to.offset ?? 0)) / to.factor;`

---

### 243 — Carrier Oil Observation Log

- **Stable ID:** `mrx.tool.243-carrier-oil-viscosity-estimator`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-243-carrier-oil-viscosity-estimator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Records a user note only; does not estimate viscosity, rank oils, or advise on formulations.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-243-carrier-oil-viscosity-estimator.tsx`; engine `lib/tools/engines/tool-243-carrier-oil.v7.ts`; schema `lib/tools/schemas/tool-243-carrier-oil-viscosity-estimator.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** General Measurement Unit Converter (tool-242-dosage-unit-conversion-engine); Generic Input/Output Ratio Calculator (tool-244-purity-yield-estimator); Generic Mathematical Ratio Calculator (tool-241-solvent-ratio).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-243-carrier-oil-viscosity-estimator with stable ID mrx.tool.243-carrier-oil-viscosity-estimator.
2. Typed OilObservationInputV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordOilNote; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Carrier Oil Observation Log.** In: note, note | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for note.** In: note:string [1..400] | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Carrier Oil Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for note.** In: changed note with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for note.** In: global metric/imperial preference + note | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Carrier Oil Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Carrier Oil Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to General Measurement Unit Converter (tool-242-dosage-unit-conversion-engine).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 244 — Generic Input/Output Ratio Calculator

- **Stable ID:** `mrx.tool.244-purity-yield-estimator`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-244-purity-yield-estimator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Calculates output divided by input for user-defined values assumed to share units; no purity or chemical-yield claim.
- **Inputs:** input:number [?..1]; output:number [0..1]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-244-purity-yield-estimator.tsx`; engine `lib/tools/engines/tool-244-purity-yield.v7.ts`; schema `lib/tools/schemas/tool-244-purity-yield-estimator.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Carrier Oil Observation Log (tool-243-carrier-oil-viscosity-estimator); Storage Observation Log (tool-245-storage-stability-estimator); General Measurement Unit Converter (tool-242-dosage-unit-conversion-engine).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-244-purity-yield-estimator with stable ID mrx.tool.244-purity-yield-estimator.
2. Typed GenericRatioInputV7Schema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateGenericYield; no model-generated number overrides the engine.
4. Uses ARIA/role/sr-only attributes in the component.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Generic Input/Output Ratio Calculator.** In: input, output | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for input.** In: input:number [?..1]; output:number [0..1] | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Generic Input/Output Ratio Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for input.** In: changed input with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for input.** In: global metric/imperial preference + input | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Generic Input/Output Ratio Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Generic Input/Output Ratio Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Carrier Oil Observation Log (tool-243-carrier-oil-viscosity-estimator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const ratio = input.output / input.input;`

---

### 245 — Storage Observation Log

- **Stable ID:** `mrx.tool.245-storage-stability-estimator`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-245-storage-stability-estimator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Records a user note only; does not assess stability, shelf life, sterility, or product safety.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-245-storage-stability-estimator.tsx`; engine `lib/tools/engines/tool-245-storage-stability.v7.ts`; schema `lib/tools/schemas/tool-245-storage-stability-estimator.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Generic Input/Output Ratio Calculator (tool-244-purity-yield-estimator); Chemistry Observation Log (tool-246-homebrew-chemistry); Carrier Oil Observation Log (tool-243-carrier-oil-viscosity-estimator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-245-storage-stability-estimator with stable ID mrx.tool.245-storage-stability-estimator.
2. Typed StorageObservationInputV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordStorageNote; no model-generated number overrides the engine.
4. Uses ARIA/role/sr-only attributes in the component.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Storage Observation Log.** In: note, note | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for note.** In: note:string [1..400] | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Storage Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for note.** In: changed note with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for note.** In: global metric/imperial preference + note | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Storage Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Storage Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Generic Input/Output Ratio Calculator (tool-244-purity-yield-estimator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 246 — Chemistry Observation Log

- **Stable ID:** `mrx.tool.246-homebrew-chemistry`
- **Category / route / status:** Homebrew Chemistry · `/smarttools/homebrew-chemistry/tool-246-homebrew-chemistry` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Records a user note only; no chemistry calculation, laboratory result, synthesis, or preparation instructions.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-246-homebrew-chemistry.tsx`; engine `lib/tools/engines/tool-246-homebrew-chemistry.v7.ts`; schema `lib/tools/schemas/tool-246-homebrew-chemistry.v7.ts`; tests 2; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; no <main>.
- **Related:** Storage Observation Log (tool-245-storage-stability-estimator); Generic Input/Output Ratio Calculator (tool-244-purity-yield-estimator); Carrier Oil Observation Log (tool-243-carrier-oil-viscosity-estimator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/homebrew-chemistry/tool-246-homebrew-chemistry with stable ID mrx.tool.246-homebrew-chemistry.
2. Typed ChemistryObservationInputV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordChemistryNote; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Uses ARIA/role/sr-only attributes in the component.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No result narrative/interpretation was detected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Chemistry Observation Log.** In: note, note | Out: versioned formula sheet + the displayed result | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for note.** In: note:string [1..400] | Out: field-level validation messages + canonical value | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Chemistry Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for note.** In: changed note with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: published solubility/density reference; this domain stays educational and non-prescriptive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for note.** In: global metric/imperial preference + note | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Chemistry Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Chemistry Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Storage Observation Log (tool-245-storage-stability-estimator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---
