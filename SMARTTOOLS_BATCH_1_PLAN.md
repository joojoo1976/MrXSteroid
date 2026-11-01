# SMARTTOOLS_BATCH_1_PLAN

## Scope
Planning only. No application code changes, no Supabase writes/migrations, no commits/push/deployment.

## Baseline verification
- Macro pilot integration: `components/tools/macro-pilot.test.tsx` = 2 passed / 2.
- Macro v6 engine: `lib/tools/engines/macro.v6.test.ts` = 46 passed / 46.
- Genius Tool Template V2: 4 passed / 4.
- validate-tools: 5 passed / 5.
- Targeted ESLint for pilot/template: 0 errors.
- TypeScript: 8 pre-existing errors remain; none in pilot files.
- Build: blocked by unrelated Tool 111 v7 missing modules.
- Coverage: unavailable.

## Proposed first batch (3 tools)
1. `mrx.tool.bodyfat` — Body Fat Calculator — route `/bodyfat`
   - Engine: `lib/tools/engines/bodyfat.v6.ts` (`calculateBodyFatV6`, async)
   - Existing test: `lib/tools/engines/bodyfat.v6.test.ts`
   - Template: `lib/templates/genius-tool-template.tsx`
   - Expected files: new `components/tools/bodyfat-pilot.tsx`, new `components/tools/bodyfat-pilot.test.tsx`, update `app/bodyfat/page.tsx`.
   - Acceptance: real engine calculation, success + invalid input tests, no NaN/Infinity, component does not crash on engine rejection, targeted ESLint 0 errors, no new TS errors vs baseline.

2. `mrx.tool.bmi` — Body Mass Index (BMI) — route `/smarttools/bmi`
   - Engine: `lib/tools/engines/bmi.v6.ts` (`calculateBmi`)
   - Existing test: `lib/tools/engines/bmi.v6.test.ts`
   - Template: `lib/templates/genius-tool-template.tsx`
   - Expected files: new `components/tools/bmi-pilot.tsx`, new `components/tools/bmi-pilot.test.tsx`, update `app/smarttools/bmi/page.tsx`.
   - Acceptance: same as above; invalid input path tested with real engine.

3. `mrx.tool.one-rep-max` — One Rep Max — route `/smarttools/one-rep-max`
   - Engine: `lib/tools/engines/one-rep-max.v6.ts`
   - Existing test: `lib/tools/engines/one-rep-max.v6.test.ts`
   - Template: `lib/templates/genius-tool-template.tsx`
   - Expected files: new `components/tools/one-rep-max-pilot.tsx`, new `components/tools/one-rep-max-pilot.test.tsx`, update `app/smarttools/one-rep-max/page.tsx`.
   - Acceptance: same as above.

## Selection rationale
- Non-overlapping functions: body composition, BMI, strength estimation.
- Each has an existing v6 engine and at least one engine test.
- Each has an existing route and registry identity; no new tool identity/path.
- Template V2 is presentational and suitable for pilot wrappers.
- Macro pilot provides the proven integration pattern.

## Dependencies
- Real v6 engines only; no mocks in integration tests.
- Genius Tool Template V2.
- Existing route/page structure and registry entries.
- No Supabase writes or migrations.

## Risks
- Build remains blocked by unrelated Tool 111 v7; batch verification cannot rely on full build.
- Coverage remains unavailable.
- TypeScript baseline has 8 pre-existing errors; any new error must be documented and justified.
- Invalid input behavior depends on each engine's validation contract; wrappers must map engine errors to template error state.

## Verification plan for batch
- Run engine tests for each selected tool.
- Run new pilot integration tests (success + invalid input).
- Run targeted ESLint on changed files.
- Run full `tsc --noEmit` and compare error list against the 8 baseline errors; no new errors allowed.
- Do not claim build or coverage success.

## Conclusion
READY FOR HUMAN REVIEW
