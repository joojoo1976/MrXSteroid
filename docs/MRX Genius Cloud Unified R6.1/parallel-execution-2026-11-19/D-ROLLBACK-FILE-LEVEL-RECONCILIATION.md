# D — Rollback File-Level Reconciliation (R6.1)

**Workstream D | R6.1 closure program | Reconciliation as of 2026-11-19 | READ-ONLY**

## 1. Proof summary

- **Repo / branch:** `E:\MrXSteroid-main`, branch `feat/r6.1-tools-041-042`. HEAD verified: `37f047a4105d078b22edea2c857bf35aefdbdc7f` (`git rev-parse HEAD`).
- **Baseline (2a647fda):** tree `7587bf508b9f88a40824b4e1e7a2b6041b928014` (`git rev-parse "2a647fda^{tree}"`).
- **Revert target (ed19a2ac):** tree `7587bf508b9f88a40824b4e1e7a2b6041b928014` — **identical to baseline tree** (tree equality proven by `git rev-parse "ed19a2ac^{tree}"`).
- **Pre-rollback run:** **34 files / 177 tests PASS**. Source: `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/regression-vitest.log` (UTF-16): `RUN v4.1.10 E:/p03-clean-build-20261118`, `Test Files  34 passed (34)`, `Tests  177 passed (177)`, `REGRESSION_EXIT=0`. Note: executed in the **contaminated** environment (see §7).
- **Post-rollback run:** **22 files / 111 tests PASS**. Source: `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/rollback-proof-summary.json`: `"regression": "22 files / 111 tests PASS (HEAD-available subset)"`.
- **Pre-run list source:** `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/regression-run.txt` — `TEST_FILES=34`, 34 paths (lines 2–35, order preserved below).
- **22-file post list source:** `docs/MRX Genius Cloud Unified R6.1/R6.1-ROLLBACK-RECONCILIATION.md` v1.1 §3 (git-evidenced intersection, rows 1–22) — each of the 22 paths verified present in the reverted tree via `git ls-tree ed19a2ac` (all 22: OK).
- **Status:** membership reconciled; per-file counts **NOT_RUN** for both sets (see §5, §8).

## 2. 34-file table (pre-rollback; from `regression-run.txt`, exact order)

| # | Path | Scope | Per-file count |
|---:|---|---|---|
| 1 | `lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts` | PRE | NOT_RUN |
| 2 | `lib/tools/r6/tool-014-water-retention-pipeline.test.ts` | PRE | NOT_RUN |
| 3 | `lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` | PRE | NOT_RUN |
| 4 | `lib/tools/r6/tool-025-drug-interaction-pro-pipeline.test.ts` | PRE | NOT_RUN |
| 5 | `lib/tools/r6/tool-026-injection-pain-pipeline.test.ts` | PRE | NOT_RUN |
| 6 | `lib/tools/r6/tool-029-side-effect-early-warning-pipeline.test.ts` | PRE | NOT_RUN |
| 7 | `lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.test.ts` | PRE | NOT_RUN |
| 8 | `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` | PRE | NOT_RUN |
| 9 | `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` | PRE | NOT_RUN |
| 10 | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` | PRE | NOT_RUN |
| 11 | `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts` | PRE | NOT_RUN |
| 12 | `lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts` | PRE | NOT_RUN |
| 13 | `lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts` | PRE | NOT_RUN |
| 14 | `lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts` | PRE | NOT_RUN |
| 15 | `lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts` | PRE | NOT_RUN |
| 16 | `lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts` | PRE | NOT_RUN |
| 17 | `lib/tools/r6/tool-049-bone-density-pipeline.test.ts` | PRE | NOT_RUN |
| 18 | `lib/tools/engines/tool-050-mental-health.test.ts` | PRE | NOT_RUN |
| 19 | `tests/unit/tool-050-i18n-evidence.test.ts` | PRE | NOT_RUN |
| 20 | `lib/tools/adapters/tool-051-055-batch.test.ts` | PRE | NOT_RUN |
| 21 | `lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts` | PRE | NOT_RUN |
| 22 | `tests/unit/tool-051-i18n-evidence.test.ts` | PRE | NOT_RUN |
| 23 | `lib/tools/r6/p03-result-schema-validation.test.ts` | PRE (missing) | NOT_RUN |
| 24 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 25 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 26 | `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 27 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 28 | `lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 29 | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 30 | `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 31 | `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 32 | `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 33 | `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` | PRE (missing) | NOT_RUN |
| 34 | `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` | PRE (missing) | NOT_RUN |

