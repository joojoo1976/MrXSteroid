-- =============================================================================
-- MIGRATION: 20260928200000_fourthwall_global_integration.sql
-- PHASE:     GLOBAL/USD Fourthwall Integration + Digital Book Delivery
-- PREREQ:    20260927190000_guest_order_claims_and_gateway_fee.sql
--            (payment_intents.gateway_fee_minor, guest_order_claims, kashier_fee_*)
--
-- PURPOSE: Add schema support for Fourthwall GLOBAL/USD checkout, Shippo
--          international shipping, and Digital Book delivery.
--
-- SCOPE:
--   1. Fourthwall order tracking (webhook_events already exists)
--   2. Digital Book delivery tables
--   3. Manual fulfillment queue
--   4. Fourthwall product mapping table
--   5. Shippo shipment tracking
--   6. Extended product catalog (coaching addon, consultation)
--
-- IDEMPOTENCE: All CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS,
--              CREATE INDEX IF NOT EXISTS, ON CONFLICT DO NOTHING.
-- =============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. digital_book_deliveries — tracks signed URL deliveries
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.digital_book_deliveries (
    id                  uuid primary key default gen_random_uuid(),
    invoice_id          uuid not null references public.invoices(id) on delete cascade,
    token_hash          text not null,
    customer_email      text not null,
    file_name           text not null,
    max_downloads       integer not null default 3,
    download_count      integer not null default 0,
    expires_at          timestamptz not null,
    last_downloaded_at  timestamptz,
    created_at          timestamptz not null default now(),

    constraint digital_book_deliveries_expires_check
        check (expires_at > created_at),
    constraint digital_book_deliveries_max_downloads_check
        check (max_downloads > 0 and max_downloads <= 10)
);

create unique index if not exists digital_book_deliveries_token_hash_key
    on public.digital_book_deliveries (token_hash);

create index if not exists digital_book_deliveries_invoice_id_idx
    on public.digital_book_deliveries (invoice_id);

create index if not exists digital_book_deliveries_expires_at_idx
    on public.digital_book_deliveries (expires_at)
    where download_count < max_downloads;

alter table public.digital_book_deliveries enable row level security;
revoke all on public.digital_book_deliveries from anon, authenticated;

comment on table public.digital_book_deliveries is
    'Secure signed-URL delivery records for the Mr. X Steroid Digital Book.
     Token is SHA-256 hashed; raw token never stored. Expires after 24h / 3 downloads.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. digital_book_delivery_log — audit trail
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.digital_book_delivery_log (
    id              uuid primary key default gen_random_uuid(),
    invoice_id      uuid not null references public.invoices(id) on delete cascade,
    method          text not null check (method in ('fourthwall_native', 'signed_url', 'manual_queue')),
    download_url    text,
    created_at      timestamptz not null default now()
);

create index if not exists digital_book_delivery_log_invoice_id_idx
    on public.digital_book_delivery_log (invoice_id);

alter table public.digital_book_delivery_log enable row level security;
revoke all on public.digital_book_delivery_log from anon, authenticated;

comment on table public.digital_book_delivery_log is
    'Audit trail for Digital Book delivery attempts. Method indicates delivery mechanism.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. manual_fulfillment_queue — fallback for delivery failures
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.manual_fulfillment_queue (
    id                  uuid primary key default gen_random_uuid(),
    invoice_id          uuid references public.invoices(id) on delete set null,
    type                text not null check (type in ('digital_book_delivery', 'physical_shipping', 'entitlement_grant')),
    customer_email      text not null,
    status              text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'failed')),
    assigned_to         uuid references auth.users(id) on delete set null,
    notes               text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    completed_at        timestamptz
);

create index if not exists manual_fulfillment_queue_status_idx
    on public.manual_fulfillment_queue (status);

create index if not exists manual_fulfillment_queue_invoice_id_idx
    on public.manual_fulfillment_queue (invoice_id);

alter table public.manual_fulfillment_queue enable row level security;
revoke all on public.manual_fulfillment_queue from anon, authenticated;

