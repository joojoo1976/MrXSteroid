# TOOL_111_PHASE_1_EVIDENCE_SNAPSHOT

- **Created:** 2026-10-16
- **Purpose:** Permanent Phase 1 evidence snapshot created before removal of temporary scaffolding, verification logs, and one-off generation scripts.
- **Scope:** Tool #111 — Smart Food & Macro Substitution Engine.
- **Status:** Phase 1 evidence preserved; cleanup approved.

## Phase 1 Status

| Item | Status |
|---|---|
| Tool #111 engine implemented | Yes |
| Tool #111 unit tests implemented | Yes |
| `ADHERENCE_THRESHOLDS` corrected | Yes |
| `getAdherenceLevel` exported | Yes |
| `calculateTargetAdherence` exported | Yes |
| TypeScript | 0 errors |
| ESLint — Tool #111 | 0 errors |
| Temporary scaffolding cleanup | Approved |
| Phase 1 final approval | Pending final validation report |

## Test Evidence Before Cleanup

### Tool #111

- **Test suite:** `tests/unit/tool-111-smart-food-macro-substitution-engine.test.ts`
- **Result:** 127/127 PASSED
- **Runner:** Vitest
- **Coverage:** safety helpers, macro calculations, equivalence calculations, macro deltas, target adherence, substitute quantity, warnings, limitations, unit conversions, main engine, edge cases, constants, and exports.

### Tool #010

- **Test suite:** `tests/unit/tool-010-aromatization-engine.test.ts`
- **Result:** 51/51 PASSED
- **Purpose:** Regression verification after shared-code and Tool #111 changes.

### Shared Tests

- **Test location:** `tests/shared`
- **Result at snapshot time:** 122/122 PASSED
- **Passing:** 122
- **Failing:** 0
- **Source evidence:** `.sharedfull2.log` before deletion

### Known Shared Test Failures

| Suite | Failures | Root cause | Action |
|---|---:|---|---|
| `localization.test.ts` | 0 | N/A | All passing |
| `persistence.test.ts` | 0 | N/A | All passing |
| `unit-system-part2.test.ts` | 0 | N/A | All passing |
| Other | 0 | N/A | All passing |

### Validate Tools

- **Command:** `npx vitest run tests/unit/validateTools.test.ts`
- **Result at snapshot time:** 5/5 PASSED
- **Passing:** 5
- **Failing:** 0
- **Remaining issue:** None
## Build Evidence

- **Command:** `npm run build`
- **Start:** 2026-10-16 00:15:52
- **End / last log write:** 2026-10-16 00:20:07
- **Duration:** approximately 4 minutes 15 seconds
- **Result:** SUCCESSFUL
- **Compilation:** "Compiled successfully in 37.7s"
- **Static pages:** 309/309 generated
- **Page optimization:** completed
- **Build traces:** completed
- **Route table:** 309 routes printed
- **Fatal errors:** none
- **Non-blocking warnings:** metadataBase warnings only
- **Exit code:** NOT CAPTURED — wrapper shell exited before writing the exit file
- **Evidence basis:** completion of all Next.js build phases and absence of fatal errors
- **Build log:** `.build-111-final.log`

## ADHERENCE_THRESHOLDS Correction

The original implementation used decimal thresholds:

```ts
0.05, 0.15, 0.30
```

`calculateTargetAdherence` converts relative macro differences to percentages by multiplying by 100 before calling `getAdherenceLevel`. Therefore, the correct thresholds are percentage values:

```ts
5, 15, 30
```

This correction aligns the implementation with `TOOL_111_ENGINE_DESIGN.md`:

- `on_target`: within ±5%
- `slightly_off`: ±5–15%
- `moderately_off`: ±15–30%
- `significantly_off`: greater than ±30%

## Files Approved For Deletion

### Root temporary logs and verification artifacts

