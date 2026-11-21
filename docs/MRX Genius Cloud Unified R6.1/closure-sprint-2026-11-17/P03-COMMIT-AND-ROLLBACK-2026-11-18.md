# P03-RESULT-SCHEMA-GATE — Commit and Rollback Proof (2026-11-18)

**Branch:** `feat/r6.1-tools-041-042`
**Baseline:** `2a647fdae7060b3d215d4663eb3220555cce978b`
**P-03 commit:** `37f047a4105d078b22edea2c857bf35aefdbdc7f`
**Isolated revert commit:** `ed19a2ac6c4c0d4bda0802d764d796e44e47240e`
**Scope:** the 33-file list approved by the owner on 2026-11-18. No Push, no Merge, no Deploy.

---

## 1. What the gate does

Every pipeline now validates the engine result with its own `ResultSchema` **before** the envelope is built:

```ts
const engineResult = <engine call>;
const resultParsed = ResultSchema.safeParse(engineResult);
if (!resultParsed.success) {
  return { ok: false, error: resultParsed.error };   // no envelope
}
const output = buildEnvelope(parsed.data, resultParsed.data, options);
```

On success, `resultParsed.data` (not the raw engine return) flows into the envelope.

**Classification of Tool 008:** `STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL`.
`engineResult = parsed.data` and the result schema is the same `SideEffectLogSchema` used for the input, so that path cannot demonstrate rejection of an independently shaped engine result. The structural test is **not** counted as runtime failure-branch evidence for Tool 008.

---

## 2. Commit record

### 2.1 Stage check (explicit paths, never `git add -A`)

| Check | Command | Result |
|---|---|---|
| Path count | 33 paths written to a NUL-separated pathspec file | 33 unique |
| Stage | `git add --pathspec-from-file=<file> --pathspec-file-nul` | exit 0 |
| Staged set | `git diff --cached --name-only -z` compared to the approved list | 33 staged, 33 expected, `sameSet=true`, 0 extra, 0 missing, 0 duplicates |
| Whitespace | `git diff --cached --check` | exit 0 |
| Stat | `git diff --cached --stat` | `33 files changed, 1290 insertions(+), 55 deletions(-)` |
| Other work | `git diff --cached --name-only` | exactly the 33 approved paths (no unrelated file staged) |
| Commit contents | `git show --name-only --pretty=format: -z HEAD` | 33 files, same set as approved |

The commit message was amended once to strip a UTF-8 BOM from the subject: `86365c55` → `37f047a4`. File contents were not changed by the amend; the 33-file set is identical.

### 2.2 Actual files in the commit (33)

**Pipelines (30):**

| # | Path |
|---:|---|
| 1 | `lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts` |
| 2 | `lib/tools/r6/tool-008-side-effect-tracker-pipeline.ts` |
| 3 | `lib/tools/r6/tool-014-water-retention-pipeline.ts` |
| 4 | `lib/tools/r6/tool-015-shbg-modulator-pipeline.ts` |
| 5 | `lib/tools/r6/tool-016-half-life-pipeline.ts` |
| 6 | `lib/tools/r6/tool-017-drug-interaction-pipeline.ts` |
| 7 | `lib/tools/r6/tool-022-half-life-stacker-pipeline.ts` |
| 8 | `lib/tools/r6/tool-023-trt-optimization-pipeline.ts` |
| 9 | `lib/tools/r6/tool-025-drug-interaction-pro-pipeline.ts` |
| 10 | `lib/tools/r6/tool-026-injection-pain-pipeline.ts` |
| 11 | `lib/tools/r6/tool-027-ester-conversion-pipeline.ts` |
| 12 | `lib/tools/r6/tool-029-side-effect-early-warning-pipeline.ts` |
| 13 | `lib/tools/r6/tool-031-cycle-length-optimizer-pipeline.ts` |
| 14 | `lib/tools/r6/tool-034-compound-clearance-pipeline.ts` |
| 15 | `lib/tools/r6/tool-035-hormone-conversion-pipeline.ts` |
| 16 | `lib/tools/r6/tool-037-side-effect-probability-pipeline.ts` |
| 17 | `lib/tools/r6/tool-038-stack-compatibility-pipeline.ts` |
| 18 | `lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.ts` |
| 19 | `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.ts` |
| 20 | `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` |
| 21 | `lib/tools/r6/tool-042-estrogen-management-pipeline.ts` |
| 22 | `lib/tools/r6/tool-043-prolactin-management-pipeline.ts` |
| 23 | `lib/tools/r6/tool-044-dht-side-effects-pipeline.ts` |
| 24 | `lib/tools/r6/tool-045-cycle-break-planner-pipeline.ts` |
| 25 | `lib/tools/r6/tool-046-trt-lifetime-pipeline.ts` |
| 26 | `lib/tools/r6/tool-047-fertility-preservation-pipeline.ts` |
| 27 | `lib/tools/r6/tool-048-cardiovascular-risk-pipeline.ts` |
| 28 | `lib/tools/r6/tool-049-bone-density-pipeline.ts` |
| 29 | `lib/tools/r6/tool-050-mental-health-pipeline.ts` |
| 30 | `lib/tools/r6/tool-051-peptide-dosage-pipeline.ts` |

