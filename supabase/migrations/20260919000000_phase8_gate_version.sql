-- ============================================================================
-- Phase 8-B — gate_version CAS counter for adversarial late-arrival defense (§C9)
--
-- Reconciliation runner and webhook now resolve the SAME canonical path
-- (fulfillmentService.applyProviderVerdict). This migration adds the per-intent
-- monotonic counter that a verdict must match (optimistic concurrency / CAS):
--   · each successful verdict bumps payment_intents.gate_version += 1, and
--   · a late/adversarial verdict whose expected gate no longer equals the
--     intent's CURRENT gate is QUARANTINED instead of overwriting newer state
--     (never downgrade a paid invoice; guard placed in the shared path).
--
-- Purely additive + idempotent. Safe to re-run on prod.
-- ============================================================================

alter table public.payment_intents
    add column if not exists gate_version integer not null default 0;

-- Reconciliation scans the most advanced intent per invoice; a small partial
-- index keeps the per-invoice "latest attempt" probe cheap and lets Casauro's
-- gate tail (webhook webhook → intent CAS) stay on a covering path.
create index if not exists payment_intents_gate_version_idx
    on public.payment_intents (gate_version)
    where status = 'requires_payment_method' or status = 'processing' or status = 'pending';

-- Phase 7 shipped reconciliation_* columns with service_role-only RLS; the new
-- counter must live under the SAME guard so reconciled writes keep their person
-- of record. An explicit grant (idempotent) prevents drift.
revoke all on table public.payment_intents from anon, authenticated;
grant select, update (status, provider_status, provider_transaction_id,
                       gate_version, updated_at, status)
    on public.payment_intents to service_role;
