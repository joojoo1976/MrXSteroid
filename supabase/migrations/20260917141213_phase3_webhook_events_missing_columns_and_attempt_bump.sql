-- ==============================================================================
-- MIGRATION: 20260917141213_phase3_webhook_events_missing_columns_and_attempt_bump.sql
-- PURPOSE: Final Gate v5.1 Phase 3 - close the schema gap between the
--          webhook_events DDL and the columns actually written by
--          server/payments/webhook.ts.
--          1. Add processing_status / raw_payload / updated_at
--          2. Replace the invalid rpc('coalesce') duplicate bump with an
--             atomic, service-role-only bump_webhook_attempt() RPC.
-- ==============================================================================

alter table public.webhook_events
    add column if not exists processing_status  text,
    add column if not exists raw_payload        jsonb,
    add column if not exists updated_at         timestamptz not null default timezone('utc', now());

create index if not exists idx_webhook_events_processing_status
    on public.webhook_events (processing_status);

-- Atomic attempt bump for duplicate events (replaces the invalid rpc('coalesce')).
create or replace function public.bump_webhook_attempt(
    p_provider text,
    p_provider_event_id text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_attempt integer;
begin
    update public.webhook_events
       set attempt_count     = attempt_count + 1,
           status            = 'duplicate',
           processing_status = 'duplicate',
           processed_at      = timezone('utc', now()),
           updated_at        = timezone('utc', now())
     where provider         = p_provider
       and provider_event_id = p_provider_event_id
    returning attempt_count into v_attempt;

    if not found then
        return 0;
    end if;
    return v_attempt;
end;
$$;

revoke all on function public.bump_webhook_attempt(text, text) from public, anon, authenticated;
grant execute on function public.bump_webhook_attempt(text, text) to service_role;
