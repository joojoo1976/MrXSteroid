# Working Tree Protection Evidence (2026-11-18)

**Purpose:** Prove preservation of unrelated modified/untracked paths during P-03/closure work. No `git reset`, `git clean`, `stash`, or `git add -A`.

## Snapshots & manifests

| Artifact | Path | Notes |
|---|---|---|
| Baseline snapshot (pre-P03 code session state) | `C:\Users\foryo\AppData\Local\Temp\opencode\wt-backup-20261118-020017\` | `porcelain.txt` (495), `status-short/full.txt`, `tracked.diff`, `cached.diff`, `untracked-all.txt`, partial `untracked-files/` (289/426 copied; some special-char paths had copy errors) |
| Baseline tracked diff hash (SHA-256) | `83CC7261C3156C17150B80E1F37EB733B3CBA8D3D1BBFAC60717CD0CC0071EA0` | `wt-backup-20261118-020017\tracked.diff` |
| Baseline cached diff hash (SHA-256) | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | empty cached diff |
| Fresh snapshot (current) | `C:\Users\foryo\AppData\Local\Temp\opencode\wt-snap-20261118-021718\porcelain.txt` | 496 entries |
| Current WT manifest + SHA-256 | `docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/WT-MANIFEST-SHA256-2026-11-18.json` | 496 entries with status/path/p03_intended/sha256 (some paths with special characters in filenames recorded hash errors due to PowerShell path handling; porcelain evidence remains authoritative for those entries) |

## Before/after comparison (baseline → current)

- **Baseline total:** 495 porcelain entries
- **Current total:** 496 porcelain entries
- **Delta:** `ADDED = 1`, `REMOVED = 0`
  - Added only: `?? lib/tools/r6/p03-result-schema-validation.test.ts` (**P-03 intended**)
- **Non-P03 diffs (added/removed/status-changed outside P-03 intended set):** **0**
- **Preserved unrelated:** **465** entries outside the 31 P-03-intended paths unchanged in porcelain presence/status vs baseline (includes **448** non-pipeline/non-closure-sprint entries and **17** other untracked pipeline files not in P-03 scope). This **preserves and exceeds** the previously referenced ~341 preserved paths.

## P-03 intended set (31 paths) — only set eligible for future P-03 staging

23 tracked modified pipelines: `tool-008,014,016,017,022,025,026,027,029,031,034,037,038,039,041,042,045,046,047,048,049,050,051` under `lib/tools/r6/*-pipeline.ts`  
7 untracked-in-HEAD pipelines (P-03 scope, full-file presence): `tool-006,015,023,035,040,043,044` under `lib/tools/r6/*-pipeline.ts`  
1 test: `lib/tools/r6/p03-result-schema-validation.test.ts`

**17 other untracked pipelines explicitly NOT in P-03 intent and preserved:** `one-rep-max`, `tool-007,009,010,011,012,013,018,019,020,021,024,028,030,032,033,036` (`*-pipeline.ts`).

## Commit/stage discipline (to be evidenced per operation)
- Before/after each stage/commit: capture `git status --porcelain=v1 --untracked-files=all`, compare against current snapshot/manifest.
- Show exact staged file list before commit; stage **only** reviewed/approved intended files.
- No unrelated file may be added to any commit. Manifest JSON to be updated/regenerated if legitimate intended state changes.
