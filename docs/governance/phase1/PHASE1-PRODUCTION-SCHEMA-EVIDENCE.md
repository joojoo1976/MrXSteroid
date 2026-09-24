# Phase 1 — Production Schema Evidence & Migration Readiness

**Date:** 2026-09-24 · **Scope:** READ-ONLY audit of production Supabase (project `alghvtpkpspnqupbvodu`)
**Authority:** Owner directive — P1–P9 read-only + data-compat + consumer inventory before any SQL. No migration, no code, no commit/push from this run.
**Artifacts (local only, git-ignored):** `tmp/phase1-evidence.json`, `tmp/phase1-rest-evidence.json`, `tmp/phase1-rest-evidence-2.json`, `tmp/phase1-rest-evidence-3.json`, probes `tmp/phase1-*.cjs`.

---

## 0. Access path & method (and why)

| Path attempted | Result |
|---|---|
| Direct DB `db.<ref>.supabase.co:5432` | **Unreachable** — host has an **AAAA (IPv6) record only**; this machine has no IPv6 route (`ENETUNREACH`). Confirms new-architecture project. |
| Supavisor pooler (`aws-0-*` / `aws-1-*`, ports 5432 & 6543, 15 regions probed) | **`tenant/user not found`** in every region probed → pooler path unavailable for this ref. |
| **PostgREST over HTTPS/IPv4** (`/rest/v1/`, service-role key, GET/HEAD only) | **WORKS** — used for all evidence below. |

**Read-only guarantee:** by construction — only HTTP GET/HEAD; zero writes possible. **What REST cannot observe** (recorded as BLOCKED, not assumed): `pg_constraint`, `pg_index`, `pg_policy`/RLS, `pg_trigger`, role grants, and the applied-migrations list (`supabase_migrations` schema is not exposed via PostgREST).

---

## 1. P1–P9 results

| # | Precondition | Status | Evidence |
|---|---|---|---|
| P1 | `public.orders` exists, correct shape | **CONFIRMED** | 13 columns, `id uuid` PK, all other columns nullable (PostgREST OpenAPI + generated types `shared/types/db_types.ts:285`). |
| P2 | `status` vocab unconstrained | **CONFIRMED — constrained** | Type `text`; production **has** `orders_status_check` (validated): `pending | pending_manual_review | processing | shipped | delivered | cancelled | refunded`. **`completed` and `confirmed` are NOT allowed** (see NC-1). |
| P3 | `amount numeric` nullable | **CONFIRMED** | `amount:numeric`, nullable. |
| P4 | `items jsonb` nullable | **CONFIRMED** | `items:jsonb`, nullable, default `'[]'`. |
| P5 | No blocking FKs on `orders` | **CONFIRMED** | Indexes (direct): `orders_pkey` (id), `orders_created_at_idx` (created_at DESC), `orders_user_id_idx` (user_id). No `lower(email)` index → design X4 still required. FKs: `id` PK, `user_id → auth.users(id)`. |
| P6 | RLS posture known | **CONFIRMED** | RLS enabled, not forced. 3 policies: "Users can view own orders" (`r`: `auth.uid()=user_id OR is_admin() OR is_representative()`), "Admins can update all orders" (`w`: `is_admin()`), "Users create own orders" (`a`: `auth.uid()=user_id OR user_id IS NULL`). **No** DELETE policy. |
| P7 | Linkability to payment spine | **CONFIRMED** | `payment_receipts` = 0 rows. Kashier spine FKs via OpenAPI: `payment_intents.invoice_id → invoices`, `webhook_events.payment_intent_id → payment_intents`. **`orders` is referenced only by `delivery_assignments` and `payment_receipts` (ON DELETE CASCADE).** `payments` has **no** FK to `orders` (design-doc note corrected — NC-2). |
| P8 | Constraint inventory | **CONFIRMED** | Full set: PK, FK, CHECK (`orders_status_check`) — all validated. Applied-migrations catalog captured (see §11). |
| P9 | Consumer inventory complete | **CONFIRMED** | 8 consumers mapped in §5 (static code analysis, this repo). |

