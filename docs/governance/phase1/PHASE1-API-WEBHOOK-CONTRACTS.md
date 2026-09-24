# PHASE 1 — API & WEBHOOK CONTRACTS

**Companion to:** `PHASE1-DECISION-RECORD.md` (D2 Global store mirror, D3 Bosta, D5 Kashier ids, D6 consultation, D7 admin writes)
**Mode:** DESIGN ONLY — no route, component, SQL or config was created or modified.
**Status legend used below:**
`REUSE` = an existing, verified implementation is reused · `EXTEND` = an existing route/service is extended · `NEW` = proposed new surface · `TO VERIFY` = an external contract that must be confirmed against the provider's official documentation before implementation · `UNVERIFIED` = deliberately not asserted (no access in this environment).

---

## 1. Channel activation contract (EG vs GLOBAL)

**Owner rule (D2):** the Fourthwall store is reached **only** when the customer presses "خارج مصر / Global". No Global path may be reachable by URL guessing, IP, or client-supplied `country` alone.

### 1.1 Client → server
| Field | Rule |
| --- | --- |
| UI control | Existing region selector (`features/checkout/hooks/useCheckout.ts:60,77`, `features/checkout/CheckoutForm.tsx:237-245`) — `RegionOption = 'EG' \| 'GLOBAL'` |
| Trust boundary | **Selection is a request, not an authority** (§32). The server re-resolves the channel and may reject. |
| Existing defect to fix | `useCheckout.ts:183-185` writes `country = 'EG' \| 'US'` from the client and the server currently derives region from that same client `country` field via `resolveRegion({country})` — client-controlled. The GLOBAL branch must not depend on client input alone. |

### 1.2 EG channel
Unchanged flow: `POST /api/checkout/kashier/session` (primary, service-role, idempotency) or `POST /api/checkout/instapay` (manual). **`EXTEND`** with the shared server-side guard in §7.

### 1.3 GLOBAL channel — `NEW` (proposed)
Two variants, chosen by what Fourthwall actually supports (OPEN-4 of the global question; nothing below is asserted about the provider):

**Variant G-A — provider-order-created-by-API (preferred if Partner API allows order creation):**
```text
POST /api/checkout/global            (NEW, server-side, service role, rate-limited)
  request  { items[], consultation?, coaching?, currency: 'USD', email, idempotencyKey }
  server   1. resolveRegion() → must be GLOBAL, else 409 CHANNEL_FORBIDDEN
           2. canonical USD prices from product_prices (region='GLOBAL') — never client amounts
           3. create canonical order  (source_channel='GLOBAL_STORE', external_provider='FOURTHWALL',
              external_sync_status='pending', schema_version=1, region='GLOBAL', currency='USD')
           4. request the external order/checkout session from the provider
           5. persist external_order_id + external_payment_reference + external_sync_status='synced'
  response { orderId, storeCheckoutUrl, externalOrderId }
```
**Variant G-B — redirect with a signed reference (fallback when the provider can only host the checkout):**
```text
POST /api/checkout/global
  server   1.–3. as above (mirror row created BEFORE the customer leaves our domain)
           4. build redirect: NEXT_PUBLIC_STORE_URL + mrx_ref (signed) [+ utm/affiliate params]
  response { orderId, redirectUrl }
```
**Why the mirror row is created first:** prompt §43 ("local order created but external checkout abandoned") requires a state to reconcile. A row that exists with `external_sync_status='pending'` and a TTL is reconcilable; a customer who vanishes without leaving a trace is not.

### 1.4 Signed reference (non-negotiable)
Handing `mrx_order_ref` or `user_id` to an external domain in a URL is **client-tamperable**, so the reference must be server-signed:

