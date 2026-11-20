# R5 255-TOOL PER-TOOL DOSSIERS — HORMONAL HEALTH

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 24 catalog entries in this category (24 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### NAMED — HPTA Recovery Modeler

- **Stable ID:** `mrx.tool.hpta-recovery`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/hpta-recovery` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** HPTA suppression and recovery modeler
- **Inputs:** weeksOnCycle:number [4..24] int; compoundPotency:other unbounded; pctProtocol:other unbounded
- **Outputs:** timeline, totalTimelineWeeks, peakSuppressionPct, pctProtocolBoost, finalTestosteronePct
- **Evidence:** component `components/tools/hpta-recovery.tsx`; engine `lib/tools/engines/hpta-recovery.ts`; schema `lib/tools/schemas/hpta-recovery.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context no; sliders 1.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** Unvalidated Aromatization Scenario (aromatization-risk); Estradiol & Prolactin Record (tool-006-estrogen-prolactin); SHBG Modulator (tool-015-shbg-modulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/hpta-recovery with stable ID mrx.tool.hpta-recovery.
2. Typed HptaRecoveryInputSchema exposes 3 field(s); 1 carry explicit bounds.
3. Deterministic engine exports washoutWeeksFor, recoveryFraction, calculateHptaRecovery; no model-generated number overrides the engine.
4. 2 test file(s) matched; 5 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. One or more numeric fields lack .finite(); NaN/Infinity can reach the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for HPTA Recovery Modeler.** In: weeksOnCycle, compoundPotency | Out: versioned formula sheet + timeline | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weeksOnCycle.** In: weeksOnCycle:number [4..24] int; compoundPotency:other unbounded; pctProtocol:other unbounded | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for HPTA Recovery Modeler.** In: timeline, totalTimelineWeeks | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weeksOnCycle.** In: changed weeksOnCycle with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from timeline.** In: timeline + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weeksOnCycle.** In: global metric/imperial preference + weeksOnCycle | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for HPTA Recovery Modeler.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for HPTA Recovery Modeler.** In: timeline, totalTimelineWeeks | Out: one labelled chart/table with alt text | Source: engine values | State: PARTIAL — visual detected | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of timeline.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Unvalidated Aromatization Scenario (aromatization-risk).** In: approved subset of timeline | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const round2 = (value: number): number => Math.round(value * 100) / 100;` `Math.min(Math.max(value, min), max);` `const v = Number.isFinite(value) ? Math.round(value) : fallback;` `return clamp(Math.round(v), min, max);`

---

### NAMED — Unvalidated Aromatization Scenario

- **Stable ID:** `mrx.tool.aromatization-risk`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/aromatization-risk` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Illustrative arithmetic only; not an E2 prediction, clinical risk assessment, or treatment guide
- **Inputs:** weeksOnCycle:number [4..24] int; weeklyDoseMg:number [100..2000]; bodyFatPct:number [6..40]; compoundType:other unbounded; aiProtocol:other unbounded
- **Outputs:** timeline, waterRetentionRiskScore, crashRiskScore, totalTimelineWeeks
- **Evidence:** component `components/tools/aromatization-risk.tsx`; engine `lib/tools/engines/aromatization-risk.ts`; schema `lib/tools/schemas/aromatization-risk.ts`; tests 2; i18n none; measurement yes; narrative yes; AI result context no; sliders 3.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; no <main>.
- **Related:** HPTA Recovery Modeler (hpta-recovery); Estradiol & Prolactin Record (tool-006-estrogen-prolactin); SHBG Modulator (tool-015-shbg-modulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/aromatization-risk with stable ID mrx.tool.aromatization-risk.
2. Typed AromatizationRiskInputSchema exposes 5 field(s); 3 carry explicit bounds.
3. Deterministic engine exports bodyFatFactor, steadyStateE2For, calculateAromatizationRisk; no model-generated number overrides the engine.
4. 2 test file(s) matched; 8 numeric assertion(s) detected.
5. Reads the global measurement preference; canonical values can be separated from display units.

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No explicit assumptions array/contract.
5. No <main> landmark in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Unvalidated Aromatization Scenario.** In: weeksOnCycle, weeklyDoseMg | Out: versioned formula sheet + timeline | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weeksOnCycle.** In: weeksOnCycle:number [4..24] int; weeklyDoseMg:number [100..2000]; bodyFatPct:number [6..40]; compoundType:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Unvalidated Aromatization Scenario.** In: timeline, waterRetentionRiskScore | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weeksOnCycle.** In: changed weeksOnCycle with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from timeline.** In: timeline + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weeklyDoseMg.** In: global metric/imperial preference + weeksOnCycle | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Unvalidated Aromatization Scenario.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Unvalidated Aromatization Scenario.** In: timeline, waterRetentionRiskScore | Out: one labelled chart/table with alt text | Source: engine values | State: PARTIAL — visual detected | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of timeline.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to HPTA Recovery Modeler (hpta-recovery).** In: approved subset of timeline | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return 0.5 + bodyFatPct / 30;` `const round2 = (value: number): number => Math.round(value * 100) / 100;` `Math.min(Math.max(value, min), max);` `const doseScale = dose / REFERENCE_DOSE_MG;`

---

### 006 — Estradiol & Prolactin Record

- **Stable ID:** `mrx.tool.006-estrogen-prolactin`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-006-estrogen-prolactin` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Record context only; this tool does not assess lab values or suggest medication doses
- **Inputs:** e2Level:number [0..?]; e2Unit:enum enum(pg/mL\|pmol/L); prolactinLevel:number [0..?]; prolactinUnit:enum enum(ng/mL\|mIU/L)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-006-estrogen-prolactin.tsx`; engine `lib/tools/engines/tool-006-estrogen-prolactin.ts`; schema `lib/tools/schemas/tool-006-estrogen-prolactin.ts`; tests 1; i18n `i18n/tool-006-estrogen-prolactin.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; no <main>.
- **Related:** Unvalidated Aromatization Scenario (aromatization-risk); HPTA Recovery Modeler (hpta-recovery); SHBG Modulator (tool-015-shbg-modulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-006-estrogen-prolactin with stable ID mrx.tool.006-estrogen-prolactin.
2. Typed EstrogenProlactinInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateAromatizationRisk; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-006-estrogen-prolactin.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 1 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Estradiol & Prolactin Record.** In: e2Level, e2Unit | Out: versioned formula sheet + the displayed result | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for e2Level.** In: e2Level:number [0..?]; e2Unit:enum enum(pg/mL|pmol/L); prolactinLevel:number [0..?]; prolactinUnit:enum enum(ng/mL|mIU/L) | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Estradiol & Prolactin Record.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for e2Level.** In: changed e2Level with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for e2Level.** In: global metric/imperial preference + e2Level | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Estradiol & Prolactin Record.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Estradiol & Prolactin Record.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Unvalidated Aromatization Scenario (aromatization-risk).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 015 — SHBG Modulator

- **Stable ID:** `mrx.tool.015-shbg-modulator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-015-shbg-modulator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / rich-output
- **Purpose (catalog):** Estimate free hormone modulation
- **Inputs:** total_testosterone_ng_dL:number >0; shbg_nmol_L:number >0; albumin_g_dL:number >0
- **Outputs:** status, formula, free_testosterone_nmol_L, free_testosterone_ng_dL, free_testosterone_percentage, bioavailable_testosterone_nmol_L, bioavailable_testosterone_ng_dL, assumptions
- **Evidence:** component `components/tools/tool-015-shbg-modulator.tsx`; engine `lib/tools/engines/tool-015-shbg-modulator.ts`; schema `lib/tools/schemas/tool-015-shbg-modulator.ts`; tests 3; i18n `i18n/tool-015-shbg-modulator.json`; measurement yes; narrative yes; AI result context yes; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; ARIA present; no <main>.
- **Related:** HPTA Recovery Monitor (tool-018-hpta-recovery); Estradiol & Prolactin Record (tool-006-estrogen-prolactin); TRT Optimization (tool-023-trt-optimization).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-015-shbg-modulator with stable ID mrx.tool.015-shbg-modulator.
2. Typed SHBGInputSchema exposes 3 field(s); 0 carry explicit bounds.
3. Deterministic engine exports calculateSHBG; no model-generated number overrides the engine.
4. 3 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-015-shbg-modulator.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. No source/provenance text is encoded in the engine.
4. No <main> landmark in the component.
5. No chart/visual summary of the result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for SHBG Modulator.** In: total_testosterone_ng_dL, shbg_nmol_L | Out: versioned formula sheet + status | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for total_testosterone_ng_dL.** In: total_testosterone_ng_dL:number >0; shbg_nmol_L:number >0; albumin_g_dL:number >0 | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for SHBG Modulator.** In: status, formula | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for total_testosterone_ng_dL.** In: changed total_testosterone_ng_dL with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for albumin_g_dL.** In: global metric/imperial preference + total_testosterone_ng_dL | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for SHBG Modulator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for SHBG Modulator.** In: status, formula | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: PARTIAL — result findings reach the explainer, but no tool-specific prompt contract | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to HPTA Recovery Monitor (tool-018-hpta-recovery).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const totalT = input.total_testosterone_ng_dL * NG_DL_TO_NMOL_L * 1e-9;` `const shbg = input.shbg_nmol_L * 1e-9;` `const albuminGPerL = input.albumin_g_dL * 10;` `const albumin = albuminGPerL / ALBUMIN_MOLECULAR_WEIGHT_G_MOL;`

---

### 018 — HPTA Recovery Monitor

- **Stable ID:** `mrx.tool.018-hpta-recovery-monitor`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-018-hpta-recovery` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Track LH/FSH/testosterone recovery
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-018-hpta-recovery.tsx`; engine `lib/tools/engines/tool-018-hpta-recovery.ts`; schema `lib/tools/schemas/tool-018-hpta-recovery.ts`; tests 0; i18n `i18n/tool-018-hpta-recovery.json`; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; no ARIA; no <main>.
- **Related:** SHBG Modulator (tool-015-shbg-modulator); TRT Optimization (tool-023-trt-optimization); Estradiol & Prolactin Record (tool-006-estrogen-prolactin).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-018-hpta-recovery with stable ID mrx.tool.018-hpta-recovery-monitor.
2. Deterministic engine exports assessHPTARecovery; no model-generated number overrides the engine.
3. Tool-specific i18n file i18n/tool-018-hpta-recovery.json exists (7 AR / 7 EN keys).
4. Catalog carries an Arabic title alongside the English title.
5. Component file is present (75 lines); implementation can be inspected at components/tools/tool-018-hpta-recovery.tsx.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No result narrative/interpretation was detected.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for HPTA Recovery Monitor.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + the displayed result | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for HPTA Recovery Monitor.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for HPTA Recovery Monitor.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for HPTA Recovery Monitor.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to SHBG Modulator (tool-015-shbg-modulator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const durationDays = (lastDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);` `const durationWeeks = durationDays / 7;` `const tChange = ((lastT - firstT) / Math.max(firstT, 1)) * 100;` `changePerWeek = tChange / Math.max(durationWeeks, 1);`

---

### 023 — TRT Optimization

- **Stable ID:** `mrx.tool.023-trt-optimization`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-023-trt-optimization` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** TRT dosing optimization
- **Inputs:** none extracted (no typed input schema)
- **Outputs:** recommended_total_test_ng_dL, estimated_free_test_ratio, recommended_dose_mg_weekly, expected_hematocrit, e2_management, monitoring_schedule, risk_factors, protocol_tips
- **Evidence:** component `components/tools/tool-023-trt-optimization.tsx`; engine `lib/tools/engines/tool-023-trt-optimization.ts`; schema `lib/tools/schemas/tool-023-trt-optimization.ts`; tests 1; i18n `i18n/tool-023-trt-optimization.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; no ARIA; no <main>.
- **Related:** HPTA Recovery Monitor (tool-018-hpta-recovery); Advanced PCT Planner (tool-032-advanced-pct-planner); SHBG Modulator (tool-015-shbg-modulator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-023-trt-optimization with stable ID mrx.tool.023-trt-optimization.
2. Deterministic engine exports calculateTrtOptimization; no model-generated number overrides the engine.
3. 1 test file(s) matched; 0 numeric assertion(s) detected.
4. Tool-specific i18n file i18n/tool-023-trt-optimization.json exists (9 AR / 9 EN keys).
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for TRT Optimization.** In: the existing inputs, the existing inputs | Out: versioned formula sheet + recommended_total_test_ng_dL | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for the existing inputs.** In: none extracted (no typed input schema) | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for TRT Optimization.** In: recommended_total_test_ng_dL, estimated_free_test_ratio | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for the existing inputs.** In: changed the existing inputs with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from recommended_total_test_ng_dL.** In: recommended_total_test_ng_dL + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for the existing inputs.** In: global metric/imperial preference + the existing inputs | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for TRT Optimization.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for TRT Optimization.** In: recommended_total_test_ng_dL, estimated_free_test_ratio | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of recommended_total_test_ng_dL.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to HPTA Recovery Monitor (tool-018-hpta-recovery).** In: approved subset of recommended_total_test_ng_dL | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const doseAdjustment = testDifference / 10;` `const recommendedDose_mg_weekly = Math.min(Math.max(baseDose_mg_weekly, 80), 200);` `expectedHematocrit = Math.min(55, hematocrit_current + baseRaise);` `recommended_total_test_ng_dL: Math.round(targetTotalTest),`

---

### 032 — Advanced PCT Planner

- **Stable ID:** `mrx.tool.032-advanced-pct-planner`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-032-advanced-pct-planner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Advanced post-cycle therapy planning
- **Inputs:** compounds:array [1..8]; hcg_used_on_cycle:other unbounded; clearance_threshold:number [0.01..0.2] optional
- **Outputs:** washout_days, pct_start_date, suppression_load, serm_protocol, hcg_bridge, warnings
- **Evidence:** component `components/tools/tool-032-advanced-pct-planner.tsx`; engine `lib/tools/engines/tool-032-advanced-pct-planner.ts`; schema `lib/tools/schemas/tool-032-advanced-pct-planner.ts`; tests 1; i18n `i18n/tool-032-advanced-pct-planner.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** TRT Optimization (tool-023-trt-optimization); Estrogen Management Pro (tool-042-estrogen-management); Prolactin Management Pro (tool-043-prolactin-management).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-032-advanced-pct-planner with stable ID mrx.tool.032-advanced-pct-planner.
2. Typed PctPlannerInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports planAdvancedPCT; no model-generated number overrides the engine.
4. 1 test file(s) matched; 5 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-032-advanced-pct-planner.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Advanced PCT Planner.** In: compounds, hcg_used_on_cycle | Out: versioned formula sheet + washout_days | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compounds.** In: compounds:array [1..8]; hcg_used_on_cycle:other unbounded; clearance_threshold:number [0.01..0.2] optional | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Advanced PCT Planner.** In: washout_days, pct_start_date | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for clearance_threshold.** In: changed clearance_threshold with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from washout_days.** In: washout_days + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for compounds.** In: global metric/imperial preference + clearance_threshold | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Advanced PCT Planner.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Advanced PCT Planner.** In: washout_days, pct_start_date | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of washout_days.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to TRT Optimization (tool-023-trt-optimization).** In: approved subset of washout_days | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `return Math.log(1 / fraction) / Math.log(2);` `const w = Math.ceil(c.ester_half_life_days * halfLivesToClear(clearance_threshold));` `suppressionLoad = Math.round(suppressionLoad * 100) / 100;` `const pctStart = new Date(anchor + maxWashout * 86400000).toISOString().slice(0, 10);`

---

### 042 — Estrogen Management Pro

- **Stable ID:** `mrx.tool.042-estrogen-management`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-042-estrogen-management` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** E2 management with AI dosing
- **Inputs:** e2_pg_ml:number [5..500]; weekly_testosterone_mg:number [0..1000]; taking_ai:other unbounded; weekly_ai_dose_mg:number [0..7]; symptoms:array [?..10] enum(nipple_sensitivity\|water_retention\|mood_swings\|low_libido\|edema); body_fat_pct:number [5..60]
- **Outputs:** band, optimal_range, ai_delta_mg, warnings
- **Evidence:** component `components/tools/tool-042-estrogen-management.tsx`; engine `lib/tools/engines/tool-042-estrogen-management.ts`; schema `lib/tools/schemas/tool-042-estrogen-management.ts`; tests 1; i18n `i18n/tool-042-estrogen-management.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Prolactin Management Pro (tool-043-prolactin-management); TRT Lifetime Calculator (tool-046-trt-lifetime); Fertility Preservation Guide (tool-047-fertility-preservation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-042-estrogen-management with stable ID mrx.tool.042-estrogen-management.
2. Typed EstrogenInputSchema exposes 6 field(s); 5 carry explicit bounds.
3. Deterministic engine exports manageEstrogen; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-042-estrogen-management.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. Schema is not strict; unexpected keys are not rejected.
5. No explicit assumptions array/contract.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Estrogen Management Pro.** In: e2_pg_ml, weekly_testosterone_mg | Out: versioned formula sheet + band | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for e2_pg_ml.** In: e2_pg_ml:number [5..500]; weekly_testosterone_mg:number [0..1000]; taking_ai:other unbounded; weekly_ai_dose_mg:number [0..7]; +2 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Estrogen Management Pro.** In: band, optimal_range | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for e2_pg_ml.** In: changed e2_pg_ml with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from band.** In: band + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for e2_pg_ml, weekly_testosterone_mg, weekly_ai_dose_mg.** In: global metric/imperial preference + e2_pg_ml | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Estrogen Management Pro.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Estrogen Management Pro.** In: band, optimal_range | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of band.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Prolactin Management Pro (tool-043-prolactin-management).** In: approved subset of band | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 043 — Prolactin Management Pro

- **Stable ID:** `mrx.tool.043-prolactin-management`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-043-prolactin-management` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Prolactin control with cabergoline
- **Inputs:** prolactin_ng_ml:number [0.5..200]; uses_19_nor:other unbounded; weekly_cabergoline_mcg:number [0..1000]; symptoms:array [?..8] enum(libido_loss\|edema\|galactorrhea\|mood_low)
- **Outputs:** band, suggested_weekly_mcg, action, warnings
- **Evidence:** component `components/tools/tool-043-prolactin-management.tsx`; engine `lib/tools/engines/tool-043-prolactin-management.ts`; schema `lib/tools/schemas/tool-043-prolactin-management.ts`; tests 1; i18n `i18n/tool-043-prolactin-management.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Estrogen Management Pro (tool-042-estrogen-management); TRT Lifetime Calculator (tool-046-trt-lifetime); Fertility Preservation Guide (tool-047-fertility-preservation).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-043-prolactin-management with stable ID mrx.tool.043-prolactin-management.
2. Typed ProlactinInputSchema exposes 4 field(s); 3 carry explicit bounds.
3. Deterministic engine exports manageProlactin; no model-generated number overrides the engine.
4. 1 test file(s) matched; 2 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-043-prolactin-management.json exists (9 AR / 9 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Prolactin Management Pro.** In: prolactin_ng_ml, uses_19_nor | Out: versioned formula sheet + band | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for prolactin_ng_ml.** In: prolactin_ng_ml:number [0.5..200]; uses_19_nor:other unbounded; weekly_cabergoline_mcg:number [0..1000]; symptoms:array [?..8] enum(libido_loss|edema|galactorrhea|mood_low) | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Prolactin Management Pro.** In: band, suggested_weekly_mcg | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for prolactin_ng_ml.** In: changed prolactin_ng_ml with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from band.** In: band + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for prolactin_ng_ml.** In: global metric/imperial preference + prolactin_ng_ml | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Prolactin Management Pro.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Prolactin Management Pro.** In: band, suggested_weekly_mcg | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of band.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Estrogen Management Pro (tool-042-estrogen-management).** In: approved subset of band | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 046 — TRT Lifetime Calculator

- **Stable ID:** `mrx.tool.046-trt-lifetime`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-046-trt-lifetime` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Long-term TRT cost and health
- **Inputs:** age:number [18..90]; method:enum enum(injection\|gel\|cream); weekly_testosterone_mg:number [25..300]; years_on_trt:number [0..60]; monthly_med_cost_usd:number [0..1000]; monitoring_annual_cost_usd:number [0..5000]
- **Outputs:** injection_interval_days, cost_projection, lifetime_bloodwork_panels_10y, warnings
- **Evidence:** component `components/tools/tool-046-trt-lifetime.tsx`; engine `lib/tools/engines/tool-046-trt-lifetime.ts`; schema `lib/tools/schemas/tool-046-trt-lifetime.ts`; tests 2; i18n `i18n/tool-046-trt-lifetime.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Fertility Preservation Guide (tool-047-fertility-preservation); Prolactin Management Pro (tool-043-prolactin-management); Estrogen Management Pro (tool-042-estrogen-management).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-046-trt-lifetime with stable ID mrx.tool.046-trt-lifetime.
2. Typed TrtLifetimeInputSchema exposes 6 field(s); 5 carry explicit bounds.
3. Deterministic engine exports projectTrtLifetime; no model-generated number overrides the engine.
4. 2 test file(s) matched; 15 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-046-trt-lifetime.json exists (18 AR / 19 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for TRT Lifetime Calculator.** In: age, method | Out: versioned formula sheet + injection_interval_days | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [18..90]; method:enum enum(injection|gel|cream); weekly_testosterone_mg:number [25..300]; years_on_trt:number [0..60]; +2 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for TRT Lifetime Calculator.** In: injection_interval_days, cost_projection | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from injection_interval_days.** In: injection_interval_days + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weekly_testosterone_mg.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for TRT Lifetime Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for TRT Lifetime Calculator.** In: injection_interval_days, cost_projection | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of injection_interval_days.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Fertility Preservation Guide (tool-047-fertility-preservation).** In: approved subset of injection_interval_days | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `total_cost_usd: Math.round(monthly_med_cost_usd * 12 * years + monitoring_annual_cost_usd * years),`

---

### 047 — Fertility Preservation Guide

- **Stable ID:** `mrx.tool.047-fertility-preservation`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-047-fertility-preservation` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Fertility protection during cycles
- **Inputs:** age:number [18..60]; suppression_level:other unbounded; uses_hcg:other unbounded; planning_horizon_months:number [0..36]
- **Outputs:** fertility_impact_pct, warnings
- **Evidence:** component `components/tools/tool-047-fertility-preservation.tsx`; engine `lib/tools/engines/tool-047-fertility-preservation.ts`; schema `lib/tools/schemas/tool-047-fertility-preservation.ts`; tests 1; i18n `i18n/tool-047-fertility-preservation.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** TRT Lifetime Calculator (tool-046-trt-lifetime); Prolactin Management Pro (tool-043-prolactin-management); Estrogen Management Pro (tool-042-estrogen-management).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-047-fertility-preservation with stable ID mrx.tool.047-fertility-preservation.
2. Typed FertilityInputSchema exposes 4 field(s); 2 carry explicit bounds.
3. Deterministic engine exports assessFertility; no model-generated number overrides the engine.
4. 1 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-047-fertility-preservation.json exists (16 AR / 16 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Fertility Preservation Guide.** In: age, suppression_level | Out: versioned formula sheet + fertility_impact_pct | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for age.** In: age:number [18..60]; suppression_level:other unbounded; uses_hcg:other unbounded; planning_horizon_months:number [0..36] | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Fertility Preservation Guide.** In: fertility_impact_pct, warnings | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for age.** In: changed age with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from fertility_impact_pct.** In: fertility_impact_pct + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for age.** In: global metric/imperial preference + age | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Fertility Preservation Guide.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Fertility Preservation Guide.** In: fertility_impact_pct, warnings | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of fertility_impact_pct.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to TRT Lifetime Calculator (tool-046-trt-lifetime).** In: approved subset of fertility_impact_pct | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const fertility_impact_pct = Math.max(10, BASE_IMPACT[suppression_level] - (uses_hcg ? 15 : 0));` `const recovery_projection_months = Math.max(1, recovery);`

---

### 052 — Growth Hormone Protocol Planner

- **Stable ID:** `mrx.tool.052-growth-hormone-protocol-planner`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-052-growth-hormone-protocol-planner` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** GH dose scheduling and cost projection
- **Inputs:** bodyweight_kg:number [30..200]; weekly_iu_total:number [2..60]; protocol_pattern:enum enum(5on2off\|daily); months:number [1..24] int; cost_per_iu_usd:number [0..100]
- **Outputs:** daily_iu_on_days, rest_days_per_week, monthly_iu, cost_projection_6m_usd, warnings
- **Evidence:** component `components/tools/tool-052-growth-hormone-protocol-planner.tsx`; engine `lib/tools/engines/tool-052-growth-hormone-protocol-planner.ts`; schema `lib/tools/schemas/tool-052-growth-hormone-protocol-planner.ts`; tests 1; i18n `i18n/tool-052-growth-hormone-protocol-planner.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Insulin Conversion Calculator (tool-053-insulin-conversion-calculator); Fertility Preservation Guide (tool-047-fertility-preservation); Free Testosterone Manager (tool-057-free-testosterone-manager).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-052-growth-hormone-protocol-planner with stable ID mrx.tool.052-growth-hormone-protocol-planner.
2. Typed GrowthHormoneInputSchema exposes 5 field(s); 4 carry explicit bounds.
3. Deterministic engine exports planGrowthHormone; no model-generated number overrides the engine.
4. 1 test file(s) matched; 7 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-052-growth-hormone-protocol-planner.json exists (15 AR / 15 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Growth Hormone Protocol Planner.** In: bodyweight_kg, weekly_iu_total | Out: versioned formula sheet + daily_iu_on_days | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for bodyweight_kg.** In: bodyweight_kg:number [30..200]; weekly_iu_total:number [2..60]; protocol_pattern:enum enum(5on2off|daily); months:number [1..24] int; +1 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Growth Hormone Protocol Planner.** In: daily_iu_on_days, rest_days_per_week | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for bodyweight_kg.** In: changed bodyweight_kg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from daily_iu_on_days.** In: daily_iu_on_days + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for bodyweight_kg.** In: global metric/imperial preference + bodyweight_kg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Growth Hormone Protocol Planner.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Growth Hormone Protocol Planner.** In: daily_iu_on_days, rest_days_per_week | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of daily_iu_on_days.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Insulin Conversion Calculator (tool-053-insulin-conversion-calculator).** In: approved subset of daily_iu_on_days | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const daily_iu_on_days = Math.round((weekly_iu_total / DOSING_DAYS[protocol_pattern]) * 100) / 100;` `const monthly_iu = Math.round((weekly_iu_total * 52) / 12);` `const cost_projection_3m_usd = Math.round(monthly_iu * cost_per_iu_usd * 3);` `const cost_projection_6m_usd = Math.round(monthly_iu * cost_per_iu_usd * 6);`

---

### 053 — Insulin Conversion Calculator

- **Stable ID:** `mrx.tool.053-insulin-conversion-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-053-insulin-conversion-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Insulin IU vs volume syringe-mismatch safety
- **Inputs:** concentration:enum enum(u100\|u40); dose_iu:number [0.5..100]
- **Outputs:** volume_ml, draw_units_u100
- **Evidence:** component `components/tools/tool-053-insulin-conversion-calculator.tsx`; engine `lib/tools/engines/tool-053-insulin-conversion-calculator.ts`; schema `lib/tools/schemas/tool-053-insulin-conversion-calculator.ts`; tests 1; i18n `i18n/tool-053-insulin-conversion-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Growth Hormone Protocol Planner (tool-052-growth-hormone-protocol-planner); Free Testosterone Manager (tool-057-free-testosterone-manager); Androgenic Balance Calculator (tool-058-androgenic-balance-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-053-insulin-conversion-calculator with stable ID mrx.tool.053-insulin-conversion-calculator.
2. Typed InsulinConversionInputSchema exposes 2 field(s); 1 carry explicit bounds.
3. Deterministic engine exports convertInsulin; no model-generated number overrides the engine.
4. 1 test file(s) matched; 9 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-053-insulin-conversion-calculator.json exists (10 AR / 10 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Insulin Conversion Calculator.** In: concentration, dose_iu | Out: versioned formula sheet + volume_ml | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for concentration.** In: concentration:enum enum(u100|u40); dose_iu:number [0.5..100] | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Insulin Conversion Calculator.** In: volume_ml, draw_units_u100 | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for dose_iu.** In: changed dose_iu with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from volume_ml.** In: volume_ml + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for dose_iu.** In: global metric/imperial preference + dose_iu | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Insulin Conversion Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Insulin Conversion Calculator.** In: volume_ml, draw_units_u100 | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of volume_ml.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Growth Hormone Protocol Planner (tool-052-growth-hormone-protocol-planner).** In: approved subset of volume_ml | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const volume_ml = dose_iu / UNITS_PER_ML[concentration];` `const draw_units_u100 = Math.round(volume_ml * 100 * 10) / 10;` `const draw_units_u40 = Math.round(volume_ml * 40 * 10) / 10;` `volume_ml: Math.round(volume_ml * 1000) / 1000,`

---

### 057 — Free Testosterone Manager

- **Stable ID:** `mrx.tool.057-free-testosterone-manager`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-057-free-testosterone-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Free-T estimate and SHBG context
- **Inputs:** total_test_ng_dl:number [10..3000]; shbg_nmol_l:number [5..200]; albumin_g_dl:number [3..6]
- **Outputs:** free_t_pg_ml, free_t_pct, warnings
- **Evidence:** component `components/tools/tool-057-free-testosterone-manager.tsx`; engine `lib/tools/engines/tool-057-free-testosterone-manager.ts`; schema `lib/tools/schemas/tool-057-free-testosterone-manager.ts`; tests 1; i18n `i18n/tool-057-free-testosterone-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Androgenic Balance Calculator (tool-058-androgenic-balance-calculator); Androgen Receptor Optimizer (tool-059-androgen-receptor-optimizer); Insulin Conversion Calculator (tool-053-insulin-conversion-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-057-free-testosterone-manager with stable ID mrx.tool.057-free-testosterone-manager.
2. Typed FreeTestosteroneInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports estimateFreeTestosterone; no model-generated number overrides the engine.
4. 1 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-057-free-testosterone-manager.json exists (9 AR / 9 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Free Testosterone Manager.** In: total_test_ng_dl, shbg_nmol_l | Out: versioned formula sheet + free_t_pg_ml | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for total_test_ng_dl.** In: total_test_ng_dl:number [10..3000]; shbg_nmol_l:number [5..200]; albumin_g_dl:number [3..6] | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Free Testosterone Manager.** In: free_t_pg_ml, free_t_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for total_test_ng_dl.** In: changed total_test_ng_dl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from free_t_pg_ml.** In: free_t_pg_ml + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for albumin_g_dl.** In: global metric/imperial preference + total_test_ng_dl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Free Testosterone Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Free Testosterone Manager.** In: free_t_pg_ml, free_t_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of free_t_pg_ml.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Androgenic Balance Calculator (tool-058-androgenic-balance-calculator).** In: approved subset of free_t_pg_ml | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const total_nmol = total_test_ng_dl * T_NG_DL_TO_NMOL;` `const albumin_mol = (albumin_g_dl * 10) / ALBUMIN_MW_G_PER_MOL;` `const n = K_SHBG * shbg_nmol_l * 1e-9 + K_ALBUMIN * albumin_mol;` `const free_nmol = total_nmol / (1 + n);`

---

### 058 — Androgenic Balance Calculator

- **Stable ID:** `mrx.tool.058-androgenic-balance-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-058-androgenic-balance-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Androgenic/anabolic balance screen
- **Inputs:** dht_ng_dl:number [5..500]; testosterone_ng_dl:number [50..3000]; estradiol_pg_ml:number [2..500]
- **Outputs:** dht_t_ratio_pct, e2_t_ratio_pct, dht_band, e2_band, warnings
- **Evidence:** component `components/tools/tool-058-androgenic-balance-calculator.tsx`; engine `lib/tools/engines/tool-058-androgenic-balance-calculator.ts`; schema `lib/tools/schemas/tool-058-androgenic-balance-calculator.ts`; tests 1; i18n `i18n/tool-058-androgenic-balance-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Free Testosterone Manager (tool-057-free-testosterone-manager); Androgen Receptor Optimizer (tool-059-androgen-receptor-optimizer); Insulin Conversion Calculator (tool-053-insulin-conversion-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-058-androgenic-balance-calculator with stable ID mrx.tool.058-androgenic-balance-calculator.
2. Typed AndrogenicBalanceInputSchema exposes 3 field(s); 3 carry explicit bounds.
3. Deterministic engine exports assessAndrogenicBalance; no model-generated number overrides the engine.
4. 1 test file(s) matched; 4 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-058-androgenic-balance-calculator.json exists (10 AR / 10 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Androgenic Balance Calculator.** In: dht_ng_dl, testosterone_ng_dl | Out: versioned formula sheet + dht_t_ratio_pct | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for dht_ng_dl.** In: dht_ng_dl:number [5..500]; testosterone_ng_dl:number [50..3000]; estradiol_pg_ml:number [2..500] | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Androgenic Balance Calculator.** In: dht_t_ratio_pct, e2_t_ratio_pct | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for dht_ng_dl.** In: changed dht_ng_dl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from dht_t_ratio_pct.** In: dht_t_ratio_pct + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for estradiol_pg_ml.** In: global metric/imperial preference + dht_ng_dl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Androgenic Balance Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Androgenic Balance Calculator.** In: dht_t_ratio_pct, e2_t_ratio_pct | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of dht_t_ratio_pct.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Free Testosterone Manager (tool-057-free-testosterone-manager).** In: approved subset of dht_t_ratio_pct | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const dht_t_ratio_pct = round1((dht_ng_dl / testosterone_ng_dl) * 100);` `const e2_t_ratio_pct = round1((estradiol_pg_ml * 10) / testosterone_ng_dl);` `return Math.round(v * 10) / 10;`

---

### 059 — Androgen Receptor Optimizer

- **Stable ID:** `mrx.tool.059-androgen-receptor-optimizer`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-059-androgen-receptor-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Androgen receptor upregulation guidance
- **Inputs:** training_days_per_week:number [0..7]; sleep_hours:number [0..14]; weeks_since_last_break:number [0..104]; current_cycle_week:number [0..52]
- **Outputs:** score, recommendations
- **Evidence:** component `components/tools/tool-059-androgen-receptor-optimizer.tsx`; engine `lib/tools/engines/tool-059-androgen-receptor-optimizer.ts`; schema `lib/tools/schemas/tool-059-androgen-receptor-optimizer.ts`; tests 1; i18n `i18n/tool-059-androgen-receptor-optimizer.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Androgenic Balance Calculator (tool-058-androgenic-balance-calculator); Free Testosterone Manager (tool-057-free-testosterone-manager); Testicular Suppression Calculator (tool-063-testicular-suppression-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-059-androgen-receptor-optimizer with stable ID mrx.tool.059-androgen-receptor-optimizer.
2. Typed ReceptorResponsivenessInputSchema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports scoreReceptorResponsiveness; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-059-androgen-receptor-optimizer.json exists (10 AR / 10 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Androgen Receptor Optimizer.** In: training_days_per_week, sleep_hours | Out: versioned formula sheet + score | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for training_days_per_week.** In: training_days_per_week:number [0..7]; sleep_hours:number [0..14]; weeks_since_last_break:number [0..104]; current_cycle_week:number [0..52] | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Androgen Receptor Optimizer.** In: score, recommendations | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for training_days_per_week.** In: changed training_days_per_week with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from score.** In: score + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for training_days_per_week.** In: global metric/imperial preference + training_days_per_week | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Androgen Receptor Optimizer.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Androgen Receptor Optimizer.** In: score, recommendations | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Androgenic Balance Calculator (tool-058-androgenic-balance-calculator).** In: approved subset of score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `score = Math.min(100, Math.max(0, score));`

---

### 063 — Testicular Suppression Calculator

- **Stable ID:** `mrx.tool.063-testicular-suppression-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-063-testicular-suppression-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Suppression depth and recovery projection
- **Inputs:** weeks_on_cycle:number [0..104] int; suppression_tier:enum enum(mild\|moderate\|severe); age:number [18..70] int
- **Outputs:** suppression_depth_pct, estimated_recovery_months, band, warnings
- **Evidence:** component `components/tools/tool-063-testicular-suppression-calculator.tsx`; engine `lib/tools/engines/tool-063-testicular-suppression-calculator.ts`; schema `lib/tools/schemas/tool-063-testicular-suppression-calculator.ts`; tests 1; i18n `i18n/tool-063-testicular-suppression-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Estrogen Sensitivity Manager (tool-066-estrogen-sensitivity-manager); Androgen Receptor Optimizer (tool-059-androgen-receptor-optimizer); Estrogen Balance Calculator (tool-067-estrogen-balance-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-063-testicular-suppression-calculator with stable ID mrx.tool.063-testicular-suppression-calculator.
2. Typed SuppressionInputSchema exposes 3 field(s); 2 carry explicit bounds.
3. Deterministic engine exports projectSuppression; no model-generated number overrides the engine.
4. 1 test file(s) matched; 6 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-063-testicular-suppression-calculator.json exists (12 AR / 12 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Testicular Suppression Calculator.** In: weeks_on_cycle, suppression_tier | Out: versioned formula sheet + suppression_depth_pct | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for weeks_on_cycle.** In: weeks_on_cycle:number [0..104] int; suppression_tier:enum enum(mild|moderate|severe); age:number [18..70] int | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Testicular Suppression Calculator.** In: suppression_depth_pct, estimated_recovery_months | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for weeks_on_cycle.** In: changed weeks_on_cycle with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from suppression_depth_pct.** In: suppression_depth_pct + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for weeks_on_cycle.** In: global metric/imperial preference + weeks_on_cycle | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Testicular Suppression Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Testicular Suppression Calculator.** In: suppression_depth_pct, estimated_recovery_months | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of suppression_depth_pct.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Estrogen Sensitivity Manager (tool-066-estrogen-sensitivity-manager).** In: approved subset of suppression_depth_pct | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const suppression_depth_pct = Math.min(95, TIER_BASE_DEPTH[suppression_tier] + Math.floor(weeks_on_cycle / 8) * 5);` `const estimated_recovery_months = Math.max(2, Math.ceil(weeks_on_cycle / 8) + TIER_RECOVERY_MONTHS[suppression_tier] + (age >= 35 ? 2 : 0));`

---

### 066 — Estrogen Sensitivity Manager

- **Stable ID:** `mrx.tool.066-estrogen-sensitivity-manager`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-066-estrogen-sensitivity-manager` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** E2 sensitivity pattern management
- **Inputs:** e2_level_pg_ml:number [5..200]; water_retention_score:number [0..3] int; nipple_sensitivity:other unbounded; mood_lability_score:number [0..3] int; libido_impact:enum enum(none\|reduced\|crashed)
- **Outputs:** total_symptom_score, sensitivity_pattern, contextual_band, warnings
- **Evidence:** component `components/tools/tool-066-estrogen-sensitivity-manager.tsx`; engine `lib/tools/engines/tool-066-estrogen-sensitivity-manager.ts`; schema `lib/tools/schemas/tool-066-estrogen-sensitivity-manager.ts`; tests 2; i18n `i18n/tool-066-estrogen-sensitivity-manager.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Estrogen Balance Calculator (tool-067-estrogen-balance-calculator); Testicular Suppression Calculator (tool-063-testicular-suppression-calculator); Androgen Receptor Optimizer (tool-059-androgen-receptor-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-066-estrogen-sensitivity-manager with stable ID mrx.tool.066-estrogen-sensitivity-manager.
2. Typed EstrogenSensitivityInputSchema exposes 5 field(s); 3 carry explicit bounds.
3. Deterministic engine exports manageEstrogenSensitivity; no model-generated number overrides the engine.
4. 2 test file(s) matched; 7 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-066-estrogen-sensitivity-manager.json exists (22 AR / 22 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. Schema is not strict; unexpected keys are not rejected.
5. No source/provenance text is encoded in the engine.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Estrogen Sensitivity Manager.** In: e2_level_pg_ml, water_retention_score | Out: versioned formula sheet + total_symptom_score | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for e2_level_pg_ml.** In: e2_level_pg_ml:number [5..200]; water_retention_score:number [0..3] int; nipple_sensitivity:other unbounded; mood_lability_score:number [0..3] int; +1 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Estrogen Sensitivity Manager.** In: total_symptom_score, sensitivity_pattern | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for e2_level_pg_ml.** In: changed e2_level_pg_ml with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: PARTIAL — scenario wording exists | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from total_symptom_score.** In: total_symptom_score + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for e2_level_pg_ml.** In: global metric/imperial preference + e2_level_pg_ml | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Estrogen Sensitivity Manager.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Estrogen Sensitivity Manager.** In: total_symptom_score, sensitivity_pattern | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of total_symptom_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Estrogen Balance Calculator (tool-067-estrogen-balance-calculator).** In: approved subset of total_symptom_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 067 — Estrogen Balance Calculator

- **Stable ID:** `mrx.tool.067-estrogen-balance-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-067-estrogen-balance-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** E2/T ratio balance screen
- **Inputs:** total_testosterone_ng_dl:number [100..3000]; estradiol_pg_ml:number [5..250]
- **Outputs:** t_to_e2_ratio, balance_band, warnings
- **Evidence:** component `components/tools/tool-067-estrogen-balance-calculator.tsx`; engine `lib/tools/engines/tool-067-estrogen-balance-calculator.ts`; schema `lib/tools/schemas/tool-067-estrogen-balance-calculator.ts`; tests 1; i18n `i18n/tool-067-estrogen-balance-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Estrogen Sensitivity Manager (tool-066-estrogen-sensitivity-manager); Testicular Suppression Calculator (tool-063-testicular-suppression-calculator); Androgen Receptor Optimizer (tool-059-androgen-receptor-optimizer).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-067-estrogen-balance-calculator with stable ID mrx.tool.067-estrogen-balance-calculator.
2. Typed EstrogenBalanceInputSchema exposes 2 field(s); 2 carry explicit bounds.
3. Deterministic engine exports calculateEstrogenBalance; no model-generated number overrides the engine.
4. 1 test file(s) matched; 3 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-067-estrogen-balance-calculator.json exists (7 AR / 7 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. No what-if or scenario surface.
4. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
5. Schema is not strict; unexpected keys are not rejected.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Estrogen Balance Calculator.** In: total_testosterone_ng_dl, estradiol_pg_ml | Out: versioned formula sheet + t_to_e2_ratio | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for total_testosterone_ng_dl.** In: total_testosterone_ng_dl:number [100..3000]; estradiol_pg_ml:number [5..250] | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Estrogen Balance Calculator.** In: t_to_e2_ratio, balance_band | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for total_testosterone_ng_dl.** In: changed total_testosterone_ng_dl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from t_to_e2_ratio.** In: t_to_e2_ratio + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for estradiol_pg_ml.** In: global metric/imperial preference + total_testosterone_ng_dl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Estrogen Balance Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Estrogen Balance Calculator.** In: t_to_e2_ratio, balance_band | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of t_to_e2_ratio.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Estrogen Sensitivity Manager (tool-066-estrogen-sensitivity-manager).** In: approved subset of t_to_e2_ratio | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const t_to_e2_ratio = Math.round((total_testosterone_ng_dl / estradiol_pg_ml) * 10) / 10;`

---

### 086 — Cortisol Stress Calculator

- **Stable ID:** `mrx.tool.086-cortisol-stress-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-086-cortisol-stress-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Stress/cortisol pattern scoring
- **Inputs:** morning_exhaustion_rating:number [1..10]; evening_tired_but_wired:other unbounded; daily_caffeine_cups:number [0..15]; resting_heart_rate_variability_trend:enum enum(normal_high\|reduced\|chronically_low); intense_training_sessions_weekly:number [0..14]; life_stressors_level:enum enum(low\|moderate\|high\|extreme)
- **Outputs:** cortisol_stress_load_score, catabolic_risk_tier, warnings
- **Evidence:** component `components/tools/tool-086-cortisol-stress-calculator.tsx`; engine `lib/tools/engines/tool-086-cortisol-stress-calculator.ts`; schema `lib/tools/schemas/tool-086-cortisol-stress-calculator.ts`; tests 2; i18n `i18n/tool-086-cortisol-stress-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Female Hormone Balance Calculator (tool-090-female-hormone-balance-calculator); Female Health Observation Log (tool-091-female-health-optimizer); Female Androgen Dose Evidence Check (tool-092-female-dosage-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-086-cortisol-stress-calculator with stable ID mrx.tool.086-cortisol-stress-calculator.
2. Typed CortisolStressInputSchema exposes 6 field(s); 3 carry explicit bounds.
3. Deterministic engine exports calculateCortisolStress; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-086-cortisol-stress-calculator.json exists (19 AR / 19 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 2 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Cortisol Stress Calculator.** In: morning_exhaustion_rating, evening_tired_but_wired | Out: versioned formula sheet + cortisol_stress_load_score | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for morning_exhaustion_rating.** In: morning_exhaustion_rating:number [1..10]; evening_tired_but_wired:other unbounded; daily_caffeine_cups:number [0..15]; resting_heart_rate_variability_trend:enum enum(normal_high|reduced|chronically_low); +2 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Cortisol Stress Calculator.** In: cortisol_stress_load_score, catabolic_risk_tier | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for morning_exhaustion_rating.** In: changed morning_exhaustion_rating with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from cortisol_stress_load_score.** In: cortisol_stress_load_score + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for morning_exhaustion_rating.** In: global metric/imperial preference + morning_exhaustion_rating | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Cortisol Stress Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Cortisol Stress Calculator.** In: cortisol_stress_load_score, catabolic_risk_tier | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of cortisol_stress_load_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Female Hormone Balance Calculator (tool-090-female-hormone-balance-calculator).** In: approved subset of cortisol_stress_load_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `load += Math.round((morning_exhaustion_rating / 10) * 25);` `load = Math.max(5, load - 10);` `const finalScore = Math.max(0, Math.min(100, load));`

---

### 090 — Female Hormone Balance Calculator

- **Stable ID:** `mrx.tool.090-female-hormone-balance-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-090-female-hormone-balance-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Female hormone balance screen
- **Inputs:** cycle_length_days:number [21..45]; pms_symptom_severity:enum enum(none_mild\|moderate\|severe); androgenic_signs_present:other unbounded; cycle_regularity:enum enum(strictly_regular\|mildly_variable\|highly_irregular_or_absent); high_stress_or_rapid_weight_loss:other unbounded
- **Outputs:** hormone_harmony_score, androgenic_virilization_risk, warnings
- **Evidence:** component `components/tools/tool-090-female-hormone-balance-calculator.tsx`; engine `lib/tools/engines/tool-090-female-hormone-balance-calculator.ts`; schema `lib/tools/schemas/tool-090-female-hormone-balance-calculator.ts`; tests 2; i18n `i18n/tool-090-female-hormone-balance-calculator.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Female Health Observation Log (tool-091-female-health-optimizer); Female Androgen Dose Evidence Check (tool-092-female-dosage-calculator); Cortisol Stress Calculator (tool-086-cortisol-stress-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-090-female-hormone-balance-calculator with stable ID mrx.tool.090-female-hormone-balance-calculator.
2. Typed FemaleHormoneBalanceInputSchema exposes 5 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateFemaleHormoneBalance; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-090-female-hormone-balance-calculator.json exists (17 AR / 17 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Primary output includes raw JSON via JSON.stringify rather than a typed user report.
3. 2 test file(s) exist but no numeric/golden assertion was found.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Female Hormone Balance Calculator.** In: cycle_length_days, pms_symptom_severity | Out: versioned formula sheet + hormone_harmony_score | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for cycle_length_days.** In: cycle_length_days:number [21..45]; pms_symptom_severity:enum enum(none_mild|moderate|severe); androgenic_signs_present:other unbounded; cycle_regularity:enum enum(strictly_regular|mildly_variable|highly_irregular_or_absent); +1 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Female Hormone Balance Calculator.** In: hormone_harmony_score, androgenic_virilization_risk | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for cycle_length_days.** In: changed cycle_length_days with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from hormone_harmony_score.** In: hormone_harmony_score + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for high_stress_or_rapid_weight_loss.** In: global metric/imperial preference + cycle_length_days | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Female Hormone Balance Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Female Hormone Balance Calculator.** In: hormone_harmony_score, androgenic_virilization_risk | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of hormone_harmony_score.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Female Health Observation Log (tool-091-female-health-optimizer).** In: approved subset of hormone_harmony_score | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const finalScore = Math.max(0, Math.min(100, score));`

---

### 091 — Female Health Observation Log

- **Stable ID:** `mrx.tool.091-female-health-optimizer`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-091-female-health-optimizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Record female health observations without clinical-state inference
- **Inputs:** energy_availability_adequacy:enum enum(adequate\|marginal\|severely_deficient); ferritin_status:enum enum(optimal\|borderline_low\|clinical_deficiency_suspected); bone_stress_or_joint_pains:other unbounded; thyroid_cold_intolerance:other unbounded; resistance_training_sessions_per_week:number [0..7]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-091-female-health-optimizer.tsx`; engine `lib/tools/engines/tool-091-female-health-optimizer.ts`; schema `lib/tools/schemas/tool-091-female-health-optimizer.ts`; tests 2; i18n `i18n/tool-091-female-health-optimizer.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; <main> present.
- **Related:** Female Hormone Balance Calculator (tool-090-female-hormone-balance-calculator); Female Androgen Dose Evidence Check (tool-092-female-dosage-calculator); Cortisol Stress Calculator (tool-086-cortisol-stress-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-091-female-health-optimizer with stable ID mrx.tool.091-female-health-optimizer.
2. Typed FemaleHealthOptimizerInputSchema exposes 5 field(s); 1 carry explicit bounds.
3. Deterministic engine exports optimizeFemaleHealth; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-091-female-health-optimizer.json exists (34 AR / 34 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Female Health Observation Log.** In: energy_availability_adequacy, ferritin_status | Out: versioned formula sheet + the displayed result | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for energy_availability_adequacy.** In: energy_availability_adequacy:enum enum(adequate|marginal|severely_deficient); ferritin_status:enum enum(optimal|borderline_low|clinical_deficiency_suspected); bone_stress_or_joint_pains:other unbounded; thyroid_cold_intolerance:other unbounded; +1 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Female Health Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for resistance_training_sessions_per_week.** In: changed resistance_training_sessions_per_week with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for energy_availability_adequacy.** In: global metric/imperial preference + resistance_training_sessions_per_week | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Female Health Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Female Health Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Female Hormone Balance Calculator (tool-090-female-hormone-balance-calculator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 092 — Female Androgen Dose Evidence Check

- **Stable ID:** `mrx.tool.092-female-dosage-calculator`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-092-female-dosage-calculator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Dose safety and duration remain unavailable until a validated product-specific model is supported
- **Inputs:** compound:enum enum(oxandrolone\|methenolone_acetate\|nandrolone_decanoate\|testosterone_propionate); proposed_weekly_dose_mg:number [1..250]; cycle_experience:enum enum(first_time\|intermediate_experience\|advanced_risk_aware); monitoring_bloodwork_planned:other unbounded
- **Outputs:** status, reason, resultOrigin, message
- **Evidence:** component `components/tools/tool-092-female-dosage-calculator.tsx`; engine `lib/tools/engines/tool-092-female-dosage-calculator.ts`; schema `lib/tools/schemas/tool-092-female-dosage-calculator.ts`; tests 2; i18n `i18n/tool-092-female-dosage-calculator.json`; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** tool i18n JSON present; global measurement not integrated; ARIA present; <main> present.
- **Related:** Female Health Observation Log (tool-091-female-health-optimizer); Female Hormone Balance Calculator (tool-090-female-hormone-balance-calculator); Cortisol Stress Calculator (tool-086-cortisol-stress-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-092-female-dosage-calculator with stable ID mrx.tool.092-female-dosage-calculator.
2. Typed FemaleDosageCalculatorInputSchema exposes 4 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateFemaleDosage; no model-generated number overrides the engine.
4. 2 test file(s) matched; 0 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-092-female-dosage-calculator.json exists (1 AR / 1 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. 2 test file(s) exist but no numeric/golden assertion was found.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Female Androgen Dose Evidence Check.** In: compound, proposed_weekly_dose_mg | Out: versioned formula sheet + status | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for compound.** In: compound:enum enum(oxandrolone|methenolone_acetate|nandrolone_decanoate|testosterone_propionate); proposed_weekly_dose_mg:number [1..250]; cycle_experience:enum enum(first_time|intermediate_experience|advanced_risk_aware); monitoring_bloodwork_planned:other unbounded | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Female Androgen Dose Evidence Check.** In: status, reason | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for proposed_weekly_dose_mg.** In: changed proposed_weekly_dose_mg with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from status.** In: status + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for proposed_weekly_dose_mg.** In: global metric/imperial preference + proposed_weekly_dose_mg | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Female Androgen Dose Evidence Check.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Female Androgen Dose Evidence Check.** In: status, reason | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of status.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Female Health Observation Log (tool-091-female-health-optimizer).** In: approved subset of status | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---

### 104 — Thyroid Function & Metabolic Rate Dynamics

- **Stable ID:** `mrx.tool.104-thyroid-metabolic-rate-dynamics`
- **Category / route / status:** Hormonal Health · `/smarttools/hormonal-health/tool-104-thyroid-metabolic-rate-dynamics` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** TSH/T3/T4 metabolic dynamics
- **Inputs:** tsh_miu_l:number [0.01..100]; free_t4_ng_dl:number [0.1..10]; free_t3_pg_ml:number [0.5..20]; age_years:number [18..120] int; sex:enum enum(male\|female); weight_kg:number [30..250]; height_cm:number [120..230]
- **Outputs:** bmr_kcal, adjusted_bmr_kcal, metabolic_multiplier, thyroid_state, interpretation_flags, scope_notice
- **Evidence:** component `components/tools/tool-104-thyroid-metabolic-rate-dynamics.tsx`; engine `lib/tools/engines/tool-104-thyroid-metabolic-rate-dynamics.ts`; schema `lib/tools/schemas/tool-104-thyroid-metabolic-rate-dynamics.ts`; tests 2; i18n `i18n/tool-104-thyroid-metabolic-rate-dynamics.json`; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
- **Language / measurement:** tool i18n JSON present; global measurement flag read; no ARIA; no <main>.
- **Related:** Female Androgen Dose Evidence Check (tool-092-female-dosage-calculator); Female Health Observation Log (tool-091-female-health-optimizer); Female Hormone Balance Calculator (tool-090-female-hormone-balance-calculator).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/hormonal-health/tool-104-thyroid-metabolic-rate-dynamics with stable ID mrx.tool.104-thyroid-metabolic-rate-dynamics.
2. Typed ThyroidInputSchema exposes 7 field(s); 6 carry explicit bounds.
3. Deterministic engine exports mifflinStJeorBmr, thyroidMetabolicMultiplier, calculateThyroidDynamics; no model-generated number overrides the engine.
4. 2 test file(s) matched; 11 numeric assertion(s) detected.
5. Tool-specific i18n file i18n/tool-104-thyroid-metabolic-rate-dynamics.json exists (33 AR / 33 EN keys).

**Five evidence-backed gaps**
1. Formula status NOT RUN: numeric assertions exist, but no independent, sourced golden case was verified in this read-only pass.
2. No what-if or scenario surface.
3. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.
4. No explicit assumptions array/contract.
5. No ARIA/role/sr-only affordance detected in the component.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Thyroid Function & Metabolic Rate Dynamics.** In: tsh_miu_l, free_t4_ng_dl | Out: versioned formula sheet + bmr_kcal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for tsh_miu_l.** In: tsh_miu_l:number [0.01..100]; free_t4_ng_dl:number [0.1..10]; free_t3_pg_ml:number [0.5..20]; age_years:number [18..120] int; +3 more | Out: field-level validation messages + canonical value | Source: clinical guideline or assay reference with units, population and date | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Thyroid Function & Metabolic Rate Dynamics.** In: bmr_kcal, adjusted_bmr_kcal | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for tsh_miu_l.** In: changed tsh_miu_l with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from bmr_kcal.** In: bmr_kcal + declared goal if present | Out: status vs validated range/goal | Source: clinical guideline or assay reference with units, population and date | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for free_t3_pg_ml, weight_kg, height_cm.** In: global metric/imperial preference + tsh_miu_l | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Thyroid Function & Metabolic Rate Dynamics.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — JSON exists; result/AI strings not proven complete | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Thyroid Function & Metabolic Rate Dynamics.** In: bmr_kcal, adjusted_bmr_kcal | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of bmr_kcal.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Female Androgen Dose Evidence Check (tool-092-female-dosage-calculator).** In: approved subset of bmr_kcal | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;` `return Math.round(sex === 'male' ? base + 5 : base - 161);` `const ratio = freeT4NgDl / midpoint;` `const delta = (ratio - 1) * 0.3;`

---
