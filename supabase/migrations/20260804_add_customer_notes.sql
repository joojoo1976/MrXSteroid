-- ============================================================
-- CRM: customer_notes (admin notes per customer)
-- ============================================================
create table if not exists public.customer_notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    note text not null,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists customer_notes_user_idx on public.customer_notes (user_id, created_at desc);

-- Keep updated_at fresh on edit
create or replace function public.touch_customer_note()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists customer_notes_set_updated_at on public.customer_notes;
create trigger customer_notes_set_updated_at
    before update on public.customer_notes
    for each row execute function public.touch_customer_note();

-- ── RLS ─────────────────────────────────────────────────────
alter table public.customer_notes enable row level security;

drop policy if exists "Admins can read customer notes" on public.customer_notes;
create policy "Admins can read customer notes" on public.customer_notes
    for select to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can insert customer notes" on public.customer_notes;
create policy "Admins can insert customer notes" on public.customer_notes
    for insert to authenticated
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can update customer notes" on public.customer_notes;
create policy "Admins can update customer notes" on public.customer_notes
    for update to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
    with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

drop policy if exists "Admins can delete customer notes" on public.customer_notes;
create policy "Admins can delete customer notes" on public.customer_notes
    for delete to authenticated
    using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');