```text
mrx_ref = base64url( payload ) + "." + base64url( hmac_sha256(payload, GLOBAL_STORE_SIGNING_SECRET) )
payload = { order_id, user_id?, issued_at, expires_at, region: 'GLOBAL' }
```
* Secret: **new server-only env** `GLOBAL_STORE_SIGNING_SECRET` (never `NEXT_PUBLIC_*`, never in the repo). `TO VERIFY`: whether the store can echo this value back on the webhook/return URL — if not, matching must fall back to email + amount + timestamp inside a tolerance window, and that fallback must be an explicit, logged reconciliation rule rather than a silent guess.
* The mirrored order must **never** be marked paid from a return-URL parameter (§41): only the verified webhook or a server-side verification call may do that.

---

## 2. Global store webhook receiver — `NEW` route, `REUSE` storage

**Route (proposed):** `POST /api/webhooks/global-store` (nodejs runtime; the signature is the auth).

**Storage is reused, not rebuilt (prompt §55):** `webhook_events` already provides everything required — `provider`, `provider_event_id` (**not null**, unique together with `provider`), `transaction_id`, `event_type`, `payload_hash`, **`raw_payload` jsonb**, `processing_status`, `status`, attempt counter, `payment_intent_id`, `updated_at` (`20260910221000:10-18`, `20260917141213:6,13`, C7 composite `20260917141107`).

| Contract element | Design | Class |
| --- | --- | --- |
| Signature scheme (header name, algorithm, secret rotation) | must be confirmed from Fourthwall documentation | `TO VERIFY` |
| Raw body | verify against the **raw** body bytes, never a re-serialized JSON object | rule |
| Dedupe key | `(provider, provider_event_id)` — the **existing** unique constraint, provider value `'fourthwall'` | `REUSE` |
| Replay defence | the same constraint; a duplicate returns `200` with **no** state change | rule |
| Event ↔ order linkage | `orders.external_order_id` (M1 column 7) + `webhook_events.payment_intent_id` (nullable, exists) | `REUSE` + `EXTEND` |
| Retry semantics | external retries are idempotent; internal retries reuse `server/payments/backoffPolicy.ts` (`delayForAttempt`, `jitterMinutesForAttempt`, `computeNextAttemptWindow`, `attemptsRemaining`, `isWindowOpen`) instead of new backoff code | `REUSE` |
| Response codes | `200` accepted/already-processed · `400` malformed · `401` signature mismatch · `404` unmatched order (stored + flagged for reconciliation) · `5xx` only when a provider retry is wanted | rule |
| Failure visibility | `processing_status` + attempt counter + `orders.external_sync_status='failed'` + `reconciliation_runs` | `REUSE` |

### 2.1 Normalized event envelope (provider-agnostic, `NEW`)
Every inbound external event is normalized **before** any state change:

```ts
type NormalizedStoreEvent = {
  provider: 'fourthwall';
  providerEventId: string;        // → webhook_events.provider_event_id
  eventType: string;              // → webhook_events.event_type
  occurredAt: string;             // ISO-8601 from provider
  externalOrderId: string;        // → orders.external_order_id
  externalPaymentReference?: string;
  amount: { value: number; currency: 'USD' | 'EGP' };   // GLOBAL must be USD (§31)
  customer: { email?: string; name?: string };
  items: Array<{ externalProductId: string; quantity: number; unitAmount?: number }>;
  fulfillment?: { status?: string; tracking?: string };
  refund?: { amount?: number; currency?: string; reason?: string };
};
```

**Validation before persistence:** currency must be `USD` for a GLOBAL order (otherwise quarantine — never coerce); `externalOrderId` required; amount `>= 0`; unknown `eventType` values are stored and quarantined, never silently dropped.

### 2.2 Mirror state transitions (the only allowed transitions)
```text
(pending)  --webhook: order.created---------> (synced)
(pending)  --webhook: payment.succeeded-----> (synced) + orders.payment_status = 'paid'
(pending)  --TTL expired / customer left----> (abandoned)      [reconciliation job]
(synced)   --webhook: refund.succeeded------> (synced) + the existing refunds/financial_ledger path
(any)      --processing error---------------> (failed)         [Admin-visible, retried via backoff]
```
**Hard rule:** refunds are financial events on the existing `refunds` + `financial_ledger` path (prompt §35). A refunded external order is **never deleted**, and `orders.status` never encodes payment truth.

