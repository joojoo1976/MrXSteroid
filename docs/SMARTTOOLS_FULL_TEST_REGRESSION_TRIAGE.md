# Full Test Regression Triage

**Run:** `npx vitest run`  
**Observed result:** 11 files failed, 23 tests failed, 486 files passed, 4,708 tests passed, 5 skipped.  
**Scope rule:** this record is diagnostic only; no database, migration, commit, push, or deployment action was performed.

## Resolved in the current review

- Tools 034 and 093 DOM language contracts: fixed heading/date-label strings; focused result **4/4 PASS**.
- Tool 034 legacy calculation/DOM heading and date-label compatibility: focused result **4/4 PASS** after retaining a visually-hidden legacy English heading alias and a legacy accessible date label.
- Adapters 101, 103, and 104 provenance contract: numeric bounded confidence and `medium` quality; batch 101–105 result **6/6 PASS**.
- Adapter batch 106–110: **10/10 PASS**.

Combined regression guard rerun (`tool-034` two files plus adapter batches 101–105 and 106–110): **4 files, 20 tests PASS**. `git diff --cached --stat` remained empty; no work was staged.

## Remaining failure groups from the full run

After the fixes above, a fresh full run reported **17 failed tests, 489 passed files, 4,714 passed tests, and 5 skipped**. The remaining groups below are still separate from the v7 batch.

| Group | Evidence | Next action |
|---|---|---|
| Checkout country routing and Kashier delegation | Tests returned HTTP 500 because the mocked checkout session reported no Fourthwall mapping for `digital` | Separate payment-fixture/configuration triage; keep outside SmartTools UI batch |
| Payment receipt/admin settlement and Instapay preservation | Receipt settlement assertions failed | Review service mocks and order/payment status contract before changing production code |
| Merchant resolver | Canonical product-count assertion failed | Reconcile current product fixture with the intended catalog; owner review required |
| Security hardening posture | Service-role import posture assertion failed | Review test scanner assumptions and import boundaries; no security bypass |
| Legacy adapter/DOM expectations | Some older UI and adapter contracts failed in the original run | Re-run each focused file after the resolved fixes and classify remaining failures by source |

## Guardrails

## Current checkout rerun — 2026-10-27

`npx vitest run --reporter=dot` completed with exit 1: **502 test files**, **4760 passed**, **16 failed**, and **5 skipped**. The current failures are limited to checkout country routing, Kashier delegation/session mapping, InstaPay preservation, payment-receipts admin contracts, and merchant/product mapping. This dated result supersedes the older headline counts above; those historical counts remain for audit traceability. No SmartTools catalog/index/engine test failed in this run.

These failures do not invalidate the focused v7 engine and adapter checks, but they prevent claiming a green repository-wide suite. No failure is marked resolved without a reproducible focused rerun.

Focused evidence for merchant resolver: `npx vitest run tests/unit/merchantResolver.test.ts` produced **19/20 PASS**. The single failure is a stale exact-three-product assertion; runtime `CANONICAL_PRODUCTS` currently exposes five keys (`MRX-COACHING-ADDON`, `MRX-CONSULTATION`, `MRX-PROTOCOL`, `MRX-SMART-PRO`, `MRX-TACTICAL`). No product was removed because that would be an unapproved commerce-scope change.

The isolated security posture rerun (`npx vitest run tests/security/securityHardeningPosture.test.ts`) now passes **13/13**; the earlier failure is treated as transient or environment-sensitive pending a clean full-suite rerun.
