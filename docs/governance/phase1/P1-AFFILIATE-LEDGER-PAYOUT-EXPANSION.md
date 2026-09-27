# AFFILIATE / LEDGER / PAYOUT EXPANSION — Phase Evidence Card & Implementation Plan

**Status:** OPEN (owner-approved) · **Frozen context:** Security Hardening = APPROVED ✅ (commit `4a91667`) · M1A = LIVE · Application Compatibility = LIVE · InstaPay = LIVE · **M1B = NOT APPLIED**
**Payout execution = BLOCKED** until C-2 collateral / D-8 / live-activation gate are explicitly cleared. This card makes no live payout call and enables none.

Mode of this document: **DESIGN ONLY.** No migration, no production mutation, no deployment has been performed to produce it. Applying anything below requires owner approval of decision points D1–D4.

---

## 1. Scope & hard constraints

1. Preserve the InstaPay implementation and every verified payment flow unchanged.
2. Implement Affiliate + Ledger + Payout expansion per the signed 85/10/5 accounting model and Posting Matrix.
3. Payout execution remains BLOCKED (C-2 unresolved collateral, D-8, `KASHIER_LIVE_ENABLED` kill switch) — never bypass, never guess.
4. No live transfer / external payout call is enabled merely because this phase is open.
5. Ledger stays append-only, balanced (G-11), auditable, consistent with the approved Posting Matrix.
6. Affiliate commission is tied ONLY to verified successful transactions; attribution/reversal requirements supported.
7. No unrelated UI / payment-provider changes. Preserve all Production invariants (orders=0, M1A columns, InstaPay flows).

## 2. Production current-state audit (evidence, read-only)

### 2.1 Financial tables (Production, 2026-09-24 dump)
| Table | Rows | State |
|---|---|---|
| `financial_ledger` | 0 | Journals never posted (no paid invoices yet). |
| `beneficiaries` | 0 | **No beneficiaries configured → no 85/10/5 ever frozen.** |
| `split_rules` | 0 | **No rules seeded. `freezeOrderSplits` short-circuits**: no active rules → `{frozen:false, splitsCount:0}` (`server/payments/splitEngine.ts:237-240`). |
| `order_splits` | 0 | Freeze path never runs. |
| `payouts` | 0 | None queued. Status CHECK includes `queued/processing/reconciling/completed/failed/unknown`. |
| `affiliates` | 1 | System live; `referrals`/`affiliate_commission_ledger` 0 rows (no paid invoices). |
| `affiliate_attributions` | **table ABSENT** | Migration `20260919120000` **never applied** in Production. `resolve_active_attribution` RPC absent (404 on REST `affiliate_attributions`, matches C-4). |
| `reconciliation_runs` | 0 | Manual-invocation only (cron removed, Hobby). |

### 2.2 Already-wired verified-payment pipeline (CONFIRMED)
`app/api/webhooks/kashier` → `server/payments/webhook` → `fulfillmentService.applyProviderVerdict` (non-fatal each step):
1. marks invoice paid + payment_intent succeeded;
2. activates subscription/profile;
3. triggers `triggerAffiliateCommission` (`server/affiliate/ledgerService.ts`) — **InstaPay never auto-commissions** (line 50-53), TIMED_OUT/UNKNOWN never trigger (guard upstream);
4. `freezeOrderSplits` + `recordPaymentCaptureJournal` + `recordSplitAllocationJournal`;
5. `grantEntitlement` (`(user_id, product_id, invoice_id)` upsert idempotency).

### 2.3 Posting-Matrix compliance gap (MUST FIX for the signed model)
Signed §6.2 Chart of Accounts: `CUSTOMER_FUNDS · GATEWAY_FEES · PLATFORM_REVENUE · BENEFICIARY_PAYABLE · REFUND_LIABILITY · PAYOUT_CLEARING · RESERVE`. §6.3: `Dr CUSTOMER_FUNDS G / Cr BENEFICIARY_PAYABLE .85N / Cr PLATFORM_REVENUE .10N / Cr RESERVE .05N / Dr GATEWAY_FEES F / Cr CUSTOMER_FUNDS F`.

