# Final Gate v5.1 — Master Specification (Kashier × mrxsteroid.com)

## Execution-Only / Revenue Allocation + Payment Gateway Architecture + Payment Catalog & Routing Governance

**Version:** v5.1
**Based on:** Final Gate v5
**Status:** FINAL / READY FOR DEVELOPER EXECUTION

---

# 0) MASTER BUSINESS MODEL

MR-XSteroid is the merchant/seller. Kashier is the external **Payment Gateway / Processor**.
Kashier MUST NOT be treated as the internal accounting owner, revenue-allocation engine, or payout ledger.

**Active allocation model (non-negotiable):**
```
85% = Beneficiary / Author Share
10% = Platform Revenue
5%  = Reserve
```

---

# 1) GOVERNANCE — LOCKED DECISIONS

| Decision | Value |
|----------|-------|
| Revenue allocation basis | NET_AFTER_GATEWAY_FEE |
| Refund fee policy | MERCHANT_ABSORBS |
| Entitlement on refund | remains active 14 days, then revoked |
| Revenue allocation | Author 85% · Platform 10% · Reserve 5% |
| Live Kill Switch | owner only |
| Kashier role | external payment gateway / processor |
| Internal revenue allocation | application-controlled |
| Payout Architecture | ACTIVE |

---

# 2) BLOCKED REGISTER

D-8 Transfers Hashing · N-13 KASHIER_LIVE_ENABLED · Global MID confirmation · Refund-fee (C2) · KYC/Onboarding
_(C-2 Payout Host removed 2026-09-17 — owner provided written account-manager confirmation; payout may use the FEP host.)_

Any code path depending on a blocked item MUST raise `BlockedGateError` with the exact blocked item.

---

# K-2) CONFORMITY MANDATES — VERIFIED KASHIER FINDINGS (Phase 1 close-out)

**Source:** K-2 Evidence Card (`docs/kashier/K-2-docs-conformity.md`) — live `developers.kashier.io` verification.
**Status:** MANDATORY for all subsequent phases. Folded into Phases 2–9. Where the live docs differ from earlier v5 language, **the live docs win** and this block overrides the earlier language.

## Phase 2 — Configuration & Secrets

- **C11 IP allow-list:** once the Secret Key IP allow-list has at least one entry, ONLY those IPs may use the Secret Key; everything else is rejected with `403 Unauthorized IP address`. Vercel egress IPs MUST be allow-listed before go-live. An empty allow-list is NOT a valid live configuration.
- **B2 MID format — RESOLVED 2026-09-17:** owner confirmed via Kashier management that `MID-48761-625` is the real Egypt MID. `merchant_configs.merchant_id` MUST store `MID-48761-625` for Egypt. The documented `MID-XXXX-XXXX` form is the generic dashboard representation and is NOT a contradiction. Global MID remains to be confirmed from the dashboard before Phase 8.

## Phase 3 — Schema

- **C7 webhook de-dupe key:** Kashier de-dupes delivery on `{transactionId}::{webhookUrl}::{status}`. `webhook_events` MUST index/store the composite `(provider, transaction_id, status)` alongside the existing unique index, so replays resolve by the Kashier de-dupe key. Replayed order notifications arrive as `event: "idempotency"` with `ORDER_PAID_BEFORE` and MUST be treated as duplicates — acknowledge (200/409), NO financial mutation.

## Phase 4 — Checkout (Payment Session)

- **C4 required session fields (10):** `expireAt`, `maxFailureAttempts`, `amount`, `currency`, `order`, `merchantId`, `merchantRedirect`, `type`, `display`, `customer`. The checkout design MUST send all 10 (see §36 Payment Session).
- **C5 unique order reference:** Kashier rejects a duplicate order reference for the same merchant with `ERR_ORD_02`. The idempotency key (§12) MUST guarantee a unique `order` reference; repeated identical requests return the prior session, never a duplicate PaymentIntent.
- **C6 per-request webhook:** sessions accept `serverWebhook`; MUST be set to the per-merchant webhook URL resolved from `merchant_configs` so Egypt/Global never share a destination (see §50 Webhook Architecture).
- **A11 test/live session host:** the hosted checkout host is shared between modes; the mode travels on the `sessionUrl` as a `mode` query parameter. Do NOT branch the hosted-checkout host URL on mode. (Sessions API differs: `test-api.kashier.io` vs `api.kashier.io`.)
- **C3 (CORRECTED) test-mode methods:** outside live, checkout ignores `allowedMethods` and forces the method list to `card,wallet`. Test expectations (§40 Group L / §37 Egypt) MUST NOT assume `bank_installments`/`fawry`/similar are exercisable in test; those require one live transaction per method.

## Phase 5 — Webhook

- **C12 ignore `data.hash`:** `data.hash` is an internal Kashier integrity field; the handler MUST explicitly NOT attempt to verify it.
- **C7 replay semantics:** handle `event:"idempotency"` / `ORDER_PAID_BEFORE` as duplicate (acknowledge, no mutation) — see §10 Replay & Late-Arrival Protection.
- **A9 ack/retry:** ack = HTTP 200 or 409; retries up to 10× with backoff 2m → 10m → 30m → 1h → 2h → 4h → 4h…; 30-second delivery timeout. See §9 Webhook Pipeline.

