# R5 FORMULA INTELLIGENCE AND REFERENCE AUDIT

**What the engine actually calculates, what is proven, and what remains unverified**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Verdict

Of 264 implemented tools, **11 have a formula that passed this audit’s static/runtime check**, **5 have a confirmed defect**, and **248 are NOT RUN** because no independent, sourced golden case was available. That is the honest result: the audit did not “verify” a formula by finding a test file, and it did not rewrite a formula to make a tool look intelligent.

| Status | Tools | Meaning |
|---|---:|---|
| PASS (static or R5 runtime) | 11 | formula/rule read and checked; scope limits stated |
| FAIL (confirmed) | 5 | defect reproduced from source; must not ship unchanged |
| NOT RUN | 248 | no independent reference case in this read-only pass |
| BLOCKED | 4 | planned entries with no engine |

## 2. Method and evidence standard

1. Locate the engine actually referenced by the catalog (re-export shims resolved).
2. Extract exported functions, Zod input/result fields and formula-bearing lines.
3. Read the engine and compare the executed expression with the stated model.
4. Where possible, recompute a hand case or use the recorded live R5 case.
5. Record the source, population, units, assumptions, boundaries and rounding.
6. Treat existing tests as evidence of code-path stability, **not** as an independent reference.

**PASS** requires a readable formula/rule, correct units and boundaries, and a check that is independent of the implementation. Where only a static derivation was possible, the dossier says so. **NOT RUN** is not a soft pass.

## 3. Confirmed defects

| Tool | Defect | Exact evidence | Impact |
|---|---|---|---|
| 020 Genetic Potential | arbitrary point score presented as “genetic potential” | `tool-020-genetic-potential.ts` L15–L24: `let score = 60` then ±points for age/body type/BMI; no source | false precision; a user may treat a heuristic as a biological ceiling |
| 030 Cycle Cost | PCT cost hardcoded without source | `tool-030-cycle-cost-calculator.ts` L75–L76: `pctWeeks * 50`, `pctWeeks * 60` “Assumed”; L101 `budget_savings_tips: []` | a financial total looks authoritative but is partly an assumption |
| 100 Comprehensive Report | “report” is an input echo | `tool-100-comprehensive-report-generator.ts` L1–L3: result `extends` input and returns `{...input,status:'RECORDED'}` | the advertised report capability does not exist |
| 106 Glycogen/Water | arbitrary cap and duplicate accounting | `tool-106-...ts` L63 cap `600`; L77–L78 duplicate water fields; L26 `training_load` never used | the model’s own fields disagree; input has no effect |
| 010 Compound Stack | no engine function; unsafe advice; invalid unit | `tool-010-compound-stack-builder.ts` = types only; component L105/L141/L142 advice; “estradiol equivalent” in mg | release-blocking medical advice and an untestable calculation |

## 4. Verified samples (static or R5 runtime)

