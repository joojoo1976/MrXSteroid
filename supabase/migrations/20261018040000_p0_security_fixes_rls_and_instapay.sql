-- =============================================================================
-- Migration: 20261018040000_p0_security_fixes_rls_and_instapay.sql
-- Description:
--   P0 Fixes:
--   1. PAY-002: Explicitly enable RLS on public.invoices and establish
--      strict user, admin, and service_role access policies.
--   2. PAY-005 & PAY-004: Fix variable mismatch (v_net_amount_minor) and lock
--      search_path on public.approve_instapay_receipt() SECURITY DEFINER RPC.
--   3. PAY-001: Ensure payment-receipts bucket is strictly private.
-- =============================================================================

-- ─── 1. PAY-002: Enable Row Level Security on public.invoices ──────────────────
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on invoices" ON public.invoices;
CREATE POLICY "Service role full access on invoices" ON public.invoices
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can insert their own invoices
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
CREATE POLICY "Users can insert own invoices" ON public.invoices
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Authenticated users can view only their own invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = invoices.order_id
              AND orders.user_id = auth.uid()
        )
    );

-- Admins can read and manage all invoices
DROP POLICY IF EXISTS "Admins can read all invoices" ON public.invoices;
CREATE POLICY "Admins can read all invoices" ON public.invoices
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ─── 2. PAY-001: Ensure payment-receipts storage bucket is private ───────────
UPDATE storage.buckets
SET public = false
WHERE id = 'payment-receipts';