---

## 2. Actual `orders` schema (production, via PostgREST OpenAPI)

```
orders  (rows: 0 — EMPTY)
  id          uuid                     PK, NOT NULL
  user_id     uuid                     nullable
  fullname    text                     nullable
  email       text                     nullable
  phone       text                     nullable
  address     text                     nullable
  city        text                     nullable
  country     text                     nullable
  postalcode  text                     nullable
  amount      numeric                  nullable
  status      text                     nullable
  items       jsonb                    nullable
  created_at  timestamptz              nullable
  updated_at  timestamptz              nullable
  Relationships: []  (no foreign keys)
```

Classification: matches repo migration `20260216174855_fix_orders_table.sql` — **not drift**; the recreated table is in place. **PRODUCTION-ONLY check for constraints/indexes is now CLOSED — see §11.**

**Confirmed production DDL (direct, 2026-09-24):** PK `id uuid` default `uuid_generate_v4()`; FK `user_id → auth.users(id)`; `status` default `'pending'` + CHECK `('pending','pending_manual_review','processing','shipped','delivered','cancelled','refunded')`; `items` default `'[]'`; `created_at`/`updated_at` default `now()`; indexes `orders_pkey`, `orders_created_at_idx (created_at DESC)`, `orders_user_id_idx`; RLS on; 3 policies; no triggers; inbound FKs from `delivery_assignments` + `payment_receipts` (CASCADE).

Sibling tables (counts, 2026-09-24): `payments` 5 · `payment_intents` 3 · `invoices` 65 · `refunds` 0 · `financial_ledger` 0 · `entitlements` 0 · `webhook_events` 0 · `reconciliation_runs` 0 · `payment_receipts` 0 · `order_splits` 0 · `split_rules` 0 · `beneficiaries` 0 · `payouts` 0 · `affiliates` 1 · `referrals` 0 · `affiliate_commission_ledger` 0 · `profiles` 11 · `products` 4 · `product_prices` 3 · `product_variants` 0 · `categories` 0 · `merchant_configs` 1 · `kashier_product_mappings` 3 · `instapay_config` 2 · `admin_settings` 15 · `fraud_rules` 3 · `fraud_decisions` 0 · `support_tickets` 0 · `audit_log` 0. **404 (missing or not exposed):** `affiliate_attributions`, `user_tool_logs`.

---

## 3. `admin_settings` evidence (15 rows, verbatim values)

| key | value | section |
|---|---|---|
| `currency` | `EGP` | general |
| `store_name` | `Mr. X Steroid` | general |
| `support_email` | *(empty string)* | general |
| `pricing_digital_egp` / `_usd` | `499` / `49.99` | general |
| `pricing_bundle_egp` / `_usd` | `749` / `72` | general |
| `pricing_coaching_egp` / `_usd` | `849` / `82` | general |
| `pricing_coaching_plus_egp` / `_usd` | `9999` / `200` | general |
| `pricing_tolerance` | `2` | general |
| `gateway_kashier` | `live` | gateways |
| `gateway_spaceremit` | `live` | gateways |
| `gateway_paymob` | `disabled` | gateways |

Related config: `merchant_configs` = 1 row `{region: EGYPT, merchant_id: MID-48761-625, currency: EGP, mode: **test**, active: true, *_key_ref: null}`. `instapay_config` = handle `jan.ghattas@instapay`, display `جان غطاس`. `kashier_product_mappings` = 3 active rows (region EGYPT): `MRX-EG-PROTOCOL`, `MRX-EG-TACTICAL`, `MRX-EG-SMART-PRO` — **`kashier_payment_page_id` and `kashier_payment_link_id` are NULL on all three** (consistent with Payment Sessions as the execution path; PL/PP columns unused).

> **CONFLICT C-1:** `admin_settings.gateway_kashier = live` while `merchant_configs.mode = test` (and all 3 `payment_intents` rows have `environment = test`). Gateway-state ambiguity must be resolved before go-live.
> **NOTE:** `support_email` is empty; 55 of 65 invoices are `paymob` while `gateway_paymob = disabled` (legacy data, all pending).

