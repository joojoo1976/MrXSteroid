# Phase 1 Payment Security & Technical Audit Summary — MrXSteroid

**Target System:** MrXSteroid Payment Gateway Architecture (Next.js App Router / Supabase / PostgreSQL / Kashier / InstaPay)  
**Audit Mode:** READ-ONLY Evidence-Based Source Code & Schema Assessment  
**Audit Timestamp:** 2026-10-18  
**Repository Branch / Commit:** `feat/tool-036-supreme-v2-evidence-based` (`41dc2ad`)  
**Lead Auditor:** Senior Payment Security Auditor + Staff Engineer  

---

## 1. Executive Summary

This report delivers the formal evidence-based security and architecture audit of the MrXSteroid payment subsystem. The audit was conducted under strict **READ-ONLY** constraints: zero modifications, migrations, or database writes were executed within the repository, no secrets or credentials were exposed, and no live test transactions were submitted to payment providers.

### Key Assessment Findings Overview

| Metric | Count | Details |
| :--- | :---: | :--- |
| **Total Issues Identified** | **11** | Classified under standardized taxonomy |
| **Critical Severity** | **1** | Storage unauthenticated URL generation (`PAY-001`) |
| **High Severity** | **4** | Missing DB RLS on Invoices (`PAY-002`), IDOR in create-session (`PAY-003`), `SECURITY DEFINER` search_path (`PAY-004`), PL/pgSQL variable mismatch breaking approval RPC (`PAY-005`) |
| **Medium Severity** | **4** | Success state spoofing (`PAY-006`), `verifyPaidAmount` bypass on undefined (`PAY-007`), Admin receipt approval underpayment (`PAY-008`), Webhook merchant fallback (`PAY-011`) |
| **Low / Coverage-Gap** | **2** | Dual webhook endpoint confusion (`PAY-009`), Non-unique index on InstaPay references (`PAY-010`) |

---

## 2. Environment & Repository Snapshot (Phase 0)

- **Repository Root:** `E:\MrXSteroid-main`
- **Current Git Branch:** `feat/tool-036-supreme-v2-evidence-based`
- **Head Commit:** `41dc2ad`
- **Node.js Environment:** `v25.2.1` | **Package Managers:** `npm 11.6.2`, `pnpm 12.14.0`
- **Environment Configuration:** `.env` (3,058 B), `.env.example` (23,516 B), `.env.supabase.tmp` present.

---

## 3. Core Findings & Root-Cause Analysis

### PAY-001: InstaPay Receipt Public URL Generation on Private Bucket
- **Severity:** `Critical` | **Status:** `Confirmed`
- **Location:** `app/api/checkout/instapay/route.ts` (Lines 211–215)
- **Root Cause:** When an InstaPay payment receipt image is uploaded, the backend executes `supabase.storage.from(RECEIPT_BUCKET).getPublicUrl(path)` to obtain a URL. However, migration `20260923130000_harden_instapay_receipt_access.sql` configures `payment-receipts` as a private bucket (`public: false`). `getPublicUrl()` constructs a deterministic unauthenticated URL pattern rather than generating a time-bounded signed URL via `createSignedUrl()`.
- **Financial & Privacy Impact:** If Supabase Storage policies or CDN settings do not enforce private object checks at the endpoint gateway, sensitive financial screenshots with bank account numbers and customer transfer details become accessible without authentication.

### PAY-002: Invoices Table Missing Explicit Row Level Security Statement
- **Severity:** `High` | **Status:** `Confirmed`
- **Location:** `supabase/migrations/` (Missing across all migration files)
- **Root Cause:** Migration `20260925160000_invoices_payment_source.sql` notes that "*`invoices` already has RLS enabled*", yet an exhaustive search across all repository migrations proves that `ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;` was never codified in code.
- **Impact:** In environments where RLS was not manually toggled in the Supabase Cloud dashboard, the `invoices` table remains unprotected against direct PostgREST SELECT/INSERT operations using the public anon API key.

### PAY-003: IDOR Vulnerability on /api/payments/create-session
- **Severity:** `High` | **Status:** `Confirmed`
- **Location:** `app/api/payments/create-session/route.ts` (Line 92)
- **Root Cause:** The endpoint accepts `body.userId` directly from client JSON input and passes it into `createCheckoutSession({ userId: body.userId })` without calling `resolveEffectiveUserId(req, body.userId)`. By contrast, `/api/checkout/kashier/session` and `/api/payments/create-invoice` enforce token-to-user verification.
- **Impact:** An attacker can create valid invoice and checkout sessions linked to other user IDs, leading to account impersonation and incorrect entitlement fulfillment.

