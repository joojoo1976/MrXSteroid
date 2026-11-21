# Workstream A — Repository Integrity & Preservation Report

| Field | Value |
|---|---|
| Workstream | A — Repository Integrity & Preservation Lead (MrXSteroid R6.1) |
| Date (audit) | 2026-11-19 |
| Mode | Read-only audit + documentation only (no code/contract/schema/original-ledger changes; no git writes) |
| Repo / worktree | `E:\MrXSteroid-main` |
| Outputs | `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/A-REPOSITORY-INTEGRITY-REPORT.md`, `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/A-WORKING-TREE-DISPOSITION-FINAL.csv` |

## 1. Verified baseline (read-only evidence)

| Item | Verified value | Evidence command / source |
|---|---|---|
| Branch | `feat/r6.1-tools-041-042` | `git rev-parse --abbrev-ref HEAD` → `feat/r6.1-tools-041-042` |
| HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` | `git rev-parse HEAD` |
| HEAD subject (context) | `feat(r6): P03-RESULT-SCHEMA-GATE across 30 execution pipelines` | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/GIT-STATE-AFTER-P03-2026-11-18.json` (`headSubject`) |
| Upstream | `origin/feat/r6.1-tools-041-042` | `git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'` |
| Ahead / behind | `1 / 0` (not pushed) | `git rev-list --left-right --count HEAD...origin/feat/r6.1-tools-041-042` → `1\t0` |
| Upstream commit (reported baseline) | `2a647fdae7060b3d215d4663eb3220555cce978b` | Provided baseline; consistent with ahead 1 (HEAD not on remote) |
| Stashes (untouched) | 2: `stash@{0}: On feat/tool-036-v4-core: WIP tool-036 changes` (commit ref shown `e4ad5a7d` in stash message context), `stash@{1}: On cline/8b0da: seo-wip-pre-merge` | `git stash list` (read-only) |
| Worktrees (read-only inventory) | Active: `E:/MrXSteroid-main` @ `37f047a4` (`refs/heads/feat/r6.1-tools-041-042`). Detached/other present incl. `E:/p03-true-clean-20261118` @ `37f047a4` (detached), `E:/p03-clean-build-20261118` @ `2a647fda` (detached, contaminated per baseline docs), plus additional unrelated/prunable worktrees (codex df22, dashboard-suite, hotfix936, mrx-dashboard, MrXSteroid-integration prunable, MrXSteroid-payment prunable, MrXSteroid-v3-audit-fixes prunable, MrXSteroid-v4-audit-fixes prunable, safety-pr, E:/tmp/MrXSHead prunable, trusted-oidc) | `git worktree list --porcelain` |
| Live working tree (2026-11-19, this audit) | **530** porcelain entries, `--untracked-files=all`: **0 staged, 46 modified, 484 untracked** | `git status --porcelain=v1 --untracked-files=all` + counts via PowerShell `Measure-Object`/filters; live capture saved to temp `live-status-530.txt` for diffing (outside repo) |
| Pre-dispatch locked snapshot | **524** entries | `C:\Users\foryo\AppData\Local\Temp\opencode\parallel-pre-dispatch-status.txt` (524 lines) |
| True-clean reference | `E:/p03-true-clean-20261118` @ `37f047a4` (detached) | `git worktree list --porcelain` / baseline docs |
| Contaminated excluded | `E:/p03-clean-build-20261118` @ `2a647fda` (detached) | `git worktree list --porcelain` / baseline docs |
| Existing UNCONFIRMED DRAFT artifacts in output dir (not modified) | `B1a-LEDGER-006-015.md`, `B1b-LEDGER-016-023.md`, `B2b-LEDGER-034-044.md`, `D-ROLLBACK-FILE-LEVEL-RECONCILIATION.md`, `F-BROWSER-SOURCE-CLINICAL-READINESS.md` (present; untouched) | `Get-ChildItem docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19` |

**Git write operations:** none performed (no add/commit/push/merge/rebase/revert/reset/clean/stash/checkout/restore/branch/worktree changes). **Build/test/install:** none performed.

## 2. Live status delta vs pre-dispatch snapshot (530 vs 524)

