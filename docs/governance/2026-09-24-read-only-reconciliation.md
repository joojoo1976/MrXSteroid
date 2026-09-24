# READ-ONLY CURRENT-STATE RECONCILIATION — Phase 0

**Project:** MrXSteroid — Egypt Local Checkout + Global Store + Supabase + Admin + Shipping + Payments
**Governing prompt:** `docs/governance/MASTER_IMPLEMENTATION_GOVERNANCE_PROMPT.md` (sections 0–70)
**Phase 1 status:** owner decisions approved on 2026-09-24 → `docs/governance/phase1/PHASE1-DECISION-RECORD.md`, `docs/governance/phase1/PHASE1-MIGRATION-DESIGN-ORDERS.md`, `docs/governance/phase1/PHASE1-API-WEBHOOK-CONTRACTS.md` (designs only; nothing applied)
**Report date:** 2026-09-24
**Mode:** READ-ONLY. No SQL, no migration, no code change, no production mutation, no deployment was performed while producing this report. The only repository write is this document plus the governing prompt document (doc-only commit).

### Evidence classes used
`CONFIRMED` (provable from repo code/schema) · `CONFIRMED-LIVE` (needs safe prod probe — not performed here) · `INFERRED` · `MISSING` (absent) · `CONFLICT` (two sources disagree) · `BLOCKED` (no access) · `PROPOSED`.

### Access actually available in this environment
| Source | Access | Consequence |
| --- | --- | --- |
| Git repository (local clone + `origin/main` refs) | YES | Repository evidence is `CONFIRMED` |
| `.env` / `.env.local` on this machine | YES (read, values NOT reproduced) | Local var **names** confirmed; **Production Vercel values not readable** |
| Supabase Production (SQL, schema introspection, dashboard) | NO | Production schema is `BLOCKED` except where mirrored in migrations/generated types |
| Vercel production deployment / env inventory | NO | Deployment + prod env are `BLOCKED` |
| Fourthwall Partner API / webhooks / admin | NO | Entirely `BLOCKED` |
| Kashier dashboard (merchant entitlement, live MID) | NO | `BLOCKED` |
| Bosta / DHL accounts | NO | `BLOCKED` |

> Therefore this report **does not** claim 100% compatibility, and it does not declare any table "exists in Production" unless it is a migration in this repository.

---

## A. REPOSITORY EVIDENCE (baseline)

| Item | Value | Evidence |
| --- | --- | --- |
| Repository root | `E:\MrXSteroid-main` | workspace |
| Branch | `main` | `git status` |
| HEAD | `84a977f130caa702b471b9396007ebd6c50f2584` | `git log -1` |
| HEAD subject | `security(auth): app-level leaked-password protection for signup + reset (HIBP k-anonymity, fail-closed default)` | `git log` |
| `origin/main` | same commit — branch "up to date with 'origin/main'" | `git status`, `git branch -vv` |
| Working tree | clean, no staged/unstaged changes | `git status` |
| Remote | `https://github.com/joojoo1976/MrXSteroid.git` | `git remote -v` |
| Package manager | npm (`package-lock.json`, `lockfileVersion: 3`; no pnpm/yarn lockfile) | `package-lock.json` |
| Next.js | `^15.5.23` | `package.json:37` |
| React | `^19.2.0` | `package.json:39-40` |
| TypeScript | `~5.8.2` | `package.json:73` |
| Test runner | vitest `^4.0.18` | `package.json:15,75` |
| Supabase JS | `@supabase/supabase-js ^2.116.0` | `package.json:28` |
| Supabase project ref | `alghvtpkpspnqupbvodu` | `supabase/config.toml:1`, `NEXT_PUBLIC_SUPABASE_URL` (public value) |
| Vercel project | `mrxsteroid` / `prj_1k2zeHGXG1mGsFxLbbIXQDQ4e6GQ` | `.vercel/project.json` |
| Auth `site_url` in repo config | `https://mrxsteroid-georges-projects-78ef250b.vercel.app/` | `supabase/config.toml:4` |
| Migrations in repo | **51** files in `supabase/migrations` + 15 in `supabase/migrations_prebaseline` + 7 rollback scripts | `supabase/migrations/**` |
| Production deployment commit | **BLOCKED** — no Vercel access from this environment | — |
| Migrations applied in Production | **BLOCKED** — no SQL access; cannot be inferred safely from repo | — |

### Presence/absence probe of the "new territory" (whole repo, `git grep -i`)
| Term | Result | Class |
| --- | --- | --- |
| `fourthwall` | **0 matches in the entire repository** | `MISSING` (no Fourthwall code, no webhook, no product-ID mapping, no env var) |
| `bosta` | **0 matches in the entire repository** | `MISSING` (no Bosta adapter, no `BOSTA_API_KEY` anywhere, including `.env.example`) |
| `dhl` | only 3 non-lockfile matches: `server/payments/pricing.ts:50`, `shared/lib/logic.ts:254`, `legacy-pages/ShippingPolicyPage.tsx:19` (marketing copy) — all static price/label, **no API client, no credential, no tracking** | `MISSING` as an integration; `CONFLICT` with prompt §18 |

---

## B. ADMIN DASHBOARD COMPATIBILITY MATRIX

### B.1 Actual admin surface (route → file → loader)
| Route | File | Renderer | Data path |
| --- | --- | --- | --- |
| `/admin` | `app/admin/page.tsx` (15 lines) | `legacy-pages/MissionControl.tsx` (2135 lines) | **client-side Supabase (anon key + user JWT) with RLS admin policies** via `features/admin/useAdminData.ts` |
| `/admin-analytics` | `app/admin-analytics/page.tsx` (15 lines) | `legacy-pages/AdminAnalytics.tsx` (621 lines) | `app/api/dashboard/metrics` + clients |
| `/api/admin/payment-receipts`, `/[id]`, `/[id]/receipt` | `app/api/admin/payment-receipts/**` | — | server route + `requireAdmin` + service role |
| `/api/admin/seo/**` (15 routes) | `app/api/admin/seo/**` | — | server route + `requireAdmin` (commit `7a38720`) |

**CONFIRMED:** only **two** admin API families exist (`payment-receipts`, `seo`). Every other admin read/update happens directly from the browser with the user's JWT (RLS-enforced). `legacy-pages/MissionControl.tsx:1173` performs an order status update from the browser: `supabase.from('orders').update({ status: nextStatus }).eq('id', order.id)`.

`server/auth/require-admin.ts` (server pattern): Bearer token → `auth.getUser(token)` → read `profiles.role` → require `role === 'admin'`; never trusts user_metadata or body.

### B.2 What the dashboard reads today
`features/admin/useAdminData.ts:98-116` — client-side parallel reads (limit 500 each): `invoices`, `profiles`, `orders`, `contact_messages`, `delegates`, `delivery_assignments`, `admin_settings`, `categories`, `products`, `product_variants`, `coupon_codes`, `discount_rules`, `banners`, `customer_notes`, `blog_posts`, `cms_pages`, `faq_items`; plus `shared/lib/RealtimeSyncService.ts:194`.

