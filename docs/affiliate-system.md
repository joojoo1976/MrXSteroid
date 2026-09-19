# Production-Ready Affiliate & Referral System Architecture

## 1. Architecture Overview

The Mr. X Steroid Affiliate & Referral System provides an end-to-end, multi-tier commission lifecycle with double-layer attribution, atomic financial transactions, and immutable audit logs.

```
Visitor clicks Referral Link (?ref=ABC123)
               │
               ▼
   GET /api/referral/track
   ├── Validates referral code in DB
   ├── Sets 60-Day HttpOnly First-Party Cookie (mrx_ref)
   └── Persists server-side in `affiliate_attributions` (if user is authenticated)
               │
               ▼
     User Creates Checkout / Order
   ├── Server inspects DB attribution (Priority 1) or Cookie (Priority 2)
   ├── Blocks Self-Referral (purchaser user_id === affiliate user_id)
   └── Stamps `invoices.affiliate_id` and `invoices.referral_code`
               │
               ▼
      Kashier Payment Gateway
   ├── Customer completes payment
   └── Gateway posts webhook to /api/webhooks/kashier or /api/payments/webhook
               │
               ▼
   Verified Webhook Processing (Dual-Mode)
   ├── HMAC-SHA256 signature verification (Payment API Key)
   ├── Deduplication via `webhook_events` (provider + provider_event_id)
   ├── Replay & Late-Arrival Guards
   └── `applyProviderVerdict` execution:
         ├── Activates subscription / entitlements
         ├── Triggers `triggerAffiliateCommission` (non-blocking)
         ├── Evaluates monthly qualified sales count (UTC boundary)
         ├── Resolves Tier (Bronze 25%, Silver 35%, Gold 45%, Custom)
         ├── Calls atomic RPC `affiliate_create_commission`:
         │     ├── SELECT FOR UPDATE (row lock on affiliates)
         │     ├── Inserts `referrals` row (immutable rates)
         │     ├── Inserts `affiliate_commission_ledger` entry
         │     ├── Updates affiliate `current_balance` & counters
         │     └── Writes `affiliate_audit_logs`
         └── Freezes revenue splits & financial ledger journals
```

---

## 2. Database Schema

The database model is strictly audited and reinforced with PostgreSQL constraints, foreign keys, and indexes:

### 2.1 `affiliates`
- `id` (UUID, PK, `gen_random_uuid()`)
- `user_id` (UUID, UNIQUE, FK `auth.users(id) ON DELETE CASCADE`)
- `referral_code` (TEXT, UNIQUE, Indexed)
- `status` (TEXT, CHECK `status IN ('pending','active','suspended','disabled')`)
- `custom_commission_rate` (NUMERIC(5,2), CHECK `0 <= rate <= 100`)
- `current_balance` (NUMERIC(12,2), DEFAULT 0, CHECK `current_balance >= 0`)
- `lifetime_earnings` (NUMERIC(12,2), DEFAULT 0, CHECK `lifetime_earnings >= 0`)
- `total_referrals` (INT, DEFAULT 0, CHECK `total_referrals >= 0`)
- `total_paid_referrals` (INT, DEFAULT 0, CHECK `total_paid_referrals >= 0`)
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2.2 `affiliate_attributions`
- `id` (UUID, PK)
- `user_id` (UUID, FK `auth.users(id) ON DELETE CASCADE`, Nullable)
- `session_id` (TEXT, Nullable fallback fingerprint)
- `affiliate_id` (UUID, FK `affiliates(id) ON DELETE CASCADE`)
- `referral_code` (TEXT)
- `attribution_source` (TEXT, CHECK `'url_param','cookie','admin','server'`)
- `attributed_at` (TIMESTAMPTZ, DEFAULT now())
- `expires_at` (TIMESTAMPTZ, CHECK `expires_at > attributed_at`)
- `attribution_used` (BOOLEAN, DEFAULT false)
- `used_at` (TIMESTAMPTZ)
- `invoice_id` (UUID, FK `invoices(id)`)