---

## 4. Existing data compatibility

| Table | Rows | Compatibility with 21 additive nullable `orders` columns |
|---|---|---|
| `orders` | **0** | **Trivially compatible** — no legacy rows, no backfill, no value collisions. The entire data-compat risk for `orders` is zero. |
| `payments` (legacy spaceremit) | 5 (all `pending`, all USD, metadata-carried customer fields) | Untouched by `orders` migration; separate table, separate shape (16 cols incl. `transaction_id`, `spaceremit_id`). |
| `invoices` | 65 (gateways: paymob 55 / stripe 7 / kashier 3; **status = payment_status = `pending` on all 65**; region: null 62 / egypt 2 / global 1; currency EGP 56 / USD 9; amount 49.99–13,983) | Untouched by `orders` migration. `invoices.region` NULL-heavy (95%) — any region-dependent reporting must tolerate NULL. |
| `payment_intents` | 3 (all kashier / `initiated` / test env; EGP 2, USD 1) | Untouched. |


---

## 5. `orders` consumers map (file → route/path → reads/writes → affected by Phase-1 additive columns?)

| # | File | Access | Op | Statuses written | Affected by additive nullable columns? |
|---|---|---|---|---|---|
| 1 | `app/api/checkout/instapay/route.ts` | server route | INSERT + DELETE (rollback) | `pending_manual_review` | No (explicit column list) |
| 2 | `app/api/admin/payment-receipts/[id]/route.ts` | server route (admin) | UPDATE `status` | `processing` (verified) / `cancelled` (rejected) | No |
| 3 | `supabase/functions/payment-webhook/index.ts` | edge function | UPDATE `status` (also writes `payments`) | `completed` | No |
| 4 | `features/admin/useAdminData.ts` | **browser** (admin) | SELECT `*` limit 500 | — | No (new columns just appear) |
| 5 | `legacy-pages/AdminDashboard.tsx` | **browser** | SELECT pending orders | — | No |
| 6 | `legacy-pages/MissionControl.tsx` | **browser** (admin) | UPDATE `status` via dropdown | `pending, processing, confirmed, shipped, delivered, cancelled, refunded` | No |
| 7 | `shared/lib/RealtimeSyncService.ts` | **browser** | UPSERT by id + realtime subscribe | arbitrary (pass-through) | **Watch** — generic upsert would carry new columns if present in payload |
| 8 | `shared/types/db_types.ts` | compile-time | generated types | — | Regenerate after migration |

No consumer selects explicit column lists that would break; all writes are explicit-column or pass-through. **No consumer conflicts with adding nullable columns.**

---

## 6. Status Compatibility Matrix (live vocab, evidence-based)

`orders.status` is written by **three different vocabularies today**:

