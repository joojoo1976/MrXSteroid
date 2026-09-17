-- ==============================================================================
-- ROLLBACK SCRIPT: 20260917140000_rollback_phase3_schema.sql
-- PURPOSE: Roll back Final Gate v5.1 Phase 3 schema changes
--          (merchant config tables, canonical catalog seed, C7 de-dupe key).
-- WARNING: Reference only - review before running in production.
-- ==============================================================================

-- 1. Remove canonical catalog seed (§29/§34). Only the seeded slugs are touched;
--    legacy rows (e.g. the pre-existing digital-book product) are untouched.
delete from public.kashier_product_mappings m
using public.products p
where m.product_id = p.id and p.slug in ('protocol','tactical','smart-pro');

delete from public.product_prices pp
using public.products p
where pp.product_id = p.id and p.slug in ('protocol','tactical','smart-pro');

delete from public.products
where slug in ('protocol','tactical','smart-pro')
  and not exists (select 1 from public.product_prices pp where pp.product_id = products.id)
  and not exists (select 1 from public.kashier_product_mappings m where m.product_id = products.id);

-- 2. Drop Phase 3 tables
drop table if exists public.kashier_product_mappings cascade;
drop table if exists public.merchant_configs cascade;
drop table if exists public.product_prices cascade;

-- 3. Remove canonical-catalog columns added to products
alter table public.products
    drop column if exists name_ar,
    drop column if exists name_en,
    drop column if exists description_ar,
    drop column if exists description_en,
    drop column if exists active;

-- 4. Roll back C7 webhook de-dupe key + Phase 3 webhook_events columns
drop index if exists public.webhook_events_provider_txn_status_unique;
drop index if exists public.idx_webhook_events_transaction_id;
drop index if exists public.idx_webhook_events_processing_status;

drop function if exists public.bump_webhook_attempt(text, text);

alter table public.webhook_events
    drop column if exists transaction_id,
    drop column if exists processing_status,
    drop column if exists raw_payload,
    drop column if exists updated_at;
