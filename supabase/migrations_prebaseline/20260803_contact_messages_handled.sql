-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Add handled flag to contact_messages
-- Date: 2026-08-03
-- Purpose: Mission Control messages inbox triage (handled / unhandled).
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.contact_messages
    add column if not exists handled boolean not null default false;

create index if not exists idx_contact_messages_handled
    on public.contact_messages (handled);
