# SMARTTOOLS_BATCH_3_PLAN

## Baseline (verified)
- Git HEAD: `936e996a` on `main`; working tree has many pre-existing changes.
- TypeScript: 8 pre-existing errors (unchanged baseline).
- Build: blocked by unrelated Tool 111 v7 missing modules.
- Coverage: unavailable.
- validate-tools: passing in prior batches.

## Already implemented (avoid duplication)
- Batch 1: Body Fat, BMI, One Rep Max (plus Macro pilot)
- Batch 2: Rest Timer, Strength Standards
- Body Fat targeted accuracy fix applied.

## Revised Batch 3 scope

### Deferred tool: Genetic Potential Calculator
- Registry ID: `mrx.tool.020-genetic-potential`
- Route: `/smarttools/tool-020-genetic-potential`
- Reason for deferral: current engine produces personal compound/dosing/cycle recommendations (`recommendedCycleLengthWeeks`, `dosageMultiplier`, `recommendedCompounds`, `avoidedCompounds`). Hiding these outputs in the UI is not sufficient because the engine still generates drug-related personal recommendations. This requires a redesign to a safe educational scope before implementation.
- Deferred until: explicit approval of a safe educational scope and engine redesign.

### Qualified tool: AI Body Composition Vision Engine (manual measurement estimator)
- Registry ID: `mrx.tool.108-ai-body-composition-vision-engine`
- Slug: `tool-108-ai-body-composition-vision-engine`
- Title: AI Body Composition Vision Engine / محرك التحليل البصري الذكي لتكوين الجسد
- Route: `/smarttools/tool-108-ai-body-composition-vision-engine`
- Engine: `lib/tools/engines/body-composition-vision.v6.ts`
- Engine tests: `lib/tools/engines/body-composition-vision.v6.test.ts`
- Functional description: manual circumference-based body composition estimate (Navy method). It is not an image-analysis service; no photo or vision model is used.
- Input contract: sex, heightCm, neckCm, waistCm, hipCm (required for female), weightKg
- Output contract: bodyFatPercent, leanMassKg, fatMassKg, bmi, category, disclaimer
- Safe approved outputs only: body fat %, lean mass, fat mass, BMI, category, disclaimer. No drug/compound/cycle recommendations.
- Expected files:
  - New: `components/tools/body-composition-vision-pilot.tsx`
  - New: `components/tools/body-composition-vision-pilot.test.tsx`
  - Update: `app/smarttools/tool-108-ai-body-composition-vision-engine/page.tsx`
- Dependencies: `GeniusToolTemplate`, `calculateBodyCompositionVisionV6`
- Risks: functional overlap with Body Fat pilot; must state heuristic/manual fallback and disclaimer; female hip requirement; unit/rounding consistency.
- Required tests:
  - Valid calculation renders body fat %.
  - Invalid required measurements show validation error and no result.
  - Female without hip measurement shows validation error.
  - `waist <= neck` shows validation error.
  - Fat mass + lean mass consistency with weight within rounding tolerance.
  - Disclaimer shown.
- Acceptance criteria:
  - Pilot uses Genius Tool Template V2 and real v6 engine.
  - Success + invalid input integration tests.
  - Targeted ESLint 0 for changed files.
  - No new TypeScript errors beyond the 8 pre-existing.
  - Build/Coverage limitations remain documented.

## Constraints
- No code, DB, migration, commit, push, or deployment changes.
- No Batch 4 or 252-tool rollout.

## Execution status
Planning only. No application code changed.

READY FOR HUMAN REVIEW
