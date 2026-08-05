-- handle_new_user / rls_auto_enable are setup-only SECURITY DEFINER triggers.
-- The default grant in Supabase is to PUBLIC, so revoking only from
-- anon/authenticated (see 20260805_rls_perf_and_security_fixes) was insufficient.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.rls_auto_enable() from public;
