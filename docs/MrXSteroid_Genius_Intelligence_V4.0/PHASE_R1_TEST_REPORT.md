# PHASE R1 — TEST REPORT

**Date:** 2026-11-01
**Phase:** R1 — Controlled Architecture Foundation
**Status:** COMPLETE — PENDING OWNER REVIEW

---

## 1. Tests Executed

### R1 Contract Tests
| Test File | Tests | Result | Duration |
|-----------|-------|--------|----------|
| `lib/engines/core/v4/contracts.v4.test.ts` | 12 | ✅ PASS | 436ms |

### Test Breakdown
| Test | Result |
|------|--------|
| Version Constants — correct contract version | PASS |
| Version Constants — correct schema version | PASS |
| Version Constants — correct engine version | PASS |
| Version Constants — correct module version | PASS |
| Primitive Unions — correct locales | PASS |
| Primitive Unions — correct unit systems | PASS |
| Primitive Unions — correct access tiers | PASS |
| Compatibility Rules — at least 4 rules | PASS |
| Compatibility Rules — V4-COMPAT-001 rule | PASS |
| Compatibility Rules — V4-COMPAT-002 (Macro protection) | PASS |
| Compatibility Rules — all rules non-breaking | PASS |
| Type Exports — all required types exported | PASS |

### TypeScript Compilation
- Command: `npx tsc --noEmit`
- Result: PASS (exit 0, no output)
- Duration: ~5s

### Lint
- Not run (to avoid modifying artifacts)

### Build
- Not run (to avoid modifying artifacts)

### validate-tools
- Not run (to avoid modifying artifacts)

---

## 2. Pre-Existing Test Failures (Not R1-Related)

The full test suite has 16 known failures in payment/checkout tests:
- `checkoutCountryRouting` (8 failures)
- `createInvoiceKashierDelegation` (1 failure)
- `checkoutSessionService` (1 failure)
- `instapayPreservationLock` (1 failure)
- `merchantResolver` (1 failure)
- `orderProducersStatusContract` (1 failure)
- `paymentReceiptsAdmin` (3 failures)

These are **NOT** caused by R1 changes and are tracked separately.

---

## 3. Macro v6 Test Verification (This Session)

| Test File | Tests | Result | Duration |
|-----------|-------|--------|----------|
| `lib/tools/engines/macro.v6.test.ts` | 81 | ✅ PASS | 1.24s |
| `lib/tools/engines/bodyfat.v6.test.ts` | 46 | ✅ PASS | 594ms |

### Macro v6 Test Count Reconciliation
- Root `MACRO_V6_ENGINE_REPORT.md` claimed 46 tests (misattributed bodyfat's count)
- `docs/MACRO_V6_ENGINE_REPORT.md` claimed 66-70 tests (from earlier development stage)
- **Actual:** 81 tests (verified by execution)

---

## 4. No Changes to Existing Tests
- No existing tests were modified
- No existing tests were deleted
- No test assertions were weakened
- All R1 tests are new (contracts.v4.test.ts)

---

## 5. Verification Summary

| Check | Result | Evidence |
|-------|--------|----------|
| R1 contract tests | PASS | 12/12 tests pass, exit 0 |
| TypeScript compilation | PASS | exit 0, no output |
| Macro v6 tests | PASS | 81/81 tests pass, exit 0 |
| Body Fat v6 tests | PASS | 46/46 tests pass, exit 0 |
| Pre-existing failures | 16 | Payment/checkout tests (not R1-related) |
| No test modifications | PASS | git diff shows no test changes |