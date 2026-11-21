# Phase 8 — Closing the 14 baseline failures

Branch: `feat/r6.1-tools-041-042` (not pushed).
Scope: tests only. No production code, migration, gateway/key/env, or port 3111 change.

## Result

| Check | Result |
|---|---|
| Payment suite (53 matched files) | **683 passed / 0 failed / 683 total** |
| `npx tsc --noEmit` | exit 0 |
| `npx next build` | exit 0 |
| New `skip` / `todo` / `only` | none |
| Deleted tests | none |
| Exceptions | **none** |

## Classification and disposition

All 14 were category A (stale expectation/fixture), not product defects. Each was
rewritten to pin the current approved behavior.

| # | File / test | Disposition | What changed |
|---|---|---|---|
| 1–8 | `tests/integration/checkoutCountryRouting.test.ts` | Fixture repair | Added the real Fourthwall product mapping + Storefront token/domain and a cart `id` to the fetch double. GLOBAL now legitimately routes to Fourthwall. The 32-file suite is green. |
| 9 | `tests/integration/createInvoiceKashierDelegation.test.ts` | Rewrite | Replaced the retired “GLOBAL uses legacy KASHIER_GLOBAL_* merchant” expectation with the approved Fourthwall cart redirect + USD 49.99 assertion. |
| 10 | `tests/unit/checkoutSessionService.test.ts` | Rewrite mock | Gave the fake gateway the Fourthwall `resolveProductMapping()` surface and asserted the Fourthwall product payload instead of Kashier card methods. |
| 11 | `tests/unit/instapayPreservationLock.test.ts` | Rewrite static test | Pins the current review state machine (`submitted_for_review → rejected`, `under_review → approved`) and the atomic `approve_instapay_receipt` RPC, while preserving the no-disable invariant. |
| 12 | `tests/unit/paymentReceiptsAdmin.test.ts` approve | Rewrite | Uses `under_review → approved`, supplies the required InstaPay reference, and asserts the RPC arguments/result instead of the retired direct PATCH. |
| 13 | `tests/unit/paymentReceiptsAdmin.test.ts` reject | Rewrite | Uses `submitted_for_review → rejected`; still asserts `orders.status='cancelled'` + `payment_status='failed'`. |
| 14 | `tests/unit/paymentReceiptsAdmin.test.ts` list | Rewrite mock | Models `admin_instapay_review_detail` with the real `select().order().range().eq()` chain and `count`. |

## Intentional expectation changes (documented)

These are behavior changes approved in earlier phases, not test weakening:

1. GLOBAL checkout is Fourthwall, not Kashier.
2. Receipt review uses `awaiting_payment` / `submitted_for_review` / `under_review` /
   `approved` / `rejected` / `expired`.
3. Approval is atomic through `approve_instapay_receipt`, not a direct status update.

## Risks / open item

- The checkout session service still writes `invoices.gateway='kashier'` and
  `payment_provider_merchant='kashier_<region>'` before branching to Fourthwall for
  GLOBAL. The session itself is Fourthwall and the USD amount is correct, but the
  invoice provider label is historically inconsistent. This predates Phase 8 and was
  not changed here because Phase 8 is test-closure only; it should be decided in a
  later billing phase.
- No database or provider behavior was exercised against a live service; all coverage
  is unit/integration with doubles.
