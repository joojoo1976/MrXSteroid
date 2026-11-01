# SMARTTOOLS_BATCH_5_PLAN

## Baseline (verified)
- Git HEAD: `936e996a84b1a417f57946abb216eac57f2e4d85` on `main`; working tree has many pre-existing changes.
- TypeScript: 8 pre-existing errors (unchanged baseline).
- Build: blocked by unrelated Tool 111 v7 missing modules.
- Coverage: unavailable.
- validate-tools: passing in prior batches.

## Already implemented (avoid duplication)
- Batch 1: Body Fat, BMI, One Rep Max, Macro pilot.
- Batch 2: Rest Timer, Strength Standards.
- Batch 3: Body Composition Estimator (route aligned).
- Batch 4: Neuromuscular, Training Load ACWR, Rep Tempo Velocity Loss.
- Genetic Potential remains deferred.
- AI tools 127, 129, 130 excluded pending safe scope.

## Proposed Batch 5 scope (planning only; no code changed)

### Tool 136 — Physique Proportion & Golden Ratio Score
- Tool ID: `mrx.tool.136-physique-golden-ratio-score`
- Slug: `tool-136-physique-golden-ratio-score`
- Title: Physique Proportion & Golden Ratio Score / حاسبة التناسب العضلي والنسبة الذهبية
- Official route: `/smarttools/tool-136-physique-golden-ratio-score` (flat redirect to `/smarttools/body-composition/tool-136-physique-golden-ratio-score`)
- Engine: `lib/tools/engines/tool-136-physique-golden-ratio-score.v6.ts` (`calculatePhysiqueV6`)
- Engine tests: `lib/tools/engines/tool-136-physique-golden-ratio-score.v6.test.ts`
- Inputs: optional circumference measurements (shoulder, chest, waist, hips, arm, thigh, calf)
- Outputs: proportionScore, ratios, strengths, weaknesses, disclaimer
- Expected files:
  - New canonical page: `app/smarttools/body-composition/tool-136-physique-golden-ratio-score/page.tsx`
  - New pilot: `components/tools/tool-136-physique-golden-ratio-score-pilot.tsx`
  - New pilot tests: `components/tools/tool-136-physique-golden-ratio-score-pilot.test.tsx`
- Risks: optional inputs; no single required measurement except waist for ratios; score heuristic; must not claim scientific validation.

## Exclusions
- No remaining non-AI v6 tools with existing engine tests except 136.
- AI tools remain excluded.
- Genetic Potential remains deferred.

## Test plan
- Engine tests for 136.
- Pilot integration tests: valid partial inputs, invalid/NaN/negative, no stale result, disclaimer, score range 0-100.
- Route redirect verification.
- Targeted ESLint 0; TypeScript no new errors; validate-tools.

## Constraints
- No code, DB, migration, commit, push, or deployment changes in planning.
- No Batch 5 execution or 252-tool rollout without explicit human approval.

READY FOR HUMAN REVIEW
