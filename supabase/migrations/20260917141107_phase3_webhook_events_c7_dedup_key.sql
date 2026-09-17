-- ==============================================================================
-- MIGRATION: 20260917141107_phase3_webhook_events_c7_dedup_key.sql
-- PURPOSE: Final Gate v5.1 Phase 3 - K-2 Conformity Mandate C7.
--          Kashier de-dupes delivery on {transactionId}::{webhookUrl}::{status}.
--          webhook_events MUST index/store the composite
--          (provider, transaction_id, status) alongside the existing unique
--          index, so replays resolve by the Kashier de-dupe key.
--          Replayed order notifications arrive as event:"idempotency" with
--          ORDER_PAID_BEFORE and MUST be treated as duplicates - acknowledge
--          (200/409), NO financial mutation.
-- ==============================================================================

-- Column already written by server/payments/webhook.ts (saved as
-- verification.externalReferenceId) but was missing from the schema.
alter table public.webhook_events
    add column if not exists transaction_id text;

-- Composite de-dupe key alongside the existing
-- (provider, provider_event_id) unique index. Pre-existing rows have
-- NULL transaction_id, which unique indexes treat as distinct, so this
-- index may be created safely without a backfill conflict.
create unique index if not exists webhook_events_provider_txn_status_unique
    on public.webhook_events (provider, transaction_id, status);

create index if not exists idx_webhook_events_transaction_id
    on public.webhook_events (transaction_id);
