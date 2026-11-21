# R5 255-TOOL PER-TOOL DOSSIERS — CONTEST PREP

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

Scope: 3 catalog entries in this category (3 implemented, 0 planned).
Each dossier records status, inputs/outputs, formula status, five strengths, five gaps and ten tool-specific AI proposals. Proposals are designs, not implemented features. Runtime verification is NOT RUN unless explicitly marked.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

### 229 — Carbohydrate Note Record

- **Stable ID:** `mrx.tool.229-glycogen-supercompensation-modeler`
- **Category / route / status:** Contest Prep · `/smarttools/contest-prep/tool-229-glycogen-supercompensation-modeler` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-229-glycogen-supercompensation-modeler.tsx`; engine `lib/tools/engines/tool-229-glycogen.v7.ts`; schema `lib/tools/schemas/tool-229-glycogen.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Peak Week Note Record (tool-230-peak-week-manipulator); Fiber-Related Performance Observation Log (tool-238-fiber-type-adaptation-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/contest-prep/tool-229-glycogen-supercompensation-modeler with stable ID mrx.tool.229-glycogen-supercompensation-modeler.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordGlycogenNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Carbohydrate Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Carbohydrate Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Carbohydrate Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Carbohydrate Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Carbohydrate Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Carbohydrate Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Carbohydrate Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Carbohydrate Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Carbohydrate Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Peak Week Note Record (tool-230-peak-week-manipulator).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 230 — Peak Week Note Record

- **Stable ID:** `mrx.tool.230-peak-week-manipulator`
- **Category / route / status:** Contest Prep · `/smarttools/contest-prep/tool-230-peak-week-manipulator` · **FAIL** (record-only: echoes user input as raw JSON; advertised analyzer/modeler logic absent)
- **Publication / depth:** implemented / record-only
- **Purpose (catalog):** User record only; no diagnosis, prediction, or medical advice.
- **Inputs:** note:string [1..400]
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-230-peak-week-manipulator.tsx`; engine `lib/tools/engines/tool-230-peak-week.v7.ts`; schema `lib/tools/schemas/tool-230-peak-week.v7.ts`; tests 0; i18n none; measurement no; narrative no; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; no ARIA; no <main>.
- **Related:** Carbohydrate Note Record (tool-229-glycogen-supercompensation-modeler); Fiber-Related Performance Observation Log (tool-238-fiber-type-adaptation-score).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/contest-prep/tool-230-peak-week-manipulator with stable ID mrx.tool.230-peak-week-manipulator.
2. Typed NoteSchema exposes 1 field(s); 1 carry explicit bounds.
3. Deterministic engine exports recordPeakWeekNote; no model-generated number overrides the engine.
4. Captures up to 400 bounded entries without a network call.
5. Catalog carries an Arabic title alongside the English title.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. Record-only path renders raw JSON and does not perform the analyzer/modeler function named by the slug.
3. No test file covers this tool.
4. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
5. Does not read the global measurement preference; unit switching is absent or local.

**Ten customized AI development proposals**
**P1. Owner purpose reconciliation for Peak Week Note Record.** In: current note record | Out: decision "record" vs "calculator" | Source: catalog description + owner directive | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: silently changing the tool's promise | Fallback: keep record-only and relabel | Test: owner decision record | Accept: title, slug and UI promise agree.
**P2. Typed capture schema for Peak Week Note Record.** In: note | Out: strict entry schema with dates/units where relevant | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: PARTIAL — NoteSchema exists but output is raw JSON | Cost: S | Consent: none | Risk: free-text ambiguity | Fallback: reject malformed entry | Test: boundary/round-trip tests | Accept: zero untyped fields in the exported record.
**P3. Deterministic entry summary for Peak Week Note Record.** In: recorded note | Out: count, date span, completeness | Source: record fields only | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: implying clinical change | Fallback: show raw table | Test: fixture with 0/1/many entries | Accept: summary values equal record counts.
**P4. Trend view for Peak Week Note Record.** In: timestamped entries | Out: neutral trend/table, no diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: causal claim from sparse data | Fallback: table only | Test: sparse/irregular series | Accept: insufficient-data state is explicit.
**P5. Data-quality panel for Peak Week Note Record.** In: note | Out: missing fields, duplicates, stale entries | Source: schema rules | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false completeness score | Fallback: list missing fields | Test: malformed fixtures | Accept: every warning maps to a rule.
**P6. Measurement support for Peak Week Note Record.** In: unitless record fields | Out: canonical/display units where applicable | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: label-only unit swap | Fallback: unitless capture | Test: metric/imperial round-trip | Accept: canonical value unchanged across switches.
**P7. Bilingual/RTL record UI for Peak Week Note Record.** In: locale | Out: AR/EN labels, dates, RTL | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English leakage | Fallback: explicit unsupported message | Test: locale matrix | Accept: no English fragment in AR mode.
**P8. Accessible record editor for Peak Week Note Record.** In: keyboard/screen-reader/touch | Out: labelled fields, focus, 44px targets | Source: WCAG 2.2 AA | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: unlabelled controls | Fallback: native form controls | Test: axe + keyboard | Accept: zero critical axe findings.
**P9. Consent-gated record summarizer for Peak Week Note Record.** In: user-selected entries | Out: neutral summary, never diagnosis | Source: record fields only | State: NOT IMPLEMENTED | Cost: M | Consent: explicit selection + consent | Risk: medical inference | Fallback: deterministic completeness summary | Test: refusal/injection cases | Accept: no diagnosis/treatment language and no unseen data.
**P10. Record handoff to Carbohydrate Note Record (tool-229-glycogen-supercompensation-modeler).** In: approved record fields | Out: context-aware link | Source: platform contract | State: NOT IMPLEMENTED | Cost: S | Consent: user action | Risk: leaking entries | Fallback: plain link | Test: boundary contract | Accept: only selected fields cross.

**Static formula signals (evidence, not validation):** none extracted.

---

### 238 — Fiber-Related Performance Observation Log

- **Stable ID:** `mrx.tool.238-fiber-type-adaptation-score`
- **Category / route / status:** Contest Prep · `/smarttools/contest-prep/tool-238-fiber-type-adaptation-score` · **PARTIAL** (implemented, but formula, i18n, measurement, narrative and/or AI result context incomplete)
- **Publication / depth:** implemented / standard
- **Purpose (catalog):** Records user observations and marks fiber-type scoring NOT_AVAILABLE because no validated inference model is provided.
- **Inputs:** exercise:string [1..100]; testMethod:string [1..200]; observedResult:string [1..400]; sourceReference:string [?..500] optional
- **Outputs:** no typed result contract extracted; UI output is not schema-bound
- **Evidence:** component `components/tools/tool-238-fiber-type-adaptation-score.tsx`; engine `lib/tools/engines/tool-238-fiber-type.v7.ts`; schema `lib/tools/schemas/tool-238-fiber-type-adaptation-score.v7.ts`; tests 0; i18n none; measurement no; narrative yes; AI result context no; sliders 0.
- **Formula status:** **NOT RUN** — no test file and no independent golden case; only static formula signals were captured.
- **Language / measurement:** no tool i18n JSON; global measurement not integrated; ARIA present; <main> present.
- **Related:** Peak Week Note Record (tool-230-peak-week-manipulator); Carbohydrate Note Record (tool-229-glycogen-supercompensation-modeler).

**Five evidence-backed strengths**
1. Registered canonical route /smarttools/contest-prep/tool-238-fiber-type-adaptation-score with stable ID mrx.tool.238-fiber-type-adaptation-score.
2. Typed FiberObservationInputV7Schema exposes 4 field(s); 4 carry explicit bounds.
3. Deterministic engine exports recordFiberObservation; no model-generated number overrides the engine.
4. Contains some result interpretation/advice/scenario wording rather than a bare number.
5. Renders a <main> landmark; the route shell does not have to supply it.

**Five evidence-backed gaps**
1. Formula status NOT RUN: no test file and no independent golden case; only static formula signals were captured.
2. No test file covers this tool.
3. No tool-specific Arabic/English JSON; visible copy can remain English in Arabic mode.
4. Does not read the global measurement preference; unit switching is absent or local.
5. No what-if or scenario surface.

**Ten customized AI development proposals**
**P1. Formula evidence copilot for Fiber-Related Performance Observation Log.** In: exercise, testMethod | Out: versioned formula sheet + the displayed result | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: NOT IMPLEMENTED | Cost: M | Consent: no user data | Risk: changing a valid constant without evidence | Fallback: keep current engine | Test: 3 independent golden cases + boundary cases | Accept: each constant has a source, date and population, and output matches the reference within stated precision.
**P2. Boundary and unit coach for exercise.** In: exercise:string [1..100]; testMethod:string [1..200]; observedResult:string [1..400]; sourceReference:string [?..500] optional | Out: field-level validation messages + canonical value | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: arbitrary min/max | Fallback: reject out-of-range input | Test: min-1/min/max/max+1/NaN/Infinity | Accept: every invalid case is blocked with a localized message and no result.
**P3. Result narrative for Fiber-Related Performance Observation Log.** In: the displayed result, the displayed result | Out: primary result, why, status, limitation | Source: engine result only | State: PARTIAL — some narrative exists; not a typed contract | Cost: S | Consent: none | Risk: generic filler or invented meaning | Fallback: deterministic template | Test: every number traced to a field | Accept: no sentence without a result/input/source anchor; no unsupported prediction.
**P4. What-if scenario for exercise.** In: changed exercise with other inputs fixed | Out: side-by-side scenarios + delta | Source: same engine, no new constants | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: scenario presented as forecast | Fallback: hide panel | Test: monotonicity + fixed-point cases | Accept: scenarios recompute from canonical values and are labelled as scenarios.
**P5. Current-status panel from the displayed result.** In: the displayed result + declared goal if present | Out: status vs validated range/goal | Source: coach-reviewed contest-prep reference; no dehydration/diuretic protocol | State: NOT IMPLEMENTED | Cost: S | Consent: none | Risk: false classification | Fallback: show value only | Test: below/within/above boundaries | Accept: classification matches the reference table and shows insufficient-data state.
**P6. Measurement-aware layer for exercise.** In: global metric/imperial preference + exercise | Out: synchronized label, bounds, step, value | Source: SI conversion factors | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: renaming units without rescaling | Fallback: metric-only with explicit notice | Test: switch before/after input, round-trip, slider+number sync | Accept: canonical value never changes and displayed bounds rescale correctly.
**P7. Bilingual/RTL result contract for Fiber-Related Performance Observation Log.** In: locale + result fields | Out: AR/EN copy, RTL, localized errors | Source: approved glossary | State: PARTIAL — inline bilingual strings | Cost: M | Consent: none | Risk: English fragments or translated IDs | Fallback: explicit unsupported notice | Test: full locale matrix | Accept: no English fragment in AR mode; stable IDs/routes unchanged.
**P8. Visual summary for Fiber-Related Performance Observation Log.** In: the displayed result, the displayed result | Out: one labelled chart/table with alt text | Source: engine values | State: NOT IMPLEMENTED | Cost: M | Consent: none | Risk: visual implies causality/forecast | Fallback: accessible table | Test: rendered values == engine values; alt text | Accept: chart cannot display a value the engine did not produce.
**P9. Grounded AI explanation of the displayed result.** In: typed result findings + locale | Out: explanation that cites the actual values | Source: engine result only | State: NOT IMPLEMENTED — explainer has no result context | Cost: S | Consent: explicit AI consent (existing flow) | Risk: model invents advice or overrides a number | Fallback: deterministic explanation | Test: consent denied, provider failure, adversarial prompt | Accept: zero numeric divergence and no diagnosis/treatment language.
**P10. Cross-tool handoff to Peak Week Note Record (tool-230-peak-week-manipulator).** In: approved subset of the displayed result | Out: prefilled related tool or deep link | Source: platform contract | State: NOT IMPLEMENTED | Cost: M | Consent: user action | Risk: leaking sensitive context | Fallback: plain route link | Test: boundary + route contract | Accept: only approved fields cross and the user can review before submit.

**Static formula signals (evidence, not validation):** none extracted.

---
