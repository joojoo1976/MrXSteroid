# SMARTTOOLS_BATCH_9_PLAN

## Scope

Continue with the next eight existing catalog tools, Training & Recovery 118–125. Engines, schemas, components, and canonical category routes exist for all eight; the current inventory lists no dedicated tests.

To keep review manageable, complete this as two sub-batches:

1. Tools 118–121: CNS recovery, training volume, progressive overload, and muscle recovery.
2. Tools 122–125: RPE/RIR/1RM, joint stress, deload timing, and fiber/tension estimates.

## Initial audit evidence

- Tool 121 used `Math.random()` in the recovery timeline, so identical inputs could produce different output. The component/schema also collected repetitions and weight although the engine did not use them.
- Tool 118 gives absent inputs neutral factor scores, which can produce a numeric score from no measurements; review whether the interface communicates coverage clearly.
- Tool 119 uses a fixed `hypertrophy_index = total score / 1000` and body-weight-relative volume flags without a demonstrated calibration source; keep them explicitly heuristic or replace with directly interpretable values.
- Tool 120 labels a simplified anthropometric formula as genetic potential and emits plateau/progression projections. Review output copy and assumptions so those are not presented as validated forecasts or individualized prescriptions.

## Work completed — tools 118–121

- Tool 118 exposes coverage across five marker groups, flags missing groups, and withholds training suggestions when no data is provided.
- Tool 119 removed body-weight and training-age inputs that did not affect its calculation, removed a non-informative body-weight ratio warning, and labels its score as a heuristic index.
- Tool 120 labels its ceiling, plateau horizon and weekly-increase output as heuristic scenarios. A zero user-entered increase no longer becomes a nonzero “recommendation.”
- Tool 121 removed random jitter from its readiness timeline and removed repetitions/weight inputs that the engine ignored.
- Added five focused engine cases in `lib/tools/engines/tool-118-121-batch.test.ts`.

## Verification status

Focused tests: `PASS` (5 tests); combined Batch 8–9 focused tests: `PASS` (11 tests); `npm run validate-tools`: `PASS` (5 tests); TypeScript: `PASS`. Targeted ESLint has zero errors; local draft hydration produces three `react-hooks/set-state-in-effect` warnings in components 118, 119, and 121. Production build: `PASS` (`npm run build`, 365 static pages). Browser/visual checks were not performed.

## Boundaries

Preserve IDs and routes. Do not claim validated exercise science without sources. Keep database, migration, commit, push, and deployment state untouched. Do not mark an engine-tested tool as visually verified unless a browser check is performed.
