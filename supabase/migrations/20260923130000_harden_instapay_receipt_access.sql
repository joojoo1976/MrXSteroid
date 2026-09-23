-- ═══════════════════════════════════════════════════════════════════════════
-- InstaPay Security Hardening — Phase 1
-- 1. Restrict payment_receipts INSERT to service_role (blocks anon/authenticated)
-- 2. Restrict storage.objects read for bucket 'payment-receipts' to admins
-- 3. Codify the bucket so the repository schema matches production (no drift)
-- Idempotent: safe to re-run. No change to reads for owners, no data changes.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. payment_receipts: INSERT allowed ONLY for service_role
-- (previously granted to PUBLIC with WITH CHECK (true) => anon/authenticated
--  could inject arbitrary receipt rows directly via the REST API)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Service role inserts payment receipts" ON public.payment_receipts;
CREATE POLICY "Service role inserts payment receipts"
    ON public.payment_receipts
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Re-assert existing read policies (identical definitions) so this migration
-- documents the complete desired security state of payment_receipts.
DROP POLICY IF EXISTS "Admins view all payment receipts" ON public.payment_receipts;
CREATE POLICY "Admins view all payment receipts"
    ON public.payment_receipts
    FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update payment receipts" ON public.payment_receipts;
CREATE POLICY "Admins update payment receipts"
    ON public.payment_receipts
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users view own payment receipts" ON public.payment_receipts;
CREATE POLICY "Users view own payment receipts"
    ON public.payment_receipts
    FOR SELECT
    USING (
        customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_receipts.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. storage.objects: bucket 'payment-receipts' readable ONLY by admins
-- (previously granted to PUBLIC with USING bucket_id only => any anon could
--  list and download receipt images directly via the Storage REST API)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin read payment receipts" ON storage.objects;
CREATE POLICY "Admin read payment receipts"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'payment-receipts' AND public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Codify bucket 'payment-receipts' (private, 10MB limit) idempotently so the
-- repository reflects the production schema and drift is prevented.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('payment-receipts', 'payment-receipts', false, 10485760)
ON CONFLICT (id) DO NOTHING;