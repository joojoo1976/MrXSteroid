-- =============================================================================
-- MIGRATION: 20261118160000_invoice_first_atomic.sql
-- PURPOSE:   Phase 4 — atomic invoice creation (order + invoice + lines).
--
-- SAFETY & GOVERNANCE:
--   - Additive only: two nullable columns + one function. No DROP/RENAME/type
--     change on existing tables, no NOT NULL, no data rewrite.
--   - The function writes all three tables inside one PostgreSQL transaction.
--     Any failure rolls back every row; an order can never exist without its
--     invoice, and an invoice can never exist without its lines.
--   - Idempotency is claimed by the EXISTING partial unique indexes on
--     invoices.idempotency_key and orders.idempotency_key. No in-memory cache.
--   - Service-role execute only. No anon/authenticated access.
-- =============================================================================

alter table public.invoices
    add column if not exists pricing_version text;
alter table public.invoices
    add column if not exists quote_hash text;

comment on column public.invoices.pricing_version is
    'Phase 4: catalog version that produced the invoice lines.';
comment on column public.invoices.quote_hash is
    'Phase 4: sha256 of the normalized cart/quote. Used to detect idempotency key reuse with a different cart.';

create or replace function public.create_invoice_atomic(
    p_user_id uuid,
    p_gateway text,
    p_tier_id text,
    p_amount numeric,
    p_currency text,
    p_region text,
    p_shipping_cost numeric,
    p_discount_amount numeric,
    p_promo_code text,
    p_customer_email text,
    p_customer_name text,
    p_phone_number text,
    p_shipping_address text,
    p_idempotency_key text,
    p_pricing_version text,
    p_quote_hash text,
    p_metadata jsonb,
    p_lines jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_invoice_id uuid;
    v_order_id uuid;
    v_existing_quote_hash text;
    v_existing_pricing_version text;
    v_existing_amount numeric;
    v_existing_currency text;
    v_line_total numeric;
begin
    if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
        raise exception 'idempotency_key_required' using errcode = '22023';
    end if;
    if p_amount is null or p_amount <= 0 then
        raise exception 'invoice_amount_must_be_positive' using errcode = '22023';
    end if;
    if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
        raise exception 'invoice_lines_required' using errcode = '22023';
    end if;

    select coalesce(sum((line->>'line_total')::numeric), 0)
      into v_line_total
      from jsonb_array_elements(p_lines) as line;

    if v_line_total <> p_amount then
        raise exception 'invoice_line_total_mismatch: lines=% amount=%', v_line_total, p_amount
            using errcode = '23514';
    end if;

    -- Idempotency replay: the key is already claimed by an invoice.
    select id, quote_hash, pricing_version, amount, currency
      into v_invoice_id, v_existing_quote_hash, v_existing_pricing_version,
           v_existing_amount, v_existing_currency
      from public.invoices
     where idempotency_key = p_idempotency_key
     limit 1;

    if v_invoice_id is not null then
        select id into v_order_id
          from public.orders
         where invoice_id = v_invoice_id
         limit 1;

        return jsonb_build_object(
            'invoice_id', v_invoice_id,
            'order_id', v_order_id,
            'amount', v_existing_amount,
            'currency', v_existing_currency,
            'pricing_version', v_existing_pricing_version,
            'quote_hash', v_existing_quote_hash,
            'idempotent', true
        );
    end if;

    -- Claim the idempotency key by inserting the invoice first. A concurrent
    -- loser does nothing here, then reads the winner below.
    insert into public.invoices (
        user_id, gateway, status, payment_status, tier_id, amount, currency,
        payment_provider_merchant, region, shipping_cost, discount_amount,
        promo_code, customer_email, customer_name, phone_number,
        idempotency_key, pricing_version, quote_hash, metadata
    ) values (
        p_user_id, p_gateway, 'pending', 'pending', p_tier_id, p_amount, p_currency,
        null, lower(p_region), coalesce(p_shipping_cost, 0), coalesce(p_discount_amount, 0),
        p_promo_code, p_customer_email, p_customer_name, p_phone_number,
        p_idempotency_key, p_pricing_version, p_quote_hash, coalesce(p_metadata, '{}'::jsonb)
    )
    on conflict (idempotency_key) where idempotency_key is not null do nothing
    returning id into v_invoice_id;

    if v_invoice_id is null then
        select id, quote_hash, pricing_version, amount, currency
          into v_invoice_id, v_existing_quote_hash, v_existing_pricing_version,
               v_existing_amount, v_existing_currency
          from public.invoices
         where idempotency_key = p_idempotency_key
         limit 1;

        select id into v_order_id
          from public.orders
         where invoice_id = v_invoice_id
         limit 1;

        return jsonb_build_object(
            'invoice_id', v_invoice_id,
            'order_id', v_order_id,
            'amount', v_existing_amount,
            'currency', v_existing_currency,
            'pricing_version', v_existing_pricing_version,
            'quote_hash', v_existing_quote_hash,
            'idempotent', true
        );
    end if;

    insert into public.orders (
        user_id, status, total_amount, currency, region, shipping_address,
        phone_number, idempotency_key, payment_status, source_channel
    ) values (
        p_user_id, 'pending', p_amount, p_currency,
        case when p_region = 'EGYPT' then 'EG' else 'GLOBAL' end,
        p_shipping_address, p_phone_number, p_idempotency_key, 'pending', 'web_checkout'
    )
    returning id into v_order_id;

    update public.orders
       set invoice_id = v_invoice_id,
           updated_at = now()
     where id = v_order_id;

    insert into public.invoice_lines (
        invoice_id, order_id, line_type, sku, product_id, name_snapshot,
        language, edition, qty, unit_price, discount_amount, tax_amount,
        line_total, currency, source, position, metadata
    )
    select
        v_invoice_id,
        v_order_id,
        line->>'line_type',
        nullif(line->>'sku', ''),
        nullif(coalesce(line->>'product_id', line->>'sku'), ''),
        line->>'name_snapshot',
        nullif(line->>'language', ''),
        nullif(line->>'edition', ''),
        coalesce((line->>'qty')::integer, 1),
        (line->>'unit_price')::numeric,
        coalesce((line->>'discount_amount')::numeric, 0),
        coalesce((line->>'tax_amount')::numeric, 0),
        (line->>'line_total')::numeric,
        line->>'currency',
        line->>'source',
        coalesce((line->>'position')::integer, (ord - 1)::integer),
        coalesce(line->'metadata', '{}'::jsonb)
    from jsonb_array_elements(p_lines) with ordinality as t(line, ord);

    return jsonb_build_object(
        'invoice_id', v_invoice_id,
        'order_id', v_order_id,
        'amount', p_amount,
        'currency', p_currency,
        'pricing_version', p_pricing_version,
        'quote_hash', p_quote_hash,
        'idempotent', false
    );
end;
$$;

revoke all on function public.create_invoice_atomic(
    uuid, text, text, numeric, text, text, numeric, numeric, text, text, text,
    text, text, text, text, text, jsonb, jsonb
) from public, anon, authenticated;

grant execute on function public.create_invoice_atomic(
    uuid, text, text, numeric, text, text, numeric, numeric, text, text, text,
    text, text, text, text, text, jsonb, jsonb
) to service_role;

comment on function public.create_invoice_atomic(
    uuid, text, text, numeric, text, text, numeric, numeric, text, text, text,
    text, text, text, text, text, jsonb, jsonb
) is
    'Phase 4: atomic order + invoice + invoice_lines creation with DB-level idempotency.';
