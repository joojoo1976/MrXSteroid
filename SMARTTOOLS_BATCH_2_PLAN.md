# SMARTTOOLS_BATCH_2_PLAN

## Baseline (verified)
- Git HEAD: `936e996a` on `main`; working tree has pre-existing changes.
- TypeScript: 8 pre-existing errors:
  - `app/smarttools/bmr-tdee/page.tsx(8,83)`
  - `app/smarttools/protein-needs/page.tsx(8,39)`
  - `app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(6,34)`
  - `app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(7,38)`
  - `app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(8,31)`
  - `app/smarttools/tool-111-smart-food-macro-substitution/page.tsx(9,25)`
  - `app/smarttools/water-intake/page.tsx(8,53)`
  - `lib/legacy-routes.ts(8,14)`
- Build: blocked by unrelated Tool 111 v7 missing modules.
- Coverage: unavailable.
- validate-tools: 5 passed.

## Already implemented (avoid duplication)
- Body Fat pilot (`mrx.tool.bodyfat`) — `components/tools/bodyfat-pilot.tsx`, `app/bodyfat/page.tsx`
- BMI pilot (`mrx.tool.bmi`) — `components/tools/bmi-pilot.tsx`, `app/smarttools/bmi/page.tsx`
- One Rep Max pilot (`mrx.tool.one-rep-max`) — `components/tools/one-rep-max-pilot.tsx`, `app/smarttools/one-rep-max/page.tsx`
- Macro pilot — `components/tools/macro-pilot.tsx`

## Proposed Batch 2 tools (2)

### 1. Rest Timer
- Registry ID: `mrx.tool.rest-timer`
- Slug: `rest-timer`
- Title: Rest Timer / مؤقت الراحة
- Route: `/smarttools/rest-timer`
- Engine: `lib/tools/engines/rest-timer.v6.ts`
- Engine tests: `lib/tools/engines/rest-timer.v6.test.ts` (2 tests)
- Input contract: `{ sets: number; intensity: 'low' | 'moderate' | 'high' }`
- Output contract: `{ restSeconds: number }`
- Expected files:
  - New: `components/tools/rest-timer-pilot.tsx`
  - New: `components/tools/rest-timer-pilot.test.tsx`
  - Update: `app/smarttools/rest-timer/page.tsx`
- Dependencies: `GeniusToolTemplate`, `calculateRestTimer`
- Risks: very small engine surface; straightforward invalid input handling.
- Success tests: valid calculation renders rest seconds; invalid sets shows validation error and no result.

### 2. Strength Standards
- Registry ID: `mrx.tool.strength-standards`
- Slug: `strength-standards`
- Title: Strength Standards / معايير القوة
- Route: `/smarttools/strength-standards`
- Engine: `lib/tools/engines/strength-standards.v6.ts`
- Engine tests: `lib/tools/engines/strength-standards.v6.test.ts` (2 tests)
- Input contract: `{ liftKg: number; bodyWeightKg: number; sex: 'male' | 'female' }`
- Output contract: `{ ratio: number; level: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite' }`
- Expected files:
  - New: `components/tools/strength-standards-pilot.tsx`
  - New: `components/tools/strength-standards-pilot.test.tsx`
  - Update: `app/smarttools/strength-standards/page.tsx`
- Dependencies: `GeniusToolTemplate`, `calculateStrengthStandards`
- Risks: sex selection and zero/negative lift/body weight validation.
- Success tests: valid calculation renders ratio and level; invalid input shows validation error and no result.

## Deferred from Batch 2
- Genetic Potential, Body Composition Vision, BMR/TDEE, Water Intake, Protein Needs, and Tool 126+ tools remain out of scope. Some lack engine tests or have broader input surfaces; they can be considered in later batches.

## Acceptance criteria
- Pilot components use Genius Tool Template V2 and real v6 engines.
- Success + invalid input integration tests for each pilot.
- Targeted ESLint 0 for changed files.
- No new TypeScript errors beyond the 8 pre-existing.
- Build/Coverage limitations remain documented; do not claim success.

## Execution status
Planning only. No application code changed.

READY FOR HUMAN REVIEW