Total: **34 files** (all NOT_RUN, §5).

## 3. 22-file table (post-rollback; from `R6.1-ROLLBACK-RECONCILIATION.md` v1.1 §3, git-verified in `ed19a2ac`)

| # | Path | In reverted tree (`ed19a2ac`) | Per-file count |
|---:|---|---|---|
| 1 | `lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts` | Yes (verified) | NOT_RUN |
| 2 | `lib/tools/r6/tool-014-water-retention-pipeline.test.ts` | Yes | NOT_RUN |
| 3 | `lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` | Yes | NOT_RUN |
| 4 | `lib/tools/r6/tool-025-drug-interaction-pro-pipeline.test.ts` | Yes | NOT_RUN |
| 5 | `lib/tools/r6/tool-026-injection-pain-pipeline.test.ts` | Yes | NOT_RUN |
| 6 | `lib/tools/r6/tool-029-side-effect-early-warning-pipeline.test.ts` | Yes | NOT_RUN |
| 7 | `lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.test.ts` | Yes | NOT_RUN |
| 8 | `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` | Yes | NOT_RUN |
| 9 | `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` | Yes | NOT_RUN |
| 10 | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` | Yes | NOT_RUN |
| 11 | `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts` | Yes | NOT_RUN |
| 12 | `lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts` | Yes | NOT_RUN |
| 13 | `lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts` | Yes | NOT_RUN |
| 14 | `lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts` | Yes | NOT_RUN |
| 15 | `lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts` | Yes | NOT_RUN |
| 16 | `lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts` | Yes | NOT_RUN |
| 17 | `lib/tools/r6/tool-049-bone-density-pipeline.test.ts` | Yes | NOT_RUN |
| 18 | `lib/tools/engines/tool-050-mental-health.test.ts` | Yes | NOT_RUN |
| 19 | `tests/unit/tool-050-i18n-evidence.test.ts` | Yes | NOT_RUN |
| 20 | `lib/tools/adapters/tool-051-055-batch.test.ts` | Yes | NOT_RUN |
| 21 | `lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts` | Yes | NOT_RUN |
| 22 | `tests/unit/tool-051-i18n-evidence.test.ts` | Yes | NOT_RUN |

Total: **22 files** (all NOT_RUN, §5). All 22 verified present in the reverted tree via `git ls-tree ed19a2ac` (count = 22).

## 4. Membership diff

- **Pre − Post = 12 files** (all of regression-run.txt rows 23–34):

| # | Path (classification) |
|---:|---|
| 1 | `lib/tools/r6/p03-result-schema-validation.test.ts` — **P-03-file, REMOVED_BY_REVERT** |
| 2 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 3 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 4 | `lib/tools/r6/tool-016-half-life-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 5 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 6 | `lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 7 | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 8 | `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 9 | `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 10 | `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 11 | `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |
| 12 | `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` — UNTRACKED_ONLY_IN_PRIOR_ENV |

- **Post − Pre = 0 files** (all 22 post files are present in `ed19a2ac`; verified by `git ls-tree ed19a2ac <path>` for each of the 22).
- 12 = 34 − 22, consistent with the baseline totals.

## 5. Per-file count table

| Scope | Set | Per-file test counts | Evidence |
|---|---|---|---|
| PRE | 34 files | **NOT_RUN** for all 34 | `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/regression-vitest.log` — totals only (`Test Files  34 passed (34)`, `Tests  177 passed (177)`); no per-file lines. Per constraint 5: no estimation; NOT_RUN. |
| POST | 22 files | **NOT_RUN** for all 22 | `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/rollback-proof-summary.json` — totals only (`22 files / 111 tests PASS`). Per constraint 5: NOT_RUN. |

## 6. P-03 dependency map

| File | Classification | P-03 dependency |
|---|---|---|
| `lib/tools/r6/p03-result-schema-validation.test.ts` | REMOVED_BY_REVERT (P-03-file) | P-03's own committed test file (5 runtime cases per `P03-COMMIT-AND-ROLLBACK-2026-11-18.md` §2.2 note "runtime cases (5)"); exercises the P-03 gate. |
| `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` | UNTRACKED_ONLY | Tests P-03 pipeline tool-006; **pipeline absent in reverted tree** (not in baseline; `git ls-tree ed19a2ac` empty). |
| `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-015; **pipeline absent in reverted tree**. |
| `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-016; **pipeline present in reverted tree** (`git ls-tree ed19a2ac` → blob b5e89441…). |
| `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-022; **pipeline present in reverted tree** (blob 715fa461…). |
| `lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-023; **pipeline absent in reverted tree**. |
| `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-027; **pipeline present in reverted tree** (blob cbb2f86d…). |
| `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-034; **pipeline present in reverted tree** (blob 2c99904b…). |
| `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-035; **pipeline absent in reverted tree**. |
| `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-040; **pipeline absent in reverted tree**. |
| `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-043; **pipeline absent in reverted tree**. |
| `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` | UNTRACKED_ONLY | P-03 pipeline tool-044; **pipeline absent in reverted tree**. |