### B.3 Capability → current state → required change
| Required admin capability (§10/§38) | Current state | Class | Action |
| --- | --- | --- | --- |
| Order list + detail | `orders` read + status write (client-side) | `CONFIRMED` | extend |
| Region / Currency / Merchant | no such columns in `orders`; not in generated types | `MISSING` | depends on canonical-order decision (I) |
| Order items | `orders.items` jsonb, written as `[{tierId, quantity}]` (`app/api/checkout/instapay/route.ts:393`) | `CONFIRMED` (untyped jsonb) | extend |
| Invoice | `invoices` (+ 12 extension columns) | `CONFIRMED` | reuse |
| Payment intent / payment events | `payment_intents`, `webhook_events` | `CONFIRMED` (repo) | surface in UI |
| Refunds | `refunds` | `CONFIRMED` (repo) | surface in UI |
| Ledger / splits | `financial_ledger`, `order_splits`, `beneficiaries`, `split_rules`, `payouts` | `CONFIRMED` (repo) | surface in UI |
| Entitlements | `entitlements` + `server/payments/entitlementService.ts` | `CONFIRMED` | surface in UI |
| Fulfillment | `server/payments/fulfillmentService.ts` (385 lines) | `CONFIRMED` (code) | surface in UI |
| Reconciliation | `reconciliation_runs` + backoff columns | `CONFIRMED` (repo) | surface in UI |
| InstaPay review | `payment_receipts` + admin API | `CONFIRMED` | reuse (FROZEN) |
| Shipping provider / tracking | no table, no column, no entity anywhere | `MISSING` | new design required |
| External provider / external order id | absent | `MISSING` | gated by Fourthwall decision |
| Audit trail | `audit_log` exists (repo) | `CONFIRMED` (table) / `INFERRED` (UI usage) | verify before extending |

---

## C. DATABASE SCHEMA COMPATIBILITY MATRIX

Tables provably created by repository migrations (`git grep -i "create table" supabase/migrations`):

* **Catalog/pricing:** `categories`, `products`, `product_variants`, `product_prices`, `merchant_configs`, `kashier_product_mappings`, `coupon_codes`, `discount_rules`, `banners`
* **Commerce/finance:** `invoices`, `payments`, `payment_intents`, `refunds`, `financial_ledger`, `order_splits`, `split_rules`, `beneficiaries`, `payouts`, `entitlements`, `audit_log`, `reconciliation_runs`, `webhook_events`
* **Manual/InstaPay:** `payment_receipts`, `instapay_config`
* **Affiliate:** `affiliates`, `referrals`, `affiliate_commission_ledger`, `affiliate_audit_logs`, `affiliate_attributions`
* **Ops/CMS/other:** `profiles`, `contact_messages`, `customer_notes`, `blog_posts`, `cms_pages`, `faq_items`, `admin_dashboard_metrics`, `user_dashboard_data`, `delegates`, `realtime_locations`, `delivery_assignments`, `user_history`, `user_tool_logs`, `fraud_rules`, `fraud_observations`, `fraud_decisions`, 9 × `seo_*`

| Capability | Actual table | Actual columns (verified) | Class / action |
| --- | --- | --- | --- |
| Products | `products` | `id, name, slug, sku, category_id, description, price, sale_price, tax_rate, stock, low_stock_threshold, status, image_url, seo_title, seo_description, created_at, updated_at` + (`name_ar, name_en, description_ar, description_en, active`) | `CONFIRMED` — REUSE |
| Product prices (regional) | `product_prices` | `id, product_id, region(EGYPT/GLOBAL), currency(EGP/USD), amount, active, created_at, updated_at`; partial unique `(product_id, region) where active` | `CONFIRMED` — REUSE |
| Categories | `categories` | `id, name, slug, parent_id, sort_order, created_at` | `CONFIRMED` |
| Cart | **none** | — | `MISSING` (cart is client state in `features/checkout/**`) |
| Orders | `orders` — **created by NO repository migration** | Only visible via generated types `shared/types/db_types.ts:285+`: `id, user_id, fullname, email, phone, address, city, country, postalcode, amount, status, items(jsonb), created_at, updated_at` | `CONFLICT`/`BLOCKED` — code depends on it (`app/api/checkout/instapay/route.ts:380,418,464`; `app/api/admin/payment-receipts/[id]/route.ts:116`; `MissionControl.tsx:1173`; `useAdminData.ts:101`) but the repo cannot prove its Production DDL |
| Order items | `orders.items` jsonb | code writes `[{tierId, quantity}]` | `CONFIRMED` (code) |
| Invoices | `invoices` | base `id, user_id, gateway, status, tier_id, amount, currency, gateway_reference_id, created_at, updated_at`; `20260910220000` adds `region, payment_provider_merchant, payment_status, referral_code, attribution_timestamp, attribution_expires_at, paid_at, refunded_at, kashier_order_id, kashier_transaction_id, product_name_snapshot, attribution_source`; `20260918120000` adds `idempotency_key, kashier_session_id, kashier_session_url` + partial unique index on `idempotency_key` | `CONFIRMED` — REUSE. **Generated types are stale** vs migrations (`CONFLICT`) |
| Payment intents | `payment_intents` | v5.1 backbone + reconciliation columns (`reconciliation_attempts`, `_last_attempt_at`, `_next_attempt_at`) | `CONFIRMED` (repo) — REUSE |
| Payment events | `webhook_events` | `provider, transaction_id, provider_status, status, payment_intent_id`, attempt counter; C7 de-dupe `(provider, transaction_id, provider_status)` | `CONFIRMED` — REUSE |
| Refunds | `refunds` | `20260914100000` + `20260917150000` state-machine CHECK | `CONFIRMED` — REUSE |
| Shipping | **none** | — | `MISSING` |
| Shipping shipments | **none** | — | `MISSING` |
| InstaPay receipts | `payment_receipts` | `payment_method CHECK IN ('instapay','bank_transfer','manual')`, `transaction_reference`, `order_id`, `status`, storage path; hardened `20260923130000` | `CONFIRMED` — REUSE (FROZEN) |
| Affiliates / referrals | `affiliates`, `affiliate_attributions`, `referrals` | `20260910222000`, `20260910223000`, `20260919120000` | `CONFIRMED` |
| Commission | `affiliate_commission_ledger`, `affiliate_audit_logs` | `20260910224000`, `20260910225000` | `CONFIRMED` |
| Ledger | `financial_ledger` | `20260914100000:78`, `20260917150000:140` | `CONFIRMED` |
| Entitlements | `entitlements` | `20260914100000:128`, `20260917150000:182`; RLS admin-full + "users read own" | `CONFIRMED` |
| Fulfillment | no table | `server/payments/fulfillmentService.ts` | `CONFIRMED` (code) / `MISSING` (table) |
| Reconciliation | `reconciliation_runs` | `trigger_source(cron|manual), started_at, finished_at, status(running/completed/failed), candidates_count, resolved_count, quarantined_count, still_unresolved_count, max_attempts_reached, error_message, metadata` | `CONFIRMED` — REUSE |
| Audit log | `audit_log` | `20260914100000:152`, `20260917150000:197` | `CONFIRMED` — REUSE |

---

## D. SOURCE-OF-TRUTH MATRIX (for what is provable today)