## Phase 6 — Ledger

- No K-2 finding changes 85/10/5. C2 refund-fee remains UNVERIFIED — see Phase 8.

## Phase 7 — Reconciliation

- **C8 live-only settlements:** settlement windows/batches are produced by the live pipeline only; test mode never creates them. Reconciliation MUST branch on mode: test-mode reconciliation relies on provider session/status queries; live adds settlement-window reconciliation.

## Phase 8 — Refund + Payout

- **A13 refund permission:** executing `refund`/`void` requires the refund permission on the API key's role. The key used MUST carry it, verified during setup and again before Phase 8.
- **C9 capability flags:** payouts/instant settlement are disabled for a new merchant until Kashier enables the capability. Phase 8 MUST NOT proceed until the capability flag is verified/enabled for the target merchant.
- **C2 (UNVERIFIED):** refund-fee accounting — refunds page not yet fetched; `MERCHANT_ABSORBS` remains per owner decision, but fee treatment stays provisional until verified or confirmed by the account manager.
- **C-2 (RESOLVED 2026-09-17):** payout host (FEP) unblocked — owner supplied written account-manager confirmation. **D-8 (BLOCKED):** transfers hashing remains blocked pending confirmation.

## Phase 9 — Production Gate

- **C10 live rate limit:** checkout limited to 1000 req/min per IP at the gateway; keep the stricter app-layer guard (10/min per IP, 30/hour per user) — see §15 Security.
- **C11 (cross-ref):** confirm live Secret Key IP allow-list includes Vercel egress before go-live.

---

# 3) SYSTEM RESPONSIBILITY BOUNDARY

**Kashier:** external payment-provider layer only (session, payment, refund, webhook).
**MR-XSteroid:** orders, invoices, payment intents, internal revenue allocation, beneficiary obligations, platform revenue, reserve accounting, refund accounting, affiliate/beneficiary attribution, payout state, internal financial ledger, audit history, reconciliation.

---

# 4) ENVIRONMENT

### 4.1 Merchant Config Resolver
No global hardcoded merchant ID. Use MerchantConfig{merchantId, paymentApiKey, secretKey, transferApiKey, webhookUrl, currency, mode}.

### 4.2 Env Vars (Egypt)
```
KASHIER_EGYPT_MERCHANT_ID
KASHIER_EGYPT_PAYMENT_API_KEY
KASHIER_EGYPT_SECRET_KEY
KASHIER_EGYPT_TRANSFER_API_KEY
KASHIER_EGYPT_WEBHOOK_URL
KASHIER_EGYPT_CURRENCY=EGP
KASHIER_MODE=test | live
KASHIER_LIVE_ENABLED=false (unless live)
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://www.mrxsteroid.com
```

### 4.3 Mode Rules
If KASHIER_MODE=live then KASHIER_LIVE_ENABLED=true else ConfigViolationError.

### 4.4 Secret Rotation
_PRIMARY / _SECONDARY with 7-day overlap.

---

# 5) IDENTITY MODEL

```
Order → Invoice → PaymentIntent[] → ProviderTransaction → WebhookEvent[]
```
Unique index: (provider, provider_event_id, provider_transaction_id, provider_operation).

---

# 6) REVENUE ALLOCATION & LEDGER

### 6.1 Active Allocation
For every successful payment: Net = Gross - Gateway Fee.
Allocation: 85% Beneficiary, 10% Platform, 5% Reserve (integer minor units).

### 6.2 Chart of Accounts
CUSTOMER_FUNDS · GATEWAY_FEES · PLATFORM_REVENUE · BENEFICIARY_PAYABLE · REFUND_LIABILITY · PAYOUT_CLEARING · RESERVE

### 6.3 Payment Success Posting
Dr CUSTOMER_FUNDS G
Cr BENEFICIARY_PAYABLE N×0.85
Cr PLATFORM_REVENUE N×0.10
Cr RESERVE N×0.05
Dr GATEWAY_FEES F
Cr CUSTOMER_FUNDS F

### 6.4 Refund (NET_AFTER_GATEWAY_FEE, MERCHANT_ABSORBS)
refund_net = R × (N/G). Reverse allocation per frozen allocation. Largest-Remainder rounding; ≤1 minor unit → RESERVE.

---

# 7) BENEFICIARY ARCHITECTURE — ACTIVE

BENEFICIARY_PAYABLE ACTIVE. Supports Author/Partner/Future Affiliate without rebuilding payment core.
Do NOT silently replace 85/10/5 with affiliate commission model.

---

# 8) PAYOUT ARCHITECTURE — KEEP ACTIVE

State: QUEUED → PROCESSING → RECONCILING → COMPLETED · FAILED · UNKNOWN.
Postings: Payout Sent (Dr BENEFICIARY_PAYABLE / Cr PAYOUT_CLEARING), Confirmed (Dr PAYOUT_CLEARING / Cr CUSTOMER_FUNDS), Failed (Dr PAYOUT_CLEARING / Cr BENEFICIARY_PAYABLE).

