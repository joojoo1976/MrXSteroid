# D — Rollback File-Level Reconciliation (R6.1, retry-01)

**Workstream D (Independent Test / Reliability Lead) | R6.1 Barrier 1 reconciliation | 2026-11-19 | READ-ONLY audit**

## 1. Proof summary

| Item | Value | Evidence refs |
|---|---|---|
| Repo / branch | `E:\MrXSteroid-main`, branch `feat/r6.1-tools-041-042` | `git rev-parse HEAD`, `git rev-parse --abbrev-ref HEAD` (2026-11-19): `37f047a4105d078b22edea2c857bf35aefdbdc7f`, `feat/r6.1-tools-041-042` |
| Baseline | `2a647fdae7060b3d215d4663eb3220555cce978b`, tree `7587bf508b9f88a40824b4e1e7a2b6041b928014` | `git rev-parse "2a647fda^{tree}"` = `7587bf5…` |
| P-03 commit / HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f`, tree `c537912297109408e82107dffa781ad974593b1d` | `git rev-parse HEAD`, `git rev-parse "37f047a4^{tree}"` |
| Isolated revert proof commit | `ed19a2ac6c4c0d4bda0802d764d796e44e47240e`, tree `7587bf508b9f88a40824b4e1e7a2b6041b928014` (== baseline tree) | `git rev-parse "ed19a2ac^{tree}"` = `7587bf5…`; `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/rollback-proof-summary.json` (`treeEqualsBaseline:true`, `diffFilesVsBaseline:0`) |
| Rollback proof checks | tsc 0, eslint 0 (0 errors, 11 warnings unused result schemas after revert), build EXITCODE 0, 506/506 static pages, porcelain 0 after build | `rollback-proof-summary.json` |
| Pre-rollback regression | **34 files / 177 tests PASS** (`REGRESSION_EXIT=0`, vitest v4.1.10, `E:/p03-clean-build-20261118`, duration 6.75s) — **contaminated environment** caveat | `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/regression-vitest.log` (UTF-16): `Test Files  34 passed (34)`, `Tests  177 passed (177)`; `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/regression-run.txt` (`TEST_FILES=34`) |
| Post-rollback regression | **22 files / 111 tests PASS** ("HEAD-available subset") | `rollback-proof-summary.json` (`"regression":"22 files / 111 tests PASS (HEAD-available subset)"`) |
| True-clean / contaminated refs | True-clean: `E:\p03-true-clean-20261118 @ 37f047a4`. Contaminated excluded: `E:\p03-clean-build-2026-11-18 @ 2a647fda` (per assignment baseline) | Assignment baseline; pre-run executed in contaminated clean-export env per `R6.1-ROLLBACK-RECONCILIATION.md` v1.1 §2 |
| Status | Membership reconciled from git/log evidence. Per-file counts **NOT_RUN** (totals only). Test delta residual **UNATTRIBUTED** (−66). No execution performed by this audit. | §§2–8 |

## 2. 34-file pre-rollback table (exact paths/order)

**Source:** `closure-sprint-2026-11-17/evidence-clean-build-2026-11-18/regression-run.txt` lines 1–35 (`TEST_FILES=34`; file paths in listed order, lines 2–35). **Per-file counts:** NOT_RUN for all 34 (no per-file lines in cited logs; totals only in `regression-vitest.log`).

| # | Path (exact, regression-run.txt order) | Per-file count |
|---:|---|---|
| 1 | `lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts` | NOT_RUN |
| 2 | `lib/tools/r6/tool-014-water-retention-pipeline.test.ts` | NOT_RUN |
| 3 | `lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts` | NOT_RUN |
| 4 | `lib/tools/r6/tool-025-drug-interaction-pro-pipeline.test.ts` | NOT_RUN |
| 5 | `lib/tools/r6/tool-026-injection-pain-pipeline.test.ts` | NOT_RUN |
| 6 | `lib/tools/r6/tool-029-side-effect-early-warning-pipeline.test.ts` | NOT_RUN |
| 7 | `lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.test.ts` | NOT_RUN |
| 8 | `lib/tools/r6/tool-037-side-effect-probability-pipeline.test.ts` | NOT_RUN |
| 9 | `lib/tools/r6/tool-038-stack-compatibility-pipeline.test.ts` | NOT_RUN |
| 10 | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts` | NOT_RUN |
| 11 | `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts` | NOT_RUN |
| 12 | `lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts` | NOT_RUN |
| 13 | `lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts` | NOT_RUN |
| 14 | `lib/tools/r6/tool-046-trt-lifetime-pipeline.test.ts` | NOT_RUN |
| 15 | `lib/tools/r6/tool-047-fertility-preservation-pipeline.test.ts` | NOT_RUN |
| 16 | `lib/tools/r6/tool-048-cardiovascular-risk-pipeline.test.ts` | NOT_RUN |
| 17 | `lib/tools/r6/tool-049-bone-density-pipeline.test.ts` | NOT_RUN |
| 18 | `lib/tools/engines/tool-050-mental-health.test.ts` | NOT_RUN |
| 19 | `tests/unit/tool-050-i18n-evidence.test.ts` | NOT_RUN |
| 20 | `lib/tools/adapters/tool-051-055-batch.test.ts` | NOT_RUN |
| 21 | `lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts` | NOT_RUN |
| 22 | `tests/unit/tool-051-i18n-evidence.test.ts` | NOT_RUN |
| 23 | `lib/tools/r6/p03-result-schema-validation.test.ts` | NOT_RUN |
| 24 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` | NOT_RUN |
| 25 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | NOT_RUN |
| 26 | `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | NOT_RUN |
| 27 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | NOT_RUN |
| 28 | `lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` | NOT_RUN |
| 29 | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | NOT_RUN |
| 30 | `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | NOT_RUN |
| 31 | `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | NOT_RUN |
| 32 | `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` | NOT_RUN |
| 33 | `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` | NOT_RUN |
| 34 | `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` | NOT_RUN |

