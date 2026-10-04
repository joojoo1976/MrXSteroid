# Testing Guide

## TEST CONTRACT (authoritative — read this before interpreting a red suite)

**Last measured: 2026-10-03** · Command: `npx vitest run`

```
Tests  20 failed | 2872 passed | 5 skipped (2897)
```

### The gate

`npx vitest run` (equivalently `npm run test:unit`) is the gate. It runs every
`tests/**` suite, so a red suite is a red gate.

### SEO / dynamic-keyword-intelligence: 0 failures

Every suite that touches the SEO layer passes:

| Suite | Result |
|---|---|
| `tests/integration/seoRuntimeChain.test.ts` | 11 passed |
| `tests/unit/seoRefreshPersistence.test.ts` | 8 passed |
| `tests/integration/seoLiveProviderCollection.test.ts` | 29 passed |
| `tests/unit/seoReports.test.ts`, `seoGscLiveProbe`, `seoGoogleAdsContract`, `seoProviderDISeam`, `searchIntelligenceAdapters` | passed |

### The 20 remaining failures — PRE-EXISTING, NOT IN SEO SCOPE

All are in checkout / payments / security-posture. Reproduced with zero SEO files
touched (`npx vitest run tests/integration/checkoutCountryRouting.test.ts
tests/unit/paymentReceiptsAdmin.test.ts tests/unit/merchantResolver.test.ts
tests/security/securityHardeningPosture.test.ts` → 12 failures on an unmodified
tree).

| File | Failures | Domain |
|---|---:|---|
| `tests/integration/checkoutCountryRouting.test.ts` | 8–9 | checkout / country routing |
| `tests/unit/paymentReceiptsAdmin.test.ts` | 3 | payment receipts |
| `tests/security/securityHardeningPosture.test.ts` | 1–2 | security posture (filesystem scans) |
| `tests/unit/reconciliationRouteAuthorization.test.ts` | 0–1 | reconciliation route auth |
| `tests/unit/orderProducersStatusContract.test.ts` | 1 | order producers |
| `tests/unit/checkoutSessionService.test.ts` | 1 | checkout session |
| `tests/unit/merchantResolver.test.ts` | 1 | merchant resolution |
| `tests/integration/createInvoiceKashierDelegation.test.ts` | 1 | invoice/kashier |
| `tests/unit/instapayPreservationLock.test.ts` | 1 | instapay lock |

**The exact count is not stable between 17 and 20.** The varying entries are
5 s timeouts on filesystem / Supabase reads under full-suite parallel load, not
logic failures: the same files pass more of their cases when run in isolation.
Treat the table as a set of known-red files, not a fixed number.

**None is caused by the SEO work.** They were never inside the SEO change
surface and are tracked against the checkout/payments programme.

### Why they are not simply excluded

They stay IN the gate rather than moving to an exclude list. A silent exclude
would make `npm test` green while hiding a real checkout regression. They are
documented here instead, so the count is a visible contract: if a NEW file
appears in this table, something outside SEO changed and must be investigated.

### Suites that MUST stay inside the gate

| Suite | Why it is a unit test despite the name |
|---|---|
| `tests/integration/seoRuntimeChain.test.ts` | Drives the real `POST /api/seo/refresh` handler with an in-memory Supabase fake. No network, no clock, no database. |
| `tests/unit/seoRefreshPersistence.test.ts` | Same shape: real route, faked Supabase, offline transport. |

Both previously issued real HTTP (competitor crawl + destination verification)
and paid the crawler's 1000 ms politeness floor per request, so every case took
~5 s and timed out — the assertions under test were never reached. They now
inject the route's transport / collector / crawl-sleep seams and run offline in
~1.5 s. See `server/seo/refreshRuntime.ts` and `server/seo/liveProviderCollection.ts`.

### Suites that are genuinely out of the gate

| Path | Reason | How to run |
|---|---|---|
| `tests/smoke/**` | Makes real, billable calls to a vendor API and needs a credential. | `npx vitest run --config vitest.smoke.config.ts` |
| `tests/integration/webhook*.test.ts`, `captureToLedgerIntegrity`, `reconciliationRunner`, `tests/adversarial/**` | Heavy fulfilment/ledger suites; they carry a 30 s per-suite timeout in the `financial-integration` project. | `npx vitest run` (own project, separate budget) |

---

## Running Tests
```bash
npm run test:unit        # Run all unit tests (watch mode)
npx vitest run           # Run all tests once
npx vitest run tests/    # Run specific directory
```

## Test Coverage

### Unit Tests
| File | Tests | Coverage |
|------|-------|---------|
| `tests/unit/commissionEngine.test.ts` | 17 | Tier selection, rates, math, edge cases |
| `tests/unit/attribution.test.ts` | 8 | Cookie build/parse, expiry, self-referral |
| `tests/unit/paymentRouting.test.ts` | 8 | Gateway detection, Kashier routing |

### Integration Tests
| File | Tests | Coverage |
|------|-------|---------|
| `tests/integration/webhook.test.ts` | 21 | All Kashier webhook scenarios |

**Total: 55 tests, all passing**

## Webhook Test Scenarios (21)
1. Valid webhook SUCCESS
2. Invalid signature
3. Missing signature
4. Malformed payload
5. Empty body
6. Missing orderId
7. Wrong merchant ID (cross-account rejection)
8. DECLINED status
9. TIMED_OUT (unresolved, no fulfillment)
10. UNKNOWN (unresolved, no fulfillment)
11. EXPIRED_CARD
12. ACQUIRER_SYSTEM_ERROR
13. UNSPECIFIED_FAILURE
14. AUTHORIZED (unresolved, not yet captured)
15. CAPTURED (success)
16. REFUNDED
17. paidAmount parsing
18. merchantId extraction
19. signatureKeys order normalization
20. Unknown orderStatus → UNKNOWN
21. Short/mismatched hex signature
