-- ============================================================================
-- M1A — orders additive migration  (M1A SQL = APPROVED FOR APPLICATION)
-- ----------------------------------------------------------------------------
-- Status : M1A SQL  = APPROVED FOR APPLICATION · M1B = NOT APPROVED
-- Design : docs/governance/phase1/M1-MINIMAL-ORDERS-MIGRATION-DESIGN.md (Rev 3)
-- Scope  : ADDITIVE + backward-compatible ONLY.
--          No NOT NULL, no M1B CHECKs, no defaults, no price changes,
--          no RLS/grant changes, no application-code changes.
-- Safety : cannot reject any current producer write (all new columns NULL;
--          producers never set invoice_id/external_*/idempotency_key).
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. ADAPTIVE NULLABLE COLUMNS (M1A only)
--    region/currency: NULL in M1A → NOT NULL + CHECK only in M1B after
--    the code-compat + observation gates. NO artificial default (an EG/EGP
--    default would silently mislabel a future GLOBAL/USD order).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.orders add column if not exists region text;
comment on column public.orders.region is
  'Market region: EG | GLOBAL (owner-mandated short form). M1A nullable; M1B NOT NULL + CHECK. No default.';

alter table public.orders add column if not exists currency text;
comment on column public.orders.currency is
  'Order currency: EGP | USD. M1A nullable; M1B NOT NULL + CHECK. No default. No automatic fallback between currencies.';

alter table public.orders add column if not exists payment_provider_merchant text;
comment on column public.orders.payment_provider_merchant is
  'PSP merchant identity snapshot (kashier_egypt / kashier_global). Mirrors invoices.payment_provider_merchant.';

alter table public.orders add column if not exists payment_status text;
comment on column public.orders.payment_status is
  'Payment state snapshot. Vocabulary = invoices_payment_status_check (ONE payment vocabulary). M1B CHECK.';

alter table public.orders add column if not exists fulfillment_status text;
comment on column public.orders.fulfillment_status is
  'Fulfillment lifecycle. NO CHECK in M1; vocabulary fixed only when Bosta/DHL contracts close (TV-2/TV-3). Not overloaded with orders.status.';

alter table public.orders add column if not exists external_provider text;
comment on column public.orders.external_provider is
  'EXTERNAL COMMERCE provider only. Current value: FOURTHWALL. SPACEREMIT (payment provider) and MANUAL (channel/operation) are EXCLUDED. Future commerce providers join via their own contract.';

alter table public.orders add column if not exists external_order_id text;
comment on column public.orders.external_order_id is
  'COMMERCE provider order id. Integrity: paired with external_provider (both NULL or both set — see orders_external_pairing_check).';

alter table public.orders add column if not exists external_payment_reference text;
comment on column public.orders.external_payment_reference is
  'COMMERCE provider payment-entity reference (e.g. Fourthwall payment id) for reconciliation. NOT a PSP transaction id (those live on payment_intents/invoices).';

alter table public.orders add column if not exists external_sync_status text;
comment on column public.orders.external_sync_status is
  'LOCAL mirror-sync lifecycle. NO CHECK until the state vocabulary is defined; never conflates external-provider state with local sync state.';

alter table public.orders add column if not exists source_channel text;
comment on column public.orders.source_channel is
  'Order origin channel: web_checkout | fourthwall_storefront | admin_manual | api_partner | legacy. M1B CHECK (no CHECK in M1A).';

alter table public.orders add column if not exists payment_method text;
comment on column public.orders.payment_method is
  'PAYMENT RAIL snapshot (actual method) — never a gateway/provider name. Proven vocabulary (from payment_receipts_payment_method_check): instapay | bank_transfer | manual. Online/card rows stay NULL until a rail value is actually proven. M1B CHECK after vocabulary fixed.';

alter table public.orders add column if not exists idempotency_key text;
comment on column public.orders.idempotency_key is
  'Client-generated idempotency key claimed by order-creating paths (online checkout, mirror ingest). Partial-unique below. InstaPay keeps NULL (dedupe = unique (transaction_reference, payment_method) on payment_receipts).';

alter table public.orders add column if not exists invoice_id uuid;
comment on column public.orders.invoice_id is
  'Link to the combined invoice for this canonical order. FK invoices(id) ON DELETE SET NULL. NO UNIQUE in M1 (one-order/one-combined-invoice is application-level until proven).';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. invoice_id FK (safe in M1A: the column is exclusively NULL today; no
--    producer can create a violating row; 0 existing rows).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.orders add constraint orders_invoice_id_fkey
  foreign key (invoice_id) references public.invoices (id) on delete set null;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. EXTERNAL PAIRING INTEGRITY (owner requirement)
--    external_provider IS NULL  <=>  external_order_id IS NULL.
--    No current producer writes these columns → can never be violated.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.orders add constraint orders_external_pairing_check
  check (
    (external_provider is null and external_order_id is null)
    or
    (external_provider is not null and external_order_id is not null)
  );

-- ─────────────────────────────────────────────────────────────────────────
-- 4. INDEXES / PARTIAL UNIQUES
--    Partial uniques bound only mirror/idempotent rows; no legacy producer
--    can trip them (InstaPay leaves idempotency_key NULL; no row sets external_*).
-- ─────────────────────────────────────────────────────────────────────────
create index if not exists orders_invoice_id_idx on public.orders (invoice_id);

create unique index if not exists orders_external_order_idx
  on public.orders (external_provider, external_order_id)
  where external_provider is not null and external_order_id is not null;

create unique index if not exists orders_idempotency_key_key
  on public.orders (idempotency_key)
  where idempotency_key is not null;

-- ─────────────────────────────────────────────────────────────────────────
-- END M1A — intentionally absent: NOT NULL, all M1B CHECKs
-- (region/currency/payment_status/source_channel/payment_method), items
-- type-Check VALIDATE, amount type change, RLS/grants, price changes.
-- ============================================================================