| Data | Supabase | Fourthwall | Kashier | Bosta | DHL | Admin UI | Class |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Product identity | canonical (`products.slug/sku` = `MRX-PROTOCOL/MRX-TACTICAL/MRX-SMART-PRO`) | `UNKNOWN` (no mapping in repo) | SKU mapping `MRX-EG-*`/`MRX-GL-*` (derived) | n/a | n/a | read/write via `products` | `CONFIRMED` (Supabase) / `BLOCKED` (Fourthwall) |
| Product price | `product_prices` + `server/payments/pricing.ts` + `admin_settings` override | `UNKNOWN` | Kashier Payment Pages (PP-…) | n/a | static `dhl_global: 45 USD` | `admin_settings` | `CONFLICT` (see Price Conflict Report) |
| Cart | client state only | `BLOCKED` | n/a | n/a | n/a | — | `MISSING` |
| Order | `orders` (DDL unprovable) + `invoices` | `BLOCKED` | `kashier_order_id` / `kashier_transaction_id` on `invoices` | n/a | n/a | browser read/write | `CONFLICT` |
| Payment | `payment_intents` + `webhook_events` + `financial_ledger` | `BLOCKED` | provider authority | n/a | n/a | read | `CONFIRMED` (Egypt path) |
| Shipping | static price map only | `BLOCKED` | n/a | `MISSING` | static price map only | — | `MISSING` |
| Refund | `refunds` + `server/payments/refundState.ts` | `BLOCKED` | presumed authority | n/a | n/a | — | `CONFIRMED` (repo) |
| Customer | `profiles` (+ `auth.users`) | `BLOCKED` | n/a | n/a | n/a | read | `CONFIRMED` |
| Entitlement | `entitlements` + `entitlementService` | `BLOCKED` | n/a | n/a | n/a | read | `CONFIRMED` (repo) |
| Affiliate | `affiliates`, `referrals`, `affiliate_attributions` | `BLOCKED` | n/a | n/a | n/a | read | `CONFIRMED` |
| Ledger | `financial_ledger`, `order_splits` | `BLOCKED` | n/a | n/a | n/a | — | `CONFIRMED` (repo) |
| Reconciliation | `reconciliation_runs`; **cron removed** (commit `3a7b83e` — 5-min cron blocked on Hobby plan) | `BLOCKED` | manual/server verification | n/a | n/a | manual invoke | `CONFLICT` (design vs platform limits) |

---

## E. CURRENT PAYMENT ARCHITECTURE

### E.1 Server-side authority that already exists
* `server/payments/merchantResolver.ts` — `MerchantRegion = 'EGYPT' | 'GLOBAL'` (line 12), `CurrencyCode = 'EGP' | 'USD'` (13), `PaymentMethodId = 'card' | 'wallet'` (14), `BlockedGateError` (23-30), rotating secrets primary/secondary (36-44), `getMerchantConfig()` (213-245) reading `KASHIER_{TEST|LIVE}_*` with legacy `KASHIER_{EGYPT|GLOBAL}_*` fallbacks, `resolveRegion()` (251-257), `resolvePaymentContext()` (264-278), `resolveRegionalPrice()` (286-296), `resolveKashierSku()` (302-305).
* `merchantResolver.ts:286-296` — **Global price is intentionally `null` + placeholder** (`USD_PRICE_*`) unless `PRICING_GLOBAL_MRX_<PRODUCT>_USD` is set. The owner's Global prices are therefore **not** in the current code path.
* `server/payments/pricing.ts` — `DEFAULT_PRICING` (32-56): `digital 49.99/499`, `bundle 72/749`, `coaching 82/849`, `pdf 49.99/499`, `paperback 72/749`; add-on coaching `200 USD / 9999 EGP`; shipping `eg_standard 239 EGP`, `dhl_global 45 USD`, `fedex_priority 38`, `ups_worldwide 42`, `aramex_international 25`; `computeAmount()` (242-267), `resolveShippingCost()` (196-208), `isAmountValid()` (273-276), `computePromoDiscount()` (216-236).
* `server/payments/checkout/checkoutSessionService.ts:135-192` — server-side region → merchant → currency → server-computed amount; Egypt physical orders require address + city (150-157); idempotency lookup on `invoices.idempotency_key` (198-220).
* Primary endpoint `app/api/checkout/kashier/session/route.ts` — documented "Phase 4 PRIMARY checkout", service-role only (no anon fallback), zod schema, `idempotencyKey` (1-200 chars), rate limit 10/min per IP, `runtime='nodejs'`.
* Other endpoints: `app/api/payments/{create-session,create-invoice,webhook,callback,evaluate-risk,reconciliation,reconciliation/run}`, `app/api/webhooks/kashier`, `app/api/payouts/webhook`. `create-invoice/route.ts:78-85` **deprecates `instapay`** and points to `/api/checkout/instapay`.
* Gateways present: `KashierGateway`, `PaymobGateway`, `StripeGateway`, `SpaceRemitGateway` (`server/payments/gateways/*`, `PaymentFactory.ts`).

### E.2 Egypt
`CONFIRMED`: EG → Egypt merchant → EGP → server-computed amount → Kashier v3 Payment Session, or InstaPay manual. Seed `merchant_configs ('EGYPT','MID-48761-625','EGP','test',true)` (`20260917141057:113-118`) with in-file comment "Live remains BLOCKED (`KASHIER_LIVE_ENABLED=false`)".
`BLOCKED`: the real merchant-entitled `allowedMethods` for the live MID; whether `card`/`wallet` are actually enabled in Production.

### E.3 Global
`CONFIRMED`: `resolveRegion()` sends every non-EG hint to `GLOBAL`; Global merchant identity comes from env (`KASHIER_{TEST|LIVE}_GLOBAL_*`); `merchant_configs` has **no GLOBAL row** seeded by any repository migration.
`MISSING`: no Global-store connector; no Fourthwall; no DHL; Global price placeholder only.
`CONFLICT` with prompt §4: the prompt mandates a USD external-store Global path, while the current GLOBAL code path is a Kashier merchant with a `null` price.
`.env.local` on this machine has **no** `KASHIER_MODE`, **no** `KASHIER_LIVE_ENABLED`, and **no** `PRICING_GLOBAL_*` (names checked; values never printed) → local Global configuration is effectively absent.

---

## F. CURRENT INSTAPAY ARCHITECTURE (no duplicate assumptions)

`app/api/checkout/instapay/route.ts` (single route, ~500 lines), verified behaviour:

1. zod validation + rate limit `instapay-checkout:${ip}` (line 229).
2. **Server-side pricing, hard-coded EGP** (312-341): `computeAmount(..., currency: 'EGP')`, then **`resolveShippingCost(pricing,'eg_standard',0,'EGP')` is added unconditionally** (327-332) → an InstaPay purchase of the digital tier is charged **499 + 239 = 738 EGP**. This conflicts with prompt §15/§20 ("shipping only when a shippable item exists") and is a probable real overcharge. Must be validated against Production `admin_settings` before any change (`CONFLICT`).
3. Idempotency: look-up on `payment_receipts.transaction_reference` + `payment_method='instapay'` (353-371) → returns the existing order (`idempotent: true`).
4. Creates the order directly in `orders` with `status:'pending_manual_review'` (379-396) and `items=[{tierId, quantity}]`.
5. Uploads the receipt to storage, inserts `payment_receipts` (437-462); on failure it **deletes the order as compensation** (418, 464) → `CONFIRMED`.
6. **No region guard** — `git grep -E "EGYPT|GLOBAL|region" app/api/checkout/instapay/route.ts` returns nothing → a GLOBAL caller is **not** rejected server-side before payment creation (prompt §36) = `MISSING`.
7. Admin review: `app/api/admin/payment-receipts/[id]/route.ts` (approve/reject; line 116 updates `orders`). `server/affiliate/ledgerService.ts:49-52` — InstaPay invoices **never auto-trigger commission** (manual admin action), which is `CONFIRMED`.
8. Migrations `20260922000000` (tables + `instapay_config` seed) and `20260923130000` (receipt RLS/storage hardening) — **FROZEN baseline, do not rebuild**.

