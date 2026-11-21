# P-03 Clean Export Results (final worktree, 2026-11-18)

**Base:** HEAD 2a647fda (detached worktree: C:\Users\foryo\AppData\Local\Temp\opencode\p03-wt-20261118-final, removed after run except captured here)
**Commit candidates overlaid (32):** 30 pipelines + p03-result-schema-validation.test.ts + lib/tools/schemas/tool-023-trt-optimization.ts (necessary: HEAD schema empty e69de29)
**Auxiliary (test-run only, NOT commit):** 11 pipeline tests + 4 tool-040 contract/visual deps copied to satisfy regression imports

## Commands & results
- 
ode node_modules/typescript/bin/tsc --noEmit --pretty false → **exit 0**
- 
ode node_modules/eslint/bin/eslint.js <30 pipeline files> → **exit 0**
- 
ode node_modules/vitest/vitest.mjs run lib/tools/r6/p03-result-schema-validation.test.ts → **1 file, 5 tests PASS, exit 0**
- Regression (34 test files, includes auxiliary tests for coverage): initial run **1 failed suite / 33 passed (166 tests)** due to missing auxiliary dep ./tool-040-lipid-profile-optimizer-contract; after copying auxiliary deps, rerun of 040 pipeline test **1 file/11 tests PASS**. **Effective coverage: 34 files / 177 tests PASS** (matches WT coverage) with auxiliary non-commit deps/tests present.
- 
ode node_modules/next/dist/bin/next build → **exit 1** (environment artifact): symlinked worktree/node_modules path resolution failed (Can't resolve './E:/MrXSteroid-main/node_modules/next/dist/client/next.js' etc., workspace root inferred incorrectly). Not a P-03 source/tsc/test failure; clean in-repo-equivalent build not yet recorded.

## Not-in-HEAD among commit candidates (8)
- lib/tools/r6/tool-006-estrogen-prolactin-pipeline.ts
- lib/tools/r6/tool-015-shbg-modulator-pipeline.ts
- lib/tools/r6/tool-023-trt-optimization-pipeline.ts
- lib/tools/r6/tool-035-hormone-conversion-pipeline.ts
- lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.ts
- lib/tools/r6/tool-043-prolactin-management-pipeline.ts
- lib/tools/r6/tool-044-dht-side-effects-pipeline.ts
- lib/tools/r6/p03-result-schema-validation.test.ts
(plus tool-023 schema is tracked M, necessary)

## Rollback
- Not executed/proven (no P-03 commit SHA). Prepared procedure: independent commit of approved file list → git revert <P03_COMMIT_SHA> --no-edit in isolated env/worktree → rerun tsc/eslint/P-03 tests/regression/build and compare porcelain/manifest to prove unrelated preserved.
