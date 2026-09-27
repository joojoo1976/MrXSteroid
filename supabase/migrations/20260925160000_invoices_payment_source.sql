-- =============================================================================
-- invoices.payment_source
-- =============================================================================
--
-- WHY
--   `server/payments/fulfillmentService.ts` writes `payment_source` on every
--   Kashier settlement (payment page vs. hosted gateway session) so an operator
--   can tell which Kashier entry point produced a paid invoice. The sibling
--   provenance columns it writes in the same statement — `kashier_order_id`,
--   `kashier_transaction_id`, `kashier_session_id`, `kashier_session_url` —
--   all exist. `payment_source` alone was never migrated, so the UPDATE failed
--   with `column "payment_source" of relation "invoices" does not exist` and the
--   error was discarded, leaving the invoice stuck at `pending` while the
--   entitlement was still granted.
--
-- COLUMN
--   payment_source text NULL
--     `text` (not an enum) to match every other provenance column on this table
--     (`kashier_order_id`, `kashier_transaction_id`, `kashier_session_id`,
--     `attribution_source`, `payment_status` are all plain `text`/`varchar`).
--     This table has no Postgres enum types; the enumerated-looking fields use
--     CHECK constraints instead, which is the convention followed here.
--
-- CONSTRAINTS
--   invoices_payment_source_check
--     CHECK (payment_source IS NULL OR payment_source IN
--            ('kashier_payment_page', 'kashier_gateway'))
--     The two values are the complete set emitted by the codebase
--     (`fulfillmentService.ts` — `isFromPaymentPage ? 'kashier_payment_page'
--     : 'kashier_gateway'`, written only when the gateway is Kashier). No value
--     is invented here. Mirrors the existing `invoices_payment_status_check`
--     convention so a typo fails loudly at the DB instead of persisting.
--     A new gateway entry point MUST widen this allow-list in the same
--     migration that starts writing it — otherwise the write fails closed,
--     which is the intended behaviour.
--
-- INDEXES
--   None. Reporting filters are already served by the existing
--   `invoices_payment_status_check`-adjacent access patterns, and the table
--   holds a low row count (65). Adding an index for a two-value nullable
--   provenance tag on a small table is not justified.
--
-- RLS IMPLICATIONS
--   None. `invoices` already has RLS enabled; this migration adds a column
--   only and touches no policy, grant, or role. The new column inherits the
--   exact same exposure as `status` / `payment_status` / `paid_at`.
--
-- BACKWARD COMPATIBILITY
--   Fully additive and nullable. All 65 existing rows read back as NULL, which
--   is falsy at the `isFromPaymentPage` call site, so no historical row changes
--   meaning. `SELECT *` consumers are unaffected in meaning; any code doing
--   positional reads must be checked (none found: all access is by name).
--   Rollout order is therefore safe in both directions: the column can be
--   applied before or after the code that writes it, and the code now treats a
--   write failure as `financial_failure` (fail-closed) either way.
--
-- ROLLBACK
--   ALTER TABLE public.invoices DROP CONSTRAINT invoices_payment_source_check;
--   ALTER TABLE public.invoices DROP COLUMN payment_source;
--   Rolling back is safe: the writer degrades to the fail-closed
--   `invoice_write_failed` path rather than silently succeeding. Note the
--   CHECK must be dropped first (it depends on the column).
--
-- NOT IN SCOPE
--   §6.3 accounting, Gateway Fee F, settlement basis, split engine, 85/10/5,
--   payout gates and C-2 are untouched. No data is rewritten.
-- =============================================================================

ALTER TABLE public.invoices
    ADD COLUMN IF NOT EXISTS payment_source text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'invoices_payment_source_check'
          AND conrelid = 'public.invoices'::regclass
    ) THEN
        ALTER TABLE public.invoices
            ADD CONSTRAINT invoices_payment_source_check
            CHECK (
                payment_source IS NULL
                OR payment_source IN ('kashier_payment_page', 'kashier_gateway')
            );
    END IF;
END
$$;

COMMENT ON COLUMN public.invoices.payment_source IS
    'Kashier entry point that produced this capture: kashier_payment_page (hosted Payment Page / PP link) or kashier_gateway (hosted gateway session). NULL for non-Kashier gateways and for rows predating this column.';