### Payout Block Conditions
Refuse execution if: D-8 unresolved OR KASHIER_LIVE_ENABLED=false. Payout host uses the FEP host (`fep.kashier.io` / `test-fep.kashier.io`) per K-2 B1 + owner confirmation (C-2 resolved 2026-09-17).

---

# 9) WEBHOOK PIPELINE

1. Receive raw body · preserve raw bytes · verify signature (timing-safe) · test PRIMARY then SECONDARY · parse JSON only after validation.
2. Never trust /checkout/success as proof of payment.
3. Handle: SUCCESS, FAILURE, PENDING, EXPIRED, UNKNOWN.
4. Unknown event: persist raw payload, audit, acknowledge per Kashier docs, NO financial mutation.
5. Consistency validation: compare provider data vs stored PaymentIntent (amount, currency, merchantId, orderId). Mismatch → reject/quarantine + audit.

---

# 10) REPLAY & LATE-ARRIVAL PROTECTION

Replay window: 24h. Late webhook for non-current PaymentIntent → QUARANTINE, not destructive rejection.

---

# 11) TRANSACTIONAL OUTBOX & RECONCILIATION

Fulfillment only after Verified Webhook + Successful DB Transaction.
Reconciliation: every 5 min — check PENDING >15m, UNKNOWN, quarantined events. Query provider status, resolve via same state path, never create second posting. Exponential backoff, max 12 attempts.

---

# 12) CHECKOUT IDEMPOTENCY

Client sends Idempotency-Key: <UUID v4>. DB unique index (invoice_id, idempotency_key). Repeated request returns previous session. No duplicate PaymentIntents.

---

# 13) DATABASE TABLES

orders · invoices · payment_intents · provider_transactions · order_splits · financial_ledger · entitlements · webhook_events · outbox_messages · audit_log · refunds · reconciliation_runs · merchant_configs · products · product_prices · kashier_product_mappings

order_splits MUST remain (85/10/5 persistent allocation state). RLS: auth.uid() = user_id.

---

# 14) REQUIRED RPCs

rpc_process_webhook(event_id, raw_payload) — atomic: Lock+Validate+State+Ledger+Split+Outbox.
rpc_process_refund(invoice_id, amount, reason).
rpc_queue_payout(beneficiary_id) — enforce all blockers before execution.

---

# 15) SECURITY

Rate limits: /api/checkout/kashier/session 10/min IP, 30/hour user; /api/payments/webhook 1000/min; /api/admin/init-kashier-webhook 5/hour; Break-Glass 3/day (60min session).
Break-Glass allowed: read audit_log, read webhook_events.raw_payload, manually trigger reconciliation. NOT allowed: direct refund/payout/ledger/config modification.

Raw payload security: encrypt at rest, redact sensitive fields, never persist CVV.

---

# 16) STATE MACHINES

Payment: INITIATED → PENDING → SUCCESS → FAILURE → EXPIRED → UNKNOWN
Split: PENDING → CALCULATED → FROZEN → QUEUED → PAID → FAILED
Payout: QUEUED → PROCESSING → RECONCILING → COMPLETED → FAILED → UNKNOWN
Refund: REQUESTED → VALIDATING → SUBMITTED → PENDING → COMPLETED → FAILED → UNKNOWN → REJECTED → CANCELLED

---

# 17) TESTING (Definition of Done)

Unit + Integration + Chaos + E2E + Ledger Rebuild + Reconciliation + Secret Rotation.
Mandatory chaos: 100 duplicate webhooks, out-of-order, payout failure after success, refund race, DB crash, network partition, signature tampering, parallel idempotency race, amount mismatch, late webhook, unknown event, missing webhook (recovery), secret rotation during flow, ledger rebuild, split invariant violation.

---

# 18) LEDGER REBUILD TEST

Reconstruct balances from webhook_events + outbox_messages + immutable ledger inputs. Compare vs financial_ledger. No production gate without successful rebuild.

---

# 19) EVIDENCE CARDS

K-1 Schema Migration · K-2 Kashier Docs Conformity · K-3 Webhook Pipeline · K-4 Ledger Correctness · K-5 Chaos 15/15 PASS · K-6 Production Gate.

---

# 20) PHASED EXECUTION

Each phase MUST also absorb its cross-referenced mandates from §K-2 (K-2 Conformity Mandates).

Phase 1: Discovery & Docs Verification → K-2 + Conflict Log (DELIVERED — OWNER-SIGNED 2026-09-17; B2 MID-48761-625 confirmed by Kashier management; C-2 removed from Blocked Register)
Phase 2: Configuration & Secrets → Merchant Resolver, Secret Rotation (+ K-2: C11 IP allow-list, B2 MID format) (DELIVERED 2026-09-17 — server/payments/merchantResolver.ts; PRIMARY/SECONDARY rotation in KashierGateway; tests/unit/merchantResolver.test.ts; full audit 721/721)
Phase 3: Schema & Migrations (+ K-2: C7 de-dupe composite key)
Phase 4: Checkout → Session + Idempotency + Multi-Merchant + Tests (+ K-2: C4 10 required fields, C5 ERR_ORD_02, C6 serverWebhook, A11 host, C3 test-mode methods)
Phase 5: Webhook → Verification + Replay + Late-arrival Quarantine + Outbox + Tests (+ K-2: C12 ignore data.hash, C7 replay semantics, A9 ack/retry)
Phase 6: Ledger + Revenue Allocation → 85/10/5 + Posting Matrix + Largest-Remainder + Ledger Rebuild Test
Phase 7: Reconciliation → 5-min Cron + Provider Status + Backoff + Retry + Audit (+ K-2: C8 live-only settlement windows)
Phase 8: Refund + Payout → Engines + State Machines + Payout Reconciliation (+ K-2: A13 refund permission, C9 capability flags, C-2 FEP host unblocked 2026-09-17; C2 refund-fee provisional; Payout execution BLOCKED until D-8/KYC/Global-MID/KASHIER_LIVE_ENABLED)
Phase 9: Chaos + Production Gate → K-5 + K-6 (+ K-2: C10 live rate limit, C11 IP allow-list confirm)

