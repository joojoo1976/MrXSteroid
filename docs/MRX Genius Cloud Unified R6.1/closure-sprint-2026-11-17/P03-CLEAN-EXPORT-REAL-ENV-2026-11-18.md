# P03-RESULT-SCHEMA-GATE — Clean Export results (real environment, no symlink) — 2026-11-18

**Supersedes:** `P03-CLEAN-EXPORT-RESULTS-2026-11-18.md` (that run used a junction `node_modules` and its `next build` failed on module-path resolution — an environment artifact, now removed).

## Environment

| Item | Value |
|---|---|
| Base | `git worktree add --detach E:\p03-clean-build-20261118 HEAD` |
| HEAD | `2a647fdae7060b3d215d4663eb3220555cce978b` |
| Dependencies | **real copy** of `node_modules` (`robocopy /MIR`, 30,377 files, 731.7 MB) — **no junction, no symlink** |
| P-03 files overlaid | 33 (30 pipelines + 2 P-03 tests + `lib/tools/schemas/tool-023-trt-optimization.ts`) |
| Auxiliary test-only inputs | 11 pipeline tests + 2 contract/visual deps (sha256 in `evidence-clean-build-2026-11-18/p03-clean-export-manifest.json`) — **not part of the P-03 candidate list** |
| Secrets | none used; no `.env` copied; the build ran without `SUPABASE_URL`/`SUPABASE_ANON_KEY` |

## Results

| # | Command | Exit | Result |
|---:|---|---:|---|
| 1 | `node node_modules/typescript/bin/tsc --noEmit --pretty false` | **0** | PASS (no diagnostics) |
| 2 | `node node_modules/eslint/bin/eslint.js <30 pipeline files>` | **0** | PASS (no output) |
| 3 | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-result-schema-validation.test.ts` | **0** | 1 file / 5 tests PASS |
| 4 | `node node_modules/vitest/vitest.mjs run lib/tools/r6/p03-gate-structural.test.ts` | **0** | 1 file / **31 tests PASS** (30 pipelines + coverage check) |
| 5 | `node node_modules/vitest/vitest.mjs run <34 regression files>` | **0** | **34 files / 177 tests PASS** |
| 6 | `node node_modules/vitest/vitest.mjs run lib/tools/r6/tool-023-schema-engine-proof.test.ts` | **0** | 1 file / 5 tests PASS — 12,800 engine-output combinations validated, 0 rejections |
| 7 | `node node_modules/next/dist/bin/next build` | **0** | **`Compiled successfully`; `Generating static pages (506/506)`** |

Build log: `evidence-clean-build-2026-11-18/next-build.out`, exit file: `next-build-2.exit` (`EXITCODE=0`), stderr: `next-build.err`.

### Build warnings (recorded, not hidden)

- `metadataBase` not set → Next falls back to `http://localhost:3000` for OpenGraph/Twitter image resolution. Pre-existing, not P-03 related.
- `Invalid environment configuration: SUPABASE_URL / SUPABASE_ANON_KEY undefined` → logged by the app's env guard during static generation; the build still completed (exit 0) because no page requires Supabase at build time. This is consistent with D-W18 (no DB/Supabase in scope) and must **not** be read as "Supabase is configured".

## Regression coverage (29 tools) — actual

`34 files / 177 tests` in the clean export, identical to the Working Tree figure. The 11 pipeline tests that do not exist in HEAD were copied **for the test run only**; they are listed with their sha256 in the manifest and are **not** in the P-03 commit candidate list.

Coverage per tool:

| Tool | Test file(s) used in the 34-file run |
|---|---|
| 006, 015, 016, 022, 023, 027, 034, 035, 040, 043, 044 | `lib/tools/r6/tool-0XX-*-pipeline.test.ts` (auxiliary copies from WT) |
| 008, 014, 017, 025, 026, 029, 031, 037, 038, 039, 041, 042, 045, 046, 047, 048, 049 | `lib/tools/r6/tool-0XX-*-pipeline.test.ts` (present in HEAD) |
| 050 | `lib/tools/engines/tool-050-mental-health.test.ts`, `tests/unit/tool-050-i18n-evidence.test.ts` |
| 051 | `lib/tools/adapters/tool-051-055-batch.test.ts`, `lib/tools/engines/tool-051-peptide-dosage-calculator.test.ts`, `tests/unit/tool-051-i18n-evidence.test.ts` |
| P-03 | `lib/tools/r6/p03-result-schema-validation.test.ts` |

**Caveat, stated plainly:** `Regression 29 PASS` here means "the 34 declared files for the 29 tools ran green in the clean export". It does **not** mean every tool's full acceptance ledger is green — no tool's atomic ledger is complete yet except Tool 041 (57.58%) and Tool 040 (see its own ledger).

## P-03 status after this run

- Gate applied and structurally verified in **30/30** pipelines.
- Result-schema rejection proven at runtime for 5 representative paths; structural proof covers all 30.
- Tool 023 schema justified by contract comparison + 12,800-case runtime proof.
- **Not committed, not staged, not pushed.** Candidate list is 33 files (adds `p03-gate-structural.test.ts` to the previously proposed 32) and needs explicit owner approval.
- Rollback remains unexecuted because no P-03 commit SHA exists yet.

## Known limitation found during this pass (Tool 008)

`tool-008-side-effect-tracker-pipeline.ts` has no computation engine: `engineResult = parsed.data`, and `SideEffectLogSchema` is the same schema used to validate the input. The gate is therefore **structurally present but cannot fail at runtime** — it is a type-level assertion, not an active guard. Fixing this properly requires a distinct result schema for the log-capture tool (a contract change), which is **not** included here and needs an owner decision.
