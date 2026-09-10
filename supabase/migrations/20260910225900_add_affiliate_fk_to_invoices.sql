-- ============================================================
-- Add affiliate_id FK to invoices (now that affiliates exists)
-- ============================================================
alter table public.invoices add column if not exists affiliate_id uuid;

do $$ begin
    if not exists (
        select 1 from pg_constraint where conname = 'invoices_affiliate_id_fkey'
    ) then
        alter table public.invoices
            add constraint invoices_affiliate_id_fkey
            foreign key (affiliate_id) references public.affiliates(id) on delete set null;
    end if;
end $$;

create index if not exists idx_invoices_affiliate_id on public.invoices(affiliate_id);