No phase begins until previous phase is explicitly approved.

---

# 21) EXECUTION DISCIPLINE

EXECUTION-ONLY. No architectural improvisation. No silent simplification. No removal of 85/10/5, BENEFICIARY_PAYABLE, PAYOUT_CLEARING, ORDER_SPLITS, PAYOUT ARCHITECTURE, RECONCILIATION, LEDGER REBUILD, WEBHOOK SECURITY, IDEMPOTENCY.
Any deviation requires Evidence Card + Owner Approval.

---

# 22) DEVELOPER HARD RULES

1. Read spec completely before coding.
2. Verify Kashier docs before provider-specific code.
3. Kashier = external gateway only.
4. MR-XSteroid = merchant + internal financial authority.
5. Keep 85/10/5 ACTIVE. Keep Beneficiary/Payout ACTIVE.
6. Never hardcode credentials. Never expose secrets.
7. Never trust browser success pages as payment proof.
8. Use verified webhooks only. Implement reconciliation.
9. Implement idempotency + replay protection + late webhook quarantine.
10. Preserve ledger rebuild + chaos testing + secret rotation.
11. Payout execution remains blocked until external facts verified.
12. Do not invent values for blocked Kashier requirements.
13. Definition of Done is binary: PASS-ALL or NOT-DONE.
14. Never claim success without evidence.

---

# 23) OWNER-SIGNED COMMERCIAL RULES

Revenue: 85% Author/Beneficiary, 10% Platform, 5% Reserve.
Refund basis: NET_AFTER_GATEWAY_FEE. Refund fee: MERCHANT_ABSORBS.
Entitlement: 14 days after refund before revocation. Live activation: owner only.

---

# 24) FUTURE AFFILIATE COMPATIBILITY

May introduce affiliate_id, referral_code, commission_percentage, custom_commission_override, commission_amount, attribution window, affiliate balance/payout.
MUST NOT destroy/bypass existing Order/Invoice/PaymentIntent/ProviderTransaction/Webhook/Ledger/Revenue Allocation/Payout/Reconciliation/Audit.
Affiliate logic integrates via explicitly defined business rule; may reuse BENEFICIARY_PAYABLE/PAYOUT architecture only through defined rule.

---

# 25) DEFINITION OF DONE (binary)

```
npm test              PASS
npm run typecheck     0 errors
npm run lint          0 errors
npm run build         SUCCESS
RLS cross-user access BLOCKED
Group L               15/15 PASS
Ledger Rebuild        PASS
Reconciliation        PASS
Secret Rotation       PASS
Idempotency           PASS
Webhook Verification  PASS
Refund                PASS
Payout safeguards     PASS
85/10/5 invariant     PASS
```

---

# 26) FINAL ARCHITECTURAL PRINCIPLE

```
CUSTOMER → MR-XSteroid (Checkout/Order) → KASHIER (External Payment Gateway)
→ Verified Webhook → Internal Financial Core
  ├── 85% Beneficiary
  ├── 10% Platform
  └── 5% Reserve
      ↓
    Payout → Reconciliation/Audit
```

Kashier processes the external payment. MR-XSteroid controls the internal commercial and financial model. 85/10/5 and Payout Architecture remain ACTIVE. No security/accounting/reconciliation/governance protection may be weakened.

---

# 27) START CONDITION

Start ONLY with PHASE 1 — DISCOVERY & DOCUMENTATION VERIFICATION. Deliver K-2 first. Do not begin Phase 2 until K-2 reviewed and approved by owner. On conflict → STOP + Conflict Evidence Card + WAIT for owner decision.

---

---

# PAYMENT CATALOG & ROUTING GOVERNANCE

> This entire section is MANDATORY. Every sub-section is a locked governance rule.

---

## 28) NON-NEGOTIABLE ARCHITECTURAL PRINCIPLE

```text
SUPABASE / MR-XSTEROID WEBSITE
        =
CANONICAL SOURCE OF TRUTH
```

```text
KASHIER
        =
PAYMENT PROCESSING + OPERATIONAL PAYMENT-SIDE REPRESENTATION
```

The internal MR-XSteroid / Supabase system is the canonical source for:

- Products
- Product identity
- Product slug
- Product metadata
- Product status
- Prices
- Regional prices
- Orders
- Order status
- Invoice
- PaymentIntent
- Affiliate attribution
- Affiliate commission
- 85/10/5 ledger
- Reconciliation
- Entitlements
- Fulfillment
- Payout
- Analytics
- Revenue reporting

