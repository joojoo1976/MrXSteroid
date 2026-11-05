# MrXSteroid Payment Security Fix Report — Phase 2 (P0 & P1)

**Execution Date:** 2026-10-18  
**Scope:** P0 (Critical Security & Blocker Invariants) & P1 (Financial Integrity & Anti-Tampering)  
**Status:** Completed & Verified via Automated Regression Tests  
**Next Step:** STOPPED as instructed — awaiting verification audit before proceeding to P2.  

---

## 1. Executive Summary

In accordance with the Phase 2 mandate, all confirmed vulnerabilities classified under **P0** and **P1** from `../mrx-audit-20261018/issues.json` have been resolved.

- **Zero Payment Gateways Altered:** Both Kashier and InstaPay architectures remain fully preserved.
- **Zero Hardcoded Secrets:** All credentials, keys, and environment variables are strictly loaded via `process.env` and server configuration.
- **Migrations & RLS:** Idempotent database migrations and Row Level Security policies were codified to eliminate unauthorized PostgREST data access.
- **Test Enforcement:** 15 dedicated unit and integration tests were created across two test suites (`tests/unit/p0SecurityPaymentFixes.test.ts` and `tests/unit/p1SecurityPaymentFixes.test.ts`), passing 100% with zero regressions in the existing payment test suites.

---

## 2. P0 Fixes (Critical & Operational Blockers)

### PAY-001: InstaPay Secure Receipt Storage (No Unauthenticated Public URLs)
- **Problem:** `app/api/checkout/instapay/route.ts` previously invoked `getPublicUrl(path)` on the private `payment-receipts` bucket, creating deterministic, unauthenticated URLs for customer financial receipts.
- **Fix Applied:**
  - File: `app/api/checkout/instapay/route.ts` (Lines 210–222)
  - Replaced `getPublicUrl()` with `createSignedUrl(path, 60 * 60)` with a 1-hour expiration window.
  - Ensured `payment-receipts` storage bucket privacy is enforced in database migration.
- **Verification:** `tests/unit/p0SecurityPaymentFixes.test.ts` asserts `createSignedUrl` is invoked and `getPublicUrl` is absent.

### PAY-005 & PAY-004: PL/pgSQL Variable Fix & search_path Locking in `approve_instapay_receipt`
- **Problem:**
  - `v_net_minor` was declared in the outer block of `approve_instapay_receipt()`, but lines 404–412 referenced `v_net_amount_minor`, causing a PostgreSQL runtime exception on all manual receipt approvals.
  - The function was declared `SECURITY DEFINER` without setting an explicit `search_path`.
- **Fix Applied:**
  - Fixed in: `supabase/migrations/20260928210000_instapay_review_state_machine.sql` (Line 218 & Line 372).
  - Codified in new migration: `supabase/migrations/20261018040000_p0_security_fixes_rls_and_instapay.sql`.
  - Added `SET search_path = public, pg_temp;`.
  - Harmonized variable declaration to `v_net_amount_minor INT := v_gross_minor;`.
- **Verification:** Unit tests confirm variable naming consistency and search_path anchoring in migration files.

### PAY-003: IDOR Elimination on `/api/payments/create-session`
- **Problem:** `/api/payments/create-session` accepted `body.userId` directly from the client request and passed it to `createCheckoutSession()` without cryptographic token verification.
- **Fix Applied:**
  - File: `app/api/payments/create-session/route.ts` (Lines 22, 88–105)
  - Integrated `resolveEffectiveUserId(req, body.userId)`.
  - Requests attempting to forge a victim's `userId` are rejected with HTTP 403 Forbidden.
  - Anonymous callers attempting to claim an account `userId` are rejected with HTTP 401 Unauthorized.
  - Guest checkouts with null `userId` proceed securely with `effectiveUserId = null`.
- **Verification:** `tests/unit/p0SecurityPaymentFixes.test.ts` asserts 401/403 rejections on forged identities.

### PAY-002: Invoices Table Row Level Security Activation
- **Problem:** No database migration had executed `ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;`, leaving the table vulnerable to public PostgREST queries if not enabled manually in the cloud console.
- **Fix Applied:**
  - Codified in: `supabase/migrations/20261018040000_p0_security_fixes_rls_and_instapay.sql` (Lines 12–48).
  - Enabled RLS: `ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;`.
  - Created strict RLS policies:
    1. `"Users can view own invoices"` — restricts users to rows matching `auth.uid() = user_id` or linked via `orders.user_id`.
    2. `"Users can insert own invoices"` — restricts inserts to matching caller `auth.uid()`.
    3. `"Admins can read all invoices"` — restricts full read/write to `public.is_admin()`.
    4. `"Service role full access on invoices"` — grants full access to server `service_role`.