---

## G. FOURTHWALL ARCHITECTURE

**Result: `BLOCKED` + `MISSING`.**

* No Fourthwall reference exists anywhere in the repository (`git grep -i fourthwall` = 0 matches at commit `84a977f`): no API client, no webhook route, no product-ID map, no env var, no test.
* The only external-store artifact is `components/store/StoreButton.tsx:16` (`process.env.NEXT_PUBLIC_STORE_URL || 'https://shop.mrxsteroid.com'`), and `git grep "StoreButton" app components features legacy-pages` shows it is **never imported/rendered** → the Global store entry point is currently **not wired into the UI** (`MISSING`).
* Therefore this report **cannot** state: whether the domain is Fourthwall-hosted, which products/offer IDs exist, whether checkout/cart/order/payment/refund/shipping/digital-delivery are Fourthwall-native, webhook names, signature scheme, or currency-control capabilities. All of these remain `BLOCKED` until either (a) Partner API access is provided, or (b) read-only manual verification is performed by the owner.
* Per prompt §5/§60, **no webhook or API contract is invented here.** The ownership question "is Fourthwall the merchant of record for Global?" is **UNANSWERED** and must be answered before any Phase 5 design.
* `CONFLICT` (owner statement vs repository): the owner states `shop.mrxsteroid.com` is live on Fourthwall with cart/checkout and multiple currencies; the repository contains **no** integration, sync, order mirror, or env variable for it. Both statements can be true (store exists externally, integration missing) — the repo side proves the **integration is `MISSING`**.

---

## H. SHIPPING ARCHITECTURE (actual contracts)

**Bosta:** `git grep -i bosta` = **0 matches** in the whole repository (including `.env.example`). There is no adapter, no `BOSTA_API_KEY`, no quote/shipment/tracking code, no test. Prompt §17's `ShippingProvider` contract does not exist yet → `MISSING` (design is `PROPOSED`).
**DHL:** only 3 non-lockfile matches, all static: `server/payments/pricing.ts:50` (`dhl_global: { usd: 45 }`), `shared/lib/logic.ts:254` (`{ id:'dhl_global', name:'DHL Express International', price:45.00, estimatedDays:'3-7' }`), `legacy-pages/ShippingPolicyPage.tsx:19` (marketing text listing DHL/FedEx). No API client, no credential, no tracking, no rate call → `MISSING`.
**Current shipping implementation is a hard-coded price map, not a provider integration:**
* `shared/lib/logic.ts:245-259` `getShippingProviders(country)` — EG → single option `eg_standard @ 239.00 EGP (2-4 days)`; non-EG → `dhl_global 45`, `fedex_priority 38`, `ups_worldwide 42`, `aramex_international 25` (USD).
* `shared/lib/logic.ts:317-321` `calculateShippingRates()` is an explicit mock (`// Mock reusing existing logic`), called from `features/checkout/hooks/useCheckout.ts:201`.
* `server/payments/pricing.ts:48-54` mirrors the same numbers server-side (`eg_standard.egp = 239`) and is the value used for authoritative re-computation (`resolveShippingCost`).
* `shared/lib/locationData.ts:183` `EGYPT_FIXED_SHIPPING_EGP = 239`; `shared/lib/paymobProducts.ts:158` shipping `priceEGP: 239`.
* **Three independent code paths all say 239 EGP; the owner requirement is 199 EGP** → `CONFLICT` (see Price Conflict Report).
* No shipping snapshot columns exist on `orders`, and no shipping table exists → prompt §44 (`SHIPPING DATA SNAPSHOT`) is `MISSING`.
* Local env names checked: no `BOSTA_API_KEY`, no `DHL_*` present in `.env.local`/`.env`.

---

## I. CANONICAL ORDER CONTRACT — actual vs required

**There is no single canonical order model today (`CONFLICT`).** Three parallel order-ish records exist:

| # | Record | Where created | Fields | Class |
| --- | --- | --- | --- | --- |
| 1 | `orders` row | `app/api/checkout/instapay/route.ts:379`, `supabase/functions/payment-webhook/index.ts:68` | `id,user_id,fullname,email,phone,address,city,country,postalcode,amount,status,items(jsonb),created_at,updated_at` — **no currency, no region, no merchant, no payment_status, no fulfillment_status, no external ids** | `CONFIRMED` (usage) / `BLOCKED` (DDL) |
| 2 | `invoices` row | `server/payments/checkout/checkoutSessionService.ts` (Kashier session path), `app/api/payments/create-invoice` | `id,user_id,gateway,status,tier_id,amount,currency,gateway_reference_id,…` + 12 extension columns + `idempotency_key`/`kashier_session_*` | `CONFIRMED` (repo) |
| 3 | `payments` row | pre-baseline `20260201_create_payments_table.sql` (SpaceRemit-era: `transaction_id, spaceremit_id, order_id, …`) | legacy PSP record | `CONFIRMED` (repo) |

`payment_intents` (v5.1 backbone) is the internal payment record and is linked to invoices/intents — not to `orders` in any code path found.

### Required-vs-actual (prompt §13)
| Required field | Exists in `orders`? | Exists in `invoices`? | Gap |
| --- | --- | --- | --- |
| order_id | `id` | `id` | — |
| customer_id | `user_id` (nullable) | `user_id` (not null) | email-only checkouts write `user_id: null` |
| region | ✗ | ✓ (`invoices.region`) | missing on `orders` |
| currency | ✗ | ✓ | missing on `orders` |
| subtotal / discount | ✗ | ✗ (single `amount`) | no line-level snapshot |
| shipping | ✗ | ✗ | missing |
| tax | ✗ | ✗ | `products.tax_rate` exists but unused in checkout amount |
| grand_total | `amount` (no currency) | `amount` | no currency on `orders` |
| payment_method | ✗ | `gateway` | naming mismatch (`gateway` vs `payment_method`) |
| merchant_reference | ✗ | `payment_provider_merchant` | missing on `orders` |
| external_provider / external_order_id | ✗ | ✗ | missing everywhere |
| status | ✓ (unconstrained string) | ✓ | two status vocabularies |
| payment_status | ✗ | ✓ (`payment_status` with CHECK) | missing on `orders` |
| fulfillment_status | ✗ | ✗ | `MISSING` |
| created/updated | ✓ | ✓ | — |

**Decision required (prompt §12 Option A/B/C) before any schema work.** No option is chosen in this report.

---

## J. INVOICE CONTRACT (actual)

* Table `invoices`, base created in `migrations_prebaseline/20260316_create_invoices_table.sql`, re-declared in `20260817_billing_invoices_enhancement.sql`; extended by `20260910220000` and `20260918120000`.
* **No invoice line items table** (`invoices.tier_id` + `product_name_snapshot` is the only item snapshot) → a multi-item combined invoice (prompt §14) is `MISSING` and needs a design decision.
* **No invoice numbering scheme** found in the repository migrations/columns (`id` uuid + `gateway_reference_id`) → prompt §37 numbering = `MISSING`.
* Currency: `invoices.currency` exists (`CONFIRMED`) — supports the EGP/USD split at record level.
* No PDF generation found in repo (`git grep -i "invoice.*pdf"`-style probe: `app/api/download` exists but targets book downloads, not invoices) → `INFERRED MISSING`.
* Admin display: `useAdminData.ts` reads `invoices` for the dashboard (`CONFIRMED`).

