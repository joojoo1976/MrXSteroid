-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Create contact_messages table (Contact Form / Transmission Protocol)
-- Date: 2026-08-03
-- Purpose: Store inbound contact form submissions and dispatch them by email.
-- ═══════════════════════════════════════════════════════════════════════════

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_name TEXT NOT NULL,                -- Sender name
    email         TEXT NOT NULL,                -- Sender email
    mission_type  TEXT NOT NULL,                -- Topic / partnership type
    subject       TEXT NOT NULL,                -- Message subject
    message       TEXT NOT NULL,                -- Message body
    order_id      TEXT,                         -- Optional: order inquiry reference
    user_agent    TEXT,                         -- Optional: client user agent
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated) can INSERT new messages only.
-- No public read/update/delete: submissions are dispatched via email and
-- are readable exclusively by the service role (backend /api/contact).
CREATE POLICY "Public can insert contact messages"
    ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- ── Indexes ────────────────────────────────────────────────────────────────
-- Fast lookup by submission time (admin / ops review)
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
    ON public.contact_messages (created_at DESC);

-- Fast lookup by email for dedupe / support triage
CREATE INDEX IF NOT EXISTS idx_contact_messages_email
    ON public.contact_messages (email);
