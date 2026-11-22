-- =============================================================================
-- MIGRATION: 20261122120000_strict_invoice_payment_leg_amounts.sql
-- PURPOSE:   P2 — remove the internal 0.01 amount tolerance from
--            `settle_invoice_payment_leg`.
--
-- SAFETY & GOVERNANCE:
--   - Additive/replacement only: `create or replace function`, no table/column
--     change, no data rewrite, no DROP.
--   - The application already validates leg amounts before calling this RPC;
--     this makes a DIRECT service-role call equally strict.
--   - Amounts are numeric(10,2); comparing after round(...,2) rejects any
--     deviation, including a one-cent under/overpayment.
-- =============================================================================

create or replace function public.settle_invoice_payment_leg(
    p_invoice_id uuid,
    p_provider text,
    p_provider_reference text,
    p_amount_paid numeric,
    p_currency text,
    p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_invoice record;
    v_target_leg record;
    v_all_succeeded boolean;
    v_any_succeeded boolean;
    v_total_paid numeric(10,2) := 0;
    v_new_invoice_status text;
    v_can_fulfill boolean := false;
begin
    -- 0. Strict input parameter validations (V3.4.1)
    if p_invoice_id is null then
        return jsonb_build_object(
            'success', false,
            'error', 'INVALID_PARAMETERS',
            'message', 'Invoice ID is required'
        );
    end if;

    if p_provider is null or trim(p_provider) = '' then
        return jsonb_build_object(
            'success', false,
            'error', 'INVALID_PARAMETERS',
            'message', 'Provider is required'
        );
    end if;

    if p_provider_reference is null or trim(p_provider_reference) = '' then
        return jsonb_build_object(
            'success', false,
            'error', 'INVALID_PARAMETERS',
            'message', 'Provider reference is required'
        );
    end if;

    if p_amount_paid is null or p_amount_paid <= 0 then
        return jsonb_build_object(
            'success', false,
            'error', 'INVALID_PARAMETERS',
            'message', 'Valid paid amount is required'
        );
    end if;

    if p_currency is null or trim(p_currency) = '' then
        return jsonb_build_object(
            'success', false,
            'error', 'INVALID_PARAMETERS',
            'message', 'Currency is required'
        );
    end if;

    if p_status is null or p_status not in ('succeeded', 'failed', 'cancelled') then
        return jsonb_build_object(
            'success', false,
            'error', 'INVALID_PARAMETERS',
            'message', 'Valid settlement status is required'
        );
    end if;

    -- 1. Explicit row lock on the invoice to eliminate race conditions
    select id, amount, currency, status, payment_status
    into v_invoice
    from public.invoices
    where id = p_invoice_id
    for update;

    if not found then
        return jsonb_build_object(
            'success', false,
            'error', 'INVOICE_NOT_FOUND',
            'message', 'Invoice not found'
        );
    end if;

    -- If invoice is already paid in full, acknowledge idempotently
    if v_invoice.payment_status = 'paid' then
        return jsonb_build_object(
            'success', true,
            'idempotent', true,
            'invoice_status', 'paid',
            'can_fulfill', false,
            'message', 'Invoice already settled'
        );
    end if;

    -- 2. Locate and lock the matching leg with strict provider and reference matching
    select *
    into v_target_leg
    from public.invoice_payment_legs
    where invoice_id = p_invoice_id
      and lower(provider) = lower(trim(p_provider))
      and (
          provider_reference = trim(p_provider_reference)
          or (provider_reference is null and status = 'pending')
      )
    order by case when provider_reference = trim(p_provider_reference) then 0 else 1 end, leg_index asc
    limit 1
    for update;

    if not found then
        return jsonb_build_object(
            'success', false,
            'error', 'LEG_NOT_FOUND',
            'message', 'Matching payment leg not found for provider and reference'
        );
    end if;

    -- Strict Currency Verification: reject mismatch
    if upper(trim(v_target_leg.currency)) != upper(trim(p_currency)) then
        return jsonb_build_object(
            'success', false,
            'error', 'CURRENCY_MISMATCH',
            'message', format('Leg currency mismatch: expected %s, got %s', v_target_leg.currency, p_currency)
        );
    end if;

    -- Strict Amount Verification: exact minor-unit equality (no 0.01 tolerance)
    if round(v_target_leg.amount, 2) <> round(p_amount_paid, 2) then
        return jsonb_build_object(
            'success', false,
            'error', 'AMOUNT_MISMATCH',
            'message', format('Leg amount mismatch: expected %s, got %s', v_target_leg.amount, p_amount_paid)
        );
    end if;

    -- Update target leg status and store actual_paid_amount
    update public.invoice_payment_legs
    set status = p_status,
        actual_paid_amount = case when p_status = 'succeeded' then p_amount_paid else actual_paid_amount end,
        paid_at = case when p_status = 'succeeded' then coalesce(paid_at, now()) else paid_at end,
        provider_reference = trim(p_provider_reference),
        updated_at = now()
    where id = v_target_leg.id;

    -- 3. Evaluate consolidated status and sum of actual amounts across all legs
    select
        coalesce(sum(case when status = 'succeeded' then coalesce(actual_paid_amount, amount) else 0 end), 0),
        bool_and(status = 'succeeded'),
        bool_or(status = 'succeeded')
    into v_total_paid, v_all_succeeded, v_any_succeeded
    from public.invoice_payment_legs
    where invoice_id = p_invoice_id;

    -- Only promote to paid if ALL legs succeeded AND total paid satisfies the invoice amount
    if v_all_succeeded and (v_total_paid >= v_invoice.amount) then
        v_new_invoice_status := 'paid';
        v_can_fulfill := true;

        update public.invoices
        set status = 'success',
            payment_status = 'paid',
            paid_at = coalesce(paid_at, now()),
            updated_at = now()
        where id = p_invoice_id;

        update public.orders
        set payment_status = 'paid',
            updated_at = now()
        where invoice_id = p_invoice_id;

    elsif v_any_succeeded then
        v_new_invoice_status := 'partially_paid';
        v_can_fulfill := false;

        update public.invoices
        set payment_status = 'partially_paid',
            updated_at = now()
        where id = p_invoice_id;

        update public.orders
        set payment_status = 'partially_paid',
            updated_at = now()
        where invoice_id = p_invoice_id;

    elsif p_status = 'failed' then
        v_new_invoice_status := 'failed';
        v_can_fulfill := false;
    else
        v_new_invoice_status := 'pending';
        v_can_fulfill := false;
    end if;

    return jsonb_build_object(
        'success', true,
        'invoice_status', v_new_invoice_status,
        'can_fulfill', v_can_fulfill,
        'target_leg_id', v_target_leg.id,
        'total_paid', v_total_paid,
        'invoice_amount', v_invoice.amount
    );
end;
$$;

revoke all on function public.settle_invoice_payment_leg from public, anon, authenticated;
grant execute on function public.settle_invoice_payment_leg to service_role;
