# Tool 013 — Macro Optimizer: Sources and Model Limits

**Review date:** 2026-10-25  
**Tool ID:** `mrx.tool.013-macro-optimizer`  
**Canonical route:** `/smarttools/nutrition/tool-013-macro-optimizer`

## Evidence in this checkout

The calculation is an inherited, deterministic scenario model implemented in `lib/tools/engines/tool-013-macro-optimizer.ts`. It uses:

- Baseline calories: `weight_kg × 24`.
- Goal multipliers: bulk `1.10`, cut `0.85`, maintenance `1.00`.
- User-entered protein and fat rates, in g/kg.
- Carbohydrates as the remaining calories using 4 kcal/g for protein and carbohydrate and 9 kcal/g for fat.
- Whole-gram daily rounding and rounded-up per-meal values.

No external clinical, sports-nutrition, or energy-requirement source is cited by the inherited model or used to validate its weight multiplier, goal multipliers, or allowable macro-rate ranges. These values are therefore disclosed as model assumptions, not evidence-based prescriptions or personalized recommendations. Activity level is not part of the calculation; no activity adjustment is applied.

## Scope and limits

Tool 013 performs arithmetic for an editable scenario. It does not estimate measured energy expenditure, assess health, set a medically appropriate diet, or recommend a calorie or macro target. The result can be infeasible when protein and fat allocations exceed the scenario calories; in that case the engine returns no result and the UI explains why. Meal-level rounding can make the sum of meal values exceed daily totals.

Result state is kept in browser `localStorage` via `lib/hooks/useToolState.ts`; this implementation does not sync these values to Supabase or another server. Structured findings are published to the shared AI explanation context through the explicit `ToolOutputSummary` surface. This does not call a model by itself and does not change the local calculation.

## Sources

- Primary source for the implemented formulas: the checked-out legacy implementation in `lib/tools/engines/tool-013-macro-optimizer.ts` before this batch. It is code provenance, not external scientific validation.
- Nutritional evidence source: none used to derive or validate the model constants in this implementation.
