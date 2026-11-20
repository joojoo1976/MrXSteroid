# R5 RESULT NARRATIVE AND PERSONALIZATION AUDIT

**What the user actually receives after pressing calculate**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Verdict

The platform is still primarily a **number/JSON dispenser**, not a result-report platform. 125 implemented tools put raw JSON in the primary output path; 53 of those are record-only; 84 have no narrative/interpretation signal at all. Only 34 of 264 tools publish a typed result summary that the AI layer can explain. The 12-point narrative contract in the governing prompt is not implemented as a shared typed contract.

There are good counter-examples: the three R5 pilots produce engine-derived category interpretation, goal-specific advice, what-if rows and localized caveats; tool-143 refuses to evaluate when the label/observed ranges are incomplete; tool-236 states that user-entered nutrition labels are not independently verified. These are the pattern to replicate, not a template to paste.

## 2. Narrative contract coverage

| # | Required section | Evidence signal | Implemented coverage | Status |
|---:|---|---|---:|---|
| 1 | Primary result (value + unit + classification) | output fields + engine | 140/264 have a typed result contract; all render some surface | PARTIAL |
| 2 | Personalized interpretation | `narrativeWords` | 180/264 (68.2%) | PARTIAL |
| 3 | Why / calculation method | assumptions/source signals | 71/264 assumptions; 60/264 source | FAIL |
| 4 | Current status vs range/goal | status/range fields | not consistently typed | NOT RUN |
| 5 | General guidance | advice strings | present in some tools; not schema-bound | PARTIAL |
| 6 | Specialized guidance | medical/domain text | inconsistent; one unsafe case (tool-010) | FAIL |
| 7 | Prioritized recommendations | recommendation arrays | present in 20 typed outputs | PARTIAL |
| 8 | Scenarios / What-If | `hasScenarios` | 28/264 (10.6%) | FAIL |
| 9 | Forecast with horizon/uncertainty | `hasForecast` | 89/264 contain a forecast signal; almost none expose horizon + uncertainty | FAIL |
| 10 | Limitations and safety | disclaimer/assumptions | 186/264 have a disclaimer signal | PARTIAL |
| 11 | Evidence and provenance | source/version | 60/264 | FAIL |
| 12 | Next step / connected tool | related-tool link | not systematic | NOT RUN |

A signal is not a contract. For example, a component that contains the word “summary” is counted as narrative-capable, but it may still render `{"status":"CALCULATED"}`. The dossier flags this per tool.

## 3. Five result panels

| Panel | Domain rule | Current state |
|---|---|---|
| Smart Advice | specific to the current result and declared goal | only a minority; often static copy |
| Prediction / What Happens Next | only a supported forecast/scenario; never invented | 28 scenario surfaces; forecast horizon/uncertainty largely absent |
| Medical / Specialist Guidance | only for relevant health tools; non-diagnostic; escalation | present but inconsistent; tool-010 violates the non-prescriptive boundary |
| Current Status | current measured/calculated state vs validated range/goal | rarely a typed panel; usually one label |
| Current Feeling / User Check-in | only user-reported feeling/symptom, never inferred from BMI/weight/water | not implemented as a distinct contract; do not infer from anthropometrics |

**Do not** add all five panels to every tool. Record/log tools get a data-quality and timeline panel; conversion tools get a result/precision panel; PK tools get a scenario/time panel; medical tools get a status/escalation panel. A panel with no validated input is omitted with a reason.

## 4. What is actually wrong

### 4.1 Operational metadata is presented as the report

The audit found primary output paths that expose `status`, `resultType`, `inputClassification`, input counts or raw JSON. These belong in a compact provenance/details area. Examples:

- tool-200 / tool-235: one bounded `items` array → `<pre>{JSON.stringify(result)}</pre>`.
- tool-100 “Comprehensive Report Generator”: accepts five scores and returns an echo; it does not generate a report.
- tool-030: totals plus hardcoded PCT costs; no explanation of what the total means for the user’s plan.
- tool-106: twelve result fields, but duplicate water-retention values and no interpretation of what the glycogen/water numbers imply.

### 4.2 The AI layer is result-blind for 230 tools

`components/smarttools/SmartToolsAIExperience.tsx` and `AIInsightPanel.tsx` provide a consent-gated explainer with a deterministic fallback. The API route `app/api/smarttools/ai/explain/route.ts` and `server/ai/explain.ts` answer “explain this tool”, not “explain my result”. Only 34 tools pass typed findings via `ToolOutputSummary`/`AIInsightContext`. For the other 230, any personalization would be ungrounded, so it is correctly absent — but that leaves the AI promise mostly unmet.

### 4.3 A single unsafe example defines the safety ceiling

tool-010 emits “AI strongly recommends aromatase inhibitor support and bloodwork within 48 hours” (L105) and “aromatase inhibitor consideration required” (L142). This is not a narrative defect; it is a release-blocking medical-advice defect. The AI must never turn a heuristic into a prescription.

### 4.4 Language and measurement change the report, not just the label

142 tools have no tool-specific i18n JSON and 138 do not read the global measurement control. Even a good English report can remain English in Arabic mode or show a canonical kg value after the user switched to lb. The R5 pilots prove the correct pattern: values derive from the engine, the display unit changes, the canonical value does not.

## 5. Narrative capability by category

