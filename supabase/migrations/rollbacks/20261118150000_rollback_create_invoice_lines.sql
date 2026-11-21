-- Rollback — Phase 1 invoice_lines table.
-- Safe because nothing outside the backfill script reads this table yet.
drop policy if exists "Users can view own invoice lines" on public.invoice_lines;
drop table if exists public.invoice_lines;
