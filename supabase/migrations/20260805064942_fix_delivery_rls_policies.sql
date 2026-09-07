-- ═══════════════════════════════════════════════════════════════════════════
--  FIX RLS: delivery / representative / admin operational tables
--  Problem: delegates, delivery_assignments, realtime_locations had ONLY
--  service_role policies (no-ops — service_role bypasses RLS) and orders
--  lacked an authenticated UPDATE policy. As a result the client-side admin
--  dashboard, MissionControl and representative flows were entirely blocked
--  by RLS. Added least-privilege authenticated policies and aligned
--  is_representative() with the 'delegate' role value assigned by the admin UI.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Align is_representative() with role values used by the app ('delegate')
CREATE OR REPLACE FUNCTION public.is_representative()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
    return (
        coalesce(auth.jwt() ->> 'role', '') = 'service_role'
        or exists (
            select 1 from public.profiles
            where id = (select auth.uid()) and role in ('representative', 'delegate')
        )
    );
end;
$function$;

-- 2. Drop misleading service_role policies (no-ops — service_role bypasses RLS)
DROP POLICY IF EXISTS "Admin manage delegates" ON public.delegates;
DROP POLICY IF EXISTS "Admin manage assignments" ON public.delivery_assignments;
DROP POLICY IF EXISTS "Admin manage locations" ON public.realtime_locations;
DROP POLICY IF EXISTS "Admin manage all" ON public.orders;
DROP POLICY IF EXISTS "Service role manages payments" ON public.payments;

-- 3. delegates
CREATE POLICY "View delegates" ON public.delegates
  FOR SELECT TO authenticated
  USING (is_admin() OR is_representative());

CREATE POLICY "Update own delegate status" ON public.delegates
  FOR UPDATE TO authenticated
  USING (is_admin() OR (is_representative() AND id = (select auth.uid())))
  WITH CHECK (is_admin() OR (is_representative() AND id = (select auth.uid())));

CREATE POLICY "Admins can insert delegates" ON public.delegates
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete delegates" ON public.delegates
  FOR DELETE TO authenticated
  USING (is_admin());

-- 4. delivery_assignments
CREATE POLICY "View own assignments" ON public.delivery_assignments
  FOR SELECT TO authenticated
  USING (is_admin() OR (is_representative() AND delegate_id = (select auth.uid())));

CREATE POLICY "Update own assignments" ON public.delivery_assignments
  FOR UPDATE TO authenticated
  USING (is_admin() OR (is_representative() AND delegate_id = (select auth.uid())))
  WITH CHECK (is_admin() OR (is_representative() AND delegate_id = (select auth.uid())));

CREATE POLICY "Admins can insert assignments" ON public.delivery_assignments
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete assignments" ON public.delivery_assignments
  FOR DELETE TO authenticated
  USING (is_admin());

-- 5. realtime_locations
CREATE POLICY "View locations" ON public.realtime_locations
  FOR SELECT TO authenticated
  USING (is_admin() OR is_representative());

CREATE POLICY "Report own location" ON public.realtime_locations
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR (is_representative() AND delegate_id = (select auth.uid())));

CREATE POLICY "Admins can update locations" ON public.realtime_locations
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete locations" ON public.realtime_locations
  FOR DELETE TO authenticated
  USING (is_admin());

-- 6. orders: authenticated admin UPDATE (status management in MissionControl)
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
