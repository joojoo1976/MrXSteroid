-- ═══════════════════════════════════════════════════════════════════════════
--  handle_new_user(): tolerate OAuth providers that return no email (Facebook)
--
--  profiles.email is NOT NULL. Supabase's Facebook provider may not return an
--  email address (unless the email permission is granted), which previously made
--  the provisioning trigger raise and abort the signup INSERT — so Facebook
--  users could fail to get a profile row. Now a stable synthetic fallback is
--  used only when the real email is absent; real emails are always preferred.
--
--  Verified in production: a NULL-email auth user provisions a profile with
--  '<id>@facebook.mrx.local'; deleting the user cascades the profile away.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
    insert into public.profiles (id, email, phone_number, full_name, user_name, avatar_url, currency, role)
    values (
        new.id,
        coalesce(
            nullif(trim(new.email), ''),
            new.id::text || '@' ||
              coalesce(nullif(new.raw_app_meta_data ->> 'provider', ''), 'oauth') || '.mrx.local'
        ),
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
        case when new.raw_app_meta_data ->> 'role' = 'admin' then 'admin' else 'user' end
    )
    on conflict (id) do update set
        full_name    = coalesce(excluded.full_name,    public.profiles.full_name),
        user_name    = coalesce(excluded.user_name,    public.profiles.user_name),
        avatar_url   = coalesce(excluded.avatar_url,   public.profiles.avatar_url),
        phone_number = coalesce(excluded.phone_number, public.profiles.phone_number),
        updated_at   = now();
    return new;
end;
$function$;
