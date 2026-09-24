# M1 — Minimal Orders Migration Design (Revision 4 — FINAL)

**Status:**
```text
M1 Design                   = APPROVED WITH FINAL CORRECTIONS (Rev 4 lock)
M1A SQL                     = APPLIED (migration 20260924174753, committed 0d18c84)
Application Compatibility   = LIVE (committed ecbd4ea, deployed mrxsteroid.com)
Rejected receipt outcome    = LOCKED: status='cancelled' + payment_status='failed' (order attempt only)
InstaPay (payment method)   = LIVE / ACTIVE — POST /api/checkout/instapay preserved
M1B                         = NOT APPLIED
Production                  = LIVE (M1A + Application Compatibility)
```
**Scope:** M1 design revision per owner feedback (Rev 2 → Rev 3). Rollout stays **M1A (additive) → code-compat → validate producers → observation → M1B (enforcement).** NO SQL applied, no code change, no RLS/grants, no price changes, no deployment.

**Evidence basis:** `PHASE1-PRODUCTION-SCHEMA-EVIDENCE.md` (`b7208a3`) + read-only SQL dumps of `information_schema.columns` and `pg_constraint` (2026-09-24 R2). All producer/status/type claims cite that dump.

---

## 0. Final corrections locked (Rev2 → Rev3)

| # | Topic | Final decision (this doc) |
|---|---|---|
| 1 | `payment_method` | **Rail snapshot only.** Never contains gateway/provider names (`kashier/paymob/stripe/spaceremit`). Values only from proven sources → `payment_receipts_payment_method_check`: `instapay \| bank_transfer \| manual`. M1A nullable, **no CHECK in M1A**; M1B CHECK only after the rail vocabulary is proven (initially the receipts vocab). |
| 2 | `external_provider` | **External COMMERCE provider domain only.** Current value = `FOURTHWALL`. `SPACEREMIT` (payment provider) and `MANUAL` (channel/operation/state) are **excluded**. Future commerce providers join via their own contract. |
| 3 | `external_provider` / `external_order_id` | Integrity rule: `external_provider IS NULL ⇔ external_order_id IS NULL` (both NULL or both populated). Partial unique `UNIQUE(external_provider, external_order_id) WHERE both IS NOT NULL` confirmed. |
| 4 | `orders.amount` | **KEEP `numeric` (no narrowing).** Type narrowing is NOT performed for uniformity; evidence table in §7 shows no technical need. |

Also confirmed by owner (Rev3): M1A/M1B kept separate; `region = EG\|GLOBAL` · `currency = EGP\|USD`; `orders.status` CHECK untouched (`completed`/`confirmed` never added); `payment_status` mirrors `invoices_payment_status_check`; `fulfillment_status` nullable with **no invented vocabulary** (CHECK only after Bosta/DHL close); `source_channel` 5 values with `instapay_manual` removed; `invoice_id` FK SET NULL with no UNIQUE in M1; `idempotency_key` nullable + partial unique; `external_sync_status` column in M1A with **no CHECK** until its state vocab is defined; `payment_intent_id` **not added** (1:N); `merchant_reference` **not added** (`payment_intents.merchant_reference` canonical); breakdown columns removed (canonical total stays in `orders.amount`, historical breakdown stays in invoice structures); observation = **min 30 min + 10 gates** before M1B.

### Rev 4 — owner decisions (LOCKED 2026-09-24)

| # | Decision | Locked state |
|---|---|---|
| R4-1 | **Rejected-receipt mapping** — approved exactly as implemented and verified in M1A, **as an order-level outcome for the individual rejected InstaPay payment attempt only**: `orders.status='cancelled'` + `orders.payment_status='failed'`. | LOCKED |
| R4-2 | **InstaPay remains LIVE / ACTIVE** as an existing payment method on mrxsteroid.com. Do **not** remove, disable, deprecate, replace, or consolidate away InstaPay. The current Production flow and route **`POST /api/checkout/instapay`** are preserved **as-is**: receipt upload, file validation, private storage, manual review, affiliate attribution, rate limiting, rollback. | LOCKED |
| R4-3 | `rejected → cancelled+failed` does **not** signal a payment-method shutdown; InstaPay stays selectable and functional at all times. | LOCKED |
| R4-4 | **No Kashier changes** and **no unrelated payment-method changes** in the next steps. | LOCKED |
| R4-5 | Kept: **M1A = LIVE**, **Application Compatibility = LIVE**, **M1B = NOT APPLIED**. | LOCKED |

