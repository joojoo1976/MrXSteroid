-- Phase 3: trg_fraud_decision_apply_flag Security Hardening (independent change).
--
-- Context:
--   * SECURITY DEFINER trigger function that propagates a fraud_decisions row's
--     decision into payment_intents.fraud_flag.
--   * It only ever fires via the AFTER INSERT trigger. The fraud_decisions table
--     is service_role-only (RLS policy fraud_decisions_service; anon/authenticated
--     revoked), so the natural trigger path is exclusively server-driven.
--   * Before this migration EXECUTE was granted to PUBLIC/anon/authenticated,
--     allowing a direct call through /rest/v1/rpc/trg_fraud_decision_apply_flag.
--   * The body references only schema-qualified objects, so pinning search_path
--     is safe and neutralizes mutable-search-path tricks inside the definer.

revoke all on function public.trg_fraud_decision_apply_flag() from public, anon, authenticated;
grant execute on function public.trg_fraud_decision_apply_flag() to service_role;

alter function public.trg_fraud_decision_apply_flag()
    set search_path = '';