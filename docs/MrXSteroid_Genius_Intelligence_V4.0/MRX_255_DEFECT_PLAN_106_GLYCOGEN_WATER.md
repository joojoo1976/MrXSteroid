# MRX_255_DEFECT_PLAN_106_GLYCOGEN_WATER.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No formula or code changed.

## 1. Tool identity

- Tool ID: `mrx.tool.106-glycogen-supercompensation-water-modeler`
- Slug: `tool-106-glycogen-supercompensation-water-modeler`
- Title: Glycogen Supercompensation & Water Retention Modeler
- Category: contest-prep
- Status: implemented, `accessTier: free`

## 2. Responsible code

- Engine: `lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.ts` lines 52–94
- Schema: `lib/tools/schemas/tool-106-glycogen-supercompensation-water-modeler.ts`
- Component: `components/tools/tool-106-glycogen-supercompensation-water-modeler.tsx`
- Tests: `lib/tools/engines/tool-106-glycogen-supercompensation-water-modeler.test.ts`, `lib/tools/adapters/tool-106-110-batch.test.ts`

## 3. Current behavior

- `maxMuscle = round((leanKg * 15 + 150) * 10) / 10`
- `liver = 100`
- `carbBudgetTotal = target_carbs_g_per_kg * 1000 * days`
- `predicted = max(baseline, min(maxMuscle * 0.92, min(carbBudgetTotal, 600)))`
- `water = min(predicted * 2.7 / 1000, leanKg * 0.25 + 1)`
- `training_load` is accepted but never used.
- `water_retention_liters` and `total_water_retention_liters` are identical.
- `carb_budget_per_day_g` returns `target_carbs_g_per_kg * 10 / 10`, not a daily budget.

## 4. Defect

1. Arbitrary 600 g cap is unsourced.
2. Duplicate water fields imply two different quantities but hold the same value.
3. `training_load` has no effect.
4. `carb_budget_per_day_g` is mislabeled.
5. Scope boundary is good, but the arithmetic is not independently validated.

## 5. Suitable reference

Candidate reference classes: carbohydrate-loading and glycogen-storage literature, sports-nutrition position stands, and body-composition hydration literature. Exact citations are not verified in this read-only pass and must be approved by the owner. Candidate sources must not be presented as verified until reviewed.

## 6. Proposed correct behavior

- Remove or source the 600 g cap.
- Fix duplicate water fields or remove one.
- Use `training_load` or remove it from the schema.
- Correct `carb_budget_per_day_g` to a true daily budget.
- Keep the educational, non-prescriptive scope.
- Add independent golden cases and unit tests.

## 7. Golden test cases

- Lean mass 50 kg, 60 kg, 80 kg.
- target_carbs 5, 10, 12 g/kg.
- days 1, 2, 3.
- baseline 0 and high baseline.
- Training load low/medium/high.
- Water cap behavior.
- No contest prescription or diuretic advice.

## 8. Risks and limits

- Contest-prep nutrition can be misused.
- The model must remain educational and non-prescriptive.
- No diuretic, sodium, or dehydration guidance.

## 9. Rollback

Revert only the approved tool-106 files; preserve IDs, routes, and registry entries.

## 10. Owner approval required

No change is authorized until the owner approves, including any source approval.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
