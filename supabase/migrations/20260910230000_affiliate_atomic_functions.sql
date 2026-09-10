-- ============================================================
-- Atomic affiliate functions for ledger operations.
-- These run inside a single PostgreSQL transaction guaranteeing
-- that referral + ledger + balance update are always consistent.
-- SECURITY DEFINER with set search_path = '' for hardening.
-- ============================================================

-- ── affiliate_create_commission ────────────────────────────
create or replace function public.affiliate_create_commission(
    p_affiliate_id uuid,
    p_invoice_id uuid,
    p_customer_user_id uuid,
    p_referral_code text,
    p_invoice_amount numeric,
    p_invoice_currency text,
    p_commission_base_amount numeric,
    p_commission_rate numeric,
    p_commission_amount numeric,
    p_tier text,
    p_attribution_source text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_referral_id uuid;
    v_ledger_id uuid;
    v_current_balance numeric;
    v_balance_after numeric;
begin
    -- Lock affiliate row to prevent race conditions
    select current_balance into v_current_balance
    from public.affiliates
    where id = p_affiliate_id
    for update;

    if not found then
        raise exception 'Affiliate not found: %', p_affiliate_id;
    end if;

    v_balance_after := v_current_balance + p_commission_amount;

    -- 1. Insert referral record
    insert into public.referrals (
        affiliate_id, invoice_id, customer_user_id,
        referral_code, amount, currency,
        commission_base_amount, commission_rate, commission_amount,
        tier, status, attribution_source
    ) values (
        p_affiliate_id, p_invoice_id, p_customer_user_id,
        p_referral_code, p_invoice_amount, p_invoice_currency,
        p_commission_base_amount, p_commission_rate, p_commission_amount,
        p_tier, 'approved', p_attribution_source
    ) returning id into v_referral_id;

    -- 2. Insert ledger entry
    insert into public.affiliate_commission_ledger (
        affiliate_id, referral_id, transaction_type,
        amount, currency, balance_after, description
    ) values (
        p_affiliate_id, v_referral_id, 'commission',
        p_commission_amount, p_invoice_currency, v_balance_after,
        'Commission for invoice ' || p_invoice_id::text
    ) returning id into v_ledger_id;

    -- 3. Update affiliate balance and counters atomically
    update public.affiliates set
        current_balance = v_balance_after,
        lifetime_earnings = lifetime_earnings + p_commission_amount,
        total_referrals = total_referrals + 1,
        total_paid_referrals = total_paid_referrals + 1,
        updated_at = now()
    where id = p_affiliate_id;

    -- 4. Audit log
    insert into public.affiliate_audit_logs (
        affiliate_id, actor_type, event_type, payload
    ) values (
        p_affiliate_id, 'system', 'commission_created',
        jsonb_build_object(
            'referral_id', v_referral_id,
            'ledger_id', v_ledger_id,
            'commission_amount', p_commission_amount,
            'invoice_id', p_invoice_id,
            'tier', p_tier,
            'commission_rate', p_commission_rate
        )
    );

    return json_build_object(
        'referral_id', v_referral_id,
        'ledger_id', v_ledger_id,
        'balance_after', v_balance_after
    );
end;
$$;

-- ── affiliate_create_reversal ──────────────────────────────
create or replace function public.affiliate_create_reversal(
    p_referral_id uuid,
    p_affiliate_id uuid,
    p_reversal_type text,
    p_reversal_amount numeric,
    p_currency text,
    p_reason text,
    p_new_referral_status text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_ledger_id uuid;
    v_current_balance numeric;
    v_balance_after numeric;
begin
    -- Lock affiliate row
    select current_balance into v_current_balance
    from public.affiliates
    where id = p_affiliate_id
    for update;

    if not found then
        raise exception 'Affiliate not found: %', p_affiliate_id;
    end if;

    -- Never go below zero
    v_balance_after := greatest(0, v_current_balance - p_reversal_amount);

    -- 1. Update referral status
    update public.referrals
    set status = p_new_referral_status, updated_at = now()
    where id = p_referral_id and affiliate_id = p_affiliate_id;

    if not found then
        raise exception 'Referral not found or affiliate mismatch: %', p_referral_id;
    end if;

    -- 2. Insert ledger reversal (negative amount)
    insert into public.affiliate_commission_ledger (
        affiliate_id, referral_id, transaction_type,
        amount, currency, balance_after, description
    ) values (
        p_affiliate_id, p_referral_id, p_reversal_type,
        -p_reversal_amount, p_currency, v_balance_after,
        p_reason
    ) returning id into v_ledger_id;

    -- 3. Update affiliate balance
    update public.affiliates set
        current_balance = v_balance_after,
        updated_at = now()
    where id = p_affiliate_id;

    -- 4. Audit log
    insert into public.affiliate_audit_logs (
        affiliate_id, actor_type, event_type, payload
    ) values (
        p_affiliate_id, 'system', p_reversal_type,
        jsonb_build_object(
            'referral_id', p_referral_id,
            'reversal_amount', p_reversal_amount,
            'reason', p_reason,
            'new_status', p_new_referral_status
        )
    );

    return json_build_object(
        'ledger_id', v_ledger_id,
        'balance_after', v_balance_after
    );
end;
$$;

-- Restrict execute permissions — only service role (bypasses RLS) should call these
revoke execute on function public.affiliate_create_commission from public, anon, authenticated;
revoke execute on function public.affiliate_create_reversal from public, anon, authenticated;