- Pre-dispatch snapshot: `C:\Users\foryo\AppData\Local\Temp\opencode\parallel-pre-dispatch-status.txt` (**524** entries).
- Live: `git status --porcelain=v1 --untracked-files=all` (**530** entries).
- Set diff (live − pre-dispatch, by exact porcelain line): **6** entries; (pre-dispatch − live): **0**.

| Delta (+6 live-only, all untracked `??`) | Classification |
|---|---|
| `?? "docs/MRX Genius Cloud Unified R6.1/R6.1-HISTORY-CONTEXT-INTEGRATION-ADDENDUM-2026-11-19.md"` | **AUDIT_GENERATED / parallel-context artifact** (separately identified; not in 524 snapshot disposition set) — matches stated addendum |
| `?? "docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/B1a-LEDGER-006-015.md"` | **AUDIT_GENERATED** (prior audit output; UNCONFIRMED DRAFT, preserved) |
| `?? "docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/B1b-LEDGER-016-023.md"` | **AUDIT_GENERATED** (prior audit output; preserved) |
| `?? "docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/B2b-LEDGER-034-044.md"` | **AUDIT_GENERATED** (prior audit output; preserved) |
| `?? "docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/D-ROLLBACK-FILE-LEVEL-RECONCILIATION.md"` | **AUDIT_GENERATED** (prior audit output; preserved) |
| `?? "docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/F-BROWSER-SOURCE-CLINICAL-READINESS.md"` | **AUDIT_GENERATED** (prior audit output; preserved) |

**Separation:** the 524 pre-dispatch snapshot paths are the disposition scope for `A-WORKING-TREE-DISPOSITION-FINAL.csv`. The 6 delta paths above are **AUDIT_GENERATED** (5 prior audit outputs + `R6.1-HISTORY-CONTEXT-INTEGRATION-ADDENDUM-2026-11-19.md`) and are **excluded** from the 524-row disposition CSV and listed here only.

## 3. Count-resolution table (507/511/513/523/524/530)

| Count | Meaning / evidence | Status |
|---:|---|---|
| **507** | Snapshot A: `closure-sprint-2026-11-17/GIT-STATE-AFTER-P03-2026-11-18.json` (`generatedAt` 2026-11-18T17:21:08.150Z, `counts.total` 507: 0 staged, 46 modified, 461 untracked). Path-level set A=507. | Correct for that snapshot (evidence file) |
| **511** | 507 + 4 paths appeared post-snapshot as reconciled in prior analysis (`wt-reconcile.json`/manifest context): `GIT-STATE-AFTER-P03-2026-11-18.json`, `R6.1-NEW-DEVELOPER-HANDOVER-BASELINE-RECONCILIATION-2026-11-18.md`, `lib/tools/r6/__p03-control.test.ts`, `lib/tools/r6/p03-runtime-negative-coverage.test.ts`. Set evidence in `set-diff-all.json` (A=507, B(then)=523, C=513). | Correct for that reconciliation point (prior evidence) |
| **513** | Disposition matrix v1 (`R6.1-WORKING-TREE-DISPOSITION-MATRIX.v1-513rows-2026-11-19.csv`): **513 data rows** (514 lines incl. header), captured from file-expanded `-uall` state; corresponds to 511-equivalent basis + 2 untracked reports before matrix-v1 generation (per manifest v1.1). | Correct for matrix-v1 capture (artifact preserved) |
| **523** | (a) Live file-expanded set B in `set-diff-all.json` = 523. (b) Current pre-dispatch locked snapshot = **524 lines** in this environment? note: pre-dispatch file provided is 524 entries; manifest/baseline reconciliation described progression to 523 live and matrix v2 524 with self-row. Using current evidence: **pre-dispatch snapshot = 524**; live now = **530**. The 523 figure is explained by prior point-in-time `--untracked-files=all` counts before the 1 additional snapshot entry / matrix-generation timing (see 524). | Explained (point-in-time/file-set timing) |
| **524** | Pre-dispatch locked snapshot file contains **524** porcelain entries (`parallel-pre-dispatch-status.txt`). Matrix v2 (`R6.1-WORKING-TREE-DISPOSITION-MATRIX.csv`) has **524 data rows** (525 lines) and includes a **self-row** for `docs/MRX Genius Cloud Unified R6.1/R6.1-WORKING-TREE-DISPOSITION-MATRIX.csv` captured at generation time (self-inclusion artifact). | Correct as snapshot count (524) and as matrix-v2 row count (524, includes self-row) |
| **530** | Current live `git status --porcelain=v1 --untracked-files=all`: **530** entries (0 staged, 46 modified, 484 untracked). Delta vs 524 = +6 audit-generated paths (section 2). | Correct current live count |
| **381** (historical, directory-collapsed) | Default `git status` without `--untracked-files=all` collapses untracked directories into directory entries; reported as 381 in prior captures. **Counting-mode artifact, not file loss** and not comparable to file-expanded A/B/C/snapshot counts. | Artifact (documented in manifest/baseline) |

