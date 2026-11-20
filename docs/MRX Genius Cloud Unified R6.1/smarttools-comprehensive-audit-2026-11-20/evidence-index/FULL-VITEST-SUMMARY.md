# Full Vitest Run Summary - 2026-11-20

| Field | Value |
|---|---|
| Command | node "E:/p03-true-clean-20261118/node_modules/vitest/vitest.mjs" run --root E:/p03-true-clean-20261118 |
| Working tree | true-clean detached worktree E:/p03-true-clean-20261118 @ 37f047a4105d078b22edea2c857bf35aefdbdc7f (status clean before run) |
| Runner | vitest 4.1.10 (node_modules/vitest/vitest.mjs symlinked from E:\MrXSteroid-main\node_modules) |
| Exit code | **1** (suite contains failing tests; not a runner failure) |
| Complete output | evidence-index/FULL-VITEST-RUN-20261120.txt (15,531 lines, stdout+stderr merged) |
| Test files | **594 total - 30 failed, 563 passed, 1 skipped** (verbatim: 30 failed | 563 passed | 1 skipped (594)) |
| Tests | **5602 total - 67 failed, 5530 passed, 5 skipped** (verbatim: 67 failed | 5530 passed | 5 skipped (5602)) |
| Duration | 372.21s (transform 352.48s, setup 49.63s, import 577.76s, tests 667.87s, environment 472.25s) |

## Safety / scope
- --root E:/p03-true-clean-20261118 was passed explicitly to avoid the dirty worktree.
- No browser/E4, Playwright, SSO, credentialed, or network-write tests were executed. vitest.config.ts excludes tests/smoke/** (the authenticated, billable Google gate, run only via vitest.smoke.config.ts) from the full suite.
- The single excluded test file is tests/smoke/translation.google.smoke.test.ts. The config-derived executable set is exactly 594 files, matching the reported 594 file total.

## Per-file result attribution (method)
- Failed files: parsed from the 30 "FAIL  |project| path" lines in captured stdout.
- Passing files: the vitest default reporter in non-TTY mode does not enumerate individual passing files. A file is attributed PASS when it is in the config-derived executable set (594 files) and absent from the 30 failed paths, consistent with aggregate "563 passed".
- The 1 skipped test file is tests/integration/seoDestinationLivePersist.test.ts (its sole it() is inside describe.skipIf(!LIVE)); it is not tool-mapped. The 5 skipped tests are the conditional it.skip / describe.skipIf gates in tests/integration/seoPhase2LiveSources.test.ts (2), tests/integration/seoCompetitorLiveCrawl.test.ts (2) and tests/integration/seoDestinationLivePersist.test.ts (1).

## Failed test files (30)
- app/smarttools/page.test.ts
- components/tools/tool-016-half-life-calculator.dom.test.ts
- components/tools/tool-017-drug-interaction.dom.test.ts
- components/tools/tool-022-half-life-stacker.test.ts
- components/tools/tool-034-compound-clearance.dom.test.ts
- components/tools/tool-034-compound-clearance.test.ts
- components/tools/tool-041-060-header-preferences.test.ts
- components/tools/tool-111-smart-food-macro-substitution.dom.test.ts
- components/tools/tool-111-smart-food-macro-substitution.substitute.test.ts
- components/tools/tools-012-014-header-preferences.dom.test.ts
- lib/tools/loaders.r6.test.ts
- tests/integration/checkoutCountryRouting.test.ts
- tests/integration/createInvoiceKashierDelegation.test.ts
- tests/security/securityHardeningPosture.test.ts
- tests/unit/checkoutSessionService.test.ts
- tests/unit/components/tool-025-medication-session-log.test.ts
- tests/unit/components/tool-026-injection-experience-log.test.ts
- tests/unit/components/tool-027-molar-mass-calculator.test.ts
- tests/unit/components/tool-029-measurement-summary.test.ts
- tests/unit/instapayPreservationLock.test.ts
- tests/unit/merchantResolver.test.ts
- tests/unit/orderProducersStatusContract.test.ts
- tests/unit/paymentReceiptsAdmin.test.ts
- tests/unit/smartToolsCatalog.test.ts
- tests/unit/tool-016-i18n-evidence.test.ts
- tests/unit/tool-022-i18n-evidence.test.ts
- tests/unit/tool-027-i18n-evidence.test.ts
- tests/unit/tool-031-i18n-evidence.test.ts
- tests/unit/tool-034-i18n-evidence.test.ts
- tests/unit/tool-039-acceptance-evidence.test.ts
