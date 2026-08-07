-- ============================================================
-- Harden profile privilege escalation (auth integration audit):
--
-- 1) handle_new_user: role must NEVER come from raw_user_meta_data
--    (user-editable at sign-up -> a crafted signup could create an
--    'admin' profile). Elevated roles may only be sourced from
--    raw_app_meta_data, which is server/admin-controlled.
--
-- 2) prevent_profile_privilege_escalation now guards INSERT as well
--    as UPDATE, so a client can never self-insert a privileged row
--    (role/has_paid/subscription_*). It previously ran only on UPDATE.
--
-- 3) profiles_insert_own tightened at the policy layer (defense in
--    depth) so even policy evaluation rejects privileged values.
--
-- Behavioral changes: none for normal signups (role stays 'user').
-- ============================================================

-- 1) handle_new_user — drop user-controlled role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
    insert into public.profiles (id, email, phone_number, full_name, user_name, avatar_url, currency, role)
    values (
        new.id,
        new.email,
        nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone_number', '')), ''),
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'fullName',
            new.raw_user_meta_data ->> 'name'
        ),
        coalesce(
            new.raw_user_meta_data ->> 'user_name',
            new.raw_user_meta_data ->> 'username',
            new.raw_user_meta_data ->> 'preferred_username'
        ),
        coalesce(
            new.raw_user_meta_data ->> 'avatar_url',
            new.raw_user_meta_data ->> 'picture'
        ),
        coalesce(nullif(new.raw_user_meta_data ->> 'currency', ''), 'USD'),
        -- Only app_metadata (admin-controlled) may elevate the role; default 'user'.
        case when new.raw_app_meta_data ->> 'role' = 'admin' then 'admin' else 'user' end
    )
    on conflict (id) do update set
        full_name    = coalesce(excluded.full_name,    public.profiles.full_name),
        user_name    = coalesce(excluded.user_name,    public.profiles.user_name),
        avatar_url   = coalesce(excluded.avatar_url,   public.profiles.avatar_url),
        email        = coalesce(excluded.email,        public.profiles.email),
        phone_number = coalesce(excluded.phone_number, public.profiles.phone_number),
        updated_at   = now();
    return new;
end;
$function$;

-- 2) prevent_profile_privilege_escalation — also guard INSERT
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
    if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
        return new;
    end if;

    -- INSERT: only default / non-privileged profiles may be created without admin rights.
    if tg_op = 'INSERT' then
        if (
            coalesce(new.role, 'user') <> 'user'
            or coalesce(new.has_paid, false)
            or coalesce(new.subscription_status, 'inactive') <> 'inactive'
            or (new.subscription_tier is not null and new.subscription_tier <> 'none')
            or (new.plan_tier is not null and new.plan_tier <> 'none')
        ) then
            if public.is_admin() then
                return new;
            end if;
            raise exception 'Permission denied: privileged profile fields cannot be set';
        end if;
        return new;
    end if;

    -- UPDATE: privileged field transitions require admin rights.
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
    before insert or update on public.profiles
    for each row execute function public.prevent_profile_privilege_escalation();

-- 3) Tighten self-insert policy (policy-layer defense in depth)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
    for insert to authenticated
    with check (
        (select auth.uid()) = id
        and coalesce(role, 'user') = 'user'
        and coalesce(has_paid, false) = false
        and coalesce(subscription_status, 'inactive') = 'inactive'
        and (subscription_tier is null or subscription_tier = 'none')
        and (plan_tier is null or plan_tier = 'none')
    );