| Tool | Status | What was checked | Evidence |
|---|---|---|---|
| BMI (R5) | PASS runtime | BMI = kg/m²; CDC adult bands; 70 kg/1.75 m → 22.9; imperial 154.3 lb/68.9 in → 22.9 | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` §5.1 |
| Protein Needs (R5) | PASS runtime | g/kg bands; 70 kg/activity 1.2 → 113 g/day; scenarios 113/141/156; imperial retains value | §5.2 |
| Water Intake (R5) | PASS runtime | mL/kg + activity; 70 kg/1.2 → 2.5 L; 2.45/2.5/2.55; 85 US fl oz | §5.3 |
| 016 Half-Life | PASS static | `t = t½·ln(remaining)/ln(0.5)`; strict `gt(0).lt(100)`; existing test recomputes the same expression (not independent) | `lib/tools/engines/tool-016-half-life-calculator.ts`; `.test.ts` |
| 236 Restaurant Macro | PASS static | per-serving × servings; 4/4/9 macro energy; label-vs-macro difference; limitations correctly mark user data unverified | `tool-236-restaurant-macro.v7.ts` |
| 143 Storage Excursion | PASS static | range comparison only; refuses `not_evaluable` without label/observed ranges; no stability claim | `tool-143-...v6.ts` |
| 140 / 242 Unit Conversion | PASS static | factor table and Fahrenheit offset read; no runtime independent case | `tool-140...v6.ts`, `tool-242-unit-conversion.v7.ts` |
| 131 / 149 / 251 Physique Scenarios | PASS scope | constant-rate arithmetic; constant-lean-mass assumption disclosed; not an outcome prediction; reference accuracy NOT RUN | engine files |

The R5 PASS is still pending owner acceptance. The other PASS statuses mean “the formula/rule is internally correct and honestly scoped”, not “clinically validated”.

## 5. Systemic formula-risk counts (implemented tools)

| Signal | Tools | Consequence |
|---|---:|---|
| No test file | 91 | no regression protection |
| Tests but no numeric/golden assertion | 65 | tests do not check the number |
| No source/provenance | 204 | formula origin cannot be audited |
| No explicit assumptions | 193 | scope and population are unclear |
| Schema not strict | 85 | unexpected keys accepted |
| No finite guard | 10 | NaN/Infinity can propagate |
| No typed schema | 11 | validation boundary unclear |
| Engine has no calculation function | 10 | logic inline or absent; hard to test |

### 5.1 Tools with no finite guard

- named · HPTA Recovery Modeler · `mrx.tool.hpta-recovery` · hpta-recovery
- 20 · Genetic Potential Calculator · `mrx.tool.020-genetic-potential` · tool-020-genetic-potential
- 21 · Peptide Protocol Planner · `mrx.tool.021-peptide-protocol` · tool-021-peptide-protocol
- 22 · Half-Life Stacker · `mrx.tool.022-half-life-stacker` · tool-022-half-life-stacker
- 56 · Mini PCT Calculator · `mrx.tool.056-mini-pct-calculator` · tool-056-mini-pct-calculator
- 91 · Female Health Observation Log · `mrx.tool.091-female-health-optimizer` · tool-091-female-health-optimizer
- 92 · Female Androgen Dose Evidence Check · `mrx.tool.092-female-dosage-calculator` · tool-092-female-dosage-calculator
- 93 · Menstrual Cycle Calendar Log · `mrx.tool.093-menstrual-cycle-manager` · tool-093-menstrual-cycle-manager
- 94 · Pregnancy Exposure Information · `mrx.tool.094-pregnancy-risk-calculator` · tool-094-pregnancy-risk-calculator
- 109 · Competition Readiness & Stage Posing OS · `mrx.tool.109-competition-readiness-posing-os` · tool-109-competition-readiness-posing-os

### 5.2 Tools with no typed schema

- 8 · Side Effect Tracker · `tool-008-side-effect-tracker` · schema file: `lib/tools/schemas/tool-008-side-effect-tracker.ts`
- 9 · Injection Site History Log · `tool-009-injection-site-rotator` · schema file: `lib/tools/schemas/tool-009-injection-site-rotator.ts`
- 10 · Compound Stack Builder · `tool-010-compound-stack-builder` · schema file: `lib/tools/schemas/tool-010-compound-stack-builder.ts`
- 11 · Progress Tracker · `tool-011-progress-tracker` · schema file: `lib/tools/schemas/tool-011-progress-tracker.ts`
- 18 · HPTA Recovery Monitor · `tool-018-hpta-recovery` · schema file: `lib/tools/schemas/tool-018-hpta-recovery.ts`
- 19 · Cardio Monitor · `tool-019-cardio-monitor` · schema file: `lib/tools/schemas/tool-019-cardio-monitor.ts`
- 23 · TRT Optimization · `tool-023-trt-optimization` · schema file: `lib/tools/schemas/tool-023-trt-optimization.ts`
- 102 · Subcutaneous vs. Intramuscular PK Modeler · `tool-102-subcutaneous-vs-intramuscular-pk-modeler` · schema file: `lib/tools/schemas/tool-102-subcutaneous-vs-intramuscular-pk-modeler.ts`
- 131 · Body Transformation Scenario Calculator · `tool-131-transformation-forecast-trajectory-engine` · schema file: `lib/tools/schemas/tool-131-transformation-forecast-trajectory-engine.ts`
- 149 · Physique Trajectory Scenario Simulator · `tool-149-physique-trajectory-simulator` · schema file: `lib/tools/schemas/tool-149-physique-trajectory-simulator.ts`
- 251 · Physique Scenario Simulator · `tool-251-physique-trajectory-simulator` · schema file: `lib/tools/schemas/tool-251-physique-trajectory.v7.ts`

### 5.3 Engines with no exported calculation function

- 8 · Side Effect Tracker · `tool-008-side-effect-tracker` · `lib/tools/engines/tool-008-side-effect-tracker.ts`
- 9 · Injection Site History Log · `tool-009-injection-site-rotator` · `lib/tools/engines/tool-009-injection-site-rotator.ts`
- 10 · Compound Stack Builder · `tool-010-compound-stack-builder` · `lib/tools/engines/tool-010-compound-stack-builder.ts`
- 113 · AI Grocery Basket & Meal Cost Optimizer · `tool-113-ai-grocery-basket-meal-cost-optimizer` · `lib/tools/engines/tool-113-ai-grocery-basket-meal-cost-optimizer.ts`
- 120 · Progressive Overload & Adaptive Reserve Capacity Predictor · `tool-120-progressive-overload-predictor` · `lib/tools/engines/tool-120-progressive-overload-predictor.ts`
- 121 · Muscle Group Recovery Time-Course Modeler · `tool-121-muscle-group-recovery-modeler` · `lib/tools/engines/tool-121-muscle-group-recovery-modeler.ts`
- 122 · RPE / RIR to 1RM Dynamic Velocity Modeler · `tool-122-rpe-rir-1rm-velocity-modeler` · `lib/tools/engines/tool-122-rpe-rir-1rm-velocity-modeler.ts`
- 123 · Joint Stress & Connective Tissue Load Risk Index · `tool-123-joint-stress-connective-tissue-index` · `lib/tools/engines/tool-123-joint-stress-connective-tissue-index.ts`
- 124 · Deload Frequency & Fatigue Accumulation Modeler · `tool-124-deload-frequency-fatigue-modeler` · `lib/tools/engines/tool-124-deload-frequency-fatigue-modeler.ts`
- 125 · Fiber Type Adaptation & Mechanical Tension Score · `tool-125-fiber-type-mechanical-tension-score` · `lib/tools/engines/tool-125-fiber-type-mechanical-tension-score.ts`

## 6. Formula risk by category

| Category | Impl. | Tests | Golden | No source | No assumptions | Non-strict | No finite | Engine no fn |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| AI Behavior | 6 | 1 | 0 | 5 | 5 | 0 | 0 | 0 |
| AI Nutrition Vision | 9 | 2 | 1 | 6 | 2 | 0 | 0 | 0 |
| Body Composition | 10 | 9 | 7 | 9 | 7 | 4 | 0 | 0 |
| Contest Prep | 3 | 0 | 0 | 2 | 1 | 0 | 0 | 0 |
| Cycle Management | 13 | 13 | 10 | 9 | 12 | 7 | 3 | 1 |
| Homebrew Chemistry | 8 | 2 | 1 | 4 | 8 | 0 | 0 | 0 |
| Hormonal Health | 24 | 23 | 17 | 19 | 23 | 17 | 3 | 0 |
| Injection & Formulation | 8 | 8 | 5 | 4 | 8 | 3 | 0 | 1 |
| Measurement Conversion | 2 | 1 | 1 | 2 | 2 | 1 | 0 | 0 |
| Medical Monitoring | 73 | 47 | 23 | 64 | 50 | 32 | 0 | 1 |
| Nutrition | 19 | 16 | 12 | 10 | 16 | 8 | 0 | 1 |
| Pharmacokinetics | 41 | 20 | 16 | 37 | 26 | 4 | 1 | 0 |
| Platform AI | 7 | 7 | 3 | 2 | 6 | 1 | 0 | 0 |
| Reproductive Wellbeing | 19 | 9 | 3 | 18 | 6 | 2 | 2 | 0 |
| Training & Recovery | 22 | 15 | 9 | 13 | 21 | 6 | 1 | 6 |
| **Total** | **264** | **173** | **108** | **204** | **193** | **85** | **10** | **10** |

## 7. Why “it has tests” is not enough

- Tool-016’s test asserts `result.compounds[0].elapsed_days` equals `5 * Math.log(0.05) / Math.log(0.5)` — the same expression as the engine. It proves the code path, not an independent pharmacokinetic reference.
- Several components are 1,000–20,000 bytes with inline arithmetic and no engine function; a component test can pass while the formula remains unreviewable.
- 65 tools have a test file but no numeric assertion; they may only assert that a heading renders.

## 8. Formula verification protocol (mandatory for every batch)

1. **Source record:** citation, version/date, population, method, units and the exact constants used. If no source exists, the batch stops.
2. **Formula sheet:** the executed expression, input normalization, rounding, boundaries and excluded populations.
3. **Independent golden cases:** at least three values computed outside the implementation, plus min-1/min/max/max+1/NaN/Infinity.
4. **Unit cases:** metric ↔ imperial ↔ US customary round-trip; canonical value unchanged; display precision stated.
5. **Method alternatives:** if two validated methods exist, expose the choice or select by a transparent rule; do not silently mix them.
6. **Uncertainty:** state estimate vs deterministic vs model prediction; never label a heuristic as a prediction.
7. **Regression:** keep the old case and add the new one; run the batch tests, shared-contract tests and the known full-suite baseline.
8. **No AI authority:** the engine remains authoritative; AI may explain only. A model must never overwrite a constant or output.

## 9. Source governance

- **Do not invent a citation** to satisfy this document. “Source to be approved” is an honest state.
- Candidate source classes by domain are listed in each dossier’s proposals; they are candidates, not verified references.
- Health-related tools require current clinical/public-health guidance and expert review before a behavior change.
- Financial/cost tools must separate user-entered costs, sourced list prices and assumptions (tool-030 is the warning example).
- Unit conversion factors must be versioned; a label-only unit change is a defect, not a feature.

## 10. Status and next action

**Current status: FAIL for 5 tools, NOT RUN for 248.** The next action is not a mass formula rewrite. It is: (a) remove the unsafe/untestable tool-010 path, (b) repair or explicitly relabel 020/030/100/106, and (c) run the protocol in the first post-R5 batch. No formula constant changes without an owner-approved source.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
