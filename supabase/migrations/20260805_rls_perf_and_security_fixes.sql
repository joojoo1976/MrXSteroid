-- ============================================================
-- Review fixes: RLS initplan optimization + FK indexes + hardening
-- 1) Wrap auth.uid()/auth.role() in (select ...) for initplan caching
-- 2) Add covering indexes on foreign key columns
-- 3) Set immutable search_path on SECURITY DEFINER / trigger functions
-- 4) Revoke anon/authenticated EXECUTE on setup-only functions
-- ============================================================

-- ── 3) Function search_path hardening ───────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

create or replace function public.handle_products_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

create or replace function public.touch_customer_note()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

create or replace function public.event_trigger_fn()
returns event_trigger
language plpgsql
set search_path = ''
as $function$
begin
end;
$function$;

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
    return (
        coalesce(auth.jwt() ->> 'role', '') = 'service_role'
        or exists (
            select 1 from public.profiles
            where id = (select auth.uid()) and role = 'admin'
        )
    );
end;
$function$;

create or replace function public.is_representative()
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
begin
    return (
        coalesce(auth.jwt() ->> 'role', '') = 'service_role'
        or exists (
            select 1 from public.profiles
            where id = (select auth.uid()) and role = 'representative'
        )
    );
end;
$function$;

-- ── 4) Revoke EXECUTE on setup-only security definer functions ──
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.rls_auto_enable() from anon, authenticated;

-- ── 2) Covering indexes for foreign keys ────────────────────
create index if not exists calculator_history_user_id_idx on public.calculator_history (user_id);
create index if not exists customer_notes_created_by_idx on public.customer_notes (created_by);
create index if not exists delivery_assignments_delegate_id_idx on public.delivery_assignments (delegate_id);
create index if not exists delivery_assignments_order_id_idx on public.delivery_assignments (order_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists realtime_locations_delegate_id_idx on public.realtime_locations (delegate_id);

-- ── 1) Rewrite RLS policies to use (select auth.uid()) initplans ──

-- active_cycles
drop policy if exists "Users can insert own cycles" on public.active_cycles;
create policy "Users can insert own cycles" on public.active_cycles
    for insert to public
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own cycles" on public.active_cycles;
create policy "Users can view own cycles" on public.active_cycles
    for select to public
    using (((select auth.uid()) = user_id) or public.is_admin());

-- body_fat_logs
drop policy if exists "Users can insert own body fat logs" on public.body_fat_logs;
create policy "Users can insert own body fat logs" on public.body_fat_logs
    for insert to public
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own body fat logs" on public.body_fat_logs;
create policy "Users can view own body fat logs" on public.body_fat_logs
    for select to public
    using (((select auth.uid()) = user_id) or public.is_admin());

-- fitness_logs
drop policy if exists "Users can insert own fitness logs" on public.fitness_logs;
create policy "Users can insert own fitness logs" on public.fitness_logs
    for insert to public
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own fitness logs" on public.fitness_logs;
create policy "Users can view own fitness logs" on public.fitness_logs
    for select to public
    using (((select auth.uid()) = user_id) or public.is_admin());

-- calculator_history
drop policy if exists "Users can insert their own calculator history" on public.calculator_history;
create policy "Users can insert their own calculator history" on public.calculator_history
    for insert to public
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own calculator history" on public.calculator_history;
create policy "Users can read their own calculator history" on public.calculator_history
    for select to public
    using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own calculator history" on public.calculator_history;
create policy "Users can delete their own calculator history" on public.calculator_history
    for delete to public
    using ((select auth.uid()) = user_id);

drop policy if exists "Admins can read all calculator history" on public.calculator_history;
create policy "Admins can read all calculator history" on public.calculator_history
    for select to public
    using (exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.role = 'admin'
    ));

-- invoices
drop policy if exists "Service role full access on invoices" on public.invoices;
create policy "Service role full access on invoices" on public.invoices
    for all to public
    using ((select auth.role()) = 'service_role');

drop policy if exists "Users can insert own invoices" on public.invoices;
create policy "Users can insert own invoices" on public.invoices
    for insert to public
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own invoices" on public.invoices;
create policy "Users can view own invoices" on public.invoices
    for select to public
    using ((select auth.uid()) = user_id);

drop policy if exists "Admins can read all invoices" on public.invoices;
create policy "Admins can read all invoices" on public.invoices
    for select to public
    using (public.is_admin());

-- orders
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
    for select to authenticated
    using ((select auth.uid()) = user_id);

-- payments
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments" on public.payments
    for select to authenticated
    using (
        ((select auth.uid()) = user_id)
        or (customer_email = (
            select users.email from auth.users
            where users.id = (select auth.uid())
        ))
    );

-- profiles
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
    for insert to public
    with check ((select auth.uid()) = id);

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
    for select to public
    using (((select auth.uid()) = id) or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
    for update to public
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
    for select to authenticated
    using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
    for update to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles
    for update to public
    using (public.is_admin())
    with check (public.is_admin());

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only" on public.profiles
    for delete to public
    using (public.is_admin());

-- admin_settings
drop policy if exists "Admins can manage settings" on public.admin_settings;
create policy "Admins can manage settings" on public.admin_settings
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

-- contact_messages
drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages" on public.contact_messages
    for select to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages" on public.contact_messages
    for update to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages" on public.contact_messages
    for delete to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

-- customer_notes
drop policy if exists "Admins can read customer notes" on public.customer_notes;
create policy "Admins can read customer notes" on public.customer_notes
    for select to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can insert customer notes" on public.customer_notes;
create policy "Admins can insert customer notes" on public.customer_notes
    for insert to authenticated
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can update customer notes" on public.customer_notes;
create policy "Admins can update customer notes" on public.customer_notes
    for update to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can delete customer notes" on public.customer_notes;
create policy "Admins can delete customer notes" on public.customer_notes
    for delete to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

-- categories / products / product_variants / coupon_codes / discount_rules / banners
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage product_variants" on public.product_variants;
create policy "Admins can manage product_variants" on public.product_variants
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage coupon_codes" on public.coupon_codes;
create policy "Admins can manage coupon_codes" on public.coupon_codes
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage discount_rules" on public.discount_rules;
create policy "Admins can manage discount_rules" on public.discount_rules
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage banners" on public.banners;
create policy "Admins can manage banners" on public.banners
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

-- CMS tables (task 4)
drop policy if exists "Admins can manage blog_posts" on public.blog_posts;
create policy "Admins can manage blog_posts" on public.blog_posts
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage cms_pages" on public.cms_pages;
create policy "Admins can manage cms_pages" on public.cms_pages
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');

drop policy if exists "Admins can manage faq_items" on public.faq_items;
create policy "Admins can manage faq_items" on public.faq_items
    for all to authenticated
    using (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = (select auth.uid())), 'user') = 'admin');
