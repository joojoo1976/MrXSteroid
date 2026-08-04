-- ============================================================
-- Catalog & Inventory: categories, products, product_variants
-- ============================================================

-- Categories tree
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    parent_id uuid references public.categories(id) on delete set null,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    sku text unique,
    category_id uuid references public.categories(id) on delete set null,
    description text,
    price numeric(12,2) not null default 0,
    sale_price numeric(12,2),
    tax_rate numeric(5,2) not null default 0,
    stock int not null default 0,
    low_stock_threshold int not null default 5,
    status text not null default 'active' check (status in ('active','inactive','draft')),
    image_url text,
    seo_title text,
    seo_description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Product variants (size, concentration, flavor...)
create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    name text not null,
    sku text unique,
    price numeric(12,2) not null default 0,
    sale_price numeric(12,2),
    stock int not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_categories_parent_id on public.categories(parent_id);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- Admins can manage catalog tables
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can manage product_variants" on public.product_variants;
create policy "Admins can manage product_variants" on public.product_variants
    for all to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

-- Public read access (storefront needs to show products later)
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products
    for select using (status = 'active');

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories
    for select using (true);

drop policy if exists "Public can read product_variants" on public.product_variants;
create policy "Public can read product_variants" on public.product_variants
    for select using (true);

-- ── Trigger: updated_at ─────────────────────────────────────
create or replace function public.handle_products_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
    before update on public.products
    for each row execute function public.handle_products_updated_at();