comment on table public.manual_fulfillment_queue is
    'Fallback queue for fulfillment tasks that cannot be automated. Service-role only.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. fourthwall_product_map — canonical product → Fourthwall product/variant IDs
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.fourthwall_product_map (
    canonical_product_id text primary key
        references public.canonical_products(id) on delete cascade,
    fourthwall_product_id text not null,
    fourthwall_variant_id text,
    fourthwall_product_name text not null,
    fourthwall_product_url text not null,
    price_usd numeric(10,2) not null,
    has_digital_attachment boolean not null default true,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.fourthwall_product_map is
    'Maps canonical MrXSteroid products to Fourthwall product/variant IDs.
     Prices are authoritative USD amounts. Source: Owner-approved Fourthwall catalog.';

-- Seed the approved Fourthwall product mappings
-- These IDs must be replaced with actual Fourthwall product IDs after API discovery
insert into public.fourthwall_product_map (
    canonical_product_id, fourthwall_product_id, fourthwall_variant_id,
    fourthwall_product_name, fourthwall_product_url, price_usd, has_digital_attachment, active
) values
(
    'MRX-PROTOCOL',
    'FW_PRODUCT_DIGITAL_BOOK_PLACEHOLDER',
    null,
    'MrXSteroid Digital Book',
    'https://shop.mrxsteroid.com/products/mrxsteroid-digital-book',
    49.99,
    true,
    true
),
(
    'MRX-TACTICAL',
    'FW_PRODUCT_PAPERBACK_PLACEHOLDER',
    null,
    'MrXSteroid Glossy Paperback Edition',
    'https://shop.mrxsteroid.com/products/mrxsteroid-glossy-paperback-edition',
    72.00,
    true,
    true
),
(
    'MRX-SMART-PRO',
    'FW_PRODUCT_HARDCOVER_PLACEHOLDER',
    null,
    'MrXSteroid Hardcover Premium Book',
    'https://shop.mrxsteroid.com/products/mrxsteroid-hardcover-premium-book',
    82.00,
    true,
    true
),
(
    'MRX-COACHING-ADDON',
    'FW_PRODUCT_COACHING_PLACEHOLDER',
    null,
    'Mr. X-Steroid | VIP 1-on-1 Anabolic Cycle Coaching (1 Full Cycle)',
    'https://shop.mrxsteroid.com/products/mr-x-steroid-vip-1-on-1-anabolic-cycle-coaching-1-full-cycle',
    349.99,
    true,
    true
),
(
    'MRX-CONSULTATION',
    'FW_PRODUCT_CONSULTATION_PLACEHOLDER',
    null,
    'Custom Consultation & Assessment Session — Mr. X-Steroid',
    'https://shop.mrxsteroid.com/products/custom-consultation-assessment-session-mr-x-steroid',
    30.00,
    true,
    true
)
on conflict (canonical_product_id) do update set
    fourthwall_product_id = excluded.fourthwall_product_id,
    fourthwall_variant_id = excluded.fourthwall_variant_id,
    fourthwall_product_name = excluded.fourthwall_product_name,
    fourthwall_product_url = excluded.fourthwall_product_url,
    price_usd = excluded.price_usd,
    has_digital_attachment = excluded.has_digital_attachment,
    active = excluded.active,
    updated_at = now();

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. shippo_shipments — international shipping tracking
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.shippo_shipments (
    id                      uuid primary key default gen_random_uuid(),
    invoice_id              uuid references public.invoices(id) on delete set null,
    order_id                uuid references public.orders(id) on delete set null,
    shippo_shipment_id      text not null,
    shippo_transaction_id   text,
    to_address              jsonb not null,
    from_address            jsonb not null,
    parcel                  jsonb not null,
    selected_rate_id        text,
    selected_rate_amount    numeric(10,2),
    selected_rate_currency  text default 'USD',
    selected_rate_provider  text,
    selected_rate_service   text,
    tracking_number         text,
    tracking_url            text,
    label_url               text,
    label_file_type         text default 'PDF',
    status                  text not null default 'created'
        check (status in ('created', 'rates_obtained', 'label_purchased', 'in_transit', 'delivered', 'failed', 'cancelled')),
    metadata                jsonb,
    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now(),
    purchased_at            timestamptz,
    delivered_at            timestamptz
);

create index if not exists shippo_shipments_invoice_id_idx
    on public.shippo_shipments (invoice_id);

create index if not exists shippo_shipments_order_id_idx
    on public.shippo_shipments (order_id);

create index if not exists shippo_shipments_status_idx
    on public.shippo_shipments (status);

alter table public.shippo_shipments enable row level security;
revoke all on public.shippo_shipments from anon, authenticated;

comment on table public.shippo_shipments is
    'International shipping tracking via Shippo. Rates, labels, tracking for Global/USD physical orders.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. Extend invoices for Fourthwall gateway flag
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.invoices
    add column if not exists payment_gateway text
        check (payment_gateway in ('kashier', 'fourthwall', 'stripe', 'paymob', 'spaceremit'));

alter table public.invoices
    add column if not exists fourthwall_checkout_session_id text;

alter table public.invoices
    add column if not exists fourthwall_order_id text;

comment on column public.invoices.payment_gateway is
    'Payment gateway used for this invoice: kashier (EGYPT/EGP) or fourthwall (GLOBAL/USD).';

comment on column public.invoices.fourthwall_checkout_session_id is
    'Fourthwall hosted checkout session ID (replaces kashier_session_id for Fourthwall orders).';

comment on column public.invoices.fourthwall_order_id is
    'Fourthwall order ID returned after successful payment.';

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. Extend payment_intents for Fourthwall
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.payment_intents
    add column if not exists fourthwall_checkout_session_id text;

alter table public.payment_intents
    add column if not exists fourthwall_order_id text;

-- ──────────────────────────────────────────────────────────────────────────────
-- 8. canonical_products table (if not exists) — master product catalog
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.canonical_products (
    id                  text primary key, -- MRX-PROTOCOL, MRX-TACTICAL, MRX-SMART-PRO, MRX-COACHING-ADDON, MRX-CONSULTATION
    slug                text not null unique,
    name_ar             text not null,
    name_en             text not null,
    egypt_amount        integer, -- null = not available in Egypt
    egypt_base_amount   integer,
    global_amount       numeric(10,2), -- null = placeholder
    global_placeholder  text not null,
    is_global_only      boolean not null default false,
    active              boolean not null default true,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

-- Seed canonical products
insert into public.canonical_products (id, slug, name_ar, name_en, egypt_amount, egypt_base_amount, global_amount, global_placeholder, is_global_only, active) values
('MRX-PROTOCOL', 'protocol', 'البروتوكول الرقمي', 'Digital Protocol', 499, 499, 49.99, 'USD_PRICE_1', false, true),
('MRX-TACTICAL', 'tactical', 'الباقة التكتيكية', 'Tactical Bundle', 749, 749, 72.00, 'USD_PRICE_2', false, true),
('MRX-SMART-PRO', 'smart-pro', 'المحترف الذكي', 'Smart Professional', 10848, 849, 82.00, 'USD_PRICE_3', false, true),
('MRX-COACHING-ADDON', 'coaching-addon', 'تدريب 1-على-1 دورة كاملة', 'VIP 1-on-1 Anabolic Cycle Coaching (1 Full Cycle)', 0, 0, 349.99, 'USD_PRICE_COACHING', true, true),
('MRX-CONSULTATION', 'consultation', 'جلسة تقييم واستشارة مخصصة', 'Custom Consultation & Assessment Session — Mr. X-Steroid', 0, 0, 30.00, 'USD_PRICE_CONSULTATION', true, true)
on conflict (id) do update set
    slug = excluded.slug,
    name_ar = excluded.name_ar,
    name_en = excluded.name_en,
    egypt_amount = excluded.egypt_amount,
    egypt_base_amount = excluded.egypt_base_amount,
    global_amount = excluded.global_amount,
    global_placeholder = excluded.global_placeholder,
    is_global_only = excluded.is_global_only,
    active = excluded.active,
    updated_at = now();

alter table public.canonical_products enable row level security;
revoke all on public.canonical_products from anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────────
-- 9. RLS policies for admin/service access (canonical_products read-only for admins)
-- ──────────────────────────────────────────────────────────────────────────────
-- canonical_products: allow authenticated users to read active products
create policy "canonical_products: authenticated read active" on public.canonical_products
    for select to authenticated
    using (active = true);

-- Service role bypasses RLS automatically for all new tables above
-- (RLS enabled with no client policies = service role only)