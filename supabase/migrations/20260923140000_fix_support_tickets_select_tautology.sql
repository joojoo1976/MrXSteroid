-- Fix support_tickets "Allow admin select" tautology.
-- Previous USING (auth.uid() = auth.uid()) is always true, letting ANY authenticated
-- user read every support ticket (name/email/message). Restrict to admins via the
-- project-wide public.is_admin() helper, matching the pattern used in payment_receipts.
drop policy if exists "Allow admin select" on public.support_tickets;

create policy "Allow admin select"
  on public.support_tickets
  for select to authenticated
  using (public.is_admin());