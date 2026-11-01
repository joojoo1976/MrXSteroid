# SMARTTOOLS_BATCH_8_PLAN

## Priority

Continue with numbered tools 112–117 in the Nutrition category. Their catalog entries, engines, schemas and base components already exist; the master inventory classifies them as files present without functional verification evidence. Finish the integration and verification gap before creating additional unnumbered tools.

## Tools in scope

| ID | Tool | Existing source files |
|---|---|---|
| 112 | Food Quality & Micronutrient Diversity Score | `components/tools/tool-112-food-quality-micronutrient-diversity-score.tsx`, matching engine/schema |
| 113 | AI Grocery Basket & Meal Cost Optimizer | `components/tools/tool-113-ai-grocery-basket-meal-cost-optimizer.tsx`, matching engine/schema |
| 114 | Restaurant Macro Navigator | `components/tools/tool-114-restaurant-macro-navigator.tsx`, matching engine/schema |
| 115 | Supplement Evidence & Bio-Stack Navigator | `components/tools/tool-115-supplement-evidence-bio-stack-navigator.tsx`, matching engine/schema |
| 116 | Nutrition Gap & Fasting Window Optimizer | `components/tools/tool-116-nutrition-gap-fasting-window-optimizer.tsx`, matching engine/schema |
| 117 | Intra-Workout Nutrient Volumizer | `components/tools/tool-117-intra-workout-nutrient-volumizer.tsx`, matching engine/schema |

## Work sequence

1. Read each engine, schema, component, catalog entry and existing engine/UI test before editing.
2. Record which outputs are deterministic calculations, rule-based estimates, or unavailable; never label fixed logic as AI.
3. Verify calculations, input validation, empty/error states, stale-result clearing, unit behavior and Arabic/English direction.
4. Repair only evidenced issues. Reuse the existing dynamic category routes and component loader; do not create duplicate identities or pages.
5. Add focused engine coverage for the missing user-critical calculations, then run the affected tests, `validate-tools`, TypeScript, lint and a production build.
6. Update the inventory with per-tool evidence and separate automated tests from browser/visual checks.

## Boundaries

- Do not invent food composition, prices, clinical supplement evidence, or certainty estimates.
- Food price optimization must be labeled as dependent on user-supplied prices and entered food values.
- Supplement evidence must reflect only sources actually included by the current engine; no medical prescribing.
- Keep database, migration, production, commit, push and deployment state untouched.

## Exit criteria

All six tools have passing focused engine tests, existing published route/category identity, and honest limitations. Browser-based visual interaction checks remain separate from automated build/type validation. Any data/source dependency without adequate evidence stays explicitly unavailable and is listed in the batch report.
