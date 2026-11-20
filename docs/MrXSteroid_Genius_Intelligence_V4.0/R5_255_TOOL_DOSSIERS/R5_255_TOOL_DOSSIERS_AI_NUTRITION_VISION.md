# R5 255-TOOL PER-TOOL DOSSIERS — AI NUTRITION VISION

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 9 catalog entries in this category (9 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### 225 — User Entry Aggregator

- **Stable ID:** `mrx.tool.225-comprehensive-report-generator`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-225-comprehensive-report-generator` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record or entry aggregation only; no diagnosis or medical advice.
- **Inputs:** entries:array [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-225-comprehensive-report-generator.tsx`; engine `lib/tools/engines/tool-225-comprehensive-report.v7.ts`; schema `lib/tools/schemas/tool-225-comprehensive-report.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Data Record (tool-228-health-data-fusion-hub); Body Reference Record (tool-231-body-composition-vision-engine); Meal Description Record (tool-232-meal-vision-scanner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-225-comprehensive-report-generator with stable ID mrx.tool.225-comprehensive-report-generator.
2. Typed ReportSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports assembleUserReport; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 300 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for User Entry Aggregator.** In: current entries record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for User Entry Aggregator.** In: entries | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — ReportSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for User Entry Aggregator.** In: recorded entries | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for User Entry Aggregator.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for User Entry Aggregator.** In: entries | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for User Entry Aggregator.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for User Entry Aggregator.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for User Entry Aggregator.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for User Entry Aggregator.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Data Record (tool-228-health-data-fusion-hub).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 228 — Data Record

- **Stable ID:** `mrx.tool.228-health-data-fusion-hub`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-228-health-data-fusion-hub` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** entries:array [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-228-health-data-fusion-hub.tsx`; engine `lib/tools/engines/tool-228-health-fusion.v7.ts`; schema `lib/tools/schemas/tool-228-health-fusion.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** User Entry Aggregator (tool-225-comprehensive-report-generator); Body Reference Record (tool-231-body-composition-vision-engine); Meal Description Record (tool-232-meal-vision-scanner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-228-health-data-fusion-hub with stable ID mrx.tool.228-health-data-fusion-hub.
2. Typed FusionSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordFusionEntries; no model-generated number overrides the engine.
4. Captures up to 300 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Data Record.** In: current entries record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Data Record.** In: entries | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — FusionSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Data Record.** In: recorded entries | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Data Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Data Record.** In: entries | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Data Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Data Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Data Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Data Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to User Entry Aggregator (tool-225-comprehensive-report-generator).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 231 — Body Reference Record

- **Stable ID:** `mrx.tool.231-body-composition-vision-engine`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-231-body-composition-vision-engine` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User reference or entry record only; no diagnosis or automated recommendation.
- **Inputs:** reference:string [1..300]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-231-body-composition-vision-engine.tsx`; engine `lib/tools/engines/tool-231-body-vision.v7.ts`; schema `lib/tools/schemas/tool-231-body-vision.v7.ts`; tests 1; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — tests exist but contain no numeric assertion against a reference value.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Meal Description Record (tool-232-meal-vision-scanner); Food List Record (tool-233-food-substitution-engine); Food Note Record (tool-234-food-quality-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-231-body-composition-vision-engine with stable ID mrx.tool.231-body-composition-vision-engine.
2. Typed ImageSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordBodyImage; no model-generated number overrides the engine.
4. 1 test file(s) matched; 0 numeric assertion(s) detected.
5. Engine text contains a source/reference signal.

**Five evidence-backed gaps**
1. Formula status NOT RUN: tests exist but contain no numeric assertion against a reference value.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. 1 test file(s) exist but no numeric/golden assertion was found.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Body Reference Record.** In: current reference record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Body Reference Record.** In: reference | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — ImageSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Body Reference Record.** In: recorded reference | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Body Reference Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Body Reference Record.** In: reference | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Body Reference Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Body Reference Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Body Reference Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Body Reference Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Meal Description Record (tool-232-meal-vision-scanner).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 232 — Meal Description Record

- **Stable ID:** `mrx.tool.232-meal-vision-scanner`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-232-meal-vision-scanner` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User reference or entry record only; no diagnosis or automated recommendation.
- **Inputs:** description:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-232-meal-vision-scanner.tsx`; engine `lib/tools/engines/tool-232-meal-vision.v7.ts`; schema `lib/tools/schemas/tool-232-meal-vision.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Body Reference Record (tool-231-body-composition-vision-engine); Food List Record (tool-233-food-substitution-engine); Food Note Record (tool-234-food-quality-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-232-meal-vision-scanner with stable ID mrx.tool.232-meal-vision-scanner.
2. Typed MealSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordMealDescription; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Meal Description Record.** In: current description record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Meal Description Record.** In: description | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — MealSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Meal Description Record.** In: recorded description | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Meal Description Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Meal Description Record.** In: description | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Meal Description Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Meal Description Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Meal Description Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Meal Description Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Body Reference Record (tool-231-body-composition-vision-engine).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 233 — Food List Record

- **Stable ID:** `mrx.tool.233-food-substitution-engine`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-233-food-substitution-engine` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User reference or entry record only; no diagnosis or automated recommendation.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-233-food-substitution-engine.tsx`; engine `lib/tools/engines/tool-233-food-substitution.v7.ts`; schema `lib/tools/schemas/tool-233-food-substitution.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Meal Description Record (tool-232-meal-vision-scanner); Food Note Record (tool-234-food-quality-score); Body Reference Record (tool-231-body-composition-vision-engine).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-233-food-substitution-engine with stable ID mrx.tool.233-food-substitution-engine.
2. Typed FoodSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordFoodItems; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 100 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Food List Record.** In: current items record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Food List Record.** In: items | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — FoodSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Food List Record.** In: recorded items | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Food List Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Food List Record.** In: items | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Food List Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Food List Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Food List Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Food List Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Meal Description Record (tool-232-meal-vision-scanner).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 234 — Food Note Record

- **Stable ID:** `mrx.tool.234-food-quality-score`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-234-food-quality-score` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User reference or entry record only; no diagnosis or automated recommendation.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-234-food-quality-score.tsx`; engine `lib/tools/engines/tool-234-food-quality.v7.ts`; schema `lib/tools/schemas/tool-234-food-quality.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Food List Record (tool-233-food-substitution-engine); Basket Record (tool-235-grocery-basket-optimizer); Meal Description Record (tool-232-meal-vision-scanner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-234-food-quality-score with stable ID mrx.tool.234-food-quality-score.
2. Typed QualitySchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordFoodQuality; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Food Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Food Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — QualitySchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Food Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Food Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Food Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Food Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Food Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Food Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Food Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Food List Record (tool-233-food-substitution-engine).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 235 — Basket Record

- **Stable ID:** `mrx.tool.235-grocery-basket-optimizer`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-235-grocery-basket-optimizer` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User reference or entry record only; no diagnosis or automated recommendation.
- **Inputs:** items:array [1..100]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-235-grocery-basket-optimizer.tsx`; engine `lib/tools/engines/tool-235-grocery-basket.v7.ts`; schema `lib/tools/schemas/tool-235-grocery-basket.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Food Note Record (tool-234-food-quality-score); Food List Record (tool-233-food-substitution-engine); Meal Description Record (tool-232-meal-vision-scanner).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-235-grocery-basket-optimizer with stable ID mrx.tool.235-grocery-basket-optimizer.
2. Typed BasketSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordBasket; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Captures up to 100 bounded entries without a network call.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Basket Record.** In: current items record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Basket Record.** In: items | Out: strict entry schema with dates/units where relevant | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — BasketSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Basket Record.** In: recorded items | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Basket Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Basket Record.** In: items | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Basket Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Basket Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Basket Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Basket Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Food Note Record (tool-234-food-quality-score).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 236 — Restaurant Menu Label Calculator

- **Stable ID:** `mrx.tool.236-restaurant-macro-navigator`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-236-restaurant-macro-navigator` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Totals user-entered restaurant label values by servings; no missing-value estimates or meal recommendations.
- **Inputs:** items:array [1..12]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-236-restaurant-macro-navigator.tsx`; engine `lib/tools/engines/tool-236-restaurant-macro.v7.ts`; schema `lib/tools/schemas/tool-236-restaurant-macro-navigator.v7.ts`; tests 2; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **PASS** — per-serving x servings and 4/4/9 kcal arithmetic are correct statically; user-supplied labels are explicitly not verified; no independent golden test.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Intra-Workout Product Label Calculator (tool-237-intra-workout-volumizer); Basket Record (tool-235-grocery-basket-optimizer); Food Note Record (tool-234-food-quality-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-236-restaurant-macro-navigator with stable ID mrx.tool.236-restaurant-macro-navigator.
2. Typed RestaurantMacroInputV7Schema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports calculateRestaurantLabelTotals; no model-generated number overrides the engine.
4. 2 test file(s) matched; 2 numeric assertion(s) detected.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Residual formula limitation: the PASS covers internal/static correctness only — per-serving x servings and 4/4/9 kcal arithmetic are correct statically; user-supplied labels are explicitly not verified; no independent golden test.
2. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
3. Does not read the global measurement preference; unit switching is absent or local.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Restaurant Menu Label Calculator.** In: items, items | Out: versioned formula sheet + the displayed result | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — formula present, provenance incomplete | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for items.** In: items:array [1..12] | Out: field-level validation messages + canonical value | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Restaurant Menu Label Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for items.** In: changed items with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for items.** In: global metric/imperial preference + items | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Restaurant Menu Label Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Restaurant Menu Label Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Intra-Workout Product Label Calculator (tool-237-intra-workout-volumizer).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** `const labelCalories = roundToTwo(item.caloriesPerServing * item.servings);` `const proteinGrams = roundToTwo(item.proteinGramsPerServing * item.servings);` `const carbohydrateGrams = roundToTwo(item.carbohydrateGramsPerServing * item.servings);` `const fatGrams = roundToTwo(item.fatGramsPerServing * item.servings);`

---

### 237 — Intra-Workout Product Label Calculator

- **Stable ID:** `mrx.tool.237-intra-workout-volumizer`
- **Category / route / status:** AI Nutrition Vision · `/smarttools/ai-nutrition-vision/tool-237-intra-workout-volumizer` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / numeric-minimal
- **Purpose (catalog):** Scales user-entered beverage label values and recorded servings; provides no hydration or nutrient plan.
- **Inputs:** productName:string [1..100]; sourceReference:string [1..500]; servingVolumeMl:number [0.1..5000]; servingsConsumed:number [0.01..50]; caloriesPerServing:number [0..10000]; proteinGramsPerServing:number [0..1000]; carbohydrateGramsPerServing:number [0..1000]; fatGramsPerServing:number [0..500]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-237-intra-workout-volumizer.tsx`; engine `lib/tools/engines/tool-237-intra-workout.v7.ts`; schema `lib/tools/schemas/tool-237-intra-workout-volumizer.v7.ts`; tests 0; i18n none; measurement yes; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement flag read; ARIA present; <main> present.
- **Related:** Restaurant Menu Label Calculator (tool-236-restaurant-macro-navigator); Basket Record (tool-235-grocery-basket-optimizer); Food Note Record (tool-234-food-quality-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/ai-nutrition-vision/tool-237-intra-workout-volumizer with stable ID mrx.tool.237-intra-workout-volumizer.
2. Typed IntraWorkoutLabelInputV7Schema exposes 8 field(s); 8 carry explicit bounds.
3. Deterministic engine exports calculateIntraWorkoutLabelTotals; no model-generated number overrides the engine.
4. Reads the global measurement preference; canonical values can be separated from display units.
5. Contains some result interpretation/advice/scenario wording rather than a bare number.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. No what-if or scenario surface.
5. The AI explainer receives no typed result findings; it can only explain the tool, not the user’s result.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Intra-Workout Product Label Calculator.** In: productName, sourceReference | Out: versioned formula sheet + the displayed result | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for productName.** In: productName:string [1..100]; sourceReference:string [1..500]; servingVolumeMl:number [0.1..5000]; servingsConsumed:number [0.01..50]; +4 more | Out: field-level validation messages + canonical value | Source: validated food-composition database plus an explicit per-image confidence protocol | State: PARTIAL — bounds exist | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Intra-Workout Product Label Calculator.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for servingVolumeMl.** In: changed servingVolumeMl with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: validated food-composition database plus an explicit per-image confidence protocol | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for servingVolumeMl, caloriesPerServing.** In: global metric/imperial preference + servingVolumeMl | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: PARTIAL — reads preference; field-level metadata not proven | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Intra-Workout Product Label Calculator.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Intra-Workout Product Label Calculator.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Restaurant Menu Label Calculator (tool-236-restaurant-macro-navigator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---