Kashier is:

- Payment processor
- Merchant payment layer
- Payment session provider
- Payment-link/page provider (when needed)
- Payment-method provider
- Payment-side product mapping layer
- Webhook source

**It is forbidden to treat Kashier as the final source of commercial truth for products, prices, or orders.**

---

## 29) CANONICAL PRODUCT MODEL

There MUST NOT be six logical products.

```text
3 CANONICAL PRODUCTS ONLY
```

| Canonical Product | Egypt Price |
|---|---:|
| MRX-PROTOCOL (Protocol / البروتوكول الرقمي) | 499 EGP |
| MRX-TACTICAL (Tactical / الباقة التكتيكية) | 749 EGP |
| MRX-SMART-PRO (Smart Professional / المحترف الذكي) | 10,848 EGP |

Do NOT create:

```
Protocol Egypt
Protocol Global
Tactical Egypt
Tactical Global
Smart Pro Egypt
Smart Pro Global
```

as independent logical products.

Instead:

```text
ONE PRODUCT
    ↓
REGIONAL PRICE CONFIGURATION
```

---

## 30) REGIONAL PRICING MODEL

A product MUST support:

```text
Product
 ├── Egypt Price
 └── Global Price
```

NOT:

```text
Product Egypt
Product Global
```

Example:

```text
MRX-PROTOCOL
 ├── Egypt = 499 EGP
 └── Global = USD_PRICE_1

MRX-TACTICAL
 ├── Egypt = 749 EGP
 └── Global = USD_PRICE_2

MRX-SMART-PRO
 ├── Egypt = 10,848 EGP
 └── Global = USD_PRICE_3
```

Do not invent USD prices. Use:

```
USD_PRICE_1
USD_PRICE_2
USD_PRICE_3
```

or equivalent configuration placeholders until prices are officially determined.

---

## 31) SKU ARCHITECTURE

### Canonical Internal SKUs

```
MRX-PROTOCOL
MRX-TACTICAL
MRX-SMART-PRO
```

### Kashier Merchant Mapping

#### Egypt

```
MRX-EG-PROTOCOL
MRX-EG-TACTICAL
MRX-EG-SMART-PRO
```

#### Global

```
MRX-GL-PROTOCOL
MRX-GL-TACTICAL
MRX-GL-SMART-PRO
```

The design MUST make clear:

```text
KASHIER SKU ≠ CANONICAL PRODUCT
```

Instead:

```text
KASHIER SKU
      ↓
MAPPING
      ↓
CANONICAL PRODUCT
```

---

## 32) PRODUCT DATA MODEL

The data architecture MUST support at minimum:

```text
products
-------------------------
id
slug
name_ar
name_en
description_ar
description_en
active
created_at
updated_at
```

```text
product_prices
-------------------------
id
product_id
region
currency
amount
active
created_at
updated_at
```

Where:

```text
region:  EGYPT | GLOBAL
currency: EGP | USD
```

```text
merchant_configs
-------------------------
id
region
merchant_id
currency
mode
payment_api_key_ref
secret_key_ref
webhook_verification_ref
active
created_at
updated_at
```

The Egypt credentials MUST NOT be used for Global verification, and vice versa.

---

## 33) KASHIER MAPPING TABLE

```text
kashier_product_mappings
--------------------------------
id
product_id
region
kashier_product_id
kashier_payment_page_id
kashier_payment_link_id
active
created_at
updated_at
```

The system MUST allow an independent mapping for each:

```text
Product
+ Region
+ Merchant
+ Kashier representation
```

The mapping itself MUST NOT be treated as the canonical product.

---

## 34) PAYMENT CATALOG ARCHITECTURE

```text
MR-XSteroid
│
└── Digital Products
      │
      ├── Protocol
      ├── Tactical
      └── Smart Professional
```

In the future, the internal system can support:

```text
Digital Products
├── Books
├── Bundles
└── Future Products
```

But:

**Do NOT create Kashier Categories merely because they exist on the website.**

Creating any Category in Kashier MUST have a clear operational reason. Kashier is NOT a complete copy of the website taxonomy.

---

## 35) PRIMARY CHECKOUT ARCHITECTURE

The primary payment flow:

```text
Product
   ↓
Checkout
   ↓
Server creates Order
   ↓
Invoice
   ↓
PaymentIntent
   ↓
Affiliate Attribution
   ↓
Merchant Resolver
   ↓
Region Resolver
   ↓
Currency Resolver
   ↓
Kashier Payment Session
   ↓
Customer Payment
   ↓
Verified Webhook
   ↓
PaymentIntent SUCCESS
   ↓
Ledger
   ↓
Fulfillment
   ↓
Entitlement
   ↓
Payout
```

Payment Session MUST be the primary path for ecommerce checkout.

---

## 36) PAYMENT SESSION AS PRIMARY MECHANISM

The Primary Checkout MUST rely on:

```text
Kashier Payment Session
```

NOT hardcoded payment URLs.

Every Session MUST be internally linked to:

```text
Order
Invoice
PaymentIntent
Idempotency Key
Affiliate Attribution
Region
Currency
Merchant
Product
Price Snapshot
```

---

## 37) EGYPT PAYMENT ARCHITECTURE

When the system determines the customer is an Egypt checkout:

```text
Product
   ↓
Order
   ↓
Invoice
   ↓
PaymentIntent
   ↓
Merchant Resolver
   ↓
EGYPT
   ↓
Egypt MID
   ↓
EGP
   ↓
Kashier Payment Session
```

Egypt Checkout configuration:

```text
currency = EGP
allowedMethods = card,wallet
defaultMethod = card
```

The application MUST verify the actual Merchant capabilities and MUST NOT assume that any payment method visible in Test mode will be available in Live.

---

## 38) EGYPT WALLET GOVERNANCE

```text
WALLET ≠ PRODUCT
WALLET ≠ CATEGORY
WALLET ≠ CURRENCY
```

Instead:

```text
WALLET = PAYMENT METHOD
```

Therefore:

```text
Egypt Checkout
    ↓
EGP
 ├── Card
 └── Wallet
```

Do NOT create:

```
Wallet Product
Wallet Category
Vodafone Cash Product
Mobile Wallet SKU
```

merely because Wallet is available as a payment method.

Any Wallet implementation MUST remain within the Payment Method layer.

---

## 39) GLOBAL PAYMENT ARCHITECTURE

When checkout is Global:

```text
Product
   ↓
Order
   ↓
Invoice
   ↓
PaymentIntent
   ↓
Merchant Resolver
   ↓
GLOBAL
   ↓
Global MID
   ↓
USD
   ↓
Kashier Payment Session
```

The rule:

```text
Global MID → USD
```

It MUST NOT become:

```text
Egypt MID + USD
```

or:

```text
Global MID + EGP
```

unless explicitly adopted in the future under a new architecture.

Current target:

```text
Egypt = Egypt Merchant + EGP
Global = Global Merchant + USD
```

---

## 40) GLOBAL PAYMENT METHODS

The current Global architecture MUST consider:

```text
Card
```

as the primary method.

Do NOT add:

```
Wallet
BNPL
Bank Transfer
Alternative Payment Methods
```

unless ALL of the following are completed:

1. Verified support on Global MID.
2. Verified Live capability.
3. Updated Payment Method configuration.
4. Updated UI/UX.
5. Updated backend validation.
6. Updated reconciliation.
7. Documented the new payment method.

---

## 41) PAYMENT LINK GOVERNANCE

Payment Links are NOT the primary ecommerce checkout.

```text
SECONDARY PAYMENT CHANNEL
```

Valid uses:

```text
Direct Sales
Manual Sales
Marketing Campaigns
WhatsApp Sales
Emergency Payment
Backup Checkout
Special Campaign Links
```

MUST remain a separate layer from Primary Checkout.

### Egypt Payment Links

```
EG-PROTOCOL-499
EG-TACTICAL-749
EG-SMART-10848
```

### Global Payment Links

```
GL-PROTOCOL-USD
GL-TACTICAL-USD
GL-SMART-USD
```

Do not invent USD prices until they are officially determined.

---

## 42) PAYMENT LINK FINANCIAL MODEL

Do NOT build the Global architecture on:

```text
Egypt MID + USD_VIRTUAL
```

The required architecture:

```text
Global Buyer
    ↓
Global Merchant
    ↓
USD
```

NOT:

```text
Global Buyer
    ↓
Egypt Merchant
    ↓
USD Virtual
    ↓
EGP Settlement
```

Old paths may be kept only for historical or operational needs, but they MUST NOT become the primary path for the new system.

---

## 43) PAYMENT PAGE GOVERNANCE

Payment Pages are:

```text
SECONDARY / MARKETING / MANUAL CHECKOUT LAYER
```

NOT:

```text
PRIMARY ECOMMERCE SOURCE OF TRUTH
```

Valid uses:

```text
Campaigns
Special offers
Manual sales
Marketing funnels
Backup checkout
```

They MUST NOT bypass:

```text
Order
Invoice
PaymentIntent
Affiliate Attribution
Ledger
Reconciliation
Fulfillment
```

If a Payment Page exists outside the primary path and generates a transaction directly, there MUST be a reconciliation and linkage mechanism to the canonical product/order model.

---

## 44) URL ARCHITECTURE

URLs MUST NOT contain prices.

Forbidden:

```
/checkout/protocol-499
/pay/499
/pay/protocol-749
```

Use instead:

```
/en/products/protocol
/ar/products/protocol
```

and:

```
/en/checkout/protocol
/ar/checkout/protocol
```

The backend is responsible for:

```text
Region
Merchant
Currency
Price
Payment Method
```

---

## 45) SAME PRODUCT, DIFFERENT PAYMENT ROUTING

The same product page CAN serve Egypt and Global customers.

Example:

```text
mrxsteroid.com/ar/checkout/protocol
```

The backend decides:

### Egypt:

```text
499 EGP
Egypt MID
Card
Wallet
```

### Global:

```text
USD_PRICE_1
Global MID
Card
```

Pages MUST NOT be created separately merely because of different Merchant routing.

---

## 46) REGION DETECTION