---

## 3. Egypt shipping — Bosta adapter contract (`NEW` adapter, `REUSE` patterns)

**D3:** Bosta is the primary local provider, but **checkout never calls Bosta directly**; it talks to an adapter so a second carrier can be added later without touching checkout.

```ts
// server/shipping/ShippingProvider.ts   (NEW — design)
export interface ShippingQuoteRequest {
  region: 'EGYPT';
  destination: { city: string; addressLine: string; postalCode?: string };
  parcel: { weightGrams: number; dimensionsCm?: { l: number; w: number; h: number } };
  declaredValueEgp?: number;
  reference: string;                     // our order id
}
export interface ShippingQuote {
  provider: 'bosta';
  quotedCostEgp: number | null;          // PROVIDER COST — informational only
  customerPriceEgp: 199;                 // fixed BUSINESS price (D3)
  serviceLevel?: string;
  etaDays?: { min: number; max: number };
  quoteId?: string;
  expiresAt?: string;                    // if the provider expires quotes
}
export interface ShippingProvider {
  quote(req: ShippingQuoteRequest): Promise<ShippingQuote>;
  createShipment(req: ShippingQuoteRequest & { quoteId?: string }): Promise<{ shipmentRef: string; trackingNumber?: string }>;
  getTracking(shipmentRef: string): Promise<{ status: string; normalized: ShippingStatus; events?: unknown[] }>;
  cancelShipment(shipmentRef: string, reason?: string): Promise<{ cancelled: boolean }>;
  normalizeStatus(rawProviderStatus: string): ShippingStatus;
}
export type ShippingStatus = 'draft' | 'created' | 'picked_up' | 'in_transit'
  | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled' | 'failed' | 'unknown';
```

| Element | Design | Class |
| --- | --- | --- |
| Auth | `Authorization: <BOSTA_API_KEY>` header, server-side only, per the provider documentation supplied by the owner | `TO VERIFY` (exact header form + test vs prod hosts) |
| Env | `BOSTA_API_KEY` — Vercel only; never source, migrations, DB, logs, fixtures or this repository | rule (§49) |
| **Customer price vs provider cost** | `customerPriceEgp = 199` is a business constant; `quotedCostEgp` is carrier cost. They are stored separately and never conflated (§19) | rule |
| Digital-only baskets | **no** shipping charge and **no** shipment (fixes the Phase 0 InstaPay defect that added 239 EGP to the digital tier) | `EXTEND` |
| Idempotency | `createShipment` passes our `order_id` as the client reference so a retry cannot create two shipments; uniqueness is also enforced on our side | `TO VERIFY` + rule |
| Retries | reuse `server/payments/backoffPolicy.ts`; retry only network/5xx/rate-limit, never validation errors | `REUSE` |
| Rate limits | provider limits `TO VERIFY`; our admin-triggered shipment creation is independently rate-limited | `TO VERIFY` |
| Failure isolation | a shipping failure never rolls back a paid order; it sets a shipping state + Admin visibility (§43) | rule |
| Sandbox | existence `TO VERIFY`; until confirmed, development uses a **mock adapter** and makes **no** production call (§54) | rule |
| Where shipping state lives | snapshot columns/table **deferred** to design brief R4 so the shape follows the verified contract, not a guess | `NEW` (Phase 4) |

---

## 4. Consultation + coaching contract (`EXTEND`)

### 4.1 Canonical product (D6)
| Field | Value |
| --- | --- |
| Canonical id | `MRX-CONSULT` (`CanonicalProductId` union in `server/payments/merchantResolver.ts:17` is `EXTEND`ed with this member) |
| DB | `products` row: slug `consultation` (pending OPEN-5), `sku='MRX-CONSULT'`, `active=true`, `status='active'`; `product_prices` rows: `('EGYPT','EGP',299)` and `('GLOBAL','USD',30.00)` |
| Pricing engine | add tier `consultation: { usd: 30.00, egp: 299 }` to `DEFAULT_PRICING.tiers` (`server/payments/pricing.ts:32-42`) — **no FX derivation** (§28) |
| Kashier | `kashier_product_mappings` row for region EGYPT with the owner's consultation `PL-…` id (D5) |

