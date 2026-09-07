-- ============================================================
-- Performance: created_at indexes for admin listing queries
-- All admin lists (useAdminData) order by created_at desc.
-- ============================================================

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists product_variants_created_at_idx on public.product_variants (created_at desc);
create index if not exists categories_created_at_idx on public.categories (created_at desc);
create index if not exists coupon_codes_created_at_idx on public.coupon_codes (created_at desc);
create index if not exists discount_rules_created_at_idx on public.discount_rules (created_at desc);
create index if not exists banners_created_at_idx on public.banners (created_at desc);
create index if not exists invoices_created_at_idx on public.invoices (created_at desc);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