**Proof and schema (3):**

| # | Path | Note |
|---:|---|---|
| 31 | `lib/tools/r6/p03-result-schema-validation.test.ts` | runtime cases (5) |
| 32 | `lib/tools/r6/p03-gate-structural.test.ts` | structural coverage (30 pipelines + coverage check) |
| 33 | `lib/tools/schemas/tool-023-trt-optimization.ts` | HEAD blob was empty (`e69de29`); the 023 pipeline imports 4 symbols from it |

9 of these paths did not exist in HEAD: 7 pipelines (006, 015, 023, 035, 040, 043, 044) + 2 tests. Path 33 is a content addition on a tracked-but-empty path.

Per-file SHA-256 + git blob IDs: `p03-commit-manifest-precommit.json`.

### 2.3 Post-commit working tree

- Porcelain immediately after commit: **480 entries = 45 tracked modified + 435 untracked** (434 pre-existing + the pre-commit manifest).
- No unrelated file was committed; all other work remained in the working tree.

---

## 3. Rollback proof (isolated environment only)

The rollback ran in a separate detached worktree, never on `feat/r6.1-tools-041-042`.

| Step | Result |
|---|---|
| Environment | `git worktree add --detach E:\p03-rollback-20261118 37f047a4` + real `node_modules` copy (robocopy) |
| Revert | `git revert --no-edit 37f047a4` → exit 0 → `ed19a2ac` |
| Files vs baseline | `git diff --name-only 2a647fda HEAD` → **0 files** |
| Tree hash | `HEAD^{tree} == 2a647fda^{tree}` → **identical (`TREE_EQUAL=True`)** |
| Working tree | `git status --porcelain=v1 --untracked-files=all` → **0 entries** |
| P-03 test files | both **absent** after the revert (removed by the revert itself) |
| TypeScript | `tsc --noEmit` exit **0** |
| ESLint | exit **0**, 11 warnings (the reverted pipelines no longer use their result schemas) |
| Regression | **22 files / 111 tests PASS**, exit 0 (HEAD-available subset of the 34-file clean-export set) |
| Build | `next build` **EXITCODE=0**, `506/506` static pages |
| Original worktree | untouched: HEAD `37f047a4`, porcelain 480 at the time of the check |
| Disposal | isolated worktree removed with `git worktree remove --force` (no reset, no clean, no destructive command on the working branch) |

Artifacts: `evidence-clean-build-2026-11-18/rollback-next-build.log`, `rollback-next-build.exit.txt`, `rollback-proof-summary.json`.

**Conclusion:** the revert is the exact inverse of the P-03 commit. It restores the baseline tree byte-for-byte and touches no unrelated work.

---

## 4. Evidence matrix — Structural vs Runtime vs Regression vs Tool 023

The owner asked for this split explicitly. **Passing the structural test is not runtime negative-branch evidence.**

### 4.1 Per-pipeline matrix

Legend: **S** = structural gate proof (`p03-gate-structural.test.ts`); **R** = runtime rejection of a mismatched engine result (`p03-result-schema-validation.test.ts`); **—** = no runtime negative test for that pipeline.