**Set reconciliation evidence (`set-diff-all.json`, normalized, file-expanded, as captured):** A=507, B=523, C=513; `A∩B=505, A−B=2, B−A=18, B∩C=511, B−C=12, C−B=2, A∩C=505, A−C=2, C−A=8`. `A−B` = 2 mojibake em-dash path strings for V4 reports whose clean-name files exist on disk and in B/C (`R5_FIRST_BATCH — IMPLEMENTATION AND OWNER PREVIEW REPORT.md`, `R5_FIRST_BATCH — TOOL SELECTION AND IMPLEMENTATION SCOPE.md`) — **no true disappearance**. `B−A` includes 4 post-snapshot appearances (incl. 2 protected P-03 tests), 2 baseline/manifest docs, 10 audit deliverables created in that wave, and 2 encoding variants (manifest v1.1).

## 4. Matrix v1/v2 reconciliation

| Check | Result | Evidence |
|---|---|---|
| v1 preserved (separate file, intact) | **Yes**. `R6.1-WORKING-TREE-DISPOSITION-MATRIX.v1-513rows-2026-11-19.csv`: 514 lines, **513 data rows**, 173,460 bytes, SHA-256 `D6B4947A39E165F960240A04614A3FA5E37D5CF7924601929312DF46370498F9`. Read-only inspection this audit; not modified. | File metadata/hash/read |
| v2 present | `R6.1-WORKING-TREE-DISPOSITION-MATRIX.csv`: 525 lines, **524 data rows**, 177,162 bytes, SHA-256 `07F4512F8667D33E5EC596520CC483F22A3A88E91F6E44DA4823303A34967385`. | File metadata/hash/read |
| v2 self-row / counting convention | v2 contains a self-row: path `docs/MRX Genius Cloud Unified R6.1/R6.1-WORKING-TREE-DISPOSITION-MATRIX.csv` (untracked, included at matrix generation time). v2 row count 524 = prior matrix basis 513 + 10 deliverables added after v1 + 1 self-row (self-inclusion artifact), consistent with manifest/baseline explanation. | v2 content inspection (`Full Path` column) |
| v2 corrected row count (interpretation) | **524 rows total in v2 artifact** (including 1 self-row). Excluding self-row yields 523 path rows captured; live git state timing differs from generation moment (current live 530 incl. 6 audit-generated). | Row counts and delta analysis |
| v2 under-tagging (heuristic, known) | v2 `Batch` empty for 263 rows and `Tool ID` empty for 263 rows (`Batch`: empty=263, 1=139, 2=15, 3=4, OTHER=53, REF=50). Batch 4/shared under-tagged by filename heuristic — refined in `A-WORKING-TREE-DISPOSITION-FINAL.csv`. | `Import-Csv` groupings on v2 |

## 5. Disposition of 524 pre-dispatch snapshot paths (final, refined)

- Scope: **every path in the 524-entry pre-dispatch snapshot** (`parallel-pre-dispatch-status.txt`), in snapshot order/context, covered in `A-WORKING-TREE-DISPOSITION-FINAL.csv`.
- Excluded from CSV: 6 live-only audit-generated paths listed in section 2 (5 prior audit outputs + addendum).
- Method (refined): classified by path/content heuristics (status, path patterns, tool-id extraction, test/evidence/docs/source/archive/scratch indicators). Batch mapping applied: **Batch 1** {006,015,023,035,040,041,042,043,044}, **Batch 2** {045–051}, **Batch 3** {016,022,027,031,034}, **Batch 4** {008,014,017,025,026,029,037,038}, **REF** {039}, **SHARED** for genuinely shared/cross-cutting infrastructure or multi-batch docs, **OTHER** for tool-specific paths outside B1–4/REF, **NONE** for scratch-only items. `shared=Y` where file is genuinely shared (not forced into one batch).
- **Limitations:** classification is evidence-bounded heuristic (no builds/tests run; deep per-file semantic review not exhaustively performed). Content was not opened for every file; path-based inference used. Items requiring deeper adjudication remain noted for review.