### PAY-004: Missing search_path on approve_instapay_receipt SECURITY DEFINER RPC
- **Severity:** `High` | **Status:** `Confirmed`
- **Location:** `supabase/migrations/20260928210000_instapay_review_state_machine.sql` (Lines 206–210)
- **Root Cause:** The RPC `approve_instapay_receipt` runs with database superuser/definer rights (`SECURITY DEFINER`) but omits `SET search_path = ''`.
- **Impact:** Vulnerable to PostgreSQL schema search_path poisoning attacks if an untrusted schema is injected.

### PAY-005: Runtime PL/pgSQL Undeclared Variable in Approval RPC
- **Severity:** `High` | **Status:** `Confirmed`
- **Location:** `supabase/migrations/20260928210000_instapay_review_state_machine.sql` (Lines 404–412)
- **Root Cause:** In the inner settlement block, lines 404–410 perform arithmetic using `v_net_amount_minor`, but the declaration block at line 371 declared `v_net_minor` instead.
- **Impact:** Calling `approve_instapay_receipt()` causes PostgreSQL to throw a runtime error (`column "v_net_amount_minor" does not exist`), failing all manual InstaPay receipt approvals in production.

### PAY-006: Premature Client-Side Success State Display
- **Severity:** `Medium` | **Status:** `Confirmed`
- **Location:** `legacy-pages/SuccessPage.tsx` (Lines 39–44)
- **Root Cause:** The client reads `plan_id` directly from URL search parameters on component mount and immediately updates `setSubscriptionTier(planFromUrl)`, revealing success UI before polling the database for confirmed payment.
- **Impact:** Cosmetic spoofing of successful transactions.

### PAY-007: verifyPaidAmount Bypass on Missing Amount
- **Severity:** `Medium` | **Status:** `Confirmed`
- **Location:** `server/payments/verifyPaidAmount.ts` (Lines 50–53)
- **Root Cause:** If `paidAmount` is `undefined` or `null`, the function returns `{ ok: true }`, disabling defense-in-depth amount verification for callbacks where the amount field is stripped.

### PAY-008: Admin Approval Permitted for Underpaid InstaPay Receipts
- **Severity:** `Medium` | **Status:** `Confirmed`
- **Location:** `app/api/admin/payment-receipts/[id]/route.ts` (Lines 150–156)
- **Root Cause:** When `submittedAmount !== receipt.amount`, the admin endpoint issues a `console.warn` log instead of rejecting the approval or enforcing an explicit manual override flag.

---

## 4. Verification of Core Algorithms & Rules

1. **Server-Authoritative Pricing:**
   - Evaluated `server/payments/pricing.ts` and `combinedOrder.ts`.
   - Client-supplied prices, shipping costs, and discounts are discarded. Authoritative totals are calculated strictly using `admin_settings` database rates and canonical shipping provider rates.
2. **Kashier Signature Verification:**
   - Evaluated `server/payments/gateways/KashierGateway.ts` and `kashierVerification.ts`.
   - Uses `crypto.timingSafeEqual()` for constant-time HMAC-SHA256 signature verification.
3. **Revenue Split & Ledger Invariant:**
   - Evaluated `server/payments/splitEngine.ts`.
   - Uses the Hare-Niemeyer Largest-Remainder method to distribute net proceeds into 85% author, 10% platform, and 5% reserve shares.
   - Enforces the strict invariant: `totalAllocated === netAmountMinor` down to the exact integer minor unit.

---

## 5. Negative Test Suite & Quality Assurance Recommendations

The following negative test cases should be added to the automated CI test suite in Phase 2:
1. **IDOR Prevention:** Assert that `POST /api/payments/create-session` rejects requests where `body.userId !== session.user.id` with HTTP 403.
2. **RPC Syntax & Execution Test:** Execute `approve_instapay_receipt` in a staging database test to guarantee that `v_net_minor` / `v_net_amount_minor` resolves cleanly without runtime exceptions.
3. **Storage Access Control:** Automated curl test verifying that an unauthenticated GET request to `payment-receipts` Supabase Storage URLs returns HTTP 403 Forbidden.
4. **InstaPay Reference Replay:** Attempt to approve two distinct receipts sharing the identical `instapay_reference` and ensure the database or API rejects the second submission.
5. **Amount Underpayment Block:** Assert that `PATCH /api/admin/payment-receipts/[id]` with `submittedAmount < amount` requires explicit override confirmation.

---

## 6. Output Files Inventory

In accordance with strict audit constraints, all deliverables have been written outside the repository to:
- Directory: `e:\mrx-audit-20261018\`
  1. `issues.json` — Machine-readable vulnerability catalog following exact schema specification.
  2. `flow-map.md` — Detailed Mermaid architecture and state machine diagrams.
  3. `audit-summary.md` — Executive audit report and verification summary.
