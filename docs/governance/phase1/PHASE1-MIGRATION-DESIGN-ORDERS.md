# PHASE 1 — MIGRATION DESIGN: CANONICAL `orders`

**Companion to:** `PHASE1-DECISION-RECORD.md` (D1 = Option A convergence, D7 = admin writes via server routes)
**Mode:** DESIGN ONLY — **no SQL was executed, no constraint was created, nothing was applied.**
**Governing rules:** prompt §13 (canonical order contract), §34 (financial snapshot), §50 (migration design), §51 (rollback), §55 (no duplication / reuse existing names).

---

## 1. Scope and non-goals

**In scope (M1–M4 below):** additive canonical columns on `public.orders`, integrity constraints, indexes, RLS/grants posture, `updated_at` trigger, staged rollout, backfill policy.

**Explicit non-goals (deferred, and why):**

| Deferred | Reason | Target phase |
| --- | --- | --- |
| Renaming/dropping `amount`, `status`, `items` | Existing writers use them (`instapay/route.ts:391-393`, `MissionControl.tsx:1173`, `supabase/functions/payment-webhook/index.ts:68`). Renaming would be a breaking change with no requirement behind it. | never (unless owner asks) |
| `order_items` normalisation table | Needs the §12 decision on line-level snapshots; `items` jsonb can be constrained now without a rewrite. | Phase 3 (design brief R3) |
| Shipping columns (`shipping_provider`, `tracking_number`, quoted/charged amounts, address snapshot) | The right home is the shipping entity designed with the Bosta/DHL contract; adding them to `orders` now would pre-empt that design. | Phase 4/6 (design brief R4) |
| `external_orders` mirror table | Fourthwall API/webhooks are still `BLOCKED`; the mirror shape must follow the verified payload. | Phase 5 (design brief R5) |
| Invoice line items + numbering | Separate schema decision. | Phase 3 (R7) |
| `orders.status` CHECK constraint | Its Production vocabulary is unknown (3 writers) and must be dumped first. Design is prepared but **not** proposed for this migration. | Phase 2 (after the read-only dump) |

---

## 2. Mandatory preconditions (READ-ONLY, must be run by the owner/DBA before M1 is written)

The repository contains **no** migration that creates `orders` (`git grep -i "create table" supabase/migrations` → 0 matches). Therefore the following must be captured first and pasted back as evidence. **None of these statements mutate anything.**

```sql
-- P1. Actual columns / types / defaults / nullability
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'orders'
order by ordinal_position;

-- P2. Constraints (PK, FKs, CHECKs, NOT NULLs)
select conname, contype, pg_get_constraintdef(oid)
from pg_constraint where conrelid = 'public.orders'::regclass;

-- P3. Indexes
select indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename = 'orders';

-- P4. RLS state + policies
select relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.orders'::regclass;
select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as check_expr
from pg_policy where polrelid = 'public.orders'::regclass;

-- P5. Triggers
select tgname, pg_get_triggerdef(oid) from pg_trigger
where tgrelid = 'public.orders'::regclass and not tgisinternal;

-- P6. Table-level grants (who can write today)
select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'orders';

-- P7. Row count + status vocabulary (drives the lock strategy and the future status CHECK)
select count(*) as total_orders from public.orders;
select status, count(*) from public.orders group by 1 order by 2 desc;

-- P8. Inbound FKs from other tables (what references orders)
select conrelid::regclass as from_table, conname, pg_get_constraintdef(oid)
from pg_constraint
where confrelid = 'public.orders'::regclass;

-- P9. Production pricing overrides that could contradict this design
select key, value from public.admin_settings
where key ilike 'PRICING%' or key ilike '%shipping%' or key ilike '%coaching%';
```