| Producer | Writes | In admin dropdown? |
|---|---|---|
| InstaPay checkout (route #1) | `pending_manual_review` | **NO** — invisible to filter/dropdown |
| Spaceremit webhook (edge #3) | `completed` | **NO** — invisible to filter/dropdown |
| Receipts settle (route #2) | `processing`, `cancelled` | Yes |
| Admin dropdown (MissionControl `ORDER_STATUSES`) | `pending, processing, confirmed, shipped, delivered, cancelled, refunded` | — (defines UI truth) |

Reference vocabs elsewhere: `payments.status` (generated type union): `pending | processing | completed | failed | cancelled | refunded`. `payment_intents.status`: `initiated` (observed). `invoices.status`/`payment_status`: `pending` (observed, 65/65).

**Consequence already live in production:** any order written as `pending_manual_review` or `completed` cannot be selected from the admin status dropdown/filter. This is a pre-existing inconsistency, not caused by Phase 1.

**Proposal (unchanged from design, now evidence-backed):** split concerns —
- `orders.status` → **payment lifecycle only**: `pending_payment | paid | payment_failed | refunded | cancelled`

---

## 7. `source_channel` proposal

Distinct from **provider** (kashier / fourthwall / spaceremit), **merchant** (EG / INTL), **region** (egypt / global):

| value | meaning |
|---|---|
| `web_checkout` | first-party site checkout (Kashier session path) |
| `instapay_manual` | InstaPay transfer + receipt upload (manual review) |
| `fourthwall_storefront` | Fourthwall-hosted storefront order sync |
| `admin_manual` | created by admin from dashboard |
| `api_partner` | future partner/API-originated orders |

Vocabulary is closed (CHECK-constraint candidate), nullable at creation, backfill trivial (0 rows).

---

## 8. `fulfillment_status` proposal

New nullable text column (per §6): `unfulfilled | queued | processing | shipped | delivered | returned`. Bosta (Egypt) and DHL (global) adapters map their native statuses into this vocab at the webhook boundary; raw provider status is preserved in a `fulfillment_provider_status` passthrough field (pattern already proven by `payment_intents.provider_status`). **Deferred detail:** exact Bosta/DHL status-code mapping tables remain TV-2/TV-3 (provider contracts not yet verified).

---

## 9. M3b dependency map (why M3b stays DEFERRED)

M3b = revoke direct browser writes to `orders` / tighten RLS to server-only mutation. Blocked by live **browser-write** paths that must be replaced first:

| Browser path | Write kind | Replacement (designed, not built) |
|---|---|---|
| `MissionControl.tsx` status dropdown | UPDATE | `PATCH /api/admin/orders/[id]` (contract in PHASE1-API-WEBHOOK-CONTRACTS) |
| `RealtimeSyncService.syncOrderData` | UPSERT | server-side sync endpoint (not yet designed) |
| `useAdminData` / `AdminDashboard` | SELECT only | may remain if SELECT policy preserved |

M3b therefore depends on: (1) admin PATCH route implemented + UI rewired, (2) RealtimeSyncService write path retired or proxied, (3) only then RLS tightening. **M3b is NOT a Phase-1 migration-stage item.**

---

## 10. Corrections, conflicts & final verdict

**Correction to Phase 0:** local `.env` *does* contain `BOSTA_API_KEY`, `DHL_API_KEY`, `DHL_API_SECRET` (names only) — Phase 0 reported them absent. Presence ≠ validity; no live call made.

**Conflicts found (non-blocking for design, blocking for go-live):**
- **C-1** `gateway_kashier = live` vs `merchant_configs.mode = test` / `payment_intents.environment = test`.
- **C-2** live `orders.status` vocab divergence (§6) — pre-existing.
- **C-3** `kashier_product_mappings` PL/PP columns NULL — consistent with Payment Sessions; document as intentional or clean up.
- **C-4** `affiliate_attributions` + `user_tool_logs` not exposed via REST (404) — expected-table gap vs Phase 0 list.

### FINAL STATUS: **CATALOG GATE CLOSED — new conflicts surfaced (see §11)**

- **Data level: READY** — `orders` is empty (0 rows); additive nullable columns carry zero data risk; all consumers tolerate them.
- **Catalog level: CLOSED after this report** — direct read-only SQL access to the production project was obtained (`alghvtpkpspnqupbvodu`); P1–P9 and the applied-migrations catalog are now confirmed (§11). The PostgREST-only limitation that produced `BLOCKED` rows no longer applies to this environment.
- **New conflicts found while closing the gate — do not code around them** (NC-1 status CHECK vs `completed`/`confirmed` writers; NC-2 `payments.order_id → orders` FK does not exist; NC-3 RLS INSERT policy + full anon/authenticated grants; NC-4 `admin_settings.gateway_kashier` and `merchant_configs.mode` are both runtime-dead; NC-5 production `pricing_coaching_plus_usd=200` freezes D4).
- **No SQL/code/route/deployment action was taken**; the catalog probes above were read-only SELECTs.

- new `orders.fulfillment_status` → **fulfillment lifecycle only**: `unfulfilled | queued | processing | shipped | delivered | returned`
- Mapping from today's mixed vocab: `pending_manual_review → status=pending_payment, fulfillment=unfulfilled`; `completed → status=paid, fulfillment=unfulfilled`; `processing → status=paid, fulfillment=processing`; `confirmed → status=paid, fulfillment=queued`; `shipped/delivered/cancelled/refunded` → obvious counterparts. (Value migration is a separate, later, owner-approved step — zero rows today.)

---

## 11. CATALOG EVIDENCE CLOSED — direct read-only SQL (2026-09-24)

Access path changed: this working environment now reaches the production project's database via read-only SQL (`alghvtpkpspnqupbvodu`). Only `SELECT`/catalog queries were executed. This section records the exact values retrieved so M1 can be authored against the real production `orders`, not against REST inference.

### 11.1 `orders` — full production contract (direct)

| Object | Production value | Design impact |
|---|---|---|
| Columns | `id uuid PK default uuid_generate_v4()`, `user_id uuid`, `fullname`, `email`, `phone`, `address`, `city`, `country`, `postalcode`, `amount numeric`, `status text default 'pending'`, `items jsonb default '[]'`, `created_at`/`updated_at` default `now()` — 13 cols, all others nullable | M1 §3 column list unaffected (no collisions) |
| PK | `orders_pkey` (validated) | — |
| FK | `orders_user_id_fkey` → `auth.users(id)` (validated) | M1 FKs `invoice_id`/`payment_intent_id` have no conflict |
| CHECK | `orders_status_check` (validated): `pending \| pending_manual_review \| processing \| shipped \| delivered \| cancelled \| refunded` | **Design R9 precondition is now met** — the vocab is dumped; `completed`/`confirmed` are rejected |
| Indexes | `orders_pkey` · `orders_created_at_idx (created_at DESC)` · `orders_user_id_idx (user_id)` | Design X4 (`lower(email)`) still required — no equivalent exists |
| Triggers | **none** | M4 trigger (`set_orders_updated_at`) required |
| RLS | enabled, not forced | M3a-1 already satisfied; M3a-2/3 exist in different form (see 11.3) |
| Policies | 3 (see 11.3) | M3a-4/M3b must address them |
| Row count | **0** | zero-risk additive migration confirmed |
| Inbound FKs | `delivery_assignments.order_id` · `payment_receipts.order_id` (ON DELETE CASCADE) | M4 inventory corrected — `payments` is **not** among them |

### 11.2 Applied-migrations catalog (production)

`supabase_migrations.schema_migrations` in production contains the full tracked set through `20260923174722_phase4_restrict_pricing_merchant_tables`. Notably **absent** (created outside the tracked catalog, i.e. dashboard/baseline): the `orders` table itself and the legacy `payments`/`invoices` schema. All v5.1 backbone, phase3 merchant tables/seeds, checkout-session idempotency, InstaPay (`20260923111937`/`14223`), and the four `2026092316*`/`17*` security-hardening migrations **are applied** — the FROZEN baseline is confirmed live.

### 11.3 RLS / grants — current write surface on `orders`

| Policy | Cmd | Expression |
|---|---|---|
| Users can view own orders | `r` (SELECT) | `auth.uid() = user_id OR is_admin() OR is_representative()` |
| Admins can update all orders | `w` (UPDATE) | `is_admin()` |
| Users create own orders | `a` (INSERT) | `auth.uid() = user_id OR user_id IS NULL` |

Grants: `anon` and `authenticated` hold **full table privileges** (SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER); RLS is the only thing constraining them. Consequence for M3b: revoking client write grants + dropping the `INSERT` policy is required by D7, but ships **in the same commit** as the admin PATCH route (OPEN-6), never before.

### 11.4 Production config readings (for the price/mode conflicts)

| Source | Key/value | Meaning |
|---|---|---|
| `admin_settings` | `pricing_coaching_plus_usd = 200` | **Production price override = 200.00 USD** — D4's 349.99 is NOT in production; this is a frozen conflict (NC-5) |
| `admin_settings` | `pricing_coaching_plus_egp = 9999`, `pricing_{digital,bundle,coaching}_{egp,usd}` | match Frozen contract (D3/D4 unaffected); `pricing_tolerance = 2` |
| `admin_settings` | `gateway_kashier = live` · `gateway_spaceremit = live` · `gateway_paymob = disabled` | `gateway_kashier` is **not read by any code** (NC-4) |
| `merchant_configs` | 1 row EGYPT / `MID-48761-625` / EGP / **`mode=test`** / active | **not read by any runtime code** (NC-4) |
| `merchant_configs` | **no GLOBAL row** | Global merchant identity is env-only today |
| `kashier_product_mappings` | 3 active EGYPT rows; `kashier_payment_page_id`/`kashier_payment_link_id` **NULL** on all | D5 `PL-…` adoption is a pure mapping update (columns exist, unused) |
| `payment_intents` | 3 × `test` / `initiated` (EGP 2, USD 1) | consistent with `merchant_configs.mode=test` |
| `invoices` | 65 all `pending` (paymob 55, stripe 7, kashier 3); region NULL ×62 | legacy data, untouched |

### 11.5 New conflicts from closing the gate (owner rulings required before M1)

| # | Conflict | Evidence | Where resolved |
|---|---|---|---|
| **NC-1** | `orders.status` CHECK rejects `completed` (written by `supabase/functions/payment-webhook/index.ts:70`) and `confirmed` (MissionControl dropdown) — zero rows today, latent write failure | `orders_status_check` def vs `payment-webhook/index.ts:70`, `MissionControl.tsx` statuses | M1 scope note: DO NOT remove/relax the existing CHECK in M1; the vocabulary consolidation is a separate owner-approved phase (design R9) |
| **NC-2** | `payments.order_id → orders` FK claimed in design §6 (from `payments_order_id_fkey` in generated types) **does not exist** in production | inbound-FK query returns only `delivery_assignments` + `payment_receipts` | M4 table corrected; generated types (`shared/types/db_types.ts`) are stale |
| **NC-3** | `orders` already has an INSERT policy ("Users create own orders") and full WRITE grants for `anon`/`authenticated`; design "no INSERT/UPDATE/DELETE policy" (M3a-4) assumed absence | `pg_policy` + `role_table_grants` | M3b builds the DROP policy + REVOKE into the Phase-8 commit |
| **NC-4** | `gateway_kashier=live` (admin_settings) and `merchant_configs.mode=test` are **both runtime-dead**; the live/test authority is `KASHIER_MODE` env + `KASHIER_LIVE_ENABLED` kill switch (Vercel, unreadable here) | grep: no code reads `gateway_kashier` / `merchant_configs`; `merchantResolver.ts:152`, `KashierGateway.ts:387`, `payoutService.ts:322` | KASHIER CONFIG CONFLICT REPORT (separate deliverable) |
| **NC-5** | Production `admin_settings.pricing_coaching_plus_usd = 200` freezes the legacy price; D4 = 349.99 | `admin_settings` read | PRICE CONFLICT MATRIX (already on the Phase 0 report as P2; now production-backed, not just code-level) |

### 11.6 What remains BLOCKED after this gate

Vercel production env **names/values** (`KASHIER_MODE`, `KASHIER_LIVE_ENABLED`, `KASHIER_{TEST|LIVE}_{EGYPT|GLOBAL}_*`, `BOSTA_API_KEY` validity, `DHL_*` contract), Fourthwall Partner API/webhooks, Kashier live merchant `allowedMethods`, and Bosta/DHL official contracts (TV-1…TV-8). None of these block authoring M1; they block Phases 4–6.

**Verdict:** `orders` migration M1 (additive nullable columns + NOT VALID constraints + indexes + updated_at trigger + M3a RLS additions) is data- and catalog-safe to author against production as evidenced here. It remains **unapproved** — the owner must still sign off the exact column list (design §3/§12 gate) and OPEN-1/OPEN-6 before any SQL is written or applied.