### 2.3 `referrals`
- `id` (UUID, PK)
- `affiliate_id` (UUID, FK `affiliates(id) ON DELETE RESTRICT`)
- `invoice_id` (UUID, UNIQUE index for approved rows, FK `invoices(id) ON DELETE SET NULL`)
- `customer_user_id` (UUID, FK `auth.users(id) ON DELETE SET NULL`)
- `referral_code` (TEXT)
- `amount` (NUMERIC(12,2))
- `currency` (TEXT)
- `commission_base_amount` (NUMERIC(12,2))
- `commission_rate` (NUMERIC(5,2))
- `commission_amount` (NUMERIC(12,2))
- `tier` (TEXT, CHECK `'bronze','silver','gold','custom'`)
- `status` (TEXT, CHECK `'pending','approved','reversed','chargeback','refunded'`)
- `attribution_source` (TEXT)
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2.4 `affiliate_commission_ledger` (Append-Only)
- `id` (UUID, PK)
- `affiliate_id` (UUID, FK `affiliates(id) ON DELETE RESTRICT`)
- `referral_id` (UUID, FK `referrals(id) ON DELETE SET NULL`)
- `transaction_type` (TEXT, CHECK `'commission','refund','partial_refund','chargeback','reversal','manual_adjustment','bonus','payout'`)
- `amount` (NUMERIC(12,2))
- `currency` (TEXT)
- `balance_after` (NUMERIC(12,2))
- `reference_id` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMPTZ)

### 2.5 `affiliate_audit_logs` (Immutable)
- `id` (UUID, PK)
- `affiliate_id` (UUID, FK `affiliates(id)`)
- `actor_id` (UUID)
- `actor_type` (TEXT, CHECK `'system','admin','affiliate'`)
- `event_type` (TEXT)
- `payload` (JSONB)
- `created_at` (TIMESTAMPTZ)

### 2.6 `webhook_events` (Deduplication)
- `id` (UUID, PK)
- `provider` (TEXT)
- `provider_event_id` (TEXT)
- `invoice_id` (UUID)
- `status` (TEXT, CHECK `'pending','processed','failed','duplicate','skipped'`)
- `payload_hash` (TEXT)
- CONSTRAINT: `UNIQUE (provider, provider_event_id)`

---

## 3. Attribution Logic

1. **Double-Layer Tracking**:
   - **First-Party Cookie**: `mrx_ref` (HttpOnly, Secure, SameSite=Lax, Max-Age: 60 days).
   - **Database Store**: `affiliate_attributions` table records attribution server-side for authenticated visitors, persisting across devices or private browsing modes.
2. **Attribution Priority**:
   - At checkout, the order processor checks the user's DB attribution first (`resolve_active_attribution` RPC).
   - If missing or unauthenticated, it falls back to the server-parsed cookie.
3. **Last Valid Affiliate Attribution**:
   - Revisiting a referral link from a different affiliate updates both the cookie and the active DB attribution record.
4. **Self-Referral Prevention**:
   - If the purchasing user matches the affiliate's registered `user_id`, attribution is stripped before invoice creation (`isSelfReferral`). The checkout completes normally, but no referral or commission is generated.

---

## 4. Commission Rules & Tiers

Commission is calculated exclusively by the pure, side-effect-free engine `calculateCommission` in `server/affiliate/commissionEngine.ts`:

- **Commission Base**:
  $$\text{Commission Base} = \max(0, \text{Product Subtotal} - \text{Discount Amount})$$
  *(Shipping charges NEVER earn commission).*
- **Tier Structure (UTC Calendar Month Boundaries)**:
  - **Bronze**: 1–10 qualified paid sales $\rightarrow$ **25%**
  - **Silver**: 11–50 qualified paid sales $\rightarrow$ **35%**
  - **Gold**: 51+ qualified paid sales $\rightarrow$ **45%**
  - **Custom**: Takes absolute priority over monthly tiers when `custom_commission_rate` is assigned.
- **Qualified Sales**:
  - Excludes pending, failed, cancelled, refunded, chargeback, or test invoices.
- **Precision & Immutability**:
  - Rounded to 2 decimal places using half-up Banker's rounding.
  - Recorded commission rates in `referrals` are immutable and preserved historically even if the affiliate changes tiers later.

---

## 5. Kashier Webhook & Verification

