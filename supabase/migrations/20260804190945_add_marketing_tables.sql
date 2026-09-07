-- ============================================================
-- Marketing & Promotions: coupon_codes, discount_rules, banners
-- ============================================================

-- Discount / coupon codes
create table if not exists public.coupon_codes (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    discount_type text not null default 'percentage' check (discount_type in ('percentage','fixed','free_shipping')),
    discount_value numeric(12,2) not null default 0,
    min_order_amount numeric(12,2),
    product_ids uuid[],
    max_uses int,
    max_per_user int,
    starts_at timestamptz,
    ends_at timestamptz,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Automatic discount rules (e.g. "buy 2 get 1 free", "spend X get discount")
create table if not exists public.discount_rules (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    rule_type text not null default 'threshold' check (rule_type in ('threshold','buy_x_get_y')),
    threshold_amount numeric(12,2),
    buy_quantity int,
    get_quantity int,
    discount_percent numeric(5,2),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Homepage slider / banners
create table if not exists public.banners (
    id uuid primary key default gen_random_uuid(),
    title text,
    subtitle text,
    image_url text,
    link_url text,
    position text not null default 'home' check (position in ('home','promo','category')),
    sort_order int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.coupon_codes enable row level security;
alter table public.discount_rules enable row level security;
alter table public.banners enable row level security;

drop policy if exists "Admins can manage coupon_codes" on public.coupon_codes;
create policy "Admins can manage coupon_codes" on public.coupon_codes
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can manage discount_rules" on public.discount_rules;
create policy "Admins can manage discount_rules" on public.discount_rules
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can manage banners" on public.banners;
create policy "Admins can manage banners" on public.banners
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

-- Public can read active banners & coupons (storefront)
drop policy if exists "Public can read banners" on public.banners;
create policy "Public can read banners" on public.banners
    for select using (is_active = true);

drop policy if exists "Public can read active coupons" on public.coupon_codes;
create policy "Public can read active coupons" on public.coupon_codes
    for select using (is_active = true);

drop policy if exists "Public can read active rules" on public.discount_rules;
create policy "Public can read active rules" on public.discount_rules
    for select using (is_active = true);