---

## K. PAYMENT INTENT / EXTERNAL PAYMENT CONTRACT

* Internal: `payment_intents` (v5.1 backbone `20260917150000:98`, reconciliation columns `20260918160000:37-45`) with status CHECK per v5.1 state machine; `server/payments/paymentIntentService.ts` (136 lines) manages it.
* Provider events: `webhook_events` with C7 de-dupe key `(provider, transaction_id, provider_status)` (`20260917141107`, corrected again in `20260917150000`) and processing `status` + attempt counter.
* Verification: `app/api/webhooks/kashier/route.ts:7-8` documents: HMAC signature verification → `webhook_events` de-dupe via `provider_event_id` unique constraint → replay guard/idempotency check against `invoices` and `payment_intents`.
* `server/payments/verifyPaidAmount.ts` (60 lines) and `server/payments/gateways/kashierVerification.ts` exist → amount verification path `CONFIRMED`.
* **Naming caution (prompt §14):** `payment_intents` is an **internal** record tied to Kashier sessions; it must not be equated with a Fourthwall/PSP transaction. No external transaction record exists for the Global path.

---

## L. MULTI-CURRENCY FINANCIAL CONTRACT

* Currency codes are constrained: `product_prices.currency CHECK IN ('EGP','USD')`, `merchant_configs.currency CHECK IN ('EGP','USD')`, `payments.currency` free text, `invoices.currency` free text → `CONFIRMED`.
* Currency symbol/rate table with implicit FX conversion exists on the **client/shared** layer: `shared/lib/logic.ts:159-167` `CURRENCY_RATES` (USD rate 1.00, EGP rate 50.00, SAR) and `convertCurrency()` — **this is a display/legacy conversion table, not a checkout authority**; it is a `CONFLICT` risk against prompt §28 ("do not generate USD from EGP using exchange rate"). `shared/types/localization.ts:54` also hard-codes `rate: 50.0` for EGP.
* Server authoritative pricing is currency-explicit (`TierPrice { usd, egp }`, `resolveShippingCost(cfg, provider, cost, currency)`) → no FX in the payment path `CONFIRMED`.
* Ledger/splits store `currency` per row (`payouts.currency`, `order_splits` via the backbone migration) → multi-currency per transaction is structurally possible `CONFIRMED` (columns exist) but multi-currency *behaviour* is unverified (`INFERRED`).
* No FX conversion found inside `server/payments/splitEngine.ts` or `financialLedgerService.ts` (grep for conversion helpers = none) → `CONFIRMED` absence.

---

## M. AFFILIATE / LEDGER CONTRACT (actual implementation)

Two **separate** money layers exist. This is the single most important correction to prompt §33:

| Layer | Implementation | Numbers | Class |
| --- | --- | --- | --- |
| Revenue split (author/platform/reserve) | `server/payments/splitEngine.ts:29-36` | `AUTHOR_SHARE_PERCENT: 85`, `PLATFORM_SHARE_PERCENT: 10`, `RESERVE_SHARE_PERCENT: 5` (total 100) | `CONFIRMED` — the owner's `85 / 10 / 5` exists **here** |
| Affiliate commission | `server/affiliate/commissionConfig.ts:21-23` + `commissionEngine.ts` + `ledgerService.ts` | Bronze 1-10 sales → **25%**, Silver 11-50 → **35%**, Gold 51+ → **45%**, plus `custom_commission_rate` | `CONFIRMED` — **not** 85/10/5 |
| Attribution / ledger currency | `affiliate_commission_ledger` (`20260910224000`), `affiliate_attributions` (`20260919120000`), `payouts.currency` | per-row currency column | `CONFIRMED` (structure) / `INFERRED` (multi-currency behaviour) |
| InstaPay commission | `server/affiliate/ledgerService.ts:49-52` — InstaPay never auto-commissions; manual admin action | — | `CONFIRMED` |
| Refund → commission reversal | no explicit reversal code found in the affiliate services during this audit | — | `INFERRED` risk; needs targeted verification before Phase 7 |
| FX in ledger | none found | — | `CONFIRMED` absence |

Implication: prompt §33's "preserve the existing `85 / 10 / 5`" is valid **only for `splitEngine`**; applying it to affiliate commissions would silently multiply payouts.

---

## N. ENTITLEMENT / FULFILLMENT CONTRACT (actual)

* `server/payments/entitlementService.ts` (152 lines): `grantEntitlement()` upserts on the natural key `(user_id, product_id, invoice_id)` (line 61) → **idempotent by construction** `CONFIRMED`; `checkUserEntitlement()` (155-175); `scheduleEntitlementRevocation()` with `ENTITLEMENT_GRACE_PERIOD_DAYS = 14` (77-115, "Owner Decision 3-3"); `revokeEntitlement()` (120-148).
* Table `entitlements` RLS: admin-full + "users read own" (`20260917150000:426-434`) `CONFIRMED`.
* `server/payments/fulfillmentService.ts` (385 lines) `CONFIRMED` (code); **no fulfillment table and no per-item fulfillment status** → prompt §38 "Fulfillment Status" per order is `MISSING`.
* The business rule "any eligible purchase grants the digital book" is **not** encoded anywhere found: entitlement is granted per `product_id` with no package-inclusion expansion → `MISSING`. Prompt §21/§27 (package → product inclusion) has no schema today (`category_id`, `sku`, `product_variants` exist but no package/add-on relation table).

---

## O. ADMIN / RLS SECURITY MODEL (actual)

* Two coexisting patterns: (a) **client-side RLS** for MissionControl data (browser → `supabase-js` with the user JWT → RLS admin policies), (b) **server `requireAdmin`** (`server/auth/require-admin.ts`) for `payment-receipts` + `seo` routes only.
* Prompt §11 mandates pattern (b) for every new admin feature. The mixed model is `CONFIRMED` and is a **deviation** for order mutation (`MissionControl.tsx:1173`).
* Financial tables: RLS enabled, admin-full-access via `profiles.role='admin'` subselect (`20260917150000:386-434`) `CONFIRMED`.
* FROZEN hardening that must not be rebuilt (prompt §2): `20260923130000` (InstaPay receipt RLS/storage), `20260923140000` (support_tickets tautology), `20260923160000` (`trg_fraud_decision_apply_flag` → service_role), `20260923170000` (pricing/merchant client privileges revoked), plus app-level leaked-password protection at HEAD `84a977f`. `docs/security-baseline.md` is the in-repo baseline record.

---

## P. STATE MACHINES (actual, extracted — not invented)

| Entity | Actual status vocabulary (source) | Class |
| --- | --- | --- |
| `invoices.payment_status` | CHECK `pending \| paid \| failed \| cancelled \| refunded \| partially_refunded \| unknown \| initiated` (`20260910220000:26`) | `CONFIRMED` |
| `orders.status` | free text; code writes `pending_manual_review` (`instapay/route.ts:392`); admin writes arbitrary `nextStatus` (`MissionControl.tsx:1173`); `supabase/functions/payment-webhook/index.ts:68` writes its own values | `CONFLICT` — no constraint, no enum, 3 writers |
| `payment_intents.status` | v5.1 state machine CHECK (`20260917150000:98-119`) | `CONFIRMED` |
| `refunds.status` | v5.1 CHECK, mirrored by `server/payments/refundState.ts` | `CONFIRMED` |
| `payouts.status` | CHECK `queued \| processing \| reconciling \| completed \| failed \| unknown` (`20260917150000:68-70`) | `CONFIRMED` |
| `webhook_events` | processing `status` + `provider_status` as **separate** concepts (C7 fix) | `CONFIRMED` |
| `entitlements.status` | `granted \| revoked \| suspended` (`entitlementService.ts:27`) | `CONFIRMED` |
| `payment_receipts.status` | review workflow (pending → approved/rejected) | `CONFIRMED` (repo) |
| shipping / fulfillment | no state machine, no table | `MISSING` |

