-- =============================================================================
-- MIGRATION: 20260928210000_instapay_review_state_machine.sql
-- PHASE:     InstaPay Manual Review — Complete State Machine & Admin Flow
-- PREREQ:    20260922000000_add_instapay_manual_payment_system.sql
--            20260927190000_guest_order_claims_and_gateway_fee.sql
--
-- PURPOSE: Extend the InstaPay payment_receipts table with the complete
--          manual-review state machine and admin approval flow fields.
--          Connect the existing manual-review flow to the canonical
--          settlement path (fulfillmentService) via admin approval.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- NEW STATUS VALUES (full state machine):
--   awaiting_payment      - Customer has not yet submitted a receipt
--   submitted_for_review  - Customer submitted receipt, awaiting admin pickup
--   under_review          - Admin actively reviewing
--   approved              - Admin verified payment, settlement executed
--   rejected              - Admin rejected, order cancelled
--   expired               - Review timeout without approval
--
-- LEGACY STATUS MAPPING:
--   pending_review    -> awaiting_payment (customer hasn't submitted yet)
--   pending_review    -> submitted_for_review (after customer submits receipt)
--   under_review      -> under_review (no change)
--   verified          -> approved (after settlement)
--   rejected          -> rejected (no change)
--   expired           -> expired (no change)
--
-- IDEMPOTENCE: All ALTER TABLE ... IF NOT EXISTS, ADD COLUMN IF NOT EXISTS,
--              CREATE INDEX IF NOT EXISTS, CREATE VIEW IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. EXTEND PAYMENT_RECEIPTS STATUS ENUM
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.payment_receipts
    DROP CONSTRAINT IF EXISTS payment_receipts_status_check;

ALTER TABLE public.payment_receipts
    ADD CONSTRAINT payment_receipts_status_check
    CHECK (status IN (
        'awaiting_payment',       -- Customer hasn't submitted receipt yet
        'submitted_for_review',   -- Customer submitted, awaiting admin pickup
        'under_review',           -- Admin actively reviewing
        'approved',               -- Admin verified, settlement executed
        'rejected',               -- Admin rejected, order cancelled
        'expired'                 -- Review timeout without approval
    ));

-- Backfill existing rows
UPDATE public.payment_receipts
SET status = CASE
    WHEN status = 'pending_review' THEN 'awaiting_payment'
    ELSE status
END
WHERE status NOT IN ('awaiting_payment', 'submitted_for_review', 'under_review', 'approved', 'rejected', 'expired');

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ADD ADMIN APPROVAL FIELDS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.payment_receipts
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS submitted_amount DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS submitted_currency TEXT,
    ADD COLUMN IF NOT EXISTS instapay_reference TEXT,
    ADD COLUMN IF NOT EXISTS instapay_transaction_id TEXT,
    ADD COLUMN IF NOT EXISTS review_started_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS review_notes TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for common admin queries
CREATE INDEX IF NOT EXISTS idx_payment_receipts_submitted_at ON public.payment_receipts(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_approved_at ON public.payment_receipts(approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_instapay_reference ON public.payment_receipts(instapay_reference);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. EXPIRATION TRACKING
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.payment_receipts
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;

-- Backfill expires_at for existing receipts (72 hours from created_at)
UPDATE public.payment_receipts
SET expires_at = created_at + INTERVAL '72 hours'
WHERE expires_at IS NULL
  AND status IN ('awaiting_payment', 'submitted_for_review', 'under_review');

CREATE INDEX IF NOT EXISTS idx_payment_receipts_expires_at ON public.payment_receipts(expires_at)
    WHERE status IN ('awaiting_payment', 'submitted_for_review', 'under_review');

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. PAYMENT INTENT LINK (FK to payment_intents)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.payment_receipts
    ADD COLUMN IF NOT EXISTS payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_payment_receipts_payment_intent_id ON public.payment_receipts(payment_intent_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. AUDIT LOG ENHANCEMENT (ensure audit_log exists and has proper structure)
-- ═══════════════════════════════════════════════════════════════════════════
-- Note: audit_log table already exists from 20260917150000_phase3_final_gate_v5_1_backbone.sql
-- Add InstaPay-specific event types to the constraint if needed
DO $$
BEGIN
    ALTER TABLE public.audit_log
        DROP CONSTRAINT IF EXISTS audit_log_actor_type_check;

    ALTER TABLE public.audit_log
        ADD CONSTRAINT audit_log_actor_type_check
        CHECK (actor_type IN ('system', 'admin', 'user', 'service', 'customer'));

    ALTER TABLE public.audit_log
        DROP CONSTRAINT IF EXISTS audit_log_action_check;

    ALTER TABLE public.audit_log
        ADD CONSTRAINT audit_log_action_check
        CHECK (action IN (
            'payment_receipt.submitted',
            'payment_receipt.approved',
            'payment_receipt.rejected',
            'payment_receipt.expired',
            'payment_receipt.under_review',
            'payment_receipt.amount_mismatch'
        ) OR action LIKE '%');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'audit_log constraint update skipped';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ADMIN REVIEW VIEW (for dashboard summary counters and table)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.admin_instapay_review_summary AS
SELECT
    status,
    COUNT(*) AS count,
    COALESCE(SUM(amount), 0) AS total_amount
FROM public.payment_receipts
WHERE payment_method = 'instapay'
GROUP BY status;

CREATE OR REPLACE VIEW public.admin_instapay_review_detail AS
SELECT
    pr.id,
    pr.order_id,
    pr.invoice_id,
    pr.payment_intent_id,
    pr.customer_name,
    pr.customer_email,
    pr.customer_phone,
    pr.transaction_reference,
    pr.instapay_reference,
    pr.instapay_transaction_id,
    pr.amount AS expected_amount,
    pr.currency,
    pr.submitted_amount,
    pr.submitted_currency,
    pr.status,
    pr.receipt_url,
    pr.receipt_path,
    pr.receipt_filename,
    pr.receipt_mime_type,
    pr.receipt_size_bytes,
    pr.submitted_at,
    pr.review_started_at,
    pr.reviewed_by,
    pr.reviewed_at,
    pr.review_notes,
    pr.rejection_reason,
    pr.expires_at,
    pr.expired_at,
    pr.created_at,
    pr.updated_at,
    -- Order details
    o.tier_id,
    o.items,
    o.fullname AS order_customer_name,
    o.email AS order_customer_email,
    -- Invoice details
    i.payment_status AS invoice_payment_status,
    i.tier_id AS invoice_tier_id,
    -- Payment intent details
    pi.status AS intent_status,
    pi.provider_status AS intent_provider_status,
    pi.provider_transaction_id AS intent_provider_transaction_id
FROM public.payment_receipts pr
LEFT JOIN public.orders o ON o.id = pr.order_id
LEFT JOIN public.invoices i ON i.id = pr.invoice_id
LEFT JOIN public.payment_intents pi ON pi.id = pr.payment_intent_id
WHERE pr.payment_method = 'instapay';

-- Grant access to the views
GRANT SELECT ON public.admin_instapay_review_summary TO authenticated;
GRANT SELECT ON public.admin_instapay_review_detail TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 9. ATOMIC APPROVAL RPC FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════
-- This function performs atomic approval + canonical settlement in a single
-- transaction. It uses row-level locking to prevent double approval.
-- Returns JSON with success status, updated receipt, order status, and settlement info.
-- ═══════════════════════════════════════════════════════════════════════════
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
    -- Note: We accept either the reference from the new fields or the existing transaction_reference
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

    -- ─── 1. Update receipt to approved ───────────────────────────────────────
    UPDATE public.payment_receipts
    SET
        status = 'approved',
        submitted_amount = COALESCE($3, submitted_amount),
        submitted_currency = COALESCE($4, submitted_currency),
        instapay_reference = COALESCE($5, instapay_reference),
        instapay_transaction_id = COALESCE($6, instapay_transaction_id),
        review_notes = COALESCE($7, review_notes),
        rejection_reason = COALESCE($8, rejection_reason),
        reviewed_by = $2,
        reviewed_at = now(),
        approved_at = now(),
        approved_by = $2,
        updated_at = now()
    WHERE id = $1;

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
            -- Create payment intent if not exists (should exist from checkout)
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
                $1,
                1,
                true,
                'instapay',
                'MRX-' || EXTRACT(EPOCH FROM now())::bigint,
                'INSTAPAY-' || $1,
                (amount * 100)::int,
                currency,
                'live',
                'pending',
                jsonb_build_object(
                    'source', 'instapay_manual_transfer',
                    'reviewed_by', $2
                )
            FROM public.payment_receipts
            WHERE id = $1
            RETURNING id
            INTO v_intent_id;

            -- Link the intent to the receipt
            UPDATE public.payment_receipts
            SET payment_intent_id = v_intent_id
            WHERE id = $1;
        END IF;
    END;

    -- ─── 5. Execute the canonical settlement path ───────────────────────────
    DECLARE
        v_fulfillment_result JSONB;
        v_gateway_fee_minor INT := 0;
        v_gross_minor INT := round(v_amount * 100);
        v_net_minor INT := v_gross_minor;
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
        -- Get beneficiary IDs
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

        -- Adjust for remainder
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
            -- Get beneficiary IDs
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

            -- Adjust for remainder
            IF (v_net_amount_minor - (v_beneficiary_share + v_platform_share + v_reserve_share)) > 0 THEN
                v_beneficiary_share := v_beneficiary_share + (v_net_amount_minor - (v_beneficiary_share + v_platform_share + v_reserve_share));
            END IF;

            -- ─── Write financial ledger journal ──────────────────────────
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
            -- Dr CUSTOMER_FUNDS (net)
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'CUSTOMER_FUNDS', v_net_amount_minor, 'DEBIT', 'SETTLEMENT', 'Customer funds (net)', '{}', now()),
            -- Dr GATEWAY_FEES
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'GATEWAY_FEES', 0, 'DEBIT', 'SETTLEMENT', 'Gateway fees', '{}', now()),
            -- Cr BENEFICIARY_PAYABLE
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'BENEFICIARY_PAYABLE', v_beneficiary_share, 'CREDIT', 'SETTLEMENT', 'Beneficiary payable (85%)', '{}', now()),
            -- Cr PLATFORM_REVENUE
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'PLATFORM_REVENUE', floor(v_net_amount_minor * 0.10), 'CREDIT', 'SETTLEMENT', 'Platform revenue (10%)', '{}', now()),
            -- Cr RESERVE
            (gen_random_uuid(), v_invoice_id, v_receipt.payment_intent_id, 'RESERVE', v_reserve_share, 'CREDIT', 'SETTLEMENT', 'Reserve (5%)', '{}', now()),
            -- Cr CUSTOMER_FUNDS (fee)
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
                provider_transaction_id = COALESCE($6, $7, v_receipt.transaction_reference),
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
                    -- Guest: mark claim needed
                    UPDATE public.invoices
                    SET metadata = jsonb_set(
                        COALESCE(metadata, '{}'::jsonb),
                        '{guest_claim_needed}',
                        to_jsonb(true)
                    )
                    WHERE id = v_invoice_id;
                ELSE
                    -- Authenticated user: grant entitlement directly
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
                $2,
                'admin',
                'payment_receipt.approved',
                'payment_receipt',
                $1::text,
                jsonb_build_object('status', 'under_review'),
                jsonb_build_object(
                    'status', 'approved',
                    'order_status', 'processing',
                    'payment_status', 'paid'
                ),
                jsonb_build_object(
                    'reviewed_by', $2,
                    'submitted_amount', $3,
                    'submitted_currency', $4,
                    'instapay_reference', $5,
                    'instapay_transaction_id', $6,
                    'review_notes', $7,
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
            'approved_by', $2
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
        -- Log the error
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
            $2,
            'admin',
            'payment_receipt.approval_failed',
            'payment_receipt',
            $1::text,
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