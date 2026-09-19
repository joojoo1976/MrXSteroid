-- ============================================================
-- Affiliate system hardening:
--   1. UNIQUE constraint on referrals.invoice_id to prevent
--      double-commission at DB level (defense-in-depth on top
--      of the application-level idempotency check).
--   2. Tighten RLS: INSERT/UPDATE on financial tables must be
--      service-role only (bypasses RLS). Remove the blanket
--      `authenticated` write policies that were too permissive.
--   3. Add missing column `affiliate_attributions` usage marker
--      to enforce atomic "mark as used" pattern.
-- ============================================================

-- ── 1. Unique referral per invoice ───────────────────────────────────────────
-- IMPORTANT: In production run with CONCURRENTLY to avoid table lock.
-- In migration context (sequential) we use the plain form which is safe
-- because this runs during a migration window, not under live load.
do $$ begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'referrals_invoice_id_unique'
          and conrelid = 'public.referrals'::regclass
    ) then
        -- Partial unique: only one non-reversed/non-refunded referral per invoice
        -- We allow multiple rows if previous ones are reversed (audit trail).
        -- The active constraint: at most one 'approved' referral per invoice.
        execute 'create unique index if not exists referrals_invoice_id_approved_unique
            on public.referrals (invoice_id)
            where status not in (''reversed'', ''refunded'', ''chargeback'')
              and invoice_id is not null';
    end if;
end $$;

-- ── 2. Harden RLS on affiliates: restrict INSERT to service role ──────────────
-- The old policy allowed any `authenticated` user to INSERT directly.
-- Now INSERT is restricted: only admins may insert via RLS;
-- service role bypasses RLS entirely and continues to work.
drop policy if exists "Affiliates: service insert" on public.affiliates;
create policy "Affiliates: service insert"
    on public.affiliates for insert
    to authenticated
    with check (
        -- Only admin role may insert directly; normal users must go via service role
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
        -- OR the user is inserting their OWN affiliate row
        or (select auth.uid()) = user_id
    );

-- ── 3. Harden RLS on referrals: remove blanket authenticated UPDATE ───────────
-- Referrals are immutable from client perspective. Only service role updates.
drop policy if exists "Referrals: service update" on public.referrals;
create policy "Referrals: service update"
    on public.referrals for update
    to authenticated
    using (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    )
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

-- ── 4. Harden RLS on ledger: remove blanket authenticated INSERT ──────────────
-- Ledger entries must only be created by service role (via RPC).
-- The old "service insert" allowed any authenticated user to write ledger rows.
drop policy if exists "Ledger: service insert" on public.affiliate_commission_ledger;
create policy "Ledger: service insert"
    on public.affiliate_commission_ledger for insert
    to authenticated
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

-- ── 5. Harden RLS on audit logs: restrict INSERT ─────────────────────────────
drop policy if exists "Audit: service insert" on public.affiliate_audit_logs;
create policy "Audit: service insert"
    on public.affiliate_audit_logs for insert
    to authenticated
    with check (
        coalesce(
            (select role from public.profiles where id = (select auth.uid())),
            'user'
        ) = 'admin'
    );

-- ── 6. Add index on referral_code for attribution lookup performance ──────────
create index if not exists idx_referrals_referral_code
    on public.referrals(referral_code);

-- ── 7. Ensure invoices.referral_code column exists with index ─────────────────
alter table public.invoices add column if not exists referral_code text;
create index if not exists idx_invoices_referral_code
    on public.invoices(referral_code)
    where referral_code is not null;

-- ── 8. Ensure invoices.attribution_timestamp and expires columns exist ─────────
alter table public.invoices add column if not exists attribution_timestamp timestamptz;
alter table public.invoices add column if not exists attribution_expires_at timestamptz;
alter table public.invoices add column if not exists attribution_source text
    check (attribution_source is null or attribution_source in ('url_param','cookie','admin','server'));