Do not make IP the sole financial authority.

IP/Geo Detection MUST be:

```text
ROUTING HINT
```

NOT:

```text
FINAL FINANCIAL AUTHORITY
```

Proposed architecture:

```text
IP / Geo Detection
        ↓
Initial Region Guess
        ↓
Checkout Context
        ↓
Country / Billing Context
        ↓
Server-Side Merchant Resolver
        ↓
Final Region
        ↓
Final Merchant
        ↓
Final Currency
        ↓
Final Price
```

The client MUST NOT be able to send trusted values such as:

```text
merchantId
currency
amount
region
```

and have the backend treat them as authoritative.

---

## 47) PRICE SECURITY

NEVER trust:

```text
client-side price
client-side currency
client-side merchant
client-side commission
```

The final amount MUST originate from:

```text
Product
+ Region
+ Active Price
+ Server-side rules
```

Then store:

```text
price_snapshot
currency_snapshot
region_snapshot
merchant_snapshot
```

inside Order / PaymentIntent context to prevent price changes after order creation.

---

## 48) AFFILIATE COMPATIBILITY

This update MUST NOT break the Affiliate architecture.

The following MUST remain intact:

```text
Affiliate
   ↓
Attribution
   ↓
Order
   ↓
PaymentIntent
   ↓
Successful Payment
   ↓
Commission
```

With preserved:

```text
Referral Code
Affiliate ID
Commission
Custom Commission Override
```

Affiliate MUST link to the canonical order/product, not solely to the Kashier object.

---

## 49) 85/10/5 LEDGER MUST REMAIN

The 85/10/5 architecture MUST be preserved.

```text
85%
10%
5%
```

Adding Payment Catalog & Routing Governance MUST NOT delete or redefine this system.

```text
Payment SUCCESS
       ↓
Ledger Calculation
       ↓
85 / 10 / 5
       ↓
Reconciliation
       ↓
Fulfillment
       ↓
Payout
```

Kashier is NOT the Ledger.
Kashier is NOT the Payout Engine.
Kashier is NOT the Affiliate Engine.
Kashier is NOT the Accounting Source of Truth.

---

## 50) WEBHOOK ARCHITECTURE

The webhook is a fundamental part of the architecture:

```text
Kashier
    ↓
Verified Webhook
    ↓
Payment Verification
    ↓
PaymentIntent State Update
    ↓
Order State Update
    ↓
Ledger
    ↓
Fulfillment
```

Required capabilities:

```text
Signature Verification
Idempotency
Replay Protection
Duplicate Event Handling
Event Logging
Audit Trail
Merchant-aware Verification
```

The verification configuration MUST differ between:

```text
Egypt Merchant
Global Merchant
```

A single secret MUST NOT be used to verify both.

---

## 51) MERCHANT RESOLVER

An explicit Merchant Resolver layer MUST exist.

Its function: determine

```text
Region
Merchant
Currency
Payment Methods
Kashier Configuration
```

Example:

```text
resolvePaymentContext()
```

Returns conceptually:

```text
{
  region: "EGYPT",
  merchant: "EGYPT_MID",
  currency: "EGP",
  paymentMethods: ["card", "wallet"],
  price: 499,
  product: "MRX-PROTOCOL"
}
```

or:

```text
{
  region: "GLOBAL",
  merchant: "GLOBAL_MID",
  currency: "USD",
  paymentMethods: ["card"],
  price: USD_PRICE_1,
  product: "MRX-PROTOCOL"
}
```

Sensitive values MUST come server-side.

---

## 52) KASHIER AUDIT BEFORE ANY DELETION

Before any of:

```text
Delete
Rename
Unpublish
Create
Change Price
Change Currency
Change Merchant
```

a KASHIER AUDIT MUST be executed.

The audit covers:

```text
Merchant
Products
Categories / Sections
Payment Links
Payment Pages
Payment Requests
Invoices
Payment Methods
Webhook
Test Configuration
Live Configuration
```

For each item, record:

```text
ID
Name
Type
Price
Currency
Merchant
State
Published?
Active?
Duplicate?
Mapped to website?
Referenced by code?
Used in campaign?
Used historically?
Used by customer?
Has transactions?
Has successful transactions?
Has pending transactions?
Has refunds?
Has affiliate attribution?
```

---

## 53) DELETION PROTECTION RULE

Nothing in Kashier MUST be deleted merely because the new architecture does not need it.

Do NOT delete:

```text
Product
Payment Link
Payment Page
Category
Merchant mapping
Historical configuration
```

until ALL of the following are confirmed:

```text
Ownership
References
Historical Usage
Website Mapping
Payment Status
Campaign Usage
Financial Impact
Reconciliation Impact
Affiliate Impact
```

---

## 54) MIGRATION DECISION ENGINE

For every item in Kashier, exactly one decision MUST be reached:

```text
KEEP
CHANGE
UNPUBLISH
ARCHIVE
DELETE
CREATE
```

A decision MUST NOT be made automatically without evidence.

Create the matrix:

| Item | ID | Merchant | Currency | Price | Website Ref | Historical Usage | Decision | Reason |
|------|----|----------|----------|------:|-------------|------------------|----------|--------|