### 5.1 Counts (modified/untracked/staged/total) — snapshot scope (524)

| Metric | Count |
|---|---:|
| Total (snapshot paths) | **524** |
| Staged | **0** |
| Modified (tracked, ` M`) | **46** |
| Untracked (`??`) | **478** |

### 5.2 Classification breakdown (524 snapshot paths)

| classification | count |
|---|---:|
| docs | 213 |
| source | 123 |
| test | 90 |
| evidence | 81 |
| archive | 9 |
| scratch/temp | 8 |

### 5.3 Batch / shared breakdown (524 snapshot paths)

| batch | count |
|---|---:|
| SHARED | 270 |
| 1 | 122 |
| REF (039) | 53 |
| OTHER (tool-specific, outside B1–4/REF) | 52 |
| 2 | 15 |
| NONE (scratch-only) | 8 |
| 3 | 4 |

| shared | count |
|---|---:|
| Y (genuinely shared/cross-cutting) | 270 |
| N | 254 |

| Unknown / needs review markers | count | note |
|---|---:|---|
| batch OTHER or NONE | 60 | outside B1–4/REF scope or scratch-only; not forced into a batch |
| tool_ids empty | 276 | cross-cutting/shared/scratch/docs without tool-id token; expected for shared infrastructure and general docs |

## 6. Modified and untracked by purpose (all 530 live entries context)

**Tracked modified (46):** preserved tool/UI components and shared UI (`components/tools/*`, `shared/ui/DynamicBrandLogo.tsx`, `Footer.tsx`, `GlobalHeader.tsx`), localization resources (`i18n/tool-006,015,023,040,051*.json`), and tool schemas (`lib/tools/schemas/tool-011,018,019,036,041,042,043,044.ts`). Purpose mix: **source/UI/schema/i18n changes** (no staged entries).

**Untracked (484 live, of which 478 in 524 snapshot + 6 audit-generated):** span **tests** (component/unit/pipeline/contract/a11y), **source** (new components, pipelines, contracts, engines/profiles, shared libs, templates), **docs/reconciliation/ledgers/scripts**, **evidence** (screenshots/json/manifests), **archive** docs, **scratch/temp** (`build_log.txt`, `build_output.txt`, `errors.txt`, `fix4/7/8/9.cjs`, `verify_tools_check.ts`) with contamination-risk character.

**Contamination-risk indicators (untracked):** root scratch/fix artifacts `build_log.txt`, `build_output.txt`, `errors.txt`, `fix4.cjs`, `fix7.cjs`, `fix8.cjs`, `fix9.cjs`, `verify_tools_check.ts` — preserve but treat as non-source scratch; exclude from commit candidates pending review.

## 7. Protected P-03 control files (verification)

| Path | Exists | Tracked by git | Size (bytes) | LastWriteTime | SHA-256 | Purpose (evidence-based) | Modified vs baseline note |
|---|---|---|---:|---|---|---|---|
| `lib/tools/r6/__p03-control.test.ts` | Yes | No (`git ls-files` empty) — **untracked** | 1377 | 2026-11-18T19:26:57.1955539+02:00 | `D63E6E136E66585475D5F39F6AF2109347EA2FE4C8CD199F09A2F878649790A0` | P-03 control test artifact (protected; disposition/approval required) per prior reconciliation docs | Present in 524 snapshot as untracked (`??`); not a tracked modification; no git-tracked history change observed |
| `lib/tools/r6/p03-runtime-negative-coverage.test.ts` | Yes | No (`git ls-files` empty) — **untracked** | 9158 | 2026-11-18T19:27:55.6381102+02:00 | `3582B729DCB756C8CC37D97E724DF35B0DEE89F6DB355B854FC04BDB6454E473` | P-03 runtime negative coverage test (protected/untracked; 30-test evidence described in handover/baseline docs) | Present in 524 snapshot as untracked (`??`); not a tracked modification |