Current implementation deviates:
- `LedgerAccount` has **no `RESERVE`** (`server/payments/financialLedgerService.ts:14-21`) and instead introduces `SALES_CLEARING` not in the signed chart.
- `beneficiaries.role` CHECK = `author, platform, coach, partner` — **no `reserve` role** can be represented (`20260913230000:12`).
- `recordSplitAllocationJournal` maps only `role==='platform' → PLATFORM_REVENUE`, **every other split → BENEFICIARY_PAYABLE** (`financialLedgerService.ts:249-259`); `freezeOrderSplits` snapshot has **no role field** and `fulfillmentService.ts:366` reads `rule_snapshot?.role || 'beneficiary'` → always `beneficiary` → **5% reserve and 10% platform would both post to BENEFICIARY_PAYABLE** if splits ran.
- Capture + split journals leave a `SALES_CLEARING` residual equal to the gateway fee (never cleared) → not a clean §6.3 posting.

### 2.4 Attribution gap (double-layer NOT live)
- `affiliate_attributions` table + `resolve_active_attribution` RPC absent in Production.
- Checkout (`app/api/checkout/kashier/session/route.ts:70-92`) resolves attribution **cookie-only**; documented DB-priority path (`resolveDbAttribution`) is **not called** at checkout.
- `saveDbAttribution` uses `upsert(..., { onConflict: 'user_id,referral_code' })` (`attributionService.ts:141-145`) but the migration declares **no unique constraint** on `(user_id, referral_code)` → `ON CONFLICT` would error even after the table exists. `markAttributionUsed` (`attributionService.ts:191-213`) updates by `(user_id, affiliate_id)` without an `attribution_used=false` idempotency key on a specific attribution.
- `20260919121000_affiliate_security_hardening` (partial-unique approved referral per invoice + tightened RLS) also **never applied** → no DB-level double-commission protection in Production.

### 2.5 Payout surface gap
- `PayoutService.approveBatchPayouts` (admin manual batch approval, idempotency key, stale-approval re-gates, RECONCILING/UNKNOWN handling, ledger hold/completion/reverse) exists but **no admin API route calls it** — only `/api/payouts/webhook` (external receiver) exists.
- Execution already gated: kill switch `KASHIER_LIVE_ENABLED` (`payoutService.ts:322-328`), test-mode simulation (`:304`), timeout → RECONCILING not retry (`:227-241`), D-8/`KASHIER_LIVE_ENABLED=false` block condition (§8 spec).

### 2.6 Existing test coverage (passing)
`splitEngine`, `splitEngineScenarios`, `splitState`, `payoutService` + `payoutServiceBatchScenarios`, `payoutState`, `financialLedgerService`, `financialLedgerJournals`, `finalGateV51PayoutsAndSession`, `commissionEngine`, `attribution`, `affiliateWebhookIntegration`, `affiliateSecurity`, `affiliateConcurrency`, `reconciliationService/Runner`, `kashierRevenueSplit` (integration). **No tests currently lock the §6.3 exact mapping, the reserve/role gap, DB attribution layer, or payout kill-switch gating.**

## 3. Implementation plan (all additive / non-destructive; nothing live-enabled)

### M-AFF — Affiliate & attribution activation (migration)
Apply `20260919120000_affiliate_attributions_table.sql` + `20260919121000_affiliate_security_hardening.sql` **as already designed**, PLUS required corrections:
- Add **unique constraint** `affiliate_attributions (user_id, referral_code)` (the code already upserts on it). Per-user active-uniqueness is preserved by marking prior rows used.
- (Fixes the `404` gap C-4; lands DB-priority attribution + double-commission DB guard.)