Redirect is **not** payment truth in the Kashier session path (route header + `checkoutSessionService` + `webhook_events` verification) → `CONFIRMED` for that path. The legacy `app/api/payments/callback` path was not exhaustively traced → `BLOCKED`.

---

## Q. IDEMPOTENCY MATRIX (what actually enforces it today)

| Operation | Key | Enforcement | Class |
| --- | --- | --- | --- |
| Kashier checkout session | `idempotency_key` (uuid, client- or server-generated) | `invoices.idempotency_key` + partial unique index `idx_invoices_idempotency_key`; returns the prior session (`checkoutSessionService.ts:198-220`, `20260918120000`) | `CONFIRMED` |
| InstaPay submission | `transaction_reference` | read-then-insert on `payment_receipts(transaction_reference, payment_method='instapay')` (`instapay/route.ts:353-371`) — **no unique constraint found in the repo for that pair** | `CONFLICT` (check-then-act without a proven DB constraint) |
| InstaPay admin approve (double click) | — | not traced in this audit (update by receipt id, `app/api/admin/payment-receipts/[id]/route.ts`) | `BLOCKED` |
| Kashier webhook replay | `provider_event_id` unique + C7 composite `(provider, transaction_id, provider_status)` | `webhook_events` unique constraints | `CONFIRMED` |
| Entitlement grant | `(user_id, product_id, invoice_id)` | `upsert(..., { onConflict })` | `CONFIRMED` |
| Ledger split insert | per invoice | `splitEngine.ts:290` handles unique-violation `23505` | `CONFIRMED` |
| Order ↔ payment linkage | — | `orders` has no payment reference column | `MISSING` |
| Fourthwall events | — | nothing exists | `MISSING` |

---

## R. MIGRATION PLAN — **DESIGN ONLY, NOTHING CREATED** (prompt §50)

No migration was authored. The following are the **candidate** designs that will be required *if* the owner approves the corresponding decisions. Each is a design brief, not an approval.

| # | Candidate object | Why (evidence) | Blocked by |
| --- | --- | --- | --- |
| R1 | `orders` DDL reconciliation — either formalise the existing production table (documented columns) or introduce a canonical `commerce_orders` table | `orders` has no repository migration (C/I) | §12 Option A/B/C decision + read-only Production `information_schema` dump |
| R2 | Order money snapshot columns (`currency, subtotal, discount, shipping_amount, grand_total, payment_method, merchant_reference`) | `orders.amount` alone; no historical snapshot (§34) | R1 |
| R3 | `order_items` table (or typed `orders.items` contract + CHECK) | `items` is untyped jsonb (§14) | R1 |
| R4 | `order_shipping` / `shipping_shipments` (provider, quote, charged, tracking, status, address snapshot) | no shipping entity at all (§44, §62) | Bosta/DHL contract decision |
| R5 | `external_orders` mirror (provider, external_order_id, external_payment_ref, sync state) | Global path + §60/§61 | Fourthwall access |
| R6 | Package/add-on inclusion table (product ↔ package, add-on price, entitlement grants) | §21/§27 have no schema | catalog design decision |
| R7 | `invoices` line items + numbering | §14/§37 | R1 |
| R8 | `payment_receipts` unique constraint on `(transaction_reference, payment_method)` | Q conflict | owner approval (touches FROZEN table → per §2 requires explicit conflict statement) |
| R9 | `orders.status` CHECK / enum | P conflict | R1 + admin-status migration plan |
| R10 | `NEXT_PUBLIC_STORE_URL` / `BOSTA_API_KEY` / `DHL_*` env contract | §16/§18/§48 | real DHL product contract + Bosta key rotation |

Rollback plan for any of these: additive columns + backfill + verification + compensating change; **no destructive rollback** (prompt §51). None of R1–R10 is approved.

---

## S. API CONTRACT CHANGES (only if required)

| Endpoint | Current state | Required change | Blocked by |
| --- | --- | --- | --- |
| `POST /api/checkout/kashier/session` | region/merchant/currency/amount server-side `CONFIRMED`; server computed amount validated | add explicit `EG + non-EG shipping country` rule and forbidden-combination rejection (currently `resolveRegion` only) | §30 rule decision |
| `POST /api/checkout/instapay` | **no region guard**; unconditional `eg_standard` shipping | reject GLOBAL server-side **before** payment creation; make shipping conditional on shippable items | owner decision on the 239-vs-199 conflict + digital shipping bug |
| `POST /api/payments/create-invoice` | already deprecates `instapay` | none (leave as-is) | — |
| `POST /api/webhooks/kashier` | HMAC + `webhook_events` de-dupe `CONFIRMED` | none | — |
| Global webhook receiver | does not exist | new route + signature scheme | Fourthwall contract (`BLOCKED`) |
| Shipping quote/shipment APIs | do not exist | new | Bosta/DHL contract (`BLOCKED`) |

---

## T. UI CHANGES (only what is actually required)

| Area | Current evidence | Required change |
| --- | --- | --- |
| Region selection | `features/checkout/hooks/useCheckout.ts:60,77` `RegionOption = 'EG' \| 'GLOBAL'`; setting it writes `country = 'EG' \| 'US'` (183-185) — **client-driven** | keep UI, enforce server-side; stop letting the client's `country` field be the sole region authority |
| Payment method choice | `useCheckout.ts:78` defaults `kashier` for EG, `stripe` for GLOBAL (`PaymobMethod` type) | reconcile with merchant-entitled methods (prompt §24) after Kashier audit |
| Shipping options | `shared/lib/logic.ts:245-259` static list; EG single `eg_standard 239` | 199 EGP reference decision; Bosta/DHL provider selection gated on contracts |
| Global store entry | `components/store/StoreButton.tsx` **never rendered** | wire it (or replace) once Global path is decided |
| Coaching add-on copy | `features/checkout/ProductSelector.tsx:324`, `features/marketing/PricingSection.tsx:285`, i18n key `pricingAddCoaching` (`i18n/ar.ts:2082`, `i18n/en.ts:2084`), add-on label `features/checkout/OrderSummary.tsx:76` | **CONTENT INPUT REQUIRED** — see below; do not invent copy |
| Prices displayed | `shared/lib/logic.ts:265-286` (`EGP_PRICES`, `COACHING_ADDON_USD = 200.00`), `features/billing/components/PricingGrid.tsx:44-45` (+9,999 EGP / +$200.00) | aligns with Price Conflict Report; owner must confirm 349.99 vs 200.00 |
| Currency display | `shared/lib/logic.ts:159-167` FX table + `shared/ui/CurrencyPrice.tsx` | must not be allowed to derive checkout amounts (§28) |

---

## U. EXACT IMPLEMENTATION PHASES (proposed — execution blocked pending approval)

Each phase below is **PROPOSED**; acceptance requires files, DB objects, APIs, providers, tests, rollback, deployment need and acceptance criteria (prompt §67).