Both files **present and untouched** by this audit.

## 8. SHA-256 of 12 previously delivered reconciliation artifacts (recomputed)

**Identification (evidence-based):** 12 reconciliation artifacts corresponding to manifest `B−A` items 3–14 in `R6.1-WORKING-TREE-MANIFEST-RECONCILIATION.md` v1.1 (10 audit deliverables + 2 pre-matrix reconciliation reports = 12 `R6.1-*` reconciliation artifacts in `docs/MRX Genius Cloud Unified R6.1/`). Prior recorded hash list for comparison: **NOT_AVAILABLE** in provided evidence; mismatch status vs prior: **NOT_AVAILABLE** (recomputed hashes below are current-state).

| # | Artifact | Exists | Size (bytes) | SHA-256 (recomputed) | vs prior hash |
|---:|---|---|---:|---|---|
| 1 | `docs/MRX Genius Cloud Unified R6.1/R6.1-ATOMIC-LEDGER-RECONCILIATION.md` | Yes | 6950 | `2D5F76B6435F89DD080EED97592379D489CD8507AA062FAF8D7D2C53255C7EE5` | NOT_AVAILABLE |
| 2 | `docs/MRX Genius Cloud Unified R6.1/R6.1-BASELINE-INTEGRITY-REPORT.md` | Yes | 9227 | `2366CBC47829E712E3C55F6FE6535AF1A1F3CD5FD5EB40F5755EA2C57E820BCB` | NOT_AVAILABLE |
| 3 | `docs/MRX Genius Cloud Unified R6.1/R6.1-BROWSER-EVIDENCE-INDEX.md` | Yes | 5688 | `ADC8E186B8ABD44A801E2BB6C767FB0119D4F19D400BF86DA6723265266841D1` | NOT_AVAILABLE |
| 4 | `docs/MRX Genius Cloud Unified R6.1/R6.1-FIRST-100-PERCENT-CLOSURE-REPORT.md` | Yes | 5307 | `56558C1952E9443E65117A30A72170E041FF784F539A3D123C738AD530CA9B2C` | NOT_AVAILABLE |
| 5 | `docs/MRX Genius Cloud Unified R6.1/R6.1-GLOBAL-CLOSURE-DASHBOARD.md` | Yes | 8963 | `8D82069CEFAA24E3A9BC88D5D5AE4AE0CCCD5830BE573DD09824A614472C2080` | NOT_AVAILABLE |
| 6 | `docs/MRX Genius Cloud Unified R6.1/R6.1-P03-RESULTSCHEMA-CLOSURE-REPORT.md` | Yes | 11138 | `0B94E2890D73ABF128D9A63C76A99CC8647BB1214F8599B4DA50871A8C9AB916` | NOT_AVAILABLE |
| 7 | `docs/MRX Genius Cloud Unified R6.1/R6.1-ROLLBACK-RECONCILIATION.md` | Yes | 8492 | `DB049FAE2A91C5D95FA50C922CD467D01E585A1E1E07B8E546AE8DD197F8DD40` | NOT_AVAILABLE |
| 8 | `docs/MRX Genius Cloud Unified R6.1/R6.1-SCOPE-268-286-RECONCILIATION.md` | Yes | 4438 | `C32EC4A594AB09E28A7F7AB994E71A1248D4348130424E15EE1B4D04B8AFA7C4` | NOT_AVAILABLE |
| 9 | `docs/MRX Genius Cloud Unified R6.1/R6.1-SOURCE-AND-CLINICAL-REVIEW-INDEX.md` | Yes | 5815 | `D38356D3D1C39F54DF8A7322717D3C169E3E1E71648FBA348EBBBC490B6AE762` | NOT_AVAILABLE |
| 10 | `docs/MRX Genius Cloud Unified R6.1/R6.1-TOOL-039-BASELINE-AND-DELTA-RECONCILIATION.md` | Yes | 6180 | `2C7E1D246ADCA058B7433E5A0A0D1B9008108AB4F3FC6E9F34D45DA3ACD2DE70` | NOT_AVAILABLE |
| 11 | `docs/MRX Genius Cloud Unified R6.1/R6.1-WORKING-TREE-DISPOSITION-MATRIX.csv` | Yes | 177162 | `07F4512F8667D33E5EC596520CC483F22A3A88E91F6E44DA4823303A34967385` | NOT_AVAILABLE |
| 12 | `docs/MRX Genius Cloud Unified R6.1/R6.1-WORKING-TREE-MANIFEST-RECONCILIATION.md` | Yes | 11596 | `64189A03D05DCAE6E767423E03B5CA666E99882621FA17CE851602D833A2D043` | NOT_AVAILABLE |

