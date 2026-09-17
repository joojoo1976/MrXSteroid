-- ==============================================================================
-- MIGRATION: 20260917141057_phase3_merchant_config_tables_and_seeds.sql
-- PURPOSE: Final Gate v5.1 Phase 3 - Schema & Migrations.
--          Payment Catalog & Routing Governance tables (§32/§33) plus the
--          canonical product catalog seed (§29-§31).
--          1. Extend products with canonical-catalog columns (§32)
--          2. product_prices        - one regional price per product (§30/§32)
--          3. merchant_configs      - per-region provider identity (§4.1/§32)
--          4. kashier_product_mappings - KASHIER SKU != CANONICAL PRODUCT (§31/§33)
--          5. Seed canonical catalog: MRX-PROTOCOL 499 EGP, MRX-TACTICAL 749 EGP,
--             MRX-SMART-PRO 10,848 EGP
--          6. Seed Egypt merchant identity MID-48761-625 (B2 resolved)
--          Additive only. No destructive changes.
-- ==============================================================================

-- 1. Extend products with canonical-catalog columns (§32)
alter table public.products
    add column if not exists name_ar text,
    add column if not exists name_en text,
    add column if not exists description_ar text,
    add column if not exists description_en text,
    add column if not exists active boolean not null default true;

-- 2. product_prices - one regional price per product (§30/§32)
create table if not exists public.product_prices (
    id          uuid primary key default gen_random_uuid(),
    product_id  uuid not null references public.products(id) on delete cascade,
    region      text not null check (region in ('EGYPT','GLOBAL')),
    currency    text not null check (currency in ('EGP','USD')),
    amount      numeric(18,2) not null check (amount > 0),
    active      boolean not null default true,
    created_at  timestamptz not null default timezone('utc', now()),
    updated_at  timestamptz not null default timezone('utc', now())
);

-- Only ONE active price per (product, region); historical rows may coexist.
create unique index if not exists product_prices_active_unique
    on public.product_prices (product_id, region) where active;
create index if not exists idx_product_prices_product_region
    on public.product_prices (product_id, region);
create index if not exists idx_product_prices_region_active
    on public.product_prices (region, active);
create index if not exists idx_product_prices_active
    on public.product_prices (active);

-- 3. merchant_configs - per-region provider identity (§4.1/§32)
-- *_ref columns reference the secret store (Vault) by name, never raw keys.
create table if not exists public.merchant_configs (
    id                       uuid primary key default gen_random_uuid(),
    region                   text not null check (region in ('EGYPT','GLOBAL')) unique,
    merchant_id              text not null,
    currency                 text not null check (currency in ('EGP','USD')),
    mode                     text not null default 'test' check (mode in ('test','live')),
    payment_api_key_ref      text,
    secret_key_ref           text,
    webhook_verification_ref text,
    active                   boolean not null default true,
    created_at               timestamptz not null default timezone('utc', now()),
    updated_at               timestamptz not null default timezone('utc', now())
);

create index if not exists idx_merchant_configs_region_active
    on public.merchant_configs (region, active);

-- 4. kashier_product_mappings - KASHIER SKU != CANONICAL PRODUCT (§31/§33)
create table if not exists public.kashier_product_mappings (
    id                      uuid primary key default gen_random_uuid(),
    product_id              uuid not null references public.products(id) on delete cascade,
    region                  text not null check (region in ('EGYPT','GLOBAL')),
    kashier_product_id      text,
    kashier_payment_page_id text,
    kashier_payment_link_id text,
    active                  boolean not null default true,
    created_at              timestamptz not null default timezone('utc', now()),
    updated_at              timestamptz not null default timezone('utc', now()),
    unique (product_id, region)
);

create index if not exists idx_kashier_product_mappings_region
    on public.kashier_product_mappings (region, active);

-- 5. Seed the canonical digital catalog (§29/§34) - idempotent by slug.
insert into public.products (slug, name, name_ar, name_en, sku, price, tax_rate, stock, status, active, description)
values
    ('protocol',   'البروتوكول الرقمي', 'البروتوكول الرقمي', 'The Digital Protocol', 'MRX-PROTOCOL',  499,   0, 0, 'active', true, 'The Digital Protocol'),
    ('tactical',   'الباقة التكتيكية',  'الباقة التكتيكية',  'Tactical Bundle',      'MRX-TACTICAL',  749,   0, 0, 'active', true, 'Tactical Bundle'),
    ('smart-pro',  'المحترف الذكي',    'المحترف الذكي',    'Smart Professional',    'MRX-SMART-PRO', 10848, 0, 0, 'active', true, 'Smart Professional')
on conflict (slug) do update set
    name      = excluded.name,
    name_ar   = excluded.name_ar,
    name_en   = excluded.name_en,
    sku       = excluded.sku,
    price     = excluded.price,
    status    = 'active',
    active    = true;

-- 6. EGP price rows (authoritative Egypt prices, §30) keyed by canonical slug.
insert into public.product_prices (product_id, region, currency, amount)
select p.id, 'EGYPT', 'EGP', p.price
from public.products p
where p.slug in ('protocol', 'tactical', 'smart-pro')
on conflict (product_id, region) where active do nothing;

-- 7. Kashier SKU rows - the mapping, never the canonical identity (§31).
insert into public.kashier_product_mappings (product_id, region, kashier_product_id)
select p.id, 'EGYPT', 'MRX-EG-' || right(p.sku, length(p.sku) - 4)
from public.products p
where p.slug in ('protocol', 'tactical', 'smart-pro')
on conflict (product_id, region) do nothing;

-- 8. Egypt merchant identity confirmed by the owner (B2 -> MID-48761-625).
-- Live remains BLOCKED (KASHIER_LIVE_ENABLED=false), so stored mode = 'test'.
insert into public.merchant_configs (region, merchant_id, currency, mode, active)
values ('EGYPT', 'MID-48761-625', 'EGP', 'test', true)
on conflict (region) do update set
    merchant_id = excluded.merchant_id,
    currency    = excluded.currency,
    active      = true;

-- 9. Fail-closed permissions: RLS enabled, no public policies (service-role bypasses).
alter table public.product_prices enable row level security;
alter table public.merchant_configs enable row level security;
alter table public.kashier_product_mappings enable row level security;