**Preserved InstaPay invariants (locked, enforced by `tests/unit/instapayPreservationLock.test.ts`):** route file exists and exports `POST`; `req.formData()` + `receiptFile` + `validateReceiptFile` (file type/size/content); `enforceRateLimit('instapay-checkout:…')`; receipt→`RECEIPT_BUCKET` storage upload; order insert keeps `status:'pending_manual_review'`, `payment_method:'instapay'`; `payment_receipts` dedupe on `transaction_reference`/idempotency; affiliate `attribution` persisted in receipt metadata; rollback deletes order + removes stored receipt on failure; admin review (verify/reject) untouched. No replacement of InstaPay with Kashier.

---

## 1. Final column list (26) — phase placement

| # | Column | M1A | M1B | Base |
|---|---|---|---|---|
| 1 | `id` uuid PK | — | — | existing |
| 2 | `user_id` uuid FK→auth.users | — | — | existing |
| 3–9 | `fullname, email, phone, address, city, country, postalcode` | — | — | existing |
| 10 | `amount` **numeric (unchanged)** | — | (optional `>=0` check only) | existing |
| 11 | `status` (CHECK unchanged) | — | — | existing |
| 12 | `items` jsonb | — | type-Check NOT VALID→VALIDATE | existing |
| 13 | `created_at` (+`updated_at` col, no trigger) | — | — | existing |
| 14 | `region` | add nullable | **NOT NULL** + CHECK `EG\|GLOBAL` | add |
| 15 | `currency` | add nullable | **NOT NULL** + CHECK `EGP\|USD` | add |
| 16 | `payment_provider_merchant` | add nullable | (no CHECK) | add |
| 17 | `payment_status` | add nullable | CHECK = invoices vocab | add |
| 18 | `fulfillment_status` | add nullable | **no CHECK ever until providers close** | add |
| 19 | `external_provider` | add nullable | (no CHECK; value FOURTHWALL) | add |
| 20 | `external_order_id` | add nullable | pairing CHECK + partial unique (M1A) | add |
| 21 | `external_payment_reference` | add nullable | (no CHECK) | add |
| 22 | `external_sync_status` | add nullable | **no CHECK until vocab defined** | add |
| 23 | `source_channel` | add nullable | CHECK 5 values | add |
| 24 | `payment_method` | add nullable | CHECK (proven rail vocab) | add |
| 25 | `invoice_id` uuid | add + **FK SET NULL** | (no UNIQUE in M1) | add |
| 26 | `idempotency_key` | add + **partial unique** | — | add |

**Removed from proposal (8):** `subtotal_amount`, `discount_amount`, `shipping_amount`, `tax_amount`, `grand_total`, `merchant_reference`, `payment_intent_id`, `schema_version`.
**Merged:** `grand_total`→`amount`; `discount/shipping`→`invoices.discount_amount/shipping_cost` + `payment_receipts.metadata`; `merchant_reference`→`payment_intents.merchant_reference` (canonical, NOT NULL); `instapay_manual`→`source_channel=web_checkout` + `payment_method=instapay`.

---

## 2. `region` / `currency` — region vocab = `EG | GLOBAL`

- **M1A:** nullable, no CHECK, **no artificial default** (`EG`/`EGP` never auto-filled).
- **M1B:** `NOT NULL` + `CHECK (region IN ('EG','GLOBAL'))` + `CHECK (currency IN ('EGP','USD'))`, applied only after code-compat verification (owner §5/§6). No automatic fallback between currencies.
- **Vocabulary divergence made explicit:** pricing/merchant tables use `EGYPT|GLOBAL` (`product_prices_region_check`, `merchant_configs_region_check`, `kashier_product_mappings_region_check`); `orders.region` uses the owner-approved short form `EG|GLOBAL`. Mapping rule (producer-side): internal market label `'egypt'` → `'EG'`, `'global'` → `'GLOBAL'`. Read-side reconciliation against pricing tables (`EGYPT`) is a Phase C normalization; no M1 change to pricing tables.

