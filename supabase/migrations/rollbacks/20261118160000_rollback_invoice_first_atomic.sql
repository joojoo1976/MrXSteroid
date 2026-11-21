-- Rollback — Phase 4 atomic invoice creation.
-- Apply only after the Phase 4 route is no longer calling the function.
-- Drops the function first, then the two additive invoice columns.

drop function if exists public.create_invoice_atomic(
    uuid, text, text, numeric, text, text, numeric, numeric, text, text, text,
    text, text, text, text, text, jsonb, jsonb
);

alter table public.invoices drop column if exists quote_hash;
alter table public.invoices drop column if exists pricing_version;