**Missing:** none. **Mismatched (vs provided prior hashes):** NOT_AVAILABLE (no prior hash baseline provided).

## 9. Stashes and worktrees (untouched confirmation)

- **Stashes:** `git stash list` shows 2 entries unchanged from baseline (`stash@{0}`, `stash@{1}` as recorded in section 1). No stash/git write operations performed. **Untouched: confirmed (read-only observation).**
- **Worktrees:** `git worktree list --porcelain` shows same inventory as baseline context (active main, p03-true-clean, p03-clean-build, and other unrelated/prunable worktrees). No worktree add/remove/lock/prune operations performed. **Untouched: confirmed (read-only observation).**

## 10. Unresolved items (owner + next action)

| # | Unresolved item | Owner | Next action |
|---:|---|---|---|
| 1 | 276 snapshot paths have no tool-id token and 270 marked SHARED by heuristics; some may require per-file adjudication (commit candidate vs preserve-only vs exclude) | Repo/Release owner + Workstream leads (B1–B4/shared) | Review `A-WORKING-TREE-DISPOSITION-FINAL.csv`, confirm SHARED/OTHER/NONE assignments, and record explicit disposition decisions per group/file where needed |
| 2 | 60 snapshot paths in batch OTHER/NONE (incl. tools outside B1–4/REF and 8 scratch/temp items) lack batch assignment in B1–4 terms | Workstream leads / scope owner | Decide whether out-of-scope tool changes/docs are intentional preserved WIP or require separate handling; quarantine/remove consideration **not executed** (requires explicit approval) |
| 3 | Prior recorded hashes for the 12 reconciliation artifacts not provided for mismatch comparison | Audit owner | If a prior hash manifest exists, compare against recomputed hashes in section 8; otherwise treat recomputed hashes as new evidence baseline |
| 4 | Matrix v2 includes self-row and heuristic under-tagging (263 empty batch/tool-id in v2); disposition CSV refines but remains heuristic without build/test validation | Workstream A / governance | Accept refined CSV as evidence-bounded disposition view; optionally regenerate authoritative matrix with corrected conventions under approved process |
| 5 | Tracked modified set (46) and large untracked set (478 snapshot + 6 audit-generated) remain uncommitted/unadjudicated; root scratch/fix files present (contamination-risk) | Repo owner | Perform approved, scoped commit/disposition plan; do not delete/move without review. No git actions taken here |
| 6 | Disposition CSV `shared`/`batch` inferred for multi-tool/cross-cutting docs; semantic ownership may differ from filename heuristic | Domain leads | Spot-check cross-cutting R6.1 docs and shared infra rows; adjust ownership labels in governance records if needed |

## 11. Output file SHA-256

| File | SHA-256 |
|---|---|
| `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/A-WORKING-TREE-DISPOSITION-FINAL.csv` | `A3D205E669872915086EDFA1F57D8545D3A550B9D7628D3C114604A5069229DC` |
| `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/A-REPOSITORY-INTEGRITY-REPORT.md` | Computed post-write (see execution summary for authoritative final hash of saved file) |

*Evidence commands used (read-only):* `git rev-parse --abbrev-ref HEAD`, `git rev-parse HEAD`, `git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'`, `git rev-list --left-right --count HEAD...origin/feat/r6.1-tools-041-042`, `git stash list`, `git worktree list --porcelain`, `git status --porcelain=v1 --untracked-files=all`, `git ls-files -- <protected paths>`, `Get-FileHash -Algorithm SHA256`, `Get-Content`/`Import-Csv`/`Measure-Object` on evidence artifacts and snapshots, set-diff comparison of snapshot vs live status captures in temp.