### 4.2 Cart / checkout API additions
```ts
// added to POST /api/checkout/kashier/session, POST /api/checkout/instapay, POST /api/checkout/global
consultation?: boolean;                 // default false
// coaching remains an add-on tier (bundle_plus | coaching_plus | digital_plus) — unchanged mechanism
```
**Server rules (never client-trusted, §32):**
1. `consultation=true` adds exactly **299 EGP (EG)** or **30.00 USD (GLOBAL)** **once per order**, regardless of quantity/items.
2. It **cannot** be combined with a package that already includes it; if a future package includes consultation, the server must **not** double-charge (the inclusion rule needs OPEN-5).
3. It is independent of shipping: it never forces shipping on a digital-only basket and is never itself a shippable item.
4. Amount recomputation stays inside `computeAmount()` — the checkout continues to reject any client amount outside `DEFAULT_PRICING.tolerance` (`pricing.ts:273-276`).

### 4.3 UI contract
| Requirement (D6) | Contract |
| --- | --- |
| Position | consultation checkbox **immediately above** the online-coaching checkbox |
| Mechanism | **identical** to coaching: checkbox with a check mark, same visual treatment, same price badge |
| Anchors | coaching checkbox lives at `features/checkout/ProductSelector.tsx:324`; the consultation control is inserted above it, and the approved §47 sentence renders between the two controls |
| Bilingual | AR copy approved (decision record §2); EN copy is `CONTENT INPUT REQUIRED` (OPEN-7) |
| Pricing display | consultation badge shows `299 ج.م` / `$30.00`; coaching badge must show `9,999 ج.م` / **`$349.99`** after D4 |

---

## 5. Admin write routes (`NEW` — implements D7 / prompt §11)

All admin mutations move behind server routes using the **existing** `requireAdmin` (`server/auth/require-admin.ts`). Target flow:

```text
Browser → Admin API route → requireAdmin (Bearer token → profiles.role='admin') → service role → DB + audit_log
```

### 5.1 `PATCH /api/admin/orders/[id]` (`NEW`)
| Element | Contract |
| --- | --- |
| Auth | `Authorization: Bearer <supabase access token>`; `requireAdmin` **must** return `authorized:true` before any DB access |
| Client | service-role client (`SUPABASE_SERVICE_ROLE_KEY`), never the anon/authenticated client |
| Body (whitelist) | `{ status?, fulfillment_status?, payment_status?, admin_note?, reason? }` — any other key is rejected (`400`) |
| Validation | `zod` schema with enums mirroring the DB CHECKs (`fulfillment_status`, `payment_status`) and the **dumped** `orders.status` vocabulary (P7); unknown status → `422` |
| Never writable here | `amount`, `grand_total`, `currency`, `region`, `items`, `external_*`, `payment_provider_merchant`, `idempotency_key` — financial/identity fields are **not** admin-editable through this route |
| Audit | one `audit_log` insert per accepted change: `who, when, action, old value, new value, target order id, reason` (§39) |
| Idempotency | a no-op update (same value) returns `200` and writes **no** audit row; a duplicate request cannot produce a second state change |
| Responses | `200` updated · `400` invalid body · `401` missing/invalid token · `403` not admin · `404` order not found · `409` illegal transition (e.g. `paid → pending`) · `422` unknown enum · `500` with no internal detail leaked |
| Dependency | this route must exist and be used by `MissionControl` **before** M3b revokes client `UPDATE` (OPEN-6) |