- `.adb1.log`
- `.aid1.log`
- `.chk010.log`
- `.chk1.log`
- `.es1.log`
- `.loc.log`
- `.loc1.log`
- `.loc2.log`
- `.per1.log`
- `.per2.log`
- `.pers.log`
- `.sch1.log`
- `.sp2.log`
- `.t111.log`
- `.us.log`
- `.shared3.log`
- `.sharedfull1.log`
- `.sharedfull2.log`
- `.usp1.log`
- `.usp1b.log`
- `.tsc-run5.txt` through `.tsc-run14.txt`
- `.tsc-errors*.txt`
- `.tsc-errs*.txt`
- `.tsc-final.txt`
- `.tsc-non-i18n.txt`
- `.tsclast.txt`
- `.tsc106.txt`
- `.tsc2.txt`
- `.build-111.err`
- `.build-111.log`
- `.build-err.txt`
- `.build-out.txt`
- `.buildrun.txt`
- `.build.bat`
- `.full.bat`
- `.start.bat`
- `.tsc.bat`
- `.verify.bat`
- `.verify.ps1`
- Temporary gate, baseline, dump, verification, and server log files listed in the approved cleanup inventory.

### Root one-off batch and verification files

- `commit-tables.bat`
- `commit-tool010.bat`
- `verify-types.bat`
- `test.txt`
- `smarttools_prod.html`

### Temporary scripts and generation fragments

- `scripts/append-content.mjs`
- `scripts/append-core.mjs`
- `scripts/append-final-sections.mjs`
- `scripts/append-part2.mjs`
- `scripts/append-part3.mjs`
- `scripts/append-part4.mjs`
- `scripts/append2a.mjs`
- `scripts/append2b.mjs`
- `scripts/combine-final.mjs`
- `scripts/finalize-combine.mjs`
- `scripts/finalize-part1.mjs`
- `scripts/finalize-part2.mjs`
- `scripts/write-component.mjs`
- `scripts/write-component-part2.mjs`
- `scripts/write-p3a.mjs`
- `scripts/write-p3b.mjs`
- `scripts/write-p3c.mjs`
- `scripts/write-p3d.mjs`
- `scripts/write-part1.mjs`
- `scripts/write-tool010-part1.mjs`
- `scripts/write-tool010-part2a.mjs`
- `scripts/write-tool010-part2b.mjs`
- `scripts/fix-tool-010-tests.js`
- `scripts/fix-types.mjs`
- `scripts/component-part1.txt`
- `scripts/component-part2.txt`
- `scripts/p3a.txt`
- `scripts/p3b.txt`
- `scripts/p3c.txt`
- `scripts/p3d.txt`

## Explicitly Preserved Files

The following files must not be deleted:

- `.env`
- `.env.example`
- `.env.supabase.tmp`
- `.evn.local`
- `.npmrc`
- `.hintrc`
- `.dockerignore`
- `.vercelignore`
- `scripts/run-staging-soak.ts`
- `scripts/translation-google-smoke.ts`
- `scripts/validate-tools.ts`
- `lib/tools/engines/tool-111-smart-food-macro-substitution-engine.ts`
- `tests/unit/tool-111-smart-food-macro-substitution-engine.test.ts`
- `TOOL_111_ENGINE_DESIGN.md`
- `TOOL_111_KNOWN_LIMITATIONS.md`
- `TOOL_111_PHASE_1_FINAL_REPORT.md`
- All Tool #010 source and test files
- All `lib/shared` and `tests/shared` files
- All validate-tools, catalog, and registry files
- `package.json`, lockfile, and core configuration files
- `SMARTTOOLS_AUDIT_SUMMARY.md`
- `MRXY_STEROID_MARKETING_100_METHODS.md`

## Cleanup Commit Plan

1. Commit the evidence snapshot:
   - `docs: add tool-111 phase 1 evidence snapshot`

2. Remove approved temporary files:
   - `chore: remove temporary scaffolding and verification artifacts`

3. Re-run all required checks after cleanup.

4. Produce `TOOL_111_PHASE_1_FINAL_REPORT.md` before Phase 2.

## Guardrails

- No publishing or merging to `main`.
- No force push.
- No changes to Tool #010 or existing tools.
- No start of Tools #112–#115.
- AI remains `NOT_CONFIGURED / DESIGN_ONLY`.
- Supabase/RLS remains `NOT_CONFIGURED`.