- **Verification:** Unit tests confirm RLS enablement and policy codification in migration.

---

## 3. P1 Fixes (Financial Integrity & Anti-Tampering)

### PAY-007: Fail-Closed Paid Amount & Currency Verification
- **Problem:** `server/payments/verifyPaidAmount.ts` returned `{ ok: true }` when `paidAmount` was `undefined` or `null`, bypassing the defense-in-depth amount verification layer.
- **Fix Applied:**
  - File: `server/payments/verifyPaidAmount.ts` (Lines 45–80)
  - Returns `{ ok: false }` whenever `paidAmount` is missing, null, NaN, or non-positive (`<= 0`).
  - Added strict currency validation: if `paidCurrency` is provided and does not match `invoice.currency`, verification immediately fails closed (`{ ok: false }`).
- **Verification:** `tests/unit/p1SecurityPaymentFixes.test.ts` validates 5 distinct edge cases (undefined, null, NaN, zero, negative, currency mismatch) all return `ok: false`.

### PAY-008: Hard Block on Underpaid InstaPay Receipts in Admin Portal
- **Problem:** When an admin approved an underpaid InstaPay receipt (`submittedAmount < receipt.amount`), the API issued a `console.warn` log and proceeded with settlement.
- **Fix Applied:**
  - File: `app/api/admin/payment-receipts/[id]/route.ts` (Lines 149–161)
  - Replaced advisory warning with a hard blocking HTTP 422 Unprocessable Entity response:
    ```ts
    if (submittedAmount !== undefined && submittedAmount < receipt.amount - 0.01) {
        return NextResponse.json({ error: 'Underpayment blocked: ...' }, { status: 422 });
    }
    ```
  - Added duplicate fail-closed check inside the database RPC `approve_instapay_receipt()`.
- **Verification:** Unit tests confirm HTTP 422 rejection logic on underpayment.

### PAY-006: Server-Authoritative Payment Verification for Success Page
- **Problem:** `legacy-pages/SuccessPage.tsx` immediately initialized component state `setSubscriptionTier(planFromUrl)` directly from the untrusted URL query parameter `plan_id`.
- **Fix Applied:**
  - Created new endpoint: `app/api/payments/verify/route.ts` (GET). Validates invoice/order payment status against PostgreSQL and checks owner authorization.
  - Updated `legacy-pages/SuccessPage.tsx` (Lines 37–56): Removed setting tier from `plan_id` in URL. Component queries `/api/payments/verify?orderId=...` and only sets active tier upon server confirmation (`verified === true`).
- **Verification:** Tests assert `/api/payments/verify/route.ts` exists and `SuccessPage.tsx` no longer initializes state from URL params.

### PAY-011: Webhook Merchant ID Routing from Server Environment Only
- **Problem:** `server/payments/webhook.ts` extracted `merchantId` from `JSON.parse(rawBody)?.merchantId` to route across merchant accounts, trusting untrusted payload data before signature verification.
- **Fix Applied:**
  - File: `server/payments/gateways/PaymentFactory.ts` (Exposed `getKashierEgypt()` and `getKashierGlobal()`).
  - File: `server/payments/webhook.ts` (Lines 140–158): Completely removed `payloadMerchantId` extraction from `rawBody`. Cross-account fallback resolves alternate gateway strictly through server-configured instances (`PaymentFactory.getKashierGlobal()` / `PaymentFactory.getKashierEgypt()`).
- **Verification:** Tests confirm `webhook.ts` does not parse `merchantId` from `rawBody`.

---

## 4. Test Verification Matrix

All tests executed via Vitest on Node.js:

| Test Suite | Tests | Result | Duration |
| :--- | :---: | :---: | :---: |
| `tests/unit/p0SecurityPaymentFixes.test.ts` | 6 | **PASSED** | 58ms |
| `tests/unit/p1SecurityPaymentFixes.test.ts` | 9 | **PASSED** | 21ms |
| **Combined P0 + P1** | **15** | **PASSED** | **1.04s** |
| `tests/unit/paymentState.test.ts` (Regression) | 5 | **PASSED** | 7ms |
| `tests/unit/kashierVerification.test.ts` (Regression) | 16 | **PASSED** | 10ms |

---

## 5. Scope Boundary & P2 Items

Per user directive (`توقف بعد P0+P1. انتظر تدقيق تأكيدي Phase 3 قبل الانتقال لـ P2`):
Execution is now paused. The following hardening items remain queued for P2:
- **PAY-009:** Canonicalization / 308 redirect of redundant `/api/payments/webhook` vs `/api/webhooks/kashier`.
- **PAY-010:** Partial unique index on `payment_receipts(instapay_reference) WHERE instapay_reference IS NOT NULL`.
