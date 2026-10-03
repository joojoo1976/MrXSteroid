-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 20261003140000_fix_phone_auth_rpc.sql
-- Description: Robust get_email_by_phone RPC for Dual Identifier Login
--   1. Runs as SECURITY DEFINER to bypass RLS for unauthenticated phone lookup
--   2. Grants EXECUTE to anon, authenticated, and service_role
--   3. Handles all phone variants (local trunk '01...', international '+20...',
--      '0020...', spaces, stripped digits, national significant digits match)
--   4. Fallbacks to auth.users metadata if profile lacks phone
--   5. Adds index on phone_number for performant lookups
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_clean text;
    v_email text;
    v_digits text;
BEGIN
    IF p_phone IS NULL OR trim(p_phone) = '' THEN
        RETURN NULL;
    END IF;

    v_clean := trim(p_phone);
    -- Extract only digits
    v_digits := regexp_replace(v_clean, '\D', '', 'g');

    IF v_digits = '' THEN
        RETURN NULL;
    END IF;

    -- 1. Exact match on raw input, with/without '+', or on all stripped digits
    SELECT email INTO v_email
    FROM public.profiles
    WHERE phone_number IS NOT NULL
      AND (
          trim(phone_number) = v_clean
          OR trim(phone_number) = '+' || v_clean
          OR ('+' || trim(phone_number)) = v_clean
          OR regexp_replace(phone_number, '\D', '', 'g') = v_digits
      )
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_email IS NOT NULL THEN
        RETURN v_email;
    END IF;

    -- 2. Match when one has country code (e.g. 20, 966, 1) and other has local trunk zero (e.g. 010..., 05...)
    -- Compare the significant national digits (last 9 or 10 digits)
    IF length(v_digits) >= 8 THEN
        SELECT email INTO v_email
        FROM public.profiles
        WHERE phone_number IS NOT NULL
          AND length(regexp_replace(phone_number, '\D', '', 'g')) >= 8
          AND (
              -- Match on last 9 digits (covers e.g. Egyptian 1000722050, Saudi 500000000)
              right(regexp_replace(phone_number, '\D', '', 'g'), 9) = right(v_digits, 9)
              OR (
                  length(v_digits) >= 10
                  AND length(regexp_replace(phone_number, '\D', '', 'g')) >= 10
                  AND right(regexp_replace(phone_number, '\D', '', 'g'), 10) = right(v_digits, 10)
              )
          )
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- 3. Fallback check in auth.users metadata if profile row lacks phone_number
    IF v_email IS NULL AND length(v_digits) >= 8 THEN
        SELECT email INTO v_email
        FROM auth.users
        WHERE (
            raw_user_meta_data->>'phone_number' = v_clean
            OR regexp_replace(coalesce(raw_user_meta_data->>'phone_number', ''), '\D', '', 'g') = v_digits
            OR right(regexp_replace(coalesce(raw_user_meta_data->>'phone_number', ''), '\D', '', 'g'), 9) = right(v_digits, 9)
            OR (phone IS NOT NULL AND right(regexp_replace(phone, '\D', '', 'g'), 9) = right(v_digits, 9))
        )
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    RETURN v_email;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_email_by_phone(text) TO anon, authenticated, service_role;

-- Ensure index exists for phone_number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number_lookup
    ON public.profiles(phone_number)
    WHERE phone_number IS NOT NULL;