### 5.2 Optional read routes (`NEW`, Phase 8)
`GET /api/admin/orders` and `GET /api/admin/orders/[id]` may replace the client-side `useAdminData` reads for sensitive fields. Decision is deferred to Phase 8; if introduced, they use the same `requireAdmin` + service-role pattern and the client SELECT grants can then be narrowed.

---

## 6. Region enforcement + error model (all channels)

**Server-side, before any payment/session creation (prompt §31, §32, §36).**

| Inputs compared server-side | Source of authority |
| --- | --- |
| selected region | server resolution (`resolveRegion`) — client value is a **hint** only |
| currency | derived from region, never from the client |
| shipping country | for physical EG orders only |
| merchant | `getMerchantConfig(region)` — never from the client |
| payment method | intersected with the merchant's entitled methods (Kashier audit, §24) |
| product regional availability | `product_prices.region` + `products.active` |

| Rejected combination | HTTP | Error code |
| --- | --- | --- |
| `GLOBAL + EGP` | 409 | `CHANNEL_CURRENCY_MISMATCH` |
| `EG + USD` | 409 | `CHANNEL_CURRENCY_MISMATCH` |
| `GLOBAL + InstaPay` | 403 | `CHANNEL_PAYMENT_FORBIDDEN` |
| `GLOBAL + Bosta` | 403 | `CHANNEL_SHIPPING_FORBIDDEN` |
| `EG + DHL` | 403 | `CHANNEL_SHIPPING_FORBIDDEN` |
| wrong merchant for region | 403 | `CHANNEL_MERCHANT_FORBIDDEN` |
| client amount ≠ server amount (beyond tolerance) | 422 | `AMOUNT_MISMATCH` |
| client shipping cost ≠ server-resolved cost | 422 | `SHIPPING_MISMATCH` |
| unknown/inactive product for region | 404 | `PRODUCT_UNAVAILABLE` |
| missing idempotency key on a retry-able POST | 400 | `IDEMPOTENCY_KEY_REQUIRED` |

**Rules:** rejection happens **before** any provider call; the response body never echoes internal merchant ids, secrets or stack traces; every rejection is logged with `requestId` following the existing `requireAdmin` logging convention.

---

## 7. Kashier identifier migration contract (D5)

| Action | Contract |
| --- | --- |
| Cancel legacy ids | `PP-4876162501`, `PP-4876162502`, `PP-4876162503` in `server/payments/paymentLinkConfig.ts:22,30,38` are treated as **deprecated** |
| Adopt new ids | `PL-…` values are written into `kashier_product_mappings.kashier_payment_link_id` (column **already exists** — `20260917141057:72`) for the corresponding product + region; the owner's serial numbers go into `kashier_product_mappings.kashier_product_id` |
| Products to map | digital / paperback / hardcover / coaching / **consultation** (299 EGP) — shipping is **not** mapped as a product (D3 + §15) |
| **Checkout mechanism (OPEN-4, must be decided before code)** | **Recommended:** keep the existing **Kashier v3 Payment Session** flow as the execution path (server-computed amount + `invoices.idempotency_key` + webhook verification), and store the `PL-…` ids as **reference mappings** for reconciliation/admin display. Switching the website to static PL links would remove server-side amount authority and duplicate-protection, so it must be an explicit owner decision, not an implementation detail. |
| Table extension (design brief R11) | if a display label per mapping is required, add `display_name_ar text` / `display_name_en text` to `kashier_product_mappings` (additive, nullable) — only if the owner wants the payment-page names stored |

---

## 8. Idempotency register (per surface)