| Category | Impl. | Narrative | No narrative | Raw JSON | Record-only | AI findings |
|---|---:|---:|---:|---:|---:|---:|
| AI Behavior | 6 | 4 | 2 | 0 | 0 | 0 |
| AI Nutrition Vision | 9 | 5 | 4 | 7 | 7 | 0 |
| Body Composition | 10 | 7 | 3 | 1 | 0 | 3 |
| Contest Prep | 3 | 1 | 2 | 2 | 2 | 0 |
| Cycle Management | 13 | 9 | 4 | 4 | 0 | 0 |
| Homebrew Chemistry | 8 | 3 | 5 | 0 | 0 | 0 |
| Hormonal Health | 24 | 23 | 1 | 16 | 0 | 1 |
| Injection & Formulation | 8 | 7 | 1 | 1 | 0 | 1 |
| Measurement Conversion | 2 | 2 | 0 | 1 | 0 | 1 |
| Medical Monitoring | 73 | 45 | 28 | 62 | 22 | 0 |
| Nutrition | 19 | 13 | 6 | 0 | 0 | 8 |
| Pharmacokinetics | 41 | 27 | 14 | 16 | 9 | 2 |
| Platform AI | 7 | 6 | 1 | 1 | 0 | 2 |
| Reproductive Wellbeing | 19 | 11 | 8 | 14 | 13 | 0 |
| Training & Recovery | 22 | 17 | 5 | 0 | 0 | 16 |
| **Total** | **264** | **180** | **84** | **125** | **53** | **34** |

## 6. Tool-specific examples

### 6.1 BMI (R5, PASS pending acceptance)

The result is the calculated BMI plus a CDC adult screening band, an explicit “what BMI can/cannot tell you” section, an adult-applicability notice, a boundary gap, a ±5 kg what-if table and category advice. It does not infer feelings or diagnose. Imperial input 154.3 lb / 68.9 in returns the same 22.9 as 70 kg / 175 cm. This is the reference quality bar for a simple deterministic tool.

### 6.2 Protein Needs (R5, PASS pending acceptance)

At 70 kg / activity 1.2 / maintain the engine returns 113 g/day; the report shows maintain/bulk/cut scenarios 113/141/156 g/day, a selected marker, goal-specific advice and a caution. Imperial mode shows 154.3 lb in the interpretation, not the raw canonical kg.

### 6.3 Water Intake (R5, PASS pending acceptance)

70 kg / activity 1.2 → 2.5 L/day (2500 mL); scenarios 2.45/2.5/2.55 L/day; imperial adds 85 US fl oz derived from the same 2.5 L result (84.5 → 85).

### 6.4 Tool-030 (FAIL)

The engine returns compound/ancillary/PCT totals and a grand total, but the PCT line is hardcoded at $50/$60 per week without a source and `budget_savings_tips` is empty. A user cannot tell whether the total is a quote, a range or a scenario.

### 6.5 Tool-106 (FAIL)

The result exposes `water_retention_liters` and `total_water_retention_liters` with the same value, a 600 g cap that is not sourced, and an unused `training_load` input. The narrative cannot explain a model whose own fields disagree.

### 6.6 Tool-143 (PASS static)

If the label range or observed range is incomplete, it returns `not_evaluable` and states “No storage range was assumed.” If ranges are complete, it compares them and explicitly says the comparison does not determine product condition. This is the correct “refuse rather than invent” pattern.

### 6.7 Tool-236 (PASS static)

It multiplies per-serving values by servings, sums totals, computes 4/4/9 macro energy and reports the label-calorie difference. Its limitations say the nutrition values and source references are user-entered and not independently verified. This is honest arithmetic, not a personalized meal plan.

## 7. Required narrative design (per tool, not a shared template)

1. **Primary result:** one value, unit and classification from the engine.
2. **Personal interpretation:** what this value means for the specific inputs; no generic filler.
3. **Why:** the executed formula/rule and the inputs that materially changed the result.
4. **Status:** compare with a validated range or declared goal only when the tool has one.
5. **Guidance:** domain-specific, actionable, non-prescriptive; omit if the evidence does not support it.
6. **Scenarios:** recompute the same engine with 2–3 meaningful values; label as scenario, not forecast.
7. **Limitations:** concise; detailed safety text in an expandable section.
8. **Provenance:** source, version, assumptions; “not verified” where true.
9. **Next step:** a related approved tool or a plain-language action; no automatic external action.

A result panel must be driven by a typed contract, not by searching the rendered text. Each panel must show an explicit insufficient-data state. Do not infer feelings, pain, diagnosis or treatment from BMI, weight, water intake or any other weak proxy.

## 8. Test matrix for this workstream

| Test | Acceptance |
|---|---|
| Narrative snapshot per locale | every sentence maps to a result/input/source; no “CALCULATED” as the main explanation |
| Value traceability | every displayed number equals the engine output after unit conversion |
| Scenario recomputation | changing one input changes only the dependent scenarios; canonical value preserved |
| AI grounding | provider success, provider failure, consent denied, adversarial prompt; no number divergence |
| Safety | no diagnosis/treatment/prescription language; tool-010 regression test |
| Insufficient data | explicit state; no invented value |
| Record-only | table/timeline, not raw JSON; no clinical inference |
| Accessibility | heading order, labels, live-region result announcement, axe |

## 9. Status and next action

**Current status: PARTIAL/FAIL.** The R5 pilots meet the bar; the remaining 261 implemented tools do not. The first work after R5 acceptance is not “add AI to 261 tools”; it is to establish the typed result/narrative contract, fix the five confirmed formula defects and tool-010’s unsafe advice, then apply the contract batch by batch.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
