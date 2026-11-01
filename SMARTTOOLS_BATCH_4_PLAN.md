# SMARTTOOLS_BATCH_4_PLAN

## Baseline (verified)
- Git HEAD: `936e996a84b1a417f57946abb216eac57f2e4d85` on `main`; working tree has many pre-existing changes.
- TypeScript: 8 pre-existing errors (unchanged baseline).
- Build: blocked by unrelated Tool 111 v7 missing modules.
- Coverage: unavailable.
- validate-tools: passing in prior batches.

## Already implemented (avoid duplication)
- Batch 1: Body Fat, BMI, One Rep Max, Macro pilot.
- Batch 2: Rest Timer, Strength Standards.
- Batch 3: Body Composition Estimator (canonical route aligned).
- Genetic Potential remains deferred (unsafe compound/dosing outputs).

## Proposed Batch 4 scope (planning only; no code changed)

### 1. Neuromuscular Performance & Explosiveness Modeler
- Tool ID: `mrx.tool.126-neuromuscular-explosiveness-modeler`
- Slug: `tool-126-neuromuscular-explosiveness-modeler`
- Title: Neuromuscular Performance & Explosiveness Modeler / حاسبة الأداء العصبي العضلي والانفجارية
- Official route: `/smarttools/tool-126-neuromuscular-explosiveness-modeler` (flat redirect to `/smarttools/training-recovery/tool-126-neuromuscular-explosiveness-modeler`)
- Engine: `lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6.ts` (`calculateNeuromuscularV6`)
- Engine tests: `lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6.test.ts`
- Inputs: body_weight_kg (required), vertical_jump_cm, broad_jump_cm, sprint_10m_s, sprint_20m_s, one_rm_kg (optional)
- Outputs: explosivenessScore, strengths, weaknesses, disclaimer
- Expected files: new pilot + test; update canonical training-recovery page; keep flat redirect.
- Risks: optional inputs; division/NaN guards; score clamping 0-100.

### 2. Training Load Balance & Acute-to-Chronic Ratio
- Tool ID: `mrx.tool.128-training-load-acute-chronic-ratio`
- Slug: `tool-128-training-load-acute-chronic-ratio`
- Title: Training Load Balance & Acute-to-Chronic Ratio / حاسبة التوازن بين الحمل الحاد والتراكمي
- Official route: `/smarttools/tool-128-training-load-acute-chronic-ratio` (flat redirect to `/smarttools/training-recovery/tool-128-training-load-acute-chronic-ratio`)
- Engine: `lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6.ts` (`calculateTrainingLoadAcwrV6`)
- Engine tests: `lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6.test.ts`
- Inputs: sessions[] { date, load }
- Outputs: acuteLoad, chronicLoad, acwr, band, sufficientData, disclaimer
- Expected files: new pilot + test; update canonical training-recovery page; keep flat redirect.
- Risks: date parsing, empty sessions, zero-load division, insufficient data state.

### 3. Rep Tempo & Velocity Loss Analyzer
- Tool ID: `mrx.tool.133-rep-tempo-velocity-loss-analyzer`
- Slug: `tool-133-rep-tempo-velocity-loss-analyzer`
- Title: Rep Tempo & Velocity Loss Analyzer / محلل إيقاع التكرارات وفقدان السرعة
- Official route: `/smarttools/tool-133-rep-tempo-velocity-loss-analyzer` (flat redirect to `/smarttools/training-recovery/tool-133-rep-tempo-velocity-loss-analyzer`)
- Engine: `lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6.ts` (`calculateVelocityV6`)
- Engine tests: `lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6.test.ts`
- Inputs: sets[] { set_number, reps, weight_kg, avg_velocity_m_s?, tempo? }
- Outputs: velocityLossPercent, tempoConsistency, fatigueIndicator, recommendations, disclaimer
- Expected files: new pilot + test; update canonical training-recovery page; keep flat redirect.
- Risks: empty sets, NaN inputs, division by zero, recommendations safety wording.

## Exclusions
- AI tools 127, 129, 130 excluded until safe non-AI scope review.
- Genetic Potential remains deferred.
- Vision/AI unconfigured tools excluded.

## Test plan
- Engine tests for selected 3 tools.
- Pilot integration tests: valid calculation, invalid/NaN/negative inputs, no stale result, disclaimer.
- Route redirects verified for flat and canonical paths.
- Targeted ESLint 0; TypeScript no new errors; validate-tools.

## Constraints
- No code, DB, migration, commit, push, or deployment changes in planning.
- No Batch 4 execution or 252-tool rollout without explicit human approval.

READY FOR HUMAN REVIEW