| # | Tool | Pipeline | S | R | Classification |
|---:|---:|---|:---:|:---:|---|
| 1 | 006 | estrogen-prolactin | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 2 | 008 | side-effect-tracker | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL (vacuous: result == input schema) |
| 3 | 014 | water-retention | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 4 | 015 | shbg-modulator | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 5 | 016 | half-life | PASS | PASS | RUNTIME_PROVEN (actual `r6RunHalfLife` path) |
| 6 | 017 | drug-interaction | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 7 | 022 | half-life-stacker | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 8 | 023 | trt-optimization | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL; schema-acceptance proven on 12,800 engine outputs (not a gate-rejection proof) |
| 9 | 025 | drug-interaction-pro | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 10 | 026 | injection-pain | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 11 | 027 | ester-conversion | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 12 | 029 | side-effect-early-warning | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 13 | 031 | cycle-length-optimizer | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 14 | 034 | compound-clearance | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 15 | 035 | hormone-conversion | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 16 | 037 | side-effect-probability | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 17 | 038 | stack-compatibility | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 18 | 039 | liver-enzyme-tracker | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 19 | 040 | lipid-profile-optimizer | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 20 | 041 | hematocrit-monitor | PASS | PASS | RUNTIME_PROVEN (standard run) |
| 21 | 042 | estrogen-management | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 22 | 043 | prolactin-management | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 23 | 044 | dht-side-effects | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 24 | 045 | cycle-break-planner | PASS | PASS | RUNTIME_PROVEN |
| 25 | 046 | trt-lifetime | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 26 | 047 | fertility-preservation | PASS | PASS | RUNTIME_PROVEN (`FertilityResultSchema`) |
| 27 | 048 | cardiovascular-risk | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 28 | 049 | bone-density | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 29 | 050 | mental-health | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |
| 30 | 051 | peptide-dosage | PASS | — | STRUCTURAL_VALIDATION_ONLY — RUNTIME_EFFECTIVENESS_PARTIAL |

Totals: **structural 30/30**; **runtime negative-branch proven 4/30** (016, 041, 045, 047); **Tool 008 excluded** from runtime effectiveness; Tool 023's 12,800 grid proves schema acceptance only and is not counted as runtime gate-rejection evidence.

### 4.2 Coverage totals (clean export at `37f047a4`)

| Evidence class | Result |
|---|---|
| TypeScript | PASS (`tsc --noEmit` exit 0) |
| ESLint (30 changed pipelines) | PASS (exit 0) |
| P-03 runtime test file | 1 file / 5 tests PASS |
| P-03 structural test file | 1 file / 31 tests PASS (30 pipelines + coverage check) |
| Regression | 34 files / 177 tests PASS, exit 0 |
| Tool 023 schema proof | 5 tests PASS, 12,800 input combinations, 0 schema rejections |
| Next build | EXITCODE=0, 506/506 static pages |
| Build warnings (non-fatal) | `metadataBase` not set; `SUPABASE_URL` / `SUPABASE_ANON_KEY` undefined |

---

## 5. Tool 023 — how the 12,800 combinations were generated, and what they cover

The grid is a Cartesian product in `tool-023-schema-engine-proof.test.ts`:

| Axis | Values | Count |
|---|---|---:|
| `age` | 18, 35, 50, 65, 80 | 5 |
| `symptoms` | none, mild, moderate, severe | 4 |
| `administration` | intramuscular, subcutaneous, transdermal, pellets | 4 |
| `current_total_test_ng_dL` | undefined, 150, 400, 750, 1200 | 5 |
| `hematocrit_current` | undefined, 45, 52, 60 | 4 |
| `e2_current_pg_mL` | undefined, 20, 35, 80 | 4 |
| `trt_duration_months` | 0, 3, 6, 12, 600 | 5 |
| **Total** | `5 × 4 × 4 × 5 × 4 × 4 × 5` | **12,800** |

For each combination the test calls `calculateTrtOptimization(input)` and asserts `TrtResultSchema.safeParse(output).success === true`.

**Coverage scope (honest limits):**
- It proves the schema **accepts** engine outputs across this grid; it does **not** prove the numeric values are clinically correct.
- `current_free_test_pg_mL` is not an axis (it is only used in the single full-panel case).
- It does not cover every possible input: it is a sampled grid, not an exhaustive domain proof.
- It does not inject a mismatched result to prove rejection; rejection is proven separately by the invalid-input cases.
- Therefore the 12,800 figure is described as **grid coverage**, never as "all cases".

---

## 6. P-03 status after this work

| Item | Status |
|---|---|
| Commit of the approved 33-file list | **DONE** — `37f047a4`, local only |
| Rollback proof in an isolated environment | **DONE** — tree-identical to `2a647fda`, build/tsc/ESLint/regression re-run |
| Structural gate coverage | **30/30 PASS** |
| Runtime negative-branch effectiveness | **4/30 PASS** (016, 041, 045, 047); Tool 008 structurally valid but runtime-partial by design |
| P-03 gate closure | **PARTIAL** — the gate is implemented and reversible; it is not proven at runtime for 25 pipelines |

Creating the commit is not gate closure. The remaining P-03 work is one runtime negative test per pipeline (or an owner-approved sampling policy).
