-- =============================================================================
-- MIGRATION: 20261118150000_create_invoice_lines.sql
-- PURPOSE:   Phase 1 — Invoice-First Billing foundation.
--            Adds the persisted invoice line-item table. Before this migration
--            an invoice only carried a single tier_id plus a JSON metadata blob,
--            so a multi-line invoice was not representable in the schema.
--
-- SAFETY & GOVERNANCE:
--   - Additive only: CREATE TABLE / INDEX / POLICY. No DROP, RENAME, type change
--     or SET NOT NULL on any existing table.
--   - Does not read or write invoices.total_amount or invoices.status.
--   - The table is intentionally NOT used by any collection path until Phase 4.
--   - Rows are service-role write-only; authenticated users may read lines that
--     belong to their own invoice. No anon access.
-- =============================================================================

create table if not exists public.invoice_lines (
    id               uuid primary key default gen_random_uuid(),
    invoice_id       uuid not null references public.invoices(id) on delete cascade,
    order_id         uuid references public.orders(id) on delete set null,
    line_type        text not null check (line_type in (
                         'product', 'addon', 'shipping', 'service', 'discount', 'tax'
                     )),
    sku              text,
    product_id       text,
    name_snapshot    text not null,
    language         text check (language is null or language in ('ar', 'en')),
    edition          text,
    qty              integer not null default 1 check (qty > 0),
    unit_price       numeric(10,2) not null check (unit_price >= 0),
    discount_amount  numeric(10,2) not null default 0 check (discount_amount >= 0),
    tax_amount       numeric(10,2) not null default 0 check (tax_amount >= 0),
    -- Negative only for line_type = 'discount'; enforced below.
    line_total       numeric(10,2) not null,
    currency         varchar(10) not null,
    source           text not null,
    position         integer not null check (position >= 0),
    metadata         jsonb not null default '{}'::jsonb,
    created_at       timestamptz not null default now(),

    constraint invoice_lines_negative_total_only_for_discount check (
        line_total >= 0 or line_type = 'discount'
    ),
    -- Positions are the stable ordering key and the idempotency guard for the
    -- backfill: re-running it cannot append a second row at the same position.
    constraint invoice_lines_invoice_position_key unique (invoice_id, position)
);

create index if not exists idx_invoice_lines_invoice_id
    on public.invoice_lines (invoice_id);

create index if not exists idx_invoice_lines_order_id
    on public.invoice_lines (order_id);

create index if not exists idx_invoice_lines_line_type
    on public.invoice_lines (line_type);

comment on table public.invoice_lines is
    'Persisted invoice line items (Phase 1). One row per product/addon/service/'
    'shipping/discount/tax line. Sum(line_total) must equal invoices.amount for '
    'every covered invoice. Written only by the server; never by a payment gateway.';

comment on column public.invoice_lines.source is
    'Provenance of the row: e.g. backfill:order_items, backfill:invoice_total, '
    'or (from Phase 4) the pricing version/hash that produced the line.';

comment on column public.invoice_lines.metadata is
    'Non-standard line details. Backfilled estimates carry backfill_incomplete=true '
    'and a machine-readable reason; no silent guessing.';

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: service role writes; owners read their own invoice lines.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.invoice_lines enable row level security;

revoke all on public.invoice_lines from anon, authenticated;
grant select on public.invoice_lines to authenticated;

drop policy if exists "Users can view own invoice lines" on public.invoice_lines;
create policy "Users can view own invoice lines"
    on public.invoice_lines
    for select
    using (
        exists (
            select 1
            from public.invoices i
            where i.id = invoice_lines.invoice_id
              and i.user_id = auth.uid()
        )
    );
