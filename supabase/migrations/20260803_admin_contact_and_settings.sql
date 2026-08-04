-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Admin read/update/delete on contact_messages + admin_settings
-- Date: 2026-08-03
-- Purpose: Mission Control admin inbox + store configuration store.
-- ═══════════════════════════════════════════════════════════════════════════

-- Admins can read all contact messages (for the Mission Control messages inbox)
create policy "Admins can read contact messages"
    on public.contact_messages
    for select
    to authenticated
    using (coalesce(
        (select role from public.profiles where id = auth.uid()),
        'user'
    ) = 'admin');

-- Admins can update contact messages (mark handled / delete)
create policy "Admins can update contact messages"
    on public.contact_messages
    for update
    to authenticated
    using (coalesce(
        (select role from public.profiles where id = auth.uid()),
        'user'
    ) = 'admin')
    with check (coalesce(
        (select role from public.profiles where id = auth.uid()),
        'user'
    ) = 'admin');

create policy "Admins can delete contact messages"
    on public.contact_messages
    for delete
    to authenticated
    using (coalesce(
        (select role from public.profiles where id = auth.uid()),
        'user'
    ) = 'admin');

-- Admin settings table (key/value store for the store configuration)
create table if not exists public.admin_settings (
    id          uuid default gen_random_uuid() primary key,
    key         text not null unique,
    value       text not null default '',
    section     text not null default 'general',
    updated_at  timestamptz default now()
);

alter table public.admin_settings enable row level security;

create policy "Admins can manage settings"
    on public.admin_settings
    for all
    to authenticated
    using (coalesce(
        (select role from public.profiles where id = auth.uid()),
        'user'
    ) = 'admin')
    with check (coalesce(
        (select role from public.profiles where id = auth.uid()),
        'user'
    ) = 'admin');