Additional P-03-dependent file **outside** the 34/22 sets: `lib/tools/r6/p03-gate-structural.test.ts` — committed in P-03 (in HEAD, not baseline; absent in `ed19a2ac`, verified). Prior report note applies: it is a different test selection and must not be conflated with the 34-set.

All 11 untracked-only tests verified: `git ls-files -o` lists each as untracked; `git ls-files` (tracked) is empty for each; each exists in the live WT (`Test-Path` → True); none exists in the true-clean worktree (`E:\p03-true-clean-20261118`).

## 7. Totals arithmetic + UNATTRIBUTED residual

| Metric | Pre-rollback | Post-rollback | Delta |
|---|---:|---:|---:|
| Test files | 34 | 22 | −12 |
| Tests | 177 | 111 | −66 |

- **File delta attribution:** −12 attributed — membership diff Pre−Post (rows 23–34). 0 unattributed.
- **Test delta attribution:** 0 attributed — per-file counts are NOT_RUN for both runs (§5).
- **UNATTRIBUTED residual: −66 tests** (177 − 111) — not attributable because no per-file counts exist in the available logs; per constraint 5 these are left as a residual, not divided or estimated.

## 8. Missing execution evidence + exact isolated rerun spec (do NOT execute)

Missing execution evidence:

1. Per-file test counts for the **34-file pre set** (pre-run) — NOT_RUN (`regression-vitest.log` has totals only).
2. Per-file test counts for the **22-file post set** (post-run) — NOT_RUN (`rollback-proof-summary.json` has totals only).
3. Executed 22-file list of the post run — not recorded (summary/doc state only the count and "HEAD-available subset").
4. Isolated rerun of the identical 34-file set — not recorded.
5. **Live WT execution** — NOT_RUN (no run is authorized or performed against the live working tree; constraint).
6. Pre-run environment caveat: the pre-run occurred in the **contaminated** environment (`E:/p03-clean-build-20261118`); only the isolated revert (`ed19a2ac`) is the proof baseline.

Exact additional isolated rerun spec (both SHA-pinned to the P-03 commit; do not execute):

- **Rerun A — pre-run per-file attribution (P-03 state, SHA `37f047a4105d078b22edea2c857bf35aefdbdc7f`):**
  - Env: new detached worktree `E:\p03-rerun-pre-20261119` at `37f047a4`, real `node_modules` (robocopy per prior practice), PowerShell 5.1, repo branch `feat/r6.1-tools-041-042` detached.
  - Command: `npx vitest run` with the full 34-path list (`regression-run.txt` lines 2–35, in order) plus `--reporter=json --outputFile=E:\p03-rerun-pre-20261119\pre34-per-file.json`.
  - Expected output: `RUN  v4.1.10`, `Test Files  34 passed (34)`, `Tests  177 passed (177)`, exit 0 (per `regression-vitest.log`; caveat: contaminated-env behavior not guaranteed in a clean isolated worktree).
- **Rerun B — post-run per-file attribution (reverted tree, SHA `ed19a2ac6c4c0d4bda0802d764d796e44e47240e`):**
  - Env: new detached worktree `E:\p03-rerun-post-20261119` at `ed19a2ac`, real `node_modules`, PowerShell 5.1.
  - Command: `npx vitest run` with the full 22-file list (Section 3) plus `--reporter=json --outputFile=E:\p03-rerun-post-20261119\post22-per-file.json`.
  - Expected output: `Test Files  22 passed (22)`, `Tests  111 passed (111)`.

Both reruns close gaps 1 and 2 of Section 8 and produce the per-file tables needed for the UNATTRIBUTED −66 residual.

## 9. SHA-256 of this output file

`53E708845384A65D0B6E70990EA05826ED7C0EE55E82949203DB1DCBDCA89645`
