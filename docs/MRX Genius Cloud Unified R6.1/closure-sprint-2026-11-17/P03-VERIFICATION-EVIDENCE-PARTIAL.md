# P-03 Verification Evidence (Partial) — 2026-11-18

## TypeScript
- **Command:** `npx tsc --noEmit --pretty false`
- **Result:** exit 0 (no errors)

## Regression sample (pipeline tests) — after result-schema validation before envelope
- **Command:** `npx vitest run lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline.test.ts lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts lib/tools/r6/tool-042-estrogen-management-pipeline.test.ts lib/tools/r6/tool-045-cycle-break-planner-pipeline.test.ts lib/tools/r6/tool-008-side-effect-tracker-pipeline.test.ts lib/tools/r6/tool-014-water-retention-pipeline.test.ts lib/tools/r6/tool-017-drug-interaction-pipeline.test.ts lib/tools/r6/tool-025-drug-interaction-pro-pipeline.test.ts`
- **Result:** **Test Files 8 passed (8), Tests 44 passed (44)** (vitest v4.1.10)

## Code changes applied (working tree, P-03 scope)
Result schema validated (Zod `safeParse`) **before** envelope creation in run/compute paths for in-scope pipelines:
- 006,008,014,015,016,017,022,023,025,026,027,029,031,034,035,037,038,039,040,041,042,043,044,045,046,047,048,049,050,051
- **016:** handled in actual `r6RunHalfLife` path (no invented `run*`).
- **047–051:** result schemas confirmed in schema files and validated.
- **008:** result validated against `SideEffectLogSchema` (result == input log entry in current flow).
- On invalid/missing result: returns `{ ok: false, error }` and does **not** create envelope (safe failure path added).

## Pending for P-03 completion (required)
- Add P-03-specific tests: valid (covered by existing), **missing/invalid engine result → `{ ok:false }`, no envelope**.
- Full regression for all 29 in-scope tools (pipeline/contract/component as applicable) with recorded results.
- Clean export from independent commit: resolve git state (several in-scope pipeline files are untracked in HEAD but modified in working tree) so P-03 commit is scoped and reproducible.
- `tsc`, targeted ESLint (0 errors), `next build` evidence for clean export.
- Rollback plan (e.g. `git revert <p03-sha>` + rerun affected tests).
- Per-tool P-03 applicability/closure status (applied / N/A with justification) in atomic ledgers. Not closed for any tool yet.

## Rollback (planned)
- Single revert of the P-03 commit, rerun affected pipeline tests and clean build, redeploy preview if needed. No engine/schema data migration.