Endpoints:
- `POST /api/webhooks/kashier`
- `POST /api/payments/webhook`

Security Flow:
1. **Raw Body HMAC-SHA256**:
   - Sorted payload keys hashed using `Payment API Key` with URI encoding.
2. **Deduplication**:
   - `webhook_events` enforces `UNIQUE(provider, provider_event_id)`. Duplicates return HTTP 200 immediately with no mutations.
3. **Replay Guard**:
   - Signals such as `ORDER_PAID_BEFORE` or `event: "idempotency"` acknowledge with 200 without executing financial transactions.
4. **Amount Verification**:
   - Gateway paid amount must match the invoice database record before activation.
5. **Failure Isolation**:
   - Commission trigger errors or split freeze errors are isolated and non-fatal, ensuring the core order payment remains successful.

---

## 6. Refunds, Partial Refunds & Chargebacks

1. **Full Refund**:
   - `reversalAmount = commission_amount`
   - Referral status $\rightarrow$ `reversed` / `refunded`
   - Negative ledger entry posted.
2. **Partial Refund**:
   - Proportion calculated: $\text{Reversal} = \text{Commission} \times (\text{Refund Amount} / \text{Invoice Total})$.
   - Referral status remains `approved` with fractional reversal logged.
3. **Chargeback**:
   - Referral status $\rightarrow$ `chargeback`.
   - Full commission deducted from balance. Balance floored at 0 via database constraints (`CHECK current_balance >= 0`).

---

## 7. Row Level Security (RLS) & Security Posture

| Table | SELECT Policy | INSERT / UPDATE / DELETE Policy |
| :--- | :--- | :--- |
| `affiliates` | User views own (`auth.uid() = user_id`) or Admin | Service Role / Admin only |
| `affiliate_attributions` | User views own (`auth.uid() = user_id`) or Admin | Service Role / Admin only |
| `referrals` | Affiliate views own or Admin | Service Role / Admin only |
| `affiliate_commission_ledger` | Affiliate views own or Admin | Append-only: No UPDATE/DELETE |
| `affiliate_audit_logs` | Admin only | Service Role / Admin only |
| `webhook_events` | Admin only | Service Role / Admin only |

Zero-Trust Rules:
- Client never supplies commission rate, balance, or order amounts.
- `SUPABASE_SERVICE_ROLE_KEY` is strictly server-side.
- All rate-limited endpoints use Upstash Redis with in-memory fallback.

---

## 8. Environment Variables

```env
# Required for Affiliate System
NEXT_PUBLIC_SITE_URL=https://www.mrxsteroid.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Upstash Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 9. Testing & Verification

Run the comprehensive test suites:

```bash
# Unit & Calculation Tests
npm run test:unit tests/unit/commissionEngine.test.ts

# Attribution & Expiration Tests
npm run test:unit tests/unit/attribution.test.ts

# Webhook & Reversal Integration Tests
npm run test:unit tests/unit/affiliateWebhookIntegration.test.ts

# API Security & Tampering Defense
npm run test:unit tests/security/affiliateSecurity.test.ts

# High-Contention & Concurrency Tests
npm run test:unit tests/adversarial/affiliateConcurrency.test.ts

# Full Test Suite
npm run test:unit
```

---

## 10. Deployment & Troubleshooting

### Deployment Steps:
1. Apply migrations in order via Supabase CLI or Dashboard:
   - `supabase/migrations/20260919120000_affiliate_attributions_table.sql`
   - `supabase/migrations/20260919121000_affiliate_security_hardening.sql`
2. Ensure environment variables are loaded in production.
3. Build and deploy: `npm run build` followed by deployment to Vercel.

### Rollback Plan:
- Migrations are strictly non-destructive and additive (new tables, indexes, and additive constraints).
- To revert RLS policies, re-run baseline policies from `20260910222000_create_affiliates.sql`.

### Troubleshooting:
- **Commission not triggering on paid order**: Check that the invoice has `affiliate_id` and `referral_code` populated. Ensure the payment gateway sent a verified webhook matching the invoice amount.
- **Self-referral logged but no commission**: Normal behavior. Check `affiliate_audit_logs` for `self_referral_blocked` event.