---

## 3. `payment_status` contract — one vocabulary

| Entity | Statuses (validated) | Meaning | Writer | Mapping to orders |
|---|---|---|---|---|
| `invoices.payment_status` | `pending\|initiated\|paid\|failed\|cancelled\|refunded\|partially_refunded\|unknown` | **authoritative** aggregate payment state | webhook / reconciliation / InstaPay admin | where `invoice_id` set → authority; `orders.payment_status` must equal it (writer + reconciliation invariant) |
| `orders.payment_status` | same 8 values (M1B CHECK mirrors invoices) | **snapshot/projection**; primary payment record for orders without invoice (InstaPay, mirror) | InstaPay settle, mirror webhook, else copies invoice | THE copy — not a 5th machine |
| `payment_intents.status` | `initiated\|pending\|succeeded\|failed\|cancelled\|expired\|unknown` | **provider-attempt** lifecycle (1:N under invoice, `is_current`) | gateway / reconciliation | never copied to orders; read path = `invoice_id → is_current intent` (owner §8 proof required before M1B) |
| `payments.status` (legacy) | **no CHECK** (unconstrained text) | frozen SpaceRemit record; `order_id` is text, no spine FK | legacy | retired, not migrated |

**Pre-M1B gate (owner §8):** final mapping table above certified against live rows (both spine + legacy) via read-only queries before `VALIDATE`.

---

## 4. `payment_method` — rail-only snapshot

- **Distinctions (never conflated):** payment method = the actual rail/method used; payment provider/gateway = `invoices.gateway` / `payment_intents.provider` / `payment_provider_merchant` (merchant identity); payment intent = attempt entity.
- **Proven vocabulary only** (no invention): `instapay | bank_transfer | manual` — byte-for-byte from validated `payment_receipts_payment_method_check`. Gateway names are **excluded**.
- **Online/session (card) rows:** `payment_method` stays NULL until a rail value is actually proven in code/DB/contract; the gateway identity remains in `invoices.gateway` and `payment_intents.provider`. M1B CHECK uses only the proven receipts vocab; the CHECK is added only after the vocabulary is fixed (owner §1).

---

## 5. `external_*` semantics — COMMERCE domain only

| Field | Domain | Semantic | Values |
|---|---|---|---|
| `external_provider` | COMMERCE | originating storefront/platform | `FOURTHWALL` (current). `SPACEREMIT` (payment provider) and `MANUAL` (channel/op) **excluded**. Future providers via own contract. |
| `external_order_id` | COMMERCE | provider order id | paired with `external_provider` (§6 integrity) |
| `external_payment_reference` | COMMERCE | provider **payment-entity** ref (Fourthwall payment id) for reconcile | not a PSP transaction id (those live on `payment_intents.provider_transaction_id` / `invoices.kashier_transaction_id`) |
| `external_sync_status` | LOCAL sync lifecycle | our mirror sync state | **no CHECK until vocabulary defined**; never conflated with external-provider state (owner §13) |

**Integrity rule (owner §3):** `(external_provider IS NULL AND external_order_id IS NULL) OR (external_provider IS NOT NULL AND external_order_id IS NOT NULL)`. Enforced by `orders_external_pairing_check` (M1A) + partial unique index in M1A (both only bound by mirror-created rows; no current producer writes these columns).

---

## 6. FKs / indexes / idempotency

| Object | Phase | Rule |
|---|---|---|
| `orders.invoice_id → invoices(id)` | **M1A** (safe: column exclusively NULL today; FK cannot be violated) | `ON DELETE SET NULL`; **no UNIQUE in M1** (one-order/one-combined-invoice is application-level until 1:1 proven) |
| `orders_invoice_id_idx` | M1A | btree join/reconcile |
| partial unique `(external_provider, external_order_id)` WHERE both NOT NULL | M1A | mirror dedupe (Fourthwall) |
| partial unique `idempotency_key` WHERE NOT NULL | M1A | order-idempotency claim |
| keep `orders_pkey`, `created_at_idx`, `user_id_idx` | — | unchanged |
| No `lower(email)` uniqueness | — | no proven email contract; admin-dup is Phase 8 functional |