* **Phase 0 — Current-State Reconciliation** ✅ **DELIVERED (this document).** No files changed except governance docs. No DB. No provider calls. Rollback: n/a.
* **Phase 1 — Contracts + Source-of-Truth approval** ⛔ BLOCKED. Required inputs: canonical-order option (§12), Fourthwall merchant-of-record answer, Bosta API contract + rotated key, DHL product/auth contract, Kashier live merchant entitlement, Production `orders` DDL, and an owner ruling on every price conflict below. Files: docs only.
* **Phase 2 — Region/Channel enforcement** ⛔ BLOCKED by Phase 1. Proposed files: `server/payments/merchantResolver.ts`, `app/api/checkout/instapay/route.ts`, `app/api/checkout/kashier/session/route.ts`. Proposed tests: full negative matrix from §53. Rollback: revert commit.
* **Phase 3 — Canonical cart/order/invoice/payment integration** ⛔ BLOCKED by the §12 decision and R1–R3/R7 designs.
* **Phase 4 — Egypt: Kashier + InstaPay + Bosta** ⛔ BLOCKED by the Bosta contract and the P1/P8/P10 rulings.
* **Phase 5 — Global: store sync + USD enforcement + external reconciliation** ⛔ BLOCKED by Fourthwall access.
* **Phase 6 — DHL integration** ⛔ BLOCKED by the DHL product/auth contract.
* **Phase 7 — Entitlement + fulfillment + affiliate + ledger reconciliation** ⛔ BLOCKED by package-inclusion design (R6) and the refund→commission reversal question (M).
* **Phase 8 — Admin Dashboard integration** ⛔ BLOCKED by the §11 authorization-pattern decision (server route vs client RLS).
* **Phase 9 — UI/UX polishing** ⛔ BLOCKED by `CONTENT INPUT REQUIRED`.
* **Phase 10 — Verification + staging/production readiness** ⛔ BLOCKED by all of the above.

Merging phases is **not** proposed: each one depends on a distinct external contract that is currently `BLOCKED`.

---

## PRICE CONFLICT REPORT (prompt §29 — **STOP PRICE UPDATE**)

No price was modified, and `admin_settings` in Production could not be read. Every row needs an owner ruling first.

| # | Item | Region | Currency | Source (evidence) | Current value | Intended value | Class |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | Local shipping | EG | EGP | `server/payments/pricing.ts:49`, `shared/lib/logic.ts:250`, `shared/lib/locationData.ts:183`, `shared/lib/paymobProducts.ts:158` | **239** | **199** | `CONFLICT` |
| P2 | Coaching add-on (1-on-1) | GLOBAL | USD | `pricing.ts:44-46` (`200.00`), `shared/lib/logic.ts:286` (`COACHING_ADDON_USD = 200.00`), `features/billing/components/PricingGrid.tsx:45` (`$200.00`) | **200.00** | **349.99** | `CONFLICT` |
| P3 | Coaching add-on | EG | EGP | `pricing.ts:44-46`, `shared/lib/logic.ts:285` | 9,999 | 9,999 | `CONFIRMED` match |
| P4 | Digital book | GLOBAL | USD | `pricing.ts:34` | 49.99 | 49.99 | `CONFIRMED` match |
| P5 | Paperback / Tactical | GLOBAL | USD | `pricing.ts:35,41` | 72.00 | 72.00 | `CONFIRMED` match |
| P6 | Hardcover / Smart Pro | GLOBAL | USD | `pricing.ts:36-39` | 82.00 | 82.00 | `CONFIRMED` match |
| P7 | Global price resolution | GLOBAL | USD | `merchantResolver.ts:286-296` | `null` + `USD_PRICE_*` placeholder unless `PRICING_GLOBAL_MRX_*_USD` is set | 49.99 / 72.00 / 82.00 / 349.99 / 30.00 | `CONFLICT` (placeholder is authoritative in code today) |
| P8 | **Consultation** (299 EGP / 30 USD) | both | both | not present in `pricing.ts`, `logic.ts`, `paymobProducts.ts`, canonical products, `products` seed, or Kashier config | **does not exist** | 299 EGP / 30.00 USD | `MISSING` |
| P9 | Smart Pro DB price | EG | EGP | `20260917141057:87` seeds `price = 10848` (package + add-on total) and `:97-102` copies it into `product_prices` | 10,848 | 849 base + 9,999 add-on? | `CONFLICT` (base vs bundle ambiguity inside the canonical seed) |
| P10 | Kashier identifiers | EG | EGP | `server/payments/paymentLinkConfig.ts:22,30,38` | three **Payment Pages** `PP-4876162501/502/503` | six **Payment Links** `PL-488…` from the owner list | `CONFLICT` — none of the owner's PL IDs exist in the code; the code uses PP ids + session flow |
| P11 | Owner serials (`20260001-MRX-BOOK-DIGITAL-AR`, `MRX-BOOK-PAPERBACK-AR-20260004`, `MRX-BOOK-HARDCOVER-AR-20260005`, `MRX-SHIPPING-FEE-20260007`) | EG | — | not present anywhere in the repo | — | — | `MISSING` |
| P12 | EGP display FX rate | — | — | `shared/lib/logic.ts:161` (`rate: 50.00`), `shared/types/localization.ts:54` | 50.00 | n/a | `CONFLICT` risk vs §28 (must never drive checkout amounts) |
| P13 | `admin_settings` overrides | EG + GLOBAL | both | `pricing.ts:69-185` (Mission Control precedence over env/defaults) | **unread in Production** | — | `BLOCKED` — Production values may already override every number above |

---

## CONTENT INPUT REQUIRED (prompt §47)

The sentence required **above** `إضافة تدريب شخصي أونلاين` was **not supplied** and was **not invented**. Exact insertion points found:

| Surface | File | Anchor |
| --- | --- | --- |
| Checkout product selector | `features/checkout/ProductSelector.tsx` | line 324 — `{isAr ? 'إضافة تدريب شخصي أونلاين' : 'Add 1-on-1 Online Coaching'}` |
| Marketing pricing section | `features/marketing/PricingSection.tsx` | line 285 — same bilingual string |
| i18n AR | `i18n/ar.ts` | line 2082 — `pricingAddCoaching` |
| i18n EN | `i18n/en.ts` | line 2084 — `pricingAddCoaching` |
| Order summary add-on | `features/checkout/OrderSummary.tsx` | line 76 — `'تدريب شخصي أونلاين لمدة كورس واحد'` |
| Pricing grid suffix | `features/billing/components/PricingGrid.tsx` | lines 44-45 — `+ 9,999 ج.م تدريب شخصي` / `+ $200.00 1-on-1 Coaching` |

Status: `CONTENT INPUT REQUIRED` — a new i18n key (e.g. `pricingCoachingAddonNote`) must be inserted at those anchors with owner-supplied copy. No placeholder copy was written.

---

# FINAL MATRIX — CONFIRMED / MISSING / CONFLICT / BLOCKED / PROPOSED

