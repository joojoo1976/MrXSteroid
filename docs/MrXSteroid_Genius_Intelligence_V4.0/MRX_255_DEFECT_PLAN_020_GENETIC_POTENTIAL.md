# MRX_255_DEFECT_PLAN_020_GENETIC_POTENTIAL.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No formula or code changed.

## 1. Tool identity

- Tool ID: `mrx.tool.020-genetic-potential`
- Slug: `tool-020-genetic-potential`
- Title: Genetic Potential Calculator
- Category: training-recovery
- Status: implemented, `accessTier: free`

## 2. Responsible code

- Engine: `lib/tools/engines/tool-020-genetic-potential.ts` lines 11–36
- Schema: `lib/tools/schemas/tool-020-genetic-potential.ts`
- Component: `components/tools/tool-020-genetic-potential.tsx`
- Tests: `lib/tools/engines/tool-020-genetic-potential.test.ts`, `components/tools/tool-020-genetic-potential.dom.test.tsx`

## 3. Current behavior

- `bmi = currentWeight / (height/100)^2`
- `score = 60`
- `+ min(15, trainingYears * 2)`
- `- min(10, priorCycles * 2)`
- `-5` if age <25; `-5` if age >45
- `+8` if mesomorph
- `-3` if ectomorph and bulk
- `-3` if endomorph and cut
- `+5` if BMI 18.5–25 else `-4`
- Returns `potential_score = round(clamp(score,0,100))`.

## 4. Defect

The score is an unsourced heuristic presented as “genetic potential.” It can imply a biological ceiling or destiny, which is not supported by the inputs or any source in the repository.

## 5. Suitable reference

No validated source in the repository supports a point-score model of genetic potential. The existing `features/calculator/lib/geneticEngine.test.ts` tests a different genetic engine and does not validate this score. The named tool `genetic` uses anthropometrics and is also unvalidated.

## 6. Proposed correct behavior

- Remove the point score or relabel it as an unsourced, non-clinical self-assessment.
- Report only transparent, input-linked observations: BMI, training history, age range, and body-type category.
- Add explicit limitations: BMI does not distinguish fat from lean mass; body type is self-reported; no genetic test is performed.
- Do not present the result as a ceiling, talent, or prediction.

## 7. Golden test cases

- Same inputs produce the same transparent output.
- BMI boundary values.
- Age boundaries 24/25/45/46.
- priorCycles 0/3.
- All body types and goals.
- No score presented as validated.

## 8. Risks and limits

- Removing the score may reduce perceived value but increases honesty.
- Any replacement metric must have a source and golden cases.
- No medical or genetic claim is permitted.

## 9. Rollback

Revert only the approved tool-020 files; preserve IDs, routes, and registry entries.

## 10. Owner approval required

No change is authorized until the owner approves.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