**Idempotency contract (owner §12):** client-generated key at checkout submit → server claims by inserting (23505 → existing/in-progress) → retry with same key returns existing order; new order = new key. **InstaPay does NOT use this key** — dedupe is already DB-enforced by `unique_transaction_ref` `UNIQUE(transaction_reference, payment_method)` on `payment_receipts`; `orders.idempotency_key` remains NULL there.

---

## 7. `orders.amount` — KEEP `numeric` (no narrowing; owner §4)

| Surface | Type (production) | Scale/precision | Max ordered observed |
|---|---|---|---|
| `orders.amount` | `numeric` (untyped) | unbounded | 0 rows (currently) |
| `invoices.amount` | `numeric(10,2)` | 2dp, max 99,999,999.99 | 13,983 (evidence §4) |
| `payment_receipts.amount` | `numeric(12,2)` | 2dp, max 9,999,999,999.99 | — |
| `payment_intents.amount_minor` | `integer` (minor) | 2dp, max 21,474,836.47 major | — |
| `payments.amount` | `numeric` (untyped) | unbounded | — |

**Code rounding (proven):** `round2 = Math.round(x*100)/100` applied to each component and the total (`pricing.ts:110`); `amount_minor = Math.round(total*100)` (`checkoutSessionService:304`); verification tolerance in major units (`verifyPaidAmount.ts:23`). **No technical cap** exists: maximum plausible order (qty-scaled Coaching Plus EGP 9999) is orders of magnitude below every surface maximum.

**Decision:** no type change; no artificial default; EGP/USD major units with 2dp rounding at every boundary (currency attribution via `orders.currency`; `fx_rate numeric(12,6)` stays on invoices/payment_intents). Optional M1B defensive `CHECK (amount >= 0)` (mirrors `payment_intents_amount_minor_check`/`product_prices_amount_check`) — flagged optional, can be dropped without impact.

---

## 8. `orders.status` — unchanged; producers repaired, never constraint-widened

- Existing CHECK **kept as-is** in M1 (`pending\|pending_manual_review\|processing\|shipped\|delivered\|cancelled\|refunded`). `completed`/`confirmed` **never** added.
- **payment-webhook** `completed` → payment outcome → writes `orders.payment_status='paid'`; stops writing `orders.status`.
- **MissionControl** `confirmed` → operational transition defined in its contract (confirm = payment-settled for a manually-vetted InstaPay order) → `status:'processing'` + `payment_status:'paid'`; removed from `ORDER_STATUSES`.
- **No new producer** may write an unapproved status (governance contractor for Phase B paths).
- **`fulfillment_status`** carries no overlap with `orders.status`: orders.status remains the legacy business artifact; fulfillment is a separate lifecycle fixed with Bosta/DHL (TV-2/3) — nullable, no invented vocabulary in M1.

---

## 9. `source_channel`

`web_checkout | fourthwall_storefront | admin_manual | api_partner | legacy` (CHECK in M1B). `instapay_manual` removed — InstaPay = `web_checkout` + `payment_method='instapay'` + `region='EG'`. No CHECK in M1A.

---

## 10. Producer inventory & code-compat phase (gate before M1B)

| # | Producer | Type | Operation | Fix (code-compat, not M1A) |
|---|---|---|---|---|
| 1 | `app/api/checkout/instapay/route.ts:381` | INSERT | orders | add `region:'EG'`, `currency:'EGP'`, `source_channel:'web_checkout'`, `payment_method:'instapay'`, `payment_status:'pending'` |
| 2 | `shared/lib/RealtimeSyncService.ts:195` | UPSERT (browser) | orders | never create rows missing `region`/`currency`; scope its payload (only latent INSERT besides InstaPay) |
| 3 | `supabase/functions/payment-webhook/index.ts:70` | UPDATE | orders+payments | `completed` → `orders.payment_status='paid'`; stop touching `orders.status` |
| 4 | `legacy-pages/MissionControl.tsx:1149/1173` | UPDATE (browser) | orders | drop `confirmed`; confirm → `status:'processing'`+`payment_status:'paid'` |
| 5 | `app/api/admin/payment-receipts/[id]/route.ts` | UPDATE | orders | also set `payment_status` on verify/reject |
| 6 | online checkout (Kashier/global) | NEW INSERT | orders | built against final M1A columns; sets `invoice_id` + snapshots |
| 7 | mirror ingest (Fourthwall) | NEW INSERT/UPDATE | orders | sets `external_provider='FOURTHWALL'` + pairing + `external_sync_status` |
| 8 | admin manual create | future | orders | via admin PATCH (Phase 8) |