## 3. 22-file post-rollback table

**Executed-list evidence basis:** `rollback-proof-summary.json` records totals only: `22 files / 111 tests PASS (HEAD-available subset)`; no executed file list is recorded in available rollback logs (`regression-vitest.log` is the pre-run log). **Best available file-level source:** `docs/MRX Genius Cloud Unified R6.1/R6.1-ROLLBACK-RECONCILIATION.md` v1.1 §3 (rows 1–22), described as git-evidenced intersection/baseline-tracked common set. This is consistent with `ed19a2ac^{tree} == 2a647fda^{tree}` and the "HEAD-available subset" summary, but is **not** an explicit per-file execution manifest from the post-run. All 22 paths verified present in reverted tree via `git ls-tree -r --name-only ed19a2ac -- <path>` (2026-11-19, all found).

| # | Path | In reverted tree `ed19a2ac` | Per-file count |
|---:|---|---|---|
| 1 | `lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts` | Yes | NOT_RUN |
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

## 4. Membership diff and classification (12-file set)

- **Pre − Post = 12 files** (regression-run.txt rows 23–34). **Post − Pre = 0 files** (all 22 post-set paths present in reverted tree; intersection = 22). Count consistency: 34 − 22 = 12.

| # | Path | In `37f047a4` tree | In `ed19a2ac` tree | Classification | Evidence |
|---:|---|---|---|---|---|
| 1 | `lib/tools/r6/p03-result-schema-validation.test.ts` | Yes | No | **P-03-commit-removed-by-revert** | `git ls-tree -r --name-only 37f047a4 -- <path>` returns file; `ed19a2ac` query empty. P-03 committed test removed by revert (also per `rollback-proof-summary.json`: P-03 test files absent after revert). |
| 2 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Not in `37f047a4`/`ed19a2ac` trees; `git ls-files -- <path>` empty (untracked in HEAD); `git ls-files -o -- <path>` lists file in current WT (2026-11-19). Pre-run executed in contaminated env where file existed. |
| 3 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 4 | `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 5 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 6 | `lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 7 | `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 8 | `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 9 | `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 10 | `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 11 | `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |
| 12 | `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` | No | No | **untracked-only-in-prior-env** | Same evidence pattern as #2. |

**Modified-only:** none evidenced. **Unknown:** none; all 12 classified with git/log evidence.

## 5. Per-file count table

| Scope | Files | Per-file test counts | Evidence |
|---|---:|---|---|
| PRE (34) | 1–34 in §2 | **NOT_RUN** (all 34) | `regression-vitest.log`: totals only — `Test Files 34 passed (34)`, `Tests 177 passed (177)`; no per-file breakdown. Per constraints: no inference/estimation. |
| POST (22) | 1–22 in §3 | **NOT_RUN** (all 22) | `rollback-proof-summary.json`: totals only — `22 files / 111 tests PASS`. No per-file breakdown. |
| Delta files (12) | §4 | **NOT_RUN** (all 12) | No per-file counts in available artifacts. |

## 6. P-03 dependency map and post-revert runnability

| File | Class | P-03 dependency / role | Could run post-revert (reverted tree `ed19a2ac`)? | Evidence |
|---|---|---|---|---|
| `lib/tools/r6/p03-result-schema-validation.test.ts` | P-03-commit-removed-by-revert | P-03 committed schema-validation test (row 23). | **No** — file absent in `ed19a2ac` (removed by revert). | `git ls-tree ed19a2ac` empty; present in `37f047a4`. |
| `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-006. | **No (as clean reverted checkout)** — test file not in reverted tree; corresponding pipeline also absent in `ed19a2ac` (`git ls-tree ed19a2ac -- lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts` empty). Could only run in a contaminated/non-clean env that also supplies the untracked test+deps. | git tree checks 2026-11-19. |
| `lib/tools/r6/tool-015-shbg-modulator-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-015. | **No (as clean reverted checkout)** — test absent; pipeline absent in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-016-half-life-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-016. | **No (as clean reverted checkout)** — test absent in reverted tree (untracked-only). Pipeline **present** in `ed19a2ac` (`lib/tools/r6/tool-016-half-life-pipeline.ts`), but missing test file prevents this exact 34-set member from running in a clean checkout. | `git ls-tree ed19a2ac` shows pipeline; test not in tree. |
| `lib/tools/r6/tool-022-half-life-stacker-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-022. | **No (as clean reverted checkout)** — test absent; pipeline present in `ed19a2ac`. | same pattern. |
| `lib/tools/r6/tool-023-trt-optimization-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-023. | **No (as clean reverted checkout)** — test absent; pipeline absent in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-027-ester-conversion-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-027. | **No (as clean reverted checkout)** — test absent; pipeline present in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-034-compound-clearance-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-034. | **No (as clean reverted checkout)** — test absent; pipeline present in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-035-hormone-conversion-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-035. | **No (as clean reverted checkout)** — test absent; pipeline absent in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-040. | **No (as clean reverted checkout)** — test absent; pipeline absent in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-043-prolactin-management-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-043. | **No (as clean reverted checkout)** — test absent; pipeline absent in `ed19a2ac`. | git tree checks. |
| `lib/tools/r6/tool-044-dht-side-effects-pipeline.test.ts` | untracked-only-in-prior-env | Tests P-03 pipeline tool-044. | **No (as clean reverted checkout)** — test absent; pipeline absent in `ed19a2ac`. | git tree checks. |

**P-03-dependent files in the 34-set:** all 12 in §4 are P-03-related (1 committed P-03 test, 11 untracked P-03 pipeline tests). **Untracked-only tests in the 34-set:** rows 24–34 (11 files). **Post-revert runnability:** none of these 12 are available in a clean reverted checkout of `ed19a2ac` as members of the 34-set; row 23 is reverted out, rows 24–34 are not in git tree (untracked) even where underlying pipelines may remain.

**Related but outside 34/22:** `lib/tools/r6/p03-gate-structural.test.ts` is present in `37f047a4` and absent in `ed19a2ac` (git-verified), but **not listed** in `regression-run.txt` pre-34 set; different selection/scope — do not conflate with 34→22 reconciliation.

## 7. Totals arithmetic and attribution

| Metric | Pre | Post | Delta | Attribution |
|---|---:|---:|---:|---|
| Test files | 34 | 22 | −12 | **Fully attributed by membership:** 12 files in Pre−Post (§4). 0 files unattributed. |
| Tests | 177 | 111 | −66 | **0 attributed, 66 UNATTRIBUTED residual.** Per-file counts are NOT_RUN for both runs (§5); no per-file breakdown exists in `regression-vitest.log` or `rollback-proof-summary.json`. No inference performed. |

Arithmetic check: 34−22=12 files; 177−111=66 tests (matches cited totals).

## 8. Missing execution evidence and exact isolated rerun spec (NOT executed)

**Missing evidence:**
1. Per-file test counts for the **34-file pre set** (totals only in `regression-vitest.log`).
2. Per-file test counts for the **22-file post set** (totals only in `rollback-proof-summary.json`).
3. Explicit executed 22-file manifest for post-run (summary states "HEAD-available subset" only; §3 list is git-evidenced intersection, not an execution log).
4. Isolated rerun of the identical 34-file set at `37f047a4` producing per-file counts.
5. Any live working-tree execution (intentionally **NOT_RUN**; forbidden/not authorized).
6. Pre-run environment caveat: executed in contaminated env `E:/p03-clean-build-20261118`; isolated revert proof baseline is `ed19a2ac`.

**Exact additional isolated rerun spec (if authorized; do NOT execute now):**
- **Rerun A (pre attribution, P-03 state):** Env = new detached worktree at SHA `37f047a4105d078b22edea2c857bf35aefdbdc7f` (e.g. `E:\p03-rerun-pre-20261119`) on `feat/r6.1-tools-041-042` detached, PowerShell 5.1, real `node_modules` provisioned read-only-style per prior practice (no tracked changes), no source edits. Command: `npx vitest run <34 paths from regression-run.txt lines 2–35 in order> --reporter=json --outputFile=<worktree>\pre34-per-file.json` (plus default/text reporter log if desired). Expected from prior evidence (not guaranteed in clean isolated env): exit 0, `Test Files 34 passed (34)`, `Tests 177 passed (177)`.
- **Rerun B (post attribution, reverted state):** Env = new detached worktree at SHA `ed19a2ac6c4c0d4bda0802d764d796e44e47240e` (e.g. `E:\p03-rerun-post-20261119`), same toolchain constraints. Command: `npx vitest run <22 paths from §3 in order> --reporter=json --outputFile=<worktree>\post22-per-file.json`. Expected: exit 0, `Test Files 22 passed (22)`, `Tests 111 passed (111)`.
- **Outputs needed:** per-file JSON results for both runs, captured stdout/stderr logs, SHA/worktree provenance, and (for Rerun A) explicit note on any contaminated-vs-clean env delta if totals differ.

## 9. Unresolved items

| Item | Owner | Next action | Blocker reason |
|---|---|---|---|
| Per-file counts for 34-file pre set | Workstream D / Test & Reliability (authorized executor) | Run Rerun A in isolated detached worktree at `37f047a4`; publish per-file JSON+log | No per-file data in available artifacts; execution not performed |
| Per-file counts for 22-file post set | Workstream D / Test & Reliability | Run Rerun B in isolated detached worktree at `ed19a2ac`; publish per-file JSON+log | Totals-only evidence |
| Attribute −66 test delta file-by-file | Workstream D | Compute per-file deltas from Rerun A/B outputs; replace UNATTRIBUTED residual with evidenced attribution or explain variance | Depends on above reruns |
| Confirm explicit executed post-run file manifest | Workstream D / evidence owner | If original post-run detailed log exists elsewhere, cite it; otherwise treat Rerun B manifest as authoritative isolated evidence | `rollback-proof-summary.json` lacks file list |
| Contaminated-env comparability of pre totals | Workstream D | Compare Rerun A totals against 34/177 in clean isolated env; document any delta | Pre-run recorded in `E:/p03-clean-build-20261118` (contaminated) |

## 10. SHA-256 of this output file

`d135a132b936000bf98de47acdba75bc6a1a32159cfc2cb52cded2618ad6c9b5`
