-- ============================================================
-- Review fixes (task 1-4): close RLS regressions + hardening
-- 1) Restore admin/representative SELECT on orders (regression)
-- 2) Add "Users create own orders" INSERT policy (was in complete-schema)
-- 3) Block privilege self-escalation on profiles UPDATE
-- 4) Tighten payments INSERT (own row only, force status='pending')
-- 5) CMS: hide future-published posts on public reads
-- ============================================================

-- ── 1) orders SELECT: admins & representatives must see all orders ──
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
    for select to authenticated
    using (
        ((select auth.uid()) = user_id)
        or public.is_admin()
        or public.is_representative()
    );

-- ── 2) orders INSERT: users create own orders (guest allowed) ──
drop policy if exists "Users create own orders" on public.orders;
create policy "Users create own orders" on public.orders
    for insert to authenticated
    with check (
        ((select auth.uid()) = user_id)
        or user_id is null
    );

-- ── 3) profiles: prevent privilege self-escalation ──
-- Non-admins may only change their own row AND may not touch
-- privilege-bearing columns (role / has_paid / subscription fields).
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
    if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
        return new;
    end if;

    if (
        new.role is distinct from old.role
        or new.has_paid is distinct from old.has_paid
        or new.subscription_tier is distinct from old.subscription_tier
        or new.plan_tier is distinct from old.plan_tier
        or new.subscription_status is distinct from old.subscription_status
    ) then
        if public.is_admin() then
            return new;
        end if;
        raise exception 'Permission denied: privileged profile fields cannot be changed';
    end if;

    return new;
end;
$function$;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
    before update on public.profiles
    for each row execute function public.prevent_profile_privilege_escalation();

-- ── 4) payments: restrict public INSERT to own rows only ──
-- Removes the wide-open "Allow public payment creation" policy and forces
-- status='pending' on client inserts (immutable ledgers are updated by webhooks).
drop policy if exists "Allow public payment creation" on public.payments;
drop policy if exists "Users can create own payments" on public.payments;
create policy "Users can create own payments" on public.payments
    for insert to public
    with check (
        (
            (select auth.uid()) = user_id
            or user_id is null
        )
        and status = 'pending'
    );

-- ── 5) CMS: public reads must also respect published_at ──
drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts" on public.blog_posts
    for select using (
        status = 'published'
        and (published_at is null or published_at <= now())
    );

drop policy if exists "Public can read published pages" on public.cms_pages;
create policy "Public can read published pages" on public.cms_pages
    for select using (status = 'published');