Consumers (orders API, admin lists, Dashboard, `useAdminData`) are read-only and unaffected (additive nullable).

---

## 11. M1A / M1B payload (unchanged separation)

- **M1A** (additive, backward-compatible): 13 nullable columns + `invoice_id` FK + pairing CHECK + 3 indexes (2 partial unique). Nothing in M1A can reject a legacy write. **No NOT NULL, no M1B CHECKs, no defaults.**
- **Code compat phase** (§10) → **verification gates** (§13) → **observation (min 30 min + 10 gates, §13b)** → only then:
- **M1B** (enforcement): `NOT NULL` region/currency; CHECKs (`region EG|GLOBAL`, `currency EGP|USD`, `payment_status` invoices vocab, `payment_method` proven rail vocab, `source_channel`); `VALIDATE` existing `items` type-Check; optional `amount>=0`; `VALIDATE` path; regenerate types. **No RLS/grant change; no price change.**

---

## 12. Rollback

- M1A rollback: drop the 3 indexes, 2 constraints, 13 columns → identical to today (0 rows).
- M1B rollback: drop the added CHECKs/NOT NULLs → additive, reversible.
- `invoice_id ON DELETE SET NULL` keeps orders alive if an invoice is cleaned; InstaPay receipt-upload failure path already compensates (`route.ts:418/464`).
- All constraints introduced `NOT VALID` → `VALIDATE` only after §13 queries pass (a failure = caught Phase-B writer defect, reversible, no production impact).

---

## 13. Verification gates

### 13a — Pre-flight (before M1A apply; read-only)
```sql
select count(*) from public.orders;                                  -- expect 0
select count(*) from public.orders
 where external_provider is not null or external_order_id is not null
    or invoice_id is not null or idempotency_key is not null;         -- expect 0
select idempotency_key, count(*) from public.orders
 where idempotency_key is not null group by 1 having count(*)>1;      -- expect 0
```

### 13b — Post-flight (after M1A; then observation window)
```sql
-- shape / constraints / indexes / rows (see §M1A SQL REVIEW postflight)
select count(*) from public.orders;
select status, count(*) from public.orders group by 1;   -- only CHECK values
```

**Observation gate (owner §17) — minimum 30 min AFTER compatible code deploys + all verification passes; success requires ALL 10:**
1. every order producer writes `region`/`currency` after code phase;
2. no producer yields NULL where required;
3. no disallowed `orders.status` values;
4. no duplicate idempotency keys;
5. no orphan invoice/order links;
6. no duplicate external provider/order pairs;
7. no new errors in order creation/update paths;
8. InstaPay path still works (201 E2E);
9. admin read path still works;
10. RealtimeSync does not re-introduce NULL `region`/`currency`.

Only then `M1B enforcement`.

---

## 14. M1A SQL (DRAFT — review artifact)

File: `docs/governance/phase1/sql/M1A_orders_additive_draft.sql` (created as a review artifact under `docs/`, **NOT** in `supabase/migrations/`, never applied). See the **M1A SQL REVIEW** deliverable for exact SQL, per-object rationale, dependency impact, rollback, pre/postflight queries, files affected, and the no-production-change confirmation.

**Owner decision points still open (non-blocking for M1A draft):** ① approve M1A SQL REVIEW; ② confirm Fourthwall pairing/sync semantics at TV-8; ③ confirm `external_sync_status` value vocabulary when defined; ④ approve M1B only after the 10-gate observation passes.

```text
M1 Design = APPROVED WITH FINAL CORRECTIONS
M1A SQL   = DRAFT ONLY
M1B       = NOT APPROVED
Production= UNTOUCHED
```