**Gate:** if P1 returns columns that differ from `shared/types/db_types.ts:285+` (generated types may be stale — Phase 0 CONFLICT #5), the column list in §3 must be re-checked for collisions before writing M1. **No M1 SQL is authored before P1–P9 are returned.**

---

## 3. M1 — Additive canonical columns

All columns are **nullable with no default**, so `ALTER TABLE ... ADD COLUMN` is **metadata-only**: no row rewrite, no long lock. Where a name already exists elsewhere it is reused verbatim (prompt §55) rather than invented.

| # | Column | Type | Null | Default | Integrity | Naming source | Purpose |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `region` | `text` | YES | — | C1: `CHECK (region IN ('EGYPT','GLOBAL'))` | identical to `product_prices.region` / `merchant_configs.region` | Channel authority on the order |
| 2 | `currency` | `text` | YES | — | C2: `CHECK (currency IN ('EGP','USD'))` | identical to `product_prices.currency` | EG=EGP / GLOBAL=USD, no FX |
| 3 | `payment_provider_merchant` | `text` | YES | — | — | **exact existing name on `invoices`** (`20260910220000`) → this is the owner's "merchant" field | MID/merchant actually charged |
| 4 | `payment_status` | `text` | YES | — | C3: `CHECK (payment_status IN ('pending','paid','failed','cancelled','refunded','partially_refunded','unknown','initiated'))` | **identical to `invoices_payment_status_check`** → one vocabulary, not two | Payment state |
| 5 | `fulfillment_status` | `text` | YES | — | C4: `CHECK (fulfillment_status IN ('unfulfilled','processing','shipped','delivered','cancelled','not_applicable'))` | **new vocabulary** (nothing exists today) — `PROPOSED` | Fulfilment state |
| 6 | `external_provider` | `text` | YES | — | documented values: `FOURTHWALL`; deliberately **no CHECK** so future providers are not blocked | new | Which external system owns the order |
| 7 | `external_order_id` | `text` | YES | — | U1: partial unique `(external_provider, external_order_id)` | new (prompt §13) | Mirror key for the Fourthwall order |
| 8 | `external_payment_reference` | `text` | YES | — | — | new (prompt §13) | External payment/transaction reference |
| 9 | `external_sync_status` | `text` | YES | — | C5: `CHECK (external_sync_status IN ('pending','synced','failed','abandoned'))` | new (D2 mirror lifecycle) | Mirror sync state, Admin-visible |
| 10 | `source_channel` | `text` | YES | — | C6: `CHECK (source_channel IN ('EGYPT_CHECKOUT','GLOBAL_STORE','ADMIN_MANUAL','LEGACY_IMPORT'))` | new | Distinguishes writers (esp. legacy rows) |
| 11 | `subtotal_amount` | `numeric(12,2)` | YES | — | — | new | Pre-discount goods total (snapshot) |
| 12 | `discount_amount` | `numeric(12,2)` | YES | — | C7: `CHECK (discount_amount IS NULL OR discount_amount >= 0)` | new | Promo discount (snapshot) |
| 13 | `shipping_amount` | `numeric(12,2)` | YES | — | C8: `CHECK (shipping_amount IS NULL OR shipping_amount >= 0)` | new | Charged shipping — **199 EGP** for EG per D3 |
| 14 | `tax_amount` | `numeric(12,2)` | YES | — | C9: `CHECK (tax_amount IS NULL OR tax_amount >= 0)` | new | Reserved only; no tax logic exists (§45: do not invent) |
| 15 | `grand_total` | `numeric(12,2)` | YES | — | C10: `CHECK (grand_total IS NULL OR grand_total >= 0)` | new | Charged total (snapshot) |
| 16 | `payment_method` | `text` | YES | — | documented values `kashier`, `instapay`, `stripe`, `paymob`, `spaceremit`, `external_store` | mirrors `app/api/payments/create-invoice/route.ts:36` | Method actually used |
| 17 | `merchant_reference` | `text` | YES | — | — | new (prompt §13) | Provider-side reference |
| 18 | `invoice_id` | `uuid` | YES | — | FK → `public.invoices(id)` `ON DELETE SET NULL` | reuses the existing invoice engine (§55) | Order ↔ invoice convergence |
| 19 | `payment_intent_id` | `uuid` | YES | — | FK → `public.payment_intents(id)` `ON DELETE SET NULL` | reuses the internal payment record | Order ↔ payment convergence |
| 20 | `idempotency_key` | `text` | YES | — | U2: partial unique `where idempotency_key is not null` | **same pattern as `invoices.idempotency_key`** (`20260918120000`) | Order-level duplicate protection |
| 21 | `schema_version` | `smallint` | YES | — | C11: `CHECK (schema_version IS NULL OR schema_version >= 1)` | new | Marks rows written under the canonical contract (new writers set `1`; legacy rows stay NULL) |

**Legacy columns retained and untouched** (still written by existing code): `id, user_id, fullname, email, phone, address, city, country, postalcode, amount, status, items, created_at, updated_at`.
**Transitional invariant (documented, not enforced in M1):** every new writer sets `amount = grand_total` so existing readers keep working; promoted to a constraint only in stage A4.

---

## 4. M2 — Constraints and indexes

Every CHECK above is added **`NOT VALID`** (`ADD CONSTRAINT ... CHECK (...) NOT VALID`). Rationale: `NOT VALID` skips the table scan at add-time, so legacy rows with unexpected values can never fail the forward migration; validation is a separate deliberate step in stage A4 (prompt §51 — a forward migration must not fail on unknown legacy data).

| ID | Object | Definition (design) | Notes |
| --- | --- | --- | --- |
| U1 | Unique index | `unique (external_provider, external_order_id)` partial `where external_order_id is not null` | Idempotent mirror upsert key (§42/§60) |
| U2 | Unique index | `unique (idempotency_key)` partial `where idempotency_key is not null` | Mirrors `idx_invoices_idempotency_key` |
| X1 | Index | `(region, payment_status, created_at desc)` | Admin list + reconciliation filters |
| X2 | Index | `(fulfillment_status)` partial where not null | Admin fulfilment queue |
| X3 | Index | `(invoice_id)`, `(payment_intent_id)` | FK lookups + reconciliation joins |
| X4 | Index | `(lower(email))` | Reconciliation fallback match for mirror rows — **check P3 first**, skip if an equivalent index exists |
| C12 | `items` shape | `CHECK (items IS NULL OR jsonb_typeof(items) = 'array') NOT VALID` | Blocks non-array writes into the legacy jsonb column |
| C13 | Channel completeness | `CHECK (region IS NULL OR (currency IS NOT NULL AND grand_total IS NOT NULL AND source_channel IS NOT NULL)) NOT VALID` | "An order that declares a channel must be financially complete" — validated in A4 |
| C14 | Channel/currency pairing | `CHECK (region IS NULL OR ((region='EGYPT' AND currency='EGP') OR (region='GLOBAL' AND currency='USD'))) NOT VALID` | Enforces prompt §31 (`GLOBAL+EGP`, `EG+USD` forbidden) **at the database level** |

**Lock strategy (decision rule, not a guess):**
* `P7.count(*)` small (order of tens of thousands) → plain `CREATE INDEX` inside the migration transaction, consistent with the repo's existing migration style.
* larger → `CREATE INDEX CONCURRENTLY`, which **cannot** run inside a transaction; it must be its own migration file executed outside a transaction, and an invalid leftover index is dropped and retried (no retry storms).
**Statement order inside M1:** columns → constraints (`NOT VALID`) → indexes. Nothing else in that transaction.

---

## 5. M3 — RLS and grants posture (implements D7)

Current state is unknown until P4/P6 are returned. Target posture:

| Step | Change | Rationale | Timing |
| --- | --- | --- | --- |
| M3a-1 | `ENABLE ROW LEVEL SECURITY` (idempotent) | Fail-closed default; service role bypasses RLS | can ship with M1 |
| M3a-2 | Policy `"Orders: users read own"` — `SELECT USING (auth.uid() = user_id)` | Customer order history must keep working | with M1 |
| M3a-3 | Policy `"Orders: admin read"` — `SELECT USING (coalesce((select role from public.profiles where id = (select auth.uid())),'user') = 'admin')` | **exact pattern already used** by the v5.1 backbone (`20260917150000:386-434`) → REUSE | with M1 |
| M3a-4 | **No** INSERT/UPDATE/DELETE policy for `anon` or `authenticated` | §11: writes only through server routes with service role | with M1 (**unless** P4 shows the current dashboard depends on client UPDATE — see M3b) |
| M3b-1 | `REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;` | Same pattern as the existing hardening `20260923170000_phase4_restrict_pricing_merchant_tables.sql` → REUSE | **only together with** the Phase 8 commit that ships `PATCH /api/admin/orders/[id]` and switches `MissionControl` to it (OPEN-6) |
| M3b-2 | Keep `SELECT` grant; optionally also revoke `SELECT` from `anon` (unauthenticated) | Customers are authenticated; `anon` has no legitimate need | with M3b |

**Hard dependency (must not be violated):** revoking client `UPDATE` while `legacy-pages/MissionControl.tsx:1173` still writes `orders` from the browser would break admin order handling. M3b therefore ships **in the same commit** as the admin route + UI switch, never before.

**Unchanged (FROZEN, prompt §2):** `payment_receipts` RLS/storage, support_tickets policy, `trg_fraud_decision_apply_flag`, pricing/merchant table privileges, leaked-password protection.

---

## 6. M4 — Trigger impact

| Question | Answer | Action |
| --- | --- | --- |
| Does `orders` have an `updated_at` trigger today? | **Unknown** — P5 must be returned | If absent: create `set_orders_updated_at` + `before update` trigger, mirroring `products` (`20260804173536:91-102`, function `handle_products_updated_at`) → **REUSE pattern** |
| Do any existing triggers on `orders` write audit rows? | Unknown (P5) | If yes, they are preserved untouched; M4 adds nothing that conflicts |
| Do other tables' FKs point at `orders`? | `payments.order_id → orders.id` is confirmed in generated types (`payments_order_id_fkey`); `payment_receipts.order_id` likely too | P8 must list them. **No FK is added, changed or dropped by this migration** |
| Does adding new columns affect `supabase/functions/payment-webhook/index.ts:68` (writes `orders`)? | No — new columns are nullable and that function keeps working unchanged | None |
| Are there generated columns / views over `orders`? | Unknown | P1/P2 must be checked; if a view or materialized view selects `orders.*`, new columns appear in it (additive, non-breaking) — but any `select *` view with an explicit column list is unaffected |

---

## 7. Backfill policy (deliberately conservative)

**Default: no backfill.** Legacy rows keep `NULL` in every new column, which is the honest representation of "written before the canonical contract existed". The Admin UI must render these as **`LEGACY (unverified)`**, never as a fabricated `GLOBAL`/`EGP` value (prompt §38 — "do not create fake placeholders that look like verified data").

**Optional, evidence-based backfill (separate migration, owner approval required first):** rows provably originating from manual InstaPay review can be backfilled because the evidence exists in-table:

```text
orders o  where exists (
    select 1 from public.payment_receipts r
    where r.order_id = o.id and r.payment_method = 'instapay'
)
  → region = 'EGYPT', currency = 'EGP', payment_method = 'instapay',
    source_channel = 'EGYPT_CHECKOUT', merchant_reference = r.transaction_reference
```

Rules for that optional migration: (a) run only after `select count(*)` of the matched set is reported to the owner; (b) batch the `UPDATE` (e.g. 5k rows per statement) to avoid a long lock; (c) `amount` is copied into `grand_total` and `subtotal_amount` is left `NULL` (the pre-discount split is **not** recoverable — do not invent it); (d) rollback = `UPDATE ... SET <cols> = NULL` for exactly the affected ids, recorded before the change.

**Never backfilled:** `fulfillment_status`, `external_*`, `shipping_amount`, `tax_amount`, `payment_status` (unless a receipt's own status proves `paid`).

---

## 8. Existing-row impact and write-path impact

| Existing writer | File | Impact of M1 | Required follow-up |
| --- | --- | --- | --- |
| InstaPay checkout | `app/api/checkout/instapay/route.ts:379-396` | keeps working (nullable columns) | Phase 2/4: set `region='EGYPT'`, `currency='EGP'`, `payment_provider_merchant`, `payment_status`, `payment_method='instapay'`, `source_channel='EGYPT_CHECKOUT'`, `schema_version=1`, and **stop adding shipping for the digital tier** |
| Admin order status (browser) | `legacy-pages/MissionControl.tsx:1173` | keeps working until M3b | Phase 8: move to `PATCH /api/admin/orders/[id]`, then M3b |
| Edge function | `supabase/functions/payment-webhook/index.ts:68` | keeps working | Phase 3: align with the canonical contract (or retire if the Kashier session path supersedes it) |
| Kashier session path | `server/payments/checkout/checkoutSessionService.ts` | no order row is created today → nothing to migrate | Phase 3: create/attach the canonical order (`invoice_id`, `payment_intent_id`) |
| Dashboard reader | `features/admin/useAdminData.ts:101` | keeps working (`select *`) | Phase 8: render new fields + `LEGACY (unverified)` fallback |

**Row-rewrite risk:** M1 (add columns) and M2 (`NOT VALID` constraints) rewrite **zero** rows. Only the optional §7 backfill rewrites rows, in batches, with a recorded id set for rollback.

---

## 9. Staged rollout (each stage is independently reversible)

| Stage | Change | Gate to proceed | Rollback |
| --- | --- | --- | --- |
| **A1** | M1 columns + M2 `NOT VALID` constraints + indexes (+ M4 trigger if absent) + M3a RLS/read policies | P1–P9 returned; Postgres migration applies cleanly on a **branch/preview** database first | `DROP COLUMN` ×21, `DROP CONSTRAINT`, `DROP INDEX` (triggers/policies only if newly created) |
| **A2** | Writers populate (InstaPay route, Kashier session path, mirror sync) and set `schema_version = 1`; `amount = grand_total` dual-write begins | Stage A1 verified; Phase 2 region guards merged | Revert writer commit; columns keep NULL (harmless) |
| **A3** | Readers switch (Admin list/detail, reconciliation joins) with `LEGACY (unverified)` rendering | A2 verified on real orders | Revert reader commit |
| **A4** | `VALIDATE CONSTRAINT` for C1–C14 + promote the `amount = grand_total` invariant to a real constraint | `select count(*)` of violating rows = **0** for each constraint, reported as evidence | Constraints stay `NOT VALID` (no data change) |
| **A5** | Optional evidence-based backfill (§7) | Owner approval + matched-row count reported | `UPDATE ... SET ... = NULL` for the recorded id set |

**Never in this migration:** renames, drops of existing columns, data truncation, destructive rollback, or any `DROP` of an object this migration did not create (prompt §51).

---

## 10. Downstream impact statements (required by §50)

| Area | Impact | Detail |
| --- | --- | --- |
| **Admin dashboard** | Read-only additive; one behavioural rule added | `useAdminData.ts` keeps working via `select *`. New UI must render `LEGACY (unverified)` for `NULL` region/currency. `MissionControl` order mutation moves to the server route in Phase 8 (M3b ships with it) |
| **Payment** | Positive: order gains a real payment linkage | `invoice_id` / `payment_intent_id` / `payment_status` / `payment_method` let reconciliation compare provider → intent → invoice → order without guessing. `payment_status` reuses the **existing** `invoices` vocabulary, so no new state machine is introduced |
| **Reconciliation** | New mismatch classes become detectable | `orders.payment_status='paid'` without `invoice_id`, or mirror rows stuck at `external_sync_status='pending'`, are now visible. `reconciliation_runs` schema is unchanged (`20260918160000`) |
| **Entitlement** | No schema impact | `entitlementService` keys on `(user_id, product_id, invoice_id)`; the order link is additional context, not a new key |
| **Affiliate / ledger** | No schema impact | `splitEngine` / `affiliate_commission_ledger` are keyed by invoice; `orders` gains only read context |
| **Shipping** | None in this migration | Shipping columns are intentionally deferred to R4 so the Bosta/DHL contract dictates the shape |
| **Security baseline** | Untouched | No FROZEN object is modified (prompt §2). M3b follows the **existing** `20260923170000` privilege-revocation pattern |

---

## 11. Verification plan (post-apply, before A2)

```sql
-- V1 column contract
select column_name, data_type, is_nullable from information_schema.columns
where table_schema='public' and table_name='orders' and column_name in
('region','currency','payment_provider_merchant','payment_status','fulfillment_status',
 'external_provider','external_order_id','external_payment_reference','external_sync_status',
 'source_channel','subtotal_amount','discount_amount','shipping_amount','tax_amount',
 'grand_total','payment_method','merchant_reference','invoice_id','payment_intent_id',
 'idempotency_key','schema_version');

-- V2 constraints present (and NOT VALID while in A1–A3)
select conname, convalidated from pg_constraint where conrelid='public.orders'::regclass;

-- V3 indexes
select indexname, indexdef from pg_indexes where schemaname='public' and tablename='orders';

-- V4 RLS + grants posture (expect: RLS on, no anon/authenticated write grants after M3b)
select relrowsecurity from pg_class where oid='public.orders'::regclass;
select grantee, privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name='orders';

-- V5 zero-row-rewrite proof for A1 (row count and a sample of untouched legacy rows)
select count(*) as total, count(region) as with_region from public.orders;
```

**Acceptance criteria for A1:** V1 returns 21 columns with the exact names/types, V2 lists every C/U constraint, V3 lists X1–X4, V4 shows RLS enabled, and V5 shows legacy rows still `NULL` in `region` (no accidental write). No provider was called and no order was created during verification.

---

## 12. Approval gate

This is a **design**. It is not approved, not scheduled and not applied. Required before writing the SQL file:

1. **OPEN-1** resolved (formalise `orders` in place — recommended — vs new canonical table).
2. **P1–P9** returned by the owner/DBA (read-only) as evidence.
3. **OPEN-6** acknowledged (M3b ships only with the Phase 8 admin route).
4. Owner sign-off on the exact column list of §3 (especially `fulfillment_status` values and `source_channel` values, which are new vocabularies).

**Status: MIGRATION DESIGN COMPLETE — NO SQL AUTHORED, NOTHING APPLIED.**