The system MUST NOT execute deletion based on name alone.

---

## 55) PAYMENT PAGE SAFE CLEANUP

If a Payment Page exists but is unsuitable for the primary path:

Priority:

```text
UNPUBLISH
```

before:

```text
DELETE
```

Final deletion occurs ONLY after verification that there is NO:

```text
Website Reference
Campaign Reference
Customer Access
Historical Dependency
Financial Dependency
```

---

## 56) PRODUCT NAME GOVERNANCE

Current product names in Kashier MUST NOT be changed automatically.

New Products MUST NOT be created merely to make Egypt/Global copies.

The rule:

```text
NO NAME CHANGE
NO NEW PRODUCT
NO PRICE CHANGE
```

until ALL of the following are completed:

```text
AUDIT
+ DOCUMENTED CONFLICT
+ EXPLICIT MIGRATION DECISION
```

---

## 57) SOURCE-OF-TRUTH HIERARCHY

The priority:

```text
1. Supabase / Application Domain Model
2. Order / Invoice / PaymentIntent
3. Server-side Price Resolution
4. Merchant Resolver
5. Kashier Payment Session
6. Kashier Product / Link / Page Mapping
```

The order MUST NOT be reversed.

---

## 58) PAYMENT OBJECT RELATIONSHIP

The required relationship:

```text
Canonical Product
       ↓
Regional Price
       ↓
Order
       ↓
Invoice
       ↓
PaymentIntent
       ↓
Merchant Resolver
       ↓
Kashier Session
       ↓
Kashier Transaction
       ↓
Verified Webhook
       ↓
Payment Success
```

Links between systems MUST be preserved:

```text
internal_order_id
internal_payment_intent_id
kashier_session_id
kashier_transaction_id
merchant_id
region
currency
amount
```

---

## 59) RECONCILIATION REQUIREMENTS

The system MUST be able to reconcile between:

```text
Internal Order
Internal PaymentIntent
Kashier Session
Kashier Transaction
Webhook Event
Ledger
Payout
```

Any payment that cannot be clearly linked MUST enter:

```text
RECONCILIATION EXCEPTION
```

and MUST NOT be automatically treated as revenue, commission, or fulfillment.

---

## 60) FULFILLMENT SECURITY

Product delivery MUST NOT be triggered by:

```text
Frontend Success
Redirect Success
Payment Page Visit
URL parameter
Client-side state
```

It MUST be triggered by:

```text
Verified Payment Success
```

through backend/webhook/reconciliation logic.

---

## 61) PAYMENT STATE MACHINE

The system MUST represent:

```text
CREATED
PENDING
PROCESSING
PAID
FAILED
CANCELLED
EXPIRED
REFUNDED
PARTIALLY_REFUNDED
REQUIRES_RECONCILIATION
```

```text
Kashier status
```

MUST be separated from:

```text
Internal payment status
```

with a clear mapping between them.

---

## 62) PRODUCT ARCHITECTURE MUST SUPPORT FUTURE SCALE

The schema MUST NOT be limited to 3 products.

The current canonical products are:

```text
3
```

The architecture MUST allow future support for:

```text
New Products
Bundles
Books
Subscriptions
Digital Goods
Future Regions
Future Merchants
Future Currencies
```

without breaking:

```text
Orders
Affiliate
Ledger
Reconciliation
Fulfillment
SEO
Analytics
```

---

## 63) SEO COMPATIBILITY

Regional routing MUST NOT create unnecessary duplicate products.

Preserved:

```text
Canonical Product Identity
Stable Slugs
Language-aware URLs
```

Example:

```
/en/products/protocol
/ar/products/protocol
```

Price differences MUST be server-side, not via new canonical products per region.

---

## 64) ANALYTICS COMPATIBILITY

Analytics MUST record:

```text
product_id
region
currency
price
merchant
payment_method
order_id
payment_intent_id
affiliate_id
campaign_id
```

This enables analysis of:

```text
Egypt vs Global
EGP vs USD
Card vs Wallet
Direct vs Affiliate
Payment Link vs Primary Checkout
```

without duplicating product identity.

---

## 65) GOVERNANCE RULE FOR KASHIER CATALOG

A Kashier Product is a:

```text
representational object
```

NOT a:

```text
Canonical Business Product
```

Therefore, a single product:

```text
MRX-PROTOCOL
```

CAN have:

```text
Egypt Kashier Mapping
Global Kashier Mapping
```

while keeping a single:

```text
product_id
```

within the system.

---

## 66) FINAL PAYMENT TOPOLOGY

The final architecture:

```text
                       MR-XSTEROID / SUPABASE
                                │
                       CANONICAL PRODUCTS
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
              EGYPT                          GLOBAL
                 │                             │
               EGP                            USD
                 │                             │
             Egypt MID                     Global MID
                 │                             │
          Card + Wallet                       Card
                 │                             │
                 └──────────────┬──────────────┘
                                │
                             KASHIER
                                │
                         PAYMENT SESSION
                                │
                      VERIFIED WEBHOOK
                                │
                       PAYMENT SUCCESS
                                │
                        PAYMENT LEDGER
                                │
                            85 / 10 / 5
                                │
                           RECONCILIATION
```