### M-LEDGER — Revenue split activation + Posting-Matrix compliance (migration + code)
- Extend `beneficiaries.role` CHECK to include `reserve` (additive: `alter ... drop constraint ... add check (... )`).
- **Seed** Author + Platform + Reserve beneficiaries and **85/10/5 global split_rules** (tier/product null → applies to all; `share_value` 85/10/5, `priority` high). Author beneficiary details content-input required (D1).
- Extend `LedgerAccount` with `RESERVE`; make split allocation post `PLATFORM_REVENUE`/`RESERVE`/`BENEFICIARY_PAYABLE` by beneficiary role (author → BENEFICIARY_PAYABLE). Fix `freezeOrderSplits` snapshot to carry role; `fulfillmentService` join `beneficiaries.role` for mapping.
- Retire `SALES_CLEARING` drift: post capture journal as §6.3 single balanced entry (`Dr CUSTOMER_FUNDS G / Cr BENEF .85N / Cr PLATFORM .10N / Cr RESERVE .05N / Dr GATEWAY_FEES F / Cr CUSTOMER_FUNDS F`).
- Refund path keeps §6.4 (`refund_net = R×(N/G)`, Largest-Remainder, ≤1 minor unit → RESERVE; MERCHANT_ABSORBS) in `recordRefundAllocationJournal`.

### CODE — attribution priority + payout admin surface (no live enablement)
- Checkout: DB-first attribution (`resolveDbAttribution`) with cookie fallback; `markAttributionUsed` after stamping; keep self-referral guard; InstaPay manual-commission rule preserved.
- New `requireAdmin` admin route(s): list pending splits/payouts + batch approval executor that re-runs all gates (C-2 outstanding, D-8, kill switch) and **REFUSES execution while blocked** (returns explicit `payouts_blocked` until gates clear). No external call until gates clear.

### TESTS (new, CI-gated)
- Posting-matrix balance + account mapping tests (85/10/5 → BENEF/PLATFORM/RESERVE exact; G-11; Largest-Remainder ≤1 minor unit).
- Attribution DB-layer tests (upsert-on-conflict works, last-valid-wins, expiry, mark-used idempotency, self-referral).
- Split-activation test (seeded rules freeze 3 splits per paid invoice, idempotent).
- Payout gating tests: kill switch / D-8 → `payouts_blocked` refusal; state machine; idempotency key; RECONCILING not retried.
- Admin route `requireAdmin` posture + reversal (refund/partial/chargeback) end-to-end.

## 4. Explicit non-goals (locked)
No live payout transfer · no commission posted into `financial_ledger` (25/35/45 affiliate layer stays in `affiliate_commission_ledger` per the "two-layer" governance ruling M) · no InstaPay change · no UI/payment-provider change · no M1B · no cron reconciliation (manual persists) · no Fourthwall/Bosta/DHL work.

## 5. Decision points (owner approval required before applying)
- **D1 — Author beneficiary identity:** Provide the Author's payout details (bank/wallet/card + recipient id) to seed the 85% beneficiary, or approve an **inactive placeholder** beneficiary to be completed + activated later. Platform (10%) = MR-X Steroid; Reserve (5%) = new `reserve` role beneficiary.
- **D2 — Posting-Matrix compliance:** Approve retiring `SALES_CLEARING` in favor of the exact §6.3 single-entry postings (adds `RESERVE` account). Any existing journal rows (0 today) remain untouched.
- **D3 — Payout admin surface:** Approve adding the `requireAdmin` payout list/approve routes that stay execution-blocked until C-2/D-8/kill-switch clear.
- **D4 — Attribution unique constraint:** Approve `affiliate_attributions (user_id, referral_code)` unique (needed by the already-shipped upsert).

## 6. Acceptance criteria (evidence card at phase close)
All gates green (tsc/eslint/`test:unit`/build) · migrations applied in Production and verified (re-runnable SQL in §10 of S-J-P evidence doc) · seeded 85/10/5 live on next verified payment · ledger balanced to minor unit · payout routes refuse execution while gates unresolved · full test results submitted · no flow regression (InstaPay smoke re-run) · nothing below enabled without owner approval.