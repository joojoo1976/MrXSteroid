# P-03 Verification Evidence (Updated) — 2026-11-18

## Working tree protection (pre-commit snapshot)
- Backup: `C:\Users\foryo\AppData\Local\Temp\opencode\wt-backup-20261118-020017` (`porcelain.txt`, `tracked.diff`, `status-*`, partial `untracked-files/` copy)
- Porcelain totals at snapshot: **495** entries (448 non-pipeline/non-closure-doc preserved entries; 47 pipeline entries overlapping P-03/git state). See `WORKING-TREE-PROTECTION-20261118-020017.md`.
- No `git reset`/`git clean`/`stash`/`git add -A` used.

## TypeScript
- **Command:** `npx tsc --noEmit --pretty false`
- **Result:** **exit 0**

## P-03 explicit tests (valid / missing-undefined / invalid schema, no envelope, no unhandled throw)
- **File:** `lib/tools/r6/p03-result-schema-validation.test.ts` (working tree)
- **Command:** `npx vitest run lib/tools/r6/p03-result-schema-validation.test.ts`
- **Result:** **1 file, 5 tests passed**
- Covers: 041 (valid/undefined/invalid/null), 016 `r6RunHalfLife` actual path (valid/undefined/invalid with correct schema input), 008 schema result checks, 045 (valid/undefined/invalid), 047 (invalid/null or schema guard).

## Regression — all 29 in-scope tools by actual path (documented)
- **Command:**
  `npx vitest run lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts lib/tools/r6/tool-014-water-retention-pipeline.test.ts lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts lib/tools/r6/tool-016-half-life-pipeline.test.ts lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts lib/tools/r6/tool-025-drug-interaction-pro-pipeline.test.ts lib/tools/r6/tool-026-injection-pain-pipeline.test.ts lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts lib/tools/r6/tool-029-side-effect-early-warning-pipeline.test.ts lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.test.ts lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts lib/tools/r6/tool-049-bone-density-pipeline.test.ts lib/tools/engines/tool-050-mental-health.test.ts tests/unit/tool-050-i18n-evidence.test.ts lib/tools/adapters/tool-051-055-batch.test.ts lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts tests/unit/tool-051-i18n-evidence.test.ts lib/tools/r6/p03-result-schema-validation.test.ts`
- **Result:** **Test Files 34 passed (34), Tests 177 passed (177)** (vitest v4.1.10). Log: `p03-regression-29.log`.
- **050/051:** no `*-pipeline.test.ts` in r6; regression covered via actual existing paths (engine/i18n-evidence/adapter-batch) plus P-03 coverage on pipeline run paths in code.

## Code changes applied (P-03 scope, working tree)
Result schema validated (Zod `safeParse`) **before** envelope creation in run/compute paths:
- **29 in-scope pipelines:** 006,008,014,015,016,017,022,023,025,026,027,029,031,034,035,037,038,039,040,041,042,043,044,045,046,047,048,049,050,051
- **016:** actual `r6RunHalfLife` path (no invented `run*`)
- **047–051:** result schemas confirmed and imported/validated
- **008:** validated against `SideEffectLogSchema`
- Invalid/missing/undefined result → `{ ok:false, error }`, **no envelope**

## Still required before P-03 can be closed/committed as independent clean export
- **Clean export** from HEAD with **only P-03 changes** applied: tsc, targeted ESLint (0 errors), P-03 tests, regression 29, `next build` recorded on clean copy.
- **Independent scoped commit** with file list shown before commit (note: 006,015,023,035,040,043,044 pipeline files are untracked-in-HEAD in current repo state; including them adds whole files — must be explicit and scoped).
- **Rollback:** `git revert <P03_COMMIT_SHA>` + rerun affected tests/build checks (to be evidenced after commit).
- Per-tool P-03 status in atomic ledgers (applied/N-A with justification). **Not closed for any tool yet.**
- No engine/result-schema logic changes made except safe validation guard; no behavior change on valid results evidenced by passing regressions.

## P-03 intended file list (code/test, scoped)
- `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts`
- `lib/tools/r6/tool-008-side-effect-tracker-pipeline.ts`
- `lib/tools/r6/tool-014-water-retention-pipeline.ts`
- `lib/tools/r6/tool-015-shbg-modulator-pipeline.ts`
- `lib/tools/r6/tool-016-half-life-pipeline.ts`
- `lib/tools/r6/tool-017-drug-interaction-pipeline.ts`
- `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts`
- `lib/tools/r6/tool-023-trt-optimization-pipeline.ts`
- `lib/tools/r6/tool-025-drug-interaction-pro-pipeline.ts`
- `lib/tools/r6/tool-026-injection-pain-pipeline.ts`
- `lib/tools/r6/tool-027-ester-conversion-pipeline.ts`
- `lib/tools/r6/tool-029-side-effect-early-warning-pipeline.ts`
- `lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.ts`
- `lib/tools/r6/tool-034-compound-clearance-pipeline.ts`
- `lib/tools/r6/tool-035-hormone-conversion-pipeline.ts`
- `lib/tools/r6/tool-037-side-effect-probability-pipeline.ts`
- `lib/tools/r6/tool-038-stack-compatibility-pipeline.ts`
- `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts`
- `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.ts`
- `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts`
- `lib/tools/r6/tool-042-estrogen-management-pipeline.ts`
- `lib/tools/r6/tool-043-prolactin-management-pipeline.ts`
- `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts`
- `lib/tools/r6/tool-045-cycle-break-planner-pipeline.ts`
- `lib/tools/r6/tool-046-trt-lifetime-pipeline.ts`
- `lib/tools/r6/tool-047-fertility-preservation-pipeline.ts`
- `lib/tools/r6/tool-048-cardiovascular-risk-pipeline.ts`
- `lib/tools/r6/tool-049-bone-density-pipeline.ts`
- `lib/tools/r6/tool-050-mental-health-pipeline.ts`
- `lib/tools/r6/tool-051-peptide-dosage-pipeline.ts`
- `lib/tools/r6/p03-result-schema-validation.test.ts`
(+ evidence/docs as separate commits; do not mix with unrelated working-tree files)