### ✅ CONFIRMED (provable from repository code/schema/migrations)
1. Baseline: `main` @ `84a977f…`, clean tree, in sync with `origin/main`; npm; Next 15.5.23; React 19.2; TS 5.8.2; vitest 4.
2. Supabase project ref `alghvtpkpspnqupbvodu`; Vercel project `mrxsteroid`.
3. 51 + 15 migrations in-repo; every table in section C is provably created by a repo migration **except `orders`**.
4. Server-side region/merchant/currency/amount authority exists (`merchantResolver.ts`, `pricing.ts`, `checkoutSessionService.ts`, primary route `app/api/checkout/kashier/session`).
5. Kashier integration uses **Payment Session + Payment Pages (PP-…)**; `BlockedGateError` gate and rotating-secret model exist.
6. Webhook security: HMAC verification + `webhook_events` de-dup (`provider_event_id` + C7 composite) + replay guard.
7. Checkout idempotency via `invoices.idempotency_key` + partial unique index.
8. InstaPay manual flow exists end-to-end (route → receipt → admin review → order status) with compensating order delete on failure and no auto-commission.
9. Entitlement grant is idempotent by `(user_id, product_id, invoice_id)` upsert; 14-day refund grace period.
10. Revenue split engine implements **85 / 10 / 5**; affiliate commission is a **separate** 25/35/45 % engine.
11. Admin: `/admin` → `MissionControl.tsx`; `/admin-analytics`; two server API families (`payment-receipts`, `seo`) with `requireAdmin`; all other admin data via client-side RLS.
12. Egypt prices 499 / 749 / 849 EGP and 9,999 EGP add-on match the owner's list at code level.
13. The security hardening named in prompt §2 is present as the four `20260923*` migrations plus HEAD `84a977f` (FROZEN).

### ❌ MISSING (verified absent)
1. `orders` DDL in the repository (used by code, never created by a migration).
2. Any Fourthwall artifact (code, webhook, mapping, env var).
3. Any Bosta artifact (including `BOSTA_API_KEY`).
4. Any DHL integration (only a static 45 USD price row).
5. Cart persistence (no cart / cart_items table).
6. Shipping/shipment entity + shipping snapshot columns + tracking.
7. Order money snapshot (currency/subtotal/discount/shipping/tax/merchant on the order).
8. Order-items table, invoice line items, invoice numbering.
9. Consultation product (299 EGP / 30 USD) anywhere.
10. `external_provider` / `external_order_id` / external payment reference.
11. Package/add-on inclusion relationships (coaching & consultation attached to the three packages).
12. Global store entry in the UI (`StoreButton` never rendered).
13. Server-side GLOBAL rejection for InstaPay and the forbidden-combination matrix.
14. `NEXT_PUBLIC_STORE_URL`, `BOSTA_API_KEY`, `DHL_*` in `.env.example` / `.env.local` (names absent).

### ⚠️ CONFLICT (sources disagree — stop and decide)
1. **Local shipping 239 EGP (3 code paths) vs 199 EGP requirement.**
2. **Coaching add-on USD 200.00 (3 code paths) vs 349.99 requirement.**
3. Global canonical price is a `null` placeholder in code vs the explicit owner prices.
4. Kashier **Payment Pages PP-…** in code vs the owner's **Payment Links PL-…**.
5. `orders` used by code but created by no migration; `db_types.ts` stale vs migrations.
6. Two money layers (85/10/5 split vs 25/35/45 commission) both described as "the existing architecture" in the prompt.
7. `orders.status` has three writers, no constraint; two status vocabularies (`orders` vs `invoices.payment_status`).
8. InstaPay charges 239 EGP shipping even for the digital tier vs §15/§20.
9. `Smart Pro` = 10,848 EGP in the DB seed vs 849 EGP base in `pricing.ts`.
10. Owner states the Global store is live on Fourthwall with multi-currency; the repository contains no evidence of any Global external integration.
11. Reconciliation is designed as a 5-min cron, but the cron was removed for Vercel Hobby limits (commit `3a7b83e`) → manual invocation only.

### ⛔ BLOCKED (cannot be proven from here)
1. Production deployment id / production commit / production env inventory (Vercel).
2. Production schema introspection: `orders` DDL, applied-migration list, RLS/grants state, `admin_settings` values.
3. Kashier live merchant entitlement / `allowedMethods` intersection.
4. Fourthwall: domain binding, products/offer ids, cart/checkout/order/payment/refund/shipping/digital-delivery ownership, API/webhooks/auth, currency control.
5. Bosta API contract (auth header, endpoints, idempotency, test/prod).
6. DHL product family + auth contract (subscription key vs key+secret vs OAuth).
7. InstaPay admin approve double-click semantics; legacy `/api/payments/callback` redirect-trust behaviour.
8. Refund → commission/ledger reversal behaviour in Production.

### 🔵 PROPOSED (design only — not implemented, not approved)
1. Canonical-order convergence (Option A/B/C) — decision pending.
2. Shipping snapshot/shipment model, `ShippingProvider` adapter contract, Bosta/DHL adapters.
3. External-order mirror + Global sync design.
4. Package/add-on inclusion model + digital-book entitlement rule.
5. Server-route-based admin pattern for new admin features (§11).
6. Migration briefs R1–R10 and the API/UI changes in sections S and T.
7. Implementation phases 1–10.

---

# WHAT WAS **NOT** VERIFIED (explicit, per prompt §0)

* No Supabase SQL was executed; **no claim** is made that any migration is applied in Production.
* No Production (Vercel) environment variable was read; only local `.env` / `.env.local` **names** were inspected (values never printed or copied). The single non-secret value reproduced is the public Supabase project URL/ref, which ships in the client bundle.
* No Fourthwall / Bosta / DHL / Kashier API was called, and no contract was inferred for any of them.
* `admin_settings` (Mission Control pricing overrides) was **not** read, so every price statement is **code-level only** and could be overridden in Production.
* `legacy-pages/MissionControl.tsx` (2135 lines) and `server/payments/fulfillmentService.ts` (385 lines) were inspected selectively (targeted reads/greps), not line-by-line; deep verification is deferred to the phase that touches them.
* No security-baseline component was modified, re-derived or "improved" (prompt §2). No `REGRESSION` and no requirement-conflict was found that would justify touching them.

---

# DECISIONS REQUIRED FROM THE OWNER BEFORE ANY CODE

1. **Canonical order:** Option A (converge), B (compatibility abstraction) or C (external-order adapter)?
2. **Fourthwall merchant of record:** is Fourthwall the Global merchant of record? If yes, may the Global order exist *only* externally with Supabase as a mirror?
3. **Shipping reference price:** confirm **199 EGP** and authorise changing all three 239 EGP sources (or state the intended scope, e.g. code only vs also `paymobProducts`).
4. **Coaching add-on USD:** replace the three 200.00 sources with **349.99**, or keep 200.00 as the website price and 349.99 as the store price (two prices, explicitly mapped)?
5. **Kashier identifiers:** are **Payment Pages (PP-…)** or **Payment Links (PL-…)** canonical? Should the six owner PL IDs be adopted into `kashier_product_mappings.kashier_payment_link_id`?
6. **Consultation product:** should it become a canonical product (`MRX-CONSULT`) usable both standalone (299 EGP / 30.00 USD) and as a package add-on?
7. **Admin authorization:** migrate the existing client-side RLS admin mutations (e.g. `MissionControl.tsx:1173`) to server routes per §11, or keep the mixed model?
8. **Inputs to unblock:** the missing §47 copy, a read-only Production Supabase credential (to dump `orders` DDL + `admin_settings` + applied migrations), Vercel environment variable **names**, Fourthwall Partner access, a rotated Bosta API key (the previously shared key must be rotated and stored only in Vercel), and the DHL product/auth contract.

---

**END OF PHASE 0 REPORT — awaiting explicit approval before any implementation.**
