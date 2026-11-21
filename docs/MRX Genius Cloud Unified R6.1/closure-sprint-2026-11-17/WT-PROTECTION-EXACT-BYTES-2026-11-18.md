# WT Protection — exact-byte backup v3 (2026-11-18)

This supersedes the earlier `WT-FULL-PROTECTION-REPORT-2026-11-18.md` for the 2 files that had appeared as `ENOENT`.

## Method (changed)

Previous attempts parsed `git status --porcelain` text produced by PowerShell, which is UTF-16 and/or C-quotes non-ASCII paths. The two "missing" files contain an em dash (`—`) in their names; octal escapes (`\342\200\224`) were decoded as three Latin-1 characters, producing a mojibake path that does not exist.

The new backup runs `git status --porcelain=v1 -z --untracked-files=all` through `child_process.execFileSync` (raw bytes, no shell, no re-encoding) and copies files using the exact UTF-8 path from that stream.

## Result — backup v2 (after that fix)

| Item | Value |
|---|---|
| Backup dir | `C:\Users\foryo\AppData\Local\Temp\opencode\wt-backup-v2-20261118` |
| Porcelain entries | 497 (69 tracked modified + 428 untracked) |
| Untracked copied | **428 / 428** |
| SHA-256 match (source vs copy) | **428 / 428** |
| Copy failures | **0** |
| Files hashed | 497 |
| Diffs | `tracked.diff`, `cached.diff` (raw `--binary`) |
| Manifest | `manifest-sha256.json`, `entries.json`, `SUMMARY.json`, `untracked-copy-report.json` |

### The two previously "missing" files — found and verified

| File | SHA-256 |
|---|---|
| `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_FIRST_BATCH — IMPLEMENTATION AND OWNER PREVIEW REPORT.md` | `a858cb88a5ca90d7438a94b527638f38cd2fa8bb69d0c81bb966def07e516c37` |
| `docs/MrXSteroid_Genius_Intelligence_V4.0/R5_FIRST_BATCH — TOOL SELECTION AND IMPLEMENTATION SCOPE.md` | `a931bba9e6b96f470cd980ef2a1d4698a2bbe290b45b3898d292b97e33227f60` |

Both exist on disk, both were copied, both hashes match. Nothing was lost; the earlier `ENOENT` was a path-decoding defect in the backup script.

## Backup v3 (current state, after this sprint's additions)

Taken after adding `lib/tools/r6/p03-gate-structural.test.ts` and the new documentation/ledger files.

| Item | Value |
|---|---|
| Backup dir | `C:\Users\foryo\AppData\Local\Temp\opencode\wt-backup-v3-20261118` |
| Porcelain entries | **509** (69 tracked modified + 440 untracked) |
| Untracked copied | **440 / 440** |
| SHA-256 match | **440 / 440** |
| Copy failures | **0** |
| Files hashed | 509 |

## Not done (and why)

- No `git reset`, `git clean`, `git stash`, or `git add -A` was used at any point.
- No file was deleted or moved from the working tree.
- Earlier snapshots (`wt-full-backup-20261118-062516`, `wt-backup-v2-20261118`) were kept unchanged.
