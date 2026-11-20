# Test Catalog Statistics - 2026-11-20 (verified)

Source: true-clean detached worktree E:/p03-true-clean-20261118 @ 37f047a4105d078b22edea2c857bf35aefdbdc7f. Tool universe: docs/MRX Genius Cloud Unified R6.1/scope-reconciliation-286.csv (286 rows: 268 catalog tools + 18 UNVERIFIED GAP placeholders). Evidence: evidence-index/FULL-VITEST-RUN-20261120.txt.

| Metric | Count |
|---|---:|
| Test files under lib/**, components/**, tests/** (*.test.* / *.spec.*) | **565** |
| Test files executed by full suite (all directories, config-derived; matches reported total) | **594** |
| Test files excluded from full run (credentialed smoke gate) | **1** |
| (tool, test file) pairs in test-evidence matrix | **734** |
| Tools (of 286) with >=1 discoverable test file | **263** |
| Tools with >=1 executed-PASSING test (E3 here) | **263** |
| Tools with NO discoverable test file (NOT_AVAILABLE / E0) | **23** |
| Of those, UNVERIFIED GAP placeholders | **18** |
| Of those, real catalog tools with no test reference | **5** |
| Pair rows with E3 (executed + passing) | **710** |
| Pair rows with E2 (present but failed / not run) | **24** |
| Pair rows FAILED in full run | **24** |
| Pair rows NOT_RUN (excluded smoke) | **0** |
| Matrix rows total (734 pairs + 23 no-test rows) | **757** |

## Tools with no discoverable test file (23)
- Real catalog tools (5): mrx.tool.injection, mrx.tool.halflife, mrx.tool.lab, mrx.tool.cycle, mrx.tool.master-calculator.
- UNVERIFIED GAP placeholders (18): UNVERIFIED-001 .. UNVERIFIED-018.

## Evidence-level definitions used in the matrix
- **E3** - test file executed in this full run and not among the 30 failed files (passing here).
- **E2** - test file exists and references the tool, but it either failed in this run or was excluded from the run (no passing evidence here).
- **E1** - recorded only in prior reports; 45 tools carry a prior TESTS PASS / FOCUSED claim in SMARTTOOLS_252_MASTER_INVENTORY.md and are flagged in Notes where relevant. No tool was downgraded to E1 on this basis alone.
- **E0** - no discoverable test file (NOT_AVAILABLE).

## Caveats
- Mapping is mechanical: tool IDs come from tool-NNN tokens (file name + content), mrx.tool.<slug> strings in content, and path-slug tokens for named tools. Legacy-naming inconsistencies are recorded in the Notes column via the match= source; e.g. tests/unit/tool-010-aromatization-engine*.test.ts carry a tool-010 name but import the aromatization-risk engine and therefore map to both.
- E3 is per test file, not per assertion; a passing file may cover multiple tools via batch/parametrized tests.
- Full-suite exit code 1 means E3 rows are file-level passes within a suite that overall failed.
