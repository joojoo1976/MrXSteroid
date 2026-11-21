# MRX_255_FORMULA_AND_EVIDENCE_REGISTRY.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Frozen master SHA-256:** `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`  
**Mode:** Read-only. No formula or constant was changed.

## 1. Verdict

- `PASS`: 11 formula/rule sets (static or R5 runtime check, scope limits stated).
- `FAIL`: 5 confirmed defects (010, 020, 030, 100, 106).
- `NOT RUN`: 248 (no independent sourced golden case).
- `BLOCKED`: 4 planned tools with no engine.
- Total: 268.

No formula is changed in this pass. No citation is invented. “Source to be approved” is recorded honestly where no verified source exists.

## 2. Formula status counts

| Status | Tools | Meaning |
|---|---:|---|
| `PASS` | 11 | Readable formula/rule, correct units/boundaries, and an independent or R5 check |
| `FAIL` | 5 | Defect reproduced from source; must not ship unchanged |
| `NOT RUN` | 248 | No independent reference case in this read-only pass |
| `BLOCKED` | 4 | Planned entries with no engine |
| Total | 268 | |

## 3. Verified formula/rule set (`PASS`)

| Tool | What was checked | Evidence |
|---|---|---|
| BMI (`bmi`) | BMI = kg/m²; CDC adult bands; 70 kg/1.75 m → 22.9; imperial 154.3 lb/68.9 in → 22.9 | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` §5.1 |
| Protein Needs (`protein-needs`) | g/kg bands; 70 kg/activity 1.2 → 113 g/day; scenarios 113/141/156; imperial retains value | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` §5.2 |
| Water Intake (`water-intake`) | mL/kg + activity; 70 kg/1.2 → 2.5 L; 2.45/2.5/2.55; 85 US fl oz | `R5_FIRST_BATCH_EVIDENCE_REPORT.md` §5.3 |
| 016 Half-Life | `t = t½·ln(remaining)/ln(0.5)`; strict `gt(0).lt(100)`; test recomputes same expression (not independent) | `lib/tools/engines/tool-016-half-life-calculator.ts`; test file |
| 236 Restaurant Macro | Per-serving × servings; 4/4/9 macro energy; label-vs-macro difference; user data marked unverified | `lib/tools/engines/tool-236-restaurant-macro.v7.ts` |
| 143 Storage Excursion | Range comparison only; refuses `not_evaluable` without label/observed ranges; no stability claim | `lib/tools/engines/tool-143-...v6.ts` |
| 140 / 242 Unit Conversion | Factor table and Fahrenheit offset read; no independent runtime case | `tool-140...v6.ts`, `tool-242-unit-conversion.v7.ts` |
| 131 / 149 / 251 Physique Scenarios | Constant-rate arithmetic; constant-lean-mass assumption disclosed; not an outcome prediction | engine files |

These PASS statuses mean “formula/rule is internally correct and honestly scoped,” not “clinically validated.”

## 4. Confirmed defects (`FAIL`)

| Tool | Defect | Exact evidence | Impact |
|---|---|---|---|
| 010 Compound Stack Builder | No engine function; unsafe AI advice; invalid unit; stale AI copy | Component lines 105, 141, 142; lines 158, 191; engine file is types only; no typed input schema | Release-blocking medical advice and untestable calculation |
| 020 Genetic Potential | Arbitrary point score presented as “genetic potential” | `tool-020-genetic-potential.ts` lines 15–24: `let score = 60`, then points for age/body type/BMI; no source | False precision; heuristic may be treated as biological ceiling |
| 030 Cycle Cost | PCT cost hardcoded without source | `tool-030-cycle-cost-calculator.ts` lines 75–76: `pctWeeks * 50`, `pctWeeks * 60` labeled “Assumed”; line 101 `budget_savings_tips: []` | Financial total looks authoritative but is partly an assumption |
| 100 Comprehensive Report | “Report” is an input echo | `tool-100-comprehensive-report-generator.ts` lines 1–3: result extends input and returns `{...input,status:'RECORDED'}` | Advertised report capability does not exist |
| 106 Glycogen/Water | Arbitrary cap and duplicate accounting | `tool-106-...ts` line 63 cap `600`; lines 77–78 duplicate water fields; line 57 `training_load` never used | Model fields disagree; input has no effect |

## 5. Mandatory formula metadata template

Every formula or rule that is later approved must record:

1. Formula / Rule ID.
2. Formula or rule expression.
3. Scientific or technical reference.
4. Source (URL/document/version).
5. Publication or review date.
6. Population or scope of use.
7. Exceptions and limits.
8. Adoption status.
9. Verification tests.
10. Date of last actual verification.

## 6. Source governance

- Do not invent a citation to satisfy this document. “Source to be approved” is an honest state.
- Health-related tools require current clinical/public-health guidance and expert review before behavior changes.
- Financial/cost tools must separate user-entered costs, sourced list prices, and assumptions. Tool-030 is the warning example.
- Unit conversion factors must be versioned; a label-only unit change is a defect, not a feature.
- AI may explain only. It must never overwrite a constant or output.
- Formula changes require owner approval, a versioned source, population, and independent golden cases.

## 7. Systemic formula-risk counts

| Signal | Count | Consequence |
|---|---:|---|
| No test file | 91 | No regression protection |
| Tests but no numeric/golden assertion | 65 | Tests do not check the number |
| No source/provenance | 204 | Formula origin cannot be audited |
| No explicit assumptions | 193 | Scope and population are unclear |
| Schema not strict | 85 | Unexpected keys accepted |
| No finite guard | 10 | NaN/Infinity can propagate |
| No typed schema | 11 | Validation boundary unclear |
| Engine has no calculation function | 10 | Logic inline or absent; hard to test |

Tools lacking finite guards: `hpta-recovery`, 020, 021, 022, 056, 091, 092, 093, 094, 109.  
Tools lacking typed schemas: 008, 009, 010, 011, 018, 019, 023, 102, 131, 149, 251.  
Engines with no calculation function: 008, 009, 010, 113, 120, 121, 122, 123, 124, 125.

## 8. Verification protocol for every future batch

1. Source record: citation, version/date, population, method, units, constants.
2. Formula sheet: expression, normalization, rounding, boundaries, excluded populations.
3. Independent golden cases: at least three values computed outside the implementation, plus min-1/min/max/max+1/NaN/Infinity.
4. Unit cases: metric → imperial → metric; canonical value unchanged; display precision stated.
5. Method alternatives: expose the choice or select by transparent rule; do not silently mix methods.
6. Uncertainty: state estimate vs deterministic vs model prediction; never label a heuristic as a prediction.
7. Regression: keep old case, add new one, run batch tests, shared-contract tests, and the known full-suite baseline.
8. No AI authority: engine remains authoritative; AI may explain only.

## 9. Owner decision required

No formula constant changes are authorized. The five defect plans require explicit owner approval before implementation.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