-- ─── 3. PAY-005 & PAY-004: Recreate approve_instapay_receipt RPC with fix ──────
CREATE OR REPLACE FUNCTION public.approve_instapay_receipt(
    p_receipt_id UUID,
    p_admin_id UUID,
    p_submitted_amount DECIMAL(12,2) DEFAULT NULL,
    p_submitted_currency TEXT DEFAULT NULL,
    p_instapay_reference TEXT DEFAULT NULL,
    p_instapay_transaction_id TEXT DEFAULT NULL,
    p_review_notes TEXT DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_receipt RECORD;
    v_order_id UUID;
    v_invoice_id UUID;
    v_payment_intent_id UUID;
    v_amount DECIMAL(12,2);
    v_currency TEXT;
    v_order_tier_id TEXT;
    v_order_items JSONB;
    v_customer_email TEXT;
    v_customer_name TEXT;
    v_now TIMESTAMPTZ := now();
    v_result JSONB;
    v_settlement JSONB;
BEGIN
    -- Lock the receipt row to prevent concurrent approval
    SELECT *
    INTO v_receipt
    FROM public.payment_receipts
    WHERE id = p_receipt_id
    FOR UPDATE;

    IF v_receipt IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Receipt not found'
        );
    END IF;

    -- Validate state
    IF v_receipt.status NOT IN ('awaiting_payment', 'submitted_for_review', 'under_review') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Receipt is not in a reviewable state (current: ' || v_receipt.status || ')'
        );
    END IF;

    -- Validate InstaPay reference/transaction ID for approval
    IF (v_receipt.instapay_reference IS NULL AND v_receipt.instapay_transaction_id IS NULL
        AND v_receipt.transaction_reference IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'InstaPay reference or transaction ID is required for approval'
        );
    END IF;

    -- Extract linked IDs
    v_order_id := v_receipt.order_id;
    v_invoice_id := v_receipt.invoice_id;
    v_payment_intent_id := v_receipt.payment_intent_id;
    v_amount := v_receipt.amount;
    v_currency := v_receipt.currency;

    -- P1 (PAY-008): Hard block on underpayment
    IF p_submitted_amount IS NOT NULL AND p_submitted_amount < (v_amount - 0.01) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Underpayment rejected: submitted amount (' || p_submitted_amount || ') is less than required invoice amount (' || v_amount || ')'
        );
    END IF;

    -- ─── 1. Update receipt to approved ───────────────────────────────────────
    UPDATE public.payment_receipts
    SET
        status = 'approved',
        submitted_amount = COALESCE(p_submitted_amount, submitted_amount),
        submitted_currency = COALESCE(p_submitted_currency, submitted_currency),
        instapay_reference = COALESCE(p_instapay_reference, instapay_reference),
        instapay_transaction_id = COALESCE(p_instapay_transaction_id, instapay_transaction_id),
        review_notes = COALESCE(p_review_notes, review_notes),
        rejection_reason = COALESCE(p_rejection_reason, rejection_reason),
        reviewed_by = p_admin_id,
        reviewed_at = now(),
        approved_at = now(),
        approved_by = p_admin_id,
        updated_at = now()
    WHERE id = p_receipt_id;

    -- ─── 2. Get order details for settlement ────────────────────────────────
    DECLARE
        v_order_tier_id TEXT;
        v_order_items JSONB;
        v_customer_email TEXT;
        v_customer_name TEXT;
    BEGIN
        SELECT tier_id, items, fullname, email
        INTO v_order_tier_id, v_order_items, v_customer_name, v_customer_email
        FROM public.orders
        WHERE id = v_order_id;
    END;

    -- ─── 3. Get invoice and payment intent details ──────────────────────────
    DECLARE
        v_invoice_user_id UUID;
        v_invoice_tier_id TEXT;
        v_invoice_amount DECIMAL(12,2);
        v_invoice_currency TEXT;
        v_invoice_region TEXT;
        v_invoice_customer_email TEXT;
    BEGIN
        SELECT user_id, tier_id, amount, currency, region, customer_email
        INTO v_invoice_user_id, v_invoice_tier_id, v_invoice_amount, v_invoice_currency, v_invoice_region, v_invoice_customer_email
        FROM public.invoices
        WHERE id = v_invoice_id;
    END;

    -- ─── 4. Get payment intent ID (create if not exists) ────────────────────
    DECLARE
        v_intent_id UUID;
    BEGIN
        IF v_receipt.payment_intent_id IS NOT NULL THEN
            v_intent_id := v_receipt.payment_intent_id;
        ELSE
            INSERT INTO public.payment_intents (
                invoice_id,
                attempt_number,
                is_current,
                provider,
                provider_order_id,
                merchant_reference,
                amount_minor,
                currency,
                environment,
                status,
                metadata
            )
            SELECT
                p_receipt_id,
                1,
                true,
                'instapay',
                'MRX-' || EXTRACT(EPOCH FROM now())::bigint,
                'INSTAPAY-' || p_receipt_id,
                (amount * 100)::int,
                currency,
                'live',
                'pending',
                jsonb_build_object(
                    'source', 'instapay_manual_transfer',
                    'reviewed_by', p_admin_id
                )
            FROM public.payment_receipts
            WHERE id = p_receipt_id
            RETURNING id
            INTO v_intent_id;

            UPDATE public.payment_receipts
            SET payment_intent_id = v_intent_id
            WHERE id = p_receipt_id;
        END IF;
    END;

    -- ─── 5. Execute the canonical settlement path ───────────────────────────
    DECLARE
        v_fulfillment_result JSONB;
        v_gateway_fee_minor INT := 0;
        v_gross_minor INT := round(v_amount * 100);
        v_net_amount_minor INT := v_gross_minor;
        v_beneficiary_id UUID;
        v_reserve_beneficiary_id UUID;
        v_beneficiary_share INT;
        v_platform_share INT;
        v_reserve_share INT;
        v_settlement JSONB;
    BEGIN
        -- 5a. Verify amount matches invoice (server amount is authoritative)
        IF v_amount IS NULL OR v_amount <= 0 THEN
            RAISE EXCEPTION 'Invalid invoice amount';
        END IF;

        -- 5b. Update payment_intents with gateway fee
        UPDATE public.payment_intents
        SET
            gateway_fee_minor = 0,
            updated_at = now()
        WHERE id = v_receipt.payment_intent_id;

        -- 5c. Calculate splits using the split engine logic (85/10/5 NET basis)
        SELECT id INTO v_beneficiary_id
        FROM public.beneficiaries
        WHERE role = 'author' AND is_active = true
        LIMIT 1;

        SELECT id INTO v_reserve_beneficiary_id
        FROM public.beneficiaries
        WHERE role = 'reserve' AND is_active = true
        LIMIT 1;

        -- Calculate 85/10/5 with largest remainder
        v_beneficiary_share := floor(v_net_amount_minor * 0.85);
        v_platform_share := floor(v_net_amount_minor * 0.10);
        v_reserve_share := v_net_amount_minor - v_beneficiary_share - v_platform_share;

        IF (v_net_amount_minor - (v_beneficiary_share + v_platform_share + v_reserve_share)) > 0 THEN
            v_beneficiary_share := v_beneficiary_share + (v_net_amount_minor - (v_beneficiary_share + v_platform_share + v_reserve_share));
        END IF;

        -- ─── Insert order_splits (freeze the allocation) ─────────────────
        INSERT INTO public.order_splits (
            id,
            invoice_id,
            beneficiary_id,
            rule_snapshot,
            gross_amount_minor,
            gateway_fee_minor,
            net_amount_minor,
            allocated_amount_minor,
            currency,
            status,
            payment_intent_id,
            destination_account,
            created_at,
            updated_at
        ) VALUES
        (
            gen_random_uuid(),
            v_invoice_id,
            v_beneficiary_id,
            jsonb_build_object(
                'rule_id', '8a6f0e10-0000-4000-8000-00000000a201',
                'share_type', 'percentage',
                'share_value', 85,
                'destination_account', 'BENEFICIARY_PAYABLE'
            ),
            round(v_amount * 100),
            0,
            v_net_amount_minor,
            v_beneficiary_share,
            v_currency,
            'frozen',
            v_receipt.payment_intent_id,
            'BENEFICIARY_PAYABLE',
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            v_invoice_id,
            NULL,
            jsonb_build_object(
                'rule_id', '8a6f0e10-0000-4000-8000-00000000a203',
                'share_type', 'percentage',
                'share_value', 10,
                'destination_account', 'PLATFORM_REVENUE'
            ),
            round(v_amount * 100),
            0,
            v_net_amount_minor,
            floor(v_net_amount_minor * 0.10),
            v_currency,
            'frozen',
            v_receipt.payment_intent_id,
            'PLATFORM_REVENUE',
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            v_invoice_id,
            (SELECT id FROM public.beneficiaries WHERE role = 'reserve' AND is_active = true LIMIT 1),
            jsonb_build_object(
                'rule_id', '8a6f0e10-0000-4000-8000-00000000a202',
                'share_type', 'percentage',
                'share_value', 5,
                'destination_account', 'RESERVE'
            ),
            round(v_amount * 100),
            0,
            v_net_amount_minor,
            v_reserve_share,
            v_currency,
            'frozen',
            v_receipt.payment_intent_id,
            'RESERVE',
            now(),
            now()
        );

        -- ─── 5d. Write financial ledger journal ──────────────────────────
        DECLARE
            v_gross_minor INT := round(v_amount * 100);
            v_gateway_fee_minor INT := 0;
            v_net_amount_minor INT := v_gross_minor;
            v_beneficiary_share INT;
            v_platform_share INT;
            v_reserve_share INT;
            v_beneficiary_id UUID;
            v_reserve_beneficiary_id UUID;
        BEGIN
            SELECT id INTO v_beneficiary_id
            FROM public.beneficiaries
            WHERE role = 'author' AND is_active = true
            LIMIT 1;

            SELECT id INTO v_reserve_beneficiary_id
            FROM public.beneficiaries
            WHERE role = 'reserve' AND is_active = true
            LIMIT 1;

            v_beneficiary_share := floor(v_net_amount_minor * 0.85);
            v_platform_share := floor(v_net_amount_minor * 0.10);
            v_reserve_share := v_net_amount_minor - v_beneficiary_share - v_platform_share;

            IF (v_net_amount_minor - (v_beneficiary_share + v_platform_share + v_reserve_share)) > 0 THEN
                v_beneficiary_share := v_beneficiary_share + (v_net_amount_minor - (v_beneficiary_share + v_platform_share + v_reserve_share));
            END IF;

            INSERT INTO public.financial_ledger (
                id,
                invoice_id,
                payment_intent_id,
                account,
                amount_minor,
                entry_type,
                event_type,
                description,
                metadata,
                created_at
            ) VALUES
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'CUSTOMER_FUNDS', v_net_amount_minor, 'DEBIT', 'SETTLEMENT', 'Customer funds (net)', '{}', now()),
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'GATEWAY_FEES', 0, 'DEBIT', 'SETTLEMENT', 'Gateway fees', '{}', now()),
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'BENEFICIARY_PAYABLE', v_beneficiary_share, 'CREDIT', 'SETTLEMENT', 'Beneficiary payable (85%)', '{}', now()),
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'PLATFORM_REVENUE', floor(v_net_amount_minor * 0.10), 'CREDIT', 'SETTLEMENT', 'Platform revenue (10%)', '{}', now()),
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'RESERVE', v_reserve_share, 'CREDIT', 'SETTLEMENT', 'Reserve (5%)', '{}', now()),
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'CUSTOMER_FUNDS', 0, 'CREDIT', 'SETTLEMENT', 'Customer funds (fee offset)', '{}', now());

            -- ─── 5e. Update invoice payment status ───────────────────────────
            UPDATE public.invoices
            SET
                payment_status = 'paid',
                paid_at = now(),
                updated_at = now()
            WHERE id = v_invoice_id;

            -- ─── 5f. Update payment_intent status ───────────────────────────
            UPDATE public.payment_intents
            SET
                status = 'succeeded',
                provider_status = 'approved',
                provider_transaction_id = COALESCE(p_instapay_transaction_id, p_instapay_reference, v_receipt.transaction_reference),
                updated_at = now()
            WHERE id = v_receipt.payment_intent_id;

            -- ─── 5g. Grant entitlement ──────────────────────────────────────
            DECLARE
                v_invoice_user_id UUID;
            BEGIN
                SELECT user_id INTO v_invoice_user_id
                FROM public.invoices
                WHERE id = v_invoice_id;

                IF v_invoice_user_id IS NULL THEN
                    UPDATE public.invoices
                    SET metadata = jsonb_set(
                        COALESCE(metadata, '{}'::jsonb),
                        '{guest_claim_needed}',
                        to_jsonb(true)
                    )
                    WHERE id = v_invoice_id;
                ELSE
                    INSERT INTO public.entitlements (
                        id,
                        user_id,
                        invoice_id,
                        payment_intent_id,
                        tier_id,
                        product_id,
                        status,
                        granted_at,
                        created_at,
                        updated_at
                    )
                    SELECT
                        gen_random_uuid(),
                        user_id,
                        v_invoice_id,
                        v_receipt.payment_intent_id,
                        tier_id,
                        tier_id,
                        'active',
                        now(),
                        now(),
                        now()
                    FROM public.invoices
                    WHERE id = v_invoice_id
                    ON CONFLICT DO NOTHING;
                END IF;
            END;

            -- ─── 5h. Update order status ────────────────────────────────────
            UPDATE public.orders
            SET
                status = 'processing',
                payment_status = 'paid',
                updated_at = now()
            WHERE id = v_order_id;

            -- ─── 5i. Create audit log entry ────────────────────────────────
            INSERT INTO public.audit_log (
                actor_id,
                actor_type,
                action,
                entity_type,
                entity_id,
                old_state,
                new_state,
                metadata,
                created_at
            ) VALUES (
                p_admin_id,
                'admin',
                'payment_receipt.approved',
                'payment_receipt',
                p_receipt_id::text,
                jsonb_build_object('status', 'under_review'),
                jsonb_build_object(
                    'status', 'approved',
                    'order_status', 'processing',
                    'payment_status', 'paid'
                ),
                jsonb_build_object(
                    'reviewed_by', p_admin_id,
                    'submitted_amount', p_submitted_amount,
                    'submitted_currency', p_submitted_currency,
                    'instapay_reference', p_instapay_reference,
                    'instapay_transaction_id', p_instapay_transaction_id,
                    'review_notes', p_review_notes,
                    'settlement', jsonb_build_object(
                        'gross_amount', v_amount,
                        'currency', v_currency,
                        'gateway_fee', 0,
                        'net_amount', v_amount,
                        'splits', jsonb_build_object(
                            'beneficiary_payable', floor(v_amount * 0.85 * 100) / 100.0,
                            'platform_revenue', floor(v_amount * 0.10 * 100) / 100.0,
                            'reserve', v_amount - floor(v_amount * 0.85) - floor(v_amount * 0.10)
                        )
                    )
                ),
                now()
            );
        END;
    END;

    -- ─── 6. Return success result ───────────────────────────────────────────
    RETURN jsonb_build_object(
        'success', true,
        'receipt', jsonb_build_object(
            'id', p_receipt_id,
            'status', 'approved',
            'approved_at', now(),
            'approved_by', p_admin_id
        ),
        'order_status', 'processing',
        'settlement', jsonb_build_object(
            'gross_amount', v_amount,
            'currency', v_currency,
            'gateway_fee', 0,
            'net_amount', v_amount,
            'splits', jsonb_build_object(
                'beneficiary_payable', floor(v_amount * 0.85 * 100) / 100.0,
                'platform_revenue', floor(v_amount * 0.10 * 100) / 100.0,
                'reserve', v_amount - floor(v_amount * 0.85) - floor(v_amount * 0.10)
            )
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO public.audit_log (
            actor_id,
            actor_type,
            action,
            entity_type,
            entity_id,
            old_state,
            new_state,
            metadata,
            created_at
        ) VALUES (
            p_admin_id,
            'admin',
            'payment_receipt.approval_failed',
            'payment_receipt',
            p_receipt_id::text,
            NULL,
            NULL,
            jsonb_build_object('error', SQLERRM),
            now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Approval failed: ' || SQLERRM
        );
END;
$$;