| Surface | Key | Enforcement | Notes |
| --- | --- | --- | --- |
| Kashier session (`EXTEND`) | `idempotency_key` | `invoices.idempotency_key` partial unique (`20260918120000`) | already implemented — unchanged |
| InstaPay (`EXTEND`) | `transaction_reference` | read-then-insert on `payment_receipts` today; **proposed** unique constraint `(transaction_reference, payment_method)` | design brief R8 — touches a FROZEN table, so it needs an explicit owner statement first (§2) |
| Global checkout (`NEW`) | `idempotencyKey` | `orders.idempotency_key` partial unique (M1 column 20 / U2) | prevents two mirror orders from a double-click |
| Global webhook (`NEW`) | `provider + provider_event_id` | existing `webhook_events_provider_event_unique` | duplicate ⇒ `200`, zero state change |
| Shipping create (`NEW`) | our `order_id` as client reference + local uniqueness | adapter rule | retry must never create a second shipment |
| Admin order update (`NEW`) | no-op detection + state-transition guard | route rule | duplicate request cannot double-apply |
| Entitlement (`REUSE`) | `(user_id, product_id, invoice_id)` upsert | existing `entitlementService` | unchanged |

---

## 9. TO VERIFY register (nothing here may be implemented on assumption)

| # | Item | Needed from | Blocks |
| --- | --- | --- | --- |
| TV-1 | Fourthwall: product/offer ids for the five Global products; order/payment/refund webhook **event names**; signature header + algorithm; whether an order can be created via API (V-A) or only hosted checkout (V-B); whether the signed `mrx_ref` can be echoed back; USD-only enforcement capability | Fourthwall Partner/API access | Global channel (Phase 5) |
| TV-2 | Bosta: base URLs (test/prod), auth header exact form, quote/create/track/cancel endpoints, idempotency support, rate limits, sandbox availability | official Bosta docs + owner key (rotated) | Bosta adapter (Phase 4) |
| TV-3 | DHL: which API family/product, subscription vs key+secret vs OAuth, required fields, whether duties/taxes are returned | DHL developer portal + owner account | DHL adapter (Phase 6) |
| TV-4 | Kashier: live merchant-entitled payment methods (`allowedMethods` intersection) for the EG MID and any Global MID | Kashier dashboard (owner) | method UI + §24 |
| TV-5 | Production `orders` DDL, row count, status vocabulary, grants/RLS/triggers | read-only SQL (P1–P9) | M1 application |
| TV-6 | Whether `admin_settings` already overrides any price (incl. `eg_standard` shipping) | read-only SQL (P9) | price corrections (D3/D4) |
| TV-7 | Whether the Global store can pass our affiliate/referral parameters through checkout | Fourthwall + owner | affiliate attribution in Global (Phase 7) |
| TV-8 | Duties/taxes/customs behaviour for Global shipping (prompt §45) | DHL + Fourthwall | Global shipping display; currently `UNKNOWN` |

**Rule:** every TV-* item above results in an explicit `UNKNOWN` / `TO VERIFY` status in the implementation phase until evidence is attached. No provider contract, header name, event name or endpoint is invented here.

---

## 10. Approval gate for Phase 1

Approval of this phase requires the owner to confirm:

1. The **orders** migration design (`PHASE1-MIGRATION-DESIGN-ORDERS.md`) — column list, new vocabularies (`fulfillment_status`, `source_channel`), `NOT VALID` constraint strategy, staged plan A1–A5, and M3b sequencing (OPEN-6).
2. The **Global contract variant**: G-A (API-created external order) vs G-B (redirect + signed reference), and acceptance that a mirror row is created **before** the customer leaves our domain.
3. The **`GLOBAL_STORE_SIGNING_SECRET`** approach (server-only env) and the fallback matching rule if the store cannot echo the signed reference.
4. The **Kashier mechanism decision** (OPEN-4): Payment Sessions retained as executor with `PL-…` as reference mappings (recommended) **or** static PL links adopted.
5. The **Bosta adapter** shape and the 199 EGP business-price vs provider-cost separation.
6. The **admin write route** contract (`PATCH /api/admin/orders/[id]`) and the M3b sequencing.
7. The **§47 EN copy** (still missing).

**Status: PHASE 1 CONTRACTS DESIGN COMPLETE — no route, component, SQL or configuration was created or modified. Implementation remains blocked until the migration design and these contracts are approved and TV-1…TV-8 are resolved for the phases that need them.**
